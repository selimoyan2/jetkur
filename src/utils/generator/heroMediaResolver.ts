/**
 * JetKur Canonical Page Hero Media & Slider Resolver (Sprint 17 / Content Foundation 05A.2)
 *
 * Implements:
 * 1. Tenant-scoped MediaAsset resolution for PageContent.heroMediaIds in saved order.
 * 2. Cross-tenant media isolation (strictly rejects MediaAssets from another siteId or workspaceId).
 * 3. SINGLE hero mode rendering with responsive dimensions, aspect-ratio, object-fit, and alt text.
 * 4. SLIDER hero mode rendering with accessible prev/next controls, indicator dots, and slide order preservation.
 * 5. Automatic graceful degradation:
 *    - SLIDER with 1 valid image -> Static SINGLE hero (zero slider JS)
 *    - SINGLE or SLIDER with 0 valid images -> Clean TEXT_ONLY hero (zero broken image placeholders, zero slider JS)
 * 6. Nested page relative image path resolution (e.g. "../assets/..." from hakkimizda/index.html).
 */

import { CanonicalSite } from "../../domain/site/site";
import { PageContent, HeroMediaMode } from "../../domain/site/pageContent";
import { MediaAsset, MediaVariant } from "../../domain/media/types";
import { sanitizeImageUrl } from "../../domain/media/sanitizer";
import { SiteConfig } from "../../types";
import { RenderContext } from "./types";
import { escapeHtml } from "./security";

export interface ResolvedPageHeroMedia {
  /** Effective rendered mode after validating available MediaAssets */
  effectiveMode: "TEXT_ONLY" | "SINGLE" | "SLIDER";
  /** Configured mode on PageContent ("SINGLE" | "SLIDER") */
  configuredMode: HeroMediaMode;
  /** Resolved, tenant-verified MediaAssets in exact saved order */
  assets: MediaAsset[];
  /** True ONLY when configuredMode === "SLIDER" and assets.length >= 2 */
  requiresSliderJs: boolean;
}

/**
 * Curated platform-safe default library assets selectable in SimpleMerchantMode Media Library.
 */
const CURATED_LIBRARY_ASSETS: Array<{
  id: string;
  originalUrl: string;
  title: string;
  altText: string;
  width: number;
  height: number;
  aspectRatio: string;
}> = [
  {
    id: "media-srv-repair",
    originalUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    title: "Profesyonel Servis ve Montaj",
    altText: "Profesyonel Servis ve Montaj",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
  {
    id: "media-srv-tools",
    originalUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
    title: "Uzman Ekip ve Ekipman",
    altText: "Uzman Ekip ve Ekipman",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
  {
    id: "media-srv-diagnostics",
    originalUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80",
    title: "Cihaz Arıza Tespiti",
    altText: "Cihaz Arıza Tespiti",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
  {
    id: "media-srv-installation",
    originalUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1600&q=80",
    title: "Hızlı Kurulum ve Bakım",
    altText: "Hızlı Kurulum ve Bakım",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
  {
    id: "media-srv-clean",
    originalUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1600&q=80",
    title: "Hijyen ve Detaylı Temizlik",
    altText: "Hijyen ve Detaylı Temizlik",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
  {
    id: "media-srv-support",
    originalUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80",
    title: "Teknik Servis ve Destek",
    altText: "Teknik Servis ve Destek",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
];

/**
 * Verifies that a MediaAsset belongs to the target CanonicalSite tenant and is safe to render.
 * Rejects cross-tenant assets (mismatched siteId or workspaceId) and malformed records.
 */
export function isTenantAuthorizedMediaAsset(
  asset: MediaAsset | null | undefined,
  site: CanonicalSite
): boolean {
  if (!asset || typeof asset !== "object") {
    return false;
  }
  if (!asset.id || typeof asset.id !== "string" || !asset.id.trim()) {
    return false;
  }

  const rawUrl = asset.localAssetPath || asset.originalUrl;
  if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
    return false;
  }

  // Reject cross-site media leakage
  if (
    asset.siteId &&
    site.id &&
    asset.siteId !== "active" &&
    site.id !== "active" &&
    asset.siteId !== site.id
  ) {
    return false;
  }

  // Reject cross-workspace media leakage
  if (
    asset.workspaceId &&
    site.workspaceId &&
    asset.workspaceId !== "default-workspace" &&
    site.workspaceId !== "default-workspace" &&
    asset.workspaceId !== site.workspaceId
  ) {
    return false;
  }

  // Never expose raw Pexels API endpoints or credential parameters
  if (/api\.pexels\.com|pexels_api_key|api_key=|authorization=/i.test(rawUrl)) {
    return false;
  }

  return true;
}

/**
 * Resolves an image URL so relative asset paths work from nested directory pages (e.g. "../assets/...").
 */
export function resolveAssetUrlForDepth(rawUrl: string, assetPrefix = ""): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }

  // Reject dangerous protocols or credential leaks
  if (/^(javascript|vbscript):/i.test(trimmed) || /^data:text\/html/i.test(trimmed)) {
    return "";
  }
  if (/api\.pexels\.com|pexels_api_key|api_key=|authorization=/i.test(trimmed)) {
    return "";
  }

  // Remote HTTPS/HTTP or safe data:image URIs
  if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
    const sanitized = sanitizeImageUrl(trimmed);
    return sanitized === "#" ? "" : sanitized;
  }

  // Relative or root-relative local asset path (e.g. "assets/hero.webp", "/assets/hero.webp", "./assets/hero.webp")
  const cleanedPath = trimmed
    .replace(/\.\.\//g, "")
    .replace(/^(\.\/|\/)+/, "");

  if (!cleanedPath) {
    return "";
  }

  return `${assetPrefix}${cleanedPath}`;
}

/**
 * Clones a MediaAsset with all URLs adjusted for the current page nesting depth.
 */
function adaptMediaAssetForDepth(asset: MediaAsset, assetPrefix: string): MediaAsset | null {
  const primaryRaw = asset.localAssetPath || asset.originalUrl;
  const resolvedPrimary = resolveAssetUrlForDepth(primaryRaw, assetPrefix);
  if (!resolvedPrimary) {
    return null;
  }

  let resolvedVariants: MediaVariant[] | undefined = undefined;
  if (Array.isArray(asset.variants) && asset.variants.length > 0) {
    resolvedVariants = asset.variants
      .map((v) => ({
        ...v,
        url: resolveAssetUrlForDepth(v.url, assetPrefix),
      }))
      .filter((v) => Boolean(v.url && v.width > 0));
  }

  return {
    ...asset,
    originalUrl: resolvedPrimary,
    variants: resolvedVariants,
  };
}

/**
 * Builds a tenant-scoped lookup dictionary of valid MediaAssets for a CanonicalSite.
 */
export function buildTenantMediaRegistry(
  site: CanonicalSite,
  legacyConfig?: SiteConfig
): Map<string, MediaAsset> {
  const registry = new Map<string, MediaAsset>();
  const siteId = site.id || "site-default";
  const workspaceId = site.workspaceId || "default-workspace";
  const companyName = site.businessProfile?.identity?.companyName || "İşletme";
  const nowIso = site.updatedAt || new Date().toISOString();

  // 1. Platform-curated safe library assets
  for (const item of CURATED_LIBRARY_ASSETS) {
    registry.set(item.id, {
      id: item.id,
      siteId,
      workspaceId,
      sourceType: "STOCK",
      originalUrl: item.originalUrl,
      mimeType: "image/jpeg",
      width: item.width,
      height: item.height,
      aspectRatio: item.aspectRatio,
      altText: item.altText,
      title: item.title,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  // 2. Site-owned canonical content slots (Hero, About, Services, Gallery)
  const heroBgUrl = site.content?.hero?.bgImageUrl || legacyConfig?.hero?.bgImage;
  if (heroBgUrl && typeof heroBgUrl === "string" && heroBgUrl.trim()) {
    const heroAsset: MediaAsset = {
      id: "hero-bg",
      siteId,
      workspaceId,
      sourceType: "STOCK",
      originalUrl: heroBgUrl,
      mimeType: "image/jpeg",
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      altText: site.content?.hero?.bgImageAlt || `${companyName} Ana Görseli`,
      title: "Ana Sayfa Hero Görseli",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    registry.set("hero-bg", heroAsset);
    registry.set(`media-hero-${siteId}`, { ...heroAsset, id: `media-hero-${siteId}` });
  }

  const aboutImgUrl = site.content?.about?.imageUrl || legacyConfig?.about?.image;
  if (
    aboutImgUrl &&
    typeof aboutImgUrl === "string" &&
    aboutImgUrl.trim() &&
    (aboutImgUrl.startsWith("http") || aboutImgUrl.startsWith("data:image/") || aboutImgUrl.includes("/"))
  ) {
    const aboutAsset: MediaAsset = {
      id: "about-main",
      siteId,
      workspaceId,
      sourceType: "STOCK",
      originalUrl: aboutImgUrl,
      mimeType: "image/jpeg",
      width: 1600,
      height: 900,
      aspectRatio: "16:9",
      altText: site.content?.about?.imageAlt || `${companyName} Hakkımızda Görseli`,
      title: "Hakkımızda Görseli",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    registry.set("about-main", aboutAsset);
    registry.set(`media-about-${siteId}`, { ...aboutAsset, id: `media-about-${siteId}` });
  }

  const servicesList = site.businessProfile?.services || [];
  servicesList.forEach((srv: any, idx: number) => {
    const srvUrl = srv.imageUrl || srv.image;
    if (srvUrl && typeof srvUrl === "string" && srvUrl.trim()) {
      const srvAsset: MediaAsset = {
        id: srv.primaryMediaId || srv.id || `media-srv-${siteId}-${idx + 1}`,
        siteId,
        workspaceId,
        sourceType: "STOCK",
        originalUrl: srvUrl,
        mimeType: "image/jpeg",
        width: 1200,
        height: 800,
        aspectRatio: "3:2",
        altText: srv.title || srv.name || `${companyName} Hizmet ${idx + 1}`,
        title: srv.title || srv.name || `Hizmet ${idx + 1}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      registry.set(srvAsset.id, srvAsset);
      registry.set(`media-srv-${siteId}-${idx + 1}`, {
        ...srvAsset,
        id: `media-srv-${siteId}-${idx + 1}`,
      });
      if (srv.id) {
        registry.set(srv.id, { ...srvAsset, id: srv.id });
      }
    }
  });

  const galleryList = site.content?.gallery || [];
  galleryList.forEach((g: any, idx: number) => {
    const gUrl = g.imageUrl || g.url;
    if (gUrl && typeof gUrl === "string" && gUrl.trim()) {
      const gId = g.id || `gallery-${idx + 1}`;
      const galAsset: MediaAsset = {
        id: gId,
        siteId,
        workspaceId,
        sourceType: "STOCK",
        originalUrl: gUrl,
        mimeType: "image/jpeg",
        width: 1600,
        height: 900,
        aspectRatio: "16:9",
        altText: g.altText || g.title || `${companyName} Galeri Görseli ${idx + 1}`,
        title: g.title || `Galeri Görseli ${idx + 1}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      registry.set(gId, galAsset);
      registry.set(`gallery-${idx + 1}`, { ...galAsset, id: `gallery-${idx + 1}` });
    }
  });

  // 3. Explicit tenant-scoped MediaAsset records (highest authority, strictly tenant-isolated)
  const explicitAssets: MediaAsset[] = [
    ...(Array.isArray(legacyConfig?.canonicalMediaAssets) ? legacyConfig!.canonicalMediaAssets! : []),
    ...(Array.isArray(site.content?.mediaAssets) ? site.content.mediaAssets : []),
  ];

  for (const candidate of explicitAssets) {
    if (isTenantAuthorizedMediaAsset(candidate, site)) {
      registry.set(candidate.id, candidate);
    }
  }

  return registry;
}

/**
 * Resolves PageContent hero media configuration into tenant-verified MediaAssets
 * and determines the effective rendering mode (TEXT_ONLY | SINGLE | SLIDER).
 */
export function resolvePageHeroMedia(
  site: CanonicalSite,
  page?: PageContent,
  options: { assetPrefix?: string; legacyConfig?: SiteConfig } = {}
): ResolvedPageHeroMedia {
  const configuredMode: HeroMediaMode = page?.heroMediaMode === "SLIDER" ? "SLIDER" : "SINGLE";
  const assetPrefix = options.assetPrefix || "";

  if (!page || !Array.isArray(page.heroMediaIds) || page.heroMediaIds.length === 0) {
    return {
      effectiveMode: "TEXT_ONLY",
      configuredMode,
      assets: [],
      requiresSliderJs: false,
    };
  }

  const registry = buildTenantMediaRegistry(site, options.legacyConfig);
  const resolvedAssets: MediaAsset[] = [];

  for (const rawMediaId of page.heroMediaIds) {
    if (!rawMediaId || typeof rawMediaId !== "string") continue;
    const mediaId = rawMediaId.trim();
    if (!mediaId) continue;

    // Never allow raw URLs in PageContent.heroMediaIds to bypass MediaAsset resolution
    if (/^(https?:)?\/\//i.test(mediaId) || /^data:/i.test(mediaId)) {
      continue;
    }

    const found = registry.get(mediaId);
    if (!found) continue;

    // Verify tenant isolation again before adapting paths
    if (!isTenantAuthorizedMediaAsset(found, site)) continue;

    const adapted = adaptMediaAssetForDepth(found, assetPrefix);
    if (adapted) {
      resolvedAssets.push(adapted);
    }
  }

  // Zero valid images -> Clean text-only hero fallback
  if (resolvedAssets.length === 0) {
    return {
      effectiveMode: "TEXT_ONLY",
      configuredMode,
      assets: [],
      requiresSliderJs: false,
    };
  }

  // SINGLE mode OR SLIDER mode with only 1 valid image -> Static single hero without slider JS
  if (configuredMode === "SINGLE" || resolvedAssets.length === 1) {
    return {
      effectiveMode: "SINGLE",
      configuredMode,
      assets: [resolvedAssets[0]],
      requiresSliderJs: false,
    };
  }

  // SLIDER mode with 2+ valid images -> Responsive slider with vanilla JS controller
  return {
    effectiveMode: "SLIDER",
    configuredMode,
    assets: resolvedAssets,
    requiresSliderJs: true,
  };
}

/**
 * Renders a responsive, CLS-safe HTML <img> tag for a resolved hero MediaAsset.
 */
export function renderHeroMediaImageTag(
  asset: MediaAsset,
  options: {
    isPrimaryLcp: boolean;
    fallbackAlt: string;
  }
): string {
  const width = asset.width && asset.width > 0 ? asset.width : 1920;
  const height = asset.height && asset.height > 0 ? asset.height : 1080;
  const aspectRatioCss = asset.aspectRatio
    ? asset.aspectRatio.replace(":", " / ")
    : `${width} / ${height}`;

  const rawAlt = (asset.altText || asset.title || options.fallbackAlt || "Sayfa başlık görseli").trim();
  const safeAlt = escapeHtml(rawAlt);
  const safeSrc = escapeHtml(asset.originalUrl);

  const loadingAttr = options.isPrimaryLcp ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  const decodingAttr = 'decoding="async"';

  let srcsetAttr = "";
  if (Array.isArray(asset.variants) && asset.variants.length > 0) {
    const entries = asset.variants
      .filter((v) => v.url && v.width > 0)
      .map((v) => `${escapeHtml(v.url)} ${v.width}w`);
    if (entries.length > 0) {
      srcsetAttr = ` srcset="${entries.join(", ")}"`;
    }
  }

  return `<img src="${safeSrc}" alt="${safeAlt}" width="${width}" height="${height}" sizes="100vw"${srcsetAttr} ${loadingAttr} ${decodingAttr} class="jk-page-hero-img w-full h-full object-cover" style="aspect-ratio: ${aspectRatioCss}; object-fit: cover;" />`;
}

/**
 * Renders the complete Dedicated Page Hero section HTML (TEXT_ONLY, SINGLE, or SLIDER).
 */
export function renderCanonicalPageHero(
  context: RenderContext,
  page: PageContent | undefined,
  defaultTitle: string
): { html: string; resolved: ResolvedPageHeroMedia } {
  const { site, legacyConfig, depth = 1 } = context;
  const companyName = site.businessProfile?.identity?.companyName || "İşletmemiz";
  const assetPrefix = context.assetPrefix ?? (depth > 0 ? "../" : "");

  const resolved = resolvePageHeroMedia(site, page, {
    assetPrefix,
    legacyConfig,
  });

  const pageTitleRaw = (page?.title || defaultTitle || companyName).trim();
  const heroHeadingRaw = (page?.heroTitle?.trim() || pageTitleRaw).trim();
  const heroSubtitleRaw = (page?.heroSubtitle?.trim() || page?.shortDescription || "").trim();

  const safeCompany = escapeHtml(companyName);
  const safePageTitle = escapeHtml(pageTitleRaw);
  const safeHeading = escapeHtml(heroHeadingRaw);
  const safeSubtitle = escapeHtml(heroSubtitleRaw);

  const badgeLabel =
    heroHeadingRaw !== pageTitleRaw
      ? `${safeCompany} • ${safePageTitle}`
      : safeCompany;

  // 1. TEXT_ONLY Hero Fallback (zero valid hero images)
  if (resolved.effectiveMode === "TEXT_ONLY" || resolved.assets.length === 0) {
    const html = `
    <!-- Dedicated Page Hero (Text-Only Mode) -->
    <section class="jk-section jk-page-hero jk-page-hero--text-only bg-gradient-to-b from-slate-900 to-slate-800 text-white py-14 sm:py-20" data-hero-mode="TEXT_ONLY">
      <div class="jk-container max-w-4xl text-center sm:text-left">
        <div class="inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          ${badgeLabel}
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">${safeHeading}</h1>
        ${safeSubtitle ? `<p class="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">${safeSubtitle}</p>` : ""}
      </div>
    </section>`;
    return { html, resolved };
  }

  // 2. SINGLE Hero Mode (or SLIDER degraded to 1 valid image)
  if (resolved.effectiveMode === "SINGLE") {
    const asset = resolved.assets[0];
    const width = asset.width && asset.width > 0 ? asset.width : 1920;
    const height = asset.height && asset.height > 0 ? asset.height : 1080;
    const aspectRatioCss = asset.aspectRatio
      ? asset.aspectRatio.replace(":", " / ")
      : `${width} / ${height}`;

    const imgHtml = renderHeroMediaImageTag(asset, {
      isPrimaryLcp: true,
      fallbackAlt: `${heroHeadingRaw} - ${companyName}`,
    });

    const html = `
    <!-- Dedicated Page Hero (Single Image Mode) -->
    <section class="jk-section jk-page-hero jk-page-hero--single relative bg-slate-900 text-white overflow-hidden" data-hero-mode="SINGLE" data-media-id="${escapeHtml(asset.id)}">
      <div class="jk-page-hero-media relative w-full overflow-hidden" style="aspect-ratio: ${aspectRatioCss}; max-height: 520px; min-height: 300px;">
        ${imgHtml}
        <div class="jk-page-hero-overlay absolute inset-0 bg-black/60 flex items-center">
          <div class="jk-container max-w-4xl text-center sm:text-left py-12 sm:py-16 relative z-10">
            <div class="inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
              ${badgeLabel}
            </div>
            <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">${safeHeading}</h1>
            ${safeSubtitle ? `<p class="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">${safeSubtitle}</p>` : ""}
          </div>
        </div>
      </div>
    </section>`;
    return { html, resolved };
  }

  // 3. SLIDER Hero Mode (2+ valid images in saved order)
  const totalSlides = resolved.assets.length;
  const slidesHtml = resolved.assets
    .map((asset, idx) => {
      const isFirst = idx === 0;
      const imgHtml = renderHeroMediaImageTag(asset, {
        isPrimaryLcp: isFirst,
        fallbackAlt: `${heroHeadingRaw} - Görsel ${idx + 1}`,
      });
      const slideLabel = escapeHtml(asset.altText || asset.title || `${heroHeadingRaw} Görsel ${idx + 1}`);
      return `
        <div
          id="pageHeroSlide${idx}"
          class="jk-page-hero-slide slide-item absolute inset-0 w-full h-full"
          data-slide-index="${idx}"
          data-media-id="${escapeHtml(asset.id)}"
          role="group"
          aria-roledescription="slide"
          aria-label="${idx + 1} / ${totalSlides}: ${slideLabel}"
          aria-hidden="${isFirst ? "false" : "true"}"
          style="opacity: ${isFirst ? "1" : "0"}; pointer-events: ${isFirst ? "auto" : "none"}; z-index: ${isFirst ? "1" : "0"};"
        >
          ${imgHtml}
        </div>`;
    })
    .join("\n");

  const dotsHtml = resolved.assets
    .map((_, idx) => {
      const isFirst = idx === 0;
      return `<button type="button" id="pageHeroDot${idx}" onclick="showPageHeroSlide(${idx})" role="tab" aria-selected="${isFirst ? "true" : "false"}" aria-label="Görsel ${idx + 1}" aria-controls="pageHeroSlide${idx}" class="${isFirst ? "w-8 h-2.5 rounded-full bg-white transition-all duration-300 cursor-pointer" : "w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/75 transition-all duration-300 cursor-pointer"}"></button>`;
    })
    .join("\n          ");

  const html = `
    <!-- Dedicated Page Hero (Slider Mode) -->
    <section
      id="jkPageHeroSlider"
      class="jk-section jk-page-hero jk-page-hero--slider relative bg-slate-900 text-white overflow-hidden"
      data-hero-mode="SLIDER"
      data-slide-count="${totalSlides}"
      role="region"
      aria-roledescription="carousel"
      aria-label="${safeHeading} Görsel Slayt Gösterisi"
      tabindex="0"
    >
      <div class="jk-page-hero-slides relative w-full overflow-hidden" style="aspect-ratio: 16 / 9; max-height: 540px; min-height: 320px;">
        ${slidesHtml}
        <div class="jk-page-hero-overlay absolute inset-0 bg-black/60 flex items-center pointer-events-none" style="z-index: 2;">
          <div class="jk-container max-w-4xl text-center sm:text-left py-12 sm:py-16 relative z-10 pointer-events-auto">
            <div class="inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
              ${badgeLabel}
            </div>
            <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">${safeHeading}</h1>
            ${safeSubtitle ? `<p class="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">${safeSubtitle}</p>` : ""}
          </div>
        </div>

        <!-- Accessible Previous / Next Slider Controls -->
        <button
          type="button"
          id="pageHeroPrevBtn"
          onclick="prevPageHeroSlide()"
          aria-label="Önceki görsel"
          aria-controls="jkPageHeroSlider"
          class="jk-page-hero-nav jk-page-hero-nav--prev absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer transition-colors"
          style="z-index: 3;"
        >
          <span aria-hidden="true">&#10094;</span>
        </button>
        <button
          type="button"
          id="pageHeroNextBtn"
          onclick="nextPageHeroSlide()"
          aria-label="Sonraki görsel"
          aria-controls="jkPageHeroSlider"
          class="jk-page-hero-nav jk-page-hero-nav--next absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer transition-colors"
          style="z-index: 3;"
        >
          <span aria-hidden="true">&#10095;</span>
        </button>

        <!-- Accessible Slide Indicator Dots -->
        <div class="jk-page-hero-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2" style="z-index: 3;" role="tablist" aria-label="Slayt seçimi">
          ${dotsHtml}
        </div>
      </div>
    </section>`;

  return { html, resolved };
}
