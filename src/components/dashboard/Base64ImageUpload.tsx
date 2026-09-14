import React, { useRef, useState } from "react";
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  RefreshCw, 
  Link as LinkIcon, 
  Check, 
  Sparkles,
  Zap,
  Info,
  Globe,
  Maximize2
} from "lucide-react";
import { 
  compressImageFileToWebP, 
  formatBytes, 
  isWebPAsset, 
  WebPOptimizeDetails 
} from "../../utils/imageOptimizer";

interface Base64ImageUploadProps {
  label?: string;
  helperText?: string;
  value?: string;
  onChange: (base64OrUrl: string) => void;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9" | "auto";
  maxDimension?: number;
  quality?: number;
  placeholder?: string;
  compact?: boolean;
  className?: string;
  onOptimized?: (details: WebPOptimizeDetails) => void;
}

/**
 * Resizes and compresses an image file directly to WebP format
 * for high performance, alpha transparency preservation, and fast Cloudflare Edge delivery.
 */
export const compressImageToBase64 = async (
  file: File,
  maxDimension = 1400,
  quality = 0.82
): Promise<string> => {
  const result = await compressImageFileToWebP(file, maxDimension, quality);
  return result.base64;
};

export const Base64ImageUpload: React.FC<Base64ImageUploadProps> = ({
  label,
  helperText,
  value = "",
  onChange,
  aspectRatio = "16/9",
  maxDimension = 1400,
  quality = 0.82,
  placeholder = "https://... veya bilgisayarınızdan yükleyin",
  compact = false,
  className = "",
  onOptimized
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showEdgeDetails, setShowEdgeDetails] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastOptimization, setLastOptimization] = useState<WebPOptimizeDetails | null>(null);

  const handleFileChange = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const details = await compressImageFileToWebP(file, maxDimension, quality);
      setLastOptimization(details);
      onChange(details.base64);
      if (onOptimized) {
        onOptimized(details);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Görsel yüklenirken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const isBase64 = value && value.startsWith("data:image/");
  const isWebp = isWebPAsset(value);

  const aspectClass = 
    aspectRatio === "16/9" ? "aspect-16/9" :
    aspectRatio === "4/3" ? "aspect-4/3" :
    aspectRatio === "1/1" ? "aspect-square" :
    aspectRatio === "21/9" ? "aspect-21/9" : "min-h-[140px]";

  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">{label}</span>
            {helperText && <span className="text-[11px] text-slate-500">{helperText}</span>}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div className="flex items-center gap-2">
          {value ? (
            <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 group">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setLastOptimization(null);
                }}
                className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                title="Görseli Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Upload className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isProcessing ? "WebP Dönüştürülüyor..." : "Görsel Seç (WebP)"}</span>
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setLastOptimization(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors"
                  title="Görseli Kaldır"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick WebP format indicator */}
            {value && (
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold ${
                  isWebp ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                }`}>
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  {isWebp ? "WebP Edge Hazır" : "Görsel Yüklü"}
                </span>
                {lastOptimization && lastOptimization.savingsPercentage > 0 && (
                  <span className="text-emerald-400 font-semibold">
                    -%{lastOptimization.savingsPercentage} ({formatBytes(lastOptimization.compressedSize)})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {errorMsg && <p className="text-[11px] text-rose-400 font-semibold">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{label}</span>
          </label>
          {helperText && (
            <span className="text-[11px] text-slate-400">{helperText}</span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Main Container */}
      <div className="space-y-2">
        {value ? (
          /* Preview State */
          <div className={`relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 ${aspectClass} group`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay Action Bar */}
            <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>WebP Olarak Değiştir</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setLastOptimization(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kaldır</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-300 font-mono flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Cloudflare Edge Caching (WebP / TLS 1.3)</span>
              </div>
            </div>

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono backdrop-blur flex items-center gap-1 border shadow-xs ${
                isWebp 
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" 
                  : "bg-blue-950/80 text-blue-300 border-blue-500/40"
              }`}>
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span>{isWebp ? "WEBP FORMATI" : "GÖRSEL"}</span>
              </span>

              {lastOptimization && lastOptimization.savingsPercentage > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono backdrop-blur">
                  -%{lastOptimization.savingsPercentage} ({formatBytes(lastOptimization.compressedSize)})
                </span>
              )}
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEdgeDetails(!showEdgeDetails);
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[10px] font-mono text-slate-300 backdrop-blur border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Cloudflare Edge Bilgileri"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Edge CDN</span>
              </button>

              <div className="px-2 py-0.5 rounded-lg bg-slate-900/90 text-[10px] font-mono text-slate-300 backdrop-blur border border-slate-700 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{isBase64 ? (isWebp ? "WebP Base64" : "Base64") : "Harici URL"}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Drop Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-amber-400 bg-amber-500/10 scale-[0.99]"
                : "border-slate-700 hover:border-slate-500 bg-slate-950/60 hover:bg-slate-900/60"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Upload className={`w-5 h-5 ${isProcessing ? 'animate-spin text-amber-400' : ''}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isProcessing ? "WebP Pipeline Çalışıyor (Sıkıştırılıyor & Edge'e Hazırlanıyor)..." : "Görsel Yüklemek İçin Tıklayın veya Sürükleyin"}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  PNG, JPG, WebP veya SVG • Otomatik olarak <strong className="text-amber-400">WebP formatına</strong> dönüştürülerek Cloudflare Edge için optimize edilir
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cloudflare Edge details mini card */}
        {value && showEdgeDetails && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Globe className="w-4 h-4" />
                <span>Cloudflare Edge Delivery Pipeline</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEdgeDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ÇIKIŞ FORMATI</span>
                <span className="text-emerald-400 font-bold">image/webp</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">EDGE POLISH</span>
                <span className="text-cyan-400 font-bold">CF-Polished: webp_auto</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ÖNBELLEK SÜRESİ</span>
                <span className="text-slate-200">1 Yıl (Immutable)</span>
              </div>
            </div>
          </div>
        )}

        {/* Alternative URL Link Accordion */}
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-slate-400 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? "URL Girişini Gizle" : "Veya Doğrudan Görsel URL'si Gir"}</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Temizle</span>
            </button>
          )}
        </div>

        {showUrlInput && (
          <div className="flex gap-2 pt-1 animate-fadeIn">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:border-amber-500 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (urlInput.trim()) {
                  onChange(urlInput.trim());
                  setUrlInput("");
                  setShowUrlInput(false);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
            >
              Uygula
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};
