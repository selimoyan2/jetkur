/**
 * JetKur Canonical HTML Image Renderer (Sprint 14)
 *
 * Implements:
 * 1. CLS Prevention: Generates explicit width and height attributes.
 * 2. Performance: loading="eager" + fetchpriority="high" for hero, loading="lazy" for below-the-fold.
 * 3. Responsive Images: Clean srcset/sizes generation from verified variants.
 * 4. Alt Text: Semantic alt text without keyword-stuffing spam.
 * 5. Zero JS: Pure semantic HTML rendering.
 */

import { MediaAsset } from "./types";
import { sanitizeImageUrl } from "./sanitizer";

export interface ImageRenderOptions {
  isHero?: boolean;
  className?: string;
  sizes?: string;
  overrideAlt?: string;
  customWidth?: number;
  customHeight?: number;
}

/**
 * Escapes HTML attribute strings safely.
 */
function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Renders an optimized, CLS-safe HTML <img> or <picture> element for a MediaAsset.
 */
export function renderMediaAssetHtml(
  asset: MediaAsset,
  options: ImageRenderOptions = {}
): string {
  const isHero = Boolean(options.isHero);
  const src = sanitizeImageUrl(asset.originalUrl);
  const alt = escapeHtmlAttr(options.overrideAlt || asset.altText || "Web sitesi görseli");
  const className = options.className ? ` class="${escapeHtmlAttr(options.className)}"` : "";

  // Dimensions for CLS prevention
  const width = options.customWidth || asset.width || (isHero ? 1920 : 800);
  const height = options.customHeight || asset.height || (isHero ? 1080 : 600);

  // Loading strategy
  const loading = isHero ? `loading="eager"` : `loading="lazy"`;
  const fetchPriority = isHero ? ` fetchpriority="high"` : "";
  const decoding = `decoding="async"`;

  // Responsive srcset from verified variants
  const variants = asset.variants || [];
  let srcsetAttr = "";
  if (variants.length > 1) {
    const srcsetEntries = variants
      .filter((v) => v.width && v.url)
      .map((v) => `${sanitizeImageUrl(v.url)} ${v.width}w`);
    if (srcsetEntries.length > 0) {
      const sizes = options.sizes || (isHero ? "100vw" : "(max-width: 768px) 100vw, 50vw");
      srcsetAttr = ` srcset="${srcsetEntries.join(", ")}" sizes="${escapeHtmlAttr(sizes)}"`;
    }
  }

  return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" ${loading}${fetchPriority} ${decoding}${srcsetAttr}${className} />`;
}
