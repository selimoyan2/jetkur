/**
 * JetKur Page Renderer (Sprint 09 & Sprint 17 Foundation 05A.1)
 *
 * Assembles full static pages by coordinating DocumentShell, SEOHeadRenderer,
 * SectionRendererRegistry, ProgressiveScriptRenderer, and PageContent longContent rendering.
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { SiteConfig } from "../../types";
import { renderDocumentShell } from "./documentShell";
import { renderCanonicalSection } from "./sectionRenderer";
import { renderProgressiveScripts } from "./progressiveScriptRenderer";
import { RenderContext, PageType } from "./types";
import { escapeHtml, sanitizeUrl } from "./security";
import { PageContent } from "../../domain/site/pageContent";
import { renderCanonicalPageHero } from "./heroMediaResolver";

/**
 * Renders the primary homepage (index.html).
 */
export function renderHomePage(context: RenderContext): string {
  const { site, legacyConfig, manifest } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;

  // Header
  const headerHtml = renderCanonicalSection("header", context, 0);

  // Body sections in configured order
  const sectionsToRender: string[] = [];
  const configuredSections = site.sectionConfiguration?.sections || [];

  for (let i = 0; i < configuredSections.length; i++) {
    const sec = configuredSections[i];
    if ((sec.type as string) === "header" || (sec.type as string) === "footer") continue; // handled structurally
    if (sec.enabled === false) continue;

    const secHtml = renderCanonicalSection(sec.type, context, sec.order ?? i);
    if (secHtml) {
      sectionsToRender.push(secHtml);
    }
  }

  // Footer
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${sectionsToRender.join("\n")}
  </main>
  ${footerHtml}
  `;

  // Fallback config for document shell
  const tokens = context.resolvedDesignTokens || manifest.designTokens;
  const effectiveConfig: SiteConfig = legacyConfig || {
    id: site.id,
    companyName: bp.identity.companyName,
    slogan: bp.identity.slogan,
    phone: bp.contact.phone,
    whatsapp: bp.contact.whatsapp,
    email: bp.contact.email,
    city: bp.location.city,
    sector: bp.identity.sector,
    palette: {
      primary: tokens.palette.primary,
      primaryDark: tokens.palette.primaryDark,
      secondary: tokens.palette.secondary,
      accent: tokens.palette.accent,
      text: tokens.palette.text,
      bg: tokens.palette.background,
    },
    hero: {
      title: site.content.hero?.title || bp.identity.slogan || companyName,
      subtitle: site.content.hero?.subtitle || bp.identity.shortDescription,
      ctaText: site.content.hero?.ctaPrimaryText,
      ctaLink: site.content.hero?.ctaPrimaryLink,
      bgImage: site.content.hero?.bgImageUrl || (site.content.hero as any)?.bgImage,
    },
    services: {
      items: (site.content as any).services || bp.services || [],
    },
    contact: { enabled: true },
    about: {
      title: "Hakkımızda",
      content: site.content.about?.contentHtml || (site.content.about as any)?.content || bp.identity.story,
    },
  } as unknown as SiteConfig;

  const isSectionActive = (type: string) => {
    const sec = site.sectionConfiguration?.sections?.find(
      (s) => s.type === type || (s.id && s.id.toLowerCase() === type.toLowerCase())
    );
    return Boolean(sec && sec.enabled !== false);
  };

  const hasFaqs = isSectionActive("faqs") && Boolean(
    site.content.faqs && site.content.faqs.length > 0
  );
  const hasSlider = Boolean(
    site.content.hero?.slides && site.content.hero.slides.length > 1
  );
  const hasGallery = isSectionActive("gallery") && Boolean(
    site.content.gallery && site.content.gallery.length > 0
  );
  const hasCatalog = isSectionActive("products") && Boolean(
    site.content.catalogProducts && site.content.catalogProducts.length > 0
  );

  const scriptsHtml = renderProgressiveScripts(effectiveConfig, {
    faqAccordion: hasFaqs,
    heroSlider: hasSlider,
    galleryLightbox: hasGallery,
    catalogModal: hasCatalog,
  });

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: `${companyName} | ${bp.identity.slogan || 'Resmi Web Sitesi'}`,
      pageDesc: bp.identity.shortDescription || `${companyName} kurumsal hizmetleri ve iletişim bilgileri.`,
      pageType: "home",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
    resolvedTokens: tokens,
    assetPrefix: "",
  });
}

/**
 * Formats multi-paragraph longContent safely into clean HTML paragraphs.
 * If content already contains HTML tags (<p>, <div>, <br>), renders sanitized HTML.
 */
function renderSafeLongContentHtml(rawContent: string): string {
  if (!rawContent || !rawContent.trim()) {
    return "";
  }
  const trimmed = rawContent.trim();
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    // Basic sanitization: strip script tags
    return trimmed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  // Convert double newlines to paragraphs
  const paragraphs = trimmed.split(/\n\s*\n/);
  return paragraphs
    .map((p) => `<p class="mb-4 leading-relaxed">${escapeHtml(p.trim())}</p>`)
    .join("\n");
}

/**
 * Generic Dedicated Page Shell Renderer for canonical MULTI_PAGE routes.
 * Renders canonical page hero (SINGLE, SLIDER, or TEXT_ONLY), longContent body, custom sections, header and footer.
 */
export function renderDedicatedPage(
  context: RenderContext,
  page: PageContent,
  pageType: PageType,
  subSectionsHtml = ""
): string {
  const { site, legacyConfig, manifest, depth = 1 } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;
  const assetPrefix = context.assetPrefix ?? (depth > 0 ? "../" : "");

  const headerHtml = renderCanonicalSection("header", context, 0);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const { html: heroBannerHtml, resolved: resolvedHero } = renderCanonicalPageHero(
    context,
    page,
    page.title || companyName
  );
  const formattedContent = renderSafeLongContentHtml(page.longContent || page.shortDescription || "");

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${heroBannerHtml}

    <!-- Main Long Content Area -->
    ${formattedContent ? `
    <section class="jk-section bg-white py-12 sm:py-16">
      <div class="jk-container max-w-4xl">
        <article class="prose prose-slate max-w-none text-slate-700 text-base sm:text-lg leading-relaxed">
          ${formattedContent}
        </article>
      </div>
    </section>` : ""}

    ${subSectionsHtml}
  </main>
  ${footerHtml}
  `;

  const tokens = context.resolvedDesignTokens || manifest.designTokens;
  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: tokens.palette.primary,
      primaryDark: tokens.palette.primaryDark,
      secondary: tokens.palette.secondary,
      accent: tokens.palette.accent,
      text: tokens.palette.text,
      bg: tokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig, {
    pageHeroSlider: resolvedHero.requiresSliderJs,
    pageHeroSlideCount: resolvedHero.assets.length,
  });

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: page.seoTitle || `${page.title} | ${companyName}`,
      pageDesc: page.seoDescription || page.shortDescription || `${companyName} ${page.title} sayfası.`,
      pageType: "page",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
    resolvedTokens: tokens,
    assetPrefix,
  });
}

/**
 * Renders the Kurumsal & Hakkımızda page (hakkimizda/index.html & kurumsal.html).
 */
export function renderKurumsalPage(
  context: RenderContext,
  canonicalPage?: PageContent
): string {
  const { site, legacyConfig, manifest, depth = 1 } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;
  const assetPrefix = context.assetPrefix ?? (depth > 0 ? "../" : "");

  const effectivePage = canonicalPage || site.content.pages?.find((p) => p.pageType === "ABOUT");

  const headerHtml = renderCanonicalSection("header", context, 0);
  const aboutHtml = renderCanonicalSection("about", context, 1);
  const whyUsHtml = renderCanonicalSection("whyUs", context, 2);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const { html: heroBannerHtml, resolved: resolvedHero } = renderCanonicalPageHero(
    context,
    effectivePage,
    "Hakkımızda"
  );
  const longContentHtml = effectivePage?.longContent
    ? renderSafeLongContentHtml(effectivePage.longContent)
    : "";

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${effectivePage ? heroBannerHtml : ""}
    ${longContentHtml ? `
    <section class="jk-section bg-white py-10 sm:py-12 border-b border-slate-100">
      <div class="jk-container max-w-4xl">
        <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg">
          ${longContentHtml}
        </div>
      </div>
    </section>
    ` : ""}
    ${aboutHtml}
    ${whyUsHtml}
  </main>
  ${footerHtml}
  `;

  const tokens = context.resolvedDesignTokens || manifest.designTokens;
  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: tokens.palette.primary,
      primaryDark: tokens.palette.primaryDark,
      secondary: tokens.palette.secondary,
      accent: tokens.palette.accent,
      text: tokens.palette.text,
      bg: tokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig, {
    pageHeroSlider: resolvedHero.requiresSliderJs,
    pageHeroSlideCount: resolvedHero.assets.length,
  });

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: effectivePage?.seoTitle || `Kurumsal & Hakkımızda | ${companyName}`,
      pageDesc: effectivePage?.seoDescription || `${companyName} kurumsal profili, değerleri ve şirket tarihçesi.`,
      pageType: "about",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
    resolvedTokens: tokens,
    assetPrefix,
  });
}

/**
 * Renders the Services page (hizmetler/index.html & hizmetler.html).
 */
export function renderServicesPage(
  context: RenderContext,
  canonicalPage?: PageContent
): string {
  const { site, legacyConfig, manifest, depth = 1 } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;
  const assetPrefix = context.assetPrefix ?? (depth > 0 ? "../" : "");

  const effectivePage = canonicalPage || site.content.pages?.find((p) => p.pageType === "SERVICES");

  const headerHtml = renderCanonicalSection("header", context, 0);
  const servicesHtml = renderCanonicalSection("services", context, 1);
  const faqsHtml = renderCanonicalSection("faqs", context, 2);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const { html: heroBannerHtml, resolved: resolvedHero } = renderCanonicalPageHero(
    context,
    effectivePage,
    "Hizmetlerimiz"
  );
  const longContentHtml = effectivePage?.longContent
    ? renderSafeLongContentHtml(effectivePage.longContent)
    : "";

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${effectivePage ? heroBannerHtml : ""}
    ${longContentHtml ? `
    <section class="jk-section bg-white py-10 sm:py-12 border-b border-slate-100">
      <div class="jk-container max-w-4xl">
        <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg">
          ${longContentHtml}
        </div>
      </div>
    </section>
    ` : ""}
    ${servicesHtml}
    ${faqsHtml}
  </main>
  ${footerHtml}
  `;

  const tokens = context.resolvedDesignTokens || manifest.designTokens;
  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: tokens.palette.primary,
      primaryDark: tokens.palette.primaryDark,
      secondary: tokens.palette.secondary,
      accent: tokens.palette.accent,
      text: tokens.palette.text,
      bg: tokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig, {
    pageHeroSlider: resolvedHero.requiresSliderJs,
    pageHeroSlideCount: resolvedHero.assets.length,
  });

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: effectivePage?.seoTitle || `Hizmetlerimiz | ${companyName}`,
      pageDesc: effectivePage?.seoDescription || `${companyName} uzmanlık alanları ve kaliteli hizmet çözümleri.`,
      pageType: "service",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
    resolvedTokens: tokens,
    assetPrefix,
  });
}

/**
 * Renders the Products page (urunler/index.html & urunler.html).
 */
export function renderProductsPage(
  context: RenderContext,
  canonicalPage?: PageContent
): string {
  const { site, legacyConfig, manifest, depth = 1 } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;
  const assetPrefix = context.assetPrefix ?? (depth > 0 ? "../" : "");

  const effectivePage = canonicalPage || site.content.pages?.find((p) => p.pageType === "PRODUCTS");

  const headerHtml = renderCanonicalSection("header", context, 0);
  const productsHtml = renderCanonicalSection("products", context, 1);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const { html: heroBannerHtml, resolved: resolvedHero } = renderCanonicalPageHero(
    context,
    effectivePage,
    "Ürünlerimiz"
  );
  const longContentHtml = effectivePage?.longContent
    ? renderSafeLongContentHtml(effectivePage.longContent)
    : "";

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${heroBannerHtml}
    ${longContentHtml ? `
    <section class="jk-section bg-white py-10 sm:py-12 border-b border-slate-100">
      <div class="jk-container max-w-4xl">
        <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg">
          ${longContentHtml}
        </div>
      </div>
    </section>
    ` : ""}
    ${productsHtml}
  </main>
  ${footerHtml}
  `;

  const tokens = context.resolvedDesignTokens || manifest.designTokens;
  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: tokens.palette.primary,
      primaryDark: tokens.palette.primaryDark,
      secondary: tokens.palette.secondary,
      accent: tokens.palette.accent,
      text: tokens.palette.text,
      bg: tokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig, {
    pageHeroSlider: resolvedHero.requiresSliderJs,
    pageHeroSlideCount: resolvedHero.assets.length,
  });

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: effectivePage?.seoTitle || `Ürünlerimiz | ${companyName}`,
      pageDesc: effectivePage?.seoDescription || `${companyName} ürün kataloğu ve seçenekleri.`,
      pageType: "catalog",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
    resolvedTokens: tokens,
    assetPrefix,
  });
}

/**
 * Renders the Contact page (iletisim/index.html & iletisim.html).
 */
export function renderContactPage(
  context: RenderContext,
  canonicalPage?: PageContent
): string {
  const { site, legacyConfig, manifest, depth = 1 } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;
  const assetPrefix = context.assetPrefix ?? (depth > 0 ? "../" : "");

  const effectivePage = canonicalPage || site.content.pages?.find((p) => p.pageType === "CONTACT");

  const headerHtml = renderCanonicalSection("header", context, 0);
  const contactHtml = renderCanonicalSection("contact", context, 1);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const { html: heroBannerHtml, resolved: resolvedHero } = renderCanonicalPageHero(
    context,
    effectivePage,
    "İletişim & Konum"
  );
  const longContentHtml = effectivePage?.longContent
    ? renderSafeLongContentHtml(effectivePage.longContent)
    : "";

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${effectivePage ? heroBannerHtml : ""}
    ${longContentHtml ? `
    <section class="jk-section bg-white py-10 sm:py-12 border-b border-slate-100">
      <div class="jk-container max-w-4xl">
        <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg">
          ${longContentHtml}
        </div>
      </div>
    </section>
    ` : ""}
    ${contactHtml}
  </main>
  ${footerHtml}
  `;

  const tokens = context.resolvedDesignTokens || manifest.designTokens;
  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: tokens.palette.primary,
      primaryDark: tokens.palette.primaryDark,
      secondary: tokens.palette.secondary,
      accent: tokens.palette.accent,
      text: tokens.palette.text,
      bg: tokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig, {
    pageHeroSlider: resolvedHero.requiresSliderJs,
    pageHeroSlideCount: resolvedHero.assets.length,
  });

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: effectivePage?.seoTitle || `İletişim & Konum | ${companyName}`,
      pageDesc: effectivePage?.seoDescription || `${companyName} iletişim numaraları, adres krokisi ve mesaj formu.`,
      pageType: "contact",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
    resolvedTokens: tokens,
    assetPrefix,
  });
}
