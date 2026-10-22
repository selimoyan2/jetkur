/**
 * JetKur Canonical Static Site Generator (Sprint 09 & Sprint 17 Foundation 05A.1)
 *
 * Modular orchestration layer transforming CanonicalSite domain model into static web output:
 * CanonicalSite + TemplateManifest + SectionRegistry + StaticCss => Static HTML + Static CSS + Assets.
 *
 * Integrates:
 * - LANDING mode (Single-page index.html with preserved section anchors)
 * - MULTI_PAGE mode (index.html + /hakkimizda/index.html, /hizmetler/index.html, /urunler/index.html, /iletisim/index.html)
 * - Active / Passive PageContent filtering
 * - Backward-compatible legacy alias HTML files (kurumsal.html, hizmetler.html, urunler.html, iletisim.html)
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { CANONICAL_TEMPLATE_MANIFESTS, resolveTemplate } from "../../domain/templates/catalog";
import { GeneratedPageFile, SiteConfig } from "../../types";
import {
  renderHomePage,
  renderKurumsalPage,
  renderServicesPage,
  renderProductsPage,
  renderContactPage,
  renderDedicatedPage,
} from "./pageRenderer";
import { assembleStaticAssets } from "./assetAssembler";
import { RenderContext, PageType } from "./types";
import { resolveDesignTokens } from "../../domain/brand";
import {
  getEffectiveSiteMode,
  resolveMultiPageRoutes,
  ResolvedPageRoute,
} from "./routeResolver";

// Re-export all modular components
export * from "./types";
export * from "./security";
export * from "./seoHeadRenderer";
export * from "./documentShell";
export * from "./sectionRenderer";
export * from "./progressiveScriptRenderer";
export * from "./assetAssembler";
export * from "./pageRenderer";
export * from "./routeResolver";
export * from "./heroMediaResolver";

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
    resolveTemplate(site.designTemplate?.templateId) ||
    resolveTemplate(site.designTemplate?.templateSlug) ||
    CANONICAL_TEMPLATE_MANIFESTS[0];

  // Resolve DesignTokens following strict hierarchy: Template < BrandKit < Site Custom
  const brandKit =
    site.businessProfile?.branding?.brandKit ||
    site.brandKit ||
    (legacyConfig as any)?.brandKit;
  const customOverrides = site.designTemplate?.customTokens;
  const resolvedDesignTokens = resolveDesignTokens(manifest.designTokens, brandKit, customOverrides);

  const context: RenderContext = {
    site,
    manifest,
    resolvedDesignTokens,
    legacyConfig,
    activePageSlug: "index",
    currentPageType: "home",
    assetPrefix: "",
    depth: 0,
  };

  const files: GeneratedPageFile[] = [];

  // 1. Always Render Homepage (index.html)
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

  // 2. Multi-page subpages if mode === "MULTI_PAGE"
  const siteMode = getEffectiveSiteMode(site);

  if (siteMode === "MULTI_PAGE") {
    const multiRoutes = resolveMultiPageRoutes(site);

    for (const route of multiRoutes) {
      const nestedContext: RenderContext = {
        ...context,
        activePageSlug: route.slug,
        assetPrefix: "../",
        depth: 1,
      };

      let pageHtml = "";
      let pageType: GeneratedPageFile["type"] = "page";

      if (route.pageType === "ABOUT") {
        pageType = "page";
        pageHtml = renderKurumsalPage(nestedContext, route.content);
      } else if (route.pageType === "SERVICES") {
        pageType = "service-list";
        pageHtml = renderServicesPage(nestedContext, route.content);
      } else if (route.pageType === "PRODUCTS") {
        pageType = "catalog";
        pageHtml = renderProductsPage(nestedContext, route.content);
      } else if (route.pageType === "CONTACT") {
        pageType = "contact";
        pageHtml = renderContactPage(nestedContext, route.content);
      } else if (route.content) {
        pageType = "page";
        pageHtml = renderDedicatedPage(nestedContext, route.content, "custom");
      }

      if (pageHtml) {
        // A. Primary directory output: <slug>/index.html
        files.push({
          filename: route.primaryPath,
          fileName: route.primaryPath,
          title: route.title,
          type: pageType,
          html: pageHtml,
          content: pageHtml,
          slug: route.slug,
          description: route.content?.shortDescription || `${route.title} sayfası`,
        });

        // B. Root-level legacy alias output for backwards compatibility & tests
        // (e.g. kurumsal.html, hizmetler.html, urunler.html, iletisim.html)
        if (route.legacyAliasPath) {
          const rootContext: RenderContext = {
            ...context,
            activePageSlug: route.slug,
            assetPrefix: "",
            depth: 0,
          };

          let rootAliasHtml = "";
          if (route.pageType === "ABOUT") {
            rootAliasHtml = renderKurumsalPage(rootContext, route.content);
          } else if (route.pageType === "SERVICES") {
            rootAliasHtml = renderServicesPage(rootContext, route.content);
          } else if (route.pageType === "PRODUCTS") {
            rootAliasHtml = renderProductsPage(rootContext, route.content);
          } else if (route.pageType === "CONTACT") {
            rootAliasHtml = renderContactPage(rootContext, route.content);
          } else if (route.content) {
            rootAliasHtml = renderDedicatedPage(rootContext, route.content, "custom");
          }

          if (rootAliasHtml) {
            files.push({
              filename: route.legacyAliasPath,
              fileName: route.legacyAliasPath,
              title: route.title,
              type: pageType,
              html: rootAliasHtml,
              content: rootAliasHtml,
              slug: route.slug,
              description: `Geriye dönük uyumluluk takma adı: ${route.legacyAliasPath}`,
            });
          }
        }
      }
    }
  }

  // 3. Assemble Static Assets (CSS, _headers, _redirects, robots, sitemap)
  const syntheticConfig: SiteConfig = {
    ...(legacyConfig || {}),
    id: site.id,
    companyName: site.businessProfile.identity.companyName,
    palette: {
      primary: resolvedDesignTokens.palette.primary,
      primaryDark: resolvedDesignTokens.palette.primaryDark,
      secondary: resolvedDesignTokens.palette.secondary,
      accent: resolvedDesignTokens.palette.accent,
      text: resolvedDesignTokens.palette.text,
      bg: resolvedDesignTokens.palette.surface,
    },
    seo: {
      canonicalUrl: site.settings?.seo?.canonicalUrl || (site.settings?.domain as any)?.canonicalUrl || "",
      robots: "index, follow",
    },
  } as unknown as SiteConfig;

  const assetFiles = assembleStaticAssets({
    config: syntheticConfig,
    resolvedTokens: resolvedDesignTokens,
    pages: files.map((f) => ({ filename: f.filename, slug: f.slug })),
  });
  files.push(...assetFiles);

  return files;
}
