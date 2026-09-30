/**
 * JetKur Canonical URL Resolution Engine (Sprint 16)
 *
 * Core Principle:
 * "Tek canonical URL otoritesi: Custom Domain > JetKur Subdomain > Preview Fallback"
 *
 * Guarantees consistent canonical SEO URLs across:
 * - <link rel="canonical" href="...">
 * - <meta property="og:url" content="...">
 * - <script type="application/ld+json"> "@id" / "url"
 * - sitemap.xml
 * - robots.txt
 */

import { DomainRecord } from "./types";
import { CanonicalSite } from "../site/site";

export interface CanonicalUrlResolutionInput {
  domains?: DomainRecord[];
  subdomainSlug?: string;
  legacyConfigDomain?: string;
  siteId?: string;
}

/**
 * Resolves the absolute root canonical URL for a site
 */
export function resolveCanonicalRootUrl(input: CanonicalUrlResolutionInput): string {
  // 1. Priority 1: ACTIVE primary custom domain
  const activeCustomDomain = input.domains?.find(
    (d) => d.type === "CUSTOM_DOMAIN" && d.status === "ACTIVE" && d.isPrimary
  );
  if (activeCustomDomain) {
    return `https://${activeCustomDomain.hostname}`;
  }

  // Any other ACTIVE custom domain
  const anyActiveCustom = input.domains?.find(
    (d) => d.type === "CUSTOM_DOMAIN" && d.status === "ACTIVE"
  );
  if (anyActiveCustom) {
    return `https://${anyActiveCustom.hostname}`;
  }

  // 2. Priority 2: ACTIVE JetKur Subdomain
  const jetkurSubdomain = input.domains?.find((d) => d.type === "JETKUR_SUBDOMAIN");
  if (jetkurSubdomain && jetkurSubdomain.hostname) {
    return `https://${jetkurSubdomain.hostname}`;
  }

  // 3. Fallback: Computed from subdomainSlug
  if (input.subdomainSlug) {
    return `https://${input.subdomainSlug}.jetkur.com.tr`;
  }

  // 4. Fallback: Legacy config domain
  if (input.legacyConfigDomain) {
    const clean = input.legacyConfigDomain.replace(/^https?:\/\//, "");
    return `https://${clean}`;
  }

  // 5. Ultimate Fallback: Internal preview address
  return `https://${input.siteId || "site"}.jetkur.com.tr`;
}

/**
 * Resolves full page canonical URL
 */
export function resolveCanonicalPageUrl(
  input: CanonicalUrlResolutionInput,
  pagePath = "/"
): string {
  const root = resolveCanonicalRootUrl(input).replace(/\/+$/, "");
  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;

  if (normalizedPath === "/" || normalizedPath === "/index.html" || normalizedPath === "/home") {
    return `${root}/`;
  }

  return `${root}${normalizedPath}`;
}
