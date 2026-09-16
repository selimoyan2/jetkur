import React, { useRef, useState } from "react";
import { SiteConfig, HeaderConfig } from "../../types";
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  X, 
  Sparkles, 
  Sliders, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { processLogoFile, processLogoFormData, LogoUploadResult } from "../../utils/logoUploadHelper";
import { LogoToastInfo } from "./LogoUploadToast";

interface QuickLogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onShowToast: (toast: LogoToastInfo) => void;
  onOpenAssetManager?: () => void;
}

export const QuickLogoUploadModal: React.FC<QuickLogoUploadModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  onShowToast,
  onOpenAssetManager
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "checker">("checker");
  const [directUrl, setDirectUrl] = useState("");

  if (!isOpen) return null;

  const currentLogo = config.logo || config.header?.logoImage || config.logoUrl || "";
  const header = config.header || {
    sticky: true,
    logoType: "icon",
    logoHeight: 44,
    logoWidth: 0,
    logoAspectRatio: "auto",
    logoObjectFit: "contain",
    showTextAlongsideLogo: false,
    ctaButton: { text: "Teklif Al", link: "#contact", enabled: true }
  };

  const handleApplyLogoResult = (result: LogoUploadResult) => {
    if (!result.success || !result.dataUrl) {
      const err = result.errorMessage || "Logo yüklenemedi. Lütfen geçerli bir dosya seçin.";
      setErrorMessage(err);
      onShowToast({
        type: "error",
        title: "Logo Yükleme Başarısız",
        message: err,
        fileName: result.fileName,
        onRetry: () => fileInputRef.current?.click()
      });
      return;
    }

    setErrorMessage(null);
    const newLogoUrl = result.dataUrl;

    // Synchronize across all logo fields in site config
    const updated: SiteConfig = {
      ...config,
      logo: newLogoUrl,
      logoUrl: newLogoUrl,
      header: {
        ...header,
        logoType: "image",
        logoImage: newLogoUrl
      }
    };

    onChange(updated);

    onShowToast({
      type: "success",
      title: "Logo Başarıyla Güncellendi",
      message: `${result.fileName || "Logo görseli"} başarıyla işlendi ve sitenizin tüm alanlarına uygulandı.`,
      fileName: result.fileName,
      fileSize: result.fileSizeBytes,
      previewUrl: newLogoUrl,
      dimensions: result.dimensions,
      savingsPercentage: result.savingsPercentage
    });

    onClose();
  };

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await processLogoFile(file, {
        maxDimension: 1200,
        quality: 0.92,
        companySubdomain: config.cloudflare?.subdomain || "sirket"
      });
      handleApplyLogoResult(result);
    } catch (err: any) {
      const msg = err?.message || "Dosya işleme sırasında beklenmeyen bir hata oluştu.";
      setErrorMessage(msg);
      onShowToast({
        type: "error",
        title: "Logo Okuma Hatası",
        message: msg,
        fileName: file.name,
        onRetry: () => fileInputRef.current?.click()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleApplyDirectUrl = () => {
    if (!directUrl.trim()) return;
    const url = directUrl.trim();

    const updated: SiteConfig = {
      ...config,
      logo: url,
      logoUrl: url,
      header: {
        ...header,
        logoType: "image",
        logoImage: url
      }
    };

    onChange(updated);

    onShowToast({
      type: "success",
      title: "Logo URL'si Tanımlandı",
      message: "Görsel URL'si web sitenizde başarıyla aktif edildi.",
      previewUrl: url
    });

    setDirectUrl("");
    onClose();
  };

  const handleRemoveLogo = () => {
    const updated: SiteConfig = {
      ...config,
      logo: "",
      logoUrl: "",
      header: {
        ...header,
        logoType: "icon",
        logoImage: ""
      }
    };
    onChange(updated);

    onShowToast({
      type: "info",
      title: "Logo Sıfırlandı",
      message: "Özel logo kaldırıldı. Sitenizde varsayılan marka ikonu ve metin logosu kullanılacak."
    });

    onClose();
  };

  return (
    <div
      id="quick-logo-upload-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Marka Logosu Yükle & Yönet</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                  Otomatik Optimize
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Şeffaf PNG, vektörel SVG, JPG veya WebP formatında logonuzu yükleyin.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-logo-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <div className="font-bold">Yükleme Hatası</div>
              <p className="text-[11px] leading-relaxed text-rose-200">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Live Preview Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Canlı Logo Önizleme</span>
              {currentLogo ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ) : (
                <span className="text-[10px] text-slate-500">(Henüz logo atanmadı)</span>
              )}
            </span>

            {/* Background Selector for transparent logos */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setPreviewBg("checker")}
                className={`px-2 py-0.5 rounded ${previewBg === "checker" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
              >
                Izgara
              </button>
              <button
                type="button"
                onClick={() => setPreviewBg("dark")}
                className={`px-2 py-0.5 rounded ${previewBg === "dark" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
              >
                Koyu
              </button>
              <button
                type="button"
                onClick={() => setPreviewBg("light")}
                className={`px-2 py-0.5 rounded ${previewBg === "light" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
              >
                Açık
              </button>
            </div>
          </div>

          <div
            className={`h-36 rounded-xl flex items-center justify-center p-4 border border-slate-800 relative overflow-hidden transition-all ${
              previewBg === "checker"
                ? "bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-slate-900"
                : previewBg === "dark"
                ? "bg-slate-950"
                : "bg-slate-100 text-slate-900"
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-amber-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs font-bold">Logo işleniyor & optimize ediliyor...</span>
              </div>
            ) : currentLogo ? (
              <div className="flex flex-col items-center justify-center gap-2 max-h-full">
                <img
                  src={currentLogo}
                  alt={config.companyName || "Logo"}
                  className="max-h-24 max-w-full object-contain transition-transform hover:scale-105"
                  style={{
                    height: header.logoHeight ? `${header.logoHeight}px` : "48px"
                  }}
                />
              </div>
            ) : (
              <div className="text-center space-y-1 text-slate-400">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-500 stroke-1" />
                <div className="text-xs font-bold">Özel Logo Bulunmuyor</div>
                <div className="text-[11px] text-slate-500">
                  Aşağıdaki alandan yükleme yapabilirsiniz
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          id="logo-drag-drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
              : "border-slate-700 hover:border-amber-500/50 bg-slate-950/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/svg+xml, image/webp, image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-bold text-white block">
                Logo Dosyası Seçin veya Buraya Sürükleyin
              </span>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tavsiye: Saydam arka planlı PNG veya Vektör SVG. Maksimum 10MB.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
              PNG • SVG • JPG • WebP
            </span>
          </div>
        </div>

        {/* Direct URL Alternative */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400">
            Veya Doğrudan Logo Görsel URL'si Girin
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://.../logo.png"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-hidden"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyDirectUrl();
              }}
            />
            <button
              type="button"
              id="apply-direct-logo-url-btn"
              disabled={!directUrl.trim()}
              onClick={handleApplyDirectUrl}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              Uygula
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            {currentLogo && (
              <button
                type="button"
                id="modal-remove-logo-btn"
                onClick={handleRemoveLogo}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Logoyu Kaldır</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenAssetManager && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAssetManager();
                }}
                className="px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>AI Logo Üretici (Imagen 3)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
