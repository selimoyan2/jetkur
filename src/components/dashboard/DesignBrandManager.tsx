/**
 * JetKur Canonical Design & Brand Manager Component (Sprint 12)
 *
 * Core Product Principle:
 * "Tasarım basittir: Şablon seçimi, Logo ve Marka Rengi.
 * Müşteriye 10 renkli palet editörü, CSS değişkenleri veya token denetçisi gösterilmez."
 *
 * Architecture:
 * - Displays 8 canonical templates from CANONICAL_TEMPLATE_MANIFESTS
 * - Uses human-friendly names (never shows internal IDs like "tmpl-rapid-service")
 * - Switching template preserves customer BusinessProfile, SiteContent, and BrandKit
 * - Logo upload (<2MB limit) & Brand Color selection (integrated with Sprint 10 BrandKit)
 */

import React, { useState } from "react";
import { SiteConfig } from "../../types";
import { CANONICAL_TEMPLATE_MANIFESTS } from "../../domain/templates/catalog";
import { switchTemplate } from "../../domain/templates/switcher";
import { resolveTemplate } from "../../domain/templates/catalog";
import {
  Palette,
  Check,
  Upload,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface DesignBrandManagerProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  onPreview: () => void;
  readOnly?: boolean;
}

export const DesignBrandManager: React.FC<DesignBrandManagerProps> = ({
  config,
  onChange,
  onPreview,
  readOnly = false,
}) => {
  const [selectedColor, setSelectedColor] = useState(
    config.brandKit?.palette?.primary || config.colorTheme?.primary || "#f59e0b"
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    config.brandKit?.logo?.dataUrl || config.logo || null
  );
  const [activeTab, setActiveTab] = useState<"templates" | "brand">("templates");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active template ID (mapped from config.templateId or active design)
  const activeTemplateId = config.templateId || "tmpl-rapid-service";

  const handleSelectTemplate = (templateId: string) => {
    if (readOnly) return;
    try {
      const canonicalManifest = resolveTemplate(templateId);
      if (!canonicalManifest) return;

      const palette = canonicalManifest.designTokens?.palette || (canonicalManifest as any).defaultTokens?.color;
      const updated: SiteConfig = {
        ...config,
        templateId: canonicalManifest.id,
        theme: canonicalManifest.slug as any,
        colorTheme: {
          ...config.colorTheme,
          primary: palette?.primary || config.colorTheme?.primary || "#1e3a8a",
          secondary: palette?.secondary || config.colorTheme?.secondary || "#f8fafc",
          accent: palette?.accent || config.colorTheme?.accent || "#d97706",
        },
      };

      onChange(updated);
      setToastMessage(`Tasarım şablonu "${canonicalManifest.name}" olarak güncellendi!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Template switch failed:", err);
    }
  };

  const handleColorChange = (newColor: string) => {
    if (readOnly) return;
    setSelectedColor(newColor);

    const updated: SiteConfig = {
      ...config,
      colorTheme: {
        ...config.colorTheme,
        primary: newColor,
      },
      brandKit: config.brandKit
        ? {
            ...config.brandKit,
            palette: {
              ...config.brandKit.palette,
              primary: newColor,
            },
          }
        : undefined,
    };

    onChange(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Max 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo dosyası 2 MB boyutunu aşamaz.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);

      const updated: SiteConfig = {
        ...config,
        logo: dataUrl,
        brandKit: {
          id: config.brandKit?.id || `brand-${Date.now()}`,
          workspaceId: config.brandKit?.workspaceId || "ws-default",
          siteId: config.id || "site-default",
          logo: {
            sourceType: file.type.includes("svg") ? "SVG_UPLOAD" : "RASTER_UPLOAD",
            mimeType: file.type as any,
            dataUrl,
            fileName: file.name,
            fileSizeBytes: file.size,
          },
          palette: config.brandKit?.palette || {
            primary: selectedColor,
            secondary: "#1e293b",
            accent: selectedColor,
            neutralDark: "#0f172a",
            neutralLight: "#f8fafc",
            background: "#ffffff",
            surface: "#f1f5f9",
          },
          status: "READY",
          createdAt: config.brandKit?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      onChange(updated);
      setToastMessage("Logo başarıyla yüklendi ve kurumsal kimliğinize bağlandı!");
      setTimeout(() => setToastMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Popular curated brand colors for quick selection
  const QUICK_BRAND_COLORS = [
    { label: "Kehribar / Sarı", color: "#f59e0b" },
    { label: "Ateş Turuncusu", color: "#ea580c" },
    { label: "Kurumsal Lacivert", color: "#1e3a8a" },
    { label: "Kraliyet Mavisi", color: "#2563eb" },
    { label: "Klinik Zümrüt", color: "#059669" },
    { label: "Tıbbi Turkuaz", color: "#0d9488" },
    { label: "Prestij Bordo", color: "#991b1b" },
    { label: "Lüks Antrasit", color: "#334155" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "templates"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Şablon & Tasarım Teması
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("brand")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "brand"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Logo & Marka Rengi
        </button>
      </div>

      {/* 1. TEMPLATE SELECTION */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Hazır Tasarım Şablonları</h3>
            <p className="text-xs text-slate-500 mt-1">
              İşletmenizin sektörüne ve tarzına en uygun profesyonel şablonu seçin. Şablonu değiştirdiğinizde girdiğiniz tüm metinler, hizmetler ve iletişim bilgileri korunur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CANONICAL_TEMPLATE_MANIFESTS.map((tmpl) => {
              const isSelected = activeTemplateId === tmpl.id || activeTemplateId === tmpl.slug;

              return (
                <div
                  key={tmpl.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        {tmpl.category}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                          <Check className="w-3.5 h-3.5" />
                          Aktif Şablon
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900">{tmpl.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {tmpl.description}
                      </p>
                    </div>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Varsayılan Renkler:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-200 shadow-2xs"
                          style={{ backgroundColor: tmpl.designTokens?.palette?.primary || (tmpl as any).defaultTokens?.color?.primary || "#1e3a8a" }}
                          title="Ana Renk"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-200 shadow-2xs"
                          style={{ backgroundColor: tmpl.designTokens?.palette?.secondary || (tmpl as any).defaultTokens?.color?.secondary || "#f8fafc" }}
                          title="İkincil Renk"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-200 shadow-2xs"
                          style={{ backgroundColor: tmpl.designTokens?.palette?.accent || (tmpl as any).defaultTokens?.color?.accent || "#d97706" }}
                          title="Vurgu Rengi"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onPreview}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Önizle</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {!isSelected && !readOnly && (
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Bu Şablonu Kullan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. LOGO & BRAND COLOR */}
      {activeTab === "brand" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">İşletme Logosu</h3>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              {logoPreview ? (
                <div className="space-y-2 text-center">
                  <div className="w-24 h-24 mx-auto p-2 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs">
                    <img
                      src={logoPreview}
                      alt="İşletme Logosu"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Mevcut Logo Yüklendi</p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Logo dosyasını seçin</p>
                  <p className="text-[10px] text-slate-400">PNG, JPG veya SVG (Maks. 2 MB)</p>
                </div>
              )}

              {!readOnly && (
                <div>
                  <label className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{logoPreview ? "Logoyu Değiştir" : "Logo Dosyası Yükle"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Brand Color Picker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Kurumsal Marka Rengi</h3>
            </div>

            <p className="text-xs text-slate-500">
              Web sitenizdeki butonlar, başlık vurguları ve simgeler bu renkle otomatik olarak uyumlu hale getirilir.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {QUICK_BRAND_COLORS.map((item) => {
                const isCurrent = selectedColor.toLowerCase() === item.color.toLowerCase();

                return (
                  <button
                    key={item.color}
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleColorChange(item.color)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isCurrent
                        ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-5 h-5 rounded-full border border-slate-200 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      />
                      {isCurrent && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color Picker */}
            {!readOnly && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700">Özel Renk Kodu:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-24 px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono text-center font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
