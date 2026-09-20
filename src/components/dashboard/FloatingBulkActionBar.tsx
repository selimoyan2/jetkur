import React, { useState } from "react";
import {
  Trash2,
  FileDown,
  FileText,
  FileSpreadsheet,
  BarChart3,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  Plus,
  GitCompare,
  Users
} from "lucide-react";

export interface FloatingBulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  selectedKeywords?: string[];
  onBulkDelete: () => void;
  onExportSelectedPdf: () => void;
  onOpenReportBuilder?: () => void;
  onOpenCreateGroup?: () => void;
  onExportSelectedExcel: () => void;
  onCompareSelected?: () => void;
  onToggleDiffView?: () => void;
  isDiffViewActive?: boolean;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  isGeneratingPdf?: boolean;
  onBulkAddToTargets?: () => void;
}

export const FloatingBulkActionBar: React.FC<FloatingBulkActionBarProps> = ({
  selectedCount,
  totalCount,
  selectedKeywords = [],
  onBulkDelete,
  onExportSelectedPdf,
  onOpenReportBuilder,
  onOpenCreateGroup,
  onExportSelectedExcel,
  onCompareSelected,
  onToggleDiffView,
  isDiffViewActive = false,
  onClearSelection,
  onSelectAll,
  isAllSelected = false,
  isGeneratingPdf = false,
  onBulkAddToTargets
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedCount === 0) return null;

  const handleConfirmDelete = () => {
    setShowConfirmDelete(false);
    onBulkDelete();
  };

  return (
    <>
      {/* 1. FLOATING ACTION MENU BAR */}
      <div
        id="seo-competitor-floating-action-menu"
        data-testid="seo-competitor-floating-action-menu"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        role="region"
        aria-label="Seçili Satırlar İçin Toplu İşlem Menüsü"
      >
        <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-indigo-500/60 text-white rounded-2xl shadow-2xl shadow-indigo-950/80 p-3 sm:px-4 sm:py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Left: Selection Counter & Preview */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-md">
              <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span id="floating-selected-count-badge" data-testid="floating-selected-count">
                {selectedCount} Satır Seçildi
              </span>
            </div>

            <span className="text-xs text-indigo-200 font-medium hidden sm:inline">
              / toplam <strong className="text-white font-mono">{totalCount}</strong> satır
            </span>

            {/* Keyword Preview Chips (Desktop only) */}
            {selectedKeywords.length > 0 && (
              <div className="hidden lg:flex items-center gap-1 max-w-[220px] overflow-hidden text-[11px] text-slate-300">
                <span className="truncate font-mono bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700">
                  {selectedKeywords[0]}
                </span>
                {selectedKeywords.length > 1 && (
                  <span className="text-[10px] text-indigo-300 font-bold">
                    +{selectedKeywords.length - 1} diğer
                  </span>
                )}
              </div>
            )}

            {onSelectAll && !isAllSelected && (
              <button
                type="button"
                id="btn-floating-select-all"
                data-testid="floating-select-all-btn"
                onClick={onSelectAll}
                className="text-xs text-indigo-300 hover:text-white underline cursor-pointer font-bold transition-colors ml-1"
                title="Tüm gösterilen satırları seçin"
              >
                Tümünü Seç
              </button>
            )}
          </div>

          {/* Right: Actions (Seçilileri PDF Yap, Toplu Sil, Excel, Karşılaştır, Temizle) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            
            {/* Action 1: SEÇİLİLERİ PDF YAP (Primary Highlighted Action) */}
            <button
              type="button"
              id="btn-floating-export-selected-pdf"
              data-testid="floating-export-selected-pdf-button"
              data-action="export-selected-pdf"
              onClick={onExportSelectedPdf}
              disabled={isGeneratingPdf}
              className={`px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 border border-indigo-400/40 active:scale-95 ${
                isGeneratingPdf ? "opacity-75 cursor-wait" : ""
              }`}
              title="Yalnızca seçilen kelimeler için profesyonel Pazar Payı ve Rekabet Analiz Raporunu PDF olarak indirin"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>PDF Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Seçilileri PDF Yap</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-black border border-indigo-400/40">
                    PDF
                  </span>
                </>
              )}
            </button>

            {/* Action 1.5: Özel Rapor Oluşturucu (Logo & Notlar Modal) */}
            {onOpenReportBuilder && (
              <button
                type="button"
                id="btn-floating-open-report-builder"
                data-testid="floating-open-report-builder-button"
                onClick={onOpenReportBuilder}
                className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Marka logolu ve özel notlu detaylı rapor oluşturucuda seçilenleri açın"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">Özel Notlu</span>
                <span>Rapor</span>
              </button>
            )}

            {/* Action 2: TOPLU SİL (Destructive Action with confirmation) */}
            <button
              type="button"
              id="btn-floating-bulk-delete"
              data-testid="floating-bulk-delete-button"
              data-action="bulk-delete-selected"
              onClick={() => setShowConfirmDelete(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-600/25 border border-rose-400/40 active:scale-95"
              title="Seçili tüm satırları tablodan toplu olarak silin"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Toplu Sil</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-200 text-[10px] font-black">
                {selectedCount}
              </span>
            </button>

            {/* Action 3: Seçilileri Excel İndir */}
            <button
              type="button"
              id="btn-floating-export-selected-excel"
              data-testid="floating-export-selected-excel-button"
              onClick={onExportSelectedExcel}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border border-emerald-500/40"
              title="Seçilen satırları Excel (.xlsx) tablosu olarak indirin"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Excel</span>
              <span className="px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono font-bold">
                .xlsx
              </span>
            </button>

            {/* Action 4: Rakip Grubu Oluştur */}
            {onOpenCreateGroup && (
              <button
                type="button"
                id="btn-floating-create-group"
                data-testid="floating-create-group-button"
                onClick={onOpenCreateGroup}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                title="Seçilen satırlardan yeni bir Rakip Grubu oluşturun ve bağımsız performans ortalamalarını hesaplayın"
              >
                <Users className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span>Grup Oluştur</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                  {selectedCount}
                </span>
              </button>
            )}

            {/* Action 4.2: Ayrı Grafikte Karşılaştır */}
            {onCompareSelected && (
              <button
                type="button"
                id="btn-floating-compare-chart"
                data-testid="floating-compare-chart-button"
                onClick={onCompareSelected}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border border-slate-700"
                title="Seçilen kelimeleri D3 grafiğinde ayrı bir pencerede kıyaslayın"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                <span className="hidden sm:inline">Karşılaştır</span>
              </button>
            )}

            {/* Action 4.5: Farklılıkları Vurgula (Diff View) */}
            {onToggleDiffView && selectedCount >= 2 && (
              <button
                type="button"
                id="btn-floating-diff-view"
                data-testid="floating-diff-view-button"
                onClick={onToggleDiffView}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border ${
                  isDiffViewActive
                    ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 shadow-md shadow-indigo-600/25"
                }`}
                title="Seçili rakip satırlarının metrik farklarını ve varyasyonlarını vurgulayan Diff View modunu açın/kapatın"
              >
                <GitCompare className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isDiffViewActive ? "Diff Açık" : "Farkları Vurgula"}</span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                  isDiffViewActive ? "bg-slate-950 text-amber-300" : "bg-indigo-900 text-indigo-200"
                }`}>
                  {selectedCount}
                </span>
              </button>
            )}

            {/* Action 5: Hedeflere Ekle */}
            {onBulkAddToTargets && (
              <button
                type="button"
                id="btn-floating-add-targets"
                data-testid="floating-add-targets-button"
                onClick={onBulkAddToTargets}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Seçilen kelimeleri hedeflere ekleyin"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hedeflere Ekle</span>
              </button>
            )}

            {/* Action 6: Seçimi Temizle */}
            <button
              type="button"
              id="btn-floating-clear-selection"
              data-testid="floating-clear-selection-button"
              onClick={onClearSelection}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Tüm seçimleri temizle (Esc)"
              aria-label="Tüm seçimleri temizle"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Temizle</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOPLU SİL ONAY MODALI */}
      {showConfirmDelete && (
        <div
          id="modal-confirm-bulk-delete"
          data-testid="modal-confirm-bulk-delete"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 id="confirm-delete-title" className="text-base font-black text-white">
                  Seçili Satırları Silmek İstiyor Musunuz?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Seçtiğiniz <strong className="text-amber-300">{selectedCount} adet</strong> anahtar kelime tablodan gizlenecektir.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">Güvence:</span> İstediğiniz zaman sağ üstteki filtre araçlarından veya bildirim çubuğundaki <strong>"Geri Yükle"</strong> butonuna tıklayarak silinen tüm satırları eski haline getirebilirsiniz.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                id="btn-cancel-bulk-delete"
                data-testid="cancel-bulk-delete-btn"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                id="btn-confirm-bulk-delete"
                data-testid="confirm-bulk-delete-btn"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Evet, {selectedCount} Satırı Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
