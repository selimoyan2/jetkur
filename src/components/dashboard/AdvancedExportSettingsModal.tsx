import React, { useState, useMemo, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { 
  X, 
  Settings2, 
  FileCode, 
  FileText, 
  Sliders, 
  Download, 
  Copy, 
  Check, 
  HardDrive, 
  Minimize2, 
  Maximize2, 
  Layers, 
  Palette, 
  FileType, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Sparkles, 
  Printer, 
  Info,
  ChevronRight,
  Eye,
  ArrowDownToLine,
  Gauge
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";
import { KeywordGoalItem } from "./GoalTrackingModule";
import { StrategicCompetitorNote } from "./RowStrategicNotepad";
import { 
  AdvancedExportSettings, 
  CompressionLevel, 
  applyCompressionPreset, 
  generateFormattedJson, 
  estimateExportSizes, 
  getDefaultAdvancedExportSettings, 
  saveAdvancedExportSettings,
  ExportContext
} from "../../utils/advancedExportConfig";

export interface AdvancedExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: CompetitorKeywordRanking[];
  allRankings: CompetitorKeywordRanking[];
  selectedRankings: CompetitorKeywordRanking[];
  userName: string;
  userDomain?: string;
  competitors: Array<{ name: string; domain?: string; visibilityScore?: number; speedScore?: number }>;
  goals?: Record<string, KeywordGoalItem>;
  strategicNotes?: Record<string, StrategicCompetitorNote>;
  scopeLabel?: string;
  initialSettings?: AdvancedExportSettings;
  onSaveSettings?: (settings: AdvancedExportSettings) => void;
  onNotification?: (msg: string) => void;
}

export const AdvancedExportSettingsModal: React.FC<AdvancedExportSettingsModalProps> = ({
  isOpen,
  onClose,
  rankings,
  allRankings,
  selectedRankings,
  userName,
  userDomain = "jetkur.com.tr",
  competitors,
  goals = {},
  strategicNotes = {},
  scopeLabel = "Filtrelenen Veriler",
  initialSettings,
  onSaveSettings,
  onNotification
}) => {
  // Scope selection: all | filtered | selected
  const [activeScope, setActiveScope] = useState<"all" | "filtered" | "selected">(() => {
    return selectedRankings.length > 0 ? "selected" : "filtered";
  });

  // Settings state
  const [settings, setSettings] = useState<AdvancedExportSettings>(() => {
    return initialSettings ? JSON.parse(JSON.stringify(initialSettings)) : getDefaultAdvancedExportSettings();
  });

  // Active tab in modal: "compression" | "json" | "pdf" | "preview"
  const [activeTab, setActiveTab] = useState<"compression" | "json" | "pdf" | "preview">("compression");
  const [previewSubTab, setPreviewSubTab] = useState<"json" | "pdf">("json");

  // State indicators
  const [isCopiedJson, setIsCopiedJson] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);

  // Hidden print element ref for html2pdf
  const printElementRef = useRef<HTMLDivElement>(null);

  // Sync settings if initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(JSON.parse(JSON.stringify(initialSettings)));
    }
  }, [initialSettings]);

  if (!isOpen) return null;

  // Compute active dataset based on scope
  const activeData = useMemo(() => {
    if (activeScope === "selected" && selectedRankings.length > 0) return selectedRankings;
    if (activeScope === "all" && allRankings.length > 0) return allRankings;
    return rankings.length > 0 ? rankings : allRankings;
  }, [activeScope, selectedRankings, allRankings, rankings]);

  const activeScopeLabel = useMemo(() => {
    if (activeScope === "selected") return `Seçilen ${selectedRankings.length} Satır`;
    if (activeScope === "all") return `Tüm Tablo (${allRankings.length} Satır)`;
    return `Filtrelenen (${rankings.length} Satır)`;
  }, [activeScope, selectedRankings.length, allRankings.length, rankings.length]);

  const exportContext: ExportContext = {
    userName,
    userDomain,
    competitors,
    goals,
    strategicNotes,
    scopeLabel: activeScopeLabel
  };

  // Live estimated sizes
  const sizes = estimateExportSizes(activeData.length, settings);

  // Live formatted JSON string for preview / download
  const formattedJsonString = useMemo(() => {
    return generateFormattedJson(activeData, settings, exportContext);
  }, [activeData, settings, exportContext]);

  // Handle Preset Changes
  const handleSelectCompressionLevel = (level: CompressionLevel) => {
    const updated = applyCompressionPreset(level, settings);
    setSettings(updated);
  };

  // Save Settings to LocalStorage & Parent
  const handleSavePreferences = () => {
    saveAdvancedExportSettings(settings);
    if (onSaveSettings) onSaveSettings(settings);
    setSaveConfirmation(true);
    if (onNotification) onNotification("Gelişmiş dışa aktarma tercihleri varsayılan olarak kaydedildi.");
    setTimeout(() => setSaveConfirmation(false), 2500);
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    const def = getDefaultAdvancedExportSettings();
    setSettings(def);
    saveAdvancedExportSettings(def);
    if (onNotification) onNotification("Dışa aktarma ayarları fabrika varsayılanlarına sıfırlandı.");
  };

  // Direct Download JSON
  const handleDownloadJson = () => {
    if (!activeData || activeData.length === 0) {
      if (onNotification) onNotification("Dışa aktarılacak veri bulunamadı.");
      return;
    }

    const blob = new Blob([formattedJsonString], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateSlug = new Date().toISOString().slice(0, 10);
    const compLabel = settings.compressionLevel.toUpperCase();
    link.setAttribute("href", url);
    link.setAttribute("download", `seo-rakip-verileri-${activeScope}-${activeData.length}kelime-${compLabel}-${dateSlug}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onNotification) {
      onNotification(`Başarılı: ${activeData.length} satır JSON olarak indirildi! (${sizes.jsonSizeFormatted})`);
    }
    onClose();
  };

  // Direct Copy JSON to Clipboard
  const handleCopyJson = () => {
    if (!formattedJsonString) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formattedJsonString).then(() => {
        setIsCopiedJson(true);
        if (onNotification) onNotification(`Özel formatlanmış JSON panoya kopyalandı (${sizes.jsonSizeFormatted})`);
        setTimeout(() => setIsCopiedJson(false), 2500);
      });
    }
  };

  // Direct Download PDF with Custom Compression & Formatting
  const handleDownloadPdf = async () => {
    if (!printElementRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const element = printElementRef.current;
      const cleanName = (userName || "Firma").replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateSlug = new Date().toISOString().slice(0, 10);
      const compLabel = settings.compressionLevel.toUpperCase();

      const opt = {
        margin: (settings.pdf.density === "compact" ? [6, 6, 6, 6] : [10, 10, 10, 10]) as [number, number, number, number],
        filename: `SEO_Rekabet_Raporu_${cleanName}_${compLabel}_${dateSlug}.pdf`,
        image: { 
          type: "jpeg" as const, 
          quality: settings.pdf.quality 
        },
        enableLinks: true,
        html2canvas: {
          scale: settings.pdf.scale,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: settings.pdf.orientation === "landscape" ? 1200 : 850
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: settings.pdf.orientation 
        }
      };

      await html2pdf().set(opt).from(element).save();

      if (onNotification) {
        onNotification(`Özel sıkıştırmalı PDF (${compLabel} - ${sizes.pdfSizeFormatted}) başarıyla indirildi.`);
      }
      onClose();
    } catch (err) {
      console.error("PDF generation failed:", err);
      if (onNotification) onNotification("PDF oluşturulurken bir hata oluştu, tarayıcı yazdırma diyaloğu açılıyor.");
      setTimeout(() => window.print(), 300);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

  const displayedPdfRows = settings.pdf.maxTableRows === "all" 
    ? activeData 
    : activeData.slice(0, settings.pdf.maxTableRows);

  return (
    <div
      id="modal-advanced-export-settings-overlay"
      data-testid="advanced-export-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/25">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Gelişmiş Dışa Aktarma Ayarları</span>
                  <span className="text-xs text-emerald-400 font-semibold">(PDF & JSON)</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 font-mono text-[10px] font-bold">
                  {activeData.length} Kelime
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PDF ve JSON dosyaları için özel sıkıştırma düzeyi (Düşük/Orta/Yüksek) ve veri formatlama kurallarını yapılandırın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-advanced-export-reset-defaults"
              onClick={handleResetDefaults}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Varsayılan Ayarlara Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="btn-close-advanced-export-modal"
              data-testid="close-advanced-export-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scope and Size Summary Bar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Kapsam:
            </span>
            <div className="inline-flex rounded-xl bg-slate-800/90 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveScope("filtered")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeScope === "filtered"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Filtrelenen ({rankings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveScope("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeScope === "all"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tümü ({allRankings.length})
              </button>
              <button
                type="button"
                disabled={selectedRankings.length === 0}
                onClick={() => setActiveScope("selected")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeScope === "selected"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : selectedRankings.length === 0
                    ? "opacity-40 cursor-not-allowed text-slate-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Seçilen ({selectedRankings.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON Boyut: <strong>{sizes.jsonSizeFormatted}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF Boyut: <strong>{sizes.pdfSizeFormatted}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sıkıştırma: <strong className="uppercase">{settings.compressionLevel}</strong></span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-900/90 gap-2 shrink-0">
          <button
            type="button"
            id="tab-compression-preset"
            data-testid="tab-compression-preset"
            onClick={() => setActiveTab("compression")}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "compression"
                ? "border-emerald-400 text-emerald-300 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>1. Sıkıştırma Düzeyi (Düşük / Orta / Yüksek)</span>
          </button>

          <button
            type="button"
            id="tab-json-formatting"
            data-testid="tab-json-formatting"
            onClick={() => setActiveTab("json")}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "json"
                ? "border-amber-400 text-amber-300 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. JSON Formatlama Seçenekleri</span>
          </button>

          <button
            type="button"
            id="tab-pdf-formatting"
            data-testid="tab-pdf-formatting"
            onClick={() => setActiveTab("pdf")}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "pdf"
                ? "border-rose-400 text-rose-300 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. PDF Formatlama & Düzen</span>
          </button>

          <button
            type="button"
            id="tab-live-preview"
            data-testid="tab-live-preview"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "preview"
                ? "border-indigo-400 text-indigo-300 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>4. Canlı Önizleme</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SIKIŞTIRMA DÜZEYİ (DÜŞÜK / ORTA / YÜKSEK) */}
          {activeTab === "compression" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Özel Sıkıştırma Düzeyi Seçin</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (PDF görüntü kalitesi ve JSON minifikasyon oranını anında optimize eder)
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Seçtiğiniz sıkıştırma düzeyi dosya boyutunu, aktarım hızını ve görsel çözünürlüğü otomatik olarak dengeler.
                </p>
              </div>

              {/* 3 Compression Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Düşük (Low) Sıkıştırma */}
                <div
                  id="card-compression-low"
                  onClick={() => handleSelectCompressionLevel("low")}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    settings.compressionLevel === "low"
                      ? "bg-slate-800/95 border-emerald-400 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-400/20"
                      : "bg-slate-800/40 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                        Düşük Sıkıştırma (Low)
                      </span>
                      {settings.compressionLevel === "low" && (
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h5 className="text-base font-black text-white">Maksimum Kalite & Detay</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Kayıpsız tam görsel netlik ve geniş girintili veri formatı. Yöneticilere ve müşterilere sunum için idealdir.
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>PDF Çözünürlük (DPI):</span>
                        <strong className="text-white font-mono">300 DPI (2.0x)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>PDF Görsel Kalitesi:</span>
                        <strong className="text-emerald-400 font-mono">%98 JPEG</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>JSON Biçimi:</span>
                        <strong className="text-white font-mono">Pretty-4 (Geniş)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Tahmini PDF Boyutu:</span>
                        <strong className="text-amber-400 font-mono">{sizes.pdfSizeFormatted}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Yüksek çözünürlüklü baskı ve resmi paydaş sunumları</span>
                  </div>
                </div>

                {/* 2. Orta (Medium) Sıkıştırma - Varsayılan */}
                <div
                  id="card-compression-medium"
                  onClick={() => handleSelectCompressionLevel("medium")}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    settings.compressionLevel === "medium"
                      ? "bg-slate-800/95 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/20"
                      : "bg-slate-800/40 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                        Orta Sıkıştırma (Önerilen)
                      </span>
                      {settings.compressionLevel === "medium" && (
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h5 className="text-base font-black text-white">Dengeli Boyut & Kalite</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Hem insan gözüyle rahat okunabilir hem de e-posta ve bulut arşivlemeye elverişli standart boyut dengesi.
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>PDF Çözünürlük (DPI):</span>
                        <strong className="text-white font-mono">150 DPI (1.5x)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>PDF Görsel Kalitesi:</span>
                        <strong className="text-amber-300 font-mono">%85 Dengeli</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>JSON Biçimi:</span>
                        <strong className="text-white font-mono">Pretty-2 (Standart)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Tahmini PDF Boyutu:</span>
                        <strong className="text-emerald-400 font-mono">{sizes.pdfSizeFormatted}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Günlük SEO raporlamaları ve Slack / E-posta paylaşımları</span>
                  </div>
                </div>

                {/* 3. Yüksek (High) Sıkıştırma */}
                <div
                  id="card-compression-high"
                  onClick={() => handleSelectCompressionLevel("high")}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    settings.compressionLevel === "high"
                      ? "bg-slate-800/95 border-indigo-400 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-400/20"
                      : "bg-slate-800/40 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
                        Yüksek Sıkıştırma (High)
                      </span>
                      {settings.compressionLevel === "high" && (
                        <div className="w-6 h-6 rounded-full bg-indigo-400 text-slate-950 flex items-center justify-center font-black">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h5 className="text-base font-black text-white">Minimum Dosya Boyutu</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Kompakt minified JSON (boşluksuz, strip-nulls) ve optimize PDF. Düşük bant genişliği veya webhook / API transferleri içindir.
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>PDF Çözünürlük (DPI):</span>
                        <strong className="text-white font-mono">72 DPI (1.0x Web)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>PDF Görsel Kalitesi:</span>
                        <strong className="text-indigo-400 font-mono">%65 Kompakt</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>JSON Biçimi:</span>
                        <strong className="text-emerald-400 font-mono">Minified (Tek Satır)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Tahmini PDF Boyutu:</span>
                        <strong className="text-emerald-400 font-mono">{sizes.pdfSizeFormatted}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-indigo-300 font-semibold flex items-center gap-1.5">
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Bant genişliği tasarrufu, otomatik webhook ve arşivleme</span>
                  </div>
                </div>
              </div>

              {/* Sıkıştırma Parametreleri İnce Ayar Özeti */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Mevcut Aktif Profil:</span>
                    <span className="capitalize px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      {settings.compressionLevel}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Sıkıştırma düzeyini seçtikten sonra, 2. ve 3. sekmelerden JSON ve PDF için ek formatlama parametrelerini inceleyebilirsiniz.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("json")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>JSON Ayarları</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("pdf")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>PDF Ayarları</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JSON FORMATLAMA SEÇENEKLERİ */}
          {activeTab === "json" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>JSON Veri Formatlama & Yapılandırma Seçenekleri</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Üretilen JSON dosyasının girintilerini, boş alan işleme mantığını, sayı ve tarih tiplerini kişiselleştirin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Sütun: Formatlama ve Düzenleme */}
                <div className="space-y-4">
                  {/* Girinti / Indentation */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Girinti & Boşluk Düzeni (Indentation):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "pretty-2", label: "2 Boşluk (Pretty)", desc: "Standart okunabilir" },
                        { id: "pretty-4", label: "4 Boşluk (Geniş)", desc: "Gelişmiş netlik" },
                        { id: "minified", label: "Minified (0)", desc: "Tek satır kompakt" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            json: { ...settings.json, indentation: opt.id as any }
                          })}
                          className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                            settings.json.indentation === opt.id
                              ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-xs"
                              : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[10px] font-normal text-slate-400">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sayı Formatı */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Sayı Değerleri Formatı (Number Formatting):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "raw", label: "Ham Sayı (12500)", desc: "Standart JSON number" },
                        { id: "locale", label: "Yerel ('12.500')", desc: "TR binlik noktalı" },
                        { id: "short", label: "Kısa ('12.5K')", desc: "K/M kısaltmalı string" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            json: { ...settings.json, numberFormatting: opt.id as any }
                          })}
                          className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                            settings.json.numberFormatting === opt.id
                              ? "bg-amber-500/20 border-amber-400 text-amber-300"
                              : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[10px] font-normal text-slate-400">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tarih Formatı */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Tarih & Zaman Formatı:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "iso", label: "ISO-8601", desc: "2026-09-19T..." },
                        { id: "locale_tr", label: "TR Yerel", desc: "19.09.2026 14:12" },
                        { id: "timestamp", label: "Timestamp", desc: "Unix Epoch (ms)" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            json: { ...settings.json, dateFormat: opt.id as any }
                          })}
                          className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                            settings.json.dateFormat === opt.id
                              ? "bg-amber-500/20 border-amber-400 text-amber-300"
                              : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[10px] font-normal text-slate-400">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Null ve Boş Alan Filtreleme */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">Boş / Null Değerleri Çıkar (Omit Nulls):</div>
                      <div className="text-[11px] text-slate-400">
                        Değeri `null` veya boş olan alanları JSON çıktısından tamamen silerek dosya boyutunu küçültür.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="checkbox-omit-nulls"
                      checked={settings.json.omitNullValues}
                      onChange={(e) => setSettings({
                        ...settings,
                        json: { ...settings.json, omitNullValues: e.target.checked }
                      })}
                      className="w-5 h-5 rounded-md accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Anahtar Yazım Formatı (Casing) */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">Anahtar Yazım Stili:</div>
                      <div className="text-[11px] text-slate-400">
                        camelCase (örn: `monthlyVolume`) veya snake_case (örn: `monthly_volume`)
                      </div>
                    </div>
                    <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          json: { ...settings.json, keyCasing: "camelCase" }
                        })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          settings.json.keyCasing === "camelCase"
                            ? "bg-amber-500 text-slate-950"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        camelCase
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          json: { ...settings.json, keyCasing: "snake_case" }
                        })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          settings.json.keyCasing === "snake_case"
                            ? "bg-amber-500 text-slate-950"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        snake_case
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sağ Sütun: Dahil Edilecek JSON Alanları */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                        <span>Dahil Edilecek JSON Alanları (Field Filtering):</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Seçili verileri filtreleyin
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { 
                          key: "rankings", 
                          title: "Sıralamalar ve Pozisyonlar", 
                          desc: "Siteniz ve 3 rakibin sıra numaraları, sıra farkı (Gap)" 
                        },
                        { 
                          key: "metrics", 
                          title: "SEO Metrikleri & Hacim", 
                          desc: "Aylık arama hacmi, zorluk derecesi, trafik potansiyeli" 
                        },
                        { 
                          key: "intentAndSerp", 
                          title: "Arama Niyeti & SERP Özellikleri", 
                          desc: "Ticari/Bilgilendirici niyeti, Snippet ve Site Bağlantıları" 
                        },
                        { 
                          key: "goals", 
                          title: "Hedef Takip & Sapma Analizleri", 
                          desc: "Hedef sıralama, başarım yüzdesi, sapma oranı ve durum" 
                        },
                        { 
                          key: "notes", 
                          title: "Stratejik Notlar & Not Defteri", 
                          desc: "Satır bazında girilen özel operasyonel notlar ve kategoriler" 
                        },
                        { 
                          key: "metadata", 
                          title: "Yönetici Özeti & Metadata", 
                          desc: "Domain, toplam kelime sayısı, liderlik özeti ve dışa aktarma tarihi" 
                        }
                      ].map((field) => {
                        const isChecked = (settings.json.includeFields as any)[field.key];
                        return (
                          <label
                            key={field.key}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-slate-900/90 border-amber-500/40 text-white"
                                : "bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-900/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setSettings({
                                  ...settings,
                                  json: {
                                    ...settings.json,
                                    includeFields: {
                                      ...settings.json.includeFields,
                                      [field.key]: e.target.checked
                                    }
                                  }
                                });
                              }}
                              className="w-4 h-4 rounded mt-0.5 accent-amber-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="font-bold flex items-center justify-between">
                                <span>{field.title}</span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {field.key}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                                {field.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* JSON İndirme & Kopyalama Eylemleri */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      id="btn-modal-download-json"
                      onClick={handleDownloadJson}
                      className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>JSON İndir ({sizes.jsonSizeFormatted})</span>
                    </button>
                    <button
                      type="button"
                      id="btn-modal-copy-json"
                      onClick={handleCopyJson}
                      className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      {isCopiedJson ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-300" />
                          <span>Panoya Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PDF FORMATLAMA & SIKIŞTIRMA SEÇENEKLERİ */}
          {activeTab === "pdf" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>PDF Raporu Formatlama, Düzen & Sıkıştırma Seçenekleri</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  A4 sayfa yönlendirmesini, renk temasını, tablo hücre yoğunluğunu ve dahil edilecek rapor bölümlerini seçin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Sütun: Sayfa ve Çıktı Düzeni */}
                <div className="space-y-4">
                  {/* Sayfa Yönlendirmesi */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      A4 Sayfa Yönlendirmesi (Orientation):
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "landscape", label: "Yatay (Landscape - Önerilen)", desc: "Geniş karşılaştırma tabloları için en uygun görünüm" },
                        { id: "portrait", label: "Dikey (Portrait)", desc: "Standart evrak ve dikey dosyalama düzeni" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            pdf: { ...settings.pdf, orientation: opt.id as any }
                          })}
                          className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                            settings.pdf.orientation === opt.id
                              ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-xs"
                              : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[10px] font-normal text-slate-400 mt-1">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Renk Şeması & Teması */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      PDF Renk Teması:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "dark", label: "Koyu Yönetici", desc: "Premium koyu tema" },
                        { id: "light", label: "Açık Yazıcı Dostu", desc: "Mürekkep tasarruflu" },
                        { id: "grayscale", label: "Gri Tonlama", desc: "Siyah-beyaz eko baskı" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            pdf: { ...settings.pdf, theme: opt.id as any }
                          })}
                          className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                            settings.pdf.theme === opt.id
                              ? "bg-rose-500/20 border-rose-400 text-rose-300"
                              : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[10px] font-normal text-slate-400">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tablo Hücre Yoğunluğu & Sayfa Tasarrufu */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Hücre Yoğunluğu & Satır Sıkılığı:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "comfortable", label: "Rahat (Comfortable)", desc: "Geniş dolgulu hücreler, ferah tipografi" },
                        { id: "compact", label: "Kompakt (Sayfa Tasarruflu)", desc: "Daha fazla satırı tek sayfaya sığdırır" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            pdf: { ...settings.pdf, density: opt.id as any }
                          })}
                          className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                            settings.pdf.density === opt.id
                              ? "bg-rose-500/20 border-rose-400 text-rose-300"
                              : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[10px] font-normal text-slate-400 mt-1">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Satır Limiti */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">Maksimum Satır Sayısı:</div>
                      <div className="text-[11px] text-slate-400">
                        PDF dosya boyutunu kontrol etmek için ilk X satırı sınırlandırabilirsiniz.
                      </div>
                    </div>
                    <select
                      value={settings.pdf.maxTableRows}
                      onChange={(e) => {
                        const val = e.target.value === "all" ? "all" : Number(e.target.value);
                        setSettings({
                          ...settings,
                          pdf: { ...settings.pdf, maxTableRows: val as any }
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-rose-400 cursor-pointer"
                    >
                      <option value="all">Tüm Satırlar ({activeData.length})</option>
                      <option value="25">İlk 25 Kelime</option>
                      <option value="50">İlk 50 Kelime</option>
                      <option value="100">İlk 100 Kelime</option>
                    </select>
                  </div>
                </div>

                {/* Sağ Sütun: Dahil Edilecek PDF Bölümleri */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-rose-400" />
                      <span>PDF Raporuna Dahil Edilecek Bölümler:</span>
                    </label>

                    <div className="space-y-2 text-xs">
                      {[
                        {
                          key: "executiveSummary",
                          title: "Yönetici Özeti & KPI Kartları",
                          desc: "Toplam kelime, liderlikler, ilk 3 başarımları ve tarih başlığı"
                        },
                        {
                          key: "competitorComparison",
                          title: "Rakip Görünürlük & Hız Çizelgesi",
                          desc: "3 yerel rakibin görünürlük puanları ve hız indeksleri"
                        },
                        {
                          key: "keywordTable",
                          title: "Detaylı Anahtar Kelime Tablosu",
                          desc: "Kelime, hacim, zorluk ve 4 firma sıralama matrisi"
                        },
                        {
                          key: "goalsAndDeviations",
                          title: "Hedef Başarım ve Sapma Kolonu",
                          desc: "Hedeflenen sıra ve pozitif/negatif sapma yüzdeleri"
                        },
                        {
                          key: "strategicNotes",
                          title: "Stratejik Notlar & Yapay Zeka Tavsiyeleri",
                          desc: "İçerik fırsatları ve operasyonel aksiyon notları"
                        },
                        {
                          key: "footer",
                          title: "Sayfa Numarası & Güvenlik Altbilgisi",
                          desc: "Resmi rapor tarihi, gizlilik ibaresi ve sayfa numaralandırması"
                        }
                      ].map((sec) => {
                        const isChecked = (settings.pdf.includeSections as any)[sec.key];
                        return (
                          <label
                            key={sec.key}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-slate-900/90 border-rose-500/40 text-white"
                                : "bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-900/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setSettings({
                                  ...settings,
                                  pdf: {
                                    ...settings.pdf,
                                    includeSections: {
                                      ...settings.pdf.includeSections,
                                      [sec.key]: e.target.checked
                                    }
                                  }
                                });
                              }}
                              className="w-4 h-4 rounded mt-0.5 accent-rose-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="font-bold flex items-center justify-between">
                                <span>{sec.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                                {sec.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* PDF İndirme Butonu */}
                  <button
                    type="button"
                    id="btn-modal-download-pdf"
                    disabled={isGeneratingPdf}
                    onClick={handleDownloadPdf}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30 active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isGeneratingPdf 
                        ? "PDF Hazırlanıyor..." 
                        : `Yapılandırılmış PDF'i İndir (${sizes.pdfSizeFormatted})`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CANLI ÖNİZLEME (JSON VE PDF TASLAĞI) */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>Canlı Çıktı Önizlemesi</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Seçtiğiniz sıkıştırma düzeyi ve veri formatlama seçeneklerine göre üretilen anlık veriyi inceleyin.
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewSubTab("json")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewSubTab === "json"
                        ? "bg-amber-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>JSON Kod ({sizes.jsonSizeFormatted})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSubTab("pdf")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewSubTab === "pdf"
                        ? "bg-rose-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Düzen ({sizes.pdfSizeFormatted})</span>
                  </button>
                </div>
              </div>

              {previewSubTab === "json" ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 max-h-96 overflow-auto">
                    <div className="sticky top-0 right-0 flex justify-end mb-2">
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 border border-slate-700 shadow-sm cursor-pointer"
                      >
                        {isCopiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedJson ? "Kopyalandı" : "JSON Kopyala"}</span>
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap break-all leading-relaxed">
                      {formattedJsonString.slice(0, 3500)}
                      {formattedJsonString.length > 3500 && (
                        <div className="text-amber-400 font-bold mt-2">
                          ... [{formattedJsonString.length - 3500} karakter daha - Tamamı dosyada yer alacaktır]
                        </div>
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* PDF Mini Layout Preview Card */}
                  <div className={`p-6 rounded-2xl border text-xs shadow-inner transition-all overflow-hidden ${
                    settings.pdf.theme === "dark"
                      ? "bg-slate-950 text-slate-100 border-slate-800"
                      : settings.pdf.theme === "grayscale"
                      ? "bg-white text-gray-900 border-gray-300 grayscale"
                      : "bg-white text-slate-900 border-slate-200"
                  }`}>
                    {/* Header in Preview */}
                    <div className="flex items-center justify-between pb-3 border-b border-current/20">
                      <div>
                        <div className="text-sm font-black tracking-tight">{userName} • SEO Rakip Analiz Raporu</div>
                        <div className="text-[10px] opacity-70">
                          {userDomain} • {activeScopeLabel} • {new Date().toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full border border-current/30 text-[10px] font-bold">
                        {settings.pdf.orientation === "landscape" ? "A4 Yatay" : "A4 Dikey"} • {settings.compressionLevel.toUpperCase()} Sıkıştırma
                      </div>
                    </div>

                    {/* KPI Cards in Preview */}
                    {settings.pdf.includeSections.executiveSummary && (
                      <div className="grid grid-cols-4 gap-2 my-4">
                        <div className="p-2.5 rounded-xl border border-current/15 bg-current/5">
                          <div className="text-[10px] opacity-70">Kelime Havuzu</div>
                          <div className="text-sm font-black mt-0.5">{activeData.length}</div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-current/15 bg-current/5">
                          <div className="text-[10px] opacity-70">#1 SERP Lideri</div>
                          <div className="text-sm font-black mt-0.5 text-emerald-500">
                            {activeData.filter((r) => r.userRank === 1).length}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-current/15 bg-current/5">
                          <div className="text-[10px] opacity-70">İlk 3'te Sıralama</div>
                          <div className="text-sm font-black mt-0.5 text-amber-500">
                            {activeData.filter((r) => r.userRank && r.userRank <= 3).length}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-current/15 bg-current/5">
                          <div className="text-[10px] opacity-70">Rakip Analiz Sayısı</div>
                          <div className="text-sm font-black mt-0.5">3 Rakip</div>
                        </div>
                      </div>
                    )}

                    {/* Table Preview */}
                    {settings.pdf.includeSections.keywordTable && (
                      <div className="overflow-x-auto border border-current/20 rounded-xl mt-2">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="border-b border-current/20 bg-current/10 font-bold">
                              <th className="p-2">Anahtar Kelime</th>
                              <th className="p-2">Arama Hacmi</th>
                              <th className="p-2">Siteniz ({userName})</th>
                              <th className="p-2">1. Rakip</th>
                              <th className="p-2">2. Rakip</th>
                              <th className="p-2">3. Rakip</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedPdfRows.slice(0, 5).map((row) => (
                              <tr key={row.id} className="border-b border-current/10">
                                <td className="p-2 font-semibold">{row.keyword}</td>
                                <td className="p-2 font-mono">{row.monthlyVolume?.toLocaleString("tr-TR") || "-"}</td>
                                <td className="p-2 font-black text-amber-500">#{row.userRank || "-"}</td>
                                <td className="p-2">#{row.comp1Rank || "-"}</td>
                                <td className="p-2">#{row.comp2Rank || "-"}</td>
                                <td className="p-2">#{row.comp3Rank || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {displayedPdfRows.length > 5 && (
                      <div className="text-center text-[10px] opacity-60 mt-2 font-italic">
                        ... ve {displayedPdfRows.length - 5} satır daha tam PDF raporuna eklenir.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-save-export-preferences"
              onClick={handleSavePreferences}
              className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                saveConfirmation
                  ? "bg-emerald-600 text-white border-emerald-400"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
            >
              {saveConfirmation ? <Check className="w-4 h-4 text-white" /> : <HardDrive className="w-4 h-4 text-slate-400" />}
              <span>{saveConfirmation ? "Varsayılan Olarak Kaydedildi!" : "Bu Ayarları Varsayılan Yap"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              id="btn-quick-export-json-action"
              onClick={handleDownloadJson}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <FileCode className="w-4 h-4 text-slate-950" />
              <span>JSON İndir</span>
              <span className="font-mono text-[10px] opacity-80">({sizes.jsonSizeFormatted})</span>
            </button>

            <button
              type="button"
              id="btn-quick-export-pdf-action"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/30 active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>PDF İndir</span>
              <span className="font-mono text-[10px] opacity-80">({sizes.pdfSizeFormatted})</span>
            </button>
          </div>
        </div>

        {/* HIDDEN HTML2PDF RENDER CONTAINER */}
        <div className="sr-only">
          <div
            ref={printElementRef}
            className={`p-8 w-[1120px] font-sans ${
              settings.pdf.theme === "dark"
                ? "bg-slate-950 text-slate-100"
                : settings.pdf.theme === "grayscale"
                ? "bg-white text-gray-900 grayscale"
                : "bg-white text-slate-900"
            }`}
            style={{ minHeight: "750px" }}
          >
            {/* Header */}
            {settings.pdf.includeSections.executiveSummary && (
              <div className="border-b-2 border-current pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">{userName} • SEO Rakip Kıyaslama Raporu</h1>
                  <p className="text-xs opacity-75 mt-1">
                    Domain: {userDomain} | Kapsam: {activeScopeLabel} | Tarih: {new Date().toLocaleDateString("tr-TR")} | Sıkıştırma: {settings.compressionLevel.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black uppercase px-3 py-1 rounded border border-current inline-block">
                    {settings.pdf.orientation === "landscape" ? "A4 Yatay Rapor" : "A4 Dikey Rapor"}
                  </div>
                  <div className="text-[10px] opacity-70 mt-1">Toplam {activeData.length} Kelime</div>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            {settings.pdf.includeSections.executiveSummary && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-xl border border-current/20 bg-current/5">
                  <div className="text-[10px] opacity-75 uppercase font-bold">Kelime Havuzu</div>
                  <div className="text-lg font-black mt-1">{activeData.length}</div>
                </div>
                <div className="p-3 rounded-xl border border-current/20 bg-current/5">
                  <div className="text-[10px] opacity-75 uppercase font-bold">1. Sıra (Liderlik)</div>
                  <div className="text-lg font-black mt-1 text-emerald-600">
                    {activeData.filter((r) => r.userRank === 1).length}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-current/20 bg-current/5">
                  <div className="text-[10px] opacity-75 uppercase font-bold">İlk 3 Sıra</div>
                  <div className="text-lg font-black mt-1 text-amber-600">
                    {activeData.filter((r) => r.userRank && r.userRank <= 3).length}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-current/20 bg-current/5">
                  <div className="text-[10px] opacity-75 uppercase font-bold">İlk 10 Sıra</div>
                  <div className="text-lg font-black mt-1">
                    {activeData.filter((r) => r.userRank && r.userRank <= 10).length}
                  </div>
                </div>
              </div>
            )}

            {/* Competitors List */}
            {settings.pdf.includeSections.competitorComparison && (
              <div className="p-3 rounded-xl border border-current/20 mb-6 bg-current/5 flex items-center justify-between text-xs">
                <div className="font-bold">Kıyaslanan Rakipler:</div>
                <div className="flex items-center gap-6">
                  <div>1. {comp1.name} ({comp1.domain || "rakip1.com"})</div>
                  <div>2. {comp2.name} ({comp2.domain || "rakip2.com"})</div>
                  <div>3. {comp3.name} ({comp3.domain || "rakip3.com"})</div>
                </div>
              </div>
            )}

            {/* Main Table */}
            {settings.pdf.includeSections.keywordTable && (
              <table className="w-full text-left border-collapse text-xs mb-6">
                <thead>
                  <tr className="border-b-2 border-current bg-current/10 font-black">
                    <th className="p-2">Anahtar Kelime</th>
                    <th className="p-2">Niyet</th>
                    <th className="p-2">Hacim</th>
                    <th className="p-2">KD%</th>
                    <th className="p-2 font-black">{userName} (Siz)</th>
                    <th className="p-2">{comp1.name}</th>
                    <th className="p-2">{comp2.name}</th>
                    <th className="p-2">{comp3.name}</th>
                    {settings.pdf.includeSections.goalsAndDeviations && (
                      <th className="p-2">Hedef / Sapma</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayedPdfRows.map((r, idx) => (
                    <tr 
                      key={r.id} 
                      className={`border-b border-current/15 ${idx % 2 === 0 ? "bg-current/[0.02]" : ""}`}
                    >
                      <td className="p-2 font-bold">{r.keyword}</td>
                      <td className="p-2 text-[10px]">{r.searchIntent || "-"}</td>
                      <td className="p-2 font-mono">{r.monthlyVolume?.toLocaleString("tr-TR") || "-"}</td>
                      <td className="p-2 font-mono">%{r.difficulty || 0}</td>
                      <td className="p-2 font-black text-amber-600">#{r.userRank || "-"}</td>
                      <td className="p-2">#{r.comp1Rank || "-"}</td>
                      <td className="p-2">#{r.comp2Rank || "-"}</td>
                      <td className="p-2">#{r.comp3Rank || "-"}</td>
                      {settings.pdf.includeSections.goalsAndDeviations && (
                        <td className="p-2 font-mono text-[10px]">
                          Hedef: #{goals[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Footer */}
            {settings.pdf.includeSections.footer && (
              <div className="pt-4 border-t border-current/20 flex items-center justify-between text-[10px] opacity-70">
                <div>Jetkur SEO Performans ve Rakip Kıyaslama Platformu • Gizli & Ticari Rapor</div>
                <div>{new Date().toLocaleString("tr-TR")}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
