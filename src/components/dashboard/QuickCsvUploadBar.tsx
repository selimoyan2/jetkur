import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Download
} from "lucide-react";
import { generateSampleCsvTemplate } from "../../utils/competitorCsvImport";

export interface QuickCsvUploadBarProps {
  onFileSelected: (file: File) => void;
  onOpenWizard: () => void;
  onLoadSample: () => void;
  userName?: string;
  competitors?: { name: string; domain?: string }[];
  totalKeywordsCount: number;
}

export const QuickCsvUploadBar: React.FC<QuickCsvUploadBarProps> = ({
  onFileSelected,
  onOpenWizard,
  onLoadSample,
  userName = "Siteniz",
  competitors = [],
  totalKeywordsCount
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const comp1 = competitors[0]?.name || "1. Rakip";
  const comp2 = competitors[1]?.name || "2. Rakip";

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
      // Reset input value so same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <div
      id="quick-csv-upload-banner"
      data-testid="quick-csv-upload-banner"
      className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 shadow-lg text-white overflow-hidden transition-all"
    >
      {/* Hidden file input */}
      <input
        type="file"
        id="input-quick-csv-file"
        data-testid="input-quick-csv-file"
        ref={fileInputRef}
        accept=".csv,.tsv,.txt,text/csv,text/plain"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* BANNER HEADER */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-teal-500/20 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner shrink-0">
            <UploadCloud className="w-5 h-5 text-teal-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Hızlı CSV Yükleme & Veri Eşleştirme Sihirbazı</span>
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold border border-teal-400/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>Sürükle & Bırak Aktif</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30 hidden sm:inline-flex">
                Ahrefs • Semrush • GSC
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Harici CSV dosyanızı sürükleyin; sihirbaz {userName}, {comp1} ve {comp2} sıralamalarını otomatik eşleştirir.
            </p>
          </div>
        </div>

        {/* Right actions: Toggle + Wizard Launch Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-open-mapping-wizard-header"
            data-testid="open-mapping-wizard-header-btn"
            onClick={onOpenWizard}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            title="Detaylı Sütun & Metrik Eşleştirme Sihirbazını Aç"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Sihirbazı Aç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="btn-toggle-quick-upload-panel"
            data-testid="toggle-quick-upload-panel-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isExpanded ? "Paneli Daralt" : "Paneli Genişlet"}
            aria-label={isExpanded ? "Paneli Daralt" : "Paneli Genişlet"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EXPANDED CONTENT: DROP ZONE & QUICK ACTIONS */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* INTERACTIVE DRAG & DROP AREA */}
          <div
            id="quick-csv-dropzone"
            data-testid="quick-csv-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-200 relative overflow-hidden group ${
              isDragOver
                ? "border-amber-400 bg-amber-500/15 scale-[1.01] shadow-xl shadow-amber-500/10"
                : "border-teal-500/40 hover:border-teal-400 bg-slate-950/40 hover:bg-slate-900/60"
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="CSV Dosyasını Buraya Sürükleyin veya Tıklayın"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  isDragOver
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                    : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                }`}
              >
                <FileSpreadsheet className="w-7 h-7" />
              </div>

              <div className="space-y-1 max-w-xl">
                <p className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>CSV veya TSV dosyanızı buraya sürükleyip bırakın</span>
                  <span className="text-teal-400 underline font-extrabold">veya dosya seçin</span>
                </p>
                <p className="text-xs text-slate-300">
                  Dosyanızı bıraktığınız anda <strong className="text-teal-300">Veri Eşleştirme Sihirbazı</strong> açılır;
                  Anahtar Kelime, Arama Hacmi, Zorluk ve Rakip Pozisyonları otomatik tespit edilir.
                </p>
              </div>

              {/* Action Callout Button */}
              <div className="shrink-0 mt-2 sm:mt-0">
                <span
                  id="btn-quick-upload-file-select"
                  data-testid="quick-upload-file-select-btn"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 group-hover:bg-teal-600 group-hover:text-slate-950 text-white font-bold text-xs border border-slate-700 group-hover:border-teal-400 transition-all shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Dosya Yükle</span>
                </span>
              </div>
            </div>
          </div>

          {/* QUICK TOOLBAR / ACTIONS BAR */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-quick-upload-sample"
                data-testid="quick-upload-sample-btn"
                onClick={onLoadSample}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Hemen denemek için örnek 5 rakip anahtar kelimesiyle sihirbazı başlat"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Örnek Şablonla Dene (Semrush / Ahrefs)</span>
              </button>

              <button
                type="button"
                id="btn-quick-upload-paste"
                data-testid="quick-upload-paste-btn"
                onClick={onOpenWizard}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Panodan kopyalanan metni yapıştırarak içe aktarın"
              >
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Panodan Metin Yapıştır</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tabloda şu an {totalKeywordsCount} kelime mevcut</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Akıllı Birleştirme Desteklenir</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
