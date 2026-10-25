/**
 * JetKur Premium Theme Studio & Brand Manager (Theme Foundation 02D)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * Capabilities:
 * 1. 12 Sektörel + 8 Çekirdek (Toplam 20) Hazır Tasarım Şablonu & Sektör Filtreleme.
 * 2. JetKur Akıllı Tasarım Öneri Motoru (Gerekçe ve dönüşüm vaadiyle akıllı paket önerisi).
 * 3. 16 Profesyonel Renk Paleti (WCAG 2.1 AA kontrast denetimi, özel HEX girişi ve marka rengine dönüş).
 * 4. Arka Plan & Gradyan Stüdyosu (6 usta gradyan hazır seti, düz renk, dokular, opaklık ayarı).
 * 5. Tipografi Stüdyosu (Corporate Sans, Modern Minimal, Elegant Serif, Premium Editorial & Türkçe karakter testi).
 * 6. Layout & Bileşen Varyantları (Header, Footer, Hizmet Kartı seçicileri).
 * 7. Gerçek Müşteri İçeriğiyle Canlı Önizleme (Masaüstü, Tablet 768px, Mobil 375px).
 * 8. Katı Öncelik Sırası: Özel Kullanıcı Seçimi > BrandKit > Şablon Varsayılanı.
 * 9. İçerik Dokunulmazlığı: Şablon değiştiğinde hiçbir müşteri verisi silinmez veya uydurulmaz.
 */

import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig } from "../../types";
import {
  ALL_TEMPLATE_MANIFESTS,
  resolveTemplate,
} from "../../domain/templates/catalog";
import {
  fromLegacySiteConfig,
  resolveCanonicalManifestForLegacy,
} from "../../domain/site/legacyAdapter";
import { generateCandidatePreviewHtml } from "../../domain/templates/preview";
import {
  extractLogoColors,
  ExtractedBrandPalette,
  createBrandKit,
  resolveDesignTokens,
  darkenColor,
  normalizeHexColor,
  PREMIUM_PALETTES,
  getPaletteById,
  createCustomPaletteFromHex,
  auditPaletteWcagContrast,
  PremiumPaletteTokens,
  GRADIENT_PRESETS,
  TYPOGRAPHY_PRESETS,
  getTypographyPresetById,
  recommendDesignPackages,
  DesignPackageRecommendation,
} from "../../domain/brand";
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
  AlertCircle,
  Loader2,
  Sliders,
  Type,
  Layers,
  Paintbrush,
  RefreshCw,
} from "lucide-react";

interface DesignBrandManagerProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  onPreview: () => void;
  readOnly?: boolean;
}

const SECTOR_FILTERS = [
  { id: "all", label: "Tüm Şablonlar" },
  { id: "plumbing", label: "Sıhhi Tesisat" },
  { id: "climate", label: "Kombi & Klima" },
  { id: "towing", label: "Oto Kurtarma" },
  { id: "electrical", label: "Elektrikçi" },
  { id: "dental", label: "Diş & Sağlık" },
  { id: "legal", label: "Hukuk & Avukat" },
  { id: "real-estate", label: "Gayrimenkul" },
  { id: "beauty", label: "Güzellik & Spa" },
  { id: "hotel", label: "Otel & Konaklama" },
  { id: "restaurant", label: "Restoran & Kafe" },
  { id: "construction", label: "İnşaat & Mimarlık" },
  { id: "consulting", label: "Danışmanlık & B2B" },
];

export const DesignBrandManager: React.FC<DesignBrandManagerProps> = ({
  config,
  onChange,
  onPreview: _onPreview,
  readOnly = false,
}) => {
  const activeManifest = resolveCanonicalManifestForLegacy(config);
  const activeTemplateId = activeManifest.id;
  const siteSector = config.sector || "hizmet";

  const effectivePrimaryColor =
    (config as any).designTemplate?.customTokens?.palette?.primary ||
    config.brandKit?.palette?.primary ||
    config.colorTheme?.primary ||
    config.palette?.primary ||
    activeManifest.designTokens.palette.primary ||
    "#1e3a8a";

  const [selectedColor, setSelectedColor] = useState(effectivePrimaryColor);
  const [customHexInput, setCustomHexInput] = useState(effectivePrimaryColor);
  const [activeTab, setActiveTab] = useState<
    "templates" | "palettes" | "backgrounds" | "typography" | "layout" | "brand"
  >("templates");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [extractedPalette, setExtractedPalette] = useState<ExtractedBrandPalette | null>(null);
  const [isColorExtracting, setIsColorExtracting] = useState(false);

  // Real Content Preview Modal state
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewHtml, setPreviewHtml] = useState<string>("");

  useEffect(() => {
    setSelectedColor(effectivePrimaryColor);
    setCustomHexInput(effectivePrimaryColor);
  }, [effectivePrimaryColor]);

  // Smart design recommendations based on sector and BrandKit
  const smartRecommendations = useMemo<readonly DesignPackageRecommendation[]>(() => {
    return recommendDesignPackages(siteSector, config.brandKit);
  }, [siteSector, config.brandKit]);

  const topRecommendation = smartRecommendations[0];

  // Filter templates by sector
  const filteredTemplates = useMemo(() => {
    if (sectorFilter === "all") return ALL_TEMPLATE_MANIFESTS;
    return ALL_TEMPLATE_MANIFESTS.filter((t) => {
      const rec = t.recommendedIndustries || [];
      const tags = t.tags || [];
      return (
        rec.some((ind) => ind.includes(sectorFilter) || sectorFilter.includes(ind)) ||
        tags.some((tag) => tag.includes(sectorFilter)) ||
        t.id.includes(sectorFilter)
      );
    });
  }, [sectorFilter]);

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

    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens;
    const brandKit = config.brandKit || canonicalCurrent.brandKit;

    const resolvedTokens = resolveDesignTokens(
      manifest.designTokens,
      brandKit,
      existingCustomTokens
    );
    const resolvedPalette = resolvedTokens.palette;
    const hasExplicitPaletteOverride = Boolean(
      existingCustomTokens?.palette && Object.keys(existingCustomTokens.palette).length > 0
    );
    const resolvedPaletteId = hasExplicitPaletteOverride
      ? "custom-override"
      : brandKit
      ? brandKit.id || "palette-brand-kit"
      : manifest.id;

    const updated: SiteConfig = {
      ...config,
      templateId: manifest.id,
      theme: manifest.slug as any,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        ...(existingCustomTokens ? { customTokens: existingCustomTokens } : {}),
        sectionVariants: {
          ...manifest.sectionRecipe,
        },
      },
      palette: {
        ...(config.palette || { name: manifest.name }),
        id: resolvedPaletteId,
        name: hasExplicitPaletteOverride
          ? "Özel Renk Paleti"
          : brandKit
          ? "Logodan Çıkarılan Marka Paleti"
          : manifest.name,
        primary: resolvedPalette.primary,
        primaryDark: resolvedPalette.primaryDark,
        secondary: resolvedPalette.secondary,
        accent: resolvedPalette.accent,
        bg: resolvedPalette.background,
        text: resolvedPalette.text,
      },
      colorTheme: {
        ...config.colorTheme,
        id: resolvedPaletteId,
        name: manifest.name,
        primary: resolvedPalette.primary,
        secondary: resolvedPalette.secondary,
        accent: resolvedPalette.accent,
        fontFamily: resolvedTokens.typography.fontHeading,
        palette: {
          ...(config.colorTheme?.palette || {}),
          primary: resolvedPalette.primary,
          primaryDark: resolvedPalette.primaryDark,
          secondary: resolvedPalette.secondary,
          accent: resolvedPalette.accent,
          text: resolvedPalette.text,
          textMuted: resolvedPalette.textMuted,
          surface: resolvedPalette.surface,
          border: resolvedPalette.border,
        },
      },
    } as SiteConfig;

    onChange(updated);
    setPreviewTemplateId(null);
    setToastMessage(`Tasarım "${manifest.name}" olarak güncellendi. Tüm içerikleriniz eksiksiz korundu.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Applies Smart Recommendation package (Template + Palette + Typography)
  const handleApplySmartRecommendation = (rec: DesignPackageRecommendation) => {
    if (readOnly) return;
    const manifest = resolveTemplate(rec.templateId);
    if (!manifest) return;

    const pal = getPaletteById(rec.paletteId);
    const typo = getTypographyPresetById(rec.typographyId as any);

    const canonicalCurrent = fromLegacySiteConfig(config);
    const nextCustomTokens = {
      ...(canonicalCurrent.designTemplate?.customTokens || {}),
      palette: {
        primary: pal.primary,
        primaryDark: pal.primaryDark,
        secondary: pal.secondary,
        accent: pal.accent,
        background: pal.background,
        surface: pal.surface,
        border: pal.border,
        text: pal.text,
        textMuted: pal.textMuted,
      },
      typography: {
        fontHeading: typo.fontHeading,
        fontBody: typo.fontBody,
        headingWeight: typo.headingWeight,
        baseFontSize: "16px" as const,
      },
      header: {
        layout: rec.headerVariant as any,
      },
      footer: {
        layout: rec.footerVariant as any,
      },
    };

    const resolvedTokens = resolveDesignTokens(
      manifest.designTokens,
      config.brandKit,
      nextCustomTokens
    );

    const updated: SiteConfig = {
      ...config,
      templateId: manifest.id,
      theme: manifest.slug as any,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: nextCustomTokens,
        sectionVariants: {
          ...manifest.sectionRecipe,
          header: rec.headerVariant,
          footer: rec.footerVariant,
        },
      },
      palette: {
        ...(config.palette || { name: pal.name }),
        id: pal.id,
        name: pal.name,
        primary: resolvedTokens.palette.primary,
        primaryDark: resolvedTokens.palette.primaryDark,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        bg: resolvedTokens.palette.background,
        text: resolvedTokens.palette.text,
      },
      fontFamily: typo.fontHeading,
    } as SiteConfig;

    onChange(updated);
    setSelectedColor(pal.primary);
    setToastMessage(`JetKur akıllı önerisi uygulandı: ${rec.templateName} (${pal.name})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Applies one of the 16 Premium Palettes
  const handleApplyPremiumPalette = (pal: PremiumPaletteTokens) => {
    if (readOnly) return;
    setSelectedColor(pal.primary);
    setCustomHexInput(pal.primary);

    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const nextCustomTokens = {
      ...existingCustomTokens,
      palette: {
        ...(existingCustomTokens.palette || {}),
        primary: pal.primary,
        primaryDark: pal.primaryDark,
        secondary: pal.secondary,
        accent: pal.accent,
        background: pal.background,
        surface: pal.surface,
        border: pal.border,
        text: pal.text,
        textMuted: pal.textMuted,
      },
    };

    const resolvedTokens = resolveDesignTokens(
      manifest.designTokens,
      config.brandKit,
      nextCustomTokens
    );

    const updated: SiteConfig = {
      ...config,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: nextCustomTokens,
        sectionVariants: {
          ...manifest.sectionRecipe,
          ...((config as any).designTemplate?.sectionVariants || {}),
        },
      },
      palette: {
        ...(config.palette || { name: pal.name }),
        id: pal.id,
        name: pal.name,
        primary: resolvedTokens.palette.primary,
        primaryDark: resolvedTokens.palette.primaryDark,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        bg: resolvedTokens.palette.background,
        text: resolvedTokens.palette.text,
      },
      colorTheme: {
        ...config.colorTheme,
        id: pal.id,
        name: pal.name,
        primary: resolvedTokens.palette.primary,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        palette: {
          ...(config.colorTheme?.palette || {}),
          primary: resolvedTokens.palette.primary,
          primaryDark: resolvedTokens.palette.primaryDark,
          secondary: resolvedTokens.palette.secondary,
          accent: resolvedTokens.palette.accent,
          text: resolvedTokens.palette.text,
          textMuted: resolvedTokens.palette.textMuted,
          surface: resolvedTokens.palette.surface,
          border: resolvedTokens.palette.border,
        },
      },
    } as SiteConfig;

    onChange(updated);
    setToastMessage(`Renk paleti "${pal.name}" olarak ayarlandı.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Explicit user color override via Custom HEX
  const handleApplyCustomHex = (hex: string) => {
    if (readOnly) return;
    const normalized = normalizeHexColor(hex);
    if (!normalized) {
      setToastMessage("Geçerli bir HEX renk kodu giriniz (Örn: #1E40AF).");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const customPal = createCustomPaletteFromHex(normalized);
    handleApplyPremiumPalette(customPal);
  };

  // Applies Typography Preset
  const handleApplyTypography = (typoId: string) => {
    if (readOnly) return;
    const typo = getTypographyPresetById(typoId as any);
    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const nextCustomTokens = {
      ...existingCustomTokens,
      typography: {
        fontHeading: typo.fontHeading,
        fontBody: typo.fontBody,
        headingWeight: typo.headingWeight,
        baseFontSize: "16px" as const,
      },
    };

    const updated: SiteConfig = {
      ...config,
      fontFamily: typo.fontHeading,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: nextCustomTokens,
      },
    } as SiteConfig;

    onChange(updated);
    setToastMessage(`Tipografi "${typo.name}" olarak ayarlandı.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Applies Header / Footer / Card variant layout
  const handleApplyLayoutVariant = (section: "header" | "footer" | "services", variant: string) => {
    if (readOnly) return;
    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingVariants = canonicalCurrent.designTemplate?.sectionVariants || manifest.sectionRecipe;

    const nextVariants = {
      ...existingVariants,
      [section]: variant,
    };

    const updated: SiteConfig = {
      ...config,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        sectionVariants: nextVariants,
      },
    } as SiteConfig;

    onChange(updated);
    setToastMessage(`${section.toUpperCase()} düzeni "${variant}" olarak güncellendi.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Restores BrandKit logo palette (Priority 2) by removing custom palette overrides
  const handleRestoreBrandKit = () => {
    if (readOnly) return;
    if (!config.brandKit?.palette) {
      setToastMessage("Kayıtlı bir logo marka paleti bulunamadı.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const brandPrimary = config.brandKit.palette.primary;
    setSelectedColor(brandPrimary);

    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const nextCustomTokens = {
      ...existingCustomTokens,
      palette: undefined, // Clears Priority 3 override so BrandKit rules Priority 2
    };

    const resolvedTokens = resolveDesignTokens(
      manifest.designTokens,
      config.brandKit,
      nextCustomTokens
    );

    const updated: SiteConfig = {
      ...config,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: nextCustomTokens,
      },
      palette: {
        ...(config.palette || { name: "Marka Paleti" }),
        id: "brand-kit-restored",
        name: "Logodan Çıkarılan Marka Paleti",
        primary: resolvedTokens.palette.primary,
        primaryDark: resolvedTokens.palette.primaryDark,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        bg: resolvedTokens.palette.background,
        text: resolvedTokens.palette.text,
      },
    } as SiteConfig;

    onChange(updated);
    setToastMessage("Logo marka renkleriniz başarıyla geri yüklendi!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Applies the logo-extracted BrandKit palette at Priority 2
  const handleApplyExtractedBrandPalette = (
    extracted: ExtractedBrandPalette,
    baseConfig: SiteConfig = config,
    logoOverride?: { dataUrl: string; mimeType: string; svgContent?: string }
  ) => {
    if (readOnly) return;
    const manifest = resolveCanonicalManifestForLegacy(baseConfig);
    const canonicalCurrent = fromLegacySiteConfig(baseConfig);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens;

    const cleanedCustomTokens = existingCustomTokens
      ? {
          ...existingCustomTokens,
          palette: undefined,
        }
      : undefined;

    const newBrandKit = createBrandKit({
      siteId: (baseConfig as any).siteId || baseConfig.id || "site-1",
      logoInput: logoOverride
        ? {
            sourceType: logoOverride.mimeType.includes("svg") ? "svg" : "upload",
            url: logoOverride.dataUrl,
            svgContent: logoOverride.svgContent,
            mimeType: logoOverride.mimeType,
          }
        : baseConfig.brandKit?.logo
        ? {
            sourceType: baseConfig.brandKit.logo.source,
            url: baseConfig.brandKit.logo.url,
            svgContent: baseConfig.brandKit.logo.svgContent,
            mimeType: baseConfig.brandKit.logo.mimeType,
          }
        : undefined,
      preferredPrimary: extracted.primary,
      preferredAccent: extracted.accent,
      fallbackTemplateTokens: manifest.designTokens,
    });

    const resolvedTokens = resolveDesignTokens(
      manifest.designTokens,
      newBrandKit,
      cleanedCustomTokens
    );

    setSelectedColor(resolvedTokens.palette.primary);

    const logoDataUrl = logoOverride?.dataUrl || baseConfig.logo || (baseConfig as any).logoUrl;

    const updated: SiteConfig = {
      ...baseConfig,
      ...(logoDataUrl
        ? {
            logo: logoDataUrl,
            logoUrl: logoDataUrl,
            header: {
              ...baseConfig.header,
              logoType: "image",
              logoImage: logoDataUrl,
            },
          }
        : {}),
      brandKit: newBrandKit,
      designTemplate: {
        ...((baseConfig as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: cleanedCustomTokens,
        sectionVariants: {
          ...manifest.sectionRecipe,
        },
      },
      palette: {
        ...(baseConfig.palette || { name: "Marka Paleti" }),
        id: newBrandKit.id,
        name: "Logodan Çıkarılan Marka Paleti",
        primary: resolvedTokens.palette.primary,
        primaryDark: resolvedTokens.palette.primaryDark,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        bg: resolvedTokens.palette.background,
        text: resolvedTokens.palette.text,
      },
    } as SiteConfig;

    onChange(updated);
    setToastMessage("Logodan çıkarılan marka paleti sitenize uygulandı!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToastMessage("Logo dosya boyutu 2MB'tan küçük olmalıdır.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const isSvg = file.type === "image/svg+xml" || file.name.endsWith(".svg");
    const reader = new FileReader();

    if (isSvg) {
      reader.onload = async (event) => {
        const svgText = event.target?.result as string;
        const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
        setIsColorExtracting(true);
        try {
          const result = await extractLogoColors({
            svgContent: svgText,
            mimeType: "image/svg+xml",
            fileName: file.name,
          });
          setExtractedPalette(result);
          if (result.isExtracted && result.primary) {
            handleApplyExtractedBrandPalette(result, config, {
              dataUrl,
              mimeType: "image/svg+xml",
              svgContent: svgText,
            });
          }
        } catch (err) {
          console.error("Logo analizi hatası:", err);
        } finally {
          setIsColorExtracting(false);
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setIsColorExtracting(true);
        try {
          const result = await extractLogoColors({
            dataUrl,
            mimeType: file.type || "image/png",
            fileName: file.name,
          });
          setExtractedPalette(result);
          if (result.isExtracted && result.primary) {
            handleApplyExtractedBrandPalette(result, config, {
              dataUrl,
              mimeType: file.type || "image/png",
            });
          }
        } catch (err) {
          console.error("Logo analizi hatası:", err);
        } finally {
          setIsColorExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* JetKur Theme Studio Header & Tab Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Paintbrush className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Premium Theme Studio</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            İşletmenizin sektörüne en uygun tasarımı seçin, renklerinizi ve tipografinizi anında özelleştirin.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "templates"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Şablonlar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("palettes")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "palettes"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>16 Renk Paleti</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("backgrounds")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "backgrounds"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Arka Plan &amp; Gradyan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "typography"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Tipografi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("layout")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "layout"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Bileşenler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("brand")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "brand"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Logo &amp; Kimlik</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TEMPLATES & SECTORS TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* JetKur Smart Design Recommendation Banner */}
          {topRecommendation && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <span className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      JetKur Akıllı Önerisi ({siteSector})
                    </span>
                    <span className="text-xs font-bold text-slate-600">%98 Eşleşme</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">{topRecommendation.templateName}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-xl">{topRecommendation.rationale}</p>
                </div>
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleApplySmartRecommendation(topRecommendation)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Önerilen Paketi Uygula
                </button>
              )}
            </div>
          )}

          {/* Sector Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {SECTOR_FILTERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSectorFilter(s.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  sectorFilter === s.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((tmpl) => {
              const isSelected = activeTemplateId === tmpl.id || activeTemplateId === tmpl.slug;
              const isTopPick = tmpl.id === topRecommendation?.templateId;

              return (
                <div
                  key={tmpl.id}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="relative aspect-16/10 bg-slate-900 p-4 flex flex-col justify-between overflow-hidden">
                    {tmpl.previewImageUrl && (
                      <img
                        src={tmpl.previewImageUrl}
                        alt={tmpl.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-white backdrop-blur-md">
                        {tmpl.category}
                      </span>
                      {isTopPick && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          <span>Önerilen</span>
                        </span>
                      )}
                    </div>

                    <div className="z-10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tmpl.designTokens.palette.primary }}
                        />
                        <span className="text-[11px] font-bold text-slate-300 truncate">
                          {tmpl.designTokens.typography.fontHeading}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{tmpl.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{tmpl.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateId(tmpl.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Canlı İncele</span>
                      </button>

                      {isSelected ? (
                        <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        !readOnly && (
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate(tmpl.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Seç
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 16 PREMIUM COLOR PALETTES TAB                                          */}
      {/* ========================================================================= */}
      {activeTab === "palettes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">16 Profesyonel Renk Paleti</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Tüm renk paletleri WCAG 2.1 AA kontrast kurallarına tam uyumludur. Dilerseniz hazır paletlerden seçin veya işletmenizin özel HEX kodunu girin.
              </p>
            </div>

            {config.brandKit?.palette?.primary && (
              <button
                type="button"
                onClick={handleRestoreBrandKit}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Logo Marka Renklerine Dön</span>
              </button>
            )}
          </div>

          {/* Custom HEX Color Input */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Özel HEX Rengi Girin:</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="color"
                value={selectedColor.startsWith("#") ? selectedColor : "#1E3A8A"}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  setCustomHexInput(e.target.value);
                }}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customHexInput}
                onChange={(e) => setCustomHexInput(e.target.value)}
                placeholder="#1E40AF"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono w-28 uppercase text-slate-800"
              />
              <button
                type="button"
                onClick={() => handleApplyCustomHex(customHexInput)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Uygula
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              Girilen rengin açık/koyu varyasyonları ve WCAG kontrast oranları otomatik türetilir.
            </span>
          </div>

          {/* 16 Palettes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PREMIUM_PALETTES.map((pal) => {
              const audit = auditPaletteWcagContrast(pal);
              const isSelected = selectedColor.toLowerCase() === pal.primary.toLowerCase();

              return (
                <div
                  key={pal.id}
                  onClick={() => handleApplyPremiumPalette(pal)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-900">{pal.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {audit.passesWcag ? "AA Uyumlu" : "Yüksek Kontrast"}
                      </span>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span
                        className="w-8 h-8 rounded-lg shadow-xs shrink-0"
                        style={{ backgroundColor: pal.primary }}
                        title={`Primary: ${pal.primary}`}
                      />
                      <span
                        className="w-8 h-8 rounded-lg shadow-xs shrink-0"
                        style={{ backgroundColor: pal.secondary }}
                        title={`Secondary: ${pal.secondary}`}
                      />
                      <span
                        className="w-8 h-8 rounded-lg shadow-xs shrink-0"
                        style={{ backgroundColor: pal.accent }}
                        title={`Accent: ${pal.accent}`}
                      />
                      <span
                        className="w-8 h-8 rounded-lg border border-slate-200 shrink-0"
                        style={{ backgroundColor: pal.surface }}
                        title={`Surface: ${pal.surface}`}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{pal.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400">{pal.primary}</span>
                    {isSelected && <span className="font-bold text-amber-600">✓ Seçili</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BACKGROUND & GRADIENT STUDIO TAB                                       */}
      {/* ========================================================================= */}
      {activeTab === "backgrounds" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Arka Plan &amp; Gradyan Stüdyosu</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Web sitenizin ana zemin karakterini belirleyin. Usta gradyan setleri ve hafif dokulu mimari seçenekler.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GRADIENT_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div
                  className="h-28 flex items-center justify-center p-4 relative"
                  style={{
                    background: `linear-gradient(${preset.angle}deg, ${preset.stops
                      .map((s) => `${s.color} ${s.position || 0}%`)
                      .join(", ")})`,
                  }}
                >
                  <span
                    className={`text-sm font-black tracking-wider uppercase ${
                      preset.contrastMode === "dark" ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {preset.name}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-500 mb-4">{preset.description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (readOnly) return;
                      handleApplyCustomHex(preset.stops[0].color);
                      setToastMessage(`"${preset.name}" gradyanı uygulandı.`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Bu Gradyanı Kullan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TYPOGRAPHY SYSTEM TAB                                                  */}
      {/* ========================================================================= */}
      {activeTab === "typography" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-black text-slate-900 tracking-tight">4 Tipografi Karakteri</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Başlık ve gövde fontları tam Türkçe karakter seti (ç, ğ, ı, ö, ş, ü, İ) ile kusursuz optimize edilmiştir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TYPOGRAPHY_PRESETS.map((typo) => {
              const isSelected =
                config.fontFamily?.toLowerCase().includes(typo.fontHeading.toLowerCase()) ||
                (config as any).designTemplate?.customTokens?.typography?.fontHeading === typo.fontHeading;

              return (
                <div
                  key={typo.id}
                  className={`p-6 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-base font-black text-slate-900">{typo.name}</h4>
                        <span className="text-[11px] text-slate-400">
                          Başlık: {typo.fontHeading} • Gövde: {typo.fontBody}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {typo.category.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 my-4 space-y-2">
                      <p className="text-xl font-bold text-slate-900 leading-snug">
                        Şehir İçi ve Şehirler Arası Güvenilir Profesyonel Çözümler.
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Çınar, çağlayan, ırmak, özenli ve şeffaf hizmet yaklaşımımızla 7/24 yanınızdayız. (Türkçe Karakter Desteği: Ç, Ğ, İ, Ö, Ş, Ü)
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">{typo.description}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Önerilen: {typo.recommendedSectors.join(", ")}</span>
                    {isSelected ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Seçili</span>
                      </span>
                    ) : (
                      !readOnly && (
                        <button
                          type="button"
                          onClick={() => handleApplyTypography(typo.id)}
                          className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Seç
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LAYOUT & COMPONENT VARIANTS TAB                                        */}
      {/* ========================================================================= */}
      {activeTab === "layout" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Layout &amp; Bileşen Varyantları</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Header, Footer ve Hizmet Kartlarının sunum varyantlarını seçin. İçeriğiniz değişmeden sadece görsel yerleşim güncellenir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Header Variants */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-slate-900">Header (Üst Menü)</h4>
              <div className="space-y-2">
                {[
                  { id: "corporate-classic", label: "Kurumsal Klasik", desc: "Logo solda, menü ortada, CTA sağda" },
                  { id: "local-service", label: "Acil Yerel Servis", desc: "Hızlı ara butonu ve acil çağrı odaklı" },
                  { id: "modern-minimal", label: "Modern Minimal", desc: "Sade tipografik logo ve yalın eylem" },
                  { id: "premium-luxury", label: "Prestij Lüks", desc: "Dengeli altın vurgu ve seçkin duruş" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyLayoutVariant("header", item.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Variants */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-slate-900">Footer (Alt Menü)</h4>
              <div className="space-y-2">
                {[
                  { id: "corporate-multi", label: "Kurumsal Çok Sütunlu", desc: "4 sütunlu zengin navigasyon & iletişim" },
                  { id: "local-service", label: "Yerel Servis Odaklı", desc: "Acil çağrı kartı ve doğrudan telefon" },
                  { id: "minimal", label: "Yalın Minimal", desc: "Sade tek satırlı altbilgi ve telif şeridi" },
                  { id: "premium", label: "Prestij Lüks", desc: "Ortalanmış marka, zarif menü ve altın aksan" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyLayoutVariant("footer", item.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Card Variants */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-slate-900">Hizmet Kartı Stili</h4>
              <div className="space-y-2">
                {[
                  { id: "standard", label: "Standart Profesyonel", desc: "Numaralı ve ikon rozetli dengeli kart" },
                  { id: "compact-service", label: "Kompakt Servis", desc: "Hızlı yerel hizmetler için sıkıştırılmış ızgara" },
                  { id: "bordered-premium", label: "Kenarlıklı Prestij", desc: "Teklif & Detay Al butonlu çerçeveli kart" },
                  { id: "image-focused", label: "Görsel Odaklı (16:9)", desc: "Fotoğraf vitrinli kart yerleşimi" },
                  { id: "minimal-icon", label: "Minimal Tipografik", desc: "Sol marka çizgili yalın sunum" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyLayoutVariant("services", item.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LOGO & BRAND KIT TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === "brand" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Logo &amp; Kurumsal Marka Kimliği</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              İşletmenizin logosunu yükleyin. JetKur renk paletinizi logodan otomatik çıkarır ve web sitenizle uyumlar.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
              {config.logo || (config as any).logoUrl ? (
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={config.logo || (config as any).logoUrl}
                    alt="Mevcut Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 shrink-0 font-black text-2xl">
                  {config.companyName?.charAt(0) || "J"}
                </div>
              )}

              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold text-slate-900 block">Yeni Logo Yükleyin (SVG veya PNG)</span>
                <p className="text-[11px] text-slate-500 max-w-md">
                  Şeffaf arka planlı yüksek çözünürlüklü PNG veya SVG formatı önerilir (Maks 2MB).
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Logo Seç ve Yükle</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={readOnly || isColorExtracting}
                  />
                </label>
              </div>
            </div>

            {isColorExtracting && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Logo renkleri analiz ediliyor ve kurumsal palet oluşturuluyor...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. REAL CONTENT INSTANT PREVIEW MODAL                                     */}
      {/* ========================================================================= */}
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
