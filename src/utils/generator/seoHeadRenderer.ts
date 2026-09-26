/**
 * JetKur SEO & Metadata Head Renderer (Sprint 09)
 *
 * Extracts and isolates all SEO, OpenGraph, Twitter card, search console,
 * and Schema.org JSON-LD metadata head generation.
 */

import { SiteConfig, ProductItem } from "../../types";
import { CanonicalSite } from "../../domain/site/site";
import { generateCompositeSchemaGraph, getEffectiveSchemaConfig } from "../schemaOrgGenerator";
import { escapeHtml, escapeHtmlAttr, safeJsonLd, sanitizeUrl } from "./security";

export interface PageSeoOptions {
  pageTitle: string;
  pageDesc: string;
  pageKeywords?: string;
  ogImage?: string;
  customSchema?: object;
  pageCanonicalUrl?: string;
  pageRobots?: string;
  pageOgTitle?: string;
  pageOgDescription?: string;
  pageType?: "home" | "about" | "service" | "product" | "blog" | "contact" | "page" | "catalog";
  pageContext?: {
    product?: ProductItem;
    breadcrumbItems?: { name: string; url: string }[];
  };
}

/**
 * Resolves page-level SEO overrides from configuration registry or fallbacks.
 */
export function resolvePageSeo(
  config: SiteConfig,
  pageId: string,
  fallbackTitle: string,
  fallbackDesc: string,
  fallbackKeywords?: string,
  fallbackOgImage?: string,
  fallbackCanonical?: string,
  fallbackRobots?: string
) {
  const pageEntry = (config as any).pageSeoRegistry?.find((p: any) => p.pageId === pageId);
  return {
    title: pageEntry?.title || fallbackTitle,
    description: pageEntry?.description || fallbackDesc,
    keywords: pageEntry?.keywords || fallbackKeywords,
    ogImage: pageEntry?.ogImage || fallbackOgImage,
    canonicalUrl: pageEntry?.canonicalUrl || fallbackCanonical,
    robots: pageEntry?.robots || fallbackRobots,
  };
}

/**
 * Renders complete SEO, OpenGraph, Twitter Card, and Schema.org JSON-LD tags.
 */
export function renderSeoHead(
  config: SiteConfig,
  options: PageSeoOptions
): string {
  const {
    pageTitle,
    pageDesc,
    pageKeywords,
    ogImage,
    customSchema,
    pageCanonicalUrl,
    pageRobots,
    pageOgTitle,
    pageOgDescription,
    pageType = "home",
    pageContext,
  } = options;

  const resolvedOgImage = ogImage || config.seo?.ogImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341";
  const siteUrl = config.cloudflare?.customDomain
    ? `https://${config.cloudflare.customDomain}`
    : config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || "sirket"}.hizliweb.site`;

  const effectiveRobots = pageRobots || config.seo?.robots || "index, follow";
  const effectiveCanonical = pageCanonicalUrl || config.seo?.canonicalUrl;
  const effectiveOgTitle = pageOgTitle || pageTitle;
  const effectiveOgDesc = pageOgDescription || pageDesc;

  // Schema.org Structured Data
  const schemaConfig = getEffectiveSchemaConfig(config);
  const resolvedSchema =
    customSchema !== undefined
      ? customSchema
      : schemaConfig.enabled
      ? generateCompositeSchemaGraph(config, pageType, {
          pageTitle,
          pageDescription: pageDesc,
          product: pageContext?.product,
          breadcrumbItems: pageContext?.breadcrumbItems,
        })
      : null;

  return `
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtmlAttr(pageDesc)}">
  <meta name="keywords" content="${escapeHtmlAttr(pageKeywords || config.seo?.keywords || `${config.companyName}, ${config.sector}, ${config.city}`)}">
  <meta name="author" content="${escapeHtmlAttr(config.seo?.author || config.companyName)}">
  <meta name="robots" content="${escapeHtmlAttr(effectiveRobots)}">
  ${effectiveCanonical ? `<link rel="canonical" href="${sanitizeUrl(effectiveCanonical)}">` : ""}
  ${config.seo?.googleSearchConsoleTag ? `<meta name="google-site-verification" content="${escapeHtmlAttr(config.seo.googleSearchConsoleTag)}">` : ""}
  
  <!-- Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtmlAttr(effectiveOgTitle)}">
  <meta property="og:description" content="${escapeHtmlAttr(effectiveOgDesc)}">
  <meta property="og:image" content="${sanitizeUrl(resolvedOgImage)}">
  <meta property="og:site_name" content="${escapeHtmlAttr(config.companyName)}">
  <meta property="og:url" content="${sanitizeUrl(effectiveCanonical || siteUrl)}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtmlAttr(effectiveOgTitle)}">
  <meta name="twitter:description" content="${escapeHtmlAttr(effectiveOgDesc)}">
  <meta name="twitter:image" content="${sanitizeUrl(resolvedOgImage)}">
  ${config.seo?.twitterHandle ? `<meta name="twitter:site" content="${escapeHtmlAttr(config.seo.twitterHandle)}">` : ""}

  <!-- HTTP Güvenlik & OWASP Kalkan Meta Etiketleri -->
  ${config.securityConfig?.enableCsp ? `<meta http-equiv="Content-Security-Policy" content="default-src 'self' https: data: blob: 'unsafe-inline';">` : ""}
  ${config.securityConfig?.enableContentTypeNosniff ? `<meta http-equiv="X-Content-Type-Options" content="nosniff">` : ""}
  ${config.securityConfig?.enableReferrerPolicy ? `<meta name="referrer" content="strict-origin-when-cross-origin">` : ""}
  ${config.securityConfig?.enablePermissionsPolicy ? `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">` : ""}
  
  <!-- Global Anycast Edge & High Speed Static Assets -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- Schema.org JSON-LD (Automatic Structured Business Data) -->
  ${resolvedSchema ? `<script type="application/ld+json">
${safeJsonLd(resolvedSchema)}
  </script>` : ""}
  `.trim();
}
