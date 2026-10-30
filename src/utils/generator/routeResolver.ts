/**
 * JetKur Canonical Page Route & Navigation Resolver (Sprint 17 / Foundation 05A.1)
 *
 * Implements:
 * 1. Canonical Static Page Routing for LANDING and MULTI_PAGE modes.
 * 2. Active/Passive PageContent filtering.
 * 3. Canonical slug normalization with reserved path & traversal protection.
 * 4. Shared navigation link resolution for header, drawer, and footer.
 */

import { CanonicalSite } from "../../domain/site/site";
import { PageContent, CanonicalPageType, normalizeSiteMode, SiteMode, initializeDefaultPages } from "../../domain/site/pageContent";
import { turkishToAscii } from "../url";

export interface ResolvedPageRoute {
  pageType: CanonicalPageType | "HOME";
  title: string;
  navLabel: string;
  slug: string;
  /** Primary static filepath: e.g. "index.html", "hakkimizda/index.html" */
  primaryPath: string;
  /** Legacy alias path for backwards compatibility: e.g. "kurumsal.html" */
  legacyAliasPath?: string;
  active: boolean;
  content?: PageContent;
}

export interface NavigationLink {
  label: string;
  href: string;
  active: boolean;
  isHome?: boolean;
}

/** Reserved directory/filename paths that customer slugs cannot collide with */
const RESERVED_SLUGS = new Set([
  "assets",
  "api",
  "static",
  "admin",
  "dashboard",
  "images",
  "css",
  "js",
  "robots",
  "sitemap",
  "_headers",
  "_redirects",
  "favicon",
  "index",
  "home",
  "null",
  "undefined",
]);

/**
 * Normalizes a customer page slug safely:
 * - Converts Turkish characters to ASCII
 * - Lowercases, replaces spaces/symbols with single hyphens
 * - Strips leading/trailing slashes and hyphens
 * - Rejects path traversal (..)
 * - Falls back safely to default canonical slug if invalid or reserved
 */
export function normalizePageSlug(
  rawSlug: string | undefined | null,
  defaultSlug: string
): string {
  if (!rawSlug || typeof rawSlug !== "string") {
    return defaultSlug;
  }

  // Remove leading/trailing slashes and spaces
  let cleaned = rawSlug.trim().replace(/^\/+|\/+$/g, "");

  // Prevent directory traversal
  cleaned = cleaned.replace(/\.\./g, "");

  // Turkish transliteration and ascii sanitization
  cleaned = turkishToAscii(cleaned)
    .toLowerCase()
    .replace(/&/g, "ve")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  // If slug ends with .html, strip it for directory routing
  cleaned = cleaned.replace(/\.html$/i, "");

  if (!cleaned || RESERVED_SLUGS.has(cleaned)) {
    return defaultSlug;
  }

  return cleaned;
}

/**
 * Resolves all active canonical page records for a CanonicalSite.
 * Backfills sector-relevant defaults if canonical.content.pages is not yet defined,
 * without mutating customer state.
 */
export function resolveCanonicalPages(site: CanonicalSite): PageContent[] {
  const existingPages = site.content?.pages;
  if (Array.isArray(existingPages) && existingPages.length > 0) {
    return existingPages;
  }

  // Backfill reasonable defaults based on businessProfile and existing content
  return initializeDefaultPages(
    {
      companyName: site.businessProfile.identity.companyName,
      sector: site.businessProfile.identity.sector,
      city: site.businessProfile.location.city,
      phone: site.businessProfile.contact.phone,
      about: {
        content: site.content.about?.contentHtml,
        image: site.content.about?.imageUrl,
        enabled: true,
      },
      services: {
        subtitle: site.content.services ? "Hizmetlerimiz" : undefined,
        enabled: true,
      },
      products: {
        subtitle: site.content.catalogProducts ? "Ürünlerimiz" : undefined,
        enabled: Boolean(site.content.catalogProducts && site.content.catalogProducts.length > 0),
      },
      industryPackId: site.industryPackId,
    },
    undefined
  );
}

/**
 * Default slugs and titles for canonical page types
 */
const CANONICAL_PAGE_DEFAULTS: Record<
  CanonicalPageType,
  { slug: string; legacyAlias: string; defaultTitle: string; defaultNav: string }
> = {
  ABOUT: {
    slug: "hakkimizda",
    legacyAlias: "kurumsal.html",
    defaultTitle: "Hakkımızda",
    defaultNav: "Kurumsal",
  },
  SERVICES: {
    slug: "hizmetler",
    legacyAlias: "hizmetler.html",
    defaultTitle: "Hizmetlerimiz",
    defaultNav: "Hizmetlerimiz",
  },
  PRODUCTS: {
    slug: "urunler",
    legacyAlias: "urunler.html",
    defaultTitle: "Ürünlerimiz",
    defaultNav: "Ürünlerimiz",
  },
  CONTACT: {
    slug: "iletisim",
    legacyAlias: "iletisim.html",
    defaultTitle: "İletişim",
    defaultNav: "İletişim",
  },
  CUSTOM: {
    slug: "sayfa",
    legacyAlias: "sayfa.html",
    defaultTitle: "Sayfa",
    defaultNav: "Sayfa",
  },
};

/**
 * Resolves static page routes for MULTI_PAGE mode.
 * Filters out inactive pages and deduplicates slugs.
 */
export function resolveMultiPageRoutes(site: CanonicalSite): ResolvedPageRoute[] {
  const pages = resolveCanonicalPages(site);
  const routes: ResolvedPageRoute[] = [];
  const usedSlugs = new Set<string>(["index", "home"]);

  // We respect the 4 canonical pages in canonical order: ABOUT, SERVICES, PRODUCTS, CONTACT
  const pageTypeOrder: CanonicalPageType[] = ["ABOUT", "SERVICES", "PRODUCTS", "CONTACT"];

  for (const pType of pageTypeOrder) {
    const page = pages.find((p) => p.pageType === pType);
    if (!page) continue;

    // ACTIVE / PASSIVE FILTERING:
    // If active === false, page MUST NOT be generated or linked
    if (page.active === false) {
      continue;
    }

    const defaults = CANONICAL_PAGE_DEFAULTS[pType];
    let slug = normalizePageSlug(page.slug, defaults.slug);

    // Slug deduplication protection
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${pType.toLowerCase()}`;
    }
    usedSlugs.add(slug);

    routes.push({
      pageType: pType,
      title: page.title || defaults.defaultTitle,
      navLabel: page.title || defaults.defaultNav,
      slug,
      primaryPath: `${slug}/index.html`,
      legacyAliasPath: defaults.legacyAlias,
      active: true,
      content: page,
    });
  }

  // Also include any CUSTOM active pages
  const customPages = pages.filter((p) => p.pageType === "CUSTOM" && p.active !== false);
  for (const cPage of customPages) {
    let slug = normalizePageSlug(cPage.slug, `sayfa-${cPage.id}`);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${cPage.id}`;
    }
    usedSlugs.add(slug);

    routes.push({
      pageType: "CUSTOM",
      title: cPage.title || "Sayfa",
      navLabel: cPage.title || "Sayfa",
      slug,
      primaryPath: `${slug}/index.html`,
      legacyAliasPath: `${slug}.html`,
      active: true,
      content: cPage,
    });
  }

  return routes;
}

/**
 * Resolves the effective SiteMode ("LANDING" | "MULTI_PAGE") from site settings.
 */
export function getEffectiveSiteMode(site: CanonicalSite): SiteMode {
  if (site.settings?.siteMode) {
    return normalizeSiteMode(site.settings.siteMode);
  }
  if (site.settings?.structureMode === "multi-page") {
    return "MULTI_PAGE";
  }
  return "LANDING";
}

/**
 * Resolves unified navigation links for header, mobile drawer, and footer.
 * Shared between desktop and mobile navigation menus.
 *
 * @param site Canonical site model
 * @param currentDepth 0 for root (index.html), 1 for nested subpages (e.g. hakkimizda/index.html)
 */
export function resolveNavigationLinks(
  site: CanonicalSite,
  currentDepth = 0
): NavigationLink[] {
  const mode = getEffectiveSiteMode(site);
  const prefix = currentDepth > 0 ? "../" : "";

  if (mode === "MULTI_PAGE") {
    const multiRoutes = resolveMultiPageRoutes(site);
    const links: NavigationLink[] = [
      {
        label: "Ana Sayfa",
        href: currentDepth > 0 ? `${prefix}index.html` : "index.html",
        active: true,
        isHome: true,
      },
    ];

    for (const r of multiRoutes) {
      links.push({
        label: r.navLabel,
        href: `${prefix}${r.slug}/index.html`,
        active: true,
      });
    }

    return links;
  }

  // LANDING MODE: Preserve section anchors, omitting any section explicitly disabled in sectionConfiguration
  const homeHref = currentDepth > 0 ? `${prefix}index.html` : "#hero";
  const anchorPrefix = currentDepth > 0 ? `${prefix}index.html` : "";

  const isSectionEnabled = (secId: string): boolean => {
    const sections = site.sectionConfiguration?.sections;
    if (!Array.isArray(sections) || sections.length === 0) return true;
    const match = sections.find((s) => (s.type || s.id) === secId || s.id === `sec-${secId}`);
    if (!match) return true;
    return match.enabled !== false;
  };

  const landingLinks: NavigationLink[] = [
    { label: "Ana Sayfa", href: homeHref, active: true, isHome: true },
  ];
  if (isSectionEnabled("services")) {
    landingLinks.push({ label: "Hizmetlerimiz", href: `${anchorPrefix}#services`, active: true });
  }
  if (isSectionEnabled("about")) {
    landingLinks.push({ label: "Hakkımızda", href: `${anchorPrefix}#about`, active: true });
  }
  if (isSectionEnabled("contact")) {
    landingLinks.push({ label: "İletişim", href: `${anchorPrefix}#contact`, active: true });
  }

  return landingLinks;
}
