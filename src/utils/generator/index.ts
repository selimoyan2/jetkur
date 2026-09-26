/**
 * JetKur Canonical Static Site Generator (Sprint 09)
 *
 * Modular orchestration layer transforming CanonicalSite domain model into static web output:
 * CanonicalSite + TemplateManifest + SectionRegistry + StaticCss => Static HTML + Static CSS + Assets.
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { CANONICAL_TEMPLATE_MANIFESTS } from "../../domain/templates/catalog";
import { GeneratedPageFile, SiteConfig } from "../../types";
import { renderHomePage, renderKurumsalPage, renderServicesPage, renderContactPage } from "./pageRenderer";
import { assembleStaticAssets } from "./assetAssembler";
import { RenderContext } from "./types";

// Re-export all modular components
export * from "./types";
export * from "./security";
export * from "./seoHeadRenderer";
export * from "./documentShell";
export * from "./sectionRenderer";
export * from "./progressiveScriptRenderer";
export * from "./assetAssembler";
export * from "./pageRenderer";

/**
 * Canonical Site Static Generation Entrypoint.
 *
 * Takes a CanonicalSite and TemplateManifest, generating all static pages,
 * stylesheets, and edge deployment manifests.
 */
export function generateStaticSite(
  site: CanonicalSite,
  explicitManifest?: TemplateManifest,
  legacyConfig?: SiteConfig
): GeneratedPageFile[] {
  const manifest =
    explicitManifest ||
    CANONICAL_TEMPLATE_MANIFESTS.find((m) => m.id === site.designTemplate?.templateId) ||
    CANONICAL_TEMPLATE_MANIFESTS[0];

  const context: RenderContext = {
    site,
    manifest,
    legacyConfig,
    activePageSlug: "index",
    currentPageType: "home",
  };

  const files: GeneratedPageFile[] = [];

  // 1. Render Homepage (index.html)
  const homeHtml = renderHomePage(context);
  files.push({
    filename: "index.html",
    fileName: "index.html",
    title: `${site.businessProfile.identity.companyName} | Ana Sayfa`,
    type: "home",
    html: homeHtml,
    content: homeHtml,
    slug: "home",
    description: "Ana giriş sayfası ve öne çıkan kurumsal vitrin",
  });

  // Multi-page subpages if structureMode === "multi-page"
  if (site.settings.structureMode === "multi-page") {
    // 2. kurumsal.html
    const aboutHtml = renderKurumsalPage({ ...context, activePageSlug: "about", currentPageType: "about" });
    files.push({
      filename: "kurumsal.html",
      fileName: "kurumsal.html",
      title: "Kurumsal & Hakkımızda",
      type: "page",
      html: aboutHtml,
      content: aboutHtml,
      slug: "about",
      description: "Şirket profili, değerleri ve kurumsal tarihçesi",
    });

    // 3. hizmetler.html
    const servicesHtml = renderServicesPage({ ...context, activePageSlug: "services", currentPageType: "services" });
    files.push({
      filename: "hizmetler.html",
      fileName: "hizmetler.html",
      title: "Hizmetlerimiz",
      type: "service-list",
      html: servicesHtml,
      content: servicesHtml,
      slug: "services",
      description: "Tüm hizmetlerin listelendiği ana hizmetler dizini",
    });

    // 4. iletisim.html
    const contactHtml = renderContactPage({ ...context, activePageSlug: "contact", currentPageType: "contact" });
    files.push({
      filename: "iletisim.html",
      fileName: "iletisim.html",
      title: "İletişim & Konum",
      type: "contact",
      html: contactHtml,
      content: contactHtml,
      slug: "contact",
      description: "Adres krokisi, telefon ve mesaj formu",
    });
  }

  // Assemble Static Assets (CSS, _headers, _redirects, robots, sitemap)

  const syntheticConfig: SiteConfig = legacyConfig || ({
    id: site.id,
    companyName: site.businessProfile.identity.companyName,
    palette: {
      primary: manifest.designTokens.palette.primary,
      primaryDark: manifest.designTokens.palette.primaryDark,
      secondary: manifest.designTokens.palette.secondary,
      accent: manifest.designTokens.palette.accent,
      text: manifest.designTokens.palette.text,
      bg: manifest.designTokens.palette.background,
    },
    seo: {
      canonicalUrl: site.settings?.seo?.canonicalUrl || (site.settings?.domain as any)?.canonicalUrl || "",
      robots: "index, follow",
    },
  } as unknown as SiteConfig);

  const assetFiles = assembleStaticAssets({
    config: syntheticConfig,
    pages: files.map((f) => ({ filename: f.filename, slug: f.slug })),
  });

  files.push(...assetFiles);

  return files;
}
