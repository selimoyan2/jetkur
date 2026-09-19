import React, { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Sliders,
  ChevronDown, 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  Filter, 
  Database,
  ArrowRight,
  Eye,
  CalendarClock,
  Activity,
  Flame,
  Box,
  Zap,
  Award,
  FileDown,
  UploadCloud
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";
import { KeywordGoalItem, calculateGoalProgress } from "./GoalTrackingModule";
import { StrategicCompetitorNote } from "./RowStrategicNotepad";
import { serializeRankingTableData } from "./CompetitiveKeywordRankingTable";
import { exportRankingTableToExcel } from "../../utils/competitiveSeoExcelExport";

export type ExportScope = "all" | "filtered" | "selected";

export interface TableSaveAsExportMenuProps {
  allRankings: CompetitorKeywordRanking[];
  filteredRankings: CompetitorKeywordRanking[];
  selectedRankings: CompetitorKeywordRanking[];
  userName: string;
  userDomain?: string;
  competitors: Array<{ name: string; domain?: string; visibilityScore?: number; speedScore?: number }>;
  goals?: Record<string, KeywordGoalItem>;
  strategicNotes?: Record<string, StrategicCompetitorNote>;
  selectedCsvColumns?: string[];
  onOpenPdfModal: (dataToExport: CompetitorKeywordRanking[], scopeLabel: string) => void;
  onOpenAutoReportScheduler?: () => void;
  onOpenImpactAnalysis?: () => void;
  onOpen3DScatterPlot?: () => void;
  onOpenPerformanceRecommendations?: () => void;
  onExportMarketSharePdf?: () => void;
  onOpenAdvancedExportSettings?: () => void;
  onOpenCsvImport?: () => void;
  onNotification?: (msg: string) => void;
}

export const TableSaveAsExportMenu: React.FC<TableSaveAsExportMenuProps> = ({
  allRankings,
  filteredRankings,
  selectedRankings,
  userName,
  userDomain = "jetkur.com.tr",
  competitors,
  goals = {},
  strategicNotes = {},
  selectedCsvColumns,
  onOpenPdfModal,
  onOpenAutoReportScheduler,
  onOpenImpactAnalysis,
  onOpen3DScatterPlot,
  onOpenPerformanceRecommendations,
  onExportMarketSharePdf,
  onOpenAdvancedExportSettings,
  onOpenCsvImport,
  onNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<ExportScope>("filtered");
  const [isCopiedJson, setIsCopiedJson] = useState(false);
  const [isCopiedCsv, setIsCopiedCsv] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // If there are selected items, default or suggest selected scope
  useEffect(() => {
    if (selectedRankings.length > 0 && scope === "all") {
      setScope("selected");
    }
  }, [selectedRankings.length]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Determine current active datasets based on selected scope
  const getActiveData = (): { data: CompetitorKeywordRanking[]; label: string } => {
    if (scope === "selected") {
      if (selectedRankings.length > 0) {
        return { data: selectedRankings, label: `Seçilen ${selectedRankings.length} Satır` };
      }
      // fallback to filtered
      return { data: filteredRankings.length > 0 ? filteredRankings : allRankings, label: "Filtrelenen Veriler" };
    }
    if (scope === "all") {
      return { data: allRankings.length > 0 ? allRankings : filteredRankings, label: "Tüm Tablo Verileri" };
    }
    return { data: filteredRankings.length > 0 ? filteredRankings : allRankings, label: "Filtrelenen Veriler" };
  };

  const notify = (msg: string) => {
    if (onNotification) onNotification(msg);
  };

  // Generate Clean Structured JSON
  const generateStructuredJson = (dataToExport: CompetitorKeywordRanking[], scopeLabel: string) => {
    const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
    const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
    const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

    const items = dataToExport.map((r) => {
      const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
      const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      const targetRank = goals[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
      const prog = calculateGoalProgress(r.userRank, targetRank, bestComp);
      const note = strategicNotes[r.id];

      return {
        id: r.id,
        keyword: r.keyword,
        searchIntent: r.searchIntent,
        monthlyVolume: r.monthlyVolume,
        difficulty: r.difficulty,
        trafficOpportunity: r.trafficOpportunity,
        serpFeatures: r.serpFeatures || [],
        aiRecommendation: r.aiRecommendation || null,
        rankings: {
          user: {
            rank: r.userRank,
            company: userName
          },
          competitor1: {
            rank: r.comp1Rank,
            name: comp1.name,
            domain: comp1.domain
          },
          competitor2: {
            rank: r.comp2Rank,
            name: comp2.name,
            domain: comp2.domain
          },
          competitor3: {
            rank: r.comp3Rank,
            name: comp3.name,
            domain: comp3.domain
          },
          rankGap: r.gap,
          status: r.status
        },
        goals: {
          targetRank,
          attainmentPercent: prog.attainmentPercent,
          deviationPercent: prog.deviationPercent,
          rankDifference: prog.rankDifference,
          status: prog.status,
          statusLabel: prog.statusLabel
        },
        strategicNote: note ? {
          text: note.text,
          category: note.category,
          updatedAt: note.updatedAt
        } : null
      };
    });

    const userRank1Count = dataToExport.filter((r) => r.userRank === 1).length;
    const userTop3Count = dataToExport.filter((r) => r.userRank !== null && r.userRank !== undefined && r.userRank <= 3).length;

    return {
      metadata: {
        title: "SEO Rakip Kıyaslama & Anahtar Kelime Sıralama Veri Paketi",
        exportedAt: new Date().toISOString(),
        companyName: userName,
        domain: userDomain,
        scope: scopeLabel,
        totalKeywords: dataToExport.length,
        version: "2.0.0"
      },
      summary: {
        totalKeywords: dataToExport.length,
        serpLeadersRank1: userRank1Count,
        top3Rankings: userTop3Count
      },
      competitors: competitors.map((c, i) => ({
        position: i + 1,
        name: c.name,
        domain: c.domain || null,
        visibilityScore: c.visibilityScore || null
      })),
      rankings: items
    };
  };

  // 1. Export as JSON File Download
  const handleExportJson = () => {
    const { data, label } = getActiveData();
    if (!data || data.length === 0) {
      notify("Dışa aktarılacak veri bulunamadı.");
      return;
    }

    const jsonData = generateStructuredJson(data, label);
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateSlug = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `seo-rakip-verileri-${scope}-${data.length}satir-${dateSlug}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify(`Başarılı: ${data.length} satır JSON formatında indirildi! (${label})`);
    setIsOpen(false);
  };

  // 2. Export as CSV File Download
  const handleExportCsv = () => {
    const { data, label } = getActiveData();
    if (!data || data.length === 0) {
      notify("Dışa aktarılacak veri bulunamadı.");
      return;
    }

    const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
    const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
    const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

    const csvString = serializeRankingTableData(data, {
      userName,
      comp1Name: comp1.name,
      comp2Name: comp2.name,
      comp3Name: comp3.name,
      competitors,
      selectedColumnIds: selectedCsvColumns,
      goals
    });

    const csvContent = "\uFEFF" + csvString;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateSlug = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `seo-rakip-verileri-${scope}-${data.length}satir-${dateSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify(`Başarılı: ${data.length} satır CSV formatında indirildi! (${label})`);
    setIsOpen(false);
  };

  // 3. Export as Excel (.xlsx) File Download
  const handleExportExcel = () => {
    const { data, label } = getActiveData();
    if (!data || data.length === 0) {
      notify("Dışa aktarılacak veri bulunamadı.");
      return;
    }

    const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
    const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
    const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

    try {
      const dateSlug = new Date().toISOString().slice(0, 10);
      const filename = `seo-rakip-verileri-${scope}-${data.length}satir-${dateSlug}.xlsx`;
      exportRankingTableToExcel(
        data,
        {
          userName,
          comp1Name: comp1.name,
          comp2Name: comp2.name,
          comp3Name: comp3.name,
          competitors: competitors as any,
          selectedColumnIds: selectedCsvColumns,
          goals
        },
        filename
      );
      notify(`Başarılı: ${data.length} satır Excel (.xlsx) formatında indirildi! (${label})`);
      setIsOpen(false);
    } catch (err) {
      console.error("Excel export failed:", err);
      notify("Excel dosyası oluşturulurken bir hata oluştu.");
    }
  };

  // 4. Export as PDF (Opens Modal / Print)
  const handleExportPdf = () => {
    const { data, label } = getActiveData();
    if (!data || data.length === 0) {
      notify("Dışa aktarılacak veri bulunamadı.");
      return;
    }

    onOpenPdfModal(data, label);
    setIsOpen(false);
  };

  // 4. Copy JSON to Clipboard
  const handleCopyJson = () => {
    const { data, label } = getActiveData();
    if (!data || data.length === 0) return;

    const jsonData = generateStructuredJson(data, label);
    const jsonString = JSON.stringify(jsonData, null, 2);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonString).then(() => {
        setIsCopiedJson(true);
        notify(`JSON verisi panoya kopyalandı (${data.length} satır)`);
        setTimeout(() => setIsCopiedJson(false), 2500);
      });
    }
  };

  // 5. Copy CSV to Clipboard
  const handleCopyCsv = () => {
    const { data, label } = getActiveData();
    if (!data || data.length === 0) return;

    const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
    const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
    const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

    const csvString = serializeRankingTableData(data, {
      userName,
      comp1Name: comp1.name,
      comp2Name: comp2.name,
      comp3Name: comp3.name,
      competitors,
      selectedColumnIds: selectedCsvColumns,
      goals
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(csvString).then(() => {
        setIsCopiedCsv(true);
        notify(`CSV tablosu panoya kopyalandı (${data.length} satır)`);
        setTimeout(() => setIsCopiedCsv(false), 2500);
      });
    }
  };

  // 6. Direct Print
  const handlePrint = () => {
    setIsOpen(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const { data: currentActiveData, label: currentScopeLabel } = getActiveData();

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Farklı Kaydet Trigger Button */}
      <button
        type="button"
        id="btn-save-as-menu"
        data-testid="save-as-menu-button"
        data-action="open-save-as-menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border border-emerald-400/40 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-700/25 active:scale-95 group"
        title="Verileri CSV, PDF veya JSON formatında dışa aktarın (Farklı Kaydet)"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
        <span>Farklı Kaydet</span>
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-200 text-[10px] font-black border border-emerald-400/30">
          CSV &bull; PDF &bull; JSON
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-200 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Save As Dropdown Menu */}
      {isOpen && (
        <div
          id="save-as-dropdown-menu"
          data-testid="save-as-dropdown-menu"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900/98 text-slate-100 rounded-3xl border border-slate-700/90 shadow-2xl backdrop-blur-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/30">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-white text-xs">Tablo Verilerini Farklı Kaydet</h4>
                <p className="text-[10px] text-slate-400">
                  Dışa aktarma kapsamını ve dosya formatını seçin
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
              {currentActiveData.length} satır
            </span>
          </div>

          {/* Scope Selector Segment */}
          <div className="mt-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Dışa Aktarma Kapsamı:
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                id="btn-scope-all"
                data-testid="scope-all-button"
                onClick={() => setScope("all")}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  scope === "all"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Tüm Tablo</span>
                <span className="font-mono text-[9px] opacity-80">({allRankings.length})</span>
              </button>

              <button
                type="button"
                id="btn-scope-filtered"
                data-testid="scope-filtered-button"
                onClick={() => setScope("filtered")}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  scope === "filtered"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Filtrelenen</span>
                <span className="font-mono text-[9px] opacity-80">({filteredRankings.length})</span>
              </button>

              <button
                type="button"
                id="btn-scope-selected"
                data-testid="scope-selected-button"
                onClick={() => setScope("selected")}
                disabled={selectedRankings.length === 0}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 disabled:opacity-30 disabled:cursor-not-allowed ${
                  scope === "selected"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={selectedRankings.length === 0 ? "Tablodan satır seçilmedi" : `${selectedRankings.length} satır seçili`}
              >
                <span>Seçilenler</span>
                <span className="font-mono text-[9px] opacity-80">({selectedRankings.length})</span>
              </button>
            </div>
          </div>

          {/* Export Format Action Cards (Excel, CSV, JSON, PDF) */}
          <div className="mt-3.5 space-y-2">
            {/* 1. Excel (.xlsx) Button */}
            <button
              type="button"
              id="btn-export-excel-xlsx"
              data-testid="export-excel-xlsx-button"
              onClick={handleExportExcel}
              className="w-full p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/60 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Excel (.xlsx) Tablosu Olarak İndir</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/40">
                      .xlsx
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Microsoft Excel çalışma kitabı & Yönetici Özeti sayfası
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-y-0.5 transition-all" />
            </button>

            {/* 2. CSV Button */}
            <button
              type="button"
              id="btn-export-csv"
              data-testid="export-csv-button"
              onClick={handleExportCsv}
              className="w-full p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>CSV Tablosu Olarak İndir</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/40">
                      .csv
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Excel ve Google Sheets uyumlu, UTF-8 BOM destekli
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-y-0.5 transition-all" />
            </button>

            {/* 2. JSON Button */}
            <button
              type="button"
              id="btn-export-json"
              data-testid="export-json-button"
              onClick={handleExportJson}
              className="w-full p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>JSON Veri Paketi Olarak İndir</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono text-[9px] border border-amber-500/40">
                      .json
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Tüm metrikler, hedefler, sapmalar ve stratejik notlar
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-y-0.5 transition-all" />
            </button>

            {/* 3. PDF Button */}
            <button
              type="button"
              id="btn-export-pdf"
              data-testid="export-pdf-button"
              onClick={handleExportPdf}
              className="w-full p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/50 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>PDF Raporu Olarak İndir</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-mono text-[9px] border border-rose-500/40">
                      .pdf
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    A4 Yatay profesyonel paydaş raporu & önizleme
                  </p>
                </div>
              </div>
              <Eye className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-all" />
            </button>

            {/* 3.5. Gelişmiş Dışa Aktarma Ayarları (PDF & JSON Sıkıştırma ve Formatlama) */}
            {onOpenAdvancedExportSettings && (
              <button
                type="button"
                id="btn-export-menu-advanced-settings"
                data-testid="export-menu-advanced-settings-button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdvancedExportSettings();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-indigo-950/70 hover:from-emerald-900/80 hover:to-indigo-900/80 border border-emerald-500/50 hover:border-emerald-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm ring-1 ring-emerald-500/25 mt-1 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500 text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Sliders className="w-4 h-4 text-slate-950 font-black" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Gelişmiş Dışa Aktarma Ayarları</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/40">
                        PDF &bull; JSON
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Özel sıkıştırma (Düşük/Orta/Yüksek) &amp; veri formatlama
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}

            {/* 4. Automated Weekly Reporting Option */}
            {onOpenAutoReportScheduler && (
              <button
                type="button"
                id="btn-export-menu-auto-scheduler"
                data-testid="export-menu-auto-scheduler-button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAutoReportScheduler();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 hover:from-indigo-900/80 hover:to-purple-900/60 border border-indigo-500/40 hover:border-indigo-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarClock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Haftalık Otomatik Raporlama</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[9px] border border-indigo-500/40">
                        E-posta
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Haftalık otomatik PDF/CSV özet zamanlayıcısını aç
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}

            {/* 5. Impact Analysis & Heatmap Overlay Option */}
            {onOpenImpactAnalysis && (
              <button
                type="button"
                id="btn-export-menu-impact-analysis"
                data-testid="export-menu-impact-analysis-button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenImpactAnalysis();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/40 hover:from-purple-900/80 hover:to-indigo-900/60 border border-purple-500/40 hover:border-purple-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Etki Analizi (Isı Haritası)</span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono text-[9px] border border-purple-500/40 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-amber-400" />
                        <span>Korelasyon</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Metriklerin hedeflere etkisini gösteren ısı haritası katmanını aç
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}

            {/* 6. 3D Correlation Scatter Plot Option */}
            {onOpen3DScatterPlot && (
              <button
                type="button"
                id="btn-export-menu-3d-scatter"
                data-testid="export-menu-3d-scatter-button"
                onClick={() => {
                  setIsOpen(false);
                  onOpen3DScatterPlot();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-purple-950/40 hover:from-sky-900/80 hover:to-indigo-900/60 border border-sky-500/40 hover:border-sky-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Box className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>3D Korelasyon Dağılım Grafiği</span>
                      <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono text-[9px] border border-sky-500/40 flex items-center gap-0.5">
                        <Box className="w-2.5 h-2.5 text-sky-400" />
                        <span>3D Düzlem</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Rakiplerin pazar konumlandırmasını 3 eksenli interaktif koordinatlarda incele
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}

            {/* 7. Performance Recommendations Drawer Option */}
            {onOpenPerformanceRecommendations && (
              <button
                type="button"
                id="btn-export-menu-recommendations"
                data-testid="export-menu-recommendations-button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPerformanceRecommendations();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-indigo-950/40 hover:from-emerald-900/80 hover:to-teal-900/60 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Performans İyileştirme Önerileri</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/40 flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span>Yan Panel</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Tablodaki metrikleri analiz ederek her rakip için aksiyon planını aç
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}

            {/* 8. Market Share & Competitor Benchmark PDF Report (Tek Tıkla PDF) Option */}
            {onExportMarketSharePdf && (
              <button
                type="button"
                id="btn-export-menu-market-share-pdf"
                data-testid="export-menu-market-share-pdf-button"
                onClick={() => {
                  setIsOpen(false);
                  onExportMarketSharePdf();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-indigo-950/40 to-slate-900/40 hover:from-rose-900/80 hover:to-indigo-900/60 border border-rose-500/40 hover:border-rose-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Award className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Pazar Payı & Rekabet Raporu</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-mono text-[9px] border border-rose-500/40 flex items-center gap-0.5">
                        <FileDown className="w-2.5 h-2.5 text-amber-400" />
                        <span>Tek Tık PDF</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Tüm rakiplerin SOV pazar payı, SERP liderlikleri ve aksiyon planını PDF olarak indir
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}

            {/* 9. Harici CSV İçe Aktar (Import CSV) Option */}
            {onOpenCsvImport && (
              <button
                type="button"
                id="btn-export-menu-import-csv"
                data-testid="export-menu-import-csv-button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCsvImport();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900/60 hover:from-emerald-900/80 hover:to-teal-900/70 border border-emerald-500/50 hover:border-emerald-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm mt-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Harici CSV İçe Aktar</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/40 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>Otomatik Eşleştir</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Harici CSV dosyasından veya panodan yeni rakip verilerini tabloya yükleyin
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}
          </div>

          {/* Quick Clipboard & Print Tools Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
            <button
              type="button"
              id="btn-copy-json-quick"
              data-testid="copy-json-button"
              onClick={handleCopyJson}
              className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title="JSON metnini panoya kopyala"
            >
              {isCopiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">JSON Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>JSON Kopyala</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-copy-csv-quick"
              data-testid="copy-csv-button"
              onClick={handleCopyCsv}
              className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title="CSV metnini panoya kopyala"
            >
              {isCopiedCsv ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">CSV Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV Kopyala</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-print-quick"
              data-testid="print-quick-button"
              onClick={handlePrint}
              className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title="Yazdır (Print)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
