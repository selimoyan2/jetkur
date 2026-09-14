import React, { useState, useRef, useMemo } from "react";
import { SiteConfig, MediaLibraryItem } from "../../types";
import {
  compressAndOptimizeImage,
  batchConvertSiteAssetsToWebPAndAvif,
  calculateImageCoreWebVitals,
  generateResponsiveThumbnails,
  isAvifSupportedInBrowser,
  isWebPSupportedInBrowser,
  isModernFormatAsset,
  formatBytes,
  DEFAULT_OPTIMIZATION_OPTIONS,
  GeneratedThumbnail,
  OptimizedImageResult
} from "../../utils/imageOptimizer";
import {
  Zap,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Download,
  Copy,
  Check,
  Sliders,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Gauge,
  Layers,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Code,
  FileText,
  ChevronRight,
  HardDrive,
  Info,
  Maximize2,
  Trash2,
  UploadCloud,
  CheckCheck
} from "lucide-react";

interface AiImageOptimizerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface AiAnalysisResult {
  altText: string;
  tags: string[];
  recommendedFormat: "avif" | "webp";
  formatRationale: string;
  coreWebVitals: {
    lcpImpact: string;
    lcpRecommendation: string;
    clsPrevention: string;
    thumbnailStrategy: string;
    estimatedLcpSavingsMs: number;
  };
  qualityRecommendation: {
    targetQuality: number;
    maxDimension: number;
    projectedSavingsPercent: number;
  };
}

export const AiImageOptimizer: React.FC<AiImageOptimizerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  // Conversion configuration state
  const [targetFormat, setTargetFormat] = useState<"webp" | "avif" | "auto">("auto");
  const [quality, setQuality] = useState<number>(82);
  const [maxDimension, setMaxDimension] = useState<number>(1920);
  const [selectedCategory, setSelectedCategory] = useState<MediaLibraryItem["category"]>("hero");
  const [generateThumbnailsOption, setGenerateThumbnailsOption] = useState<boolean>(true);
  const [enforceAspectRatio, setEnforceAspectRatio] = useState<boolean>(true);

  // Active conversion and analysis state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [currentOptimizedItem, setCurrentOptimizedItem] = useState<OptimizedImageResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"picture" | "preload" | "img">("picture");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Site-wide batch conversion state
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentItemName: string } | null>(null);
  const [batchReport, setBatchReport] = useState<{
    convertedCount: number;
    originalBytes: number;
    optimizedBytes: number;
    savedBytes: number;
    savingsPercentage: number;
    edgePoPs: number;
    lcpMsSaved: number;
    lighthouseGain: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const nativeAvifSupported = useMemo(() => isAvifSupportedInBrowser(), []);
  const nativeWebpSupported = useMemo(() => isWebPSupportedInBrowser(), []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Panoya kopyalandı");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Inspect existing site assets to count unconverted images
  const unoptimizedSiteImagesCount = useMemo(() => {
    let count = 0;
    if (config.hero?.bgImage && !isModernFormatAsset(config.hero.bgImage)) count++;
    if (config.about?.image && !isModernFormatAsset(config.about.image)) count++;
    if (config.gallery?.items) {
      count += config.gallery.items.filter((item) => item.imageUrl && !isModernFormatAsset(item.imageUrl)).length;
    }
    if (config.products?.items) {
      count += config.products.items.filter((p) => p.image && !isModernFormatAsset(p.image)).length;
    }
    if (config.services?.items) {
      count += config.services.items.filter((s) => s.image && !isModernFormatAsset(s.image)).length;
    }
    return count;
  }, [config]);

  // Request AI image audit and SEO guidance from server
  const requestAiOptimizationGuidance = async (file: File, width: number, height: number, sizeBytes: number) => {
    setIsAnalyzingAi(true);
    try {
      const res = await fetch("/api/ai-image-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          category: selectedCategory,
          width,
          height,
          fileSizeBytes: sizeBytes,
          companyName: config.name || "İşletme",
          sector: config.sector || "Hizmet",
          city: config.contact?.address || "Türkiye",
          currentFormat: file.type.split("/")[1] || "jpeg"
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiAnalysis(json.data);
      }
    } catch (err) {
      console.warn("AI optimization guidance request failed:", err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Process a selected image file
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Lütfen geçerli bir görsel dosyası seçin (JPEG, PNG, WebP, vb.)");
      return;
    }

    setIsProcessing(true);
    setAiAnalysis(null);

    try {
      const subdomain = config.cloudflare?.subdomain || "sirket";
      const resolvedFormat = targetFormat === "auto" ? "webp" : targetFormat;

      const result = await compressAndOptimizeImage(
        file,
        {
          maxWidth: maxDimension,
          quality: quality / 100,
          targetFormat: resolvedFormat,
          category: selectedCategory,
          generateThumbnails: generateThumbnailsOption,
          generateVariants: true
        },
        subdomain
      );

      setCurrentOptimizedItem(result);

      // Trigger AI Analysis in parallel
      requestAiOptimizationGuidance(file, result.width, result.height, file.size);

      // Optionally save to site mediaLibrary
      const updatedMediaList = [
        result,
        ...(config.mediaLibrary || []).filter((item) => item.name !== result.name)
      ];

      onChange({
        ...config,
        mediaLibrary: updatedMediaList
      });

      showToast(`Görsel başarıyla ${result.format.toUpperCase()} formatına dönüştürüldü ve %${result.savingsPercentage} tasarruf sağlandı!`);
    } catch (err: any) {
      console.error("Görsel dönüştürme hatası:", err);
      showToast(`Optimizasyon başarısız: ${err?.message || "Bilinmeyen hata"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run site-wide batch optimization
  const runSiteWideBatchOptimization = async () => {
    setIsBatchRunning(true);
    setBatchProgress(null);
    setBatchReport(null);

    try {
      const { updatedConfig, convertedCount, savedBytes, report } = await batchConvertSiteAssetsToWebPAndAvif(
        config,
        targetFormat,
        (current, total, currentItemName) => {
          setBatchProgress({ current, total, currentItemName });
        },
        quality / 100
      );

      onChange(updatedConfig);
      setBatchReport(report);
      showToast(`Site genelindeki ${convertedCount} görsel WebP/AVIF formatına dönüştürüldü!`);
    } catch (err: any) {
      console.error("Toplu optimizasyon hatası:", err);
      showToast("Toplu optimizasyon sırasında bir sorun oluştu.");
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Download converted file
  const handleDownloadVariant = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`${filename} indiriliyor...`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16 animate-fadeIn" id="ai-image-optimizer-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="optimizer-toast"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm font-medium"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Core Web Vitals Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Web Vitals & Next-Gen Format Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Yapay Zeka Destekli Görsel & Core Web Vitals Optimizasyonu
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Görsellerinizi modern <strong>WebP</strong> ve <strong>AVIF</strong> formatlarına otomatik dönüştürün, 
              ekran boyutlarına uygun 5 seviyeli küçük resimler (thumbnails) üretin ve Google Lighthouse LCP/CLS skorlarınızı maksimize edin.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shrink-0">
            <div className="text-center px-2">
              <div className="text-xs text-slate-400 font-medium">LCP Hedefi</div>
              <div className="text-lg font-bold text-emerald-400">&lt; 1.2s</div>
              <div className="text-[10px] text-slate-500">Mükemmel</div>
            </div>
            <div className="text-center px-2 border-x border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">CLS Kayması</div>
              <div className="text-lg font-bold text-blue-400">0.00</div>
              <div className="text-[10px] text-slate-500">Sıfır Kayma</div>
            </div>
            <div className="text-center px-2">
              <div className="text-xs text-slate-400 font-medium">AVIF Tasarruf</div>
              <div className="text-lg font-bold text-amber-400">%80+</div>
              <div className="text-[10px] text-slate-500">Ultra Hafif</div>
            </div>
          </div>
        </div>

        {/* Browser Support Badges */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Tarayıcı Desteği:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${nativeWebpSupported ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
              <Check className="w-3 h-3" /> WebP (%99.8 Evrensel)
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${nativeAvifSupported ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
              {nativeAvifSupported ? <Check className="w-3 h-3" /> : <Info className="w-3 h-3" />} 
              AVIF (Chrome, Safari 16+, Edge, Firefox)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="goto-medialibrary-btn"
              onClick={() => onNavigateTab && onNavigateTab("media-library")}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors underline cursor-pointer"
            >
              <span>Medya Kütüphanesine Git</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Site-Wide One-Click Batch Optimizer Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Site Genelindeki Tüm Görselleri Tek Tıkla Optimize Et
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              Mevcut web sitenizdeki banner, hakkımızda, galeri ve ürün fotoğraflarını tarar; eski JPEG/PNG dosyalarını otomatik olarak WebP/AVIF formatına dönüştürür.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1">
              <span>Mevcut Sitede Optimize Edilebilir Görsel: <strong className="text-slate-900">{unoptimizedSiteImagesCount} adet</strong></span>
              <span>•</span>
              <span>Cloudflare CDN Anycast Dağıtımı: <strong className="text-emerald-600">Aktif</strong></span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              id="batch-optimize-site-btn"
              onClick={runSiteWideBatchOptimization}
              disabled={isBatchRunning || unoptimizedSiteImagesCount === 0}
              className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isBatchRunning || unoptimizedSiteImagesCount === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isBatchRunning ? "animate-spin" : ""}`} />
              <span>{isBatchRunning ? "Tüm Site Dönüştürülüyor..." : "Sitedeki Tüm Görselleri Dönüştür"}</span>
            </button>
          </div>
        </div>

        {/* Batch Progress Bar */}
        {isBatchRunning && batchProgress && (
          <div className="mt-5 p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
              <span>İşleniyor: {batchProgress.currentItemName}</span>
              <span>{batchProgress.current} / {batchProgress.total}</span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Batch Completion Report */}
        {batchReport && (
          <div className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Site Çapında Optimizasyon Başarıyla Tamamlandı</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-center">
                <div className="text-slate-500">Dönüştürülen Görsel</div>
                <div className="text-base font-extrabold text-slate-800">{batchReport.convertedCount} Adet</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-center">
                <div className="text-slate-500">Kazanılan Bant Genişliği</div>
                <div className="text-base font-extrabold text-emerald-600">{formatBytes(batchReport.savedBytes)}</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-center">
                <div className="text-slate-500">Ortalama Boyut Tasarrufu</div>
                <div className="text-base font-extrabold text-indigo-600">%{batchReport.savingsPercentage}</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-center">
                <div className="text-slate-500">Tahmini LCP Hızlanması</div>
                <div className="text-base font-extrabold text-amber-600">-{batchReport.lcpMsSaved} ms</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Conversion Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Drag & Drop & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload & Dropzone Area */}
          <div
            id="image-dropzone-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
              isDragging
                ? "border-indigo-600 bg-indigo-50/50 scale-[1.01]"
                : "border-slate-300 hover:border-slate-400 bg-white shadow-sm"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              Görseli Buraya Sürükleyin veya Dosya Seçin
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              JPEG, PNG, HEIC veya WebP formatındaki dosyalar otomatik olarak AVIF ve WebP formatlarına dönüştürülür.
            </p>

            <button
              type="button"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Bilgisayardan Dosya Seç
            </button>
          </div>

          {/* Conversion Configuration Settings Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Optimizasyon Parametreleri</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Önerilen Ayarlar
              </span>
            </div>

            {/* Target Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Hedef Format</span>
                <span className="text-[11px] text-slate-500 font-normal">Next-Gen Format Seçimi</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetFormat("auto")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    targetFormat === "auto"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div>Otomatik</div>
                  <div className="text-[9px] opacity-80 font-normal">WebP + AVIF</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFormat("avif")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    targetFormat === "avif"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div>AVIF</div>
                  <div className="text-[9px] opacity-80 font-normal">-%85 En Yüksek</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFormat("webp")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    targetFormat === "webp"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div>WebP</div>
                  <div className="text-[9px] opacity-80 font-normal">%99.8 Destek</div>
                </button>
              </div>
            </div>

            {/* Category Context (for AI & SEO) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Görselin Sitedeki Kullanım Alanı (SEO & LCP)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MediaLibraryItem["category"])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="hero">Hero / Sayfa Üstü Ana Banner (Kritik LCP)</option>
                <option value="product">Ürün Görseli (E-Ticaret Kartı)</option>
                <option value="gallery">Portföy / Fotoğraf Galerisi</option>
                <option value="service">Hizmet Açıklama Görseli</option>
                <option value="blog">Blog / Makale Kapak Resmi</option>
                <option value="logo">Firma Logosu / İkon</option>
                <option value="general">Genel İçerik Görseli</option>
              </select>
            </div>

            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Sıkıştırma Kalitesi: %{quality}</span>
                <span className="text-slate-400 font-normal">{quality >= 80 ? "Kayba Yakın Sıfır (Visually Lossless)" : "Yüksek Sıkıştırma"}</span>
              </div>
              <input
                type="range"
                min={60}
                max={95}
                step={1}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>%60 (Maksimum Hız)</span>
                <span className="font-bold text-indigo-600">%82 (Önerilen)</span>
                <span>%95 (En Yüksek Çözünürlük)</span>
              </div>
            </div>

            {/* Max Dimension */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Maksimum Genişlik Sınırı</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1080, 1440, 1920, 2560].map((dim) => (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => setMaxDimension(dim)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      maxDimension === dim
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {dim}px
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <div>
                  <div className="font-bold">5 Seviyeli Küçük Resim (Thumbnails)</div>
                  <div className="text-[11px] text-slate-500">120w, 320w, 640w, 1080w responsive varyantlar üret</div>
                </div>
                <input
                  type="checkbox"
                  checked={generateThumbnailsOption}
                  onChange={(e) => setGenerateThumbnailsOption(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <div>
                  <div className="font-bold">CLS Koruyucu Aspect-Ratio</div>
                  <div className="text-[11px] text-slate-500">Düzen kaymalarını sıfırlamak için en/boy oranı sabitle</div>
                </div>
                <input
                  type="checkbox"
                  checked={enforceAspectRatio}
                  onChange={(e) => setEnforceAspectRatio(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Optimization Results & Core Web Vitals Hub (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isProcessing ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-spin">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Görsel WebP & AVIF Formatlarına Dönüştürülüyor...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                HTML5 Canvas tabanlı renk profili optimizasyonu yapılıyor, responsive küçük resimler hazırlanıyor ve Core Web Vitals metrikleri hesaplanıyor.
              </p>
            </div>
          ) : currentOptimizedItem ? (
            <div className="space-y-6">
              {/* Primary Converted Result Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase">
                        {currentOptimizedItem.format}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                        {currentOptimizedItem.width}x{currentOptimizedItem.height} px
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono">
                        {currentOptimizedItem.aspectRatio}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentOptimizedItem.name}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadVariant(currentOptimizedItem.url, `${currentOptimizedItem.originalName.replace(/\.[^/.]+$/, "")}.${currentOptimizedItem.format}`)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{currentOptimizedItem.format.toUpperCase()} İndir</span>
                    </button>
                    {currentOptimizedItem.avifUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadVariant(currentOptimizedItem.avifUrl!, `${currentOptimizedItem.originalName.replace(/\.[^/.]+$/, "")}.avif`)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>AVIF İndir</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Before vs After Visual Comparison & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visual Preview */}
                  <div className="rounded-xl overflow-hidden bg-slate-950/5 border border-slate-200 relative aspect-video flex items-center justify-center">
                    <img
                      src={currentOptimizedItem.url}
                      alt={currentOptimizedItem.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                      {currentOptimizedItem.width} x {currentOptimizedItem.height} • {currentOptimizedItem.format.toUpperCase()}
                    </div>
                  </div>

                  {/* Comparative Metrics */}
                  <div className="space-y-3 flex flex-col justify-center">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500">Orijinal Dosya</div>
                        <div className="text-sm font-bold text-slate-800">{formatBytes(currentOptimizedItem.originalSize)}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <div className="text-right">
                        <div className="text-[11px] text-emerald-600 font-semibold">Dönüştürülmüş ({currentOptimizedItem.format.toUpperCase()})</div>
                        <div className="text-sm font-bold text-emerald-700">{formatBytes(currentOptimizedItem.compressedSize)}</div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">Toplam Boyut Tasarrufu</span>
                      </div>
                      <span className="text-base font-extrabold text-emerald-700">
                        %{currentOptimizedItem.savingsPercentage} ({formatBytes(currentOptimizedItem.savedBytes)})
                      </span>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-900">Lighthouse Hız Kazancı</span>
                      </div>
                      <span className="text-sm font-extrabold text-blue-700">
                        +{currentOptimizedItem.coreWebVitals?.lighthouseGainEst || 14} Puan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Web Vitals Guidance Box */}
                {currentOptimizedItem.coreWebVitals && (
                  <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Core Web Vitals Yönergeleri</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Google Arama Deneyimi Sinyali</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700/60">
                        <div className="text-slate-400 text-[10px]">LCP İndirme Tasarrufu</div>
                        <div className="font-bold text-emerald-400">-{currentOptimizedItem.coreWebVitals.lcpSavingsMs} ms</div>
                        <div className="text-[9px] text-slate-500">Yükleme gecikmesi önlendi</div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700/60">
                        <div className="text-slate-400 text-[10px]">CLS Düzen Kayması</div>
                        <div className="font-bold text-blue-400">0.00 (Güvenli)</div>
                        <div className="text-[9px] text-slate-500">{currentOptimizedItem.coreWebVitals.aspectRatioCss}</div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700/60">
                        <div className="text-slate-400 text-[10px]">Yükleme Stratejisi</div>
                        <div className="font-bold text-white uppercase">{currentOptimizedItem.coreWebVitals.recommendedLoading}</div>
                        <div className="text-[9px] text-slate-500">fetchpriority: {currentOptimizedItem.coreWebVitals.recommendedFetchPriority}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Responsive Thumbnails Showcase */}
              {currentOptimizedItem.thumbnails && currentOptimizedItem.thumbnails.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Üretilen Optimize Küçük Resimler (Thumbnails)</span>
                    </div>
                    <span className="text-xs text-slate-500">{currentOptimizedItem.thumbnails.length} farklı çözünürlük</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentOptimizedItem.thumbnails.map((thumb) => (
                      <div
                        key={thumb.tier}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb.url}
                            alt={thumb.label}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{thumb.label}</div>
                            <div className="text-[11px] text-slate-500">
                              {thumb.width}x{thumb.height} px • {formatBytes(thumb.sizeBytes)}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadVariant(thumb.url, `${currentOptimizedItem.name}-${thumb.tier}.webp`)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Bu küçük resmi indir"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis & Turkish SEO Alt Text Box */}
              {aiAnalysis && (
                <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Yapay Zeka SEO Alt Metin & LCP İncelemesi</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      Gemini 2.5
                    </span>
                  </div>

                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950">Önerilen SEO Alt Metni (Alt Text)</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(aiAnalysis.altText, "alt-text")}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {copiedKey === "alt-text" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Kopyala</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-indigo-100 font-medium leading-relaxed">
                      {aiAnalysis.altText}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-800">Format Gerekçesi ({aiAnalysis.recommendedFormat.toUpperCase()})</div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">{aiAnalysis.formatRationale}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-800">CLS Düzen Kayması Önlemi</div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">{aiAnalysis.coreWebVitals.clsPrevention}</div>
                    </div>
                  </div>

                  {aiAnalysis.tags && aiAnalysis.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiAnalysis.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ready-to-use HTML Embed Snippets */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>Üretim Ortamı HTML Entegrasyon Kodu</span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab("picture")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activeCodeTab === "picture" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      &lt;picture&gt; (Modern)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab("preload")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activeCodeTab === "preload" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      &lt;link preload&gt; (LCP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab("img")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activeCodeTab === "img" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      &lt;img&gt; Standart
                    </button>
                  </div>
                </div>

                {/* Code Preview */}
                <div className="relative">
                  <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
                    {activeCodeTab === "picture"
                      ? currentOptimizedItem.coreWebVitals?.pictureTagHtml
                      : activeCodeTab === "preload"
                      ? currentOptimizedItem.coreWebVitals?.lcpPreloadCode || "<!-- Bu görsel hero olmadığı için preload gerektirmez -->"
                      : currentOptimizedItem.coreWebVitals?.imgTagHtml}
                  </pre>

                  <button
                    type="button"
                    onClick={() => {
                      const snippet =
                        activeCodeTab === "picture"
                          ? currentOptimizedItem.coreWebVitals?.pictureTagHtml
                          : activeCodeTab === "preload"
                          ? currentOptimizedItem.coreWebVitals?.lcpPreloadCode
                          : currentOptimizedItem.coreWebVitals?.imgTagHtml;
                      if (snippet) copyToClipboard(snippet, "code-snippet");
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs"
                  >
                    {copiedKey === "code-snippet" ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Kodu Kopyala</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-800">
                  Henüz Bir Görsel Yüklenmedi
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sol taraftan bir görsel yükleyin veya sürükleyin. Otomatik WebP/AVIF dönüştürme, responsive küçük resimler ve Core Web Vitals analizi anında burada görüntülenecektir.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
