/**
 * JetKur Brand Kit - Logo Analyzer & Extraction Interface (Sprint 10)
 *
 * ARCHITECTURAL PRINCIPLE:
 * Defines the clean Logo Color Extraction interface and orchestrates
 * static SVG extraction, URL security validation, and explicit raster decoding boundaries.
 *
 * INVARIANTS:
 * 1. Zero fake extraction: Never derives colors from filenames, business names, or random hashes.
 * 2. URL Sanitization: Strictly rejects javascript:, vbscript:, and non-image data URIs.
 * 3. Raster Pixel Extraction: Declared DEFERRED in environments without lightweight native decoders.
 */

import { BrandLogo, BrandSourceColors, LogoAnalysisStatus, LogoSourceType } from "./types";
import { extractColorsFromSvg } from "./svgColorExtractor";
import { normalizeHexColor } from "./colorUtils";

export interface LogoAnalysisInput {
  sourceType: LogoSourceType;
  url?: string;
  svgContent?: string;
  mimeType?: string;
  preferredColor?: string;
}

export interface LogoAnalysisResult {
  logo: BrandLogo;
  sourceColors: BrandSourceColors;
  analysisStatus: LogoAnalysisStatus;
  rasterExtractionSupported: boolean;
}

/**
 * Interface for raster pixel decoding engines (e.g. Sharp, Jimp, WebGL/Canvas).
 */
export interface RasterColorExtractor {
  canExtract(mimeType?: string): boolean;
  extractDominantColors(bufferOrData: unknown): Promise<BrandSourceColors>;
}

/**
 * Default Node runtime raster extractor: DEFERRED without heavy C++ native dependencies.
 */
export class DeferredRasterExtractor implements RasterColorExtractor {
  canExtract(): boolean {
    return false;
  }
  async extractDominantColors(): Promise<BrandSourceColors> {
    return {
      extractedFrom: "none",
    };
  }
}

/**
 * Validates and sanitizes a logo URL or image reference.
 * Disarms javascript:, vbscript:, and non-image data URLs.
 */
export function sanitizeLogoUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Reject dangerous URI schemes
  if (/^(javascript|vbscript|file):/i.test(trimmed)) {
    return null;
  }

  // Handle data: URIs - allow only safe image MIME types
  if (/^data:/i.test(trimmed)) {
    const isSafeImageData = /^data:image\/(png|jpeg|jpg|webp|svg\+xml|gif);base64,/i.test(trimmed);
    return isSafeImageData ? trimmed : null;
  }

  // Allow standard relative or absolute HTTP/HTTPS paths
  if (/^(https?:\/\/|\/|\.\/)/i.test(trimmed)) {
    // Check for inline script breakout
    if (/[<>"']/.test(trimmed)) {
      return null;
    }
    return trimmed;
  }

  return null;
}

/**
 * Primary logo analysis entrypoint.
 */
export function analyzeLogo(input: LogoAnalysisInput): LogoAnalysisResult {
  const { sourceType, url, svgContent, mimeType, preferredColor } = input;

  // Case 1: SVG Logo Content provided
  if (sourceType === "svg" && svgContent) {
    const svgResult = extractColorsFromSvg(svgContent);
    const sanitizedUrl = sanitizeLogoUrl(url) || undefined;

    return {
      logo: {
        source: "svg",
        url: sanitizedUrl,
        svgContent,
        mimeType: "image/svg+xml",
        analysisStatus: svgResult.status,
      },
      sourceColors: svgResult.sourceColors,
      analysisStatus: svgResult.status,
      rasterExtractionSupported: false,
    };
  }

  // Case 2: Raster Logo (URL or Upload)
  if (sourceType === "url" || sourceType === "upload") {
    const sanitizedUrl = sanitizeLogoUrl(url);

    // If customer provided an explicit preferred color along with the logo
    const normalizedPref = preferredColor ? normalizeHexColor(preferredColor) : null;

    if (normalizedPref) {
      return {
        logo: {
          source: sourceType,
          url: sanitizedUrl || undefined,
          mimeType: mimeType || "image/png",
          analysisStatus: "analyzed",
        },
        sourceColors: {
          dominant: normalizedPref,
          extractedFrom: "manual_preference",
          rawSampledColors: [normalizedPref],
        },
        analysisStatus: "analyzed",
        rasterExtractionSupported: false,
      };
    }

    // Raster pixel extraction is marked DEFERRED
    return {
      logo: {
        source: sourceType,
        url: sanitizedUrl || undefined,
        mimeType: mimeType || "image/png",
        analysisStatus: "deferred",
      },
      sourceColors: {
        extractedFrom: "none",
      },
      analysisStatus: "deferred",
      rasterExtractionSupported: false,
    };
  }

  // Case 3: No Logo Provided
  const normalizedPref = preferredColor ? normalizeHexColor(preferredColor) : null;
  return {
    logo: {
      source: "none",
      analysisStatus: "not_provided",
    },
    sourceColors: {
      dominant: normalizedPref || undefined,
      extractedFrom: normalizedPref ? "manual_preference" : "none",
      rawSampledColors: normalizedPref ? [normalizedPref] : [],
    },
    analysisStatus: "not_provided",
    rasterExtractionSupported: false,
  };
}
