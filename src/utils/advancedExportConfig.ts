import { CompetitorKeywordRanking } from "../types";
import { KeywordGoalItem, calculateGoalProgress } from "../components/dashboard/GoalTrackingModule";
import { StrategicCompetitorNote } from "../components/dashboard/RowStrategicNotepad";

export type CompressionLevel = "low" | "medium" | "high";

export interface JsonFormattingOptions {
  indentation: "pretty-2" | "pretty-4" | "minified";
  omitNullValues: boolean;
  numberFormatting: "raw" | "locale" | "short";
  dateFormat: "iso" | "locale_tr" | "timestamp";
  keyCasing: "camelCase" | "snake_case";
  includeFields: {
    rankings: boolean;
    metrics: boolean;
    intentAndSerp: boolean;
    goals: boolean;
    notes: boolean;
    metadata: boolean;
  };
}

export interface PdfFormattingOptions {
  orientation: "landscape" | "portrait";
  theme: "dark" | "light" | "grayscale";
  density: "comfortable" | "compact";
  scale: number; // 2 for low compression, 1.5 for medium, 1 for high
  quality: number; // 0.98 for low compression, 0.85 for medium, 0.65 for high
  includeSections: {
    executiveSummary: boolean;
    competitorComparison: boolean;
    keywordTable: boolean;
    goalsAndDeviations: boolean;
    strategicNotes: boolean;
    footer: boolean;
  };
  maxTableRows: "all" | 25 | 50 | 100;
}

export interface AdvancedExportSettings {
  compressionLevel: CompressionLevel;
  json: JsonFormattingOptions;
  pdf: PdfFormattingOptions;
}

export interface ExportContext {
  userName: string;
  userDomain?: string;
  competitors: Array<{ name: string; domain?: string; visibilityScore?: number; speedScore?: number }>;
  goals?: Record<string, KeywordGoalItem>;
  strategicNotes?: Record<string, StrategicCompetitorNote>;
  scopeLabel: string;
}

const STORAGE_KEY = "jetkur_advanced_export_settings_v1";

/**
 * Returns the default export configuration
 */
export function getDefaultAdvancedExportSettings(): AdvancedExportSettings {
  return {
    compressionLevel: "medium",
    json: {
      indentation: "pretty-2",
      omitNullValues: false,
      numberFormatting: "raw",
      dateFormat: "iso",
      keyCasing: "camelCase",
      includeFields: {
        rankings: true,
        metrics: true,
        intentAndSerp: true,
        goals: true,
        notes: true,
        metadata: true
      }
    },
    pdf: {
      orientation: "landscape",
      theme: "dark",
      density: "comfortable",
      scale: 1.5,
      quality: 0.85,
      includeSections: {
        executiveSummary: true,
        competitorComparison: true,
        keywordTable: true,
        goalsAndDeviations: true,
        strategicNotes: true,
        footer: true
      },
      maxTableRows: "all"
    }
  };
}

/**
 * Load settings from localStorage with fallback
 */
export function loadAdvancedExportSettings(): AdvancedExportSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAdvancedExportSettings();
    const parsed = JSON.parse(raw);
    const def = getDefaultAdvancedExportSettings();
    return {
      ...def,
      ...parsed,
      json: {
        ...def.json,
        ...(parsed.json || {}),
        includeFields: {
          ...def.json.includeFields,
          ...(parsed.json?.includeFields || {})
        }
      },
      pdf: {
        ...def.pdf,
        ...(parsed.pdf || {}),
        includeSections: {
          ...def.pdf.includeSections,
          ...(parsed.pdf?.includeSections || {})
        }
      }
    };
  } catch (e) {
    console.warn("Failed to load advanced export settings:", e);
    return getDefaultAdvancedExportSettings();
  }
}

/**
 * Persist settings to localStorage
 */
export function saveAdvancedExportSettings(settings: AdvancedExportSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save advanced export settings:", e);
  }
}

/**
 * Adjust settings based on chosen Compression Level preset
 */
export function applyCompressionPreset(
  level: CompressionLevel,
  current: AdvancedExportSettings
): AdvancedExportSettings {
  const updated: AdvancedExportSettings = JSON.parse(JSON.stringify(current));
  updated.compressionLevel = level;

  if (level === "low") {
    // Düşük Sıkıştırma: En yüksek kalite, tam detay, pretty-printed
    updated.json.indentation = "pretty-4";
    updated.json.omitNullValues = false;
    updated.pdf.scale = 2.0;
    updated.pdf.quality = 0.98;
    updated.pdf.density = "comfortable";
  } else if (level === "medium") {
    // Orta Sıkıştırma: Dengeli standart
    updated.json.indentation = "pretty-2";
    updated.json.omitNullValues = false;
    updated.pdf.scale = 1.5;
    updated.pdf.quality = 0.85;
    updated.pdf.density = "comfortable";
  } else if (level === "high") {
    // Yüksek Sıkıştırma: Minified, sıkıştırılmış, kompakt
    updated.json.indentation = "minified";
    updated.json.omitNullValues = true;
    updated.pdf.scale = 1.0;
    updated.pdf.quality = 0.65;
    updated.pdf.density = "compact";
  }

  return updated;
}

/**
 * Format numbers according to preference
 */
function formatNumber(val: number | string | undefined | null, mode: "raw" | "locale" | "short"): unknown {
  if (val === undefined || val === null) return null;
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/\./g, "").replace(/,/g, "."));
  if (isNaN(num)) return val;
  if (mode === "raw") return num;
  if (mode === "locale") return num.toLocaleString("tr-TR");
  if (mode === "short") {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return String(num);
  }
  return num;
}

/**
 * Format dates according to preference
 */
function formatDate(date: Date, mode: "iso" | "locale_tr" | "timestamp"): string | number {
  if (mode === "timestamp") return date.getTime();
  if (mode === "locale_tr") {
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
  return date.toISOString();
}

/**
 * Converts object keys to snake_case if requested
 */
function transformKeys(obj: unknown, casing: "camelCase" | "snake_case"): unknown {
  if (casing === "camelCase" || !obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => transformKeys(item, casing));

  const transformed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    transformed[snakeKey] = transformKeys(value, casing);
  }
  return transformed;
}

/**
 * Removes null and undefined values recursively
 */
function removeNulls(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(removeNulls).filter((v) => v !== null && v !== undefined);

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== null && value !== undefined) {
      cleaned[key] = removeNulls(value);
    }
  }
  return cleaned;
}

/**
 * Generates formatted, customized JSON output based on user settings
 */
export function generateFormattedJson(
  data: CompetitorKeywordRanking[],
  settings: AdvancedExportSettings,
  context: ExportContext
): string {
  const { json } = settings;
  const comp1 = context.competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
  const comp2 = context.competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
  const comp3 = context.competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

  const exportDate = new Date();

  // Keyword items
  const items = data.map((r) => {
    const item: Record<string, unknown> = {
      id: r.id,
      keyword: r.keyword
    };

    if (json.includeFields.intentAndSerp) {
      item.searchIntent = r.searchIntent;
      item.serpFeatures = r.serpFeatures || [];
    }

    if (json.includeFields.metrics) {
      item.monthlyVolume = formatNumber(r.monthlyVolume, json.numberFormatting);
      item.difficulty = formatNumber(r.difficulty, json.numberFormatting);
      item.trafficOpportunity = formatNumber(r.trafficOpportunity, json.numberFormatting);
      item.status = r.status;
      if (r.aiRecommendation) {
        item.aiRecommendation = r.aiRecommendation;
      }
    }

    if (json.includeFields.rankings) {
      item.rankings = {
        user: {
          rank: r.userRank,
          company: context.userName
        },
        competitor1: {
          rank: r.comp1Rank,
          name: comp1.name,
          domain: comp1.domain
        },
        competitor2: {
          rank: r.comp2Rank,
          name: comp2.name,
          domain: comp2.domain
        },
        competitor3: {
          rank: r.comp3Rank,
          name: comp3.name,
          domain: comp3.domain
        },
        gap: r.gap
      };
    }

    if (json.includeFields.goals) {
      const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
      const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      const targetRank = context.goals?.[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
      const prog = calculateGoalProgress(r.userRank, targetRank, bestComp);

      item.goals = {
        targetRank,
        attainmentPercent: formatNumber(prog.attainmentPercent, json.numberFormatting),
        deviationPercent: formatNumber(prog.deviationPercent, json.numberFormatting),
        rankDifference: prog.rankDifference,
        status: prog.status,
        statusLabel: prog.statusLabel
      };
    }

    if (json.includeFields.notes) {
      const note = context.strategicNotes?.[r.id];
      if (note) {
        item.strategicNote = {
          text: note.text,
          tags: note.tags || [],
          updatedAt: note.updatedAt
        };
      } else {
        item.strategicNote = null;
      }
    }

    return item;
  });

  // Calculate summary metrics
  const userRank1Count = data.filter((r) => r.userRank === 1).length;
  const userTop3Count = data.filter((r) => r.userRank !== null && r.userRank !== undefined && r.userRank <= 3).length;
  const userTop10Count = data.filter((r) => r.userRank !== null && r.userRank !== undefined && r.userRank <= 10).length;

  let rootOutput: Record<string, unknown> = {};

  if (json.includeFields.metadata) {
    rootOutput.metadata = {
      title: "SEO Rakip Kıyaslama & Anahtar Kelime Sıralama Veri Paketi",
      exportedAt: formatDate(exportDate, json.dateFormat),
      companyName: context.userName,
      domain: context.userDomain || null,
      scope: context.scopeLabel,
      totalKeywords: data.length,
      compressionLevel: settings.compressionLevel,
      version: "2.5.0"
    };

    rootOutput.summary = {
      totalKeywords: data.length,
      serpLeadersRank1: userRank1Count,
      top3Rankings: userTop3Count,
      top10Rankings: userTop10Count
    };

    rootOutput.competitors = context.competitors.map((c, i) => ({
      position: i + 1,
      name: c.name,
      domain: c.domain || null,
      visibilityScore: c.visibilityScore ? formatNumber(c.visibilityScore, json.numberFormatting) : null
    }));
  }

  rootOutput.rankings = items;

  // Apply Null Filtering if enabled
  if (json.omitNullValues) {
    rootOutput = removeNulls(rootOutput) as Record<string, unknown>;
  }

  // Apply Casing
  const finalObject = transformKeys(rootOutput, json.keyCasing);

  // Stringify with specified indentation
  if (json.indentation === "minified") {
    return JSON.stringify(finalObject);
  }
  if (json.indentation === "pretty-4") {
    return JSON.stringify(finalObject, null, 4);
  }
  return JSON.stringify(finalObject, null, 2);
}

/**
 * Estimates file size in bytes and human-readable string for both JSON and PDF
 */
export function estimateExportSizes(
  dataCount: number,
  settings: AdvancedExportSettings
): {
  jsonSizeBytes: number;
  jsonSizeFormatted: string;
  pdfSizeBytes: number;
  pdfSizeFormatted: string;
} {
  // Approximate per-row bytes based on enabled fields and indentation
  let jsonBytesPerRow = 420;
  if (settings.json.indentation === "pretty-4") jsonBytesPerRow = 620;
  if (settings.json.indentation === "minified") jsonBytesPerRow = 190;
  if (settings.json.omitNullValues) jsonBytesPerRow *= 0.85;

  const fieldMultiplier = 
    (settings.json.includeFields.rankings ? 0.3 : 0) +
    (settings.json.includeFields.metrics ? 0.25 : 0) +
    (settings.json.includeFields.intentAndSerp ? 0.15 : 0) +
    (settings.json.includeFields.goals ? 0.2 : 0) +
    (settings.json.includeFields.notes ? 0.1 : 0);

  const jsonBase = settings.json.includeFields.metadata ? 900 : 100;
  const jsonSizeBytes = Math.round(jsonBase + dataCount * jsonBytesPerRow * Math.max(0.4, fieldMultiplier));

  // PDF size estimation based on compression scale and quality
  const rowsRendered = settings.pdf.maxTableRows === "all" ? dataCount : Math.min(dataCount, settings.pdf.maxTableRows);
  const pdfBase = 120_000; // base font, styles, vector header
  let pdfQualityFactor = 1.0;
  if (settings.compressionLevel === "low") pdfQualityFactor = 2.4;
  if (settings.compressionLevel === "high") pdfQualityFactor = 0.45;

  const pdfSizeBytes = Math.round((pdfBase + rowsRendered * 4_200) * pdfQualityFactor);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return {
    jsonSizeBytes,
    jsonSizeFormatted: formatSize(jsonSizeBytes),
    pdfSizeBytes,
    pdfSizeFormatted: formatSize(pdfSizeBytes)
  };
}
