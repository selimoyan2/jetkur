/**
 * JetKur Static Output & Performance Auditor (Sprint 08)
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. Pure verification contract: inspectGeneratedSite(files)
 * 2. Independent Code Budget (HTML/CSS/JS) separate from media/image assets.
 * 3. Enforces zero Tailwind CDN references, zero runtime CSS frameworks.
 * 4. Deterministic budget evaluation: PASS / WARN / FAIL.
 */

import { GeneratedPageFile } from "../types";

export interface GeneratedSiteMetrics {
  totalOutputBytes: number;
  htmlBytes: number;
  cssBytes: number;
  stylesheetSizeBytes: number;
  jsBytes: number;
  pageCount: number;
  avgHtmlBytesPerPage: number;
  maxHtmlBytesPerPage: number;
  avgJsBytesPerPage: number;
  avgCssBytesPerPage: number;
  externalRequests: number;
  externalRequestsPerPage: number;
  externalScriptsCount: number;
  externalStylesheetsCount: number;
  scriptCount: number;
  stylesheetCount: number;
  tailwindCdnReferences: number;
  inlineScriptBytes: number;
  inlineStyleBytes: number;
  thirdPartyHosts: string[];
  hasRuntimeCssFramework: boolean;
  hasReactRuntime: boolean;
  hasViteRuntime: boolean;
  imagesTotal: number;
  imagesLazyCount: number;
  imagesWithDimensions: number;
}

export interface PerformanceBudgetRule {
  target: number;
  warnThreshold: number;
  hardLimit: number;
}

export interface PerformanceBudgetConfig {
  maxHtmlBytesPerPage: PerformanceBudgetRule;
  maxStylesheetSizeBytes: PerformanceBudgetRule;
  maxJsBytesPerPage: PerformanceBudgetRule;
  maxExternalRequestsPerPage: PerformanceBudgetRule;
  maxTailwindReferences: number;
  maxRuntimeFrameworks: number;
}

export const OFFICIAL_PERFORMANCE_BUDGET: PerformanceBudgetConfig = {
  // HTML budget: Target <= 100KB per page, Warn > 180KB, Hard Limit > 350KB
  maxHtmlBytesPerPage: { target: 100 * 1024, warnThreshold: 180 * 1024, hardLimit: 350 * 1024 },
  // CSS Stylesheet budget: Target <= 50KB, Warn > 80KB, Hard Limit > 120KB
  maxStylesheetSizeBytes: { target: 50 * 1024, warnThreshold: 80 * 1024, hardLimit: 120 * 1024 },
  // JS budget per page: Target <= 50KB, Warn > 80KB, Hard Limit > 120KB
  maxJsBytesPerPage: { target: 50 * 1024, warnThreshold: 80 * 1024, hardLimit: 120 * 1024 },
  // External framework requests budget: Target 0, Warn > 2, Hard Limit > 5
  maxExternalRequestsPerPage: { target: 0, warnThreshold: 2, hardLimit: 5 },
  maxTailwindReferences: 0,
  maxRuntimeFrameworks: 0,
};

export type BudgetStatus = "PASS" | "WARN" | "FAIL";

export interface BudgetEvaluationResult {
  status: BudgetStatus;
  violations: string[];
  warnings: string[];
  metrics: GeneratedSiteMetrics;
}

/**
 * Pure inspection helper: analyzes all generated files of a site.
 */
export function inspectGeneratedSite(files: GeneratedPageFile[]): GeneratedSiteMetrics {
  let totalOutputBytes = 0;
  let htmlBytes = 0;
  let cssBytes = 0;
  let stylesheetSizeBytes = 0;
  let jsBytes = 0;
  let pageCount = 0;
  let maxHtmlBytesPerPage = 0;
  let externalRequests = 0;
  let externalScriptsCount = 0;
  let externalStylesheetsCount = 0;
  let scriptCount = 0;
  let stylesheetCount = 0;
  let tailwindCdnReferences = 0;
  let inlineScriptBytes = 0;
  let inlineStyleBytes = 0;
  let imagesTotal = 0;
  let imagesLazyCount = 0;
  let imagesWithDimensions = 0;
  const thirdPartyHostsSet = new Set<string>();

  let hasRuntimeCssFramework = false;
  let hasReactRuntime = false;
  let hasViteRuntime = false;

  for (const file of files) {
    const content = file.content || file.html || "";
    const size = content.length;
    totalOutputBytes += size;

    if (file.filename.endsWith(".css") || file.fileName?.endsWith(".css")) {
      stylesheetSizeBytes = size;
      cssBytes += size;
      stylesheetCount++;
      continue;
    }

    if (file.filename.endsWith(".js") || file.fileName?.endsWith(".js")) {
      jsBytes += size;
      scriptCount++;
      continue;
    }

    if (file.filename.endsWith(".html") || file.fileName?.endsWith(".html")) {
      pageCount++;
      htmlBytes += size;
      if (size > maxHtmlBytesPerPage) {
        maxHtmlBytesPerPage = size;
      }

      // 1. Tailwind CDN Check
      const twMatches = content.match(/cdn\.tailwindcss\.com/gi) || [];
      tailwindCdnReferences += twMatches.length;
      if (twMatches.length > 0) {
        hasRuntimeCssFramework = true;
      }

      // 2. React / Vite runtime check
      if (content.includes("__vite_plugin_react__") || content.includes("/@vite/client")) {
        hasViteRuntime = true;
      }
      if (content.includes("react-dom/client") || content.includes("React.createElement")) {
        hasReactRuntime = true;
      }

      // 3. Styles & Inline CSS
      const styleTags = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      for (const st of styleTags) {
        stylesheetCount++;
        inlineStyleBytes += st.length;
        cssBytes += st.length;
        if (stylesheetSizeBytes === 0) {
          stylesheetSizeBytes = st.length;
        }
      }

      // 4. Scripts & External JS
      const scriptTags = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      for (const sc of scriptTags) {
        scriptCount++;
        const srcMatch = sc.match(/src=[\"']([^\"']+)[\"']/i);
        if (srcMatch) {
          externalScriptsCount++;
          externalRequests++;
          const url = srcMatch[1];
          try {
            if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
              const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
              thirdPartyHostsSet.add(parsed.hostname);
            }
          } catch {
            // invalid URL ignored
          }
        } else {
          // Exclude Schema.org structured data from JS runtime byte count
          const isJsonLd = /type=[\"']application\/ld\+json[\"']/i.test(sc);
          if (!isJsonLd) {
            inlineScriptBytes += sc.length;
            jsBytes += sc.length;
          }
        }
      }

      // 5. External Stylesheets (link rel="stylesheet")
      const linkTags = content.match(/<link[^>]+rel=[\"']stylesheet[\"'][^>]*>/gi) || [];
      for (const lt of linkTags) {
        const hrefMatch = lt.match(/href=[\"']([^\"']+)[\"']/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
          // Count only external third-party requests
          if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
            externalStylesheetsCount++;
            externalRequests++;
            try {
              const parsed = new URL(href.startsWith("//") ? `https:${href}` : href);
              thirdPartyHostsSet.add(parsed.hostname);
            } catch {
              // ignored
            }
          }
        }
      }

      // 6. Image analysis
      const imgTags = content.match(/<img[^>]*>/gi) || [];
      for (const img of imgTags) {
        imagesTotal++;
        if (img.includes('loading="lazy"') || img.includes("loading='lazy'")) {
          imagesLazyCount++;
        }
        if (img.includes("width=") && img.includes("height=")) {
          imagesWithDimensions++;
        }
      }
    }
  }

  const safePageCount = Math.max(pageCount, 1);
  const avgHtmlBytesPerPage = Math.round(htmlBytes / safePageCount);
  const avgJsBytesPerPage = Math.round(jsBytes / safePageCount);
  const avgCssBytesPerPage = Math.round(cssBytes / safePageCount);
  const externalRequestsPerPage = Number((externalRequests / safePageCount).toFixed(1));

  return {
    totalOutputBytes,
    htmlBytes,
    cssBytes,
    stylesheetSizeBytes,
    jsBytes,
    pageCount: safePageCount,
    avgHtmlBytesPerPage,
    maxHtmlBytesPerPage,
    avgJsBytesPerPage,
    avgCssBytesPerPage,
    externalRequests,
    externalRequestsPerPage,
    externalScriptsCount,
    externalStylesheetsCount,
    scriptCount,
    stylesheetCount,
    tailwindCdnReferences,
    inlineScriptBytes,
    inlineStyleBytes,
    thirdPartyHosts: Array.from(thirdPartyHostsSet).sort(),
    hasRuntimeCssFramework,
    hasReactRuntime,
    hasViteRuntime,
    imagesTotal,
    imagesLazyCount,
    imagesWithDimensions,
  };
}

/**
 * Evaluates performance metrics against the official performance budget.
 */
export function evaluatePerformanceBudget(
  metrics: GeneratedSiteMetrics,
  budget: PerformanceBudgetConfig = OFFICIAL_PERFORMANCE_BUDGET
): BudgetEvaluationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Hard Invariant: Tailwind CDN must be strictly 0
  if (metrics.tailwindCdnReferences > budget.maxTailwindReferences) {
    violations.push(`HARD_FAIL: Tailwind CDN detected (${metrics.tailwindCdnReferences} occurrences). Target is strictly 0.`);
  }

  // Hard Invariant: No runtime CSS framework
  if (metrics.hasRuntimeCssFramework) {
    violations.push("HARD_FAIL: Runtime CSS framework detected in generated customer output.");
  }

  // Hard Invariant: No React or Vite runtime in static output
  if (metrics.hasReactRuntime) {
    violations.push("HARD_FAIL: React runtime detected in published customer output.");
  }
  if (metrics.hasViteRuntime) {
    violations.push("HARD_FAIL: Vite dev runtime detected in published customer output.");
  }

  // Stylesheet size (target <= 50KB, warn > 80KB, hardLimit > 120KB)
  if (metrics.stylesheetSizeBytes > budget.maxStylesheetSizeBytes.hardLimit) {
    violations.push(`Stylesheet size (${Math.round(metrics.stylesheetSizeBytes / 1024)} KB) exceeds hard limit (${Math.round(budget.maxStylesheetSizeBytes.hardLimit / 1024)} KB).`);
  } else if (metrics.stylesheetSizeBytes > budget.maxStylesheetSizeBytes.warnThreshold) {
    warnings.push(`Stylesheet size (${Math.round(metrics.stylesheetSizeBytes / 1024)} KB) exceeds warn threshold (${Math.round(budget.maxStylesheetSizeBytes.warnThreshold / 1024)} KB).`);
  }

  // Average per-page HTML size (target <= 100KB, warn > 180KB, hardLimit > 350KB)
  if (metrics.avgHtmlBytesPerPage > budget.maxHtmlBytesPerPage.hardLimit) {
    violations.push(`Average HTML per page (${Math.round(metrics.avgHtmlBytesPerPage / 1024)} KB) exceeds hard limit (${Math.round(budget.maxHtmlBytesPerPage.hardLimit / 1024)} KB).`);
  } else if (metrics.avgHtmlBytesPerPage > budget.maxHtmlBytesPerPage.warnThreshold) {
    warnings.push(`Average HTML per page (${Math.round(metrics.avgHtmlBytesPerPage / 1024)} KB) exceeds warn threshold (${Math.round(budget.maxHtmlBytesPerPage.warnThreshold / 1024)} KB).`);
  }

  // Average per-page JS size (target <= 50KB, warn > 80KB, hardLimit > 120KB)
  if (metrics.avgJsBytesPerPage > budget.maxJsBytesPerPage.hardLimit) {
    violations.push(`Average JS per page (${Math.round(metrics.avgJsBytesPerPage / 1024)} KB) exceeds hard limit (${Math.round(budget.maxJsBytesPerPage.hardLimit / 1024)} KB).`);
  } else if (metrics.avgJsBytesPerPage > budget.maxJsBytesPerPage.warnThreshold) {
    warnings.push(`Average JS per page (${Math.round(metrics.avgJsBytesPerPage / 1024)} KB) exceeds warn threshold (${Math.round(budget.maxJsBytesPerPage.warnThreshold / 1024)} KB).`);
  }

  // External requests per page
  if (metrics.externalRequestsPerPage > budget.maxExternalRequestsPerPage.hardLimit) {
    violations.push(`External requests per page (${metrics.externalRequestsPerPage}) exceeds hard limit (${budget.maxExternalRequestsPerPage.hardLimit}).`);
  } else if (metrics.externalRequestsPerPage > budget.maxExternalRequestsPerPage.warnThreshold) {
    warnings.push(`External requests per page (${metrics.externalRequestsPerPage}) exceeds warn threshold (${budget.maxExternalRequestsPerPage.warnThreshold}).`);
  }

  let status: BudgetStatus = "PASS";
  if (violations.length > 0) {
    status = "FAIL";
  } else if (warnings.length > 0) {
    status = "WARN";
  }

  return {
    status,
    violations,
    warnings,
    metrics,
  };
}
