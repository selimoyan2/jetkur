/**
 * JetKur Canonical Template Gallery & Brand Manager (Sprint 12 & 15)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * Features:
 * 1. 8 Canonical Template Cards with human-friendly Turkish titles and layout mockups.
 * 2. "JetKur Öneriyor" contextual recommendation based on customer industry.
 * 3. Real Content Instant Preview (ephemeral, zero mutations, renders with customer's real data).
 * 4. Responsive Viewport Switcher in Preview Modal (Masaüstü, Tablet, Mobil).
 * 5. One-Click Template Switch (DRAFT only, live site preserved until explicit publish).
 * 6. Content Immutability: BusinessProfile, SiteContent, BrandKit, and MediaAssets are 100% preserved.
 * 7. Accessible, zero technical jargon (no tokens, CSS, manifests, or registries shown).
 */

import React, { useState, useEffect } from "react";
import { SiteConfig } from "../../types";
import { CANONICAL_TEMPLATE_MANIFESTS, resolveTemplate } from "../../domain/templates/catalog";
import { fromLegacySiteConfig } from "../../domain/site/legacyAdapter";
import { generateCandidatePreviewHtml } from "../../domain/templates/preview";
import {
  Palette,
  Check,
  Upload,
  Eye,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  X,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface DesignBrandManagerProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  onPreview: () => void;
  readOnly?: boolean;
}

// Layout preview thumbnails representing the design signatures of the 8 canonical templates
const TEMPLATE_PREVIEW_MOCKUPS: Record<string, { badge: string; accentColor: string; layoutType: string }> = {
  "tmpl-rapid-service": { badge: "Acil & Hızlı Müdahale", accentColor: "#f59e0b", layoutType: "hero-urgent" },
  "tmpl-corporate-prestige": { badge: "Kurumsal & Güvenilir", accentColor: "#1e3a8a", layoutType: "hero-corporate" },
  "tmpl-clinical-pure": { badge: "Hijyenik & Klinik", accentColor: "#059669", layoutType: "hero-split" },
  "tmpl-modern-minimal": { badge: "Sade & Modern", accentColor: "#0f172a", layoutType: "hero-minimal" },
  "tmpl-artisan-warm": { badge: "Samimi & Usta İşi", accentColor: "#ea580c", layoutType: "hero-warm" },
  "tmpl-vip-luxury": { badge: "Lüks & Özel Hizmet", accentColor: "#b45309", layoutType: "hero-luxury" },
  "tmpl-tech-dynamic": { badge: "Teknolojik & Dinamik", accentColor: "#0284c7", layoutType: "hero-tech" },
  "tmpl-formal-legal": { badge: "Resmi & Prestijli", accentColor: "#4338ca", layoutType: "hero-formal" },
};

export const DesignBrandManager: React.FC<DesignBrandManagerProps> = ({
  config,
  onChange,
  onPreview: _onPreview,
  readOnly = false,
}) => {
  const [selectedColor, setSelectedColor] = useState(
    config.brandKit?.palette?.primary || config.colorTheme?.primary || "#f59e0b"
  );
  const [activeTab, setActiveTab] = useState<"templates" | "brand">("templates");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real Content Preview Modal state
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const activeTemplateId = config.templateId || "tmpl-rapid-service";
  const siteSector = config.sector || "hizmet";

  // When preview modal opens for a template, generate ephemeral HTML with real customer draft content
  useEffect(() => {
    if (!previewTemplateId) {
      setPreviewHtml("");
      return;
    }

    try {
      const canonicalDraft = fromLegacySiteConfig(config);
      const { html } = generateCandidatePreviewHtml(canonicalDraft, previewTemplateId);
      setPreviewHtml(html);
    } catch (err) {
      console.error("Preview generation failed:", err);
      setPreviewHtml("<h1>Önizleme yüklenemedi</h1>");
    }
  }, [previewTemplateId, config]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewTemplateId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // One-click template switch (DRAFT only, live preserved!)
  const handleApplyTemplate = (templateId: string) => {
    if (readOnly) return;

    const manifest = resolveTemplate(templateId);
    if (!manifest) return;

    const palette = manifest.designTokens?.palette || (manifest as any).defaultTokens?.color;
    const updated: SiteConfig = {
      ...config,
      templateId: manifest.id,
      theme: manifest.slug as any,
      colorTheme: {
        ...config.colorTheme,
        primary: config.brandKit?.palette?.primary || palette?.primary || "#1e3a8a",
        secondary: palette?.secondary || "#f8fafc",
        accent: palette?.accent || "#d97706",
      },
    };

    onChange(updated);
    setPreviewTemplateId(null);
    setToastMessage(`Tasarım "${manifest.name}" olarak güncellendi. Canlı siteniz siz yayınlayana kadar değişmez.`);
    setTimeout(() => setToastMessage(null), 4000);
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
    setToastMessage("Marka rengi güncellendi.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo dosya boyutu 2MB'tan küçük olmalıdır.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated: SiteConfig = {
        ...config,
        logo: dataUrl,
        brandKit: {
          ...config.brandKit,
          id: config.brandKit?.id || "brand-kit-custom",
          siteId: config.brandKit?.siteId || "site-1",
          version: 1,
          sourceColors: config.brandKit?.sourceColors || { extractedFrom: "none" },
          logo: {
            source: file.type.includes("svg") ? "svg" : "upload",
            mimeType: file.type,
            url: dataUrl,
          },
          palette: config.brandKit?.palette || {
            primary: selectedColor,
            secondary: "#1e293b",
            accent: selectedColor,
            primaryDark: "#0f172a",
            primaryLight: "#f8fafc",
            text: "#0f172a",
            textMuted: "#64748b",
            surface: "#f8fafc",
            background: "#ffffff",
            border: "#e2e8f0",
            buttonTextPrimary: "#ffffff",
            buttonTextAccent: "#ffffff",
          },
        },
      };

      onChange(updated);
      setToastMessage("Logo başarıyla yüklendi ve kurumsal kimliğinize bağlandı!");
      setTimeout(() => setToastMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const QUICK_BRAND_COLORS = [
    { label: "Kehribar Sarısı", color: "#f59e0b" },
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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "templates"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Şablon &amp; Tasarım Teması
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
          Logo &amp; Marka Rengi
        </button>
      </div>

      {/* 1. TEMPLATE GALLERY TAB */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Hazır Tasarım Şablonları</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              İşletmenizin tarzına en uygun şablonu seçin. Şablonu değiştirdiğinizde tüm metinleriniz, hizmetleriniz, fotoğraflarınız ve telefon bilgileriniz eksiksiz korunur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CANONICAL_TEMPLATE_MANIFESTS.map((tmpl) => {
              const isSelected = activeTemplateId === tmpl.id || activeTemplateId === tmpl.slug;
              const mockup = TEMPLATE_PREVIEW_MOCKUPS[tmpl.id] || {
                badge: tmpl.category,
                accentColor: "#f59e0b",
                layoutType: "hero-default",
              };
              const isRecommended =
                (tmpl.recommendedIndustries || []).some(
                  (ind) => siteSector.includes(ind) || ind.includes(siteSector)
                ) || (tmpl.id === "tmpl-rapid-service" && siteSector.includes("tesisat"));

              return (
                <div
                  key={tmpl.id}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Visual Mockup Header */}
                  <div className="relative aspect-16/10 bg-slate-900 p-4 flex flex-col justify-between overflow-hidden group">
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-200 backdrop-blur-md">
                        {mockup.badge}
                      </span>
                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          <span>Önerilen</span>
                        </span>
                      )}
                    </div>

                    {/* Stylized Abstract UI Representation */}
                    <div className="space-y-1.5 opacity-90 z-10">
                      <div className="w-16 h-2 rounded-full" style={{ backgroundColor: mockup.accentColor }} />
                      <div className="w-3/4 h-2.5 bg-white/90 rounded-sm" />
                      <div className="w-1/2 h-1.5 bg-white/40 rounded-sm" />
                      <div className="flex gap-1.5 pt-1">
                        <div
                          className="w-12 h-3.5 rounded-md flex items-center justify-center text-[7px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: mockup.accentColor }}
                        >
                          İletişim
                        </div>
                        <div className="w-12 h-3.5 rounded-md bg-white/10 border border-white/20" />
                      </div>
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-black text-slate-900 tracking-tight">{tmpl.name}</h4>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Yayında</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      {/* Instant Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateId(tmpl.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="İçeriğinizle gerçek önizleme"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Önizle</span>
                      </button>

                      {/* Use Template Action */}
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl.id)}
                        disabled={isSelected || readOnly}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs active:scale-95"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Seçili</span>
                          </>
                        ) : (
                          <span>Kullan</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. LOGO & BRAND COLOR TAB */}
      {activeTab === "brand" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">İşletme Logosu</h3>
            <p className="text-xs text-slate-500">
              Web sitenizin üst menüsünde ve alt kısmında görünecek resmi logonuzu yükleyin (PNG, JPG veya WebP).
            </p>

            <div className="flex items-center gap-5 pt-2">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-md">
                {config.logo ? (
                  <img src={config.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-3xl font-black text-amber-400">
                    {(config.companyName || "J").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {!readOnly && (
                <label className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Yeni Logo Yükle</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Brand Color Selection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Ana Marka Rengi</h3>
            <p className="text-xs text-slate-500">
              Butonlar, vurgular ve arama simgeleri bu renkle otomatik olarak uyumlu hale getirilir.
            </p>

            <div className="grid grid-cols-4 gap-3 pt-2">
              {QUICK_BRAND_COLORS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => handleColorChange(item.color)}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selectedColor.toLowerCase() === item.color.toLowerCase()
                      ? "border-slate-900 ring-2 ring-slate-900/10 bg-slate-50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-xl shadow-xs border border-black/10"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. REAL CONTENT INSTANT PREVIEW MODAL */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                  Şablon Önizleme:
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {resolveTemplate(previewTemplateId)?.name}
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                  Gerçek İçeriğinizle Canlı Gösterim
                </span>
              </div>

              {/* Viewport Controls */}
              <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    previewViewport === "desktop" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Masaüstü Görünümü"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Masaüstü</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("tablet")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    previewViewport === "tablet" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Tablet Görünümü (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    previewViewport === "mobile" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Mobil Görünüm (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Mobil</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(previewTemplateId)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Bu Tasarımı Kullan</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewTemplateId(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                  title="Önizlemeyi Kapat (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Content Area */}
            <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-hidden">
              <div
                className={`h-full transition-all duration-300 bg-white rounded-2xl overflow-hidden shadow-2xl ${
                  previewViewport === "desktop"
                    ? "w-full"
                    : previewViewport === "tablet"
                    ? "w-[768px]"
                    : "w-[375px]"
                }`}
              >
                {previewHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    title="Şablon Önizleme"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Sparkles className="w-6 h-6 animate-spin text-amber-500" />
                    <span className="text-xs">Önizleme hazırlanıyor...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
