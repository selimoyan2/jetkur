/**
 * JetKur Brand Kit - Universal Multi-Format Logo Color Extractor (Sprint 16.5)
 *
 * ARCHITECTURAL CONTRACT:
 * Supported Formats: PNG, JPEG/JPG, WebP, SVG.
 * 
 * Flow:
 * LOGO -> PIXEL / SVG ANALYSIS -> DOMINANT BRAND COLORS
 *      -> BACKGROUND / TRANSPARENCY FILTERING -> PRIMARY COLOR
 *      -> ACCENT COLOR -> CONTRAST VALIDATION -> BRAND KIT PALETTE
 *
 * Rules:
 * 1. Filter transparent pixels (alpha < 128).
 * 2. Filter pure white and near-white backgrounds (r>240 && g>240 && b>240).
 * 3. Filter pure black and near-black backgrounds (r<20 && g<20 && b<20).
 * 4. Prefer meaningful, saturated colors.
 * 5. Returns truthful fallback if no confident brand color is extracted.
 * 6. Supports both browser (via OffscreenCanvas/Image) and server/test environments (via SVG & PNG chunk decoders).
 */

import {
  normalizeHexColor,
  isNearWhite,
  isNearBlack,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  darkenColor,
  tintColor,
  shiftHue,
  getContrastRatio,
  getOptimalForeground,
  RgbColor,
} from "./colorUtils";
import { extractColorsFromSvg } from "./svgColorExtractor";
import jpeg from "jpeg-js";
import zlib from "zlib";

export interface ColorExtractionInput {
  dataUrl?: string;
  svgContent?: string;
  rawBuffer?: Buffer | Uint8Array;
  mimeType?: string;
  fileName?: string;
}

export interface ExtractedBrandPalette {
  primary: string;
  accent: string;
  primaryHover: string;
  textOnPrimary: string;
  confidence: number; // 0 to 1
  isExtracted: boolean;
  statusMessage: string;
  sourceType: "svg" | "png" | "jpeg" | "webp" | "fallback";
}

/**
 * Quantizes an RGB color to 16-step buckets to group near-identical shades
 */
function quantizeRgb(rgb: RgbColor, step = 16): string {
  const qr = Math.round(rgb.r / step) * step;
  const qg = Math.round(rgb.g / step) * step;
  const qb = Math.round(rgb.b / step) * step;
  return rgbToHex({
    r: Math.min(255, Math.max(0, qr)),
    g: Math.min(255, Math.max(0, qg)),
    b: Math.min(255, Math.max(0, qb)),
  });
}

/**
 * Analyzes an array of RGBA pixels and extracts dominant primary and accent colors
 */
export function analyzeRgbaPixels(
  pixels: Uint8Array | Uint8ClampedArray,
  totalPixels: number
): { primary: string | null; accent: string | null; confidence: number } {
  const bucketCounts: Record<string, { count: number; rgb: RgbColor; saturation: number }> = {};
  let validColoredPixels = 0;

  for (let i = 0; i < totalPixels * 4; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Rule 1: Skip transparent pixels
    if (a < 128) continue;

    // Rule 2: Skip near-white backgrounds
    if (isNearWhite({ r, g, b })) continue;

    // Rule 3: Skip near-black accidental dark backgrounds
    if (isNearBlack({ r, g, b })) continue;

    const hsl = rgbToHsl({ r, g, b });
    // Penalize low saturation (grays/slate) unless nothing else exists
    const isGrayish = hsl.s < 0.18;
    if (isGrayish && (hsl.l > 0.8 || hsl.l < 0.2)) continue;

    const hexBucket = quantizeRgb({ r, g, b }, 16);
    if (!bucketCounts[hexBucket]) {
      bucketCounts[hexBucket] = { count: 0, rgb: { r, g, b }, saturation: hsl.s };
    }
    bucketCounts[hexBucket].count += 1;
    validColoredPixels += 1;
  }

  if (validColoredPixels === 0) {
    return { primary: null, accent: null, confidence: 0 };
  }

  // Score buckets by: frequency * (1 + saturation * 2.5)
  const scoredBuckets = Object.entries(bucketCounts).map(([hex, data]) => {
    const score = data.count * (1 + data.saturation * 2.5);
    return { hex, score, ...data };
  });

  scoredBuckets.sort((a, b) => b.score - a.score);

  const topBucket = scoredBuckets[0];
  const primary = topBucket.hex;

  // Find accent: Pick highest scored bucket with distinct hue distance (>= 35 degrees)
  const primaryHsl = rgbToHsl(topBucket.rgb);
  let accent: string | null = null;

  for (let i = 1; i < scoredBuckets.length; i++) {
    const candidate = scoredBuckets[i];
    const candidateHsl = rgbToHsl(candidate.rgb);
    const hueDiff = Math.abs(primaryHsl.h - candidateHsl.h);
    const angularDiff = Math.min(hueDiff, 360 - hueDiff);

    if (angularDiff >= 35 && candidate.saturation > 0.2) {
      accent = candidate.hex;
      break;
    }
  }

  // If no distinct accent found, calculate harmonious complementary or split-complementary hue
  if (!accent) {
    accent = shiftHue(primary, 40);
  }

  const confidence = Math.min(1, validColoredPixels / (totalPixels * 0.05));

  return { primary, accent, confidence };
}

/**
 * Parses raw PNG buffer to extract pixel palette or IDAT samples without native C++ deps
 */
export function extractColorsFromPngBuffer(buffer: Buffer | Uint8Array): { primary: string | null; accent: string | null } {
  try {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    // Verify PNG header: 89 50 4E 47 0D 0A 1A 0A
    if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
      return { primary: null, accent: null };
    }

    let pos = 8;
    const colors: RgbColor[] = [];
    const idatChunks: Buffer[] = [];
    let width = 0;
    let height = 0;
    let colorType = 0;
    let bitDepth = 0;

    // Scan chunks
    while (pos < buf.length - 8) {
      const length = buf.readUInt32BE(pos);
      const type = buf.toString("ascii", pos + 4, pos + 8);
      const dataStart = pos + 8;

      if (type === "IHDR" && length >= 13) {
        width = buf.readUInt32BE(dataStart);
        height = buf.readUInt32BE(dataStart + 4);
        bitDepth = buf[dataStart + 8];
        colorType = buf[dataStart + 9];
      } else if (type === "PLTE") {
        // PLTE contains RGB triplets
        const numColors = Math.min(256, Math.floor(length / 3));
        for (let i = 0; i < numColors; i++) {
          const r = buf[dataStart + i * 3];
          const g = buf[dataStart + i * 3 + 1];
          const b = buf[dataStart + i * 3 + 2];
          colors.push({ r, g, b });
        }
      } else if (type === "IDAT") {
        idatChunks.push(buf.subarray(dataStart, dataStart + length));
      }

      pos += 12 + length;
    }

    if (colors.length > 0) {
      // Analyze palette entries
      const dummyPixels = new Uint8Array(colors.length * 4);
      for (let i = 0; i < colors.length; i++) {
        dummyPixels[i * 4] = colors[i].r;
        dummyPixels[i * 4 + 1] = colors[i].g;
        dummyPixels[i * 4 + 2] = colors[i].b;
        dummyPixels[i * 4 + 3] = 255;
      }
      return analyzeRgbaPixels(dummyPixels, colors.length);
    }

    if (idatChunks.length > 0 && width > 0 && height > 0 && bitDepth === 8) {
      const compressed = Buffer.concat(idatChunks);
      const decompressed = zlib.inflateSync(compressed);
      const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
      if (bytesPerPixel > 0) {
        const rowSize = 1 + width * bytesPerPixel;
        const totalSampledPixels = Math.min(width * height, 2048);
        const sampleStep = Math.max(1, Math.floor((width * height) / totalSampledPixels));
        const pixels = new Uint8Array(totalSampledPixels * 4);
        let outIdx = 0;

        for (let y = 0; y < height && outIdx < totalSampledPixels; y++) {
          const rowOffset = y * rowSize + 1; // skip filter byte
          for (let x = 0; x < width && outIdx < totalSampledPixels; x += sampleStep) {
            const pixelOffset = rowOffset + x * bytesPerPixel;
            if (pixelOffset + bytesPerPixel <= decompressed.length) {
              pixels[outIdx * 4] = decompressed[pixelOffset];
              pixels[outIdx * 4 + 1] = decompressed[pixelOffset + 1];
              pixels[outIdx * 4 + 2] = decompressed[pixelOffset + 2];
              pixels[outIdx * 4 + 3] = colorType === 6 ? decompressed[pixelOffset + 3] : 255;
              outIdx++;
            }
          }
        }

        if (outIdx > 0) {
          return analyzeRgbaPixels(pixels, outIdx);
        }
      }
    }
  } catch {
    // ignore
  }

  return { primary: null, accent: null };
}

/**
 * Parses raw JPEG buffer to extract pixel palette using jpeg-js
 */
export function extractColorsFromJpegBuffer(buffer: Buffer | Uint8Array): { primary: string | null; accent: string | null } {
  try {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const decoded = jpeg.decode(buf, { useTArray: true });
    if (decoded && decoded.data && decoded.width && decoded.height) {
      return analyzeRgbaPixels(decoded.data, decoded.width * decoded.height);
    }
  } catch {
    // ignore
  }
  return { primary: null, accent: null };
}

/**
 * Parses raw WebP buffer to extract pixel palette using @stacksjs/ts-webp
 */
export async function extractColorsFromWebpBuffer(buffer: Buffer | Uint8Array): Promise<{ primary: string | null; accent: string | null }> {
  try {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const { decode: decodeWebp } = await import("@stacksjs/ts-webp");
    const decoded = decodeWebp(buf);
    if (decoded && decoded.data && decoded.width && decoded.height) {
      return analyzeRgbaPixels(decoded.data, decoded.width * decoded.height);
    }
  } catch {
    // ignore
  }
  return { primary: null, accent: null };
}

/**
 * Universal logo color extraction pipeline (Client & Server)
 */
export async function extractLogoColors(input: ColorExtractionInput): Promise<ExtractedBrandPalette> {
  const mime = (input.mimeType || "").toLowerCase();
  const isSvg = Boolean(input.svgContent) || mime.includes("svg");
  const isPng = mime.includes("png") || Boolean(input.fileName?.endsWith(".png"));
  const isJpg = mime.includes("jpeg") || mime.includes("jpg") || Boolean(input.fileName?.match(/\.jpe?g$/i));
  const isWebp = mime.includes("webp") || Boolean(input.fileName?.endsWith(".webp"));

  // -------------------------------------------------------------
  // Case 1: SVG Logo
  // -------------------------------------------------------------
  if (isSvg && input.svgContent) {
    const svgResult = extractColorsFromSvg(input.svgContent);
    const dominant = svgResult.sourceColors.dominant;
    const nonNeutralAccents = (svgResult.sourceColors.accentCandidates || []).filter(
      (c) => c && !isNearWhite(c) && !isNearBlack(c)
    );
    const secondaryCandidate = svgResult.sourceColors.secondary && !isNearWhite(svgResult.sourceColors.secondary) && !isNearBlack(svgResult.sourceColors.secondary)
      ? svgResult.sourceColors.secondary
      : null;
    const accentCandidate = nonNeutralAccents[0] || secondaryCandidate;

    if (dominant && !isNearWhite(dominant) && !isNearBlack(dominant)) {
      const primary = normalizeHexColor(dominant)!;
      const accent = accentCandidate ? normalizeHexColor(accentCandidate)! : shiftHue(primary, 40);
      const primaryHover = darkenColor(primary, 15);
      const textOnPrimary = getOptimalForeground(primary);

      return {
        primary,
        accent,
        primaryHover,
        textOnPrimary,
        confidence: 0.95,
        isExtracted: true,
        statusMessage: "Logonuzdan marka renkleriniz başarıyla çıkarıldı.",
        sourceType: "svg",
      };
    }
  }

  // -------------------------------------------------------------
  // Case 2: Browser Environment with HTML5 Canvas (PNG, JPEG, WebP)
  // -------------------------------------------------------------
  if (typeof window !== "undefined" && typeof document !== "undefined" && input.dataUrl) {
    try {
      const extracted = await new Promise<{ primary: string | null; accent: string | null; confidence: number }>(
        (resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const size = 64;
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext("2d", { willReadFrequently: true });
              if (!ctx) {
                resolve({ primary: null, accent: null, confidence: 0 });
                return;
              }
              ctx.drawImage(img, 0, 0, size, size);
              const imgData = ctx.getImageData(0, 0, size, size);
              const result = analyzeRgbaPixels(imgData.data, size * size);
              resolve(result);
            } catch {
              resolve({ primary: null, accent: null, confidence: 0 });
            }
          };
          img.onerror = () => {
            resolve({ primary: null, accent: null, confidence: 0 });
          };
          img.src = input.dataUrl!;
        }
      );

      if (extracted.primary) {
        const primary = normalizeHexColor(extracted.primary)!;
        const accent = extracted.accent ? normalizeHexColor(extracted.accent)! : shiftHue(primary, 40);
        const primaryHover = darkenColor(primary, 15);
        const textOnPrimary = getOptimalForeground(primary);

        return {
          primary,
          accent,
          primaryHover,
          textOnPrimary,
          confidence: extracted.confidence,
          isExtracted: true,
          statusMessage: "Logonuzdan marka renkleriniz başarıyla çıkarıldı.",
          sourceType: isPng ? "png" : isJpg ? "jpeg" : isWebp ? "webp" : "png",
        };
      }
    } catch {
      // browser canvas failed, fall through
    }
  }

  // -------------------------------------------------------------
  // Case 3: Node / Test Environment (Buffer / dataUrl)
  // -------------------------------------------------------------
  let buffer: Buffer | null = null;
  if (input.rawBuffer) {
    buffer = Buffer.isBuffer(input.rawBuffer) ? input.rawBuffer : Buffer.from(input.rawBuffer);
  } else if (input.dataUrl && input.dataUrl.startsWith("data:")) {
    const base64Part = input.dataUrl.split(",")[1];
    if (base64Part) {
      buffer = Buffer.from(base64Part, "base64");
    }
  }

  if (buffer) {
    // If PNG, attempt chunk analysis (PLTE + IDAT)
    if (isPng || (!isJpg && buffer[0] === 0x89 && buffer[1] === 0x50)) {
      const pngResult = extractColorsFromPngBuffer(buffer);
      if (pngResult.primary) {
        const primary = normalizeHexColor(pngResult.primary)!;
        const accent = pngResult.accent ? normalizeHexColor(pngResult.accent)! : shiftHue(primary, 40);
        const primaryHover = darkenColor(primary, 15);
        const textOnPrimary = getOptimalForeground(primary);

        return {
          primary,
          accent,
          primaryHover,
          textOnPrimary,
          confidence: 0.85,
          isExtracted: true,
          statusMessage: "Logonuzdan marka renkleriniz başarıyla çıkarıldı.",
          sourceType: "png",
        };
      }
    }

    // If JPEG / JPG, decode with jpeg-js
    if (isJpg || (!isPng && !isWebp && buffer[0] === 0xff && buffer[1] === 0xd8)) {
      const jpegResult = extractColorsFromJpegBuffer(buffer);
      if (jpegResult.primary) {
        const primary = normalizeHexColor(jpegResult.primary)!;
        const accent = jpegResult.accent ? normalizeHexColor(jpegResult.accent)! : shiftHue(primary, 40);
        const primaryHover = darkenColor(primary, 15);
        const textOnPrimary = getOptimalForeground(primary);

        return {
          primary,
          accent,
          primaryHover,
          textOnPrimary,
          confidence: 0.85,
          isExtracted: true,
          statusMessage: "Logonuzdan marka renkleriniz başarıyla çıkarıldı.",
          sourceType: "jpeg",
        };
      }
    }

    // If WebP, decode with ts-webp
    if (isWebp || (buffer.length > 12 && buffer.toString("ascii", 8, 12) === "WEBP")) {
      const webpResult = await extractColorsFromWebpBuffer(buffer);
      if (webpResult.primary) {
        const primary = normalizeHexColor(webpResult.primary)!;
        const accent = webpResult.accent ? normalizeHexColor(webpResult.accent)! : shiftHue(primary, 40);
        const primaryHover = darkenColor(primary, 15);
        const textOnPrimary = getOptimalForeground(primary);

        return {
          primary,
          accent,
          primaryHover,
          textOnPrimary,
          confidence: 0.85,
          isExtracted: true,
          statusMessage: "Logonuzdan marka renkleriniz başarıyla çıkarıldı.",
          sourceType: "webp",
        };
      }
    }
  }

  // -------------------------------------------------------------
  // Case 4: Truthful Fallback (Could not extract with confidence)
  // -------------------------------------------------------------
  return {
    primary: "#2563eb", // Standard trusted blue default
    accent: "#f59e0b",
    primaryHover: "#1d4ed8",
    textOnPrimary: "#ffffff",
    confidence: 0,
    isExtracted: false,
    statusMessage: "Logodan güvenilir bir marka rengi çıkaramadık. Ana renginizi seçebilirsiniz.",
    sourceType: "fallback",
  };
}
