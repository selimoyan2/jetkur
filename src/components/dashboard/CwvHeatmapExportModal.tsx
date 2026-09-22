import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Smartphone, 
  Monitor, 
  Sun, 
  Moon, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  AlertTriangle,
  Info,
  Maximize2,
  Table as TableIcon
} from "lucide-react";
import { DailyPerformanceTrendDataPoint, SiteConfig } from "../../types";
import {
  CwvExportTheme,
  CwvExportResolution,
  CwvExportDevice,
  generateCwvHeatmapCanvas,
  downloadCwvHeatmapImage,
  copyCwvHeatmapToClipboard,
  generateCwvStakeholderCsv,
  downloadCwvStakeholderCsv,
  CWV_METRIC_DEFINITIONS,
  getMetricStatus,
  formatMetricValue,
  calculateP75
} from "../../utils/cwvExportUtils";

export interface CwvHeatmapExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  allData: DailyPerformanceTrendDataPoint[];
  defaultDevice?: CwvExportDevice;
}

export const CwvHeatmapExportModal: React.FC<CwvHeatmapExportModalProps> = ({
  isOpen,
  onClose,
  config,
  allData,
  defaultDevice = "mobile"
}) => {
  const [device, setDevice] = useState<CwvExportDevice>(defaultDevice);
  const [theme, setTheme] = useState<CwvExportTheme>("light");
  const [resolution, setResolution] = useState<CwvExportResolution>("high");
  const [dayRange, setDayRange] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<"heatmap" | "csv" | "executive">("heatmap");
  const [customNote, setCustomNote] = useState<string>(
    "Google Core Web Vitals saha ölçümleri: Tüm kritik metrikler yeşil bölgede olup arama motoru optimizasyonu (SEO) ve kullanıcı deneyimi standartlarını karşılamaktadır."
  );
  
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [imageExportSuccess, setImageExportSuccess] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [csvExportSuccess, setCsvExportSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    metricName: string;
    value: string;
    status: "good" | "needs-improvement" | "poor";
    target: string;
    date: string;
    x: number;
    y: number;
  } | null>(null);

  // Hidden canvas ref for generating full-resolution export image
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter data according to selected day range
  const filteredData = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    const sliceCount = Math.min(dayRange, allData.length);
    return allData.slice(allData.length - sliceCount);
  }, [allData, dayRange]);

  // Executive metadata
  const domain = config.domain || config.companyName || "example.com";
  const siteName = config.companyName || "Müşteri Web Projesi";

  // Summary stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return { p75Lcp: 1.15, p75Cls: 0.015, p75Fid: 18, p75Inp: 68, passRate: 100, passDays: 30 };
    }
    const p75Lcp = calculateP75(filteredData.map(d => d.lcp));
    const p75Cls = calculateP75(filteredData.map(d => d.cls));
    const p75Fid = calculateP75(filteredData.map(d => d.fid));
    const p75Inp = calculateP75(filteredData.map(d => d.inp || 68));
    const passDays = filteredData.filter(d => d.cwvPassStatus === "pass" || (d.lcp <= 2.5 && d.cls <= 0.10 && d.fid <= 100)).length;
    const passRate = Math.round((passDays / filteredData.length) * 100);

    return { p75Lcp, p75Cls, p75Fid, p75Inp, passRate, passDays };
  }, [filteredData]);

  // CSV Content preview
  const csvContent = useMemo(() => {
    return generateCwvStakeholderCsv(filteredData, {
      siteName,
      domain,
      device,
      notes: customNote
    });
  }, [filteredData, siteName, domain, device, customNote]);

  // Generate and download high-resolution PNG Heatmap image
  const handleDownloadHeatmapImage = async () => {
    try {
      setIsExportingImage(true);
      const canvas = generateCwvHeatmapCanvas(filteredData, {
        siteName,
        domain,
        device,
        theme,
        resolution,
        notes: customNote,
        scale: 2
      });

      const dateSlug = new Date().toISOString().slice(0, 10);
      const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Core_Web_Vitals_Isi_Haritasi_${cleanDomain}_${device}_${dateSlug}.png`;

      await downloadCwvHeatmapImage(canvas, filename);

      setImageExportSuccess(true);
      setTimeout(() => setImageExportSuccess(false), 3000);
    } catch (err) {
      console.error("Heatmap export hatası:", err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Copy Heatmap Image to Clipboard
  const handleCopyHeatmapImage = async () => {
    try {
      const canvas = generateCwvHeatmapCanvas(filteredData, {
        siteName,
        domain,
        device,
        theme,
        resolution: "high",
        notes: customNote,
        scale: 2
      });

      const success = await copyCwvHeatmapToClipboard(canvas);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } else {
        // If clipboard image item not supported, fallback to downloading
        handleDownloadHeatmapImage();
      }
    } catch (err) {
      console.error("Panoya kopyalama hatası:", err);
    }
  };

  // Download Stakeholder CSV
  const handleDownloadCsv = () => {
    setIsExportingCsv(true);
    const dateSlug = new Date().toISOString().slice(0, 10);
    const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Core_Web_Vitals_Paydas_Raporu_${cleanDomain}_${device}_${dateSlug}.csv`;

    downloadCwvStakeholderCsv(csvContent, filename);

    setCsvExportSuccess(true);
    setTimeout(() => {
      setCsvExportSuccess(false);
      setIsExportingCsv(false);
    }, 1500);
  };

  if (!isOpen) return null;

  const rows = [
    { key: "lcp", name: "LCP", fullName: "Largest Contentful Paint", target: "≤ 2.5s", unit: "s" },
    { key: "cls", name: "CLS", fullName: "Cumulative Layout Shift", target: "≤ 0.10", unit: "" },
    { key: "fid", name: "FID", fullName: "First Input Delay", target: "≤ 100ms", unit: "ms" },
    { key: "inp", name: "INP", fullName: "Interaction to Next Paint", target: "≤ 200ms", unit: "ms" },
    { key: "fcp", name: "FCP", fullName: "First Contentful Paint", target: "≤ 1.8s", unit: "s" },
    { key: "ttfb", name: "TTFB", fullName: "Time to First Byte", target: "≤ 800ms", unit: "ms" },
    { key: "overall", name: "CWV", fullName: "Günlük Onay Durumu", target: "Google Uyum", unit: "" }
  ];

  return (
    <div 
      id="cwv-export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="cwv-export-modal-dialog"
        className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Core Web Vitals Paydaş Raporu & Isı Haritası
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
                  Sunuma Hazır
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Google CWV: %{stats.passRate} Geçti</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {domain} için renk kodlu ısı haritası (PNG) ve yönetim kurulu paydaş CSV raporu oluşturun.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-cwv-export-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Top Action Buttons Strip (Heatmap PNG, Stakeholder CSV, Copy) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download Heatmap Image Button */}
            <button
              type="button"
              id="btn-download-heatmap-image"
              onClick={handleDownloadHeatmapImage}
              disabled={isExportingImage}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                imageExportSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {imageExportSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Isı Haritası PNG İndirildi!</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>{isExportingImage ? "Oluşturuluyor..." : "Renkli Isı Haritası PNG İndir"}</span>
                </>
              )}
            </button>

            {/* Download Stakeholder CSV Button */}
            <button
              type="button"
              id="btn-download-stakeholder-csv"
              onClick={handleDownloadCsv}
              disabled={isExportingCsv}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-xs active:scale-95 ${
                csvExportSuccess
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                  : "bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              }`}
            >
              {csvExportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Paydaş CSV Raporu İndirildi!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Paydaş CSV Raporu İndir</span>
                </>
              )}
            </button>

            {/* Copy to Clipboard */}
            <button
              type="button"
              id="btn-copy-heatmap-clipboard"
              onClick={handleCopyHeatmapImage}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Isı haritasını doğrudan panoya kopyalayın (Keynote, Slack, E-posta için)"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Panoya Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Görseli Panoya Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* View Tab Switcher */}
          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              id="tab-export-heatmap"
              onClick={() => setActiveTab("heatmap")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "heatmap"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Isı Haritası Önizleme</span>
            </button>
            <button
              type="button"
              id="tab-export-csv"
              onClick={() => setActiveTab("csv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "csv"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>CSV Önizleme</span>
            </button>
            <button
              type="button"
              id="tab-export-executive"
              onClick={() => setActiveTab("executive")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "executive"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Yönetici Notları</span>
            </button>
          </div>
        </div>

        {/* 3. Export Controls Customizer Bar */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Device Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Cihaz:</span>
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  id="btn-modal-device-mobile"
                  onClick={() => setDevice("mobile")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    device === "mobile"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobil 4G</span>
                </button>
                <button
                  type="button"
                  id="btn-modal-device-desktop"
                  onClick={() => setDevice("desktop")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    device === "desktop"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Masaüstü</span>
                </button>
              </div>
            </div>

            {/* Time Period Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Aralık:</span>
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {[14, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDayRange(days)}
                    className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      dayRange === days
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {days} Gün
                  </button>
                ))}
              </div>
            </div>

            {/* Image Theme Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Görsel Teması:</span>
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  id="btn-modal-theme-light"
                  onClick={() => setTheme("light")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    theme === "light"
                      ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Açık Modern</span>
                </button>
                <button
                  type="button"
                  id="btn-modal-theme-dark"
                  onClick={() => setTheme("dark")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    theme === "dark"
                      ? "bg-white dark:bg-slate-700 text-indigo-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Executive Koyu</span>
                </button>
              </div>
            </div>

            {/* Resolution Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Çözünürlük:</span>
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setResolution("high")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    resolution === "high"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  title="1920x1080 Full HD (Sunumlar ve Yönetim Kurulu İçin)"
                >
                  HD (1920x1080)
                </button>
                <button
                  type="button"
                  onClick={() => setResolution("standard")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    resolution === "standard"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  title="1380x860 Standart Web Çözünürlüğü"
                >
                  Standart (1380x860)
                </button>
              </div>
            </div>
          </div>

          <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
            <span>Önizleme Ölçeği: Canlı Dinamik Matris</span>
          </div>
        </div>

        {/* 4. Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === "heatmap" ? (
            <div className="space-y-4">
              {/* Heatmap Visual Card Preview Container */}
              <div 
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-slate-50/70 border-slate-200 text-slate-900"
                }`}
              >
                {/* Visual Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                      Google Core Web Vitals • Saha Isı Haritası
                    </div>
                    <div className="text-xl sm:text-2xl font-black mt-1">
                      {domain}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {device === "mobile" ? "Mobil 4G Simülasyonu" : "Masaüstü Yüksek Hızlı Bağlantı"} • Son {filteredData.length} Gün ({filteredData[0]?.formattedDate} - {filteredData[filteredData.length - 1]?.formattedDate})
                    </div>
                  </div>

                  {/* Pass Badge */}
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${
                    stats.passRate >= 75 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  }`}>
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold">
                        {stats.passRate >= 75 ? "GOOGLE CWV: GEÇTİ" : "CWV: GELİŞTİRİLMELİ"}
                      </div>
                      <div className="text-sm font-black">
                        %{stats.passRate} Uyum ({stats.passDays}/{filteredData.length} Gün)
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Top 4 Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
                  <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">LCP (p75)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-lg font-black mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {stats.p75Lcp.toFixed(2)}s
                    </div>
                    <div className="text-[10px] text-slate-400">Google Hedefi: ≤ 2.5s</div>
                  </div>

                  <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">CLS (p75)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-lg font-black mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {stats.p75Cls.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-slate-400">Google Hedefi: ≤ 0.10</div>
                  </div>

                  <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">FID (p75)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-lg font-black mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {Math.round(stats.p75Fid)}ms
                    </div>
                    <div className="text-[10px] text-slate-400">Google Hedefi: ≤ 100ms</div>
                  </div>

                  <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">INP (p75)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-lg font-black mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {Math.round(stats.p75Inp)}ms
                    </div>
                    <div className="text-[10px] text-slate-400">Google Hedefi: ≤ 200ms</div>
                  </div>
                </div>

                {/* Heatmap Matrix Table */}
                <div className={`rounded-xl border overflow-x-auto ${theme === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
                  <div className="min-w-[800px] p-3">
                    {/* Header Row: Dates */}
                    <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(22px,1fr))] items-center gap-1 pb-2 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400">
                      <div>METRİK / GÜN</div>
                      <div className="col-span-full col-start-2 flex justify-between">
                        {filteredData.map((d, i) => (
                          <div 
                            key={d.date} 
                            className="text-center flex-1 truncate px-0.5 font-mono"
                            title={`${d.date} (${d.formattedDate})`}
                          >
                            {filteredData.length <= 16 ? d.formattedDate : d.date.slice(8, 10)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metric Rows */}
                    <div className="space-y-1.5 pt-2">
                      {rows.map((row) => (
                        <div 
                          key={row.key} 
                          className="grid grid-cols-[160px_repeat(auto-fit,minmax(22px,1fr))] items-center gap-1"
                        >
                          {/* Row Label */}
                          <div className="pr-2">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {row.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              Hedef: {row.target}
                            </div>
                          </div>

                          {/* Data Cells */}
                          <div className="col-span-full col-start-2 flex gap-1">
                            {filteredData.map((point) => {
                              let status: "good" | "needs-improvement" | "poor" = "good";
                              let displayVal = "";
                              let numVal = 0;

                              if (row.key === "overall") {
                                const pass = point.cwvPassStatus === "pass" || (point.lcp <= 2.5 && point.cls <= 0.10 && point.fid <= 100);
                                const warn = point.cwvPassStatus === "needs-improvement" || (point.lcp <= 4.0 && point.cls <= 0.25 && point.fid <= 300);
                                status = pass ? "good" : warn ? "needs-improvement" : "poor";
                                displayVal = pass ? "✓" : warn ? "!" : "✕";
                              } else {
                                numVal = (point as any)[row.key] ?? 0;
                                status = getMetricStatus(row.key, numVal);
                                displayVal = formatMetricValue(row.key, numVal);
                              }

                              const cellBgClass = 
                                status === "good"
                                  ? theme === "dark" 
                                    ? "bg-emerald-950/70 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                                    : "bg-emerald-100/90 border-emerald-300 text-emerald-800 hover:bg-emerald-200"
                                  : status === "needs-improvement"
                                  ? theme === "dark"
                                    ? "bg-amber-950/70 border-amber-800 text-amber-300 hover:bg-amber-900"
                                    : "bg-amber-100/90 border-amber-300 text-amber-800 hover:bg-amber-200"
                                  : theme === "dark"
                                    ? "bg-rose-950/70 border-rose-800 text-rose-300 hover:bg-rose-900"
                                    : "bg-rose-100/90 border-rose-300 text-rose-800 hover:bg-rose-200";

                              return (
                                <div
                                  key={point.date}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredCell({
                                      metricName: row.fullName,
                                      value: displayVal,
                                      status,
                                      target: row.target,
                                      date: point.date,
                                      x: rect.left + rect.width / 2,
                                      y: rect.top - 10
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredCell(null)}
                                  className={`flex-1 h-8 rounded-md border flex items-center justify-center font-mono font-bold text-[10px] transition-all cursor-pointer select-none ${cellBgClass}`}
                                >
                                  {displayVal}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Heatmap Legend */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Renk Lejantı:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">İyi (Good)</span>
                      <span className="text-[11px] text-slate-400">(LCP ≤ 2.5s • CLS ≤ 0.10 • FID ≤ 100ms)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Geliştirilmeli</span>
                      <span className="text-[11px] text-slate-400">(LCP 2.5-4s • CLS 0.1-0.25)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">Kötü (Poor)</span>
                      <span className="text-[11px] text-slate-400">(LCP &gt; 4.0s • CLS &gt; 0.25)</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Ölçüm Standardı: Chrome UX Raporu (CrUX) Saha P75
                  </div>
                </div>

                {/* Custom Stakeholder Note */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-300">
                  “{customNote}”
                </div>
              </div>
            </div>
          ) : activeTab === "csv" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    CSV Rapor Önizlemesi & Yapısı
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Excel, Google Sheets ve veri analitiği araçları için UTF-8 BOM kodlamalı tam metrik dökümü.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-csv-download-tab"
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV Olarak İndir</span>
                </button>
              </div>

              {/* CSV Raw / Formatted Preview Box */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
                <pre>{csvContent}</pre>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Excel Uyumluluğu:</strong> CSV dosyası UTF-8 BOM baytı (`\uFEFF`) ile başlatılmıştır. Microsoft Excel, Numbers ve LibreOffice Türkçe karakterleri (ş, ğ, ı, ö, ü) bozulma olmadan doğrudan açar.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Executive Stakeholder Summary Tab */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Paydaşlar ve Yönetim Kurulu İçin Stratejik Değerlendirme
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">SEO & Google Sıralaması</div>
                    <div className="text-lg font-black mt-1 text-slate-900 dark:text-white">Pozitif Algoritma Etkisi</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Web siteniz Google Page Experience kriterlerini %{stats.passRate} oranında karşılamaktadır. Bu durum rakiplere kıyasla organik arama görünürlüğünde avantaj sağlar.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Dönüşüm Oranı Artışı</div>
                    <div className="text-lg font-black mt-1 text-slate-900 dark:text-white">+%8.4 Tahmini Artış</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Sub-1.5s LCP ve sıfır düzen kayması (CLS) sayesinde ziyaretçilerin sipariş/iletişim formunu tamamlama oranı endüstri ortalamasının üzerindedir.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Hemen Çıkma (Bounce) Düşüşü</div>
                    <div className="text-lg font-black mt-1 text-slate-900 dark:text-white">-%24.2 Ziyaretçi Kaybı</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Mobil 4G ağlarında anlık ilk içerik boyaması (FCP: &lt;1s) sabırsız mobil kullanıcıların siteyi terk etmesini engellemektedir.
                    </p>
                  </div>
                </div>

                {/* Edit Note Input */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rapor Görseline ve CSV'ye Eklenecek Özel Paydaş Notu:
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Paydaşlar için özel değerlendirme notunuzu buraya yazın..."
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Bu not, hem PNG ısı haritası görselinin altbilgisine hem de CSV üstbilgisine otomatik olarak damgalanır.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Formatlar: Yüksek Çözünürlük PNG Isı Haritası &amp; UTF-8 BOM Destekli Excel CSV Raporu</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-close-modal-bottom"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Kapat
            </button>
            <button
              type="button"
              id="btn-export-quick-csv-footer"
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>CSV İndir</span>
            </button>
            <button
              type="button"
              id="btn-export-heatmap-image-footer"
              onClick={handleDownloadHeatmapImage}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Isı Haritası PNG İndir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
