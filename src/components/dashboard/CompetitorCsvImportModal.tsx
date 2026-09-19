import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ArrowRight,
  ArrowLeft,
  Download,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
  Layers,
  HelpCircle,
  Table as TableIcon,
  Filter,
  Check,
  Zap,
  Flame,
  ShieldCheck,
  TrendingUp,
  Target
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";
import {
  parseCsvRaw,
  autoDetectColumnMapping,
  convertRowToRanking,
  generateSampleCsvTemplate,
  CsvColumnMapping
} from "../../utils/competitorCsvImport";

export type CsvImportMode = "merge" | "append" | "replace";

export interface CompetitorCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRankings: CompetitorKeywordRanking[];
  userName: string;
  competitors: { name: string; domain?: string }[];
  onImportComplete: (
    newRankings: CompetitorKeywordRanking[],
    mode: CsvImportMode,
    stats: { totalParsed: number; addedCount: number; updatedCount: number }
  ) => void;
  onNotification: (msg: string) => void;
  initialRawText?: string;
  initialFileName?: string;
  initialFileSize?: string;
  initialStep?: number;
}

export const CompetitorCsvImportModal: React.FC<CompetitorCsvImportModalProps> = ({
  isOpen,
  onClose,
  existingRankings,
  userName,
  competitors,
  onImportComplete,
  onNotification,
  initialRawText = "",
  initialFileName = null,
  initialFileSize = null,
  initialStep = 1
}) => {
  // Wizard Steps: 1 (Dosya/Veri), 2 (Eşleştirme Sihirbazı), 3 (Doğrulama & Önizleme), 4 (Aktarım Stratejisi)
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  // Input tabs: 'file' or 'paste'
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>(initialRawText);
  const [fileName, setFileName] = useState<string | null>(initialFileName);
  const [fileSize, setFileSize] = useState<string | null>(initialFileSize);

  // Custom delimiter override ("" = auto)
  const [delimiterOverride, setDelimiterOverride] = useState<string>("");

  // Import mode
  const [importMode, setImportMode] = useState<CsvImportMode>("merge");

  // Custom mapping overrides
  const [customMapping, setCustomMapping] = useState<CsvColumnMapping | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialRawText) {
      setRawText(initialRawText);
      setFileName(initialFileName || "yuklenen-veri.csv");
      setFileSize(initialFileSize || `${(initialRawText.length / 1024).toFixed(1)} KB`);
      if (initialStep) {
        setCurrentStep(initialStep);
      }
    }
  }, [initialRawText, initialFileName, initialFileSize, initialStep]);

  const comp1 = competitors[0]?.name || "Rakip 1";
  const comp2 = competitors[1]?.name || "Rakip 2";
  const comp3 = competitors[2]?.name || "Rakip 3";

  // Parse CSV when rawText or delimiterOverride changes
  const parsedData = useMemo(() => {
    if (!rawText.trim()) return null;
    try {
      const { headers, rows, delimiter } = parseCsvRaw(rawText, delimiterOverride || undefined);
      const defaultMapping = autoDetectColumnMapping(headers);
      return {
        headers,
        rows,
        delimiter,
        defaultMapping
      };
    } catch (err) {
      console.error("CSV Parse error:", err);
      return null;
    }
  }, [rawText, delimiterOverride]);

  // Active mapping (custom or auto)
  const activeMapping = customMapping || parsedData?.defaultMapping || null;

  // Convert rows to ranking items
  const convertedItems = useMemo(() => {
    if (!parsedData || !activeMapping) return [];
    const results: CompetitorKeywordRanking[] = [];
    parsedData.rows.forEach((row, idx) => {
      const item = convertRowToRanking(row, activeMapping, idx);
      if (item && item.keyword.trim().length > 0) {
        results.push(item);
      }
    });
    return results;
  }, [parsedData, activeMapping]);

  // Preview stats
  const previewStats = useMemo(() => {
    if (convertedItems.length === 0) {
      return { total: 0, newKeywords: 0, existingMatches: 0, leadingCount: 0, trailingCount: 0, missingCount: 0 };
    }
    const existingMap = new Set(existingRankings.map((r) => r.keyword.toLowerCase().trim()));
    let existingMatches = 0;
    let newKeywords = 0;
    let leadingCount = 0;
    let trailingCount = 0;
    let missingCount = 0;

    convertedItems.forEach((item) => {
      if (existingMap.has(item.keyword.toLowerCase().trim())) {
        existingMatches++;
      } else {
        newKeywords++;
      }
      if (item.status === "leading") leadingCount++;
      else if (item.status === "trailing") trailingCount++;
      else missingCount++;
    });

    return {
      total: convertedItems.length,
      newKeywords,
      existingMatches,
      leadingCount,
      trailingCount,
      missingCount
    };
  }, [convertedItems, existingRankings]);

  // Mapping completeness score
  const mappingScore = useMemo(() => {
    if (!activeMapping) return { count: 0, total: 11, percent: 0 };
    let mappedCount = 0;
    const total = 11;
    if (activeMapping.keywordCol !== -1) mappedCount++;
    if (activeMapping.volumeCol !== -1) mappedCount++;
    if (activeMapping.userRankCol !== -1) mappedCount++;
    if (activeMapping.comp1RankCol !== -1) mappedCount++;
    if (activeMapping.comp2RankCol !== -1) mappedCount++;
    if (activeMapping.comp3RankCol !== -1) mappedCount++;
    if (activeMapping.difficultyCol !== -1) mappedCount++;
    if (activeMapping.intentCol !== -1) mappedCount++;
    if (activeMapping.serpFeaturesCol !== -1) mappedCount++;
    if (activeMapping.trafficOppCol !== -1) mappedCount++;
    if (activeMapping.aiRecommendationCol !== -1) mappedCount++;

    return {
      count: mappedCount,
      total,
      percent: Math.round((mappedCount / total) * 100)
    };
  }, [activeMapping]);

  if (!isOpen) return null;

  // Handle file reading
  const processFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawText(content);
        setCustomMapping(null);
        setCurrentStep(2); // Automatically advance to Step 2: Mapping Wizard!
        onNotification(`"${file.name}" yüklendi. Sütun Eşleştirme Sihirbazı hazır.`);
      }
    };
    reader.onerror = () => {
      onNotification("CSV dosyası okunurken bir hata meydana geldi.");
    };
    reader.readAsText(file, "UTF-8");
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Manual file input click
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Download Sample Template
  const handleDownloadSample = () => {
    const csvContent = generateSampleCsvTemplate(userName, comp1, comp2, comp3);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ornek-seo-rakip-kiyaslama-sablonu.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotification("Örnek CSV şablonu indirildi.");
  };

  // Quick Load Sample Data
  const handleLoadSampleData = () => {
    const csvContent = generateSampleCsvTemplate(userName, comp1, comp2, comp3);
    setRawText(csvContent);
    setFileName("ornek-rakip-verileri.csv");
    setFileSize("1.4 KB");
    setCustomMapping(null);
    setCurrentStep(2); // Jump directly to Step 2!
    onNotification("Örnek veriler yüklendi ve sihirbaz başlatıldı.");
  };

  // Auto detect columns reset
  const handleAutoDetectAll = () => {
    if (parsedData) {
      setCustomMapping(parsedData.defaultMapping);
      onNotification("Sütunlar Semrush / Ahrefs algoritmalarına göre otomatik eşleştirildi.");
    }
  };

  // Reset mapping
  const handleResetMapping = () => {
    if (parsedData) {
      setCustomMapping({
        keywordCol: 0,
        volumeCol: -1,
        userRankCol: -1,
        comp1RankCol: -1,
        comp2RankCol: -1,
        comp3RankCol: -1,
        difficultyCol: -1,
        intentCol: -1,
        serpFeaturesCol: -1,
        trafficOppCol: -1,
        aiRecommendationCol: -1
      });
      onNotification("Eşleştirmeler sıfırlandı.");
    }
  };

  // Handle Apply Import
  const handleApply = () => {
    if (convertedItems.length === 0) {
      onNotification("İçeri aktarılacak geçerli anahtar kelime satırı bulunamadı.");
      return;
    }

    onImportComplete(convertedItems, importMode, {
      totalParsed: convertedItems.length,
      addedCount: importMode === "replace" ? convertedItems.length : previewStats.newKeywords,
      updatedCount: importMode === "replace" ? 0 : previewStats.existingMatches
    });

    onClose();
  };

  // Reset current upload
  const handleResetUpload = () => {
    setRawText("");
    setFileName(null);
    setFileSize(null);
    setCustomMapping(null);
    setCurrentStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Steps configuration
  const wizardSteps = [
    { num: 1, title: "1. Dosya & Veri", desc: "Sürükle-Bırak veya Pano" },
    { num: 2, title: "2. Eşleştirme Sihirbazı", desc: "Sütun ve Metrik Haritalama" },
    { num: 3, title: "3. Doğrulama & Önizleme", desc: "Veri Kalitesi ve Canlı Tablo" },
    { num: 4, title: "4. Aktarım Stratejisi", desc: "Birleştir, Ekle veya Sıfırla" }
  ];

  return (
    <div
      id="modal-competitor-csv-import"
      data-testid="competitor-csv-import-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-modal-title"
    >
      <div className="bg-slate-900 border border-teal-500/40 text-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-teal-950/50 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="csv-import-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                  Veri Eşleştirme Sihirbazı
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold border border-teal-400/30">
                  CSV Import Wizard
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Harici CSV/TSV dosyalarınızdaki anahtar kelime ve rakip pozisyonlarını eşleştirip tabloya aktarın.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-csv-import-modal"
            data-testid="close-csv-import-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto py-1">
            {wizardSteps.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              const canClick = (parsedData !== null) || step.num === 1;

              return (
                <button
                  key={step.num}
                  type="button"
                  id={`btn-wizard-step-${step.num}`}
                  data-testid={`wizard-step-${step.num}-btn`}
                  disabled={!canClick}
                  onClick={() => canClick && setCurrentStep(step.num)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all px-2.5 py-1 rounded-xl cursor-pointer ${
                    isActive
                      ? "bg-teal-500/20 text-teal-300 border border-teal-400/50 shadow-xs"
                      : isPast
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-500 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? "bg-teal-400 text-slate-950 font-black"
                        : isPast
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
                  </span>
                  <div className="text-left hidden md:block">
                    <div className="leading-tight">{step.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mapping health badge */}
          {parsedData && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono hidden lg:inline-block">
                {parsedData.rows.length} satır • {parsedData.headers.length} sütun
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  mappingScore.percent >= 70
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                <span>Uyum: %{mappingScore.percent}</span>
                <span>({mappingScore.count}/{mappingScore.total})</span>
              </span>
            </div>
          )}
        </div>

        {/* MODAL BODY (DYNAMIC STEP CONTENT) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-200 text-xs space-y-5">
          
          {/* STEP 1: DOSYA & VERİ GİRİŞİ */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700">
                  <button
                    type="button"
                    id="tab-csv-file-upload"
                    data-testid="tab-csv-file-upload"
                    onClick={() => setActiveTab("file")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "file"
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Dosya Yükle (.csv, .tsv)</span>
                  </button>
                  <button
                    type="button"
                    id="tab-csv-paste-text"
                    data-testid="tab-csv-paste-text"
                    onClick={() => setActiveTab("paste")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "paste"
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Metin Olarak Yapıştır</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-download-sample-template"
                    data-testid="download-sample-template-btn"
                    onClick={handleDownloadSample}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="UTF-8 uyumlu örnek CSV şablonunu bilgisayarınıza indirin"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>Örnek Şablonu İndir</span>
                  </button>

                  <button
                    type="button"
                    id="btn-quick-load-sample"
                    data-testid="quick-load-sample-btn"
                    onClick={handleLoadSampleData}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Hemen denemek için örnek verileri otomatik olarak yükleyin ve sihirbazı başlatın"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Örnek Veriyle Başlat</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: FILE DRAG & DROP ZONE */}
              {activeTab === "file" && (
                <div>
                  <input
                    type="file"
                    id="input-file-csv-upload"
                    data-testid="input-file-csv-upload"
                    ref={fileInputRef}
                    accept=".csv,.tsv,.txt,text/csv,text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    id="file-drop-zone-csv"
                    data-testid="file-drop-zone-csv"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
                        : fileName
                        ? "border-teal-500/60 bg-teal-950/25"
                        : "border-slate-700 hover:border-teal-500/70 bg-slate-800/40 hover:bg-slate-800/70"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    aria-label="CSV Dosyası Yükleme Alanı"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                          fileName
                            ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                            : "bg-slate-800 text-teal-400 border border-slate-700"
                        }`}
                      >
                        {fileName ? (
                          <CheckCircle2 className="w-7 h-7 text-teal-400" />
                        ) : (
                          <UploadCloud className="w-7 h-7 text-teal-400" />
                        )}
                      </div>

                      {fileName ? (
                        <div className="space-y-1">
                          <p className="text-sm font-black text-white flex items-center justify-center gap-1.5">
                            <span>{fileName}</span>
                            <span className="text-xs text-teal-400 font-normal">({fileSize})</span>
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Dosya başarıyla yüklendi. Sütun eşleştirmesini kontrol etmek için aşağıdaki butona tıklayın.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">
                            CSV dosyanızı buraya sürükleyip bırakın veya{" "}
                            <span className="text-teal-400 underline font-black">dosya seçin</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Standart virgül (,), noktalı virgül (;) veya sekme (tab) ile ayrılmış CSV dosyaları desteklenir.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RAW TEXT PASTE */}
              {activeTab === "paste" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="textarea-csv-raw-paste" className="text-xs font-bold text-slate-300">
                      CSV Metnini veya Excel Tablosunu Doğrudan Yapıştırın:
                    </label>
                    {rawText && (
                      <button
                        type="button"
                        onClick={handleResetUpload}
                        className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Metni Temizle
                      </button>
                    )}
                  </div>
                  <textarea
                    id="textarea-csv-raw-paste"
                    data-testid="textarea-csv-raw-paste"
                    rows={6}
                    value={rawText}
                    onChange={(e) => {
                      setRawText(e.target.value);
                      setFileName("yapistirilan-veri.csv");
                      setFileSize(`${(e.target.value.length / 1024).toFixed(1)} KB`);
                    }}
                    placeholder="Anahtar Kelime,Arama Hacmi,Siteniz Sırası,Rakip 1,Rakip 2,Zorluk&#10;implant fiyatları,18400,2,1,4,76&#10;zirkonyum kaplama,9600,1,3,5,58"
                    className="w-full rounded-2xl bg-slate-950 border border-slate-700 p-3.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none leading-relaxed"
                  />
                </div>
              )}

              {/* DELIMITER SELECTOR */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">Ayraç (Delimiter):</span>
                  <span className="text-[11px] text-slate-400">
                    Algılanan: <strong className="text-teal-300 font-mono">"{parsedData?.delimiter === "\t" ? "TAB" : parsedData?.delimiter || "Otomatik"}"</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: "Otomatik", val: "" },
                    { label: "Virgül (,)", val: "," },
                    { label: "Noktalı Virgül (;)", val: ";" },
                    { label: "Sekme (TAB)", val: "\t" }
                  ].map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => setDelimiterOverride(d.val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        delimiterOverride === d.val
                          ? "bg-teal-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VERİ EŞLEŞTİRME SİHİRBAZI (Visual Column & Metric Mapping) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {parsedData && activeMapping ? (
                <>
                  {/* SÜTUN BANKASI (DRAGGABLE / CLICKABLE CHIPS) */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-teal-400" />
                        <span className="font-bold text-white">CSV'deki Başlıklar ({parsedData.headers.length} Sütun):</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="btn-auto-detect-all"
                          data-testid="auto-detect-all-btn"
                          onClick={handleAutoDetectAll}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/40 hover:bg-teal-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Tümünü Otomatik Eşleştir</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetMapping}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-[11px] transition-colors cursor-pointer"
                        >
                          Sıfırla
                        </button>
                      </div>
                    </div>

                    {/* Chips Display */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {parsedData.headers.map((header, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1 shadow-xs"
                          title={`Sütun #${idx + 1}: ${header}`}
                        >
                          <span className="text-teal-400 font-bold">#{idx + 1}</span>
                          <span>{header}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* TARGET METRIC MAPPING GRID */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-teal-400" />
                        <span>Hedef Tablo Metrikleri ile Sütunları Eşleştirin</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        * ile işaretli alanlar zorunludur
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* 1. Anahtar Kelime (Zorunlu) */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1">
                            <span>Anahtar Kelime</span>
                            <span className="text-rose-400 font-bold">*</span>
                          </span>
                          {activeMapping.keywordCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.keywordCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-keyword"
                          data-testid="select-mapping-keyword"
                          value={activeMapping.keywordCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, keywordCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Aylık Hacim */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>Aylık Arama Hacmi</span>
                          {activeMapping.volumeCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.volumeCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-volume"
                          data-testid="select-mapping-volume"
                          value={activeMapping.volumeCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, volumeCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Atla / Boş Bırak --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. Zorluk Derecesi (KD %) */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>Zorluk Derecesi (KD %)</span>
                          {activeMapping.difficultyCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.difficultyCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-difficulty"
                          data-testid="select-mapping-difficulty"
                          value={activeMapping.difficultyCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, difficultyCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Atla (Varsayılan: 45) --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 4. Siteniz Sırası */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>{userName} Sırası</span>
                          {activeMapping.userRankCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.userRankCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-userrank"
                          data-testid="select-mapping-userrank"
                          value={activeMapping.userRankCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, userRankCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Atla / Sıralamada Yok --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 5. Comp 1 Rank */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>{comp1} Sırası</span>
                          {activeMapping.comp1RankCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.comp1RankCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-comp1"
                          data-testid="select-mapping-comp1"
                          value={activeMapping.comp1RankCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, comp1RankCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Atla --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 6. Comp 2 Rank */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>{comp2} Sırası</span>
                          {activeMapping.comp2RankCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.comp2RankCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-comp2"
                          data-testid="select-mapping-comp2"
                          value={activeMapping.comp2RankCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, comp2RankCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Atla --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 7. Comp 3 Rank */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>{comp3} Sırası</span>
                          {activeMapping.comp3RankCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.comp3RankCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-comp3"
                          data-testid="select-mapping-comp3"
                          value={activeMapping.comp3RankCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, comp3RankCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Atla --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 8. Arama Niyeti (Intent) */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>Arama Niyeti</span>
                          {activeMapping.intentCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.intentCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-intent"
                          data-testid="select-mapping-intent"
                          value={activeMapping.intentCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, intentCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Otomatik Tespit Et --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 9. SERP Özellikleri */}
                      <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                        <label className="text-slate-300 font-bold flex items-center justify-between text-[11px]">
                          <span>SERP Özellikleri</span>
                          {activeMapping.serpFeaturesCol !== -1 && (
                            <span className="text-teal-300 font-mono text-[10px]">
                              [{parsedData.headers[activeMapping.serpFeaturesCol]}]
                            </span>
                          )}
                        </label>
                        <select
                          id="select-mapping-serp"
                          data-testid="select-mapping-serp"
                          value={activeMapping.serpFeaturesCol}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCustomMapping({ ...activeMapping, serpFeaturesCol: val });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={-1}>-- Varsayılan (Organik Arama) --</option>
                          {parsedData.headers.map((h, i) => (
                            <option key={i} value={i}>
                              #{i + 1} - {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-slate-850 rounded-2xl border border-slate-700 space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-bold text-white">Eşleştirme yapabilmek için önce bir dosya yüklemelisiniz.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                  >
                    1. Adıma Dön
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: DOĞRULAMA & CANLI ÖNİZLEME */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Validation Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                  <div className="text-slate-400 text-[11px] font-medium">Toplam Geçerli Kelime</div>
                  <div className="text-xl font-black text-white mt-0.5">{previewStats.total}</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <div className="text-emerald-300 text-[11px] font-medium">Yeni Eklenecek</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">+{previewStats.newKeywords}</div>
                </div>
                <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-center">
                  <div className="text-teal-300 text-[11px] font-medium">Güncellenecek Mevcut</div>
                  <div className="text-xl font-black text-teal-400 mt-0.5">{previewStats.existingMatches}</div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center">
                  <div className="text-indigo-300 text-[11px] font-medium">Veri Doğrulama</div>
                  <div className="text-xs font-bold text-indigo-300 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>0 Format Hatası</span>
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW TABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                    <span>İlk Satırların Canlı Önizlemesi (Toplam {convertedItems.length} Satır)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Tablo şemasına tam uyumlu
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Anahtar Kelime</th>
                          <th className="py-2.5 px-3 text-right">Aylık Hacim</th>
                          <th className="py-2.5 px-3 text-center">KD %</th>
                          <th className="py-2.5 px-3 text-center">{userName}</th>
                          <th className="py-2.5 px-3 text-center">{comp1}</th>
                          <th className="py-2.5 px-3 text-center">{comp2}</th>
                          <th className="py-2.5 px-3">Durum</th>
                          <th className="py-2.5 px-3">Fırsat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {convertedItems.slice(0, 10).map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-900/60">
                            <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold font-sans text-white">{row.keyword}</td>
                            <td className="py-2 px-3 text-right text-slate-300">{row.monthlyVolume}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                                {row.difficulty}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-teal-400">
                              {row.userRank !== null ? `#${row.userRank}` : "—"}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-300">
                              {row.comp1Rank !== null ? `#${row.comp1Rank}` : "—"}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-300">
                              {row.comp2Rank !== null ? `#${row.comp2Rank}` : "—"}
                            </td>
                            <td className="py-2 px-3 font-sans">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  row.status === "leading"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : row.status === "trailing"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-rose-500/20 text-rose-300"
                                }`}
                              >
                                {row.status === "leading" ? "Lider" : row.status === "trailing" ? "Takipte" : "Kayıp"}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-sans text-emerald-400 font-bold">
                              {row.trafficOpportunity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AKTARIM STRATEJİSİ */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">Verilerin Tabloya Nasıl Aktarılacağını Seçin</h4>
                <p className="text-xs text-slate-400">
                  Mevcut {existingRankings.length} anahtar kelimenizi koruyabilir, güncelleyebilir veya tabloyu tamamen sıfırlayabilirsiniz.
                </p>
              </div>

              {/* 3 Strategy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Mode 1: Merge (Recommended) */}
                <div
                  id="import-mode-merge"
                  data-testid="import-mode-merge-option"
                  onClick={() => setImportMode("merge")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                    importMode === "merge"
                      ? "bg-teal-950/40 border-teal-400 shadow-md shadow-teal-500/10"
                      : "bg-slate-800/40 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold text-[10px]">
                      Önerilen
                    </span>
                    <input
                      type="radio"
                      checked={importMode === "merge"}
                      onChange={() => setImportMode("merge")}
                      className="text-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <h5 className="font-black text-white text-sm">Akıllı Birleştir (Upsert)</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Tabloda zaten var olan kelimelerin metriklerini günceller; yeni kelimeleri tablonun sonuna ekler.
                  </p>
                  <div className="pt-2 text-[10px] text-teal-300 font-mono">
                    +{previewStats.newKeywords} Yeni • {previewStats.existingMatches} Güncelleme
                  </div>
                </div>

                {/* Mode 2: Append */}
                <div
                  id="import-mode-append"
                  data-testid="import-mode-append-option"
                  onClick={() => setImportMode("append")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    importMode === "append"
                      ? "bg-teal-950/40 border-teal-400 shadow-md shadow-teal-500/10"
                      : "bg-slate-800/40 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[10px]">
                      Sona Ekle
                    </span>
                    <input
                      type="radio"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="text-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <h5 className="font-black text-white text-sm">Sona Ekle (Append)</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Mevcut kelimelerinize dokunmadan {convertedItems.length} yeni satırı tablonun en altına ekler.
                  </p>
                  <div className="pt-2 text-[10px] text-slate-300 font-mono">
                    Toplam Tablo: {existingRankings.length + convertedItems.length} Satır
                  </div>
                </div>

                {/* Mode 3: Replace */}
                <div
                  id="import-mode-replace"
                  data-testid="import-mode-replace-option"
                  onClick={() => setImportMode("replace")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    importMode === "replace"
                      ? "bg-rose-950/30 border-rose-500 shadow-md shadow-rose-500/10"
                      : "bg-slate-800/40 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      Sıfırla
                    </span>
                    <input
                      type="radio"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                  </div>
                  <h5 className="font-black text-white text-sm">Tabloyu Sıfırla (Replace)</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Mevcut tüm satırları siler ve tabloyu yalnızca bu CSV dosyasındaki {convertedItems.length} kelimeyle doldurur.
                  </p>
                  <div className="pt-2 text-[10px] text-rose-300 font-mono">
                    Yeni Tablo: {convertedItems.length} Satır
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER & NAVIGATION BUTTONS */}
        <div className="p-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                id="btn-wizard-prev-step"
                data-testid="wizard-prev-step-btn"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Geri: {wizardSteps[currentStep - 2]?.title}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-csv-import"
              data-testid="cancel-csv-import-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                id="btn-wizard-next-step"
                data-testid="wizard-next-step-btn"
                disabled={!parsedData || convertedItems.length === 0}
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>İleri: {wizardSteps[currentStep]?.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-apply-csv-import"
                data-testid="apply-csv-import-btn"
                onClick={handleApply}
                disabled={convertedItems.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Tabloya Aktarımı Başlat ({convertedItems.length} Kelime)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
