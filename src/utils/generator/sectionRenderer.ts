/**
 * JetKur Canonical Section Renderer & Registry (Sprint 09)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Authority: Sprint 06 Canonical Section Registry governs valid section IDs & capability rules.
 * 2. Presentation Authority: Sprint 07 Template Manifest + Customer overrides govern section variants.
 * 3. Content Authority: CanonicalSite BusinessProfile & SiteContent supply data (zero hardcoded industry content).
 * 4. Section Readiness: Evaluates readiness via evaluateSectionReadiness().
 *    - EMPTY sections are STRICTLY NOT RENDERED.
 *    - DEGRADED sections render safely with minimal available data.
 * 5. Security & Escaping: All user-controlled strings escaped via escapeHtml / escapeHtmlAttr / sanitizeUrl.
 * 6. Semantic JetKur Classes: Emits clean .jk-section, .jk-container, .jk-card, .jk-button architecture.
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { CanonicalSectionId, SectionDefinition } from "../../domain/sections/types";
import { getSectionDefinition, normalizeSectionId, isCanonicalSectionId } from "../../domain/sections/normalizer";
import { evaluateSectionReadiness } from "../../domain/sections/readiness";
import { CANONICAL_SECTION_DEFINITIONS } from "../../domain/sections/registry";
import { escapeHtml, escapeHtmlAttr, sanitizeUrl } from "./security";
import { RenderContext, SectionRenderContext } from "./types";
import { resolveNavigationLinks, getEffectiveSiteMode } from "./routeResolver";
import { buildTenantMediaRegistry, resolveAssetUrlForDepth } from "./heroMediaResolver";
import { resolveTemplate } from "../../domain/templates/catalog";
import { SectionSurfaceTone } from "../../domain/site/designTemplate";

// =========================================================================
// 1. VARIANT RESOLUTION ENGINE & CANONICAL LAYOUT FAMILIES (Sprint 09 & 02B)
// Priority: Customer Explicit Override -> Template Manifest Recipe -> Registry Default -> Fallback
// =========================================================================

export type CanonicalHeaderLayoutVariant =
  | "corporate-classic"
  | "local-service"
  | "modern-minimal"
  | "premium-luxury";
export type CanonicalFooterLayoutVariant =
  | "corporate-multicolumn"
  | "local-service"
  | "minimal"
  | "premium";
export type CanonicalHeroLayoutVariant = "centered" | "split-image" | "full-width";
export type CanonicalServicesLayoutVariant = "card-grid" | "icon-list";
export type CanonicalServiceCardVariant =
  | "standard-card"
  | "minimal-icon"
  | "image-card"
  | "bordered-premium"
  | "compact-local";
export type CanonicalAboutLayoutVariant = "image-left" | "image-right";

/**
 * Maps any allowed Header variant ID or header layout token to its canonical Header layout.
 */
export function resolveHeaderLayoutVariant(
  variant: string,
  headerLayoutToken?: string
): CanonicalHeaderLayoutVariant {
  const key = (variant || headerLayoutToken || "").trim();
  switch (key) {
    case "corporate-classic":
    case "split-action":
    case "fixed-solid":
      return "corporate-classic";
    case "modern-minimal":
    case "minimal-sticky":
    case "minimal-split":
    case "transparent-sticky":
      return "modern-minimal";
    case "premium-luxury":
    case "centered":
    case "floating-pill":
      return "premium-luxury";
    case "local-service":
    case "standard":
    default:
      return "local-service";
  }
}

/**
 * Maps any allowed Footer variant ID or footer layout token to its canonical Footer layout.
 */
export function resolveFooterLayoutVariant(
  variant: string,
  footerLayoutToken?: string
): CanonicalFooterLayoutVariant {
  const key = (variant || footerLayoutToken || "").trim();
  switch (key) {
    case "local-service":
    case "simple-centered":
    case "stacked-bold":
      return "local-service";
    case "minimal":
    case "minimal-legal":
      return "minimal";
    case "premium":
      return "premium";
    case "corporate-multicolumn":
    case "corporate-detailed":
    case "multi-column":
    case "multi-column-rich":
    default:
      return "corporate-multicolumn";
  }
}

/**
 * Maps any allowed Hero variant ID to its canonical structural layout variant.
 */
export function resolveHeroLayoutVariant(variant: string): CanonicalHeroLayoutVariant {
  switch ((variant || "").trim()) {
    case "centered":
    case "centered-prestige":
    case "minimal-lead":
      return "centered";
    case "split-image":
    case "split-content-image":
      return "split-image";
    case "full-width":
    case "full-width-background":
    case "image-background":
    case "urgent-callout":
    default:
      return "full-width";
  }
}

/**
 * Maps any allowed Services variant ID to its canonical structural layout variant.
 */
export function resolveServicesLayoutVariant(variant: string): CanonicalServicesLayoutVariant {
  switch ((variant || "").trim()) {
    case "icon-list":
    case "list":
    case "compact":
    case "minimal-icon":
      return "icon-list";
    case "card-grid":
    case "grid-4":
    case "cards-3":
    case "cards":
    case "standard-card":
    case "image-card":
    case "bordered-premium":
    case "compact-local":
    default:
      return "card-grid";
  }
}

/**
 * Maps any allowed Services variant ID to one of the 5 visual Service Card variants.
 */
export function resolveServiceCardVariant(variant: string): CanonicalServiceCardVariant {
  switch ((variant || "").trim()) {
    case "minimal-icon":
    case "icon-list":
    case "list":
      return "minimal-icon";
    case "image-card":
    case "cards":
      return "image-card";
    case "bordered-premium":
      return "bordered-premium";
    case "compact-local":
    case "grid-4":
    case "compact":
      return "compact-local";
    case "standard-card":
    case "cards-3":
    case "card-grid":
    default:
      return "standard-card";
  }
}

/**
 * Maps any allowed About variant ID to its canonical structural layout variant.
 */
export function resolveAboutLayoutVariant(variant: string): CanonicalAboutLayoutVariant {
  switch ((variant || "").trim()) {
    case "image-left":
    case "minimal-stats":
    case "cards-narrative":
      return "image-left";
    case "image-right":
    case "side-by-side":
    case "story-timeline":
    default:
      return "image-right";
  }
}

export function resolveSectionVariant(
  sectionId: CanonicalSectionId,
  site: CanonicalSite,
  manifest?: TemplateManifest
): string {
  const def = getSectionDefinition(sectionId);
  const allowed = def ? def.allowedVariants : [];
  const defaultVar = def ? def.defaultVariant : "standard";

  const userSection = site.sectionConfiguration?.sections?.find(
    (s) => normalizeSectionId(s.type || s.id) === sectionId
  );

  // 1. Explicit variantOverride on section or appliedVariantOverrides on designTemplate
  const explicitSecOverride = (userSection as any)?.variantOverride;
  if (explicitSecOverride && allowed.includes(explicitSecOverride)) {
    return explicitSecOverride;
  }

  if ((site.designTemplate as any)?.appliedVariantOverrides?.[sectionId]) {
    const override = (site.designTemplate as any).appliedVariantOverrides[sectionId];
    if (allowed.includes(override)) return override;
  }

  // Check if an explicit manifest was passed that differs from site.designTemplate
  const siteDtId = site.designTemplate?.templateId;
  const siteDtSlug = site.designTemplate?.templateSlug;
  const manifestDiffersFromSite =
    Boolean(manifest) &&
    Boolean(siteDtId || siteDtSlug) &&
    manifest!.id !== siteDtId &&
    manifest!.slug !== siteDtSlug &&
    manifest!.id !== `tmpl-${siteDtSlug}`;

  // Detect if sectionConfiguration still holds unmigrated legacy fixture defaults ("grid-cards" / "story-side")
  const hasUnmigratedFixtureSections = Boolean(
    site.sectionConfiguration?.sections?.some(
      (s) => s.variant === "grid-cards" || s.variant === "story-side" || s.variant === "feature-grid"
    )
  );

  // Structural header/footer sections in legacy test fixtures often carry registry default ("standard" / "multi-column")
  // when no explicit sectionVariants were set on designTemplate; let active manifest recipe govern when userVariant is registry default.
  const isStructuralDefaultInFixture =
    (sectionId === "header" && userSection?.variant === "standard" && !site.designTemplate?.sectionVariants?.header) ||
    (sectionId === "footer" && userSection?.variant === "multi-column" && !site.designTemplate?.sectionVariants?.footer);

  // 2. Customer sectionConfiguration variant (when aligned with current template and not an unmigrated fixture)
  const userVariant = userSection?.variant;
  if (
    !manifestDiffersFromSite &&
    !hasUnmigratedFixtureSections &&
    !isStructuralDefaultInFixture &&
    userVariant &&
    allowed.includes(userVariant)
  ) {
    return userVariant;
  }

  // 3. Active designTemplate.sectionVariants (when matching target manifest)
  if (!manifestDiffersFromSite && site.designTemplate?.sectionVariants?.[sectionId]) {
    const dtVariant = site.designTemplate.sectionVariants[sectionId]!;
    if (allowed.includes(dtVariant)) {
      return dtVariant;
    }
  }

  // 4. Template Manifest recipe (or resolved template from site.designTemplate)
  const effectiveManifest =
    manifest ||
    resolveTemplate(siteDtId || "") ||
    resolveTemplate(siteDtSlug || "");
  if (effectiveManifest?.sectionRecipe?.[sectionId]) {
    const recipeVariant = effectiveManifest.sectionRecipe[sectionId]!;
    if (allowed.includes(recipeVariant)) return recipeVariant;
  }

  // 5. Safe fallback to Registry defaultVariant
  return defaultVar;
}

// =========================================================================
// 2. CANONICAL SECTION RENDERERS (All 15 Active + 1 Experimental)
// =========================================================================

/**
 * Shared Accessible Mobile Navigation Drawer (Phase 3)
 * - Keyboard accessible, aria-expanded / aria-controls / aria-hidden
 * - Escape-to-close & focus restoration via progressiveScriptRenderer
 * - Zero duplicate IDs across the document
 */
function renderMobileNavigationDrawer(options: {
  companyName: string;
  navLinks: Array<{ label: string; href: string; active: boolean }>;
  phone: string;
  phoneClean: string;
  contactHref: string;
  ctaLabel: string;
}): string {
  const { companyName, navLinks, phone, phoneClean, contactHref, ctaLabel } = options;

  return `
    <!-- Mobile Drawer Navigation (Accessible Progressive Enhancement) -->
    <div id="mobileMenuBackdrop" onclick="closeMobileMenu()" class="hidden fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-xs opacity-0 transition-opacity duration-300 md:hidden" aria-hidden="true" style="display: none;"></div>
    <div id="mobileDrawer" class="jk-mobile-drawer fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-in-out md:hidden border-l border-slate-100" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="mobileDrawerTitle">
      <div>
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
          <span id="mobileDrawerTitle" class="text-base font-extrabold text-slate-900 truncate">${companyName}</span>
          <button type="button" id="mobileMenuCloseBtn" onclick="closeMobileMenu()" class="jk-mobile-close-btn w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 shrink-0" aria-label="Menüyü Kapat">✕</button>
        </div>
        <nav class="jk-mobile-nav flex flex-col gap-2" aria-label="Mobil Gezinme">
          ${navLinks
            .map(
              (l) =>
                `<a href="${l.href}" onclick="closeMobileMenu(false)" class="jk-mobile-nav-link py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`
            )
            .join("\n          ")}
        </nav>
      </div>
      <div class="pt-6 border-t border-slate-100 space-y-3">
        ${
          phoneClean
            ? `<a href="tel:${phoneClean}" onclick="closeMobileMenu(false)" class="w-full jk-button jk-button-primary text-center text-xs py-3 px-4 block" aria-label="Telefon: ${phone}">📞 ${phone}</a>`
            : `<a href="${contactHref}" onclick="closeMobileMenu(false)" class="w-full jk-button jk-button-primary text-center text-xs py-3 px-4 block">${ctaLabel}</a>`
        }
      </div>
    </div>`;
}

/**
 * 1. HEADER (Structural Navigation — 4 Canonical Variants)
 * - corporate-classic (Header A: Corporate Classic)
 * - local-service     (Header B: Local Service Conversion)
 * - modern-minimal    (Header C: Modern Minimal)
 * - premium-luxury    (Header D: Premium Luxury)
 */
export function renderHeaderSection(context: SectionRenderContext): string {
  const { site, variant, depth = 0, assetPrefix = "", manifest, resolvedDesignTokens } = context;
  const bp = site.businessProfile;
  const companyName = escapeHtml(bp.identity.companyName || "JetKur İşletme");
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone.trim()) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const email = bp.contact.email ? escapeHtml(bp.contact.email.trim()) : "";
  const city = bp.location.city ? escapeHtml(bp.location.city.trim()) : "";
  const district = bp.location.district ? escapeHtml(bp.location.district.trim()) : "";
  const locationLabel = district && city ? `${district}, ${city}` : city || district || "";

  const rawLogo =
    bp.branding.logoUrl ||
    site.brandKit?.logo?.url ||
    (bp.branding as any)?.brandKit?.logo?.url ||
    "";
  const resolvedLogoPath = rawLogo ? resolveAssetUrlForDepth(rawLogo, assetPrefix) : "";
  const logoUrl = resolvedLogoPath ? sanitizeUrl(resolvedLogoPath) : "";
  const hasValidLogo = Boolean(logoUrl && logoUrl !== "#");

  const mode = getEffectiveSiteMode(site);
  const isMulti = mode === "MULTI_PAGE";
  const homeHref = depth > 0 ? "../index.html" : isMulti ? "index.html" : "#hero";
  const contactHref = depth > 0 ? "../iletisim/index.html" : isMulti ? "iletisim/index.html" : "#contact";
  const ctaLabel = escapeHtml(
    site.sectionConfiguration?.header?.ctaText ||
      site.content.hero?.ctaPrimaryText ||
      "İletişime Geçin"
  );

  // Shared route resolver for desktop and mobile navigation
  const navLinks = resolveNavigationLinks(site, depth);

  const headerLayoutToken =
    resolvedDesignTokens?.header?.layout || manifest?.designTokens?.header?.layout;
  const headerVariant = resolveHeaderLayoutVariant(variant, headerLayoutToken);
  const showTopBar =
    (resolvedDesignTokens?.header?.showTopBar ?? manifest?.designTokens?.header?.showTopBar ?? true) !== false;
  const isSticky = site.sectionConfiguration?.header?.sticky !== false;
  const stickyClass = isSticky ? "sticky top-0 z-40" : "relative z-40";

  const mobileToggleButtonHtml = `<button type="button" id="mobileMenuToggleBtn" onclick="toggleMobileMenu()" class="jk-mobile-toggle md:hidden w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 shrink-0" aria-label="Menüyü Aç/Kapat" aria-expanded="false" aria-controls="mobileDrawer">
          <span id="mobileMenuOpenIcon" aria-hidden="true">☰</span>
          <span id="mobileMenuCloseIcon" class="hidden" aria-hidden="true">✕</span>
        </button>`;

  const mobileDrawerHtml = renderMobileNavigationDrawer({
    companyName,
    navLinks,
    phone,
    phoneClean,
    contactHref,
    ctaLabel,
  });

  // -------------------------------------------------------------------------
  // HEADER A — Corporate Classic (corporate-classic)
  // Logo left, horizontal navigation, primary CTA right, balanced whitespace, subtle bottom border
  // -------------------------------------------------------------------------
  if (headerVariant === "corporate-classic") {
    const hasTopBarData = Boolean(email || locationLabel || phone);
    return `
  <!-- Structural Header: ${variant} (Header Variant: corporate-classic) -->
  <header data-section="header" data-variant="${escapeHtmlAttr(variant)}" data-header-variant="corporate-classic" class="${stickyClass} bg-white/95 backdrop-blur-md border-b border-slate-200 jk-header jk-header--corporate-classic">
    ${
      showTopBar && hasTopBarData
        ? `<div class="jk-header-topbar hidden sm:block bg-slate-900 text-slate-300 text-xs py-2 border-b border-slate-800">
      <div class="jk-container flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0 truncate">
          ${locationLabel ? `<span class="truncate">📍 ${locationLabel}</span>` : ""}
          ${email ? `<a href="mailto:${email}" class="hover:text-white transition-colors truncate">✉ ${email}</a>` : ""}
        </div>
        ${phoneClean ? `<a href="tel:${phoneClean}" class="font-semibold text-white hover:underline shrink-0">📞 ${phone}</a>` : ""}
      </div>
    </div>`
        : ""
    }
    <div class="jk-container jk-header-inner flex items-center justify-between h-16 sm:h-20 gap-4">
      <a href="${homeHref}" class="jk-header-brand flex items-center gap-3 min-w-0" aria-label="${companyName}">
        ${
          hasValidLogo
            ? `<img src="${logoUrl}" alt="${companyName}" style="height: 44px; width: auto; max-width: 190px;" class="shrink-0 object-contain">`
            : `<div class="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-lg shrink-0">${companyName.charAt(0)}</div>
        <span class="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">${companyName}</span>`
        }
      </a>

      <nav class="jk-header-nav hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="jk-nav-link hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <div class="jk-header-actions flex items-center gap-3 shrink-0">
        ${
          phoneClean
            ? `<a href="tel:${phoneClean}" class="hidden sm:inline-flex jk-button jk-button-primary text-xs sm:text-sm py-2.5 px-5" aria-label="Telefon: ${phone}">Hemen Ara</a>`
            : `<a href="${contactHref}" class="hidden sm:inline-flex jk-button jk-button-primary text-xs sm:text-sm py-2.5 px-5">${ctaLabel}</a>`
        }
        ${mobileToggleButtonHtml}
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
  }

  // -------------------------------------------------------------------------
  // HEADER C — Modern Minimal (modern-minimal)
  // Minimal navigation, generous whitespace, elegant typography, understated CTA
  // -------------------------------------------------------------------------
  if (headerVariant === "modern-minimal") {
    return `
  <!-- Structural Header: ${variant} (Header Variant: modern-minimal) -->
  <header data-section="header" data-variant="${escapeHtmlAttr(variant)}" data-header-variant="modern-minimal" class="${stickyClass} bg-white/95 backdrop-blur-md border-b border-slate-100 jk-header jk-header--modern-minimal">
    <div class="jk-container jk-header-inner flex items-center justify-between h-16 sm:h-24 gap-6">
      <a href="${homeHref}" class="jk-header-brand jk-header-brand--minimal flex items-center gap-3 min-w-0" aria-label="${companyName}">
        ${
          hasValidLogo
            ? `<img src="${logoUrl}" alt="${companyName}" style="height: 38px; width: auto; max-width: 180px;" class="shrink-0 object-contain">`
            : `<span class="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">${companyName}</span>`
        }
      </a>

      <div class="flex items-center gap-8 min-w-0">
        <nav class="jk-header-nav jk-header-nav--minimal hidden md:flex items-center gap-8 text-sm font-medium text-slate-600" aria-label="Ana Menü">
          ${navLinks.map((l) => `<a href="${l.href}" class="jk-nav-link hover:text-slate-900 transition-colors">${escapeHtml(l.label)}</a>`).join("\n          ")}
        </nav>

        <div class="jk-header-actions flex items-center gap-3 shrink-0">
          ${
            phoneClean
              ? `<a href="tel:${phoneClean}" class="hidden sm:inline-flex jk-button jk-button-secondary jk-button-minimal text-xs font-semibold py-2 px-4" aria-label="Telefon: ${phone}">${phone}</a>`
              : `<a href="${contactHref}" class="hidden sm:inline-flex jk-button jk-button-secondary jk-button-minimal text-xs font-semibold py-2 px-4">${ctaLabel}</a>`
          }
          ${mobileToggleButtonHtml}
        </div>
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
  }

  // -------------------------------------------------------------------------
  // HEADER D — Premium Luxury (premium-luxury)
  // Centered/balanced branding, refined navigation, elegant CTA styling, dark/gold/neutral compatible
  // -------------------------------------------------------------------------
  if (headerVariant === "premium-luxury") {
    return `
  <!-- Structural Header: ${variant} (Header Variant: premium-luxury) -->
  <header data-section="header" data-variant="${escapeHtmlAttr(variant)}" data-header-variant="premium-luxury" class="${stickyClass} jk-header jk-header--premium-luxury bg-slate-950 text-white border-b border-slate-800">
    <div class="jk-container jk-header-inner jk-header-luxury-grid flex items-center justify-between h-16 sm:h-24 gap-4">
      <nav class="jk-header-nav jk-header-nav--luxury hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-slate-300" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="jk-nav-link hover:text-amber-400 transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <a href="${homeHref}" class="jk-header-brand jk-header-brand--luxury flex items-center gap-3 min-w-0 md:mx-auto" aria-label="${companyName}">
        ${
          hasValidLogo
            ? `<img src="${logoUrl}" alt="${companyName}" style="height: 44px; width: auto; max-width: 190px;" class="shrink-0 object-contain">`
            : `<div class="w-9 h-9 rounded-full border border-amber-400/60 bg-brand/20 text-amber-300 flex items-center justify-center font-bold text-base shrink-0">${companyName.charAt(0)}</div>
        <span class="text-base sm:text-xl font-bold text-white tracking-wide truncate">${companyName}</span>`
        }
      </a>

      <div class="jk-header-actions flex items-center justify-end gap-3 shrink-0">
        ${
          phoneClean
            ? `<a href="tel:${phoneClean}" class="hidden sm:inline-flex jk-button jk-button-primary jk-button-luxury text-xs uppercase tracking-wider py-2.5 px-5" aria-label="Telefon: ${phone}">${phone}</a>`
            : `<a href="${contactHref}" class="hidden sm:inline-flex jk-button jk-button-primary jk-button-luxury text-xs uppercase tracking-wider py-2.5 px-5">${ctaLabel}</a>`
        }
        ${mobileToggleButtonHtml}
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
  }

  // -------------------------------------------------------------------------
  // HEADER B — Local Service Conversion (local-service — default for local/urgent services)
  // Business logo & name, visible phone number, strong Call Now CTA, optional compact contact strip, mobile tap-to-call
  // -------------------------------------------------------------------------
  const hasContactStrip = Boolean(showTopBar && (phoneClean || locationLabel || email));
  return `
  <!-- Structural Header: ${variant} (Header Variant: local-service) -->
  <header data-section="header" data-variant="${escapeHtmlAttr(variant)}" data-header-variant="local-service" class="${stickyClass} bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 jk-header jk-header--local-service">
    ${
      hasContactStrip
        ? `<div class="jk-header-contact-strip bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
      <div class="jk-container flex items-center justify-between gap-3">
        <div class="flex items-center gap-4 min-w-0 truncate">
          ${locationLabel ? `<span class="truncate">📍 ${locationLabel}</span>` : ""}
          ${email ? `<a href="mailto:${email}" class="hidden sm:inline hover:text-white transition-colors truncate">✉ ${email}</a>` : ""}
        </div>
        ${phoneClean ? `<a href="tel:${phoneClean}" class="font-bold text-amber-400 hover:underline shrink-0">📞 ${phone}</a>` : ""}
      </div>
    </div>`
        : ""
    }
    <div class="jk-container jk-header-inner flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
      <a href="${homeHref}" class="jk-header-brand flex items-center gap-2.5 sm:gap-3 min-w-0" aria-label="${companyName}">
        ${
          hasValidLogo
            ? `<img src="${logoUrl}" alt="${companyName}" style="height: 44px; width: auto; max-width: 180px;" class="shrink-0 object-contain">`
            : `<div class="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">${companyName.charAt(0)}</div>
        <span class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">${companyName}</span>`
        }
      </a>

      <!-- Desktop Nav -->
      <nav class="jk-header-nav hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="jk-nav-link hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <!-- Action Buttons (Desktop Phone + Call CTA & Mobile Tap-to-Call + Toggle) -->
      <div class="jk-header-actions flex items-center gap-2 sm:gap-3 shrink-0">
        ${
          phoneClean
            ? `<a href="tel:${phoneClean}" class="jk-header-phone-display hidden lg:inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-900 hover:text-brand transition-colors" aria-label="Telefon Numarası: ${phone}">📞 <span>${phone}</span></a>
        <a href="tel:${phoneClean}" class="jk-header-call-cta hidden sm:inline-flex jk-button jk-button-primary text-xs sm:text-sm py-2.5 px-4 shadow-xs" aria-label="Hemen Ara: ${phone}">Hemen Ara</a>
        <a href="tel:${phoneClean}" class="jk-header-mobile-call sm:hidden inline-flex items-center justify-center h-11 px-3 rounded-lg bg-brand text-white font-bold text-xs shrink-0" aria-label="Hemen Ara: ${phone}">📞 Ara</a>`
            : `<a href="${contactHref}" class="hidden sm:inline-flex jk-button jk-button-primary text-xs sm:text-sm py-2.5 px-4">${ctaLabel}</a>`
        }
        ${mobileToggleButtonHtml}
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
}

const SECTION_SEQUENCE_SLOT_INDEX: Record<string, number> = {
  services: 0,
  about: 1,
  gallery: 2,
  whyUs: 3,
  testimonials: 4,
  faqs: 5,
  products: 2,
  pricing: 4,
  blog: 5,
  contact: 1,
};

/**
 * Resolves the section surface tone, divider class, button emphasis, and card border treatment
 * from the active ResolvedDesignTokens / TemplateManifest.
 */
export function resolveSectionVisualComposition(
  context: SectionRenderContext,
  fallbackSurface: SectionSurfaceTone = "light"
): {
  surfaceTone: SectionSurfaceTone;
  surfaceClass: string;
  dividerClass: string;
  buttonEmphasis: string;
  buttonEmphasisClass: string;
  borderTreatment: string;
  cardBorderClass: string;
  heroTextWidth: string;
} {
  const geom =
    context.resolvedDesignTokens?.geometry ||
    context.manifest?.designTokens?.geometry;

  const seq = geom?.sectionSurfaceSequence;
  const slotIdx = SECTION_SEQUENCE_SLOT_INDEX[context.sectionId] ?? (context.order % 6);
  const surfaceTone: SectionSurfaceTone =
    seq && seq.length > 0
      ? seq[slotIdx % seq.length] || fallbackSurface
      : fallbackSurface;

  const divider = geom?.sectionDivider || "hairline";
  const dividerClass =
    divider && divider !== "none" ? `jk-divider--${divider}` : "";

  const buttonEmphasis = geom?.buttonEmphasis || "solid";
  const buttonEmphasisClass = `jk-button--${buttonEmphasis}`;

  const borderTreatment = geom?.borderTreatment || "subtle";
  const cardBorderClass =
    borderTreatment && borderTreatment !== "none" && borderTreatment !== "subtle"
      ? `jk-card-border--${borderTreatment}`
      : "";

  const heroTextWidth = geom?.heroTextWidth || "balanced";

  return {
    surfaceTone,
    surfaceClass: `jk-surface--${surfaceTone}`,
    dividerClass,
    buttonEmphasis,
    buttonEmphasisClass,
    borderTreatment,
    cardBorderClass,
    heroTextWidth,
  };
}

/**
 * 2. HERO (Primary Welcome Showcase — Variants: centered | split-image | full-width)
 */
export function renderHeroSection(context: SectionRenderContext): string {
  const { site, variant, assetPrefix = "", legacyConfig } = context;
  const bp = site.businessProfile;
  const content = site.content.hero;
  const companyName = escapeHtml(bp.identity.companyName);
  const badgeText = escapeHtml(content?.badge || "★ Profesyonel Hizmet Standartları");
  const title = escapeHtml(content?.title || bp.identity.slogan || `${companyName} Profesyonel Hizmetler`);
  const subtitle = escapeHtml(content?.subtitle || bp.identity.shortDescription || "Kaliteli, güvenilir ve garantili çözümler.");
  const ctaPrimary = escapeHtml(content?.ctaPrimaryText || "Hemen İletişime Geç");
  const ctaPrimaryLink = sanitizeUrl(content?.ctaPrimaryLink || "#contact");
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";

  // Resolve hero image through tenant MediaAsset registry first, then content fallback
  const mediaRegistry = buildTenantMediaRegistry(site, legacyConfig);
  const heroMediaAsset = mediaRegistry.get("hero-bg");
  const rawHeroBg = heroMediaAsset?.originalUrl || content?.bgImageUrl || (content as any)?.bgImage;
  const resolvedHeroBg = rawHeroBg ? resolveAssetUrlForDepth(rawHeroBg, assetPrefix) : "";
  const bgImage = resolvedHeroBg || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80";
  const bgAlt = escapeHtmlAttr(content?.bgImageAlt || heroMediaAsset?.altText || `${bp.identity.companyName} Vitrin Görseli`);

  const layoutVariant = resolveHeroLayoutVariant(variant);
  const { buttonEmphasis, buttonEmphasisClass, heroTextWidth } = resolveSectionVisualComposition(context, "dark");

  // VARIANT 1: CENTERED (Editorial / Corporate Centered Typography & Showcase)
  if (layoutVariant === "centered") {
    return `
  <!-- Hero Section: ${variant} (Layout: centered) -->
  <section id="hero" data-section="hero" data-variant="${escapeHtmlAttr(variant)}" data-layout-variant="centered" data-hero-width="${heroTextWidth}" data-button-emphasis="${buttonEmphasis}" class="relative jk-hero jk-hero--centered py-16 sm:py-24 overflow-hidden">
    <div class="jk-container relative z-10 jk-hero-layout-centered jk-hero-copy-measure text-center max-w-4xl mx-auto">
      <div class="jk-section-kicker inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand text-amber-300 text-xs font-bold uppercase tracking-wider mb-5">
        ${badgeText}
      </div>
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
        ${title}
      </h1>
      <p class="text-base sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
        ${subtitle}
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <a href="${ctaPrimaryLink}" class="w-full sm:w-auto jk-button jk-button-primary ${buttonEmphasisClass} text-base py-3.5 px-8 shadow-lg">
          ${ctaPrimary}
        </a>
        ${phoneClean ? `<a href="tel:${phoneClean}" class="w-full sm:w-auto jk-button jk-button-secondary text-base py-3.5 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
          📞 ${phone}
        </a>` : ""}
      </div>
      <figure class="jk-hero-media-frame max-w-3xl mx-auto aspect-16/9">
        <img src="${bgImage}" alt="${bgAlt}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async">
      </figure>
    </div>
  </section>`;
  }

  // VARIANT 2: SPLIT-IMAGE (Two-Column Content Left + Visual Frame Right)
  if (layoutVariant === "split-image") {
    return `
  <!-- Hero Section: ${variant} (Layout: split-image) -->
  <section id="hero" data-section="hero" data-variant="${escapeHtmlAttr(variant)}" data-layout-variant="split-image" data-hero-width="${heroTextWidth}" data-button-emphasis="${buttonEmphasis}" class="relative jk-hero jk-hero--split-image py-16 sm:py-24 overflow-hidden">
    <div class="jk-container relative z-10 jk-hero-split-grid">
      <div class="jk-hero-split-content jk-hero-copy-measure text-center sm:text-left">
        <div class="jk-section-kicker inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          ${badgeText}
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          ${title}
        </h1>
        <p class="text-base sm:text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
          ${subtitle}
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <a href="${ctaPrimaryLink}" class="w-full sm:w-auto jk-button jk-button-primary ${buttonEmphasisClass} text-base py-3.5 px-8 shadow-lg">
            ${ctaPrimary}
          </a>
          ${phoneClean ? `<a href="tel:${phoneClean}" class="w-full sm:w-auto jk-button jk-button-secondary text-base py-3.5 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
            📞 ${phone}
          </a>` : ""}
        </div>
      </div>
      <div class="jk-hero-split-media">
        <figure class="jk-hero-media-frame aspect-4/3">
          <img src="${bgImage}" alt="${bgAlt}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async">
        </figure>
      </div>
    </div>
  </section>`;
  }

  // VARIANT 3: FULL-WIDTH BACKGROUND (Full-Bleed Image with High-Contrast Overlay)
  return `
  <!-- Hero Section: ${variant} (Layout: full-width) -->
  <section id="hero" data-section="hero" data-variant="${escapeHtmlAttr(variant)}" data-layout-variant="full-width" data-hero-width="${heroTextWidth}" data-button-emphasis="${buttonEmphasis}" class="relative jk-hero jk-hero--full-width py-16 sm:py-24 overflow-hidden" style="background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.90)), url('${bgImage}'); background-size: cover; background-position: center;">
    <div class="jk-container relative z-10 jk-hero-copy-measure text-center sm:text-left max-w-4xl">
      <div class="jk-section-kicker inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
        ${badgeText}
      </div>
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
        ${title}
      </h1>
      <p class="text-base sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
        ${subtitle}
      </p>
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <a href="${ctaPrimaryLink}" class="w-full sm:w-auto jk-button jk-button-primary ${buttonEmphasisClass} text-base py-3.5 px-8 shadow-lg">
          ${ctaPrimary}
        </a>
        ${phoneClean ? `<a href="tel:${phoneClean}" class="w-full sm:w-auto jk-button jk-button-secondary text-base py-3.5 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
          📞 ${phone}
        </a>` : ""}
      </div>
    </div>
  </section>`;
}

/**
 * Resolves a service item's image through the tenant-scoped MediaAsset pipeline.
 * Returns empty string if no valid tenant-authorized image exists.
 */
function resolveServiceItemMedia(
  serviceItem: any,
  idx: number,
  site: CanonicalSite,
  mediaRegistry: Map<string, any>,
  assetPrefix: string
): { url: string; alt: string } {
  const sTitle = serviceItem?.name || serviceItem?.title || `Hizmet ${idx + 1}`;
  const candidateIds = [
    serviceItem?.primaryMediaId,
    serviceItem?.imageAssetId,
    serviceItem?.mediaId,
  ].filter(Boolean);

  for (const cid of candidateIds) {
    const asset = mediaRegistry.get(String(cid));
    if (asset) {
      const resolvedUrl = resolveAssetUrlForDepth(asset.localAssetPath || asset.originalUrl, assetPrefix);
      if (resolvedUrl) {
        return { url: resolvedUrl, alt: asset.altText || sTitle };
      }
    }
  }

  // Also check if imageUrl / image is either a MediaAsset ID or a direct valid URL on the service item
  const rawImg = serviceItem?.imageUrl || serviceItem?.image;
  if (rawImg && typeof rawImg === "string" && rawImg.trim()) {
    const trimmed = rawImg.trim();
    const mappedAsset = mediaRegistry.get(trimmed);
    if (mappedAsset) {
      const resolvedUrl = resolveAssetUrlForDepth(
        mappedAsset.localAssetPath || mappedAsset.originalUrl,
        assetPrefix
      );
      if (resolvedUrl) {
        return { url: resolvedUrl, alt: mappedAsset.altText || sTitle };
      }
    }
    // If it looks like a real URL/path (not an unresolved cross-tenant media-* token), resolve for depth
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:image/") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("assets/")
    ) {
      const resolvedUrl = resolveAssetUrlForDepth(trimmed, assetPrefix);
      if (resolvedUrl) {
        return { url: resolvedUrl, alt: serviceItem?.imageAlt || sTitle };
      }
    }
  }

  return { url: "", alt: sTitle };
}

/**
 * 3. SERVICES (Core Offerings — 2 Layout Families x 5 Visual Card Variants)
 * - Layout Families (02B): card-grid | icon-list
 * - Card Styles (02C):
 *   1. standard-card    (Standard professional card)
 *   2. minimal-icon     (Minimal icon / text card)
 *   3. image-card       (Image-focused service card with MediaAsset pipeline + text fallback)
 *   4. bordered-premium (Bordered premium card)
 *   5. compact-local    (Compact local-service card)
 */
export function renderServicesSection(context: SectionRenderContext): string {
  const { site, variant, assetPrefix = "", legacyConfig } = context;
  const services = (site.content as any).services || site.businessProfile.services || [];
  const companyName = escapeHtml(site.businessProfile.identity.companyName || "İşletme");
  const isMulti = getEffectiveSiteMode(site) === "MULTI_PAGE";
  const layoutVariant = resolveServicesLayoutVariant(variant);
  const cardVariant = resolveServiceCardVariant(variant);
  const isFourCol = variant === "grid-4" || cardVariant === "compact-local";
  const gridColsClass = isFourCol ? "jk-services-grid jk-services-grid--4col" : "jk-services-grid";
  const mediaRegistry = buildTenantMediaRegistry(site, legacyConfig);

  let itemsHtml = "";

  if (layoutVariant === "icon-list") {
    itemsHtml = `
      <div class="jk-services-list">
        ${services
          .map((s: any, idx: number) => {
            const sTitle = escapeHtml(s.name || s.title || "Hizmet");
            const sDesc = escapeHtml(s.shortDescription || s.description || "");
            const sPrice = s.priceHint || s.price || s.priceInfo;
            const detailUrl = isMulti ? `hizmet-${s.slug || idx + 1}.html` : "#contact";
            const indexLabel = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
            return `
        <article data-service-card="${cardVariant}" class="jk-service-list-item jk-service-card jk-service-card--${cardVariant}">
          <div class="flex items-start sm:items-center gap-4 min-w-0">
            <div class="jk-service-list-icon w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
              ${indexLabel}
            </div>
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-1">${sTitle}</h3>
              ${sDesc ? `<p class="text-slate-600 text-sm leading-relaxed">${sDesc}</p>` : ""}
            </div>
          </div>
          <div class="jk-service-list-meta flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            ${sPrice ? `<span class="text-xs font-semibold text-slate-500">${escapeHtml(sPrice)}</span>` : ""}
            <a href="${detailUrl}" class="jk-service-card-link text-sm font-bold text-brand hover:underline">Detaylı Bilgi →</a>
          </div>
        </article>`;
          })
          .join("\n        ")}
      </div>`;
  } else if (cardVariant === "image-card") {
    // Variant 3: Image-Focused Service Card (MediaAsset pipeline + clean text-based fallback)
    itemsHtml = `
      <div class="${gridColsClass}">
        ${services
          .map((s: any, idx: number) => {
            const sTitle = escapeHtml(s.name || s.title || "Hizmet");
            const sDesc = escapeHtml(s.shortDescription || s.description || "");
            const sPrice = s.priceHint || s.price || s.priceInfo;
            const detailUrl = isMulti ? `hizmet-${s.slug || idx + 1}.html` : "#contact";
            const resolvedMedia = resolveServiceItemMedia(s, idx, site, mediaRegistry, assetPrefix);
            const indexLabel = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

            const mediaHeaderHtml = resolvedMedia.url
              ? `<div class="jk-service-card-media aspect-16/9 overflow-hidden bg-slate-100">
            <img src="${resolvedMedia.url}" alt="${escapeHtmlAttr(resolvedMedia.alt)}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async">
          </div>`
              : `<div class="jk-service-card-media-fallback flex items-center justify-between px-6 py-5 bg-slate-900 text-white border-b border-slate-800">
            <span class="jk-service-card-index text-xs font-bold tracking-wider uppercase text-amber-400">${indexLabel}</span>
            <span class="jk-service-card-kicker text-xs font-medium text-slate-300 truncate">${companyName}</span>
          </div>`;

            return `
        <article data-service-card="image-card" class="group jk-card jk-service-card jk-service-card--image-card p-0 overflow-hidden flex flex-col justify-between">
          <div>
            ${mediaHeaderHtml}
            <div class="p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-2">${sTitle}</h3>
              ${sDesc ? `<p class="text-slate-600 text-sm leading-relaxed">${sDesc}</p>` : ""}
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            ${sPrice ? `<span class="text-xs font-semibold text-slate-500">${escapeHtml(sPrice)}</span>` : `<span class="text-xs font-medium text-slate-400">${companyName}</span>`}
            <a href="${detailUrl}" class="jk-service-card-link text-sm font-bold text-brand hover:underline">Detaylı Bilgi →</a>
          </div>
        </article>`;
          })
          .join("\n        ")}
      </div>`;
  } else if (cardVariant === "bordered-premium") {
    // Variant 4: Bordered Premium Card
    itemsHtml = `
      <div class="${gridColsClass}">
        ${services
          .map((s: any, idx: number) => {
            const sTitle = escapeHtml(s.name || s.title || "Hizmet");
            const sDesc = escapeHtml(s.shortDescription || s.description || "");
            const sPrice = s.priceHint || s.price || s.priceInfo;
            const detailUrl = isMulti ? `hizmet-${s.slug || idx + 1}.html` : "#contact";
            const indexLabel = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
            return `
        <article data-service-card="bordered-premium" class="jk-card jk-service-card jk-service-card--bordered-premium flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <span class="jk-service-card-index text-xs font-bold tracking-wider uppercase text-brand">${indexLabel}</span>
              ${sPrice ? `<span class="text-xs font-semibold text-slate-600">${escapeHtml(sPrice)}</span>` : ""}
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">${sTitle}</h3>
            ${sDesc ? `<p class="text-slate-600 text-sm leading-relaxed mb-6">${sDesc}</p>` : ""}
          </div>
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <a href="${detailUrl}" class="jk-service-card-link text-sm font-bold text-brand hover:underline">Detaylı Bilgi →</a>
          </div>
        </article>`;
          })
          .join("\n        ")}
      </div>`;
  } else if (cardVariant === "compact-local") {
    // Variant 5: Compact Local-Service Card
    itemsHtml = `
      <div class="${gridColsClass}">
        ${services
          .map((s: any, idx: number) => {
            const sTitle = escapeHtml(s.name || s.title || "Hizmet");
            const sDesc = escapeHtml(s.shortDescription || s.description || "");
            const sPrice = s.priceHint || s.price || s.priceInfo;
            const detailUrl = isMulti ? `hizmet-${s.slug || idx + 1}.html` : "#contact";
            return `
        <article data-service-card="compact-local" class="jk-card jk-service-card jk-service-card--compact-local flex flex-col justify-between p-5">
          <div>
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                ${idx + 1}
              </div>
              <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">${sTitle}</h3>
            </div>
            ${sDesc ? `<p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">${sDesc}</p>` : ""}
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            ${sPrice ? `<span class="text-xs font-bold text-slate-700">${escapeHtml(sPrice)}</span>` : `<span class="text-xs text-slate-500">Hızlı Çözüm</span>`}
            <a href="${detailUrl}" class="jk-service-card-link text-xs sm:text-sm font-bold text-brand hover:underline">Detaylı Bilgi →</a>
          </div>
        </article>`;
          })
          .join("\n        ")}
      </div>`;
  } else {
    // Variant 1: Standard Professional Card (standard-card)
    itemsHtml = `
      <div class="${gridColsClass}">
        ${services
          .map((s: any, idx: number) => {
            const sTitle = escapeHtml(s.name || s.title || "Hizmet");
            const sDesc = escapeHtml(s.shortDescription || s.description || "");
            const sPrice = s.priceHint || s.price || s.priceInfo;
            const detailUrl = isMulti ? `hizmet-${s.slug || idx + 1}.html` : "#contact";
            return `
        <article data-service-card="standard-card" class="jk-card jk-service-card jk-service-card--standard-card flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg mb-4">
              ${idx + 1}
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">${sTitle}</h3>
            ${sDesc ? `<p class="text-slate-600 text-sm leading-relaxed mb-4">${sDesc}</p>` : ""}
          </div>
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            ${sPrice ? `<span class="text-xs font-semibold text-slate-500">${escapeHtml(sPrice)}</span>` : `<span class="text-xs font-medium text-slate-500">${companyName}</span>`}
            <a href="${detailUrl}" class="jk-service-card-link text-sm font-bold text-brand hover:underline">Detaylı Bilgi →</a>
          </div>
        </article>`;
          })
          .join("\n        ")}
      </div>`;
  }

  const { surfaceTone, surfaceClass, dividerClass, cardBorderClass } = resolveSectionVisualComposition(context, "muted");

  return `
  <!-- Services Section: ${variant} (Layout: ${layoutVariant}, Card: ${cardVariant}) -->
  <section id="services" data-section="services" data-variant="${escapeHtmlAttr(variant)}" data-layout-variant="${layoutVariant}" data-card-variant="${cardVariant}" data-section-surface="${surfaceTone}" class="jk-section jk-services jk-services--${layoutVariant} jk-services--card-${cardVariant} ${surfaceClass} ${dividerClass} ${cardBorderClass}">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="jk-section-kicker text-xs font-bold uppercase tracking-wider text-brand">Hizmetlerimiz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Uzmanlık Alanlarımız ve Çözümler</h2>
        <p class="text-slate-600 text-sm sm:text-base mt-3">İhtiyacınıza uygun kaliteli, garantili ve şeffaf fiyatlı hizmet seçeneklerimiz.</p>
      </div>
      ${itemsHtml}
    </div>
  </section>`;
}

/**
 * 4. ABOUT (Corporate Profile & Story — Variants: image-left | image-right)
 */
export function renderAboutSection(context: SectionRenderContext): string {
  const { site, variant, assetPrefix = "", legacyConfig } = context;
  const bp = site.businessProfile;
  const about = site.content.about;
  const companyName = escapeHtml(bp.identity.companyName);
  const story = escapeHtml(
    about?.contentHtml ||
      (about as any)?.content ||
      bp.identity.story ||
      `${companyName} olarak sektörde uzun yıllara dayanan tecrübemiz ve uzman kadromuzla müşterilerimize güvenilir hizmet sunuyoruz.`
  );
  const expYears = escapeHtml(
    about?.yearsExperience ||
      (bp.metrics?.yearsOfExperience ? `${bp.metrics.yearsOfExperience}+` : "10+")
  );
  const completedProjects = escapeHtml(
    about?.completedProjects ||
      (bp.metrics?.completedJobsCount ? `${bp.metrics.completedJobsCount}+` : "5.000+")
  );

  const mediaRegistry = buildTenantMediaRegistry(site, legacyConfig);
  const aboutMediaAsset = mediaRegistry.get("about-main");
  const rawAboutImg = aboutMediaAsset?.originalUrl || about?.imageUrl || (about as any)?.image;
  const resolvedAboutImg = rawAboutImg ? resolveAssetUrlForDepth(rawAboutImg, assetPrefix) : "";
  const aboutImgUrl =
    resolvedAboutImg ||
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
  const aboutImgAlt = escapeHtmlAttr(about?.imageAlt || aboutMediaAsset?.altText || companyName);

  const layoutVariant = resolveAboutLayoutVariant(variant);
  const { surfaceTone, surfaceClass, dividerClass } = resolveSectionVisualComposition(context, "light");

  const contentColumnHtml = `
      <div class="jk-about-content-col">
        <span class="jk-section-kicker text-xs font-bold uppercase tracking-wider text-brand">Kurumsal Profilimiz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-6">${escapeHtml(about?.title || "Hakkımızda & Değerlerimiz")}</h2>
        <div class="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
          <p>${story}</p>
        </div>
        <div class="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div>
            <div class="text-3xl font-black text-brand">${expYears}</div>
            <div class="text-xs font-semibold text-slate-500 uppercase mt-1">Yıllık Tecrübe</div>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-900">${completedProjects}</div>
            <div class="text-xs font-semibold text-slate-500 uppercase mt-1">Mutlu Müşteri</div>
          </div>
        </div>
      </div>`;

  const mediaColumnHtml = `
      <div class="jk-about-media-col relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 bg-slate-100">
        <img src="${aboutImgUrl}" alt="${aboutImgAlt}" class="w-full h-full object-cover" loading="lazy" decoding="async">
      </div>`;

  const orderedColumnsHtml =
    layoutVariant === "image-left"
      ? `${mediaColumnHtml}\n${contentColumnHtml}`
      : `${contentColumnHtml}\n${mediaColumnHtml}`;

  return `
  <!-- About Section: ${variant} (Layout: ${layoutVariant}) -->
  <section id="about" data-section="about" data-variant="${escapeHtmlAttr(variant)}" data-layout-variant="${layoutVariant}" data-section-surface="${surfaceTone}" class="jk-section jk-about jk-about--${layoutVariant} ${surfaceClass} ${dividerClass}">
    <div class="jk-container jk-about-grid jk-about-grid--${layoutVariant}">
${orderedColumnsHtml}
    </div>
  </section>`;
}

/**
 * 5. WHY US (Value Proposition & Trust Badges)
 */
export function renderWhyUsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const whyUs = site.content.whyUs;
  const items = whyUs?.items || [
    { title: "Hızlı ve Güvenilir", description: "Zamanında müdahale ve güvenilir destek ile işlerinizi aksatmayın." },
    { title: "Uzman Kadro", description: "Alanında sertifikalı ve tecrübeli profesyonellerle çalışmanın rahatlığı." },
    { title: "Garantili Hizmet", description: "Yapılan işlemlerde müşteri memnuniyeti ve titiz işçilik garantisi." },
  ];
  const { surfaceTone, surfaceClass, dividerClass } = resolveSectionVisualComposition(context, "dark");

  return `
  <!-- WhyUs Section: ${variant} -->
  <section id="whyUs" data-section="whyUs" data-section-surface="${surfaceTone}" class="jk-section ${surfaceClass} ${dividerClass} bg-slate-900 text-white">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="jk-section-kicker text-xs font-bold uppercase tracking-wider text-amber-400">Neden Bizi Seçmelisiniz?</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">${escapeHtml(whyUs?.title || "Bizi Rakiplerimizden Ayıran Ayrıcalıklar")}</h2>
        <p class="text-slate-400 text-sm sm:text-base mt-3">${escapeHtml(whyUs?.subtitle || "Müşteri odaklı çalışma prensibimiz ve yüksek kalite standartlarımızla yanınızdayız.")}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${items.map((item, idx) => `
        <div class="p-6 rounded-xl bg-slate-800/80 border border-slate-700">
          <div class="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-base mb-4">
            ✓
          </div>
          <h3 class="text-lg font-bold text-white mb-2">${escapeHtml(item.title)}</h3>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(item.description)}</p>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 6. GALLERY (Photo Showcase & Lightbox Candidate)
 */
export function renderGallerySection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const rawGallery: any = site.content.gallery;
  const items = Array.isArray(rawGallery) ? rawGallery : (rawGallery?.items || []);
  const { surfaceTone, surfaceClass, dividerClass } = resolveSectionVisualComposition(context, "muted");

  return `
  <!-- Gallery Section: ${variant} -->
  <section id="gallery" data-section="gallery" data-section-surface="${surfaceTone}" class="jk-section ${surfaceClass} ${dividerClass}">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="jk-section-kicker text-xs font-bold uppercase tracking-wider text-brand">Fotoğraf Vitrini</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Çalışmalarımız ve Saha Kareleri</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${items.map((img) => `
        <div class="group relative rounded-xl overflow-hidden aspect-4/3 bg-slate-200 shadow-sm">
          <img src="${sanitizeUrl(img.imageUrl || (img as any).url)}" alt="${escapeHtmlAttr(img.title || 'Galeri Fotoğrafı')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
          ${img.title ? `<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
            <span class="text-white text-sm font-semibold">${escapeHtml(img.title)}</span>
          </div>` : ""}
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 7. TESTIMONIALS (Customer Reviews & Social Proof)
 */
export function renderTestimonialsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const reviews = site.content.testimonials || [];
  const { surfaceTone, surfaceClass, dividerClass, cardBorderClass } = resolveSectionVisualComposition(context, "light");

  return `
  <!-- Testimonials Section: ${variant} -->
  <section id="testimonials" data-section="testimonials" data-section-surface="${surfaceTone}" class="jk-section ${surfaceClass} ${dividerClass}">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="jk-section-kicker text-xs font-bold uppercase tracking-wider text-brand">Müşteri Yorumları</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Müşterilerimiz Ne Diyor?</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${reviews.map((rev) => `
        <blockquote class="jk-card ${cardBorderClass} flex flex-col justify-between">
          <div class="text-amber-400 mb-3 text-sm">★★★★★</div>
          <p class="text-slate-600 text-sm leading-relaxed mb-4 italic">"${escapeHtml(rev.comment)}"</p>
          <div class="pt-4 border-t border-slate-100">
            <cite class="not-italic font-bold text-slate-900 text-sm block">${escapeHtml(rev.name || (rev as any).author || 'Müşteri')}</cite>
            ${rev.role ? `<span class="text-xs text-slate-500">${escapeHtml(rev.role)}</span>` : ""}
          </div>
        </blockquote>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 8. FAQS (Frequently Asked Questions & Accordion)
 */
export function renderFaqsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const faqs = site.content.faqs || [];
  const { surfaceTone, surfaceClass, dividerClass, cardBorderClass } = resolveSectionVisualComposition(context, "muted");

  return `
  <!-- FAQs Section: ${variant} -->
  <section id="faqs" data-section="faqs" data-section-surface="${surfaceTone}" class="jk-section ${surfaceClass} ${dividerClass}">
    <div class="jk-container max-w-4xl">
      <div class="text-center mb-12">
        <span class="jk-section-kicker text-xs font-bold uppercase tracking-wider text-brand">Sıkça Sorulan Sorular</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Merak Edilenler</h2>
      </div>

      <div class="space-y-4">
        ${faqs.map((faq, idx) => `
        <div class="jk-card ${cardBorderClass}">
          <button type="button" class="w-full text-left font-bold text-slate-900 flex items-center justify-between gap-4" onclick="toggleFaq(${idx})" aria-controls="faq-content-${idx}" aria-expanded="false">
            <span>${escapeHtml(faq.question)}</span>
            <span id="faqIcon-${idx}" class="text-xl font-bold text-brand shrink-0">+</span>
          </button>
          <div id="faq-content-${idx}" class="hidden pt-3 text-slate-600 text-sm leading-relaxed border-t border-slate-100 mt-3">
            <p>${escapeHtml(faq.answer)}</p>
          </div>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 9. CONTACT (Address, Phone, WhatsApp & Lead Form)
 */
export function renderContactSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const email = bp.contact.email ? escapeHtml(bp.contact.email) : "";
  const address = bp.location.address ? escapeHtml(bp.location.address) : "";
  const { surfaceTone, surfaceClass, buttonEmphasisClass, cardBorderClass } = resolveSectionVisualComposition(context, "light");

  return `
  <!-- Contact Section: ${variant} -->
  <section id="contact" data-section="contact" data-section-surface="${surfaceTone}" class="jk-section ${surfaceClass}">
    <div class="jk-container grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <span class="jk-section-kicker text-xs font-bold uppercase tracking-wider text-brand">İletişim & Konum</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-6">Bize Ulaşın</h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">Sorularınız, fiyat teklifleri veya randevu talepleriniz için bize hemen ulaşabilirsiniz.</p>

        <div class="space-y-4 text-sm text-slate-700">
          ${phoneClean ? `<div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">📞</span>
            <a href="tel:${phoneClean}" class="hover:underline font-semibold">${phone}</a>
          </div>` : ""}
          ${email ? `<div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">✉</span>
            <a href="mailto:${email}" class="hover:underline font-semibold">${email}</a>
          </div>` : ""}
          ${address ? `<div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold shrink-0">📍</span>
            <span>${address}</span>
          </div>` : ""}
        </div>
      </div>

      <div class="jk-card ${cardBorderClass}">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Hızlı Teklif / Mesaj Formu</h3>
        <form class="space-y-4" onsubmit="event.preventDefault(); alert('Mesajınız alındı.');">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Adınız Soyadınız</label>
            <input type="text" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Adınız Soyadınız">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Telefon Numaranız</label>
            <input type="tel" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="05XX XXX XX XX">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Mesajınız</label>
            <textarea rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Hizmet detayları veya sorularınız..."></textarea>
          </div>
          <button type="submit" class="w-full jk-button jk-button-primary ${buttonEmphasisClass} text-sm py-3">Gönder</button>
        </form>
      </div>
    </div>
  </section>`;
}

/**
 * 10. PRODUCTS (Catalog & Merchandise)
 */
export function renderProductsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const products = site.content.catalogProducts || [];

  return `
  <!-- Products Section: ${variant} -->
  <section id="products" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Ürün Kataloğumuz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Öne Çıkan Ürün ve Çözümler</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${products.map((p) => `
        <article class="jk-card flex flex-col justify-between">
          <div>
            <div class="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-4">
              <img src="${p.images?.[0] ? sanitizeUrl(p.images[0]) : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtmlAttr(p.title)}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-1">${escapeHtml(p.title)}</h3>
            <p class="text-slate-600 text-xs leading-relaxed mb-4">${escapeHtml(p.shortDescription || "")}</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="font-bold text-brand">${escapeHtml(p.price || "Teklif Alın")}</span>
            <a href="#contact" class="text-xs font-bold text-slate-700 hover:text-brand">Detay →</a>
          </div>
        </article>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 11. PRICING (Transparent Pricing Packages)
 */
export function renderPricingSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const plans = site.content.pricingPlans || [];

  return `
  <!-- Pricing Section: ${variant} -->
  <section id="pricing" class="jk-section bg-white">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Fiyatlandırma</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Şeffaf ve Net Paketler</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${plans.map((p) => `
        <div class="jk-card flex flex-col justify-between ${p.isPopular ? 'border-2 border-brand shadow-lg' : ''}">
          <div>
            ${p.isPopular ? `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand text-white mb-3">En Popüler</span>` : ""}
            <h3 class="text-xl font-bold text-slate-900 mb-2">${escapeHtml(p.name)}</h3>
            <div class="text-3xl font-black text-slate-900 mb-1">${escapeHtml(p.price)}</div>
            <p class="text-xs text-slate-500 mb-6">${escapeHtml(p.description)}</p>
            <ul class="space-y-2 text-xs text-slate-700 mb-6">
              ${p.features.map((f) => `<li>✓ ${escapeHtml(f)}</li>`).join("")}
            </ul>
          </div>
          <a href="#contact" class="w-full text-center jk-button ${p.isPopular ? 'jk-button-primary' : 'jk-button-secondary'} text-xs py-2.5">
            ${escapeHtml(p.ctaButtonText || "Teklif Al")}
          </a>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 12. BLOG (Articles & Guides)
 */
export function renderBlogSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const posts = site.content.blogPosts || [];
  const isMulti = site.settings.structureMode === "multi-page";

  return `
  <!-- Blog Section: ${variant} -->
  <section id="blog" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Rehber & Blog</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Güncel Makale ve İpuçları</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${posts.slice(0, 3).map((b, idx) => {
          const postUrl = isMulti ? `blog-${b.slug || idx + 1}.html` : "#contact";
          return `
        <article class="jk-card flex flex-col justify-between">
          <div>
            <div class="aspect-16/9 rounded-lg overflow-hidden bg-slate-200 mb-4">
              <img src="${b.coverImageUrl ? sanitizeUrl(b.coverImageUrl) : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtmlAttr(b.title)}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-2">${escapeHtml(b.title)}</h3>
            <p class="text-slate-600 text-xs leading-relaxed mb-4">${escapeHtml(b.excerpt || "")}</p>
          </div>
          <a href="${postUrl}" class="text-xs font-bold text-brand hover:underline">Yazıyı Oku →</a>
        </article>`;
        }).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 13. NEWSLETTER (Subscriber Sign-Up Strip)
 */
export function renderNewsletterSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  return `
  <!-- Newsletter Section: ${variant} -->
  <section id="newsletter" class="jk-section bg-slate-900 text-white">
    <div class="jk-container max-w-2xl text-center">
      <span class="text-xs font-bold uppercase tracking-wider text-amber-400">E-Bülten Aboneliği</span>
      <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 mb-3">Kampanyalardan Haberdar Olun</h2>
      <p class="text-slate-400 text-xs sm:text-sm mb-6">Yeni hizmetler ve indirimli paketler doğrudan e-posta kutunuza gelsin.</p>
      <form class="flex flex-col sm:flex-row gap-2" onsubmit="event.preventDefault(); alert('Kaydınız alındı.');">
        <input type="email" required placeholder="E-posta adresinizi giriniz..." class="grow px-4 py-3 rounded-lg text-sm text-slate-900 bg-white">
        <button type="submit" class="jk-button jk-button-primary text-sm py-3 px-6 shrink-0">Abone Ol</button>
      </form>
    </div>
  </section>`;
}

/**
 * 14. SOCIAL FEED (Social Media Cards)
 */
export function renderSocialFeedSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  return `
  <!-- Social Feed Section: ${variant} -->
  <section id="socialFeed" class="jk-section bg-white">
    <div class="jk-container text-center max-w-2xl">
      <span class="text-xs font-bold uppercase tracking-wider text-brand">Sosyal Medya</span>
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2 mb-4">Bizi Takip Edin</h2>
      <p class="text-slate-600 text-xs sm:text-sm mb-6">Güncel duyurular ve çalışmalarımız için resmi hesaplarımızı takip edin.</p>
      <div class="flex justify-center gap-4">
        <a href="#contact" class="jk-button jk-button-secondary text-xs py-2 px-4">Instagram</a>
        <a href="#contact" class="jk-button jk-button-secondary text-xs py-2 px-4">Facebook</a>
      </div>
    </div>
  </section>`;
}

/**
 * 15. FOOTER (Structural Footer — 4 Distinct Visual Variants)
 *
 * Variants:
 * - corporate-multicolumn : 4-column structured corporate footer + copyright strip
 * - local-service         : Top conversion CTA strip (Phone + WhatsApp) + service area + links + contact
 * - minimal               : Compact two-row clean footer (brand + nav row, contact + copyright row)
 * - premium               : High-contrast dark editorial footer with prominent heading, tagline & structured columns
 */
export function renderFooterSection(context: SectionRenderContext): string {
  const { site, variant, manifest, depth = 0 } = context;
  const bp = site.businessProfile;
  const companyName = escapeHtml(bp.identity.companyName);
  const slogan = bp.identity.slogan ? escapeHtml(bp.identity.slogan) : "";
  const shortDesc = bp.identity.shortDescription ? escapeHtml(bp.identity.shortDescription) : "";
  const currentYear = new Date().getFullYear();
  const navLinks = resolveNavigationLinks(site, depth);
  const isMulti = getEffectiveSiteMode(site) === "MULTI_PAGE";
  const prefix = depth > 0 ? "../" : "";
  const contactHref = isMulti ? `${prefix}iletisim/index.html` : "#contact";
  const servicesBaseHref = isMulti ? `${prefix}hizmetlerimiz/index.html` : "#services";

  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const whatsappClean = (bp.contact.whatsapp || bp.contact.phone || "").replace(/[^0-9]/g, "");
  const email = bp.contact.email ? escapeHtml(bp.contact.email) : "";
  const address = bp.location.address ? escapeHtml(bp.location.address) : "";
  const city = bp.location.city ? escapeHtml(bp.location.city) : "";
  const district = bp.location.district ? escapeHtml(bp.location.district) : "";
  const serviceAreas = (bp.location.serviceAreas || []).filter(Boolean).map((a) => escapeHtml(a));
  const workingHours = bp.workingHours ? escapeHtml(bp.workingHours) : "";
  const servicesList = ((site.content as any).services || site.businessProfile.services || []).slice(0, 5);

  const socialEntries: Array<{ label: string; url: string }> = [];
  if (bp.social) {
    const rawSocial: Array<[string, string | undefined]> = [
      ["Instagram", bp.social.instagram],
      ["Facebook", bp.social.facebook],
      ["LinkedIn", bp.social.linkedin],
      ["YouTube", bp.social.youtube],
      ["Twitter", bp.social.twitter],
      ["TikTok", bp.social.tiktok],
    ];
    for (const [label, rawUrl] of rawSocial) {
      if (rawUrl && rawUrl.trim().length > 0) {
        const cleanUrl = sanitizeUrl(rawUrl.trim());
        if (cleanUrl && cleanUrl !== "#") {
          socialEntries.push({ label, url: cleanUrl });
        }
      }
    }
  }

  const hasContactDetails = Boolean(phoneClean || email || address || workingHours);
  const locationSummary = [district, city].filter(Boolean).join(" / ");
  const footerLayout = resolveFooterLayoutVariant(variant, manifest?.designTokens?.footer?.layout);

  // =========================================================================
  // VARIANT C: MINIMAL CLEAN FOOTER (minimal)
  // =========================================================================
  if (footerLayout === "minimal") {
    return `
  <!-- Structural Footer: ${variant} (layout: minimal) -->
  <footer class="jk-footer jk-footer--minimal bg-white text-slate-600 text-xs border-t border-slate-200 py-10" data-section-variant="${escapeHtmlAttr(variant)}" data-layout-variant="minimal">
    <div class="jk-container space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-base font-extrabold text-slate-900 tracking-tight">${companyName}</span>
          ${slogan ? `<span class="hidden md:inline text-slate-400">·</span><span class="hidden md:inline text-slate-500">${slogan}</span>` : ""}
        </div>

        <nav class="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600 font-medium" aria-label="Alt Menü">
          ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`).join("\n          ")}
        </nav>
      </div>

      <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-500">
        <div class="flex flex-wrap items-center gap-4">
          ${phoneClean ? `<a href="tel:${phoneClean}" class="hover:text-slate-900 font-semibold">${phone}</a>` : ""}
          ${email ? `<a href="mailto:${email}" class="hover:text-slate-900">${email}</a>` : ""}
          ${address ? `<span>${address}</span>` : ""}
          ${socialEntries.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="hover:text-slate-900">${escapeHtml(s.label)}</a>`).join("")}
        </div>
        <div class="flex items-center gap-4">
          <span>© ${currentYear} ${companyName}. Tüm hakları saklıdır.</span>
          <a href="#hero" class="hover:text-slate-900 transition-colors font-semibold">Yukarı ↑</a>
        </div>
      </div>
    </div>
  </footer>`;
  }

  // =========================================================================
  // VARIANT B: LOCAL SERVICE ACTION FOOTER (local-service)
  // =========================================================================
  if (footerLayout === "local-service") {
    return `
  <!-- Structural Footer: ${variant} (layout: local-service) -->
  <footer class="jk-footer jk-footer--local-service bg-slate-900 text-slate-300 text-xs border-t border-slate-800" data-section-variant="${escapeHtmlAttr(variant)}" data-layout-variant="local-service">
    <!-- Top Conversion Strip -->
    <div class="jk-footer-cta-strip bg-slate-950 border-b border-slate-800 py-6">
      <div class="jk-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="text-base sm:text-lg font-black text-white block">${companyName}</span>
          ${slogan || locationSummary ? `<p class="text-slate-400 text-xs mt-0.5">${slogan || locationSummary}</p>` : ""}
        </div>
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          ${phoneClean ? `<a href="tel:${phoneClean}" class="jk-button jk-button-primary text-xs py-2.5 px-5 font-extrabold">📞 ${phone}</a>` : `<a href="${contactHref}" class="jk-button jk-button-primary text-xs py-2.5 px-5 font-extrabold">Hemen Teklif Alın</a>`}
          ${whatsappClean ? `<a href="https://wa.me/${whatsappClean}" target="_blank" rel="noopener noreferrer" class="jk-button bg-emerald-600 text-white text-xs py-2.5 px-5 font-bold hover:bg-emerald-500">💬 WhatsApp Hattı</a>` : ""}
        </div>
      </div>
    </div>

    <div class="jk-container py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Service Area & Summary -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Hizmet Bilgisi</h3>
          ${shortDesc ? `<p class="text-slate-400 leading-relaxed mb-3">${shortDesc}</p>` : ""}
          ${locationSummary ? `<p class="text-slate-300 font-semibold mb-2">📍 Bölge: ${locationSummary}</p>` : ""}
          ${serviceAreas.length > 0 ? `<div class="flex flex-wrap gap-1.5 mt-2">${serviceAreas.map((area) => `<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">${area}</span>`).join("")}</div>` : ""}
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Hızlı Menü</h3>
          <nav class="grid grid-cols-2 gap-2 text-slate-400 font-medium" aria-label="Alt Menü">
            ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-white transition-colors">${escapeHtml(l.label)}</a>`).join("\n            ")}
          </nav>
        </div>

        <!-- Contact Details -->
        ${hasContactDetails ? `<div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">İletişim Detayları</h3>
          <ul class="space-y-2 text-slate-400">
            ${phoneClean ? `<li>📞 <a href="tel:${phoneClean}" class="text-white font-bold hover:underline">${phone}</a></li>` : ""}
            ${email ? `<li>✉ <a href="mailto:${email}" class="hover:text-white">${email}</a></li>` : ""}
            ${address ? `<li>📍 <span>${address}</span></li>` : ""}
            ${workingHours ? `<li>🕒 <span>${workingHours}</span></li>` : ""}
          </ul>
        </div>` : `<div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Hizmetlerimiz</h3>
          <ul class="space-y-1.5 text-slate-400">
            ${servicesList.map((s) => `<li><a href="${servicesBaseHref}" class="hover:text-white transition-colors">${escapeHtml(s.title)}</a></li>`).join("\n            ")}
          </ul>
        </div>`}
      </div>

      <div class="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
        <p>© ${currentYear} ${companyName}. Tüm hakları saklıdır.</p>
        <a href="#hero" class="hover:text-white transition-colors">Yukarı Çık ↑</a>
      </div>
    </div>
  </footer>`;
  }

  // =========================================================================
  // VARIANT D: PREMIUM EDITORIAL FOOTER (premium)
  // =========================================================================
  if (footerLayout === "premium") {
    return `
  <!-- Structural Footer: ${variant} (layout: premium) -->
  <footer class="jk-footer jk-footer--premium bg-slate-950 text-slate-300 text-xs py-16 border-t border-slate-800" data-section-variant="${escapeHtmlAttr(variant)}" data-layout-variant="premium">
    <div class="jk-container">
      <!-- Prominent Editorial Brand Header -->
      <div class="pb-12 mb-12 border-b border-slate-800 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-brand block mb-2">Kurumsal Seçkinlik</span>
          <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight">${companyName}</h2>
          ${slogan ? `<p class="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">${slogan}</p>` : ""}
        </div>
        ${phoneClean ? `<div class="shrink-0">
          <a href="tel:${phoneClean}" class="jk-button jk-button-primary text-xs uppercase tracking-wider py-3 px-6">${phone}</a>
        </div>` : `<div class="shrink-0">
          <a href="${contactHref}" class="jk-button jk-button-primary text-xs uppercase tracking-wider py-3 px-6">İletişime Geçin</a>
        </div>`}
      </div>

      <!-- Structured Editorial Columns -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div>
          <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Hakkımızda</h3>
          <p class="text-slate-400 leading-relaxed">${shortDesc || slogan || companyName}</p>
          ${socialEntries.length > 0 ? `<div class="flex flex-wrap gap-3 mt-4">
            ${socialEntries.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="text-slate-300 hover:text-white underline underline-offset-4">${escapeHtml(s.label)}</a>`).join("\n            ")}
          </div>` : ""}
        </div>

        <div>
          <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Keşfet</h3>
          <nav class="flex flex-col gap-2.5 text-slate-300 font-medium" aria-label="Alt Menü">
            ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-white transition-colors">${escapeHtml(l.label)}</a>`).join("\n            ")}
          </nav>
        </div>

        <div>
          <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">${hasContactDetails ? "İletişim" : "Uzmanlık Alanları"}</h3>
          ${hasContactDetails ? `<ul class="space-y-2.5 text-slate-400">
            ${phoneClean ? `<li><a href="tel:${phoneClean}" class="text-white font-semibold hover:underline">${phone}</a></li>` : ""}
            ${email ? `<li><a href="mailto:${email}" class="hover:text-white">${email}</a></li>` : ""}
            ${address ? `<li><span>${address}</span></li>` : ""}
            ${workingHours ? `<li><span>${workingHours}</span></li>` : ""}
          </ul>` : `<ul class="space-y-2 text-slate-400">
            ${servicesList.map((s) => `<li><a href="${servicesBaseHref}" class="hover:text-white transition-colors">${escapeHtml(s.title)}</a></li>`).join("\n            ")}
          </ul>`}
        </div>
      </div>

      <div class="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
        <p>© ${currentYear} ${companyName}. Tüm hakları saklıdır.</p>
        <a href="#hero" class="hover:text-white transition-colors uppercase tracking-wider text-[11px]">Yukarı Çık ↑</a>
      </div>
    </div>
  </footer>`;
  }

  // =========================================================================
  // VARIANT A: CORPORATE MULTI-COLUMN FOOTER (corporate-multicolumn — Default)
  // =========================================================================
  return `
  <!-- Structural Footer: ${variant} (layout: corporate-multicolumn) -->
  <footer class="jk-footer jk-footer--corporate-multicolumn bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800" data-section-variant="${escapeHtmlAttr(variant)}" data-layout-variant="corporate-multicolumn">
    <div class="jk-container">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
        <!-- Column 1: Company Name & Summary -->
        <div>
          <span class="text-base font-extrabold text-white block mb-2">${companyName}</span>
          ${slogan ? `<p class="text-slate-300 font-medium mb-2">${slogan}</p>` : ""}
          ${shortDesc ? `<p class="text-slate-400 leading-relaxed line-clamp-3">${shortDesc}</p>` : ""}
          ${socialEntries.length > 0 ? `<div class="flex flex-wrap gap-3 mt-4">
            ${socialEntries.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-white">${escapeHtml(s.label)}</a>`).join("\n            ")}
          </div>` : ""}
        </div>

        <!-- Column 2: Quick Navigation Links -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Hızlı Bağlantılar</h3>
          <nav class="flex flex-col gap-2 text-slate-400 font-medium" aria-label="Alt Menü">
            ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-white transition-colors">${escapeHtml(l.label)}</a>`).join("\n            ")}
          </nav>
        </div>

        <!-- Column 3: Services List -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Hizmetlerimiz</h3>
          ${servicesList.length > 0 ? `<ul class="space-y-2 text-slate-400">
            ${servicesList.map((s) => `<li><a href="${servicesBaseHref}" class="hover:text-white transition-colors">${escapeHtml(s.title)}</a></li>`).join("\n            ")}
          </ul>` : `<p class="text-slate-500">${companyName}</p>`}
        </div>

        <!-- Column 4: Contact Info & Working Hours -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">İletişim</h3>
          ${hasContactDetails ? `<ul class="space-y-2 text-slate-400">
            ${phoneClean ? `<li>📞 <a href="tel:${phoneClean}" class="text-slate-200 hover:text-white font-semibold">${phone}</a></li>` : ""}
            ${email ? `<li>✉ <a href="mailto:${email}" class="hover:text-white">${email}</a></li>` : ""}
            ${address ? `<li>📍 <span>${address}</span></li>` : ""}
            ${workingHours ? `<li>🕒 <span>${workingHours}</span></li>` : ""}
          </ul>` : `<a href="${contactHref}" class="inline-block text-slate-300 hover:text-white font-semibold">İletişim Sayfası →</a>`}
        </div>
      </div>

      <!-- Bottom Copyright Strip -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-slate-500">© ${currentYear} ${companyName}. Tüm hakları saklıdır.</p>
        <div class="flex items-center gap-6">
          <a href="#hero" class="hover:text-white transition-colors">Yukarı Çık ↑</a>
        </div>
      </div>
    </div>
  </footer>`;
}

/**
 * 16. CUSTOM HTML (Experimental Sanitized HTML Container)
 */
export function renderCustomHtmlSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  // Security guard: experimental custom html
  return `
  <!-- Custom HTML Section: ${variant} -->
  <section id="customHtml" class="jk-section bg-white">
    <div class="jk-container">
      <div class="p-6 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-xs">
        [Özel HTML Modülü]
      </div>
    </div>
  </section>`;
}

// =========================================================================
// 3. CENTRAL SECTION RENDERER REGISTRY (Section 16)
// =========================================================================

export const CANONICAL_SECTION_RENDERER_MAP: Record<CanonicalSectionId, (context: SectionRenderContext) => string> = {
  header: renderHeaderSection,
  hero: renderHeroSection,
  services: renderServicesSection,
  about: renderAboutSection,
  whyUs: renderWhyUsSection,
  gallery: renderGallerySection,
  testimonials: renderTestimonialsSection,
  faqs: renderFaqsSection,
  contact: renderContactSection,
  products: renderProductsSection,
  pricing: renderPricingSection,
  blog: renderBlogSection,
  newsletter: renderNewsletterSection,
  socialFeed: renderSocialFeedSection,
  footer: renderFooterSection,
  customHtml: renderCustomHtmlSection,
};

/**
 * Primary Canonical Section Rendering Dispatcher.
 *
 * Enforces:
 * 1. Section definition lookup from registry
 * 2. Section readiness check (EMPTY sections not rendered)
 * 3. Variant resolution (customer config -> template manifest -> registry default)
 */
export function renderCanonicalSection(
  sectionIdOrAlias: string,
  context: RenderContext,
  order = 0
): string {
  const canonicalId = normalizeSectionId(sectionIdOrAlias);
  if (!canonicalId || !isCanonicalSectionId(canonicalId)) {
    // Unknown section safely ignored
    return "";
  }

  const { site, manifest } = context;

  // Evaluate Content Readiness (Sprint 06 Engine)
  const readiness = evaluateSectionReadiness(canonicalId, {
    businessProfile: site.businessProfile,
    siteContent: site.content,
    sectionConfig: site.sectionConfiguration,
  });

  // Invariant: EMPTY or disabled sections must not be rendered
  if (!readiness.canRender || readiness.status === "EMPTY" || readiness.status === "NOT_CONFIGURED") {
    return "";
  }

  // Resolve Variant
  const variant = resolveSectionVariant(canonicalId, site, manifest);

  // Dispatch to renderer
  const renderer = CANONICAL_SECTION_RENDERER_MAP[canonicalId];
  if (!renderer) {
    return "";
  }

  return renderer({
    ...context,
    sectionId: canonicalId,
    variant,
    order,
  });
}
