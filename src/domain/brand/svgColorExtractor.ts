/**
 * JetKur Brand Kit - Safe Static SVG Color Extractor (Sprint 10)
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. Zero DOM execution: NEVER injects SVG into DOM or executes via eval/new Function.
 * 2. Strict Security Sanitization: Rejects/ignores <script>, on*= event handlers,
 *    <foreignObject>, javascript: URIs, external resources.
 * 3. Bounded Static Extraction: Parses only safe static color attributes (fill, stroke, stop-color).
 * 4. Deterministic Output: Same SVG markup produces identical source colors.
 */

import { normalizeHexColor, isNearWhite, isNearBlack } from "./colorUtils";
import { BrandSourceColors } from "./types";

export interface SvgExtractionResult {
  status: "analyzed" | "fallback" | "unsupported";
  sourceColors: BrandSourceColors;
  securityWarnings?: string[];
  rawCount: number;
}

const DANGEROUS_SVG_PATTERNS = [
  { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi, label: "Embedded <script> tag" },
  { pattern: /<script[\s\S]*?>/gi, label: "Unclosed <script> tag" },
  { pattern: /on[a-z]+\s*=\s*["'][^"']*["']/gi, label: "Inline event handler (e.g. onload, onclick)" },
  { pattern: /<foreignObject[\s\S]*?>/gi, label: "<foreignObject> tag" },
  { pattern: /javascript\s*:/gi, label: "javascript: URI scheme" },
  { pattern: /vbscript\s*:/gi, label: "vbscript: URI scheme" },
  { pattern: /<use[^>]+href\s*=\s*["']https?:\/\//gi, label: "External <use> reference" },
];

/**
 * Checks an SVG string for dangerous executable payloads.
 */
export function auditSvgSecurity(svgContent: string): { isSafe: boolean; warnings: string[] } {
  const warnings: string[] = [];
  for (const { pattern, label } of DANGEROUS_SVG_PATTERNS) {
    if (pattern.test(svgContent)) {
      warnings.push(label);
    }
  }
  return {
    isSafe: warnings.length === 0,
    warnings,
  };
}

/**
 * Extracts static color declarations from safe SVG text markup.
 */
export function extractColorsFromSvg(svgContent: unknown): SvgExtractionResult {
  if (typeof svgContent !== "string" || !svgContent.trim()) {
    return {
      status: "unsupported",
      sourceColors: {
        extractedFrom: "none",
      },
      rawCount: 0,
    };
  }

  // Security audit
  const securityAudit = auditSvgSecurity(svgContent);

  // Strip dangerous tags completely before color regex scan to ensure no payload leaks
  let sanitized = svgContent;
  for (const { pattern } of DANGEROUS_SVG_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Bounded color regex matchers
  const colorMatches: string[] = [];

  // 1. fill="..." and stroke="..." and stop-color="..."
  const attrRegex = /\b(?:fill|stroke|stop-color)\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(sanitized)) !== null) {
    colorMatches.push(match[1]);
  }

  // 2. inline styles: style="...fill: #123...; stroke: rgb(...)..."
  const styleAttrRegex = /\bstyle\s*=\s*["']([^"']+)["']/gi;
  while ((match = styleAttrRegex.exec(sanitized)) !== null) {
    const styleContent = match[1];
    const propRegex = /(?:fill|stroke|stop-color)\s*:\s*([^;!"']+)/gi;
    let propMatch: RegExpExecArray | null;
    while ((propMatch = propRegex.exec(styleContent)) !== null) {
      colorMatches.push(propMatch[1]);
    }
  }

  // Filter out non-colors ("none", "transparent", "currentcolor", "inherit", "url(#...)")
  const IGNORED_VALUES = new Set(["none", "transparent", "currentcolor", "inherit", "initial"]);

  const validHexes: string[] = [];
  const colorFrequency: Record<string, number> = {};

  for (const raw of colorMatches) {
    const clean = raw.trim().toLowerCase();
    if (IGNORED_VALUES.has(clean)) continue;
    if (clean.startsWith("url(")) continue;

    const normalized = normalizeHexColor(clean);
    if (normalized) {
      validHexes.push(normalized);
      colorFrequency[normalized] = (colorFrequency[normalized] || 0) + 1;
    }
  }

  if (validHexes.length === 0) {
    return {
      status: "fallback",
      sourceColors: {
        extractedFrom: "svg",
        rawSampledColors: [],
      },
      securityWarnings: securityAudit.warnings.length > 0 ? securityAudit.warnings : undefined,
      rawCount: 0,
    };
  }

  // Rank colors by frequency
  const ranked = Object.entries(colorFrequency).sort((a, b) => b[1] - a[1]);

  // Separate saturated/chromatic colors from near-white/near-black backgrounds
  const chromaticColors = ranked.filter(([hex]) => !isNearWhite(hex) && !isNearBlack(hex));

  // Determine dominant
  const dominant = chromaticColors.length > 0 ? chromaticColors[0][0] : ranked[0][0];

  // Determine secondary - prefer chromatic color over white/black background
  const secondaryCandidate = chromaticColors.find(([hex]) => hex !== dominant);
  const secondary = secondaryCandidate ? secondaryCandidate[0] : (ranked.find(([hex]) => hex !== dominant && !isNearWhite(hex) && !isNearBlack(hex))?.[0]);

  // Accent candidates - prioritize chromatic colors over near-white/near-black backgrounds
  const chromaticAccents = chromaticColors
    .map(([hex]) => hex)
    .filter((hex) => hex !== dominant && hex !== secondary);
  const otherNonNeutralAccents = ranked
    .map(([hex]) => hex)
    .filter((hex) => hex !== dominant && hex !== secondary && !isNearWhite(hex) && !isNearBlack(hex));
  const accentCandidates = [...chromaticAccents, ...otherNonNeutralAccents];

  return {
    status: "analyzed",
    sourceColors: {
      dominant,
      secondary,
      accentCandidates: accentCandidates.slice(0, 3),
      extractedFrom: "svg",
      rawSampledColors: ranked.map(([hex]) => hex),
    },
    securityWarnings: securityAudit.warnings.length > 0 ? securityAudit.warnings : undefined,
    rawCount: validHexes.length,
  };
}
