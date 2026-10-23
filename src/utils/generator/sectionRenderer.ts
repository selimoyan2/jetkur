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

// =========================================================================
// 1. VARIANT RESOLUTION ENGINE (Section 20)
// Priority: Customer Explicit Override -> Template Manifest Recipe -> Registry Default -> Fallback
// =========================================================================

export function resolveSectionVariant(
  sectionId: CanonicalSectionId,
  site: CanonicalSite,
  manifest?: TemplateManifest
): string {
  const def = getSectionDefinition(sectionId);
  const allowed = def ? def.allowedVariants : [];
  const defaultVar = def ? def.defaultVariant : "standard";

  // 1. Customer explicit override from sectionConfiguration
  const userSection = site.sectionConfiguration?.sections?.find(
    (s) => normalizeSectionId(s.type || s.id) === sectionId
  );
  const userVariant = userSection?.variant || (userSection as any)?.variantOverride;
  if (userVariant && allowed.includes(userVariant)) {
    return userVariant;
  }

  // 2. Applied variant override from designTemplate
  if ((site.designTemplate as any)?.appliedVariantOverrides?.[sectionId]) {
    const override = (site.designTemplate as any).appliedVariantOverrides[sectionId];
    if (allowed.includes(override)) return override;
  }

  // 3. Template Manifest recipe
  if (manifest?.sectionRecipe?.[sectionId]) {
    const recipeVariant = manifest.sectionRecipe[sectionId];
    if (allowed.includes(recipeVariant)) return recipeVariant;
  }

  // 4. Registry defaultVariant
  return defaultVar;
}

// =========================================================================
// 2. CANONICAL SECTION RENDERERS (All 15 Active + 1 Experimental)
// =========================================================================

/**
 * 1. HEADER (Structural Navigation)
 */
export function renderHeaderSection(context: SectionRenderContext): string {
  const { site, variant, depth = 0 } = context;
  const bp = site.businessProfile;
  const companyName = escapeHtml(bp.identity.companyName || "JetKur İşletme");
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const logoUrl = bp.branding.logoUrl ? sanitizeUrl(bp.branding.logoUrl) : "";
  const mode = getEffectiveSiteMode(site);
  const isMulti = mode === "MULTI_PAGE";
  const homeHref = depth > 0 ? "../index.html" : isMulti ? "index.html" : "#hero";

  // Shared route resolver for desktop and mobile navigation
  const navLinks = resolveNavigationLinks(site, depth);

  // Determine layout variant category
  const v = (variant || "").toLowerCase();
  let variantKey: "corporate" | "local" | "minimal" | "luxury" = "corporate";
  if (v === "local-service" || v === "urgent-service" || v === "urgent-callout") {
    variantKey = "local";
  } else if (v === "modern-minimal" || v === "minimal-sticky" || v === "minimal-split" || v === "minimal") {
    variantKey = "minimal";
  } else if (v === "premium-luxury" || v === "centered" || v === "luxury") {
    variantKey = "luxury";
  } else {
    variantKey = "corporate";
  }

  // Common Mobile Drawer (Progressive Enhancement - Accessible, Escape-to-Close, Focus Managed)
  const mobileDrawerHtml = `
    <!-- Mobile Drawer Navigation (Progressive Enhancement) -->
    <div id="mobileMenuBackdrop" onclick="closeMobileMenu()" class="hidden fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-xs opacity-0 transition-opacity duration-300 md:hidden" aria-hidden="true" style="display: none;"></div>
    <div id="mobileDrawer" class="fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-in-out md:hidden border-l border-slate-100" role="dialog" aria-modal="true" aria-label="Mobil Menü">
      <div>
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <span class="text-base font-extrabold text-slate-900 truncate">${companyName}</span>
          <button type="button" onclick="closeMobileMenu()" class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200" aria-label="Kapat">✕</button>
        </div>
        <nav class="flex flex-col gap-3" aria-label="Mobil Gezinme">
          ${navLinks.map((l) => `<a href="${l.href}" onclick="closeMobileMenu()" class="py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`).join("\n          ")}
        </nav>
      </div>
      <div class="pt-6 border-t border-slate-100 space-y-3">
        ${phoneClean ? `<a href="tel:${phoneClean}" class="w-full jk-button jk-button-primary text-center text-xs py-2.5 px-4 block">📞 ${phone}</a>` : ""}
      </div>
    </div>`;

  // 1. HEADER B: Local Service Conversion
  if (variantKey === "local") {
    const callHref = phoneClean ? `tel:${phoneClean}` : "#contact";
    return `
  <!-- Structural Header: ${variant} -->
  <header class="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200 jk-header jk-header-local">
    <div class="jk-container flex items-center justify-between h-16 sm:h-20 gap-4">
      <!-- Logo & Name -->
      <a href="${homeHref}" class="flex items-center gap-3 min-w-0" aria-label="${companyName}">
        ${logoUrl
          ? `<img src="${logoUrl}" alt="${companyName}" style="height: 44px; width: auto; max-width: 180px;" class="shrink-0 object-contain">`
          : `<div class="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">${companyName.charAt(0)}</div>
        <div class="flex flex-col">
          <span class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate leading-tight">${companyName}</span>
          <span class="text-xs font-semibold text-brand hidden sm:block">Hızlı Hizmet & Güvenilir Destek</span>
        </div>`
        }
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-700" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <!-- Conversion CTAs: Prominent Phone & Call Now -->
      <div class="flex items-center gap-3">
        ${phoneClean ? `
        <div class="hidden sm:flex flex-col text-right">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hızlı İletişim Hattı</span>
          <a href="tel:${phoneClean}" class="text-sm sm:text-base font-black text-brand hover:underline tracking-tight">📞 ${phone}</a>
        </div>` : ""}
        <a href="${callHref}" class="jk-button jk-button-primary text-xs sm:text-sm py-2 px-4 shadow-sm" aria-label="Hemen Ara${phone ? ': ' + phone : ''}">
          <span>Hemen Ara</span>
        </a>

        <!-- Mobile Tap-to-Call + Toggle -->
        ${phoneClean ? `<a href="tel:${phoneClean}" class="sm:hidden w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center shadow-xs" aria-label="Hemen Ara">📞</a>` : ""}
        <button type="button" id="mobileMenuToggleBtn" onclick="toggleMobileMenu()" class="md:hidden w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200" aria-label="Menüyü Aç/Kapat" aria-expanded="false" aria-controls="mobileDrawer">
          <span id="mobileMenuOpenIcon">☰</span>
          <span id="mobileMenuCloseIcon" class="hidden">✕</span>
        </button>
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
  }

  // 2. HEADER C: Modern Minimal
  if (variantKey === "minimal") {
    return `
  <!-- Structural Header: ${variant} -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 jk-header jk-header-minimal">
    <div class="jk-container flex items-center justify-between h-16 sm:h-20 gap-6">
      <!-- Minimal Typographic Logo -->
      <a href="${homeHref}" class="flex items-center gap-3 min-w-0" aria-label="${companyName}">
        ${logoUrl
          ? `<img src="${logoUrl}" alt="${companyName}" style="height: 38px; width: auto; max-width: 180px;" class="shrink-0 object-contain">`
          : `<span class="text-lg font-bold text-slate-900 tracking-wider uppercase font-heading">${companyName}</span>`
        }
      </a>

      <!-- Minimal Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-semibold text-slate-600" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-slate-900 transition-colors pb-0.5 border-b border-transparent hover:border-slate-900">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <!-- Understated Action -->
      <div class="flex items-center gap-4">
        <a href="#contact" class="hidden sm:inline-flex text-xs uppercase tracking-widest font-bold text-slate-900 px-4 py-2 rounded border border-slate-300 hover:border-slate-900 transition-colors">İletişim</a>
        <button type="button" id="mobileMenuToggleBtn" onclick="toggleMobileMenu()" class="md:hidden w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-slate-800 hover:bg-slate-100" aria-label="Menüyü Aç/Kapat" aria-expanded="false" aria-controls="mobileDrawer">
          <span id="mobileMenuOpenIcon">☰</span>
          <span id="mobileMenuCloseIcon" class="hidden">✕</span>
        </button>
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
  }

  // 3. HEADER D: Premium Luxury
  if (variantKey === "luxury") {
    return `
  <!-- Structural Header: ${variant} -->
  <header class="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-white border-b border-amber-500/20 jk-header jk-header-luxury">
    <div class="jk-container flex items-center justify-between h-20 gap-4">
      <!-- Centered / Balanced Brand -->
      <a href="${homeHref}" class="flex items-center gap-3 min-w-0" aria-label="${companyName}">
        ${logoUrl
          ? `<img src="${logoUrl}" alt="${companyName}" style="height: 48px; width: auto; max-width: 200px;" class="shrink-0 object-contain">`
          : `<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">${companyName.charAt(0)}</div>
        <div class="flex flex-col">
          <span class="text-base sm:text-lg font-bold text-white tracking-[0.1em] uppercase font-heading truncate">${companyName}</span>
          <span class="text-[10px] text-amber-300/80 tracking-[0.2em] uppercase">Seçkin Hizmet Deneyimi</span>
        </div>`
        }
      </a>

      <!-- Refined Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.15em] font-medium text-slate-300" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-amber-300 transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <!-- Luxury Action CTA -->
      <div class="flex items-center gap-3">
        <a href="#contact" class="hidden sm:inline-flex text-xs uppercase tracking-[0.15em] font-bold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-400 hover:to-amber-600 py-2.5 px-5 rounded-lg shadow-md transition-all">
          Randevu Al
        </a>
        <button type="button" id="mobileMenuToggleBtn" onclick="toggleMobileMenu()" class="md:hidden w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20" aria-label="Menüyü Aç/Kapat" aria-expanded="false" aria-controls="mobileDrawer">
          <span id="mobileMenuOpenIcon">☰</span>
          <span id="mobileMenuCloseIcon" class="hidden">✕</span>
        </button>
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
  }

  // 4. HEADER A: Corporate Classic (Default)
  return `
  <!-- Structural Header: ${variant} -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200 jk-header jk-header-corporate">
    <div class="jk-container flex items-center justify-between h-16 sm:h-20 gap-4">
      <a href="${homeHref}" class="flex items-center gap-3 min-w-0" aria-label="${companyName}">
        ${logoUrl 
          ? `<img src="${logoUrl}" alt="${companyName}" style="height: 44px; width: auto; max-width: 200px;" class="shrink-0 object-contain">` 
          : `<div class="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">${companyName.charAt(0)}</div>
        <span class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">${companyName}</span>`
        }
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        ${phoneClean ? `<a href="tel:${phoneClean}" class="hidden sm:inline-flex jk-button jk-button-primary text-xs sm:text-sm py-2 px-4" aria-label="Telefon: ${phone}">Hemen Ara</a>` : `<a href="#contact" class="hidden sm:inline-flex jk-button jk-button-primary text-xs sm:text-sm py-2 px-4">İletişime Geç</a>`}
        <button type="button" id="mobileMenuToggleBtn" onclick="toggleMobileMenu()" class="md:hidden w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200" aria-label="Menüyü Aç/Kapat" aria-expanded="false" aria-controls="mobileDrawer">
          <span id="mobileMenuOpenIcon">☰</span>
          <span id="mobileMenuCloseIcon" class="hidden">✕</span>
        </button>
      </div>
    </div>
    ${mobileDrawerHtml}
  </header>`;
}
/**
 * 2. HERO (Primary Welcome Showcase)
 */
export function renderHeroSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const content = site.content.hero;
  const companyName = escapeHtml(bp.identity.companyName);
  const title = escapeHtml(content?.title || bp.identity.slogan || `${companyName} Profesyonel Hizmetler`);
  const subtitle = escapeHtml(content?.subtitle || bp.identity.shortDescription || "Kaliteli, güvenilir ve garantili çözümler.");
  const ctaPrimary = escapeHtml(content?.ctaPrimaryText || "Hemen İletişime Geç");
  const ctaPrimaryLink = sanitizeUrl(content?.ctaPrimaryLink || "#contact");
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const heroBg = content?.bgImageUrl || (content as any)?.bgImage;
  const bgImage = heroBg ? sanitizeUrl(heroBg) : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80";

  return `
  <!-- Hero Section: ${variant} -->
  <section id="hero" class="relative jk-hero py-16 sm:py-24 overflow-hidden" style="background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.90)), url('${bgImage}'); background-size: cover; background-position: center;">
    <div class="jk-container relative z-10 text-center sm:text-left max-w-4xl">
      <div class="inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
        ★ Profesyonel Hizmet Standartları
      </div>
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
        ${title}
      </h1>
      <p class="text-base sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
        ${subtitle}
      </p>
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <a href="${ctaPrimaryLink}" class="w-full sm:w-auto jk-button jk-button-primary text-base py-3.5 px-8 shadow-lg">
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
 * 3. SERVICES (Core Offerings Grid)
 */
export function renderServicesSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bpServices = site.businessProfile.services || [];
  const contentServices = (site.content as any).services || [];
  const services = bpServices.length > 0 ? bpServices : contentServices;
  const isMulti = site.settings.structureMode === "multi-page" || site.settings.siteMode === "MULTI_PAGE";

  const v = (variant || "").toLowerCase();
  let cardStyle: "standard" | "minimal" | "image" | "bordered" | "compact" = "standard";
  if (v === "minimal-icon" || v === "minimal" || v === "list") {
    cardStyle = "minimal";
  } else if (v === "image-focused" || v === "image-card") {
    cardStyle = "image";
  } else if (v === "bordered-premium" || v === "bordered" || v === "cards-3") {
    cardStyle = "bordered";
  } else if (v === "compact-service" || v === "compact" || v === "grid-4") {
    cardStyle = "compact";
  } else {
    cardStyle = "standard";
  }

  return `
  <!-- Services Section: ${variant} -->
  <section id="services" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Hizmetlerimiz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Uzmanlık Alanlarımız ve Çözümler</h2>
        <p class="text-slate-600 text-sm sm:text-base mt-3">İhtiyacınıza uygun kaliteli, garantili ve şeffaf fiyatlı hizmet seçeneklerimiz.</p>
      </div>

      <div class="jk-services-grid ${cardStyle === 'compact' ? 'jk-services-grid-compact' : ''}">
        ${services.map((s: any, idx: number) => {
          const sTitle = escapeHtml(s.title || s.name || "Hizmet");
          const sDesc = escapeHtml(s.shortDescription || s.description || s.desc || "");
          const sPrice = s.price || s.priceHint || s.priceInfo;
          const detailUrl = isMulti ? `hizmet-${s.slug || idx + 1}.html` : "#contact";
          const rawImg = s.imageUrl || s.image;
          const sImg = rawImg ? sanitizeUrl(rawImg) : "";

          // 1. Minimal icon / text card
          if (cardStyle === "minimal") {
            return `
        <article class="jk-card jk-service-card-minimal flex flex-col justify-between border-l-4 border-l-brand hover:border-l-brand-dark transition-all">
          <div>
            <div class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">0${idx + 1}</div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">${sTitle}</h3>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">${sDesc}</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="font-medium text-slate-500">${sPrice ? escapeHtml(sPrice) : ""}</span>
            <a href="${detailUrl}" class="font-bold text-slate-900 hover:text-brand transition-colors">İncele →</a>
          </div>
        </article>`;
          }

          // 2. Image-focused service card
          if (cardStyle === "image") {
            return `
        <article class="jk-card jk-service-card-image p-0 overflow-hidden flex flex-col justify-between">
          <div>
            ${sImg
              ? `<div class="aspect-video w-full bg-slate-100 overflow-hidden"><img src="${sImg}" alt="${sTitle}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy"></div>`
              : `<div class="aspect-video w-full bg-gradient-to-br from-brand/20 to-slate-200 flex items-center justify-center text-brand font-black text-2xl">${sTitle.charAt(0)}</div>`
            }
            <div class="p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-2">${sTitle}</h3>
              <p class="text-slate-600 text-sm leading-relaxed mb-4">${sDesc}</p>
            </div>
          </div>
          <div class="px-6 pb-6 pt-2 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">${sPrice ? escapeHtml(sPrice) : "Detaylı Bilgi"}</span>
            <a href="${detailUrl}" class="text-sm font-bold text-brand hover:underline">Hizmeti Gör →</a>
          </div>
        </article>`;
          }

          // 3. Bordered premium card
          if (cardStyle === "bordered") {
            return `
        <article class="jk-card jk-service-card-bordered border-2 border-slate-200 hover:border-brand flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ${idx + 1}
              </div>
              ${sPrice ? `<span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">${escapeHtml(sPrice)}</span>` : ""}
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">${sTitle}</h3>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">${sDesc}</p>
          </div>
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <a href="${detailUrl}" class="jk-button jk-button-secondary text-xs py-2 px-3 w-full text-center">Teklif & Detay Al</a>
          </div>
        </article>`;
          }

          // 4. Compact local-service card
          if (cardStyle === "compact") {
            return `
        <article class="jk-card jk-service-card-compact p-4 flex flex-col justify-between bg-white border border-slate-200 hover:border-brand shadow-xs">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-md bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">${idx + 1}</span>
              <h3 class="text-base font-extrabold text-slate-900 truncate leading-snug">${sTitle}</h3>
            </div>
            <p class="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-3">${sDesc}</p>
          </div>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="font-bold text-brand">${sPrice ? escapeHtml(sPrice) : "Hızlı Servis"}</span>
            <a href="${detailUrl}" class="font-bold text-slate-700 hover:text-brand">Detay →</a>
          </div>
        </article>`;
          }

          // 5. Standard professional card (Default)
          return `
        <article class="jk-card jk-service-card-standard flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg mb-4">
              ${idx + 1}
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">${sTitle}</h3>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">${sDesc}</p>
          </div>
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">${sPrice ? escapeHtml(sPrice) : "Uygun Fiyat"}</span>
            <a href="${detailUrl}" class="text-sm font-bold text-brand hover:underline">Detaylı Bilgi →</a>
          </div>
        </article>`;
        }).join("\n        ")}
      </div>
    </div>
  </section>`;
}
/**
 * 4. ABOUT (Corporate Profile & Story)
 */
export function renderAboutSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const about = site.content.about;
  const companyName = escapeHtml(bp.identity.companyName);
  const story = escapeHtml(about?.contentHtml || (about as any)?.content || bp.identity.story || `${companyName} olarak sektörde uzun yıllara dayanan tecrübemiz ve uzman kadromuzla müşterilerimize güvenilir hizmet sunuyoruz.`);
  const expYears = escapeHtml(about?.yearsExperience || "10+");
  const completedProjects = escapeHtml(about?.completedProjects || "5.000+");

  return `
  <!-- About Section: ${variant} -->
  <section id="about" class="jk-section bg-white">
    <div class="jk-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Kurumsal Profilimiz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-6">Hakkımızda & Değerlerimiz</h2>
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
      </div>
      <div class="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 bg-slate-100">
        <img src="${(about?.imageUrl || (about as any)?.image) ? sanitizeUrl(about?.imageUrl || (about as any)?.image) : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}" alt="${companyName}" class="w-full h-full object-cover" loading="lazy">
      </div>
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
    { title: "Hızlı ve Güvenilir", description: "Zamanında müdahale ve kesintisiz destek ile işlerinizi aksatmayın." },
    { title: "Uzman Kadro", description: "Alanında sertifikalı ve tecrübeli profesyonellerle çalışmanın rahatlığı." },
    { title: "Garantili Hizmet", description: "Yapılan tüm işlemlerde %100 müşteri memnuniyeti ve resmi işçilik garantisi." },
  ];

  return `
  <!-- WhyUs Section: ${variant} -->
  <section id="whyUs" class="jk-section bg-slate-900 text-white">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Neden Bizi Seçmelisiniz?</span>
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

  return `
  <!-- Gallery Section: ${variant} -->
  <section id="gallery" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Fotoğraf Vitrini</span>
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

  return `
  <!-- Testimonials Section: ${variant} -->
  <section id="testimonials" class="jk-section bg-white">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Müşteri Yorumları</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Müşterilerimiz Ne Diyor?</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${reviews.map((rev) => `
        <blockquote class="jk-card flex flex-col justify-between">
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

  return `
  <!-- FAQs Section: ${variant} -->
  <section id="faqs" class="jk-section bg-slate-50">
    <div class="jk-container max-w-4xl">
      <div class="text-center mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Sıkça Sorulan Sorular</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Merak Edilenler</h2>
      </div>

      <div class="space-y-4">
        ${faqs.map((faq, idx) => `
        <div class="jk-card">
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

  return `
  <!-- Contact Section: ${variant} -->
  <section id="contact" class="jk-section bg-white">
    <div class="jk-container grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-brand">İletişim & Konum</span>
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

      <div class="jk-card">
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
          <button type="submit" class="w-full jk-button jk-button-primary text-sm py-3">Gönder</button>
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
 * 15. FOOTER (Structural Footer)
 */
export function renderFooterSection(context: SectionRenderContext): string {
  const { site, variant, depth = 0 } = context;
  const bp = site.businessProfile;
  const companyName = escapeHtml(bp.identity.companyName || "JetKur");
  const slogan = escapeHtml(bp.identity.slogan || bp.identity.shortDescription || "");
  const currentYear = new Date().getFullYear();
  const navLinks = resolveNavigationLinks(site, depth);
  const services = bp.services?.length ? bp.services : ((site.content as any).services || []);
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const email = bp.contact.email ? escapeHtml(bp.contact.email) : "";
  const address = (bp.location?.address || (bp.contact as any)?.address) ? escapeHtml(bp.location?.address || (bp.contact as any)?.address) : "";
  const city = (bp.location?.city || (bp.contact as any)?.city) ? escapeHtml(bp.location?.city || (bp.contact as any)?.city) : "";

  const v = (variant || "").toLowerCase();
  let variantKey: "corporate" | "local" | "minimal" | "luxury" = "corporate";
  if (v === "local-service" || v === "urgent-footer") {
    variantKey = "local";
  } else if (v === "minimal" || v === "minimal-legal") {
    variantKey = "minimal";
  } else if (v === "premium" || v === "simple-centered" || v === "luxury") {
    variantKey = "luxury";
  } else {
    variantKey = "corporate";
  }

  // 1. FOOTER B: Local Service
  if (variantKey === "local") {
    return `
  <!-- Structural Footer: ${variant} -->
  <footer class="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 jk-footer jk-footer-local">
    <div class="jk-container">
      <!-- High-Conversion Call Card -->
      <div class="p-6 sm:p-8 rounded-2xl bg-brand text-white flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 shadow-lg">
        <div>
          <h3 class="text-xl sm:text-2xl font-black">Acil Hizmet ve Danışma Hattı</h3>
          <p class="text-white/80 text-sm mt-1">İhtiyacınız olan her an bir telefon kadar yakınız.</p>
        </div>
        ${phoneClean ? `<a href="tel:${phoneClean}" class="w-full sm:w-auto text-center jk-button bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm sm:text-base py-3 px-6 shadow-md shrink-0">📞 ${phone}</a>` : ""}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800 text-sm">
        <div>
          <span class="text-base font-extrabold text-white block mb-2">${companyName}</span>
          ${slogan ? `<p class="text-slate-400 text-xs mb-3">${slogan}</p>` : ""}
          ${(address || city) ? `<p class="text-slate-400 text-xs">📍 ${[address, city].filter(Boolean).join(", ")}</p>` : ""}
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hızlı Menü</h4>
          <nav class="flex flex-col gap-2" aria-label="Yerel Alt Menü">
            ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-white transition-colors text-xs">${escapeHtml(l.label)}</a>`).join("\n            ")}
          </nav>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">İletişim Bilgileri</h4>
          <div class="space-y-2 text-xs text-slate-400">
            ${phone ? `<p>Telefon: <a href="tel:${phoneClean}" class="text-white hover:underline">${phone}</a></p>` : ""}
            ${email ? `<p>E-posta: <a href="mailto:${email}" class="text-white hover:underline">${email}</a></p>` : ""}
          </div>
        </div>
      </div>

      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© ${currentYear} ${companyName}. Tüm hakları saklıdır.</p>
        <a href="#hero" class="hover:text-white transition-colors">Yukarı Çık ↑</a>
      </div>
    </div>
  </footer>`;
  }

  // 2. FOOTER C: Minimal
  if (variantKey === "minimal") {
    return `
  <!-- Structural Footer: ${variant} -->
  <footer class="bg-white text-slate-600 text-xs py-8 border-t border-slate-200 jk-footer jk-footer-minimal">
    <div class="jk-container flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span class="font-bold text-slate-900">${companyName}</span>
        <span class="text-slate-400 ml-2">© ${currentYear}</span>
      </div>

      <nav class="flex flex-wrap items-center gap-6 font-medium" aria-label="Minimal Alt Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-slate-900 transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <div>
        <a href="#hero" class="text-slate-400 hover:text-slate-700 transition-colors">Başa Dön ↑</a>
      </div>
    </div>
  </footer>`;
  }

  // 3. FOOTER D: Premium Luxury
  if (variantKey === "luxury") {
    return `
  <!-- Structural Footer: ${variant} -->
  <footer class="bg-slate-950 text-slate-400 text-xs py-16 border-t border-amber-500/20 jk-footer jk-footer-luxury">
    <div class="jk-container">
      <div class="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <span class="text-xl font-bold text-white tracking-[0.15em] uppercase font-heading mb-2">${companyName}</span>
        ${slogan ? `<p class="text-slate-400 text-sm max-w-md">${slogan}</p>` : ""}
      </div>

      <nav class="flex flex-wrap items-center justify-center gap-8 text-slate-300 text-xs uppercase tracking-widest font-semibold pb-10 border-b border-slate-800" aria-label="Prestij Alt Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-amber-300 transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
        <p>© ${currentYear} ${companyName}. Tüm hakları saklıdır.</p>
        ${(phone || email) ? `
        <div class="flex items-center gap-4 text-xs">
          ${phone ? `<a href="tel:${phoneClean}" class="hover:text-amber-300 transition-colors">📞 ${phone}</a>` : ""}
          ${email ? `<a href="mailto:${email}" class="hover:text-amber-300 transition-colors">✉️ ${email}</a>` : ""}
        </div>` : ""}
        <a href="#hero" class="hover:text-amber-300 transition-colors">Yukarı Çık ↑</a>
      </div>
    </div>
  </footer>`;
  }

  // 4. FOOTER A: Corporate Multi-column (Default)
  return `
  <!-- Structural Footer: ${variant} -->
  <footer class="bg-slate-950 text-slate-400 text-xs py-14 border-t border-slate-800 jk-footer jk-footer-corporate">
    <div class="jk-container">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
        <!-- Col 1: Brand -->
        <div class="md:col-span-1">
          <span class="text-base font-extrabold text-white block mb-2">${companyName}</span>
          ${slogan ? `<p class="text-slate-400 leading-relaxed mb-4 text-xs">${slogan}</p>` : ""}
          <p class="text-slate-500 text-[11px]">Güvenilir kurumsal çözümler ve profesyonel hizmet standartları.</p>
        </div>

        <!-- Col 2: Navigation -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Hızlı Bağlantılar</h4>
          <nav class="flex flex-col gap-2" aria-label="Kurumsal Alt Menü">
            ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-white transition-colors">${escapeHtml(l.label)}</a>`).join("\n            ")}
          </nav>
        </div>

        <!-- Col 3: Services -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Hizmetlerimiz</h4>
          <ul class="flex flex-col gap-2 text-slate-400">
            ${services.slice(0, 5).map((s: any) => `<li class="hover:text-white transition-colors truncate">${escapeHtml(s.title || s.name || "Hizmet")}</li>`).join("\n            ")}
          </ul>
        </div>

        <!-- Col 4: Contact -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-3">İletişim</h4>
          <div class="space-y-2 text-slate-400">
            ${phone ? `<p>Telefon: <a href="tel:${phoneClean}" class="text-white hover:underline">${phone}</a></p>` : ""}
            ${email ? `<p>E-posta: <a href="mailto:${email}" class="text-white hover:underline">${email}</a></p>` : ""}
            ${address ? `<p>Adres: ${[address, city].filter(Boolean).join(", ")}</p>` : ""}
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
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
