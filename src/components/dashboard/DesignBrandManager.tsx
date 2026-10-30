/**
 * JetKur Canonical Template Gallery, Theme Studio & Brand Manager (Sprint 12, 15 & 02D.R)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * Features:
 * 1. 8 Canonical Template Cards with human-friendly Turkish titles and layout mockups.
 * 2. Smart Design Recommendations & 12 Sector Design Presets mapped onto the 8 canonical templates.
 * 3. 16 Curated WCAG-Compliant Color Palettes, Custom HEX Override, and BrandKit Priority 2 Restoration.
 * 4. 4 Typography Archetypes with full Turkish character compatibility (`latin-ext`).
 * 5. 6 Curated Gradient & Section Surface Presets mapped to canonical `DesignSurfaceTokens`.
 * 6. Component Layout Variant Switchers (Header, Footer, Service Cards).
 * 7. Real Content Instant Preview Modal (Masaüstü, Tablet, Mobil) powered by `generateCandidatePreviewHtml`.
 * 8. Content Immutability: BusinessProfile, SiteContent, BrandKit, and MediaAssets are 100% preserved.
 */

import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig } from "../../types";
import { CANONICAL_TEMPLATE_MANIFESTS, resolveTemplate } from "../../domain/templates/catalog";
import {
  INDUSTRY_DESIGN_PRESETS,
  IndustryDesignPreset,
  buildPresetCustomTokens,
} from "../../domain/templates/manifests/industryTemplates";
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
  PremiumPaletteTokens,
  getPaletteById,
  createCustomPaletteFromHex,
  auditPaletteWcagContrast,
  toCanonicalPaletteTokens,
  GRADIENT_PRESETS,
  GradientPreset,
  toCanonicalSurfaceTokens,
  TYPOGRAPHY_PRESETS,
  getTypographyPresetById,
  toCanonicalTypographyTokens,
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

const TEMPLATE_PREVIEW_MOCKUPS: Record<
  string,
  { badge: string; accentColor: string; layoutType: string }
> = {
  "tmpl-rapid-service": {
    badge: "Hızlı Servis & Müdahale",
    accentColor: "#f59e0b",
    layoutType: "hero-urgent",
  },
  "tmpl-corporate-prestige": {
    badge: "Kurumsal & Güvenilir",
    accentColor: "#1e3a8a",
    layoutType: "hero-corporate",
  },
  "tmpl-clinical-pure": {
    badge: "Hijyenik & Klinik",
    accentColor: "#059669",
    layoutType: "hero-split",
  },
  "tmpl-modern-minimal": {
    badge: "Sade & Modern",
    accentColor: "#0f172a",
    layoutType: "hero-minimal",
  },
  "tmpl-artisan-warm": {
    badge: "Samimi & Usta İşi",
    accentColor: "#ea580c",
    layoutType: "hero-warm",
  },
  "tmpl-vip-luxury": {
    badge: "Lüks & Özel Hizmet",
    accentColor: "#b45309",
    layoutType: "hero-luxury",
  },
  "tmpl-tech-dynamic": {
    badge: "Teknolojik & Dinamik",
    accentColor: "#0284c7",
    layoutType: "hero-tech",
  },
  "tmpl-formal-legal": {
    badge: "Resmi & Prestijli",
    accentColor: "#4338ca",
    layoutType: "hero-formal",
  },
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
    "#f59e0b";

  const [selectedColor, setSelectedColor] = useState(effectivePrimaryColor);
  const [customHexInput, setCustomHexInput] = useState(effectivePrimaryColor);
  const [activeTab, setActiveTab] = useState<
    "templates" | "palettes" | "typography" | "backgrounds" | "layout" | "brand"
  >("templates");
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

  // One-click canonical template switch (DRAFT only, live preserved!)
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
    setToastMessage(
      `Tasarım "${manifest.name}" olarak güncellendi. Canlı siteniz siz yayınlayana kadar değişmez.`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Applies a canonical Industry Design Preset (canonical template + curated variants + tokens)
  const handleApplyIndustryPreset = (preset: IndustryDesignPreset) => {
    if (readOnly) return;

    const manifest = resolveTemplate(preset.canonicalTemplateId);
    if (!manifest) return;

    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingPaletteOverride = config.brandKit?.palette
      ? undefined
      : canonicalCurrent.designTemplate?.customTokens?.palette;

    const presetCustomTokens = buildPresetCustomTokens(preset, existingPaletteOverride);
    const resolvedTokens = resolveDesignTokens(
      manifest.designTokens,
      config.brandKit,
      presetCustomTokens
    );

    const updated: SiteConfig = {
      ...config,
      templateId: manifest.id,
      theme: manifest.slug as any,
      fontFamily: resolvedTokens.typography.fontHeading,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: presetCustomTokens,
        sectionVariants: {
          ...manifest.sectionRecipe,
          ...preset.sectionVariants,
        },
      },
      palette: {
        ...(config.palette || { name: preset.name }),
        id: preset.palettePresetId,
        name: preset.name,
        primary: resolvedTokens.palette.primary,
        primaryDark: resolvedTokens.palette.primaryDark,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        bg: resolvedTokens.palette.background,
        text: resolvedTokens.palette.text,
      },
      colorTheme: {
        ...config.colorTheme,
        id: preset.palettePresetId,
        name: preset.name,
        primary: resolvedTokens.palette.primary,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        fontFamily: resolvedTokens.typography.fontHeading,
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
    setSelectedColor(resolvedTokens.palette.primary);
    setToastMessage(`Sektör tasarım paketi uygulandı: ${preset.name}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Applies Smart Design Package Recommendation
  const handleApplySmartRecommendation = (rec: DesignPackageRecommendation) => {
    if (readOnly) return;

    const manifest = resolveTemplate(rec.templateId);
    if (!manifest) return;

    const pal = getPaletteById(rec.paletteId);
    const typo = getTypographyPresetById(rec.typographyId);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const nextCustomTokens = {
      ...existingCustomTokens,
      palette: config.brandKit?.palette ? undefined : toCanonicalPaletteTokens(pal),
      typography: toCanonicalTypographyTokens(typo),
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
      fontFamily: resolvedTokens.typography.fontHeading,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: nextCustomTokens,
        sectionVariants: {
          ...manifest.sectionRecipe,
          ...rec.sectionVariants,
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
    } as SiteConfig;

    onChange(updated);
    setSelectedColor(resolvedTokens.palette.primary);
    setToastMessage(`JetKur akıllı önerisi uygulandı: ${rec.presetName} (${pal.name})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Applies one of the 16 Curated Premium Palettes
  const handleApplyPremiumPalette = (pal: PremiumPaletteTokens) => {
    if (readOnly) return;
    setSelectedColor(pal.primary);
    setCustomHexInput(pal.primary);

    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const nextCustomTokens = {
      ...existingCustomTokens,
      palette: toCanonicalPaletteTokens(pal),
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

  // Explicit user color override (Priority 3: customTokens.palette.primary)
  const handleColorChange = (newColor: string, baseConfig: SiteConfig = config) => {
    if (readOnly) return;
    const normalized = normalizeHexColor(newColor) || newColor;
    const darker = darkenColor(normalized, 15);
    setSelectedColor(normalized);
    setCustomHexInput(normalized);

    const manifest = resolveCanonicalManifestForLegacy(baseConfig);
    const canonicalCurrent = fromLegacySiteConfig(baseConfig);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};
    const nextCustomTokens = {
      ...existingCustomTokens,
      palette: {
        ...(existingCustomTokens.palette || {}),
        primary: normalized,
        primaryDark: darker,
      },
    };

    const resolvedTokens = resolveDesignTokens(
      manifest.designTokens,
      baseConfig.brandKit,
      nextCustomTokens
    );

    const updated: SiteConfig = {
      ...baseConfig,
      designTemplate: {
        ...((baseConfig as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: nextCustomTokens,
        sectionVariants: {
          ...manifest.sectionRecipe,
          ...((baseConfig as any).designTemplate?.sectionVariants || {}),
        },
      },
      palette: {
        ...(baseConfig.palette || { name: "Özel Renk Paleti" }),
        id: "custom-override",
        name: "Özel Renk Paleti",
        primary: resolvedTokens.palette.primary,
        primaryDark: resolvedTokens.palette.primaryDark,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        bg: resolvedTokens.palette.background,
        text: resolvedTokens.palette.text,
      },
      colorTheme: {
        ...(baseConfig as any).colorTheme,
        id: "custom-override",
        primary: resolvedTokens.palette.primary,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        palette: {
          ...((baseConfig as any).colorTheme?.palette || {}),
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
    setToastMessage("Marka rengi güncellendi.");
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

  // Applies Typography Preset via canonical DesignTypographyTokens
  const handleApplyTypography = (typoId: string) => {
    if (readOnly) return;
    const typo = getTypographyPresetById(typoId);
    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const nextCustomTokens = {
      ...existingCustomTokens,
      typography: toCanonicalTypographyTokens(typo),
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

  // Applies Background / Gradient Preset via canonical TemplateGeometryTokens & TemplateColorTokens
  const handleApplyGradientPreset = (preset: GradientPreset) => {
    if (readOnly) return;
    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const surfaceTokens = toCanonicalSurfaceTokens({
      type: "linear-gradient",
      presetId: preset.id,
      contrastMode: preset.contrastMode,
    });

    const nextCustomTokens = {
      ...existingCustomTokens,
      palette: {
        ...(existingCustomTokens.palette || {}),
        ...(surfaceTokens.heroGradient ? { heroGradient: surfaceTokens.heroGradient } : {}),
      },
      geometry: {
        ...(existingCustomTokens.geometry || {}),
        sectionSurfaceSequence: surfaceTokens.sectionSurfaceSequence,
      },
    };

    const updated: SiteConfig = {
      ...config,
      designTemplate: {
        ...((config as any).designTemplate || {}),
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version || "1.0.0",
        customTokens: nextCustomTokens,
      },
    } as SiteConfig;

    onChange(updated);
    setToastMessage(`Bölüm yüzey ve gradyan stili "${preset.name}" olarak güncellendi.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Applies Header / Footer / Service Card variant layout
  const handleApplyLayoutVariant = (
    section: "header" | "footer" | "services",
    variant: string
  ) => {
    if (readOnly) return;
    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingVariants =
      canonicalCurrent.designTemplate?.sectionVariants || manifest.sectionRecipe;

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
    setCustomHexInput(brandPrimary);

    const manifest = resolveCanonicalManifestForLegacy(config);
    const canonicalCurrent = fromLegacySiteConfig(config);
    const existingCustomTokens = canonicalCurrent.designTemplate?.customTokens || {};

    const nextCustomTokens = {
      ...existingCustomTokens,
      palette: undefined,
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

  // Applies the logo-extracted BrandKit palette at Priority 2 (clearing any Priority 3 palette override)
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
    const hasRemainingCustom =
      cleanedCustomTokens &&
      Boolean(
        cleanedCustomTokens.typography ||
          cleanedCustomTokens.geometry ||
          cleanedCustomTokens.header ||
          cleanedCustomTokens.footer
      );

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
      hasRemainingCustom ? cleanedCustomTokens : undefined
    );

    setSelectedColor(resolvedTokens.palette.primary);
    setCustomHexInput(resolvedTokens.palette.primary);

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
        customTokens: hasRemainingCustom ? cleanedCustomTokens : undefined,
        sectionVariants: {
          ...manifest.sectionRecipe,
          ...((baseConfig as any).designTemplate?.sectionVariants || {}),
        },
      },
      palette: {
        ...(baseConfig.palette || { name: "Logodan Çıkarılan Marka Paleti" }),
        id: newBrandKit.id || "palette-brand-kit",
        name: "Logodan Çıkarılan Marka Paleti",
        primary: resolvedTokens.palette.primary,
        primaryDark: resolvedTokens.palette.primaryDark,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        bg: resolvedTokens.palette.background,
        text: resolvedTokens.palette.text,
      },
      colorTheme: {
        ...(baseConfig as any).colorTheme,
        id: newBrandKit.id || "palette-brand-kit",
        primary: resolvedTokens.palette.primary,
        secondary: resolvedTokens.palette.secondary,
        accent: resolvedTokens.palette.accent,
        palette: {
          ...((baseConfig as any).colorTheme?.palette || {}),
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
    setToastMessage("Logodan çıkarılan marka paleti sitenize uygulandı!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyUploadedLogo = (
    dataUrl: string,
    mimeType: string,
    svgContent?: string
  ): SiteConfig => {
    const manifest = resolveCanonicalManifestForLegacy(config);
    const updatedBrandKit = createBrandKit({
      siteId: (config as any).siteId || (config as any).id || "site-1",
      logoInput: {
        sourceType: mimeType.includes("svg") ? "svg" : "upload",
        url: dataUrl,
        svgContent,
        mimeType,
      },
      preferredPrimary: config.brandKit?.palette?.primary || selectedColor,
      preferredSecondary: config.brandKit?.palette?.secondary,
      preferredAccent: config.brandKit?.palette?.accent,
      fallbackTemplateTokens: manifest.designTokens,
    });

    const updated: SiteConfig = {
      ...config,
      logo: dataUrl,
      logoUrl: dataUrl,
      header: {
        ...config.header,
        logoType: "image",
        logoImage: dataUrl,
      },
      brandKit: updatedBrandKit,
    };

    onChange(updated);
    setToastMessage("Logo başarıyla yüklendi ve kurumsal kimliğinize bağlandı!");
    setTimeout(() => setToastMessage(null), 3000);
    return updated;
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
        const configWithLogo = applyUploadedLogo(dataUrl, "image/svg+xml", svgText);

        setIsColorExtracting(true);
        try {
          const result = await extractLogoColors({
            svgContent: svgText,
            mimeType: "image/svg+xml",
            fileName: file.name,
          });
          setExtractedPalette(result);
          if (result.isExtracted && result.primary) {
            handleApplyExtractedBrandPalette(result, configWithLogo, {
              dataUrl,
              mimeType: "image/svg+xml",
              svgContent: svgText,
            });
          }
        } catch {
          // ignore
        } finally {
          setIsColorExtracting(false);
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const configWithLogo = applyUploadedLogo(dataUrl, file.type);

        setIsColorExtracting(true);
        try {
          const result = await extractLogoColors({
            dataUrl,
            mimeType: file.type,
            fileName: file.name,
          });
          setExtractedPalette(result);
          if (result.isExtracted && result.primary) {
            handleApplyExtractedBrandPalette(result, configWithLogo, {
              dataUrl,
              mimeType: file.type,
            });
          }
        } catch {
          // ignore
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "templates"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Şablon &amp; Sektör Paketleri</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("palettes")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "palettes"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Renk Paletleri (16)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("typography")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "typography"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Tipografi</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("backgrounds")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "backgrounds"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span>Yüzey &amp; Gradyan</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("layout")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "layout"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Bileşen Düzeni</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("brand")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "brand"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Logo &amp; Marka Rengi</span>
        </button>
      </div>

      {/* 1. TEMPLATES & INDUSTRY PRESETS TAB */}
      {activeTab === "templates" && (
        <div className="space-y-8">
          {/* Smart Design Recommendation Banner */}
          {topRecommendation && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <span className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      JetKur Akıllı Önerisi ({siteSector})
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {topRecommendation.presetName} ({topRecommendation.templateName})
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                    {topRecommendation.rationale}
                  </p>
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

          {/* 8 Canonical Templates */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                8 Ana Mimari Tasarım Şablonu
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                İşletmenizin tarzına en uygun ana şablonu seçin. Şablonu değiştirdiğinizde tüm metinleriniz, hizmetleriniz, fotoğraflarınız ve telefon bilgileriniz eksiksiz korunur.
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
                const isRecommended = tmpl.id === topRecommendation?.templateId;

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
                        <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                          {tmpl.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplateId(tmpl.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Önizle</span>
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
                              Uygula
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

          {/* 12 Curated Sector Design Presets */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                12 Sektörel Hazır Tasarım Paketi
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Sektörünüze özel hazırlanmış renk paleti, tipografi ve bileşen varyantlarını tek tıkla ana şablonunuza uygulayın.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {INDUSTRY_DESIGN_PRESETS.map((preset) => {
                const pal = getPaletteById(preset.palettePresetId);
                return (
                  <div
                    key={preset.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {preset.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: pal.primary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: pal.accent }}
                          />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{preset.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateId(preset.canonicalTemplateId)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Önizle</span>
                      </button>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleApplyIndustryPreset(preset)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                        >
                          Paketi Uygula
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. 16 PREMIUM COLOR PALETTES TAB */}
      {activeTab === "palettes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                16 Profesyonel Renk Paleti
              </h3>
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

          {/* Custom HEX Input */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Özel HEX Rengi Girin:
            </span>
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
                placeholder="#1E3A8A"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono w-32"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleApplyCustomHex(customHexInput)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Uygula
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PREMIUM_PALETTES.map((pal) => {
              const wcag = auditPaletteWcagContrast(pal);
              return (
                <div
                  key={pal.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-5 h-5 rounded-lg border border-black/10"
                        style={{ backgroundColor: pal.primary }}
                      />
                      <span
                        className="w-5 h-5 rounded-lg border border-black/10"
                        style={{ backgroundColor: pal.accent }}
                      />
                      <span
                        className="w-5 h-5 rounded-lg border border-black/10"
                        style={{ backgroundColor: pal.surface }}
                      />
                      {wcag.passesWcag && (
                        <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          WCAG AA
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{pal.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {pal.description}
                    </p>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleApplyPremiumPalette(pal)}
                      className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Paleti Seç
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TYPOGRAPHY TAB */}
      {activeTab === "typography" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TYPOGRAPHY_PRESETS.map((typo) => (
            <div
              key={typo.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {typo.category}
                </span>
                <h4 className="text-base font-black text-slate-900 mt-1">{typo.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{typo.description}</p>
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <div className="font-bold">
                    Başlık: {typo.fontHeading} · Gövde: {typo.fontBody}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Türkçe Karakter Desteği: Çağdaş İşletme Çözümleri (ç, ğ, ı, ö, ş, ü, İ)
                  </div>
                </div>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleApplyTypography(typo.id)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer w-fit"
                >
                  Bu Tipografiyi Uygula
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. BACKGROUNDS & SURFACES TAB */}
      {activeTab === "backgrounds" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GRADIENT_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div>
                <div
                  className="h-20 rounded-xl mb-3 border border-black/10"
                  style={{
                    background: `linear-gradient(${preset.angle}deg, ${preset.stops
                      .map((s) => `${s.color} ${s.position ?? 0}%`)
                      .join(", ")})`,
                  }}
                />
                <h4 className="text-sm font-bold text-slate-900">{preset.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{preset.description}</p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleApplyGradientPreset(preset)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Yüzey Stilini Uygula
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. COMPONENT LAYOUT VARIANTS TAB */}
      {activeTab === "layout" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Header Variants */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h4 className="text-sm font-black text-slate-900">Üst Menü (Header) Stili</h4>
            <div className="space-y-2">
              {[
                {
                  id: "corporate-classic",
                  label: "Kurumsal Klasik",
                  desc: "Üst bilgi barı ve dengeli kurumsal navigasyon",
                },
                {
                  id: "local-service",
                  label: "Yerel Servis & Hızlı Arama",
                  desc: "Telefon ve WhatsApp odaklı dönüşüm barı",
                },
                {
                  id: "modern-minimal",
                  label: "Modern Minimal",
                  desc: "Sade ve ferah mimari üst menü",
                },
                {
                  id: "premium-editorial",
                  label: "Premium Editoryal",
                  desc: "Seçkin markalar için zarif üst menü",
                },
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
            <h4 className="text-sm font-black text-slate-900">Alt Bilgi (Footer) Stili</h4>
            <div className="space-y-2">
              {[
                {
                  id: "corporate-multi",
                  label: "Kurumsal Çok Sütunlu",
                  desc: "4 sütunlu kapsamlı kurumsal alt bilgi",
                },
                {
                  id: "local-service",
                  label: "Yerel Servis Dönüşüm",
                  desc: "Hızlı iletişim şeritli ve hizmet bölgeli alt bilgi",
                },
                {
                  id: "minimal-clean",
                  label: "Minimal Yalın",
                  desc: "Kompakt ve modern tek satırlı düzen",
                },
                {
                  id: "premium-editorial",
                  label: "Premium Editoryal",
                  desc: "Büyük tipografik marka başlıklı prestij düzeni",
                },
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
                {
                  id: "standard",
                  label: "Standart Profesyonel",
                  desc: "Numaralı ve ikon rozetli dengeli kart",
                },
                {
                  id: "compact-service",
                  label: "Kompakt Servis",
                  desc: "Hızlı yerel hizmetler için sıkıştırılmış ızgara",
                },
                {
                  id: "bordered-premium",
                  label: "Kenarlıklı Prestij",
                  desc: "Teklif & Detay Al butonlu çerçeveli kart",
                },
                {
                  id: "image-focused",
                  label: "Görsel Odaklı (16:9)",
                  desc: "Fotoğraf vitrinli kart yerleşimi",
                },
                {
                  id: "minimal-icon",
                  label: "Minimal Tipografik",
                  desc: "Sol marka çizgili yalın sunum",
                },
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
      )}

      {/* 6. LOGO & BRAND KIT TAB */}
      {activeTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              İşletme Logosu &amp; Kurumsal Kimlik
            </h3>
            <p className="text-xs text-slate-500">
              Logonuzu yüklediğinizde JetKur logonuzdaki kurumsal renkleri otomatik analiz eder.
            </p>

            <div className="flex items-center gap-4 pt-2">
              {config.logo || (config as any).logoUrl ? (
                <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={config.logo || (config as any).logoUrl}
                    alt="Mevcut Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 font-black text-xl">
                  {config.companyName?.charAt(0) || "J"}
                </div>
              )}

              <div className="space-y-2">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Logo Yükle (PNG, SVG, JPG)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={readOnly || isColorExtracting}
                  />
                </label>
                <p className="text-[11px] text-slate-400">Maksimum 2MB boyutunda görsel</p>
              </div>
            </div>

            {isColorExtracting && (
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Logo renkleri analiz ediliyor...</span>
              </div>
            )}

            {extractedPalette && extractedPalette.isExtracted && !isColorExtracting && (
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 space-y-3">
                <div className="text-xs font-bold text-emerald-900">
                  Logodan Tespit Edilen Marka Renkleri:
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs"
                      style={{ backgroundColor: extractedPalette.primary }}
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Ana:{" "}
                      <code className="font-mono text-slate-900">{extractedPalette.primary}</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs"
                      style={{ backgroundColor: extractedPalette.accent }}
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Yardımcı:{" "}
                      <code className="font-mono text-slate-900">{extractedPalette.accent}</code>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyExtractedBrandPalette(extractedPalette)}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Otomatik Paleti Kullan
                </button>
              </div>
            )}

            {extractedPalette && !extractedPalette.isExtracted && !isColorExtracting && (
              <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Logodan güvenilir bir marka rengi çıkaramadık. Ana renginizi yan panelden seçebilirsiniz.
                </span>
              </div>
            )}
          </div>

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

      {/* 7. REAL CONTENT INSTANT PREVIEW MODAL */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800">
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

              <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    previewViewport === "desktop"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
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
                    previewViewport === "tablet"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
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
                    previewViewport === "mobile"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Mobil Görünüm (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Mobil</span>
                </button>
              </div>

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
