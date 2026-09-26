/**
 * JetKur Page Renderer (Sprint 09)
 *
 * Assembles full static pages by coordinating DocumentShell, SEOHeadRenderer,
 * SectionRendererRegistry, and ProgressiveScriptRenderer.
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { SiteConfig } from "../../types";
import { renderDocumentShell } from "./documentShell";
import { renderCanonicalSection } from "./sectionRenderer";
import { renderProgressiveScripts } from "./progressiveScriptRenderer";
import { RenderContext } from "./types";
import { escapeHtml, sanitizeUrl } from "./security";

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
      primary: manifest.designTokens.palette.primary,
      primaryDark: manifest.designTokens.palette.primaryDark,
      secondary: manifest.designTokens.palette.secondary,
      accent: manifest.designTokens.palette.accent,
      text: manifest.designTokens.palette.text,
      bg: manifest.designTokens.palette.background,
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

  const scriptsHtml = renderProgressiveScripts(effectiveConfig);

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: `${companyName} | ${bp.identity.slogan || 'Resmi Web Sitesi'}`,
      pageDesc: bp.identity.shortDescription || `${companyName} kurumsal hizmetleri ve iletişim bilgileri.`,
      pageType: "home",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
  });
}

/**
 * Renders the Kurumsal & Hakkımızda page (kurumsal.html).
 */
export function renderKurumsalPage(context: RenderContext): string {
  const { site, legacyConfig, manifest } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;

  const headerHtml = renderCanonicalSection("header", context, 0);
  const aboutHtml = renderCanonicalSection("about", context, 1);
  const whyUsHtml = renderCanonicalSection("whyUs", context, 2);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${aboutHtml}
    ${whyUsHtml}
  </main>
  ${footerHtml}
  `;

  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: manifest.designTokens.palette.primary,
      primaryDark: manifest.designTokens.palette.primaryDark,
      secondary: manifest.designTokens.palette.secondary,
      accent: manifest.designTokens.palette.accent,
      text: manifest.designTokens.palette.text,
      bg: manifest.designTokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig);

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: `Kurumsal & Hakkımızda | ${companyName}`,
      pageDesc: `${companyName} kurumsal profili, değerleri ve şirket tarihçesi.`,
      pageType: "about",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
  });
}

/**
 * Renders the Services page (hizmetler.html).
 */
export function renderServicesPage(context: RenderContext): string {
  const { site, legacyConfig, manifest } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;

  const headerHtml = renderCanonicalSection("header", context, 0);
  const servicesHtml = renderCanonicalSection("services", context, 1);
  const faqsHtml = renderCanonicalSection("faqs", context, 2);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${servicesHtml}
    ${faqsHtml}
  </main>
  ${footerHtml}
  `;

  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: manifest.designTokens.palette.primary,
      primaryDark: manifest.designTokens.palette.primaryDark,
      secondary: manifest.designTokens.palette.secondary,
      accent: manifest.designTokens.palette.accent,
      text: manifest.designTokens.palette.text,
      bg: manifest.designTokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig);

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: `Hizmetlerimiz | ${companyName}`,
      pageDesc: `${companyName} uzmanlık alanları ve kaliteli hizmet çözümleri.`,
      pageType: "service",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
  });
}

/**
 * Renders the Contact page (iletisim.html).
 */
export function renderContactPage(context: RenderContext): string {
  const { site, legacyConfig, manifest } = context;
  const bp = site.businessProfile;
  const companyName = bp.identity.companyName;

  const headerHtml = renderCanonicalSection("header", context, 0);
  const contactHtml = renderCanonicalSection("contact", context, 1);
  const footerHtml = renderCanonicalSection("footer", context, 99);

  const fullBody = `
  ${headerHtml}
  <main id="main-content">
    ${contactHtml}
  </main>
  ${footerHtml}
  `;

  const effectiveConfig = legacyConfig || ({
    id: site.id,
    companyName: bp.identity.companyName,
    palette: {
      primary: manifest.designTokens.palette.primary,
      primaryDark: manifest.designTokens.palette.primaryDark,
      secondary: manifest.designTokens.palette.secondary,
      accent: manifest.designTokens.palette.accent,
      text: manifest.designTokens.palette.text,
      bg: manifest.designTokens.palette.background,
    },
  } as unknown as SiteConfig);

  const scriptsHtml = renderProgressiveScripts(effectiveConfig);

  return renderDocumentShell({
    config: effectiveConfig,
    seo: {
      pageTitle: `İletişim & Konum | ${companyName}`,
      pageDesc: `${companyName} iletişim numaraları, adres krokisi ve mesaj formu.`,
      pageType: "contact",
    },
    bodyContent: fullBody,
    scriptsContent: scriptsHtml,
  });
}

