/**
 * JetKur Static Asset Assembler (Sprint 09)
 *
 * Assembles static non-HTML assets for published customer websites:
 * - assets/site.css (deterministic pure static CSS pipeline from Sprint 08)
 * - robots.txt
 * - sitemap.xml
 * - _headers (Cloudflare edge caching & security headers)
 * - _redirects (canonical edge redirects)
 */

import { SiteConfig, GeneratedPageFile } from "../../types";
import { generateStaticCss } from "../staticCssGenerator";

export interface AssetAssemblerOptions {
  config: SiteConfig;
  pages: { filename: string; slug?: string }[];
  siteUrl?: string;
}

/**
 * Generates the robots.txt content for static site crawlers.
 */
export function generateRobotsTxt(siteUrl: string, config: SiteConfig): string {
  const isNoindex = config.seo?.robots?.includes("noindex");
  if (isNoindex) {
    return `User-agent: *\nDisallow: /\n`;
  }
  return `# JetKur High-Speed Static Edge Engine
User-agent: *
Allow: /

Sitemap: ${siteUrl.replace(/\/$/, "")}/sitemap.xml
`.trim();
}

/**
 * Generates valid XML sitemap from the list of generated HTML pages.
 */
export function generateSitemapXml(siteUrl: string, pages: { filename: string }[]): string {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const today = new Date().toISOString().split("T")[0];

  const urlEntries = pages
    .filter((p) => p.filename.endsWith(".html"))
    .map((p) => {
      const path = p.filename === "index.html" ? "" : `/${p.filename}`;
      const priority = p.filename === "index.html" ? "1.0" : "0.8";
      const changefreq = p.filename === "index.html" ? "weekly" : "monthly";

      return `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`.trim();
}

/**
 * Generates Cloudflare Pages _headers security file.
 */
export function generateHeadersFile(config: SiteConfig): string {
  const sec = config.securityConfig;
  return `/*
  X-Frame-Options: ${sec?.enableXFrameOptions ?? true ? "SAMEORIGIN" : "ALLOWALL"}
  X-Content-Type-Options: ${sec?.enableContentTypeNosniff ?? true ? "nosniff" : "nosniff"}
  Referrer-Policy: ${sec?.enableReferrerPolicy ?? true ? "strict-origin-when-cross-origin" : "no-referrer-when-downgrade"}
  ${sec?.enforceHsts ?? true ? "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" : ""}
  ${sec?.enablePermissionsPolicy ? "Permissions-Policy: camera=(), microphone=(), geolocation=()" : ""}
  ${sec?.enableCsp ? "Content-Security-Policy: default-src 'self' https: data: blob: 'unsafe-inline';" : ""}
  ${sec?.hideServerSignature ?? true ? "Server: Edge-CDN" : ""}

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable
`.trim();
}

/**
 * Generates Cloudflare Pages _redirects file.
 */
export function generateRedirectsFile(config: SiteConfig): string {
  const customDomain = config.cloudflare?.customDomain?.replace(/^https?:\/\//, "");
  if (!customDomain) {
    return `# JetKur Standard Static Redirects\n`;
  }
  return `# JetKur Canonical Edge Redirects
http://${customDomain}/* https://${customDomain}/:splat 301!
http://www.${customDomain}/* https://${customDomain}/:splat 301!
https://www.${customDomain}/* https://${customDomain}/:splat 301!
`.trim();
}

/**
 * Assembles all static asset files into the generated file set.
 */
export function assembleStaticAssets(options: AssetAssemblerOptions): GeneratedPageFile[] {
  const { config, pages, siteUrl: explicitUrl } = options;
  const siteUrl = explicitUrl || (config.cloudflare?.customDomain
    ? `https://${config.cloudflare.customDomain.replace(/^https?:\/\//, "")}`
    : config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || "sirket"}.hizliweb.site`);

  const files: GeneratedPageFile[] = [];

  // 1. assets/site.css
  const cssContent = generateStaticCss(config);
  files.push({
    filename: "assets/site.css",
    fileName: "assets/site.css",
    title: "JetKur Statik CSS Paketi (assets/site.css)",
    type: "other",
    html: cssContent,
    content: cssContent,
    slug: "site-css",
    description: "Sıfır runtime bağımlılıklı, derlenmiş ve optimize JetKur statik stil dosyası",
  });

  // 2. _headers
  const headersContent = generateHeadersFile(config);
  files.push({
    filename: "_headers",
    fileName: "_headers",
    title: "Global Edge Güvenlik Başlıkları (_headers)",
    type: "other",
    html: headersContent,
    content: headersContent,
    slug: "_headers",
    description: "Global Edge CDN & Statik Barındırma için HTTP güvenlik başlıkları",
  });

  // 3. _redirects
  const redirectsContent = generateRedirectsFile(config);
  files.push({
    filename: "_redirects",
    fileName: "_redirects",
    title: "Global Edge Yönlendirme Kuralları (_redirects)",
    type: "other",
    html: redirectsContent,
    content: redirectsContent,
    slug: "_redirects",
    description: "Kanonik HTTPS ve WWW yönlendirmeleri",
  });

  // 4. robots.txt
  const robotsContent = generateRobotsTxt(siteUrl, config);
  files.push({
    filename: "robots.txt",
    fileName: "robots.txt",
    title: "Robots Direktifleri (robots.txt)",
    type: "other",
    html: robotsContent,
    content: robotsContent,
    slug: "robots",
    description: "Arama motoru tarama ve indeksleme kuralları",
  });

  // 5. sitemap.xml
  const sitemapContent = generateSitemapXml(siteUrl, pages);
  files.push({
    filename: "sitemap.xml",
    fileName: "sitemap.xml",
    title: "XML Site Haritası (sitemap.xml)",
    type: "other",
    html: sitemapContent,
    content: sitemapContent,
    slug: "sitemap",
    description: "Google ve arama motorları için tam sayfa dizini",
  });

  return files;
}
