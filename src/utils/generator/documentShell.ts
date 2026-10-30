/**
 * JetKur Document Shell Renderer (Sprint 09 & Sprint 17 Foundation 05A.1)
 *
 * Assembles the standard, valid semantic HTML5 document envelope:
 * DOCTYPE, html lang/dir, head, charset, viewport, CSS pipeline, and body structure.
 * Supports relative assetPrefix (e.g. "../") so nested subpages resolve assets/site.css.
 */

import { SiteConfig } from "../../types";
import { generateStaticCss } from "../staticCssGenerator";
import { DesignTokens } from "../../domain/site/designTemplate";
import { renderSeoHead, PageSeoOptions } from "./seoHeadRenderer";

export interface DocumentShellOptions {
  config: SiteConfig;
  seo: PageSeoOptions;
  bodyContent: string;
  scriptsContent?: string;
  lang?: string;
  isRtl?: boolean;
  resolvedTokens?: Partial<DesignTokens>;
  /** Relative asset prefix: "" for root or "../" for nested directory subpages */
  assetPrefix?: string;
}

/**
 * Wraps body content in a complete, valid semantic HTML5 document.
 */
export function renderDocumentShell(options: DocumentShellOptions): string {
  const {
    config,
    seo,
    bodyContent,
    scriptsContent = "",
    lang = "tr",
    isRtl = false,
    resolvedTokens,
    assetPrefix = "",
  } = options;

  const seoHeadHtml = renderSeoHead(config, seo, resolvedTokens);
  const staticCssContent = generateStaticCss(config, resolvedTokens);
  const dirAttr = isRtl ? ' dir="rtl"' : "";
  const bodyRtlClass = isRtl ? " rtl-layout" : "";
  const cssHref = `${assetPrefix}assets/site.css`;

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoHeadHtml}
  <!-- JetKur Pure Static CSS Pipeline (Zero Runtime Framework Dependency) -->
  <link rel="stylesheet" href="${cssHref}">
  <style id="jetkur-static-css">
${staticCssContent}
  </style>
</head>
<body class="antialiased${bodyRtlClass}">
${bodyContent}
${scriptsContent}
</body>
</html>`;
}
