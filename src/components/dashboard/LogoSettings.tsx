import React, { useRef, useState } from "react";
import { HeaderConfig } from "../../types";
import { Image as ImageIcon, Upload, Trash2, Sliders, Check, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { processLogoFile } from "../../utils/logoUploadHelper";

interface LogoSettingsProps {
  header: HeaderConfig;
  companyName: string;
  onChange: (updatedHeader: HeaderConfig) => void;
  onOpenAssetManager?: () => void;
  onLogoUploaded?: (dataUrl: string) => void;
}

export const LogoSettings: React.FC<LogoSettingsProps> = ({
  header,
  companyName,
  onChange,
  onOpenAssetManager,
  onLogoUploaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "transparent">("dark");

  const logoType = header.logoType || "icon";
  const logoImage = header.logoImage || "";
  const logoHeight = header.logoHeight || 44;
  const logoWidth = header.logoWidth || 0;
  const logoAspectRatio = header.logoAspectRatio || "auto";
  const logoObjectFit = header.logoObjectFit || "contain";

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setToastMessage(null);
    try {
      const result = await processLogoFile(file, {
        maxDimension: 1200,
        quality: 0.92
      });

      if (!result.success || !result.dataUrl) {
        showToast("error", result.errorMessage || "Logo yüklenemedi. Lütfen geçerli bir dosya seçin.");
        return;
      }

      onChange({
        ...header,
        logoType: "image",
        logoImage: result.dataUrl,
      });

      if (onLogoUploaded) {
        onLogoUploaded(result.dataUrl);
      }

      const savings = result.savingsPercentage && result.savingsPercentage > 0 ? ` (%${result.savingsPercentage} tasarruf)` : "";
      showToast("success", `✅ "${result.fileName || "Logo"}" başarıyla yüklendi ve optimize edildi${savings}!`);
    } catch (err: any) {
      showToast("error", `Logo işleme hatası: ${err?.message || "Bilinmeyen hata"}`);
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Logo & Marka Kimliği Yönetimi
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Bilgisayarınızdan logo yükleyin, en-boy oranını ve boyutlarını anında ayarlayın.
          </p>
        </div>

        {/* Logo Format Selector & Central Studio Shortcut */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onOpenAssetManager && (
            <button
              type="button"
              onClick={onOpenAssetManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Varlık Yönetimi & AI</span>
            </button>
          )}

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onChange({ ...header, logoType: "image" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                logoType === "image"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Görsel Logo (PNG / SVG)
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...header, logoType: "icon" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                logoType === "icon"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Stil İkon + Metin
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="logo-settings-inline-toast"
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {logoType === "image" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload Box & URL Input */}
          <div className="lg:col-span-7 space-y-4">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-amber-400 bg-amber-500/10"
                  : "border-slate-700 hover:border-slate-600 bg-slate-950/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                disabled={isProcessing}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  {isProcessing ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isProcessing ? "Logo İşleniyor & Optimize Ediliyor..." : "Logo Dosyası Yüklemek İçin Tıklayın veya Sürükleyin"}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    PNG (Şeffaf Arka Planlı), SVG, JPG veya WebP • Max 10MB
                  </span>
                </div>
              </div>
            </div>

            {/* URL Input Alternative */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Veya Doğrudan Logo Görsel URL'si Girin
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoImage}
                  onChange={(e) => onChange({ ...header, logoImage: e.target.value })}
                  placeholder="https://.../logo.png"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono"
                />
                {logoImage && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...header, logoImage: "" })}
                    className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors"
                    title="Logoyu Temizle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Dimension Controls & Aspect Ratio */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Boyutlandırma & En-Boy Oranı Ayarları
                </span>
                <button
                  type="button"
                  onClick={() => onChange({
                    ...header,
                    logoHeight: 44,
                    logoWidth: 0,
                    logoAspectRatio: "auto",
                    logoObjectFit: "contain"
                  })}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sıfırla
                </button>
              </div>

              {/* Height Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Logo Yüksekliği (Height):</span>
                  <span className="font-mono font-bold text-amber-400">{logoHeight}px</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={100}
                  step={2}
                  value={logoHeight}
                  onChange={(e) => onChange({ ...header, logoHeight: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>24px (Kompakt)</span>
                  <span>44px (Standart)</span>
                  <span>100px (Büyük)</span>
                </div>
              </div>

              {/* Width Slider (0 = Auto) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Logo Maksimum Genişliği (Width):</span>
                  <span className="font-mono font-bold text-amber-400">
                    {logoWidth === 0 ? "Otomatik (Orantılı)" : `${logoWidth}px`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={300}
                  step={10}
                  value={logoWidth}
                  onChange={(e) => onChange({ ...header, logoWidth: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Otomatik</span>
                  <span>150px</span>
                  <span>300px</span>
                </div>
              </div>

              {/* Aspect Ratio & Object Fit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    En-Boy Oranı (Aspect Ratio)
                  </label>
                  <select
                    value={logoAspectRatio}
                    onChange={(e) => onChange({ ...header, logoAspectRatio: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="auto">Otomatik (Doğal Oran)</option>
                    <option value="1/1">1:1 (Kare Logo / Amblem)</option>
                    <option value="16/9">16:9 (Geniş Dikdörtgen)</option>
                    <option value="3/1">3:1 (Yatay Kurumsal Logo)</option>
                    <option value="4/1">4:1 (İnce Uzun Banner Logo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Sığdırma Modu (Object Fit)
                  </label>
                  <select
                    value={logoObjectFit}
                    onChange={(e) => onChange({ ...header, logoObjectFit: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="contain">Orantılı Sığdır (Contain - Önerilen)</option>
                    <option value="cover">Alana Yay & Kırp (Cover)</option>
                    <option value="scale-down">Orantıyı Koru & Küçült (Scale-down)</option>
                  </select>
                </div>
              </div>

              {/* Show Text Alongside Logo Toggle */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">
                    Logo Yanında Firma Adı & Sektör Metnini Göster
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Kapalı tutulursa yalnızca yüklenen logo görseli görünür (Önerilen).
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={header.showTextAlongsideLogo === true}
                    onChange={(e) => onChange({ ...header, showTextAlongsideLogo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Logo Preview Box */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Canlı Logo Önizlemesi
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewBg("dark")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    previewBg === "dark" ? "bg-slate-800 text-white" : "text-slate-500"
                  }`}
                >
                  Koyu
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("light")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    previewBg === "light" ? "bg-slate-200 text-slate-900" : "text-slate-500"
                  }`}
                >
                  Açık
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("transparent")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    previewBg === "transparent" ? "bg-amber-500 text-slate-950" : "text-slate-500"
                  }`}
                >
                  Şeffaf
                </button>
              </div>
            </div>

            <div
              className={`flex-1 min-h-[220px] rounded-2xl border flex flex-col items-center justify-center p-6 transition-all ${
                previewBg === "dark"
                  ? "bg-slate-950 border-slate-800"
                  : previewBg === "light"
                  ? "bg-slate-100 border-slate-300"
                  : "bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px] bg-slate-900 border-slate-800"
              }`}
            >
              {logoImage ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={logoImage}
                    alt={companyName}
                    style={{
                      height: `${logoHeight}px`,
                      width: logoWidth ? `${logoWidth}px` : "auto",
                      maxWidth: "100%",
                      aspectRatio: logoAspectRatio !== "auto" ? logoAspectRatio : undefined,
                      objectFit: logoObjectFit,
                    }}
                    className="transition-all duration-200"
                  />
                  <div className="text-[11px] font-mono text-slate-500 text-center">
                    {logoHeight}px yükseklik • {logoWidth === 0 ? "Oto genişlik" : `${logoWidth}px`}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 text-slate-500">
                  <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">Henüz logo yüklenmedi.</p>
                  <p className="text-[11px] text-slate-600">
                    Sol taraftan bir dosya seçtiğinizde burada anında önizlenecektir.
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              💡 <strong>İpucu:</strong> Header menüsünde logonuz otomatik olarak optimize edilir ve 0.02s statik HTML çıktısında direkt inline/CDN üzerinden servis edilir.
            </div>
          </div>
        </div>
      ) : (
        /* Icon + Text Logo Option */
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
              {companyName.charAt(0) || "⚡"}
            </div>
            <div>
              <span className="text-sm font-bold text-white block">{companyName}</span>
              <span className="text-xs text-slate-400 block">
                Ultra Hızlı SVG Tipografik Marka Amblemi (Sıfır Yükleme Süresi)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Görsel dosya yüklemek istemiyorsanız bu mod, firma adınızın ilk harfiyle modern bir amblem oluşturur. Sayfa yüklenme hızını maksimuma çıkarır.
          </p>
        </div>
      )}
    </div>
  );
};
