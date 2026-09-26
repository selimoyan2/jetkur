/**
 * JetKur Document Shell Renderer (Sprint 09)
 *
 * Assembles the standard, valid semantic HTML5 document envelope:
 * DOCTYPE, html lang/dir, head, charset, viewport, CSS pipeline, and body structure.
 */

import { SiteConfig } from "../../types";
import { generateStaticCss } from "../staticCssGenerator";
import { renderSeoHead, PageSeoOptions } from "./seoHeadRenderer";

export interface DocumentShellOptions {
  config: SiteConfig;
  seo: PageSeoOptions;
  bodyContent: string;
  scriptsContent?: string;
  lang?: string;
  isRtl?: boolean;
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
  } = options;

  const seoHeadHtml = renderSeoHead(config, seo);
  const staticCssContent = generateStaticCss(config);

  const dirAttr = isRtl ? ' dir="rtl"' : "";
  const bodyRtlClass = isRtl ? " rtl-layout" : "";

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  ${seoHeadHtml}

  <!-- JetKur Pure Static CSS Pipeline (Zero Runtime Framework Dependency) -->
  <link rel="stylesheet" href="assets/site.css">
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
