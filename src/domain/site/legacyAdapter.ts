/**
 * JetKur Canonical Data Architecture - Legacy Adapter
 *
 * PURPOSE:
 * Provides a non-destructive bidirectional bridge between legacy `SiteConfig`
 * and the newly introduced `CanonicalSite` domain aggregate.
 *
 * In accordance with Sprint 01 principles:
 * - DATA COMPATIBILITY REQUIRED = NO (no real customer production data exists yet)
 * - TEMPORARY APPLICATION COMPATIBILITY = YES (ensure zero runtime breakages)
 */

import { SiteConfig } from "../../types";
import { CanonicalSite } from "./site";
import { BusinessProfile } from "./businessProfile";
import {
  ActiveDesignConfig,
  CustomDesignTokens,
  DesignTokens,
  TemplateColorTokens,
  TemplateGeometryTokens,
  TemplateTypographyTokens,
} from "./designTemplate";
import { SectionConfiguration, SiteSectionItem, CanonicalSectionType } from "./sectionConfiguration";
import { SiteContent } from "./siteContent";
import { SiteSettings } from "./siteSettings";
import {
  CANONICAL_TEMPLATE_MANIFESTS,
  resolveTemplate,
} from "../templates/catalog";
import { TemplateManifest } from "../templates/types";
import { BrandKit } from "../brand/types";
import { resolveDesignTokens } from "../brand/tokenResolver";
import { darkenColor, normalizeHexColor } from "../brand/colorUtils";
import { COLOR_PALETTES, TEMPLATES } from "../../data/templates";

export type LegacyTokenSourceClassification =
  | "none"
  | "auto_default"
  | "template_default"
  | "brandkit_derived"
  | "explicit_user_override"
  | "preserved_legacy_custom"
  | "ambiguous_preserved";

export interface LegacyTokenProvenanceReport {
  resolvedTemplateId: string;
  resolvedTemplateSlug: string;
  classification: LegacyTokenSourceClassification;
  hasBrandKit: boolean;
  explicitOverrideKeys: string[];
  preservedLegacyKeys: string[];
  ignoredAutoDefaultKeys: string[];
  ambiguities: string[];
}

const SECTOR_KEYWORD_TO_TEMPLATE_ID: ReadonlyArray<{ keywords: string[]; templateId: string }> = [
  { keywords: ["dis", "diş", "klinik", "saglik", "sağlık", "medikal", "hekim", "doktor", "dental"], templateId: "tmpl-clinical-pure" },
  { keywords: ["hukuk", "avukat", "arabulucu", "danismanlik", "danışmanlık", "mali", "legal"], templateId: "tmpl-formal-legal" },
  { keywords: ["restoran", "kafe", "gida", "gıda", "firin", "fırın", "hali", "halı", "zanaat", "yemek", "gurme"], templateId: "tmpl-artisan-warm" },
  { keywords: ["mimar", "tasarim", "tasarım", "studyo", "stüdyo", "insaat", "inşaat", "dekorasyon"], templateId: "tmpl-modern-minimal" },
  { keywords: ["vip", "luks", "lüks", "guzellik", "güzellik", "kuafor", "kuaför", "estetik", "spa"], templateId: "tmpl-vip-luxury" },
  { keywords: ["yazilim", "yazılım", "teknoloji", "bilisim", "bilişim", "dijital", "saas", "bilgisayar"], templateId: "tmpl-tech-dynamic" },
  { keywords: ["oto", "kurtarma", "cekici", "çekici", "tesisat", "sihhi", "sıhhi", "nakliyat", "kombi", "klima", "servis", "acil", "tamir"], templateId: "tmpl-rapid-service" },
  { keywords: ["kurumsal", "sirket", "şirket", "holding", "finans", "lojistik"], templateId: "tmpl-corporate-prestige" },
];

/**
 * Resolves the authoritative Canonical TemplateManifest for a legacy SiteConfig.
 */
export function resolveCanonicalManifestForLegacy(legacy: SiteConfig): TemplateManifest {
  const rawTemplateId = typeof legacy.templateId === "string" ? legacy.templateId.trim() : "";
  const dtTemplateId = typeof (legacy as any).designTemplate?.templateId === "string"
    ? (legacy as any).designTemplate.templateId.trim()
    : "";
  const dtTemplateSlug = typeof (legacy as any).designTemplate?.templateSlug === "string"
    ? (legacy as any).designTemplate.templateSlug.trim()
    : "";
  const rawTheme = typeof (legacy as any).theme === "string" ? (legacy as any).theme.trim() : "";
  const rawDesignSet = typeof (legacy as any).designSet === "string" ? (legacy as any).designSet.trim() : "";

  // 1. Explicit canonical/legacy templateId on SiteConfig (unless it is the unconfigured DB mapper fallback "corporate-prestige" while designSet is set)
  if (rawTemplateId && !(rawTemplateId === "corporate-prestige" && rawDesignSet)) {
    const byId = resolveTemplate(rawTemplateId);
    if (byId) return byId;
  }

  // 2. Active designTemplate.templateId / templateSlug
  if (dtTemplateId && !(dtTemplateId === "corporate-prestige" && rawDesignSet)) {
    const byDtId = resolveTemplate(dtTemplateId);
    if (byDtId) return byDtId;
  }
  if (dtTemplateSlug && !(dtTemplateSlug === "corporate-prestige" && rawDesignSet)) {
    const byDtSlug = resolveTemplate(dtTemplateSlug);
    if (byDtSlug) return byDtSlug;
  }

  // 3. Theme slug or QuickStart designSet
  if (rawTheme) {
    const byTheme = resolveTemplate(rawTheme);
    if (byTheme) return byTheme;
  }
  if (rawDesignSet) {
    const byDesignSet = resolveTemplate(rawDesignSet);
    if (byDesignSet) return byDesignSet;
  }

  // 4. Sector mapping
  const rawSector = typeof legacy.sector === "string" ? legacy.sector.trim() : "";
  if (rawSector) {
    const directSectorMatch = resolveTemplate(rawSector);
    if (directSectorMatch) return directSectorMatch;

    const lowerSector = rawSector.toLowerCase();
    for (const entry of SECTOR_KEYWORD_TO_TEMPLATE_ID) {
      if (entry.keywords.some((kw) => lowerSector.includes(kw))) {
        const matched = resolveTemplate(entry.templateId);
        if (matched) return matched;
      }
    }
  }

  // 5. Fallback if rawTemplateId was "corporate-prestige"
  if (rawTemplateId) {
    const byFallbackId = resolveTemplate(rawTemplateId);
    if (byFallbackId) return byFallbackId;
  }

  return CANONICAL_TEMPLATE_MANIFESTS[0];
}

// Known automatically populated system boilerplate palettes
const SYSTEM_BOILERPLATE_PALETTES: ReadonlyArray<Record<string, string>> = [
  // 1. Old legacyAdapter hardcoded fallback
  {
    primary: "#1e40af",
    primaryDark: "#1e3a8a",
    secondary: "#0d9488",
    accent: "#f59e0b",
    text: "#0f172a",
    textMuted: "#64748b",
    background: "#ffffff",
    surface: "#f8fafc",
    border: "#e2e8f0",
  },
  // 2. toLegacySiteConfig / onboardingService default blue
  {
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    secondary: "#0f172a",
    accent: "#f59e0b",
    text: "#0f172a",
    textMuted: "#64748b",
    background: "#ffffff",
    surface: "#ffffff",
    border: "#e2e8f0",
  },
  {
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    secondary: "#f8fafc",
    accent: "#f59e0b",
    text: "#0f172a",
    textMuted: "#64748b",
    background: "#ffffff",
    surface: "#ffffff",
    border: "#e2e8f0",
  },
  // 3. DB mapper default fallback (mappers.ts)
  {
    primary: "#1e3a8a",
    primaryDark: "#172554",
    secondary: "#0f172a",
    accent: "#3b82f6",
    text: "#1e293b",
    textMuted: "#64748b",
    background: "#ffffff",
    surface: "#ffffff",
    border: "#e2e8f0",
  },
];

// QuickStartDesignSets stock palettes (from QuickStartDesignSets.tsx)
const QUICKSTART_DESIGN_SET_PALETTES: Readonly<Record<string, Record<string, string>>> = {
  "emergency-speed-orange": {
    primary: "#ea580c",
    primaryDark: "#c2410c",
    secondary: "#fff7ed",
    accent: "#facc15",
    text: "#1c1917",
    textMuted: "#57534e",
    surface: "#ffffff",
    border: "#fed7aa",
  },
  "corporate-prestige-navy": {
    primary: "#1e3a8a",
    primaryDark: "#172554",
    secondary: "#f8fafc",
    accent: "#d97706",
    text: "#0f172a",
    textMuted: "#475569",
    surface: "#ffffff",
    border: "#e2e8f0",
  },
  "medical-pure-emerald": {
    primary: "#059669",
    primaryDark: "#047857",
    secondary: "#ecfdf5",
    accent: "#0284c7",
    text: "#064e3b",
    textMuted: "#475569",
    surface: "#ffffff",
    border: "#a7f3d0",
  },
  "gourmet-warm-crimson": {
    primary: "#b91c1c",
    primaryDark: "#7f1d1d",
    secondary: "#fef2f2",
    accent: "#d97706",
    text: "#1c1917",
    textMuted: "#57534e",
    surface: "#ffffff",
    border: "#fecaca",
  },
  "architecture-dark-minimal": {
    primary: "#18181b",
    primaryDark: "#09090b",
    secondary: "#f4f4f5",
    accent: "#a1a1aa",
    text: "#09090b",
    textMuted: "#52525b",
    surface: "#ffffff",
    border: "#e4e4e7",
  },
  "luxury-gold-vip": {
    primary: "#b45309",
    primaryDark: "#78350f",
    secondary: "#fffbeb",
    accent: "#1c1917",
    text: "#1c1917",
    textMuted: "#57534e",
    surface: "#ffffff",
    border: "#fde68a",
  },
  "tech-cyan-modern": {
    primary: "#0284c7",
    primaryDark: "#0369a1",
    secondary: "#f0f9ff",
    accent: "#6366f1",
    text: "#0f172a",
    textMuted: "#475569",
    surface: "#ffffff",
    border: "#bae6fd",
  },
  "legal-prestige-purple": {
    primary: "#4c1d95",
    primaryDark: "#2e1065",
    secondary: "#f5f3ff",
    accent: "#b45309",
    text: "#1e1b4b",
    textMuted: "#475569",
    surface: "#ffffff",
    border: "#ddd6fe",
  },
};

function sameHex(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const na = normalizeHexColor(a) || a.trim().toLowerCase();
  const nb = normalizeHexColor(b) || b.trim().toLowerCase();
  return na === nb;
}

function isOldAdapterHardcodedCustomTokens(customTokens: CustomDesignTokens | Partial<DesignTokens> | undefined): boolean {
  if (!customTokens) return false;
  const p = customTokens.palette;
  const t = customTokens.typography;
  const g = customTokens.geometry;
  if (!p || !t || !g) return false;
  return (
    sameHex(p.primary, "#1e40af") &&
    sameHex(p.primaryDark, "#1e3a8a") &&
    sameHex(p.secondary, "#0d9488") &&
    sameHex(p.accent, "#f59e0b") &&
    t.fontHeading === "Inter, sans-serif" &&
    g.containerMaxWidth === "wide" &&
    g.cardStyle === "subtle-shadow"
  );
}

function normalizeLegacyBorderRadius(
  raw?: string
): TemplateGeometryTokens["borderRadius"] | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim().toLowerCase();
  if (
    trimmed === "none" ||
    trimmed === "sm" ||
    trimmed === "md" ||
    trimmed === "lg" ||
    trimmed === "xl" ||
    trimmed === "2xl" ||
    trimmed === "full"
  ) {
    return trimmed;
  }
  if (trimmed === "0" || trimmed === "0px" || trimmed === "0rem") return "none";
  if (trimmed === "4px" || trimmed === "0.25rem") return "sm";
  if (trimmed === "8px" || trimmed === "0.5rem") return "md";
  if (trimmed === "12px" || trimmed === "0.75rem") return "lg";
  if (trimmed === "16px" || trimmed === "1rem") return "xl";
  if (trimmed === "24px" || trimmed === "1.5rem") return "2xl";
  if (trimmed === "9999px" || trimmed === "50%") return "full";
  return undefined;
}

const AUTO_POPULATED_FONT_FAMILIES = new Set([
  "inter",
  "inter, sans-serif",
  "'inter', sans-serif",
  "plus jakarta sans",
  "'plus jakarta sans', sans-serif",
]);

const AUTO_POPULATED_BORDER_RADII = new Set([
  "16px",
  "0.5rem",
  "0.75rem",
  "md",
]);

/**
 * Inspects a legacy SiteConfig and determines which token values are:
 * - automatically populated legacy/template defaults (ignored so TemplateManifest & BrandKit govern)
 * - BrandKit-derived tokens (preserved on BrandKit at Priority 2, not duplicated into Priority 3 customTokens)
 * - explicit user overrides or genuinely customized legacy site tokens (preserved in Priority 3 customTokens)
 * - ambiguous legacy values (preserved safely and reported in provenance.ambiguities)
 */
export function inspectLegacyTokenProvenance(
  legacy: SiteConfig,
  manifestArg?: TemplateManifest
): {
  customTokens?: CustomDesignTokens;
  provenance: LegacyTokenProvenanceReport;
} {
  const manifest = manifestArg || resolveCanonicalManifestForLegacy(legacy);
  const brandKit: BrandKit | undefined =
    (legacy as any).brandKit || (legacy as any).businessProfile?.branding?.brandKit;

  const report: LegacyTokenProvenanceReport = {
    resolvedTemplateId: manifest.id,
    resolvedTemplateSlug: manifest.slug,
    classification: "none",
    hasBrandKit: Boolean(brandKit),
    explicitOverrideKeys: [],
    preservedLegacyKeys: [],
    ignoredAutoDefaultKeys: [],
    ambiguities: [],
  };

  const customPalette: Partial<TemplateColorTokens> = {};
  const customTypography: Partial<TemplateTypographyTokens> = {};
  const customGeometry: Partial<TemplateGeometryTokens> = {};

  const rawDesignTemplateCustom: CustomDesignTokens | undefined = (legacy as any).designTemplate?.customTokens;
  const isExplicitCustomOverrideId =
    (legacy as any).colorTheme?.id === "custom-override" ||
    legacy.palette?.id === "custom-override";

  // 1. Check explicit designTemplate.customTokens (if not the old adapter's hardcoded boilerplate dump)
  if (rawDesignTemplateCustom && !isOldAdapterHardcodedCustomTokens(rawDesignTemplateCustom)) {
    const dtPalette = rawDesignTemplateCustom.palette;
    if (dtPalette) {
      const paletteKeys: Array<keyof TemplateColorTokens> = [
        "primary",
        "primaryDark",
        "secondary",
        "accent",
        "text",
        "textMuted",
        "background",
        "surface",
        "border",
      ];
      for (const k of paletteKeys) {
        const val = dtPalette[k];
        if (!val) continue;
        // If BrandKit exists and this value is identical to BrandKit's token (and not marked custom-override), let BrandKit govern at Priority 2
        if (brandKit?.palette && sameHex(val, brandKit.palette[k]) && !isExplicitCustomOverrideId) {
          report.ignoredAutoDefaultKeys.push(`designTemplate.customTokens.palette.${k}`);
          continue;
        }
        // If no BrandKit and identical to manifest default (and not marked custom-override), let TemplateManifest govern at Priority 1
        if (!brandKit && sameHex(val, manifest.designTokens.palette[k]) && !isExplicitCustomOverrideId) {
          report.ignoredAutoDefaultKeys.push(`designTemplate.customTokens.palette.${k}`);
          continue;
        }
        customPalette[k] = val;
        report.explicitOverrideKeys.push(`palette.${k}`);
      }
    }

    if (rawDesignTemplateCustom.typography) {
      const dtTypo = rawDesignTemplateCustom.typography;
      if (dtTypo.fontHeading && dtTypo.fontHeading !== manifest.designTokens.typography.fontHeading) {
        customTypography.fontHeading = dtTypo.fontHeading;
        report.explicitOverrideKeys.push("typography.fontHeading");
      }
      if (dtTypo.fontBody && dtTypo.fontBody !== manifest.designTokens.typography.fontBody) {
        customTypography.fontBody = dtTypo.fontBody;
        report.explicitOverrideKeys.push("typography.fontBody");
      }
      if (dtTypo.headingWeight && dtTypo.headingWeight !== manifest.designTokens.typography.headingWeight) {
        customTypography.headingWeight = dtTypo.headingWeight;
        report.explicitOverrideKeys.push("typography.headingWeight");
      }
      if (dtTypo.baseFontSize && dtTypo.baseFontSize !== manifest.designTokens.typography.baseFontSize) {
        customTypography.baseFontSize = dtTypo.baseFontSize;
        report.explicitOverrideKeys.push("typography.baseFontSize");
      }
    }

    if (rawDesignTemplateCustom.geometry) {
      const dtGeom = rawDesignTemplateCustom.geometry;
      const normBr = normalizeLegacyBorderRadius(dtGeom.borderRadius);
      if (normBr && normBr !== manifest.designTokens.geometry.borderRadius) {
        customGeometry.borderRadius = normBr;
        report.explicitOverrideKeys.push("geometry.borderRadius");
      }
      if (dtGeom.containerMaxWidth && dtGeom.containerMaxWidth !== manifest.designTokens.geometry.containerMaxWidth) {
        customGeometry.containerMaxWidth = dtGeom.containerMaxWidth;
        report.explicitOverrideKeys.push("geometry.containerMaxWidth");
      }
      if (dtGeom.sectionSpacing && dtGeom.sectionSpacing !== manifest.designTokens.geometry.sectionSpacing) {
        customGeometry.sectionSpacing = dtGeom.sectionSpacing;
        report.explicitOverrideKeys.push("geometry.sectionSpacing");
      }
      if (dtGeom.cardStyle && dtGeom.cardStyle !== manifest.designTokens.geometry.cardStyle) {
        customGeometry.cardStyle = dtGeom.cardStyle;
        report.explicitOverrideKeys.push("geometry.cardStyle");
      }
    }
  }

  // 2. Inspect legacy.colorTheme & legacy.palette
  const rawColorTheme = (legacy as any).colorTheme;
  const rawColorThemePalette = rawColorTheme?.palette;
  const rawLegacyPalette = legacy.palette;

  // Build candidate legacy colors from colorTheme (higher priority in UI) and legacy.palette
  const candidatePrimary =
    rawColorTheme?.primary ||
    rawColorThemePalette?.primary ||
    rawLegacyPalette?.primary;
  const candidatePrimaryDark =
    rawColorThemePalette?.primaryDark &&
    (!rawColorTheme?.primary ||
      sameHex(rawColorTheme.primary, rawColorThemePalette?.primary) ||
      !sameHex(rawColorThemePalette.primaryDark, rawLegacyPalette?.primaryDark))
      ? rawColorThemePalette.primaryDark
      : sameHex(candidatePrimary, rawLegacyPalette?.primary)
      ? rawLegacyPalette?.primaryDark
      : undefined;
  const candidateSecondary =
    rawColorTheme?.secondary ||
    rawColorThemePalette?.secondary ||
    rawLegacyPalette?.secondary;
  const candidateAccent =
    rawColorTheme?.accent ||
    rawColorThemePalette?.accent ||
    rawLegacyPalette?.accent;
  const candidateText =
    rawColorThemePalette?.text ||
    rawLegacyPalette?.text;
  const candidateTextMuted = rawColorThemePalette?.textMuted;
  const candidateBackground = rawLegacyPalette?.bg;
  const candidateSurface = rawColorThemePalette?.surface;
  const candidateBorder = rawColorThemePalette?.border;

  const hasAnyLegacyColor = Boolean(
    candidatePrimary ||
      candidatePrimaryDark ||
      candidateSecondary ||
      candidateAccent ||
      candidateText ||
      candidateTextMuted ||
      candidateBackground ||
      candidateSurface ||
      candidateBorder
  );

  if (hasAnyLegacyColor) {
    // Identify if the legacy palette/colorTheme matches a known stock/preset source
    const colorThemeId = typeof rawColorTheme?.id === "string" ? rawColorTheme.id.trim() : "";
    const paletteId = typeof rawLegacyPalette?.id === "string" ? rawLegacyPalette.id.trim() : "";

    // Find matching stock palette from COLOR_PALETTES, CANONICAL_TEMPLATE_MANIFESTS, QUICKSTART_DESIGN_SET_PALETTES, or SYSTEM_BOILERPLATE_PALETTES
    const matchedStockColorPalette = COLOR_PALETTES.find(
      (cp) =>
        (paletteId && cp.id === paletteId) ||
        (sameHex(cp.primary, candidatePrimary) &&
          (!candidatePrimaryDark || sameHex(cp.primaryDark, candidatePrimaryDark)) &&
          sameHex(cp.secondary, candidateSecondary) &&
          sameHex(cp.accent, candidateAccent))
    );

    const matchedCanonicalManifest = CANONICAL_TEMPLATE_MANIFESTS.find(
      (m) =>
        colorThemeId === m.id ||
        colorThemeId === m.slug ||
        paletteId === m.id ||
        paletteId === m.slug ||
        (sameHex(m.designTokens.palette.primary, candidatePrimary) &&
          sameHex(m.designTokens.palette.secondary, candidateSecondary) &&
          sameHex(m.designTokens.palette.accent, candidateAccent))
    );

    const matchedDesignSetPalette =
      (colorThemeId && QUICKSTART_DESIGN_SET_PALETTES[colorThemeId]) ||
      ((legacy as any).designSet && QUICKSTART_DESIGN_SET_PALETTES[(legacy as any).designSet]) ||
      Object.values(QUICKSTART_DESIGN_SET_PALETTES).find(
        (dsp) =>
          sameHex(dsp.primary, candidatePrimary) &&
          sameHex(dsp.secondary, candidateSecondary) &&
          sameHex(dsp.accent, candidateAccent)
      );

    const matchedBoilerplate = SYSTEM_BOILERPLATE_PALETTES.find(
      (bp) =>
        sameHex(bp.primary, candidatePrimary) &&
        (!candidateSecondary || sameHex(bp.secondary, candidateSecondary)) &&
        (!candidateAccent || sameHex(bp.accent, candidateAccent))
    );

    // Check if candidate colors match BrandKit palette
    const isBrandKitId =
      paletteId === "palette-brand-kit" ||
      paletteId.startsWith("brandkit-") ||
      paletteId.startsWith("bkit-") ||
      colorThemeId.startsWith("brandkit-") ||
      colorThemeId.startsWith("bkit-");

    const matchesBrandKit =
      Boolean(brandKit?.palette) &&
      sameHex(candidatePrimary, brandKit!.palette.primary) &&
      (!candidateSecondary ||
        sameHex(candidateSecondary, brandKit!.palette.secondary) ||
        sameHex(candidateSecondary, manifest.designTokens.palette.secondary)) &&
      (!candidateAccent ||
        sameHex(candidateAccent, brandKit!.palette.accent) ||
        sameHex(candidateAccent, manifest.designTokens.palette.accent));

    // Check if this is createNeutralSiteConfig()'s auto-populated COLOR_PALETTES[0] ("navy-modern")
    const isNeutralConfigDefault =
      matchedStockColorPalette?.id === "navy-modern" &&
      !isExplicitCustomOverrideId &&
      (Boolean(legacy.id?.startsWith("site-fresh-")) ||
        legacy.companyName === "Yeni Web Sitemiz" ||
        Boolean(legacy.templateId?.startsWith("tmpl-")) ||
        Boolean(brandKit));

    // Check if matchedStockColorPalette is the defaultColors of a legacy template in TEMPLATES
    const legacyTemplateEntry = TEMPLATES.find((t) => t.id === legacy.templateId);
    const isLegacyTemplateDefaultPalette =
      Boolean(matchedStockColorPalette) &&
      !isExplicitCustomOverrideId &&
      (legacyTemplateEntry?.defaultColors?.id === matchedStockColorPalette!.id ||
        // Or if template was switched to a canonical tmpl-* that differs from the old stock palette's template
        Boolean(legacy.templateId?.startsWith("tmpl-")));

    const isAutoOrTemplateDefault =
      !isExplicitCustomOverrideId &&
      (isBrandKitId ||
        colorThemeId === "default" ||
        Boolean(matchedBoilerplate) ||
        Boolean(matchedCanonicalManifest) ||
        Boolean(matchedDesignSetPalette) ||
        isNeutralConfigDefault ||
        isLegacyTemplateDefaultPalette);

    // Reference baseline palette if user modified a single field on top of a stock/boilerplate/brandKit palette
    const baselineSourcePalette: Partial<TemplateColorTokens> | undefined =
      (isBrandKitId ? brandKit?.palette : undefined) ||
      matchedCanonicalManifest?.designTokens.palette ||
      (matchedDesignSetPalette as Partial<TemplateColorTokens> | undefined) ||
      (matchedStockColorPalette
        ? {
            primary: matchedStockColorPalette.primary,
            primaryDark: matchedStockColorPalette.primaryDark,
            secondary: matchedStockColorPalette.secondary,
            accent: matchedStockColorPalette.accent,
            text: matchedStockColorPalette.text,
            background: matchedStockColorPalette.bg,
          }
        : undefined) ||
      (matchedBoilerplate as Partial<TemplateColorTokens> | undefined) ||
      (colorThemeId === "default" ? (SYSTEM_BOILERPLATE_PALETTES[2] as Partial<TemplateColorTokens>) : undefined) ||
      brandKit?.palette;

    if (isExplicitCustomOverrideId) {
      // Explicit user override via UI color picker / preset
      report.classification = "explicit_user_override";
      if (candidatePrimary && !customPalette.primary) {
        customPalette.primary = candidatePrimary;
        customPalette.primaryDark =
          candidatePrimaryDark && !sameHex(candidatePrimaryDark, baselineSourcePalette?.primaryDark)
            ? candidatePrimaryDark
            : darkenColor(normalizeHexColor(candidatePrimary) || "#1e40af", 15);
        report.explicitOverrideKeys.push("palette.primary");
      }
      if (
        candidateSecondary &&
        !customPalette.secondary &&
        !sameHex(candidateSecondary, manifest.designTokens.palette.secondary) &&
        !sameHex(candidateSecondary, brandKit?.palette?.secondary)
      ) {
        customPalette.secondary = candidateSecondary;
        report.explicitOverrideKeys.push("palette.secondary");
      }
      if (
        candidateAccent &&
        !customPalette.accent &&
        !sameHex(candidateAccent, manifest.designTokens.palette.accent) &&
        !sameHex(candidateAccent, brandKit?.palette?.accent)
      ) {
        customPalette.accent = candidateAccent;
        report.explicitOverrideKeys.push("palette.accent");
      }
    } else if (matchesBrandKit) {
      // Colors match BrandKit (Priority 2) - do not promote into Priority 3 customTokens
      if (report.explicitOverrideKeys.length === 0) {
        report.classification = "brandkit_derived";
      }
      report.ignoredAutoDefaultKeys.push("palette (matches BrandKit)");
    } else if (brandKit) {
      // BrandKit is present on the site.
      // Only treat a legacy color field as an explicit user override if it was genuinely modified
      // away from all known stock/boilerplate/template defaults AND differs from BrandKit!
      if (isAutoOrTemplateDefault && baselineSourcePalette) {
        // Check if a specific field (like primary) was modified on top of the stock/boilerplate palette
        if (
          candidatePrimary &&
          !sameHex(candidatePrimary, baselineSourcePalette.primary) &&
          !sameHex(candidatePrimary, brandKit.palette.primary) &&
          !sameHex(candidatePrimary, manifest.designTokens.palette.primary)
        ) {
          customPalette.primary = candidatePrimary;
          customPalette.primaryDark = darkenColor(normalizeHexColor(candidatePrimary) || "#1e40af", 15);
          report.explicitOverrideKeys.push("palette.primary");
          report.classification = "explicit_user_override";
        } else {
          report.ignoredAutoDefaultKeys.push("palette (auto/template default ignored in favor of BrandKit)");
          if (report.explicitOverrideKeys.length === 0) {
            report.classification = "brandkit_derived";
          }
        }
      } else if (!matchedStockColorPalette && !matchedBoilerplate && !matchedCanonicalManifest && !matchedDesignSetPalette) {
        // Custom hex color on colorTheme/palette that matches no stock preset and differs from BrandKit
        if (
          candidatePrimary &&
          !sameHex(candidatePrimary, brandKit.palette.primary) &&
          !sameHex(candidatePrimary, manifest.designTokens.palette.primary) &&
          // Guard against un-ID'd boilerplate primary colors (#1e40af, #2563eb, #0284c7 default fixture) when rawColorTheme.primary wasn't explicitly set
          Boolean(rawColorTheme?.primary || rawColorThemePalette?.primary)
        ) {
          customPalette.primary = candidatePrimary;
          customPalette.primaryDark = darkenColor(normalizeHexColor(candidatePrimary) || "#1e40af", 15);
          report.explicitOverrideKeys.push("palette.primary");
          report.classification = "explicit_user_override";
        } else {
          report.ignoredAutoDefaultKeys.push("palette (legacy unlabelled palette deferred to BrandKit)");
          if (report.explicitOverrideKeys.length === 0) {
            report.classification = "brandkit_derived";
          }
        }
      } else {
        report.ignoredAutoDefaultKeys.push("palette (stock preset ignored in favor of BrandKit)");
        if (report.explicitOverrideKeys.length === 0) {
          report.classification = "brandkit_derived";
        }
      }
    } else {
      // NO BrandKit is present on the site.
      if (isAutoOrTemplateDefault) {
        // Check if primary was customized on top of onboarding/default palette (e.g. onboardingService input.brandColor)
        if (
          candidatePrimary &&
          baselineSourcePalette?.primary &&
          !sameHex(candidatePrimary, baselineSourcePalette.primary) &&
          !sameHex(candidatePrimary, manifest.designTokens.palette.primary)
        ) {
          customPalette.primary = candidatePrimary;
          customPalette.primaryDark = darkenColor(normalizeHexColor(candidatePrimary) || "#1e40af", 15);
          report.explicitOverrideKeys.push("palette.primary");
          report.classification = "explicit_user_override";
        } else {
          report.ignoredAutoDefaultKeys.push("palette (auto/template default)");
          if (report.explicitOverrideKeys.length === 0) {
            report.classification = matchedCanonicalManifest ? "template_default" : "auto_default";
          }
        }
      } else {
        // Genuinely customized legacy site palette or ambiguous legacy palette (when no BrandKit exists)
        const isIntentionalStockSelection =
          Boolean(matchedStockColorPalette) &&
          !isNeutralConfigDefault &&
          !isLegacyTemplateDefaultPalette;

        if (!isIntentionalStockSelection && !paletteId && !colorThemeId) {
          report.ambiguities.push(
            "Legacy palette has custom colors without an explicit palette/colorTheme ID; preserving values to avoid silently changing customer branding."
          );
          report.classification = "ambiguous_preserved";
        } else {
          report.classification = "preserved_legacy_custom";
        }

        const applyIfDiffersFromManifest = (
          key: keyof TemplateColorTokens,
          val: string | undefined,
          boilerplateVal?: string
        ) => {
          if (!val || customPalette[key]) return;
          if (sameHex(val, manifest.designTokens.palette[key])) return;
          if (boilerplateVal && sameHex(val, boilerplateVal) && !isIntentionalStockSelection) return;
          customPalette[key] = val;
          report.preservedLegacyKeys.push(`palette.${key}`);
        };

        applyIfDiffersFromManifest("primary", candidatePrimary);
        if (customPalette.primary) {
          if (candidatePrimaryDark && !sameHex(candidatePrimaryDark, "#1e3a8a") && !sameHex(candidatePrimaryDark, "#1d4ed8")) {
            applyIfDiffersFromManifest("primaryDark", candidatePrimaryDark);
          } else {
            customPalette.primaryDark = darkenColor(normalizeHexColor(customPalette.primary) || "#1e40af", 15);
          }
        }
        applyIfDiffersFromManifest("secondary", candidateSecondary);
        applyIfDiffersFromManifest("accent", candidateAccent);
        applyIfDiffersFromManifest("text", candidateText, "#0f172a");
        applyIfDiffersFromManifest("textMuted", candidateTextMuted, "#64748b");
        applyIfDiffersFromManifest("background", candidateBackground, "#ffffff");
        applyIfDiffersFromManifest("surface", candidateSurface, "#ffffff");
        applyIfDiffersFromManifest("border", candidateBorder, "#e2e8f0");
      }
    }
  }

  // 3. Inspect legacy fontFamily & borderRadius (ignore auto-populated and manifest defaults!)
  const rawFont = (rawColorTheme?.fontFamily || legacy.fontFamily || "").trim();
  if (rawFont) {
    if (
      AUTO_POPULATED_FONT_FAMILIES.has(rawFont.toLowerCase()) ||
      rawFont.toLowerCase() === manifest.designTokens.typography.fontHeading.toLowerCase() ||
      rawFont.toLowerCase() === manifest.designTokens.typography.fontBody.toLowerCase()
    ) {
      report.ignoredAutoDefaultKeys.push("typography.fontFamily");
    } else if (!customTypography.fontHeading) {
      customTypography.fontHeading = rawFont;
      report.preservedLegacyKeys.push("typography.fontHeading");
      if (report.classification === "none" || report.classification === "auto_default") {
        report.classification = "preserved_legacy_custom";
      }
    }
  }

  const rawRadius = (rawColorTheme?.borderRadius || legacy.borderRadius || "").trim();
  if (rawRadius) {
    if (AUTO_POPULATED_BORDER_RADII.has(rawRadius.toLowerCase())) {
      report.ignoredAutoDefaultKeys.push("geometry.borderRadius");
    } else {
      const normalizedRadius = normalizeLegacyBorderRadius(rawRadius);
      if (
        normalizedRadius &&
        normalizedRadius !== manifest.designTokens.geometry.borderRadius &&
        !customGeometry.borderRadius
      ) {
        customGeometry.borderRadius = normalizedRadius;
        report.preservedLegacyKeys.push("geometry.borderRadius");
        if (report.classification === "none" || report.classification === "auto_default") {
          report.classification = "preserved_legacy_custom";
        }
      }
    }
  }

  const hasCustomPalette = Object.keys(customPalette).length > 0;
  const hasCustomTypography = Object.keys(customTypography).length > 0;
  const hasCustomGeometry = Object.keys(customGeometry).length > 0;
  const hasCustomHeader = Boolean(rawDesignTemplateCustom?.header);
  const hasCustomFooter = Boolean(rawDesignTemplateCustom?.footer);

  const customTokens: CustomDesignTokens | undefined =
    hasCustomPalette || hasCustomTypography || hasCustomGeometry || hasCustomHeader || hasCustomFooter
      ? {
          ...(hasCustomPalette ? { palette: customPalette } : {}),
          ...(hasCustomTypography ? { typography: customTypography } : {}),
          ...(hasCustomGeometry ? { geometry: customGeometry } : {}),
          ...(hasCustomHeader ? { header: rawDesignTemplateCustom!.header } : {}),
          ...(hasCustomFooter ? { footer: rawDesignTemplateCustom!.footer } : {}),
        }
      : undefined;

  return { customTokens, provenance: report };
}

/**
 * Transforms a legacy SiteConfig into the canonical Site aggregate model.
 */
export function fromLegacySiteConfig(legacy: SiteConfig): CanonicalSite {
  const resolvedManifest = resolveCanonicalManifestForLegacy(legacy);
  const { customTokens, provenance } = inspectLegacyTokenProvenance(legacy, resolvedManifest);
  const brandKit: BrandKit | undefined =
    (legacy as any).brandKit || (legacy as any).businessProfile?.branding?.brandKit;

  // 1. Business Profile
  const businessProfile: BusinessProfile = {
    identity: {
      companyName: legacy.companyName || "İşletme Adı",
      brandName: legacy.companyName,
      sector: legacy.sector || "general",
      industryPackId: undefined,
      slogan: legacy.slogan || (legacy as any).tagline || "",
      shortDescription: legacy.slogan || (legacy as any).tagline || "",
      story: legacy.about?.content || "",
      foundingYear: undefined,
      taxId: legacy.schemaConfig?.taxId,
    },
    contact: {
      phone: legacy.phone || "",
      whatsapp: legacy.whatsapp || "",
      email: legacy.email || "",
      supportEmail: legacy.email || undefined,
    },
    location: {
      address: legacy.address || "",
      city: legacy.city || "",
      district: (legacy as any).district || "",
      postalCode: legacy.schemaConfig?.postalCode,
      country: "Türkiye",
      serviceAreas: Array.isArray((legacy as any).serviceAreas)
        ? (legacy as any).serviceAreas
        : legacy.schemaConfig?.areaServed
        ? [legacy.schemaConfig.areaServed]
        : [],
      geoCoordinates:
        legacy.schemaConfig?.latitude && legacy.schemaConfig?.longitude
          ? {
              latitude: parseFloat(legacy.schemaConfig.latitude) || 0,
              longitude: parseFloat(legacy.schemaConfig.longitude) || 0,
            }
          : undefined,
      googleMapsEmbedUrl: legacy.googleMapsEmbed,
    },
    branding: {
      logoUrl: legacy.logo || (legacy as any).logoUrl || legacy.header?.logoImage,
      logoAlt: legacy.hero?.logoAlt,
      faviconUrl: legacy.favicon,
      brandColors: {
        primary: customTokens?.palette?.primary || brandKit?.palette?.primary || resolvedManifest.designTokens.palette.primary,
        secondary: customTokens?.palette?.secondary || brandKit?.palette?.secondary || resolvedManifest.designTokens.palette.secondary,
        accent: customTokens?.palette?.accent || brandKit?.palette?.accent || resolvedManifest.designTokens.palette.accent,
      },
      brandKit,
    },
    workingHours: {
      raw: legacy.workingHours || "Hafta İçi: 09:00 - 18:00",
      is24x7Emergency: legacy.workingHours?.toLowerCase().includes("7/24"),
    },
    services: (legacy.services?.items || []).map((srv) => ({
      id: srv.id,
      title: srv.title || (srv as any).name || "",
      slug: srv.slug || srv.id,
      shortDescription: srv.desc || (srv as any).description || "",
      fullDescription: srv.longContent || srv.longDesc,
      priceHint: srv.price,
      features: srv.features || [],
      icon: srv.icon,
      imageUrl: srv.image,
      featured: true,
      specs: srv.specs,
    })),
    metrics: {
      yearsOfExperience: parseInt(legacy.about?.yearsExperience || "0", 10) || undefined,
      completedJobsCount: parseInt(legacy.about?.completedProjects || "0", 10) || undefined,
    },
    social: {
      instagram: legacy.socialMedia?.instagram,
      facebook: legacy.socialMedia?.facebook,
      twitter: legacy.socialMedia?.twitter,
      linkedin: legacy.socialMedia?.linkedin,
      youtube: legacy.socialMedia?.youtube,
    },
  };

  // 2. Active Design Config (Clean Precedence: TemplateManifest < BrandKit < Explicit User Overrides)
  const explicitVariants = (legacy as any).designTemplate?.sectionVariants || {};
  const designTemplate: ActiveDesignConfig = {
    templateId: resolvedManifest.id,
    templateSlug: resolvedManifest.slug,
    templateVersion: resolvedManifest.version || "1.0.0",
    ...(customTokens ? { customTokens } : {}),
    sectionVariants: {
      ...resolvedManifest.sectionRecipe,
      ...explicitVariants,
    },
  };
  (designTemplate as any).tokenProvenance = provenance;

  // 3. Section Configuration
  const validSectionTypes: Record<string, CanonicalSectionType> = {
    hero: "hero",
    services: "services",
    about: "about",
    whyUs: "whyUs",
    gallery: "gallery",
    pricing: "pricing",
    testimonials: "testimonials",
    faq: "faqs",
    faqs: "faqs",
    contact: "contact",
    products: "products",
    catalog: "products",
    blog: "blog",
    newsletter: "newsletter",
    socialFeed: "socialFeed",
  };

  const sections: SiteSectionItem[] = (legacy.homepageSections || []).map((sec, idx) => {
    const rawId = sec.id ? sec.id.replace(/^sec-/, "") : "";
    const resolvedType = validSectionTypes[sec.id] || validSectionTypes[rawId] || "customHtml";
    const recipeVariant = (designTemplate.sectionVariants as Record<string, string | undefined>)?.[resolvedType];
    const explicitSecVariant = (sec as any).variant;
    return {
      id: sec.id,
      type: resolvedType,
      label: sec.name || sec.id,
      enabled: sec.enabled ?? true,
      order: sec.order ?? idx,
      variant:
        explicitSecVariant && explicitSecVariant !== "default"
          ? explicitSecVariant
          : recipeVariant || "default",
      options: {},
    };
  });

  const sectionConfiguration: SectionConfiguration = {
    sections,
    header: {
      sticky: true,
      showPhoneButton: legacy.header?.showPhoneButton ?? true,
      showWhatsAppButton: legacy.header?.showWhatsappButton ?? true,
      showCtaButton: legacy.header?.showQuoteButton ?? true,
      ctaText: legacy.header?.quoteButtonText || "Teklif Al",
      ctaTarget: "#contact",
      navLinks: (legacy.header?.navItems || []).map((nav) => ({
        id: nav.id,
        label: nav.label,
        target: nav.target,
        visible: nav.visible,
        order: nav.order,
      })),
    },
    footer: {
      showWorkingHours: true,
      showSocialIcons: legacy.footer?.showSocials ?? true,
      showQuickLinks: true,
      showCopyright: Boolean(legacy.footer?.copyrightText),
      customDisclaimer: legacy.footer?.aboutText,
    },
  };

  // 4. Site Content
  const content: SiteContent = {
    hero: {
      badge: legacy.hero?.badge || "",
      title: legacy.hero?.title || "",
      subtitle: legacy.hero?.subtitle || "",
      ctaPrimaryText: legacy.hero?.ctaPrimaryText || "",
      ctaPrimaryLink: legacy.hero?.ctaPrimaryLink || "",
      ctaSecondaryText: legacy.hero?.ctaSecondaryText || "",
      ctaSecondaryLink: legacy.hero?.ctaSecondaryLink || "",
      bgImageUrl: legacy.hero?.bgImage || "",
      bgImageAlt: legacy.hero?.bgImageAlt,
      slides: legacy.hero?.slides?.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        badge: s.badge,
        imageUrl: s.bgImage,
        ctaText: s.ctaPrimaryText,
        ctaLink: s.ctaPrimaryLink,
      })),
      stats: legacy.hero?.stats || [],
    },
    about: {
      badge: legacy.about?.badge || "",
      title: legacy.about?.title || "",
      contentHtml: legacy.about?.content || "",
      yearsExperience: legacy.about?.yearsExperience,
      completedProjects: legacy.about?.completedProjects,
      bulletPoints: legacy.about?.bullets || [],
      imageUrl: legacy.about?.image || "",
      imageAlt: legacy.about?.imageAlt,
    },
    whyUs: {
      badge: legacy.whyUs?.badge || "",
      title: legacy.whyUs?.title || "",
      subtitle: legacy.whyUs?.subtitle || "",
      items: (legacy.whyUs?.items || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.desc,
        icon: item.icon,
      })),
    },
    contact: {
      badge: legacy.contact?.badge || "",
      title: legacy.contact?.title || "",
      subtitle: legacy.contact?.subtitle || "",
    },
    gallery: (legacy.gallery?.items || []).map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      imageUrl: g.imageUrl,
      altText: g.altText || g.imageAlt,
      caption: g.caption,
    })),
    testimonials: (legacy.testimonials?.items || []).map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      comment: t.comment,
      rating: t.rating,
      avatarUrl: t.avatar,
      altText: t.altText || t.avatarAlt,
      date: t.date,
      verified: t.verified,
    })),
    faqs: (legacy.faqs?.items || legacy.faq?.items || []).map((f) => ({
      id: f.id,
      question: f.question || f.q,
      answer: f.answer || f.a,
      category: f.category,
      isOpenDefault: f.isOpenDefault,
    })),
    pricingPlans: (legacy.pricing?.items || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      period: p.period,
      description: p.description || p.desc || "",
      badge: p.badge,
      features: p.features || [],
      ctaButtonText: p.cta,
      ctaButtonLink: "#contact",
      isPopular: p.popular || p.highlighted,
    })),
    customPages: (legacy.pages || []).map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      contentHtml: page.content,
      bannerImageUrl: page.bannerImage,
      isNavVisible: page.isNavVisible,
      seoTitle: page.seoTitle,
      metaDescription: page.metaDescription,
    })),
    blogPosts: (legacy.blog?.items || []).map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      category: b.category,
      excerpt: b.excerpt,
      contentHtml: b.content,
      readTime: b.readTime,
      date: b.date,
      author: b.author,
      coverImageUrl: b.coverImage || b.image,
      tags: b.tags || [],
      seoTitle: b.seoTitle,
      seoDescription: b.seoDescription,
    })),
    catalogProducts: (legacy.products?.items || []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug || p.id,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      shortDescription: p.shortDescription,
      descriptionHtml: p.description,
      images: p.images || (p.featuredImage ? [p.featuredImage] : []),
      inStock: p.inStock,
      badge: p.badge,
      specs: p.specs,
    })),
    pages: (legacy.canonicalPages && legacy.canonicalPages.length > 0)
      ? legacy.canonicalPages
      : (legacy as any).content?.pages || undefined,
    mediaAssets: (legacy.canonicalMediaAssets && legacy.canonicalMediaAssets.length > 0)
      ? legacy.canonicalMediaAssets
      : (legacy as any).content?.mediaAssets || undefined,
  };

  // 5. Site Settings
  const settings: SiteSettings = {
    structureMode: (legacy.siteType === "multi-page" || (legacy as any).structureMode === "multi-page" || (legacy as any).siteMode === "MULTI_PAGE") ? "multi-page" : "single-page",
    siteMode: ((legacy as any).siteMode === "MULTI_PAGE" || legacy.siteType === "multi-page" || (legacy as any).structureMode === "multi-page") ? "MULTI_PAGE" : "LANDING",
    domain: {
      hostname: legacy.customDomain || `${legacy.id}.jetkur.site`,
      isCustom: Boolean(legacy.customDomain),
      status: legacy.cloudflare?.status === "deployed" ? "active" : "pending_dns",
      sslActive: Boolean(legacy.cloudflare?.sslActive),
    },
    deployment: {
      provider: "cloudflare_pages",
      status: legacy.cloudflare?.status || "idle",
      productionUrl: legacy.cloudflare?.deployedUrl,
      lastDeployedAt: legacy.cloudflare?.lastDeployedAt,
    },
    seo: {
      metaTitle: legacy.seo?.metaTitle || legacy.companyName || "",
      metaDescription: legacy.seo?.metaDescription || "",
      keywords: legacy.seo?.keywords || "",
      author: legacy.seo?.author || legacy.companyName || "",
      robots: legacy.seo?.robots || "index, follow",
      canonicalUrl: legacy.seo?.canonicalUrl,
      ogImageUrl: legacy.seo?.ogImage,
      twitterHandle: legacy.seo?.twitterHandle,
      googleSearchConsoleTag: legacy.seo?.googleSearchConsoleTag,
      schemaConfig: {
        enabled: legacy.schemaConfig?.enabled ?? true,
        businessType: legacy.schemaConfig?.businessType || "LocalBusiness",
        autoInjectLocalBusiness: legacy.schemaConfig?.autoInjectLocalBusiness ?? true,
        autoInjectProducts: legacy.schemaConfig?.autoInjectProducts ?? true,
        autoInjectFaq: legacy.schemaConfig?.autoInjectFaq ?? true,
        autoInjectBreadcrumbs: legacy.schemaConfig?.autoInjectBreadcrumbs ?? true,
        priceRange: legacy.schemaConfig?.priceRange,
        currency: legacy.schemaConfig?.currency || "TRY",
      },
    },
    analytics: {},
    whatsappWidget: {
      enabled: legacy.whatsappWidget?.enabled ?? true,
      phoneNumber: legacy.whatsappWidget?.phoneNumber || legacy.whatsapp,
      defaultMessage:
        legacy.whatsappWidget?.defaultMessage ||
        "Merhaba, web sitenizden ulaşıyorum. Hizmetleriniz hakkında bilgi alabilir miyim?",
      position: legacy.whatsappWidget?.position || "bottom-right",
      showOnlineBadge: legacy.whatsappWidget?.showBadgeDot ?? true,
      agentName: legacy.whatsappWidget?.agentName,
      agentAvatarUrl: undefined,
    },
    leads: {
      enableInstantEmailNotification: Boolean(legacy.leadNotifications?.enabled),
      notificationEmail: legacy.leadNotifications?.email?.recipientEmails,
      autoArchiveDays: legacy.leadAutoArchive?.enabled ? legacy.leadAutoArchive.daysInactive : undefined,
      thankYouEmailAutoresponder: legacy.leadThankYouEmail
        ? {
            enabled: legacy.leadThankYouEmail.enabled,
            subject: legacy.leadThankYouEmail.subject,
            bodyHtml: legacy.leadThankYouEmail.body,
            senderName: legacy.leadThankYouEmail.senderName,
          }
        : undefined,
    },
    performance: {
      enableEdgeCache: true,
      lazyLoadImages: true,
      minifyStaticHtml: true,
      criticalCssInline: true,
    },
    locale: {
      defaultLocale: "tr",
      supportedLocales: ["tr"],
    },
  };

  return {
    id: legacy.id,
    workspaceId: (legacy as any).workspaceId,
    schemaVersion: "1.0.0",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    businessProfile,
    industryPackId: undefined,
    designTemplate,
    sectionConfiguration,
    content,
    settings,
    brandKit,
  };
}

/**
 * Transforms a CanonicalSite aggregate model back into the legacy SiteConfig representation.
 */
export function toLegacySiteConfig(canonical: CanonicalSite): SiteConfig {
  const profile = canonical.businessProfile;
  const content = canonical.content;
  const settings = canonical.settings;
  const dt = canonical.designTemplate;
  const bKit: BrandKit | undefined = canonical.brandKit || (profile.branding as any)?.brandKit;

  const manifest =
    resolveTemplate(dt?.templateId) ||
    resolveTemplate(dt?.templateSlug) ||
    CANONICAL_TEMPLATE_MANIFESTS[0];

  const resolvedTokens = resolveDesignTokens(
    manifest.designTokens,
    bKit,
    dt?.customTokens
  );
  const tokens = resolvedTokens.palette;

  const hasExplicitPaletteOverride = Boolean(
    dt?.customTokens?.palette && Object.keys(dt.customTokens.palette).length > 0
  );

  const resolvedPaletteId = hasExplicitPaletteOverride
    ? "custom-override"
    : bKit
    ? bKit.id || "palette-brand-kit"
    : manifest.id;

  const resolvedPaletteName = hasExplicitPaletteOverride
    ? "Özel Renk Paleti"
    : bKit
    ? "Logodan Çıkarılan Marka Paleti"
    : manifest.name;

  const borderRadiusCssMap: Record<TemplateGeometryTokens["borderRadius"], string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  };
  const resolvedBorderRadius =
    borderRadiusCssMap[resolvedTokens.geometry.borderRadius] || "8px";

  const resolvedLogo =
    profile.branding.logoUrl ||
    (profile.branding as any)?.brandKit?.logo?.url ||
    canonical.brandKit?.logo?.url ||
    (canonical.brandKit?.logo?.svgContent
      ? `data:image/svg+xml;utf8,${encodeURIComponent(canonical.brandKit.logo.svgContent)}`
      : undefined) ||
    ((profile.branding as any)?.brandKit?.logo?.svgContent
      ? `data:image/svg+xml;utf8,${encodeURIComponent((profile.branding as any).brandKit.logo.svgContent)}`
      : undefined);

  const cleanPhone = profile.contact.phone?.trim() || "";
  const cleanWhatsapp = profile.contact.whatsapp?.trim() || cleanPhone;
  const telLink = cleanPhone ? `tel:${cleanPhone.replace(/[^0-9+]/g, "")}` : "#contact";
  const waLink = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp.replace(/[^0-9]/g, "")}`
    : "#contact";

  return {
    id: canonical.id,
    siteId: canonical.id,
    workspaceId: (canonical as any).workspaceId,
    templateId: dt?.templateId || manifest.id,
    theme: dt?.templateSlug || manifest.slug,
    designTemplate: dt,
    fontFamily: resolvedTokens.typography.fontHeading,
    borderRadius: resolvedBorderRadius,
    siteType: (canonical.settings.siteMode === "MULTI_PAGE" || canonical.settings.structureMode === "multi-page") ? "multi-page" : "single-page",
    siteMode: (canonical.settings.siteMode === "MULTI_PAGE" || canonical.settings.structureMode === "multi-page") ? "MULTI_PAGE" : "LANDING",
    companyName: profile.identity.companyName,
    sector: profile.identity.sector || "general",
    slogan: profile.identity.slogan || "",
    phone: cleanPhone,
    whatsapp: cleanWhatsapp,
    email: profile.contact.email || "",
    address: profile.location.address || "",
    city: profile.location.city || "İstanbul",
    district: profile.location.district || "",
    serviceAreas: profile.location.serviceAreas || [],
    logo: resolvedLogo,
    logoUrl: resolvedLogo,

    // Header with proper logoType and logoImage
    header: {
      logoType: resolvedLogo ? "image" : "icon",
      logoImage: resolvedLogo || "",
      logoHeight: 44,
      showPhoneButton: Boolean(cleanPhone),
      phoneButtonText: "Hemen Ara",
      showWhatsappButton: Boolean(cleanWhatsapp),
      whatsappButtonText: "WhatsApp",
      showQuoteButton: true,
      quoteButtonText: "Teklif Al",
      navItems: [
        { id: "nav-home", label: "Ana Sayfa", target: "home", enabled: true },
        { id: "nav-services", label: "Hizmetlerimiz", target: "services", enabled: true },
        { id: "nav-about", label: "Hakkımızda", target: "about", enabled: true },
        { id: "nav-contact", label: "İletişim", target: "contact", enabled: true },
      ],
      showSocials: false,
    },

    // Hero section
    hero: {
      badge: content.hero?.badge || "Profesyonel Hizmet",
      title: content.hero?.title || profile.identity.companyName,
      subtitle: content.hero?.subtitle || profile.identity.slogan || "",
      ctaPrimaryText: content.hero?.ctaPrimaryText || "Hemen Ara",
      ctaPrimaryLink: content.hero?.ctaPrimaryLink || telLink,
      ctaSecondaryText: content.hero?.ctaSecondaryText || "WhatsApp Bilgi Al",
      ctaSecondaryLink: content.hero?.ctaSecondaryLink || waLink,
      bgImage: content.hero?.bgImageUrl || "",
      stats: (content.hero?.stats && content.hero.stats.length > 0)
        ? content.hero.stats
        : [
            { label: "Müşteri Memnuniyeti", value: "%100" },
            { label: "Hizmet Garantisi", value: "Tam Güvence" },
            { label: "Deneyim", value: "Uzman Kadro" },
          ],
    },

    // About section
    about: {
      title: content.about?.title || "Hakkımızda",
      content:
        content.about?.contentHtml ||
        profile.identity.shortDescription ||
        `${profile.identity.companyName} olarak uzman kadromuz ve kaliteli hizmet anlayışımızla yanınızdayız.`,
      image: content.about?.imageUrl || "",
      experienceYears: Number(content.about?.yearsExperience || 10),
      completedJobs: Number(content.about?.completedProjects || 500),
      happyClients: 100,
      bullets: content.about?.bulletPoints || [
        "Garantili ve Güvenilir İşçilik",
        "Hızlı ve Zamanında Teslimat",
        "Şeffaf ve Uygun Fiyat Politikası",
      ],
    },

    // Services
    services: {
      title: "Hizmetlerimiz",
      subtitle: `${profile.identity.companyName} güvencesiyle sunduğumuz profesyonel çözümler`,
      items: (profile.services || []).map((s, idx) => ({
        id: s.id || `srv-${idx + 1}`,
        title: s.title,
        description: s.shortDescription || "",
        icon: (s.icon as any) || "CheckCircle2",
        price: s.priceHint || "",
        image: s.imageUrl || "",
        featured: s.featured ?? (idx < 3),
      })),
    },

    // Gallery
    gallery: {
      enabled: (content.gallery?.length || 0) > 0,
      title: "Fotoğraf & Proje Vitrini",
      subtitle: `${profile.identity.companyName} çalışmalarından kareler`,
      items: (content.gallery || []).map((g, idx) => ({
        id: g.id || `gal-${idx + 1}`,
        title: g.title || "Çalışma Görseli",
        category: g.category || "Hizmetlerimiz",
        imageUrl: g.imageUrl || "",
        imageAlt: g.altText || profile.identity.companyName,
      })),
    },

    // Testimonials
    testimonials: {
      enabled: (content.testimonials?.length || 0) > 0,
      title: "Müşteri Yorumları & Puanlar",
      subtitle: "Bizi tercih eden mutlu müşterilerimizin deneyimleri",
      items: (content.testimonials || []).map((t, idx) => ({
        id: t.id || `t-${idx + 1}`,
        name: t.name,
        role: t.role || "Müşteri",
        content: t.comment,
        rating: t.rating || 5,
      })),
    },

    // Palette & BrandKit
    palette: {
      id: resolvedPaletteId,
      name: resolvedPaletteName,
      primary: tokens.primary,
      primaryDark: tokens.primaryDark,
      secondary: tokens.secondary,
      accent: tokens.accent,
      text: tokens.text,
      bg: tokens.background,
      navBg: tokens.surface,
      footerBg: tokens.secondary,
    },
    colorTheme: {
      id: resolvedPaletteId,
      name: resolvedPaletteName,
      primary: tokens.primary,
      secondary: tokens.secondary,
      accent: tokens.accent,
      fontFamily: resolvedTokens.typography.fontHeading,
      borderRadius: resolvedBorderRadius,
      palette: {
        primary: tokens.primary,
        primaryDark: tokens.primaryDark,
        secondary: tokens.secondary,
        accent: tokens.accent,
        text: tokens.text,
        textMuted: tokens.textMuted,
        surface: tokens.surface,
        border: tokens.border,
      },
    },
    brandKit: bKit,

    workingHours: profile.workingHours?.raw || "Pazartesi - Cumartesi: 08:30 - 19:30",

    // FAQs
    faqs: {
      enabled: (content.faqs?.length || 0) > 0,
      title: "Sıkça Sorulan Sorular",
      items: (content.faqs || []).map((f, idx) => ({
        id: f.id || `faq-${idx + 1}`,
        question: f.question,
        answer: f.answer,
      })),
    },

    // Homepage sections
    homepageSections: (canonical.sectionConfiguration?.sections || [
      { id: "hero", name: "Giriş (Hero)", enabled: true, order: 1 },
      { id: "services", name: "Hizmetlerimiz", enabled: true, order: 2 },
      { id: "about", name: "Hakkımızda", enabled: true, order: 3 },
      { id: "whyUs", name: "Neden Biz?", enabled: true, order: 4 },
      { id: "gallery", name: "Galeri", enabled: (content.gallery?.length || 0) > 0, order: 5 },
      { id: "testimonials", name: "Yorumlar", enabled: (content.testimonials?.length || 0) > 0, order: 6 },
      { id: "faqs", name: "Sık Sorulan Sorular", enabled: (content.faqs?.length || 0) > 0, order: 7 },
      { id: "contact", name: "İletişim", enabled: true, order: 8 },
    ]).map((sec, idx) => ({
      id: sec.id || `sec-${idx + 1}`,
      name: sec.name || sec.type,
      enabled: sec.enabled ?? true,
      order: sec.order ?? (idx + 1),
    })),

    // Footer
    footer: {
      aboutText:
        profile.identity.shortDescription ||
        `${profile.identity.companyName} olarak kaliteli ve güvenilir hizmet sunuyoruz.`,
      copyrightText: `© ${new Date().getFullYear()} ${profile.identity.companyName}. Tüm Hakları Saklıdır.`,
      showSocials: false,
    },

    // SEO
    seo: {
      metaTitle: settings.seo?.metaTitle || profile.identity.companyName,
      metaDescription: settings.seo?.metaDescription || `${profile.identity.companyName} resmi web sitesi.`,
      keywords: settings.seo?.keywords || `${profile.identity.companyName}, ${profile.identity.sector}`,
      canonicalUrl: settings.seo?.canonicalUrl,
    },

    // Cloudflare / Domain
    cloudflare: {
      subdomain: settings.domain?.hostname?.split(".")[0] || canonical.id,
      customDomain: settings.domain?.isCustom ? settings.domain.hostname : undefined,
      deployedUrl: settings.deployment?.productionUrl,
      status: settings.deployment?.status === "deployed" ? "deployed" : (settings.deployment?.status || "idle"),
      lastDeployedAt: settings.deployment?.lastDeployedAt,
      sslActive: Boolean(settings.domain?.sslActive),
    },
    customDomain: settings.domain?.isCustom ? settings.domain.hostname : undefined,
    deploymentStatus: settings.deployment?.status === "deployed" ? "DEPLOYED" : "DRAFT",
    canonicalPages: canonical.content.pages || undefined,
    canonicalMediaAssets: canonical.content.mediaAssets || undefined,
  } as unknown as SiteConfig;
}

export const toSiteConfig = toLegacySiteConfig;

