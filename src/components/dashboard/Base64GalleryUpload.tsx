import React, { useRef, useState } from "react";
import { 
  Upload, 
  Trash2, 
  Star, 
  Image as ImageIcon, 
  Plus, 
  Link as LinkIcon,
  Zap
} from "lucide-react";
import { compressImageToBase64 } from "./Base64ImageUpload";
import { isWebPAsset } from "../../utils/imageOptimizer";

interface Base64GalleryUploadProps {
  label?: string;
  images: string[];
  featuredImage?: string;
  onChange: (images: string[], featuredImage?: string) => void;
  maxDimension?: number;
  quality?: number;
}

export const Base64GalleryUpload: React.FC<Base64GalleryUploadProps> = ({
  label = "Ürün Fotoğraf Galerisi & Görselleri",
  images = [],
  featuredImage,
  onChange,
  maxDimension = 1400,
  quality = 0.82
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeFeatured = featuredImage || images[0] || "";

  const handleFileUpload = async (files: FileList) => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const newBase64s: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          setProcessStatus(`WebP'ye dönüştürülüyor (${i + 1}/${files.length})...`);
          const base64 = await compressImageToBase64(file, maxDimension, quality);
          newBase64s.push(base64);
        }
      }

      if (newBase64s.length > 0) {
        const updated = [...images, ...newBase64s];
        const newFeatured = activeFeatured || updated[0];
        onChange(updated, newFeatured);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Görseller yüklenirken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const targetUrl = images[indexToRemove];
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    let newFeatured = activeFeatured;
    if (activeFeatured === targetUrl) {
      newFeatured = updated[0] || "";
    }
    onChange(updated, newFeatured);
  };

  const handleSetFeatured = (imgUrl: string) => {
    onChange(images, imgUrl);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const updated = [...images, urlInput.trim()];
    const newFeatured = activeFeatured || urlInput.trim();
    onChange(updated, newFeatured);
    setUrlInput("");
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>{label}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono border border-emerald-500/30 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>WebP Edge Pipeline</span>
            </span>
          </label>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Yüklenen fotoğraflar otomatik olarak <strong className="text-emerald-400">WebP formatına</strong> dönüştürülür ve Cloudflare Edge Anycast CDN için optimize edilir.
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Upload className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? (processStatus || "WebP'ye Dönüştürülüyor...") : "Fotoğraf Seç & WebP Yükle"}</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((imgUrl, idx) => {
            const isFeatured = imgUrl === activeFeatured;
            const isWebp = isWebPAsset(imgUrl);
            return (
              <div
                key={idx}
                className={`relative aspect-square rounded-xl overflow-hidden border transition-all group ${
                  isFeatured
                    ? "border-amber-400 ring-2 ring-amber-500/30"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Gallery Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow-md z-10">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>Vitrin</span>
                  </div>
                )}

                {/* WebP Format Pill */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono font-bold text-slate-300 border border-slate-700 backdrop-blur flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>{isWebp ? "WebP" : "Görsel"}</span>
                </div>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  {!isFeatured && (
                    <button
                      type="button"
                      onClick={() => handleSetFeatured(imgUrl)}
                      className="p-1.5 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-400 shadow"
                      title="Vitrin Görseli Yap"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Vitrin Yap</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 shadow"
                    title="Görseli Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-900/40 text-center cursor-pointer transition-colors"
        >
          <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1.5" />
          <span className="text-xs font-bold text-slate-300 block">
            Bu ürün için henüz fotoğraf seçilmedi
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Fotoğraf yüklemek için tıklayın veya sürükleyip bırakın.
          </span>
        </div>
      )}

      {/* Add via URL Accordion */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-slate-400 hover:text-amber-400 font-semibold flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? "URL Girişini Kapat" : "Harici Görsel Linki Ekle"}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://... görsel adresi yapıştırın"
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:border-amber-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
          >
            Galeriye Ekle
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
