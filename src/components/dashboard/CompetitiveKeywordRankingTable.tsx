import React, { useState, useMemo, useRef } from "react";
import { 
  CompetitorKeywordRanking, 
  CompetitorContentMetric,
  SiteConfig
} from "../../types";
import {
  Search,
  Target,
  Trophy,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Copy,
  Check,
  Plus,
  BookOpen,
  Sparkles,
  ArrowUpDown,
  Flame,
  Globe,
  MapPin,
  HelpCircle,
  Zap,
  Info,
  BellRing,
  AlertTriangle,
  BarChart3,
  Layers,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  X,
  SlidersHorizontal,
  Sliders,
  Settings2,
  CheckSquare,
  Square,
  Pencil,
  RotateCcw,
  Trash2,
  StickyNote,
  CalendarClock,
  CalendarCheck,
  Mail,
  Activity,
  Box,
  Compass,
  FileDown,
  FileText,
  Award,
  Loader2,
  PieChart,
  UploadCloud,
  Palette,
  GitCompare,
  GripVertical,
  Users,
  ArrowUpRight
} from "lucide-react";
import { CompetitorDiffViewPanel } from "./CompetitorDiffViewPanel";
import { CompetitorMarketSharePieChart } from "./CompetitorMarketSharePieChart";
import { MarketShareReportBuilderModal } from "./MarketShareReportBuilderModal";
import { CompetitorCsvImportModal, CsvImportMode } from "./CompetitorCsvImportModal";
import { QuickCsvUploadBar } from "./QuickCsvUploadBar";
import { generateSampleCsvTemplate } from "../../utils/competitorCsvImport";
import { CompetitorColorThemeModal } from "./CompetitorColorThemeModal";
import { 
  CompetitorColorPalette, 
  loadSavedColorTheme, 
  saveColorTheme 
} from "../../utils/competitorColorTheme";
import { FloatingBulkActionBar } from "./FloatingBulkActionBar";
import { CompetitorGoalImpactAnalysisModal } from "./CompetitorGoalImpactAnalysisModal";
import { Competitor3DScatterPlotModal } from "./Competitor3DScatterPlotModal";
import { CompetitorRankingD3BarChart } from "./CompetitorRankingD3BarChart";
import { SelectedCompetitorComparisonChartModal } from "./SelectedCompetitorComparisonChartModal";
import { SelectedDataDistributionD3Chart } from "./SelectedDataDistributionD3Chart";
import { CompetitorGrowthForecastD3Chart } from "./CompetitorGrowthForecastD3Chart";
import { 
  MetricFilteringPanel, 
  parseVolumeNumber, 
  parseTrafficOpportunity 
} from "./MetricFilteringPanel";
import { CompetitorSpeedScoreCards } from "./CompetitorSpeedScoreCards";
import { CompetitorPsiSparkline } from "./CompetitorPsiSparkline";
import { RowStrategicNotepad, StrategicCompetitorNote } from "./RowStrategicNotepad";
import { StrategicNotesDrawerPanel } from "./StrategicNotesDrawerPanel";
import { HeaderMetricInfoTooltip } from "./HeaderMetricInfoTooltip";
import { 
  GoalTrackingSummaryPanel, 
  GoalTrackingCell, 
  calculateGoalProgress, 
  KeywordGoalItem 
} from "./GoalTrackingModule";
import { AiStrategySummaryReportModal } from "./AiStrategySummaryReportModal";
import { TableSaveAsExportMenu } from "./TableSaveAsExportMenu";
import { TablePdfExportModal } from "./TablePdfExportModal";
import { AdvancedExportSettingsModal } from "./AdvancedExportSettingsModal";
import { 
  loadAdvancedExportSettings, 
  saveAdvancedExportSettings, 
  AdvancedExportSettings 
} from "../../utils/advancedExportConfig";
import { CompetitorPerformanceRecommendationsDrawer } from "./CompetitorPerformanceRecommendationsDrawer";
import { downloadMarketShareAndCompetitorPdf } from "../../utils/marketShareAndCompetitorPdfReport";
import { exportRankingTableToExcel } from "../../utils/competitiveSeoExcelExport";
import { 
  AutoReportSchedulerModal, 
  AutoReportScheduleConfig, 
  calculateNextDelivery 
} from "./AutoReportSchedulerModal";
import { 
  AiStrategySummaryReportData, 
  generateFallbackAiStrategySummaryReport 
} from "../../utils/aiStrategySummaryReportEngine";
import { generateCompetitorData } from "../../utils/competitiveSeoUtils";
import { CompetitorTrendForecastModule } from "./CompetitorTrendForecastModule";
import { CompetitorKeywordRowTrendSparkline } from "./CompetitorKeywordRowTrendSparkline";
import { calculateCompetitorGrowthProfiles } from "../../utils/competitorGrowthEngine";
import {
  scanTableDiscrepancies,
  getDiscrepancyCellClasses,
  DiscrepancyBadge,
  VisualDiscrepancyHighlighterPanel,
  HeatmapMiniLegend,
  DiscrepancyThreshold,
  DiscrepancyFocusFilter
} from "./VisualDiscrepancyHighlighter";
import {
  CompetitorGroupManagerPanel,
  CompetitorGroup
} from "./CompetitorGroupManagerPanel";
import {
  CompetitorKpiGoalManagerModule,
  CustomKpiGoals,
  DEFAULT_KPI_GOALS
} from "./CompetitorKpiGoalManagerModule";

export type RankingSortField = 
  | "userRank" 
  | "volume" 
  | "traffic"
  | "competitorName" 
  | "keyword" 
  | "gap" 
  | "difficulty" 
  | "comp1Rank" 
  | "comp2Rank" 
  | "comp3Rank"
  | "goalAttainment"
  | "goalDeviation"
  | "trendGrowth"
  | "manual";

/**
 * Escapes a cell value according to RFC 4180 CSV specifications:
 * - null/undefined becomes empty string ""
 * - Numbers/booleans are cleanly converted to string
 * - If string contains double quotes, commas, semicolons, newlines (\n, \r), or tabs,
 *   or starts/ends with whitespace, it is enclosed in double quotes.
 * - Any double quotes inside the string are escaped by doubling them (" -> "")
 */
export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);

  // Check if string contains characters requiring quoting:
  // quotes, commas, semicolons, newlines, carriage returns, tabs, or leading/trailing spaces
  const needsQuotes = /[",;\n\r\t]/.test(str) || str.startsWith(" ") || str.endsWith(" ");

  if (needsQuotes || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes table headers and 2D row data into a clean, RFC 4180-compliant CSV string.
 * Escapes special characters properly for each cell and joins rows with CRLF (\r\n).
 */
export function serializeTableToCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const headerLine = headers.map(escapeCsvValue).join(",");
  const rowLines = rows.map((row) => row.map(escapeCsvValue).join(","));
  return [headerLine, ...rowLines].join("\r\n");
}

export interface CsvColumnOption {
  id: string;
  label: string;
  category: "competitor" | "ranking" | "strategic";
  categoryLabel: string;
  description: string;
  exampleValue: string;
  defaultEnabled: boolean;
}

export const CSV_COLUMN_OPTIONS: CsvColumnOption[] = [
  // 1. Rakip Analiz Metrikleri (Explicitly requested by user: Rakip Adı, Domain Otoritesi, Anahtar Kelime Sayısı)
  {
    id: "competitorName",
    label: "Rakip Adı & Domain",
    category: "competitor",
    categoryLabel: "🏆 Rakip Karşılaştırma Metrikleri",
    description: "Benchmark yapılan rakip firma unvanı ve web domaini",
    exampleValue: "En Hızlı Oto Çekici 7/24 (otokurtarmacim.com)",
    defaultEnabled: true
  },
  {
    id: "domainAuthority",
    label: "Domain Otoritesi (Görünürlük Skoru)",
    category: "competitor",
    categoryLabel: "🏆 Rakip Karşılaştırma Metrikleri",
    description: "Rakip sitenin 0-100 ölçeğinde domain otorite ve SERP görünürlük puanı",
    exampleValue: "92 / 100",
    defaultEnabled: true
  },
  {
    id: "keywordCount",
    label: "Anahtar Kelime Sayısı (Rakip Erişimi)",
    category: "competitor",
    categoryLabel: "🏆 Rakip Karşılaştırma Metrikleri",
    description: "Rakip sitenin ilk 100'de sıralandığı organik kelime ve indeksli sayfa sayısı",
    exampleValue: "320 Kelime (84 Sayfa)",
    defaultEnabled: true
  },
  {
    id: "competitorStrengths",
    label: "Rakip Hız & Şema Sinyalleri",
    category: "competitor",
    categoryLabel: "🏆 Rakip Karşılaştırma Metrikleri",
    description: "Rakibin Google sayfa hızı ve yapısal veri şema skoru",
    exampleValue: "Hız: 78/100, Şema: 88/100",
    defaultEnabled: false
  },
  // 2. Anahtar Kelime & Sıralama
  {
    id: "keyword",
    label: "Anahtar Kelime (Keyword)",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "Kullanıcıların aradığı hedef arama sorgusu",
    exampleValue: "en yakın oto çekici",
    defaultEnabled: true
  },
  {
    id: "searchIntent",
    label: "Arama Niyeti (Search Intent)",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "Ticari, işlemsel, bilgi veya gezinme niyeti",
    exampleValue: "Ticari (Commercial)",
    defaultEnabled: true
  },
  {
    id: "monthlyVolume",
    label: "Aylık Arama Hacmi",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "Google'daki aylık aranma sayısı",
    exampleValue: "18.400 / ay",
    defaultEnabled: true
  },
  {
    id: "difficulty",
    label: "SEO Zorluğu (0-100)",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "İlk 10'a girme rekabet zorluğu",
    exampleValue: "64 / 100",
    defaultEnabled: true
  },
  {
    id: "userRank",
    label: "Sitenizin Sıralaması",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "Sitenizin organik SERP sıralaması",
    exampleValue: "#2 veya İlk 20'de Yok",
    defaultEnabled: true
  },
  {
    id: "comp1Rank",
    label: "1. Rakip Sırası",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "1. rakibin organik SERP sırası",
    exampleValue: "#1",
    defaultEnabled: true
  },
  {
    id: "comp2Rank",
    label: "2. Rakip Sırası",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "2. rakibin organik SERP sırası",
    exampleValue: "#3",
    defaultEnabled: true
  },
  {
    id: "comp3Rank",
    label: "3. Rakip Sırası",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "3. rakibin organik SERP sırası",
    exampleValue: "#5",
    defaultEnabled: true
  },
  {
    id: "gap",
    label: "Sıralama Farkı (Gap)",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "Lider rakiple aranızdaki sıra farkı",
    exampleValue: "2 Sıra Geride",
    defaultEnabled: true
  },
  {
    id: "status",
    label: "Durum (Status)",
    category: "ranking",
    categoryLabel: "📊 Anahtar Kelime & Sıralama Verileri",
    description: "Lider, ilk 3 veya rakip önde durumu",
    exampleValue: "Lider / Rakip Önde",
    defaultEnabled: true
  },
  // 3. Stratejik & SERP
  {
    id: "trafficOpportunity",
    label: "Trafik Fırsatı",
    category: "strategic",
    categoryLabel: "💡 Stratejik SERP & AI Öngörüleri",
    description: "İlk 3'e girilmesi halinde beklenen aylık organik trafik kazancı",
    exampleValue: "+1.250 Ziyaretçi / Ay",
    defaultEnabled: true
  },
  {
    id: "serpFeatures",
    label: "SERP Özellikleri",
    category: "strategic",
    categoryLabel: "💡 Stratejik SERP & AI Öngörüleri",
    description: "Yerel harita paketi, SSS, zengin snippet öğeleri",
    exampleValue: "Yerel Harita Paketi; SSS",
    defaultEnabled: true
  },
  {
    id: "aiRecommendation",
    label: "Gemini AI Stratejik Tavsiye",
    category: "strategic",
    categoryLabel: "💡 Stratejik SERP & AI Öngörüleri",
    description: "Rakipleri geçmek için Gemini AI tarafından oluşturulan stratejik öneri",
    exampleValue: "Yerel semt iniş sayfası oluşturun",
    defaultEnabled: true
  },
  // 4. Gelişim İzleme & Hedef Metrikleri
  {
    id: "targetRank",
    label: "Hedef Sıralama (Target Rank)",
    category: "strategic",
    categoryLabel: "🎯 Gelişim İzleme & Hedef Metrikleri",
    description: "Kullanıcı tarafından belirlenen hedef Google SERP sırası",
    exampleValue: "#1 (Liderlik)",
    defaultEnabled: true
  },
  {
    id: "goalAttainment",
    label: "Hedef Başarım Oranı (%)",
    category: "strategic",
    categoryLabel: "🎯 Gelişim İzleme & Hedef Metrikleri",
    description: "Mevcut pozisyonun hedefe göre başarım yüzdesi",
    exampleValue: "%85",
    defaultEnabled: true
  },
  {
    id: "goalDeviation",
    label: "Hedef Sapması (%)",
    category: "strategic",
    categoryLabel: "🎯 Gelişim İzleme & Hedef Metrikleri",
    description: "Belirlenen hedef sıralamadan yüzdesel sapma (+/-)",
    exampleValue: "-%15 Sapma",
    defaultEnabled: true
  }
];

export const DEFAULT_SELECTED_CSV_COLUMNS = CSV_COLUMN_OPTIONS.filter((c) => c.defaultEnabled).map((c) => c.id);

export interface SerializeRankingTableOptions {
  userName?: string;
  comp1Name?: string;
  comp2Name?: string;
  comp3Name?: string;
  competitors?: CompetitorContentMetric[];
  selectedColumnIds?: string[];
  goals?: Record<string, KeywordGoalItem>;
}

/**
 * Maps the competitor ranking table headers and current row records into a clean, escaped CSV string.
 * Supports dynamic column customization: filters only the user-selected columns,
 * including competitor metrics like 'Rakip Adı', 'Domain Otoritesi', and 'Anahtar Kelime Sayısı'.
 */
export function serializeRankingTableData(
  rankings: CompetitorKeywordRanking[],
  options: SerializeRankingTableOptions = {}
): string {
  const {
    userName = "Siteniz",
    comp1Name = "1. Rakip",
    comp2Name = "2. Rakip",
    comp3Name = "3. Rakip",
    competitors = [],
    selectedColumnIds
  } = options;

  const comp1 = competitors[0] || { name: comp1Name, domain: "rakip1.com", visibilityScore: 92, topKeywordReach: 320, indexedPages: 84, speedScore: 78, schemaScore: 88, keyStrengths: ["1500+ kelimelik rehberler"] };

  // Filter active columns based on user selection or defaults
  const activeColumns = CSV_COLUMN_OPTIONS.filter((col) => {
    if (!selectedColumnIds || selectedColumnIds.length === 0) {
      return col.defaultEnabled;
    }
    return selectedColumnIds.includes(col.id);
  });

  const headers = activeColumns.map((col) => {
    switch (col.id) {
      case "keyword": return "Anahtar Kelime (Keyword)";
      case "searchIntent": return "Arama Niyeti (Search Intent)";
      case "monthlyVolume": return "Aylık Arama Hacmi (Monthly Search Volume)";
      case "difficulty": return "SEO Zorluğu (Difficulty 0-100)";
      case "userRank": return `Siteniz (${userName}) SERP Sırası`;
      case "comp1Rank": return `1. Rakip (${comp1Name}) SERP Sırası`;
      case "comp2Rank": return `2. Rakip (${comp2Name}) SERP Sırası`;
      case "comp3Rank": return `3. Rakip (${comp3Name}) SERP Sırası`;
      case "gap": return "Sıralama Farkı (Rank Gap)";
      case "status": return "Durum (Status)";
      case "competitorName": return `Rakip Adı & Domain (1. Rakip: ${comp1.name || comp1Name})`;
      case "domainAuthority": return `Domain Otoritesi (${comp1.name || comp1Name}: ${comp1.visibilityScore || 92}/100)`;
      case "keywordCount": return `Anahtar Kelime Sayısı (${comp1.name || comp1Name}: ${comp1.topKeywordReach || 320} Kelime)`;
      case "competitorStrengths": return `Rakip Güçlü Yönleri & Teknik Sinyaller (${comp1.name || comp1Name})`;
      case "trafficOpportunity": return "Trafik Potansiyeli (Traffic Opportunity)";
      case "serpFeatures": return "SERP Özellikleri (SERP Features)";
      case "aiRecommendation": return "Gemini AI Stratejik Tavsiye (AI Recommendation)";
      case "targetRank": return "Hedeflenen Sıralama (Target Rank)";
      case "goalAttainment": return "Hedef Başarım Oranı (%)";
      case "goalDeviation": return "Hedef Sapması (%)";
      default: return col.label;
    }
  });

  const rows = rankings.map((r) => {
    const userRankDisplay = r.userRank !== null && r.userRank !== undefined ? `#${r.userRank}` : "İlk 20'de Yok";
    const comp1RankDisplay = r.comp1Rank !== null && r.comp1Rank !== undefined ? `#${r.comp1Rank}` : "-";
    const comp2RankDisplay = r.comp2Rank !== null && r.comp2Rank !== undefined ? `#${r.comp2Rank}` : "-";
    const comp3RankDisplay = r.comp3Rank !== null && r.comp3Rank !== undefined ? `#${r.comp3Rank}` : "-";

    let gapDisplay = "Sıralamada Yok (+99)";
    if (r.userRank !== null && r.userRank !== undefined) {
      if (r.gap < 0) gapDisplay = `${Math.abs(r.gap)} Sıra Önde`;
      else if (r.gap === 0) gapDisplay = "Eşit";
      else gapDisplay = `${r.gap} Sıra Geride`;
    }

    return activeColumns.map((col) => {
      switch (col.id) {
        case "keyword":
          return r.keyword || "";
        case "searchIntent":
          return r.searchIntent || "";
        case "monthlyVolume":
          return r.monthlyVolume || "";
        case "difficulty":
          return r.difficulty ?? 0;
        case "userRank":
          return userRankDisplay;
        case "comp1Rank":
          return comp1RankDisplay;
        case "comp2Rank":
          return comp2RankDisplay;
        case "comp3Rank":
          return comp3RankDisplay;
        case "gap":
          return gapDisplay;
        case "status":
          return r.status || "";
        case "competitorName":
          return (r as any).competitorName || `${comp1.name || comp1Name} (${comp1.domain || "-"})`;
        case "domainAuthority":
          return `${comp1.visibilityScore || 92} / 100`;
        case "keywordCount":
          return `${comp1.topKeywordReach || 320} Hedef Kelime (${comp1.indexedPages || 84} İndeksli Sayfa)`;
        case "competitorStrengths":
          return `Hız: ${comp1.speedScore || 78}/100; Şema: ${comp1.schemaScore || 88}/100; ${(comp1.keyStrengths || []).slice(0, 2).join(" | ")}`;
        case "trafficOpportunity":
          return r.trafficOpportunity || "";
        case "serpFeatures":
          return (r.serpFeatures || []).join("; ");
        case "aiRecommendation":
          return r.aiRecommendation || "";
        case "targetRank": {
          const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const tr = options.goals?.[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
          return `#${tr}`;
        }
        case "goalAttainment": {
          const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const tr = options.goals?.[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
          const p = calculateGoalProgress(r.userRank, tr, bestComp);
          return `%${p.attainmentPercent}`;
        }
        case "goalDeviation": {
          const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const tr = options.goals?.[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
          const p = calculateGoalProgress(r.userRank, tr, bestComp);
          return p.deviationPercent >= 0 ? `+${p.deviationPercent}%` : `${p.deviationPercent}%`;
        }
        default:
          return "";
      }
    });
  });

  return serializeTableToCsv(headers, rows);
}

export interface RowEditFormData {
  id: string;
  keyword: string;
  searchIntent: "Ticari" | "Bilgilendirici" | "Acil / Yerel" | "İşlemsel";
  monthlyVolume: string;
  difficulty: number | string;
  userRank: number | null | string;
  competitorName: string;
  comp1Rank: number | null | string;
  comp2Rank: number | null | string;
  comp3Rank: number | null | string;
  trafficOpportunity: string;
  aiRecommendation: string;
}

export interface EditValidationErrors {
  keyword?: string;
  difficulty?: string;
  monthlyVolume?: string;
  trafficOpportunity?: string;
  userRank?: string;
  comp1Rank?: string;
  comp2Rank?: string;
  comp3Rank?: string;
}

/**
 * Validates inline row edit form data metrics.
 * Ensures metrics like SEO difficulty, monthly traffic volume, opportunity, and ranks are in valid numeric formats.
 */
export function validateRowEditMetrics(
  data: RowEditFormData,
  comp1Name = "1. Rakip",
  comp2Name = "2. Rakip",
  comp3Name = "3. Rakip"
): EditValidationErrors {
  const errors: EditValidationErrors = {};

  // 1. Anahtar Kelime Doğrulaması
  if (!data.keyword || !data.keyword.trim()) {
    errors.keyword = "Hedef anahtar kelime boş bırakılamaz.";
  }

  // 2. SEO Zorluk Skoru (KD: 0-100) Doğrulaması
  const diffRaw = String(data.difficulty ?? "").trim();
  if (diffRaw === "") {
    errors.difficulty = "SEO zorluk skoru (KD) boş bırakılamaz; sayısal değer girilmelidir (0-100).";
  } else if (!/^-?\d+$/.test(diffRaw)) {
    errors.difficulty = "SEO zorluk skoru yalnızca sayısal formatta olmalıdır (örn: 45).";
  } else {
    const diffNum = parseInt(diffRaw, 10);
    if (diffNum < 0 || diffNum > 100) {
      errors.difficulty = `SEO zorluk skoru 0 ile 100 arasında olmalıdır (Girilen: ${diffNum}).`;
    }
  }

  // 3. Aylık Arama Hacmi / Trafik Doğrulaması
  const volRaw = String(data.monthlyVolume ?? "").trim();
  if (!volRaw) {
    errors.monthlyVolume = "Arama hacmi boş bırakılamaz; sayısal formatta girilmelidir (örn: 18.400 / ay).";
  } else {
    const digits = volRaw.replace(/[^0-9]/g, "");
    if (digits.length === 0) {
      errors.monthlyVolume = "Arama hacmi sayısal bir değer içermelidir (örn: 18.400 / ay veya 5000).";
    }
  }

  // 4. Trafik Fırsatı Doğrulaması
  const oppRaw = String(data.trafficOpportunity ?? "").trim();
  if (oppRaw) {
    const oppDigits = oppRaw.replace(/[^0-9]/g, "");
    if (oppDigits.length === 0) {
      errors.trafficOpportunity = "Trafik fırsatı sayısal ziyaretçi değeri içermelidir (örn: +500 Ziyaretçi/ay).";
    }
  }

  // 5. Siteniz Sıralaması Doğrulaması (Boş olabilir; doluysa 1-100 tam sayı)
  const userRankRaw = String(data.userRank ?? "").trim();
  if (userRankRaw !== "" && data.userRank !== null && data.userRank !== undefined) {
    if (!/^\d+$/.test(userRankRaw)) {
      errors.userRank = "Sıralama değeri yalnızca pozitif sayısal formatta olmalıdır (1-100).";
    } else {
      const uNum = parseInt(userRankRaw, 10);
      if (uNum < 1 || uNum > 100) {
        errors.userRank = `Sıralama 1 ile 100 arasında olmalıdır (Girilen: #${uNum}).`;
      }
    }
  }

  // 6. 1. Rakip Sıralaması Doğrulaması
  const comp1Raw = String(data.comp1Rank ?? "").trim();
  if (comp1Raw !== "" && data.comp1Rank !== null && data.comp1Rank !== undefined) {
    if (!/^\d+$/.test(comp1Raw)) {
      errors.comp1Rank = `${comp1Name} sırası yalnızca pozitif sayısal formatta olmalıdır (1-100).`;
    } else {
      const c1Num = parseInt(comp1Raw, 10);
      if (c1Num < 1 || c1Num > 100) {
        errors.comp1Rank = `${comp1Name} sırası 1-100 arasında olmalıdır (#${c1Num}).`;
      }
    }
  }

  // 7. 2. Rakip Sıralaması Doğrulaması
  const comp2Raw = String(data.comp2Rank ?? "").trim();
  if (comp2Raw !== "" && data.comp2Rank !== null && data.comp2Rank !== undefined) {
    if (!/^\d+$/.test(comp2Raw)) {
      errors.comp2Rank = `${comp2Name} sırası yalnızca pozitif sayısal formatta olmalıdır (1-100).`;
    } else {
      const c2Num = parseInt(comp2Raw, 10);
      if (c2Num < 1 || c2Num > 100) {
        errors.comp2Rank = `${comp2Name} sırası 1-100 arasında olmalıdır (#${c2Num}).`;
      }
    }
  }

  // 8. 3. Rakip Sıralaması Doğrulaması
  const comp3Raw = String(data.comp3Rank ?? "").trim();
  if (comp3Raw !== "" && data.comp3Rank !== null && data.comp3Rank !== undefined) {
    if (!/^\d+$/.test(comp3Raw)) {
      errors.comp3Rank = `${comp3Name} sırası yalnızca pozitif sayısal formatta olmalıdır (1-100).`;
    } else {
      const c3Num = parseInt(comp3Raw, 10);
      if (c3Num < 1 || c3Num > 100) {
        errors.comp3Rank = `${comp3Name} sırası 1-100 arasında olmalıdır (#${c3Num}).`;
      }
    }
  }

  return errors;
}

interface CompetitiveKeywordRankingTableProps {
  rankings?: CompetitorKeywordRanking[];
  competitors?: CompetitorContentMetric[];
  userDomain?: string;
  userName?: string;
  siteConfig?: SiteConfig;
  onApplyKeyword?: (keyword: string) => void;
  onSendToAiBlog?: (keyword: string, draftTitle?: string) => void;
  onOpenAlerts?: () => void;
  onUpdateRanking?: (updatedItem: CompetitorKeywordRanking) => void;
  onDeleteRanking?: (deletedId: string) => void;
  onDuplicateRanking?: (newItem: CompetitorKeywordRanking) => void;
  onAddRanking?: (newItem: CompetitorKeywordRanking) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const CompetitiveKeywordRankingTable: React.FC<CompetitiveKeywordRankingTableProps> = ({
  rankings = [],
  competitors = [],
  userDomain = "sitemiz.com.tr",
  userName = "Siteniz",
  siteConfig,
  onApplyKeyword,
  onSendToAiBlog,
  onOpenAlerts,
  onUpdateRanking,
  onDeleteRanking,
  onDuplicateRanking,
  onAddRanking,
  isLoading = false,
  onRefresh,
  className = ""
}) => {
  // View mode: Table view vs D3.js bar chart vs Market Share Pie Chart representation
  const [viewMode, setViewMode] = useState<"table" | "chart" | "pie">("table");
  const [isMarketSharePieVisible, setIsMarketSharePieVisible] = useState<boolean>(true);

  // Professional Market Share & Competitor PDF Report Builder Modal (Marka Logosu & Özel Notlar ile Kapsamlı Rapor)
  const [isReportBuilderModalOpen, setIsReportBuilderModalOpen] = useState<boolean>(false);
  const [reportBuilderCustomRankings, setReportBuilderCustomRankings] = useState<CompetitorKeywordRanking[] | null>(null);

  // External CSV Data Import Modal (Harici CSV dosyasından rakip verilerini otomatik eşleştirip yükleme)
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState<boolean>(false);
  const [csvModalInitialText, setCsvModalInitialText] = useState<string>("");
  const [csvModalInitialFileName, setCsvModalInitialFileName] = useState<string | null>(null);
  const [csvModalInitialFileSize, setCsvModalInitialFileSize] = useState<string | null>(null);
  const [csvModalInitialStep, setCsvModalInitialStep] = useState<number>(1);
  const [isDraggingOverTable, setIsDraggingOverTable] = useState<boolean>(false);
  const tableDragCounterRef = useRef<number>(0);

  // D3.js Grafik Serileri Renk Teması Seçici state
  const [colorTheme, setColorTheme] = useState<CompetitorColorPalette>(() => loadSavedColorTheme());
  const [isColorThemeModalOpen, setIsColorThemeModalOpen] = useState<boolean>(false);

  const handleApplyColorTheme = (newPalette: CompetitorColorPalette) => {
    setColorTheme(newPalette);
    saveColorTheme(newPalette);
  };

  // Gelişmiş Dışa Aktarma Ayarları Penceresi (PDF & JSON Özel Sıkıştırma Düzeyi ve Formatlama)
  const [isAdvancedExportModalOpen, setIsAdvancedExportModalOpen] = useState<boolean>(false);
  const [advancedExportSettings, setAdvancedExportSettings] = useState<AdvancedExportSettings>(() => loadAdvancedExportSettings());

  // Inline row edit state: enables editing competitor names and all metric values directly
  const [rowOverrides, setRowOverrides] = useState<Record<string, Partial<CompetitorKeywordRanking> & { competitorName?: string }>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<RowEditFormData | null>(null);
  const [editValidationErrors, setEditValidationErrors] = useState<EditValidationErrors>({});
  const [editValidationBanner, setEditValidationBanner] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Deleted row state: allows single-click complete removal of competitor rows from the table
  const [deletedRowIds, setDeletedRowIds] = useState<string[]>([]);

  // Cloned / duplicated row state: allows instant copy of any competitor row into a new row in the table
  const [clonedRows, setClonedRows] = useState<{ afterId: string; item: CompetitorKeywordRanking }[]>([]);
  const [recentlyClonedId, setRecentlyClonedId] = useState<string | null>(null);

  // Added empty rows state: allows adding new blank competitor rows to the bottom of the table
  const [addedRows, setAddedRows] = useState<CompetitorKeywordRanking[]>([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Collapsible Editing Toolbar state (Düzenleme Araç Çubuğu: tablo başlıklarına ve satır bazlı düzenleme moduna hızlı erişim)
  const [isEditToolbarOpen, setIsEditToolbarOpen] = useState<boolean>(true);
  const [quickEditRowSelection, setQuickEditRowSelection] = useState<string>("");

  // Fallback data generation if props are empty
  const fallbackData = useMemo(() => {
    if (rankings && rankings.length > 0 && competitors && competitors.length > 0) {
      return null;
    }
    return generateCompetitorData(siteConfig || ({
      companyName: userName || "Siteniz",
      city: "İstanbul",
      sector: "Oto Kurtarma"
    } as SiteConfig));
  }, [rankings, competitors, siteConfig, userName]);

  const baseRankings = useMemo(() => {
    return (rankings && rankings.length > 0) ? rankings : (fallbackData?.keywordRankings || []);
  }, [rankings, fallbackData]);

  const effectiveRankings = useMemo(() => {
    // 1. Start with baseRankings and insert cloned rows right after their target row
    let list = [...baseRankings];

    for (const clone of clonedRows) {
      const idx = list.findIndex((r) => r.id === clone.afterId);
      if (idx !== -1) {
        list.splice(idx + 1, 0, clone.item);
      } else {
        list.push(clone.item);
      }
    }

    // 2. Append newly added empty competitor rows to the bottom of the table
    if (addedRows.length > 0) {
      list = [...list, ...addedRows];
    }

    // 3. Exclude rows deleted by the user
    if (deletedRowIds.length > 0) {
      list = list.filter((r) => !deletedRowIds.includes(r.id));
    }

    // 4. Apply any custom cell/metric overrides
    if (Object.keys(rowOverrides).length === 0) return list;
    return list.map((r) => {
      const override = rowOverrides[r.id];
      return override ? ({ ...r, ...override } as CompetitorKeywordRanking) : r;
    });
  }, [baseRankings, clonedRows, addedRows, rowOverrides, deletedRowIds]);

  const effectiveCompetitors = useMemo(() => {
    return (competitors && competitors.length > 0) ? competitors : (fallbackData?.competitors || []);
  }, [competitors, fallbackData]);

  // Algorithmic 6-Month Competitor Growth & Trend Profiles
  const competitorGrowthProfiles = useMemo(() => {
    return calculateCompetitorGrowthProfiles(
      effectiveRankings,
      effectiveCompetitors,
      userName,
      userDomain,
      colorTheme
    );
  }, [effectiveRankings, effectiveCompetitors, userName, userDomain, colorTheme]);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "selected" | "with_notes" | "outranked" | "leading" | "competing" | "trailing" | "missing">("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [topEntityFilter, setTopEntityFilter] = useState<"all" | "top5_overall" | "comp1" | "comp2" | "comp3">("all");
  const [sortBy, setSortBy] = useState<RankingSortField>("userRank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Row Drag-and-Drop Reordering State & Manual Row Order
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(null);
  const [lastManualOrderBackup, setLastManualOrderBackup] = useState<string[] | null>(null);

  const [manualRowOrder, setManualRowOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`seo_manual_row_order_${userDomain}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to load saved manual row order:", err);
    }
    return [];
  });

  // Strategic Competitor Notes state (persisted to localStorage)
  const [strategicNotes, setStrategicNotes] = useState<Record<string, StrategicCompetitorNote>>(() => {
    try {
      const saved = localStorage.getItem("seo_competitor_strategic_notes");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error("Failed to parse saved competitor notes:", err);
    }
    return {
      "1": {
        text: "1. Rakip bu kelimede agresif blog yayını yapıyor fakat mobil hızı zayıf (62/100). Hızlı sayfa ve detaylı fiyatlandırma tablosu ile #1 pozisyon rahatlıkla alınabilir.",
        updatedAt: "Bugün 14:15",
        tags: ["⚡ Hızlı Kazanım", "📝 İçerik Boşluğu"]
      },
      "2": {
        text: "Düşük SEO zorluğu (KD 28). Doğrudan landing page hedefleyip Google Ads yerine organik arama trafiğini çekelim.",
        updatedAt: "Dün 16:40",
        tags: ["🚨 Kritik Rakip", "⚡ Hızlı Kazanım"]
      }
    };
  });

  // Track which competitor rows have their inline notepad open
  const [openNotepadIds, setOpenNotepadIds] = useState<Set<string>>(new Set());
  const [noteSaveToast, setNoteSaveToast] = useState<{ id: string; message: string } | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredNoteButtonId, setHoveredNoteButtonId] = useState<string | null>(null);
  const [isStrategicNotesDrawerOpen, setIsStrategicNotesDrawerOpen] = useState<boolean>(false);

  // Toggle inline notepad open/closed for a row
  const toggleNotepad = (id: string) => {
    setOpenNotepadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Save strategic note for a row
  const handleSaveNote = (id: string, text: string, tags?: string[]) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timeStr = `Bugün ${hours}:${minutes}`;

    setStrategicNotes((prev) => {
      const updated = {
        ...prev,
        [id]: {
          text: text.trim(),
          updatedAt: timeStr,
          tags: tags || prev[id]?.tags || []
        }
      };
      try {
        localStorage.setItem("seo_competitor_strategic_notes", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save competitor note to localStorage:", e);
      }
      return updated;
    });

    setNoteSaveToast({ id, message: "Stratejik not kaydedildi!" });
    setTimeout(() => {
      setNoteSaveToast((cur) => (cur?.id === id ? null : cur));
    }, 2500);
  };

  // Delete strategic note for a row
  const handleDeleteNote = (id: string) => {
    setStrategicNotes((prev) => {
      const copy = { ...prev };
      delete copy[id];
      try {
        localStorage.setItem("seo_competitor_strategic_notes", JSON.stringify(copy));
      } catch (e) {
        console.error("Failed to delete competitor note from localStorage:", e);
      }
      return copy;
    });

    setNoteSaveToast({ id, message: "Not silindi." });
    setTimeout(() => {
      setNoteSaveToast((cur) => (cur?.id === id ? null : cur));
    }, 2000);
  };

  // Count of items that have active strategic notes
  const notesCount = useMemo(() => {
    return (Object.values(strategicNotes) as (StrategicCompetitorNote | undefined)[]).filter(
      (n) => Boolean(n?.text?.trim())
    ).length;
  }, [strategicNotes]);

  // Jump to row from Strategic Notes Drawer with smooth scroll and highlight
  const handleJumpToRowFromDrawer = (rowId: string) => {
    setIsStrategicNotesDrawerOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`row-${rowId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-amber-400", "bg-amber-100/90");
        setHoveredRowId(rowId);
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-amber-400", "bg-amber-100/90");
          setHoveredRowId((prev) => (prev === rowId ? null : prev));
        }, 3000);
      }
    }, 150);
  };

  // Dynamic Metric Filtering Panel states
  const [minVolume, setMinVolume] = useState<number>(0);
  const [minDifficulty, setMinDifficulty] = useState<number>(0);
  const [minTrafficOpportunity, setMinTrafficOpportunity] = useState<number>(0);
  const [maxRankLimit, setMaxRankLimit] = useState<number | null>(null);
  const [activeMetricPreset, setActiveMetricPreset] = useState<string | null>(null);
  const [isMetricFilterPanelOpen, setIsMetricFilterPanelOpen] = useState<boolean>(true);

  // Core Web Vitals & Google PageSpeed Insights Speed Score Cards state
  const [isSpeedScoreCardsOpen, setIsSpeedScoreCardsOpen] = useState<boolean>(true);
  const [highlightedCompetitorSpeedId, setHighlightedCompetitorSpeedId] = useState<string | null>(null);

  // Goal Tracking Mode (Gelişim İzleme Modu) State
  const [isGoalTrackingMode, setIsGoalTrackingMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("seo_goal_tracking_mode");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [keywordGoals, setKeywordGoals] = useState<Record<string, KeywordGoalItem>>(() => {
    try {
      const saved = localStorage.getItem("seo_keyword_goals");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse keyword goals from localStorage:", e);
    }
    return {};
  });

  // Handler to update a single keyword target rank
  const handleUpdateTarget = (itemId: string, targetRank: number) => {
    setKeywordGoals((prev) => {
      const updated: Record<string, KeywordGoalItem> = {
        ...prev,
        [itemId]: {
          itemId,
          targetRank,
          updatedAt: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem("seo_keyword_goals", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save keyword goals:", e);
      }
      return updated;
    });
  };

  // Handler to apply bulk target rank across all visible/effective items
  const handleApplyBulkTarget = (targetRank: number) => {
    setKeywordGoals((prev) => {
      const updated: Record<string, KeywordGoalItem> = { ...prev };
      effectiveRankings.forEach((r) => {
        updated[r.id] = {
          itemId: r.id,
          targetRank,
          updatedAt: new Date().toISOString()
        };
      });
      try {
        localStorage.setItem("seo_keyword_goals", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save bulk keyword goals:", e);
      }
      return updated;
    });
  };

  // Handler to dynamically set target = Math.max(1, bestCompRank - 1) for each item
  const handleApplyDynamicBeatCompetitorTargets = () => {
    setKeywordGoals((prev) => {
      const updated: Record<string, KeywordGoalItem> = { ...prev };
      effectiveRankings.forEach((r) => {
        const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
        const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
        const targetRank = Math.max(1, bestComp - 1);
        updated[r.id] = {
          itemId: r.id,
          targetRank,
          updatedAt: new Date().toISOString()
        };
      });
      try {
        localStorage.setItem("seo_keyword_goals", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save dynamic beat competitor targets:", e);
      }
      return updated;
    });
  };

  // Handler to reset all keyword targets
  const handleResetGoals = () => {
    setKeywordGoals({});
    try {
      localStorage.removeItem("seo_keyword_goals");
    } catch (_) {}
  };

  // Diff View Mode (Farklılıkları Vurgula Modu) State
  const [isDiffViewMode, setIsDiffViewMode] = useState<boolean>(false);
  const [diffBaselineId, setDiffBaselineId] = useState<string>("");

  const handleToggleDiffView = () => {
    setIsDiffViewMode((prev) => {
      const next = !prev;
      if (next) {
        if (selectedIds.size < 2 && effectiveRankings.length >= 2) {
          const autoSelected = new Set([effectiveRankings[0].id, effectiveRankings[1].id]);
          setSelectedIds(autoSelected);
          setDiffBaselineId(effectiveRankings[0].id);
        } else if (selectedIds.size >= 2) {
          const firstSelected = Array.from(selectedIds)[0];
          if (!diffBaselineId || !selectedIds.has(diffBaselineId)) {
            setDiffBaselineId(firstSelected);
          }
        }
        setTimeout(() => {
          const el = document.getElementById("diff-view-highlight-panel");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
      return next;
    });
  };

  // 6-Month Trend Forecast Module & Column State
  const [isTrendForecastModuleOpen, setIsTrendForecastModuleOpen] = useState<boolean>(true);
  const [isTrendColumnVisible, setIsTrendColumnVisible] = useState<boolean>(true);

  const handleToggleTrendForecastModule = () => {
    setIsTrendForecastModuleOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsTrendColumnVisible(true);
        setTimeout(() => {
          const el = document.getElementById("seo-competitor-trend-forecast-module");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
      return next;
    });
  };

  // Görsel Farklılık Vurgulayıcı (%20+ Otomatik Tarayıcı) State
  const [isVisualDiscrepancyMode, setIsVisualDiscrepancyMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("seo_visual_discrepancy_mode");
      return saved !== null ? saved === "true" : true; // default active
    } catch {
      return true;
    }
  });
  const [discrepancyThreshold, setDiscrepancyThreshold] = useState<DiscrepancyThreshold>(20);
  const [discrepancyFocusFilter, setDiscrepancyFocusFilter] = useState<DiscrepancyFocusFilter>("all");
  const [onlyShowDiscrepancyRows, setOnlyShowDiscrepancyRows] = useState<boolean>(false);
  const [isDiscrepancyPulseEnabled, setIsDiscrepancyPulseEnabled] = useState<boolean>(true);

  const handleToggleVisualDiscrepancyMode = () => {
    setIsVisualDiscrepancyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("seo_visual_discrepancy_mode", String(next));
      } catch (_) {}
      if (next) {
        setTimeout(() => {
          const el = document.getElementById("visual-discrepancy-highlighter-panel");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
      return next;
    });
  };

  // Automatic computation of all metric variances across table
  const discrepancyAnalysis = useMemo(() => {
    return scanTableDiscrepancies(effectiveRankings, discrepancyThreshold, effectiveCompetitors);
  }, [effectiveRankings, discrepancyThreshold, effectiveCompetitors]);

  // Rakip Grubu Oluştur & Performans Ortalamaları Paneli State
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState<boolean>(true);
  const [activeGroupFilter, setActiveGroupFilter] = useState<string | null>(null);
  const [competitorGroups, setCompetitorGroups] = useState<CompetitorGroup[]>(() => {
    try {
      const saved = localStorage.getItem(`seo_competitor_groups_${userDomain || "default"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const handleToggleGroupManager = () => {
    setIsGroupManagerOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          const el = document.getElementById("competitor-group-manager-panel");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
      return next;
    });
  };

  // Keep competitorGroups updated when localStorage updates
  const refreshCompetitorGroups = () => {
    try {
      const saved = localStorage.getItem(`seo_competitor_groups_${userDomain || "default"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompetitorGroups(parsed);
      }
    } catch (_) {}
  };

  // Özel KPI Hedef Belirleme & Rakip Kıyaslama Modülü State
  const [isKpiGoalModuleOpen, setIsKpiGoalModuleOpen] = useState<boolean>(true);
  const [customKpiGoals, setCustomKpiGoals] = useState<CustomKpiGoals>(() => {
    try {
      const saved = localStorage.getItem(`seo_competitor_kpi_goals_${userDomain || "default"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_KPI_GOALS, ...parsed };
      }
    } catch (_) {}
    return DEFAULT_KPI_GOALS;
  });

  const handleToggleKpiGoalModule = () => {
    setIsKpiGoalModuleOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          const el = document.getElementById("competitor-kpi-goal-manager-module");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
      return next;
    });
  };

  // AI Strategy Summary Report State & Handlers
  const [isStrategyReportModalOpen, setIsStrategyReportModalOpen] = useState<boolean>(false);
  const [strategyReportData, setStrategyReportData] = useState<AiStrategySummaryReportData | null>(null);
  const [isGeneratingStrategyReport, setIsGeneratingStrategyReport] = useState<boolean>(false);

  const handleGenerateStrategyReport = async () => {
    setIsGeneratingStrategyReport(true);
    try {
      const response = await fetch("/api/seo-strategy-summary-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rankings: effectiveRankings,
          competitors: effectiveCompetitors,
          userName: siteConfig?.companyName || userName || "JetKur",
          userDomain: siteConfig?.customDomain || userDomain || "jetkur.com.tr",
          userSpeedScore: 98,
          keywordGoals,
          strategicNotes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setStrategyReportData(result.data);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.warn("API call failed or offline, generating comprehensive algorithmic fallback report:", err);
      const fallback = generateFallbackAiStrategySummaryReport({
        rankings: effectiveRankings,
        competitors: effectiveCompetitors,
        userName: siteConfig?.companyName || userName || "JetKur",
        userDomain: siteConfig?.customDomain || userDomain || "jetkur.com.tr",
        userSpeedScore: 98,
        keywordGoals,
        strategicNotes
      });
      setStrategyReportData(fallback);
    } finally {
      setIsGeneratingStrategyReport(false);
    }
  };

  const handleOpenStrategyReport = () => {
    setIsStrategyReportModalOpen(true);
    if (!strategyReportData) {
      handleGenerateStrategyReport();
    }
  };

  // Active Metric Rules Count
  const activeMetricFiltersCount = useMemo(() => {
    return (
      (minVolume > 0 ? 1 : 0) +
      (minDifficulty > 0 ? 1 : 0) +
      (minTrafficOpportunity > 0 ? 1 : 0) +
      (maxRankLimit !== null ? 1 : 0) +
      (activeMetricPreset ? 1 : 0)
    );
  }, [minVolume, minDifficulty, minTrafficOpportunity, maxRankLimit, activeMetricPreset]);

  // Preset Handler
  const handleApplyMetricPreset = (presetId: string) => {
    if (activeMetricPreset === presetId) {
      // Toggle off preset
      setActiveMetricPreset(null);
      setMinVolume(0);
      setMinDifficulty(0);
      setMinTrafficOpportunity(0);
      setMaxRankLimit(null);
      return;
    }
    setActiveMetricPreset(presetId);
    if (presetId === "high_volume") {
      setMinVolume(1000);
      setMinDifficulty(0);
      setMinTrafficOpportunity(0);
      setMaxRankLimit(null);
      setSortBy("volume");
      setSortOrder("desc");
    } else if (presetId === "quick_wins") {
      setMinVolume(800);
      setMinDifficulty(0);
      setMinTrafficOpportunity(0);
      setMaxRankLimit(null);
      setSortBy("difficulty");
      setSortOrder("asc");
    } else if (presetId === "top_rankings") {
      setMinVolume(0);
      setMinDifficulty(0);
      setMinTrafficOpportunity(0);
      setMaxRankLimit(10);
      setSortBy("userRank");
      setSortOrder("asc");
    } else if (presetId === "high_traffic_gain") {
      setMinVolume(0);
      setMinDifficulty(0);
      setMinTrafficOpportunity(200);
      setMaxRankLimit(null);
      setSortBy("traffic");
      setSortOrder("desc");
    }
  };

  // Reset All Metric Filters Handler
  const handleResetAllMetricFilters = () => {
    setMinVolume(0);
    setMinDifficulty(0);
    setMinTrafficOpportunity(0);
    setMaxRankLimit(null);
    setActiveMetricPreset(null);
    setSortBy("userRank");
    setSortOrder("asc");
  };
  
  // Interactive Column Header Sorting Handler
  const handleHeaderSort = (field: RankingSortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      // Sensible default directions:
      // Search volume, Gap, Goal Attainment, and Trend Growth are best viewed highest first (desc)
      // Ranks and Names are best viewed ascending (#1 best rank, A-Z)
      if (field === "volume" || field === "gap" || field === "goalAttainment" || field === "trendGrowth") {
        setSortOrder("desc");
      } else {
        setSortOrder("asc");
      }
    }
  };

  // Helper to render responsive sorting icon
  const renderSortIcon = (field: RankingSortField) => {
    const isActive = sortBy === field;
    return (
      <span 
        className={`inline-flex items-center ml-1 p-0.5 rounded transition-all shrink-0 ${
          isActive 
            ? "text-amber-300 bg-amber-400/20" 
            : "text-slate-400/60 group-hover:text-amber-300"
        }`}
      >
        {isActive ? (
          sortOrder === "asc" ? (
            <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5" />
        )}
      </span>
    );
  };
  
  // Interaction State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);
  const [isCsvCopied, setIsCsvCopied] = useState<boolean>(false);

  // PDF Export Modal State
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState<boolean>(false);
  const [pdfExportData, setPdfExportData] = useState<CompetitorKeywordRanking[]>([]);
  const [pdfExportScopeLabel, setPdfExportScopeLabel] = useState<string>("Tüm Tablo Verileri");

  const handleOpenPdfExportModal = (data: CompetitorKeywordRanking[], scopeLabel: string) => {
    setPdfExportData(data);
    setPdfExportScopeLabel(scopeLabel);
    setIsPdfExportModalOpen(true);
  };

  // Automated Weekly Report Scheduler State
  const [isAutoReportModalOpen, setIsAutoReportModalOpen] = useState<boolean>(false);

  // Impact Analysis & Correlation Heatmap Modal State
  const [isImpactAnalysisModalOpen, setIsImpactAnalysisModalOpen] = useState<boolean>(false);

  // 3D Scatter Correlation & Market Positioning Modal State
  const [is3DScatterModalOpen, setIs3DScatterModalOpen] = useState<boolean>(false);

  // Competitor Performance Recommendations Drawer State
  const [isRecommendationsDrawerOpen, setIsRecommendationsDrawerOpen] = useState<boolean>(false);
  const [selectedCompetitorForRecommendations, setSelectedCompetitorForRecommendations] = useState<string | null>(null);

  // One-Click Market Share & Competitor Benchmark PDF Generation State
  const [isGeneratingMarketSharePdf, setIsGeneratingMarketSharePdf] = useState<boolean>(false);

  const handleDownloadMarketSharePdf = async () => {
    if (isGeneratingMarketSharePdf) return;
    setIsGeneratingMarketSharePdf(true);
    setDownloadNotification("Pazar Payı ve Rekabet Analiz Raporu oluşturuluyor...");
    try {
      const filename = await downloadMarketShareAndCompetitorPdf(
        effectiveRankings,
        effectiveCompetitors,
        userName,
        userDomain,
        {
          companyName: userName,
          domain: userDomain,
          sector: siteConfig?.sector || "E-Ticaret & Yerel Hizmetler"
        }
      );
      setDownloadNotification(`Pazar Payı ve Rekabet Analiz Raporu (${filename}) başarıyla indirildi.`);
      setTimeout(() => setDownloadNotification(null), 4500);
    } catch (err) {
      console.error("Market Share PDF error:", err);
      setDownloadNotification("Rapor oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.");
      setTimeout(() => setDownloadNotification(null), 4000);
    } finally {
      setIsGeneratingMarketSharePdf(false);
    }
  };

  // Export ONLY Selected Rows to PDF (Seçilileri PDF Yap)
  const handleDownloadSelectedPdf = async () => {
    if (selectedRankings.length === 0 || isGeneratingMarketSharePdf) return;
    setIsGeneratingMarketSharePdf(true);
    setDownloadNotification(`Seçili ${selectedRankings.length} anahtar kelime için PDF raporu hazırlanıyor...`);
    try {
      const filename = await downloadMarketShareAndCompetitorPdf(
        selectedRankings,
        effectiveCompetitors,
        userName,
        userDomain,
        {
          companyName: userName,
          domain: userDomain,
          reportTitle: `Seçili Anahtar Kelimeler & Pazar Payı Raporu (${selectedRankings.length} Kelime)`,
          sector: siteConfig?.sector || "E-Ticaret & Yerel Hizmetler"
        }
      );
      setDownloadNotification(`Seçili ${selectedRankings.length} kelime için PDF raporu (${filename}) başarıyla indirildi.`);
      setTimeout(() => setDownloadNotification(null), 4500);
    } catch (err) {
      console.error("Selected PDF download error:", err);
      // Fallback to table PDF modal
      handleOpenPdfExportModal(selectedRankings, `Seçili ${selectedRankings.length} Anahtar Kelime`);
    } finally {
      setIsGeneratingMarketSharePdf(false);
    }
  };

  // Open Custom Report Builder for Selected Rows
  const handleOpenSelectedReportBuilder = () => {
    if (selectedRankings.length === 0) return;
    setReportBuilderCustomRankings(selectedRankings);
    setIsReportBuilderModalOpen(true);
  };

  // Handle CSV Import Completion
  const handleCsvImportComplete = (
    newRankings: CompetitorKeywordRanking[],
    mode: CsvImportMode,
    stats: { totalParsed: number; addedCount: number; updatedCount: number }
  ) => {
    if (newRankings.length === 0) return;

    if (mode === "replace") {
      const allExistingIds = baseRankings.map((r) => r.id);
      setDeletedRowIds(allExistingIds);
      setClonedRows([]);
      setRowOverrides({});
      setAddedRows(newRankings);
      setDownloadNotification(`Tablo sıfırlandı ve CSV'den ${newRankings.length} anahtar kelime yüklendi.`);
    } else if (mode === "append") {
      setAddedRows((prev) => [...prev, ...newRankings]);
      setDownloadNotification(`CSV'den ${newRankings.length} yeni anahtar kelime tablonun sonuna eklendi.`);
    } else {
      // Smart Upsert
      const existingKeywordMap = new Map<string, string>();
      effectiveRankings.forEach((r) => {
        existingKeywordMap.set(r.keyword.toLowerCase().trim(), r.id);
      });

      const itemsToAppend: CompetitorKeywordRanking[] = [];
      const newOverrides: Record<string, Partial<CompetitorKeywordRanking>> = {};

      newRankings.forEach((item) => {
        const cleanKw = item.keyword.toLowerCase().trim();
        const matchId = existingKeywordMap.get(cleanKw);
        if (matchId) {
          newOverrides[matchId] = {
            monthlyVolume: item.monthlyVolume,
            difficulty: item.difficulty,
            userRank: item.userRank,
            comp1Rank: item.comp1Rank,
            comp2Rank: item.comp2Rank,
            comp3Rank: item.comp3Rank,
            status: item.status,
            gap: item.gap,
            trafficOpportunity: item.trafficOpportunity,
            aiRecommendation: item.aiRecommendation,
            serpFeatures: item.serpFeatures,
            searchIntent: item.searchIntent
          };
        } else {
          itemsToAppend.push(item);
        }
      });

      if (Object.keys(newOverrides).length > 0) {
        setRowOverrides((prev) => ({ ...prev, ...newOverrides }));
      }
      if (itemsToAppend.length > 0) {
        setAddedRows((prev) => [...prev, ...itemsToAppend]);
      }

      const updatedCount = Object.keys(newOverrides).length;
      const addedCount = itemsToAppend.length;
      setDownloadNotification(
        `CSV verileri akıllıca birleştirildi: ${updatedCount} mevcut kelime güncellendi, ${addedCount} yeni kelime tabloya eklendi.`
      );
    }

    setTimeout(() => {
      setDownloadNotification(null);
    }, 5500);

    if (searchTerm) setSearchTerm("");
  };

  // Handlers for dropping CSV directly onto the table or via Quick Upload Bar
  const handleProcessCsvFile = (file: File) => {
    if (!file) return;
    setCsvModalInitialFileName(file.name);
    setCsvModalInitialFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCsvModalInitialText(content);
        setCsvModalInitialStep(2); // Jump directly to Veri Eşleştirme Sihirbazı (Step 2)!
        setIsCsvImportModalOpen(true);
        setDownloadNotification(`"${file.name}" yüklendi. Veri Eşleştirme Sihirbazı hazır.`);
        setTimeout(() => setDownloadNotification(null), 4500);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleTableDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      tableDragCounterRef.current += 1;
      setIsDraggingOverTable(true);
    }
  };

  const handleTableDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTableDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      tableDragCounterRef.current -= 1;
      if (tableDragCounterRef.current <= 0) {
        setIsDraggingOverTable(false);
        tableDragCounterRef.current = 0;
      }
    }
  };

  const handleTableDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOverTable(false);
      tableDragCounterRef.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleProcessCsvFile(file);
      }
    }
  };

  // --- TABLE ROW DRAG-AND-DROP REORDERING LOGIC ---
  const reorderRows = (draggedId: string, targetId: string, position: "above" | "below") => {
    if (draggedId === targetId) return;

    const allEffectiveIds = effectiveRankings.map((r) => r.id);
    let currentOrder: string[];

    if (manualRowOrder.length > 0) {
      currentOrder = [
        ...manualRowOrder.filter((id) => allEffectiveIds.includes(id)),
        ...allEffectiveIds.filter((id) => !manualRowOrder.includes(id))
      ];
    } else {
      const visibleIds = filteredAndSortedRankings.map((r) => r.id);
      const remainingIds = allEffectiveIds.filter((id) => !visibleIds.includes(id));
      currentOrder = [...visibleIds, ...remainingIds];
    }

    const fromIdx = currentOrder.indexOf(draggedId);
    const toIdx = currentOrder.indexOf(targetId);

    if (fromIdx === -1 || toIdx === -1) return;

    const previousOrder = [...currentOrder];
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(fromIdx, 1);
    const targetIdx = newOrder.indexOf(targetId);
    const insertIdx = position === "above" ? targetIdx : targetIdx + 1;
    newOrder.splice(insertIdx, 0, removed);

    setManualRowOrder(newOrder);
    setLastManualOrderBackup(previousOrder);
    setSortBy("manual");
    setSortOrder("asc");

    try {
      localStorage.setItem(`seo_manual_row_order_${userDomain}`, JSON.stringify(newOrder));
    } catch {
      // ignore
    }

    const item = effectiveRankings.find((r) => r.id === draggedId);
    const kw = item?.keyword || "Satır";
    setSaveToast(`"${kw}" başarıyla ${insertIdx + 1}. sıraya taşındı.`);
    setTimeout(() => setSaveToast(null), 5000);
  };

  const moveRow = (id: string, direction: "up" | "down") => {
    const visibleIds = filteredAndSortedRankings.map((r) => r.id);
    const currentIdx = visibleIds.indexOf(id);
    if (currentIdx === -1) return;

    if (direction === "up" && currentIdx > 0) {
      const targetId = visibleIds[currentIdx - 1];
      reorderRows(id, targetId, "above");
    } else if (direction === "down" && currentIdx < visibleIds.length - 1) {
      const targetId = visibleIds[currentIdx + 1];
      reorderRows(id, targetId, "below");
    }
  };

  const handleUndoReorder = () => {
    if (!lastManualOrderBackup) return;
    setManualRowOrder(lastManualOrderBackup);
    try {
      localStorage.setItem(`seo_manual_row_order_${userDomain}`, JSON.stringify(lastManualOrderBackup));
    } catch {}
    setSaveToast("Satır taşıma işlemi geri alındı.");
    setLastManualOrderBackup(null);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleResetManualOrder = () => {
    setManualRowOrder([]);
    setLastManualOrderBackup(null);
    setSortBy("userRank");
    setSortOrder("asc");
    try {
      localStorage.removeItem(`seo_manual_row_order_${userDomain}`);
    } catch {}
    setSaveToast("Satır sıralaması varsayılan düzene (Sitenizin Sıralaması) sıfırlandı.");
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleRowDragStart = (e: React.DragEvent, id: string) => {
    setDraggedRowId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.setData("application/x-keyword-row", id);
  };

  const handleRowDragOver = (e: React.DragEvent, id: string) => {
    if (!draggedRowId || draggedRowId === id) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? "above" : "below";

    if (dragOverRowId !== id || dropPosition !== pos) {
      setDragOverRowId(id);
      setDropPosition(pos);
    }
  };

  const handleRowDragEnter = (e: React.DragEvent, id: string) => {
    if (!draggedRowId || draggedRowId === id) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRowDragLeave = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverRowId === id) {
      setDragOverRowId(null);
      setDropPosition(null);
    }
  };

  const handleRowDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedRowId && draggedRowId !== targetId) {
      reorderRows(draggedRowId, targetId, dropPosition || "below");
    }
    setDraggedRowId(null);
    setDragOverRowId(null);
    setDropPosition(null);
  };

  const handleRowDragEnd = () => {
    setDraggedRowId(null);
    setDragOverRowId(null);
    setDropPosition(null);
  };

  const handleQuickUploadSample = () => {
    const csvContent = generateSampleCsvTemplate(
      userName,
      effectiveCompetitors[0]?.name || "1. Rakip",
      effectiveCompetitors[1]?.name || "2. Rakip",
      effectiveCompetitors[2]?.name || "3. Rakip"
    );
    setCsvModalInitialText(csvContent);
    setCsvModalInitialFileName("ornek-rakip-verileri.csv");
    setCsvModalInitialFileSize("1.4 KB");
    setCsvModalInitialStep(2);
    setIsCsvImportModalOpen(true);
    setDownloadNotification("Örnek rakip verileri yüklendi. Veri Eşleştirme Sihirbazı açıldı.");
    setTimeout(() => setDownloadNotification(null), 4500);
  };

  const handleOpenWizardDirectly = () => {
    setCsvModalInitialStep(1);
    setIsCsvImportModalOpen(true);
  };
  const [autoReportConfig, setAutoReportConfig] = useState<AutoReportScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem("seo_weekly_auto_report_schedule_config");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      enabled: true,
      frequency: "weekly",
      dayOfWeek: 1, // Pazartesi
      deliveryTime: "09:00",
      recipientEmail: siteConfig?.email || "selimoyan@gmail.com",
      ccEmails: "yonetim@jetkur.com.tr",
      format: "both",
      scope: "all",
      includeAiSummary: true,
      includeCriticalChanges: true,
      emailSubjectTemplate: `[Haftalık SEO Özeti] ${userDomain} Rakip Sıralama & Fırsat Analizi`
    };
  });

  const autoReportNextDelivery = useMemo(() => {
    return calculateNextDelivery(autoReportConfig.dayOfWeek, autoReportConfig.deliveryTime);
  }, [autoReportConfig.dayOfWeek, autoReportConfig.deliveryTime]);

  // CSV Column Customization State
  const [selectedCsvColumns, setSelectedCsvColumns] = useState<string[]>(DEFAULT_SELECTED_CSV_COLUMNS);
  const [isCustomizeColumnsOpen, setIsCustomizeColumnsOpen] = useState<boolean>(false);

  const toggleCsvColumn = (id: string) => {
    setSelectedCsvColumns((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          setDownloadNotification("CSV dışa aktarımında en az 1 sütun seçili kalmalıdır.");
          setTimeout(() => setDownloadNotification(null), 3000);
          return prev;
        }
        return prev.filter((colId) => colId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllCsvColumns = () => {
    setSelectedCsvColumns(CSV_COLUMN_OPTIONS.map((c) => c.id));
  };

  const handleResetCsvColumns = () => {
    setSelectedCsvColumns(DEFAULT_SELECTED_CSV_COLUMNS);
  };

  const handleSelectCompetitorPreset = () => {
    // Specifically selects competitor metrics as requested by user (Rakip Adı, Domain Otoritesi, Anahtar Kelime Sayısı)
    setSelectedCsvColumns([
      "keyword",
      "competitorName",
      "domainAuthority",
      "keywordCount",
      "userRank",
      "comp1Rank",
      "gap",
      "status"
    ]);
  };

  // Checkbox & Bulk Comparison State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  // Competitor headers
  const comp1 = effectiveCompetitors[0] || { name: "1. Rakip", domain: "rakip1.com", rank: 1 };
  const comp2 = effectiveCompetitors[1] || { name: "2. Rakip", domain: "rakip2.com", rank: 2 };
  const comp3 = effectiveCompetitors[2] || { name: "3. Rakip", domain: "rakip3.com", rank: 3 };

  // Calculate High-level Summary Metrics
  const summaryMetrics = useMemo(() => {
    let leadingCount = 0;
    let competingCount = 0;
    let trailingCount = 0;
    let missingCount = 0;
    let outrankedCount = 0;
    let totalEstTrafficClicks = 0;

    effectiveRankings.forEach((r) => {
      const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null);
      const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      const isOutranked = r.userRank === null || r.userRank > bestComp;
      if (isOutranked) {
        outrankedCount++;
      }

      if (r.userRank === 1 || (r.userRank && r.gap < 0)) {
        leadingCount++;
      } else if (r.userRank && r.userRank <= 4) {
        competingCount++;
      } else if (r.userRank && r.userRank > 4) {
        trailingCount++;
      } else {
        missingCount++;
      }

      // Parse approximate monthly volume numbers
      const volNum = parseInt(r.monthlyVolume.replace(/[^0-9]/g, "") || "0", 10);
      const isK = r.monthlyVolume.toLowerCase().includes("k");
      const cleanVol = isK ? volNum * 1000 : volNum;
      if (r.userRank !== 1) {
        totalEstTrafficClicks += Math.round(cleanVol * 0.12);
      }
    });

    return {
      total: effectiveRankings.length,
      leadingCount,
      competingCount,
      trailingCount,
      missingCount,
      outrankedCount,
      trafficPotential: totalEstTrafficClicks > 0 ? `+${totalEstTrafficClicks.toLocaleString("tr-TR")} Tıklama/ay` : "+1,850 Tıklama/ay"
    };
  }, [effectiveRankings]);

  // Filter & Sort Logic
  const filteredAndSortedRankings = useMemo(() => {
    // 1. First apply competitor top-5 filter if active
    let baseList = [...effectiveRankings];

    if (topEntityFilter === "top5_overall") {
      baseList = [...baseList]
        .sort((a, b) => {
          const volA = parseFloat(a.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * (a.monthlyVolume.includes("K") ? 1000 : 1);
          const volB = parseFloat(b.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * (b.monthlyVolume.includes("K") ? 1000 : 1);
          return volB - volA;
        })
        .slice(0, 5);
    } else if (topEntityFilter === "comp1") {
      baseList = [...baseList]
        .sort((a, b) => (a.comp1Rank ?? 99) - (b.comp1Rank ?? 99))
        .slice(0, 5);
    } else if (topEntityFilter === "comp2") {
      baseList = [...baseList]
        .sort((a, b) => (a.comp2Rank ?? 99) - (b.comp2Rank ?? 99))
        .slice(0, 5);
    } else if (topEntityFilter === "comp3") {
      baseList = [...baseList]
        .sort((a, b) => (a.comp3Rank ?? 99) - (b.comp3Rank ?? 99))
        .slice(0, 5);
    }

    return baseList
      .filter((item) => {
        // Always show newly added blank competitor rows so they are immediately visible
        const isAddedRow = addedRows.some((a) => a.id === item.id);
        if (isAddedRow && !item.keyword) {
          return true;
        }

        // Status Filter
        if (statusFilter === "selected" && !selectedIds.has(item.id)) {
          return false;
        }
        if (statusFilter === "with_notes") {
          const noteText = strategicNotes[item.id]?.text?.trim();
          if (!noteText) return false;
        }
        if (statusFilter === "outranked") {
          const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((n): n is number => n !== null);
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const isOutranked = item.userRank === null || item.userRank > bestComp;
          if (!isOutranked) return false;
        }
        if (statusFilter === "leading" && !(item.userRank === 1 || (item.userRank && item.gap < 0))) {
          return false;
        }
        if (statusFilter === "competing" && !(item.userRank && item.userRank <= 4 && item.userRank > 1 && item.gap >= 0)) {
          return false;
        }
        if (statusFilter === "trailing" && !(item.userRank && item.userRank > 4)) {
          return false;
        }
        if (statusFilter === "missing" && item.userRank !== null) {
          return false;
        }

        // Search Intent Filter
        if (intentFilter !== "all" && !item.searchIntent.toLowerCase().includes(intentFilter.toLowerCase())) {
          return false;
        }

        // Keyword, Recommendation, or Strategic Note Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchKw = item.keyword.toLowerCase().includes(q);
          const matchRec = item.aiRecommendation?.toLowerCase().includes(q);
          const matchIntent = item.searchIntent.toLowerCase().includes(q);
          const matchNote = strategicNotes[item.id]?.text?.toLowerCase().includes(q);
          if (!matchKw && !matchRec && !matchIntent && !matchNote) return false;
        }

        // Dynamic Metric Threshold Filters (Metrik Değerinden Düşük Olanları Gizleme)
        if (minVolume > 0) {
          const vol = parseVolumeNumber(item.monthlyVolume);
          if (vol < minVolume) return false;
        }

        if (minDifficulty > 0) {
          if ((item.difficulty ?? 0) < minDifficulty) return false;
        }

        if (minTrafficOpportunity > 0) {
          const tr = parseTrafficOpportunity(item.trafficOpportunity);
          if (tr < minTrafficOpportunity) return false;
        }

        if (maxRankLimit !== null) {
          if (item.userRank === null || item.userRank > maxRankLimit) {
            return false;
          }
        }

        if (activeMetricPreset === "quick_wins" && (item.difficulty ?? 0) > 45) {
          return false;
        }

        // Visual Discrepancy Highlighter: "Sadece Farklı Satırları Göster" filter
        if (isVisualDiscrepancyMode && onlyShowDiscrepancyRows) {
          const rowDiscs = discrepancyAnalysis.rowDiscrepancies[item.id] || [];
          if (discrepancyFocusFilter === "positive_only") {
            if (!rowDiscs.some((d) => d.direction === "positive")) return false;
          } else if (discrepancyFocusFilter === "negative_only") {
            if (!rowDiscs.some((d) => d.direction === "negative")) return false;
          } else if (discrepancyFocusFilter === "extreme_only") {
            if (!rowDiscs.some((d) => d.isExtreme)) return false;
          } else {
            if (rowDiscs.length === 0) return false;
          }
        }

        // Competitor Group Filter (Seçilen Rakip Grubuna Göre Filtreleme)
        if (activeGroupFilter) {
          try {
            const saved = localStorage.getItem(`seo_competitor_groups_${userDomain || "default"}`);
            if (saved) {
              const parsed: CompetitorGroup[] = JSON.parse(saved);
              const activeGrp = parsed.find((g) => g.id === activeGroupFilter);
              if (activeGrp && !activeGrp.keywordIds.includes(item.id)) {
                return false;
              }
            }
          } catch (_) {}
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "manual") {
          const idxA = manualRowOrder.indexOf(a.id);
          const idxB = manualRowOrder.indexOf(b.id);
          const posA = idxA !== -1 ? idxA : 99999;
          const posB = idxB !== -1 ? idxB : 99999;
          diff = posA - posB;
        } else if (sortBy === "gap") {
          const gapA = a.userRank === null ? 999 : a.gap;
          const gapB = b.userRank === null ? 999 : b.gap;
          diff = gapA - gapB;
        } else if (sortBy === "volume") {
          const volA = parseVolumeNumber(a.monthlyVolume);
          const volB = parseVolumeNumber(b.monthlyVolume);
          diff = volA - volB;
        } else if (sortBy === "traffic") {
          const trA = parseTrafficOpportunity(a.trafficOpportunity);
          const trB = parseTrafficOpportunity(b.trafficOpportunity);
          diff = trA - trB;
        } else if (sortBy === "userRank") {
          const rA = a.userRank === null ? 999 : a.userRank;
          const rB = b.userRank === null ? 999 : b.userRank;
          diff = rA - rB;
        } else if (sortBy === "keyword") {
          diff = (a.keyword || "").localeCompare(b.keyword || "", "tr-TR");
        } else if (sortBy === "comp1Rank") {
          const cA = a.comp1Rank === null ? 999 : a.comp1Rank;
          const cB = b.comp1Rank === null ? 999 : b.comp1Rank;
          diff = cA - cB;
        } else if (sortBy === "comp2Rank") {
          const cA = a.comp2Rank === null ? 999 : a.comp2Rank;
          const cB = b.comp2Rank === null ? 999 : b.comp2Rank;
          diff = cA - cB;
        } else if (sortBy === "comp3Rank") {
          const cA = a.comp3Rank === null ? 999 : a.comp3Rank;
          const cB = b.comp3Rank === null ? 999 : b.comp3Rank;
          diff = cA - cB;
        } else if (sortBy === "competitorName") {
          // Identify strongest competitor for this keyword and compare competitor name
          const compListA = [
            { name: comp1.name, rank: a.comp1Rank ?? 999 },
            { name: comp2.name, rank: a.comp2Rank ?? 999 },
            { name: comp3.name, rank: a.comp3Rank ?? 999 }
          ].sort((x, y) => x.rank - y.rank);

          const compListB = [
            { name: comp1.name, rank: b.comp1Rank ?? 999 },
            { name: comp2.name, rank: b.comp2Rank ?? 999 },
            { name: comp3.name, rank: b.comp3Rank ?? 999 }
          ].sort((x, y) => x.rank - y.rank);

          const leadCompA = compListA[0]?.name || "";
          const leadCompB = compListB[0]?.name || "";
          diff = leadCompA.localeCompare(leadCompB, "tr-TR");
          if (diff === 0) {
            diff = (compListA[0]?.rank ?? 999) - (compListB[0]?.rank ?? 999);
          }
        } else if (sortBy === "difficulty") {
          diff = a.difficulty - b.difficulty;
        } else if (sortBy === "goalAttainment") {
          const compRanksA = [a.comp1Rank, a.comp2Rank, a.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
          const bestCompA = compRanksA.length > 0 ? Math.min(...compRanksA) : 1;
          const trA = keywordGoals[a.id]?.targetRank || (a.userRank && a.userRank <= 3 ? 1 : 3);
          const progA = calculateGoalProgress(a.userRank, trA, bestCompA);

          const compRanksB = [b.comp1Rank, b.comp2Rank, b.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
          const bestCompB = compRanksB.length > 0 ? Math.min(...compRanksB) : 1;
          const trB = keywordGoals[b.id]?.targetRank || (b.userRank && b.userRank <= 3 ? 1 : 3);
          const progB = calculateGoalProgress(b.userRank, trB, bestCompB);

          diff = progA.attainmentPercent - progB.attainmentPercent;
        } else if (sortBy === "goalDeviation") {
          const compRanksA = [a.comp1Rank, a.comp2Rank, a.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
          const bestCompA = compRanksA.length > 0 ? Math.min(...compRanksA) : 1;
          const trA = keywordGoals[a.id]?.targetRank || (a.userRank && a.userRank <= 3 ? 1 : 3);
          const progA = calculateGoalProgress(a.userRank, trA, bestCompA);

          const compRanksB = [b.comp1Rank, b.comp2Rank, b.comp3Rank].filter((n): n is number => n !== null && n !== undefined);
          const bestCompB = compRanksB.length > 0 ? Math.min(...compRanksB) : 1;
          const trB = keywordGoals[b.id]?.targetRank || (b.userRank && b.userRank <= 3 ? 1 : 3);
          const progB = calculateGoalProgress(b.userRank, trB, bestCompB);

          diff = progA.deviationPercent - progB.deviationPercent;
        } else if (sortBy === "trendGrowth") {
          const rA = a.userRank === null ? 99 : a.userRank;
          const rB = b.userRank === null ? 99 : b.userRank;
          diff = rA - rB;
        }

        // Always position newly added competitor rows at the bottom of the table
        const isAAdded = addedRows.some((row) => row.id === a.id);
        const isBAdded = addedRows.some((row) => row.id === b.id);
        if (isAAdded && !isBAdded) return 1;
        if (!isAAdded && isBAdded) return -1;
        if (isAAdded && isBAdded) {
          const indexA = addedRows.findIndex((row) => row.id === a.id);
          const indexB = addedRows.findIndex((row) => row.id === b.id);
          return indexA - indexB;
        }

        return sortOrder === "asc" ? diff : -diff;
      });
  }, [
    effectiveRankings, 
    addedRows, 
    topEntityFilter, 
    statusFilter, 
    intentFilter, 
    searchTerm, 
    sortBy, 
    sortOrder,
    minVolume,
    minDifficulty,
    minTrafficOpportunity,
    maxRankLimit,
    activeMetricPreset,
    strategicNotes,
    keywordGoals,
    manualRowOrder,
    isVisualDiscrepancyMode,
    onlyShowDiscrepancyRows,
    discrepancyAnalysis,
    discrepancyFocusFilter,
    activeGroupFilter
  ]);

  // Copy Keyword action
  const handleCopy = (id: string, kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Add Keyword to site
  const handleAdd = (id: string, kw: string) => {
    if (onApplyKeyword) {
      onApplyKeyword(kw);
      setAddedId(id);
      setTimeout(() => setAddedId(null), 3000);
    }
  };

  // Copy Serialized CSV String to Clipboard
  // Serializes the current state of competitor ranking table rows and headers into a clean CSV formatted string,
  // correctly escaping special characters according to RFC 4180, and copies directly to clipboard.
  const handleCopyCsvString = () => {
    const dataToExport = filteredAndSortedRankings.length > 0 ? filteredAndSortedRankings : effectiveRankings;
    if (!dataToExport || dataToExport.length === 0) return;

    const csvString = serializeRankingTableData(dataToExport, {
      userName,
      comp1Name: comp1.name,
      comp2Name: comp2.name,
      comp3Name: comp3.name,
      competitors: effectiveCompetitors,
      selectedColumnIds: selectedCsvColumns,
      goals: keywordGoals
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(csvString).then(() => {
        setIsCsvCopied(true);
        setDownloadNotification(`CSV metni panoya kopyalandı! (${selectedCsvColumns.length} sütun, ${dataToExport.length} satır)`);
        setTimeout(() => setIsCsvCopied(false), 2500);
        setTimeout(() => setDownloadNotification(null), 3500);
      }).catch(() => {
        setDownloadNotification(`CSV metni başarıyla oluşturuldu (${selectedCsvColumns.length} sütun, ${dataToExport.length} satır)`);
        setTimeout(() => setDownloadNotification(null), 3000);
      });
    } else {
      setDownloadNotification(`CSV metni hazırlandı (${selectedCsvColumns.length} sütun, ${dataToExport.length} satır)`);
      setTimeout(() => setDownloadNotification(null), 3000);
    }
  };

  // Export to CSV Function
  // Serializes all data records from the competitor ranking table into a clean CSV formatted string,
  // creates a Blob object with UTF-8 BOM, and programmatically triggers a browser file download.
  const handleExportCsv = (exportAllTableData: boolean = true) => {
    // When exporting all table data, use effectiveRankings (all rows including user overrides and newly added rows)
    const dataToExport = exportAllTableData
      ? (effectiveRankings.length > 0 ? effectiveRankings : filteredAndSortedRankings)
      : (filteredAndSortedRankings.length > 0 ? filteredAndSortedRankings : effectiveRankings);

    if (!dataToExport || dataToExport.length === 0) return;

    const csvString = serializeRankingTableData(dataToExport, {
      userName,
      comp1Name: comp1.name,
      comp2Name: comp2.name,
      comp3Name: comp3.name,
      competitors: effectiveCompetitors,
      selectedColumnIds: selectedCsvColumns,
      goals: keywordGoals
    });

    // Construct CSV with UTF-8 BOM for Microsoft Excel & Google Sheets compatibility
    const csvContent = "\uFEFF" + csvString;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `seo-rakip-kiyaslama-tum-veriler-${selectedCsvColumns.length}sutun-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotification(`Tablodaki tüm veriler (${dataToExport.length} satır, ${selectedCsvColumns.length} sütun) başarıyla CSV formatında dışa aktarıldı ve indirildi!`);
    setTimeout(() => setDownloadNotification(null), 3500);
  };

  // Export to Excel (.xlsx) Function
  // Serializes all data records from the competitor ranking table directly into a native Microsoft Excel (.xlsx) workbook,
  // includes auto-sized columns and an executive summary KPI sheet, then programmatically triggers a browser file download.
  const handleExportExcel = (exportAllTableData: boolean = true) => {
    const dataToExport = exportAllTableData
      ? (effectiveRankings.length > 0 ? effectiveRankings : filteredAndSortedRankings)
      : (filteredAndSortedRankings.length > 0 ? filteredAndSortedRankings : effectiveRankings);

    if (!dataToExport || dataToExport.length === 0) {
      setDownloadNotification("Dışa aktarılacak veri bulunamadı.");
      setTimeout(() => setDownloadNotification(null), 3000);
      return;
    }

    try {
      const dateSlug = new Date().toISOString().slice(0, 10);
      const customFilename = `seo-rakip-kiyaslama-tum-veriler-${dataToExport.length}satir-${dateSlug}.xlsx`;
      const filename = exportRankingTableToExcel(
        dataToExport,
        {
          userName,
          comp1Name: comp1.name,
          comp2Name: comp2.name,
          comp3Name: comp3.name,
          competitors: effectiveCompetitors,
          selectedColumnIds: selectedCsvColumns,
          goals: keywordGoals
        },
        customFilename
      );

      setDownloadNotification(`Tablodaki tüm veriler (${dataToExport.length} satır, ${selectedCsvColumns.length} sütun) başarıyla Excel (.xlsx) olarak dışa aktarıldı ve indirildi! (${filename})`);
      setTimeout(() => setDownloadNotification(null), 4000);
    } catch (err) {
      console.error("Excel export error:", err);
      setDownloadNotification("Excel dosyası oluşturulurken bir hata oluştu.");
      setTimeout(() => setDownloadNotification(null), 3500);
    }
  };

  // Export Selected Rows to Excel (.xlsx)
  const handleExportSelectedExcel = () => {
    if (selectedRankings.length === 0) return;
    try {
      const dateSlug = new Date().toISOString().slice(0, 10);
      const customFilename = `seo-rakip-kiyaslama-secilenler-${selectedRankings.length}satir-${dateSlug}.xlsx`;
      const filename = exportRankingTableToExcel(
        selectedRankings,
        {
          userName,
          comp1Name: comp1.name,
          comp2Name: comp2.name,
          comp3Name: comp3.name,
          competitors: effectiveCompetitors,
          selectedColumnIds: selectedCsvColumns,
          goals: keywordGoals
        },
        customFilename
      );

      setDownloadNotification(`${selectedRankings.length} seçili satır başarıyla Excel (.xlsx) olarak dışa aktarıldı ve indirildi! (${filename})`);
      setTimeout(() => setDownloadNotification(null), 4000);
    } catch (err) {
      console.error("Excel export error:", err);
      setDownloadNotification("Excel dosyası oluşturulurken bir hata oluştu.");
      setTimeout(() => setDownloadNotification(null), 3500);
    }
  };

  // Checkbox selection helper functions & derived state
  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedRankings = useMemo(() => {
    return effectiveRankings.filter((r) => selectedIds.has(r.id));
  }, [effectiveRankings, selectedIds]);

  const isAllSelected = useMemo(() => {
    return (
      filteredAndSortedRankings.length > 0 &&
      filteredAndSortedRankings.every((r) => selectedIds.has(r.id))
    );
  }, [filteredAndSortedRankings, selectedIds]);

  const isSomeSelected = useMemo(() => {
    return (
      filteredAndSortedRankings.some((r) => selectedIds.has(r.id)) && !isAllSelected
    );
  }, [filteredAndSortedRankings, selectedIds, isAllSelected]);

  // Dynamic table column span considering active optional columns (including drag handle column)
  const currentTableColSpan = 12 + (isGoalTrackingMode ? 1 : 0) + (isTrendColumnVisible ? 1 : 0);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredAndSortedRankings.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredAndSortedRankings.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleSelectAllRows = () => {
    const idsToSelect = filteredAndSortedRankings.length > 0 
      ? filteredAndSortedRankings.map((r) => r.id)
      : effectiveRankings.map((r) => r.id);
    setSelectedIds(new Set(idsToSelect));
  };

  // Bulk Add Selected to Targets
  const handleBulkAddToTargets = () => {
    if (selectedRankings.length === 0) return;
    if (onApplyKeyword) {
      selectedRankings.forEach((r) => onApplyKeyword(r.keyword));
      setDownloadNotification(`${selectedRankings.length} anahtar kelime SEO hedeflerinize eklendi!`);
      setTimeout(() => setDownloadNotification(null), 3500);
    }
  };

  // Bulk Export Selected as CSV
  const handleExportSelectedCsv = (customItems?: CompetitorKeywordRanking[]) => {
    const items = customItems || selectedRankings;
    if (items.length === 0) return;

    const csvString = serializeRankingTableData(items, {
      userName,
      comp1Name: comp1.name,
      comp2Name: comp2.name,
      comp3Name: comp3.name,
      competitors: effectiveCompetitors,
      selectedColumnIds: selectedCsvColumns,
      goals: keywordGoals
    });

    const csvContent = "\uFEFF" + csvString;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `seo-selected-competitor-rankings-${items.length}items-${selectedCsvColumns.length}cols.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotification(`Seçili ${items.length} anahtar kelime (${selectedCsvColumns.length} sütun) CSV olarak indirildi!`);
    setTimeout(() => setDownloadNotification(null), 3500);
  };

  // Bulk Copy Selected as CSV
  const handleCopySelectedCsv = () => {
    if (selectedRankings.length === 0) return;

    const csvString = serializeRankingTableData(selectedRankings, {
      userName,
      comp1Name: comp1.name,
      comp2Name: comp2.name,
      comp3Name: comp3.name,
      competitors: effectiveCompetitors,
      selectedColumnIds: selectedCsvColumns,
      goals: keywordGoals
    });

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(csvString).then(() => {
        setDownloadNotification(`Seçilen ${selectedRankings.length} satırın CSV metni panoya kopyalandı! (${selectedCsvColumns.length} sütun)`);
        setTimeout(() => setDownloadNotification(null), 3500);
      });
    }
  };

  // Inline row editing handlers (active inline editing of competitor name and metrics)
  const handleStartEdit = (item: CompetitorKeywordRanking) => {
    const compList = [
      { name: comp1.name, domain: comp1.domain, rank: item.comp1Rank },
      { name: comp2.name, domain: comp2.domain, rank: item.comp2Rank },
      { name: comp3.name, domain: comp3.domain, rank: item.comp3Rank }
    ].filter((c): c is { name: string; domain: string; rank: number } => c.rank !== null)
     .sort((a, b) => a.rank - b.rank);
    const topComp = compList[0];

    const currentCompetitorName = (item as any).competitorName || (topComp ? topComp.name : comp1.name);

    setEditingRowId(item.id);
    setEditFormData({
      id: item.id,
      keyword: item.keyword,
      searchIntent: item.searchIntent,
      monthlyVolume: item.monthlyVolume,
      difficulty: item.difficulty,
      userRank: item.userRank,
      competitorName: currentCompetitorName,
      comp1Rank: item.comp1Rank,
      comp2Rank: item.comp2Rank,
      comp3Rank: item.comp3Rank,
      trafficOpportunity: item.trafficOpportunity || "+500 Ziyaretçi / ay",
      aiRecommendation: item.aiRecommendation || ""
    });
    setEditValidationErrors({});
    setEditValidationBanner(null);
  };

  const handleUpdateEditField = (field: keyof RowEditFormData, value: any) => {
    if (!editFormData) return;
    const updated = { ...editFormData, [field]: value };
    setEditFormData(updated);

    // If there were already validation errors, live-revalidate to remove error message as soon as fixed
    if (Object.keys(editValidationErrors).length > 0) {
      const fieldErrors = validateRowEditMetrics(updated, comp1.name, comp2.name, comp3.name);
      setEditValidationErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) {
        setEditValidationBanner(null);
      }
    }
  };

  const handleBlurEditField = (field: keyof RowEditFormData) => {
    if (!editFormData) return;
    const currentErrors = validateRowEditMetrics(editFormData, comp1.name, comp2.name, comp3.name);
    if (currentErrors[field as keyof EditValidationErrors]) {
      setEditValidationErrors((prev) => ({
        ...prev,
        [field]: currentErrors[field as keyof EditValidationErrors]!
      }));
    } else if (editValidationErrors[field as keyof EditValidationErrors]) {
      setEditValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof EditValidationErrors];
        return next;
      });
    }
  };

  const handleAutoFixNumericErrors = () => {
    if (!editFormData) return;

    const diffRaw = String(editFormData.difficulty ?? "").replace(/[^0-9]/g, "");
    const safeDiff = diffRaw ? Math.max(0, Math.min(100, parseInt(diffRaw, 10))) : 45;

    const volRaw = String(editFormData.monthlyVolume ?? "").replace(/[^0-9]/g, "");
    const safeVol = volRaw ? `${parseInt(volRaw, 10).toLocaleString("tr-TR")} / ay` : "1.500 / ay";

    const safeKeyword = editFormData.keyword.trim() || "Yeni Anahtar Kelime";

    let safeUserRank: number | null = null;
    const uRaw = String(editFormData.userRank ?? "").replace(/[^0-9]/g, "");
    if (uRaw) {
      safeUserRank = Math.max(1, Math.min(100, parseInt(uRaw, 10)));
    }

    let safeComp1Rank: number | null = null;
    const c1Raw = String(editFormData.comp1Rank ?? "").replace(/[^0-9]/g, "");
    if (c1Raw) safeComp1Rank = Math.max(1, Math.min(100, parseInt(c1Raw, 10)));

    let safeComp2Rank: number | null = null;
    const c2Raw = String(editFormData.comp2Rank ?? "").replace(/[^0-9]/g, "");
    if (c2Raw) safeComp2Rank = Math.max(1, Math.min(100, parseInt(c2Raw, 10)));

    let safeComp3Rank: number | null = null;
    const c3Raw = String(editFormData.comp3Rank ?? "").replace(/[^0-9]/g, "");
    if (c3Raw) safeComp3Rank = Math.max(1, Math.min(100, parseInt(c3Raw, 10)));

    let safeOpp = editFormData.trafficOpportunity.trim();
    if (safeOpp && !/[0-9]/.test(safeOpp)) {
      safeOpp = "+500 Ziyaretçi / ay";
    }

    const repaired: RowEditFormData = {
      ...editFormData,
      keyword: safeKeyword,
      difficulty: safeDiff,
      monthlyVolume: safeVol,
      userRank: safeUserRank,
      comp1Rank: safeComp1Rank,
      comp2Rank: safeComp2Rank,
      comp3Rank: safeComp3Rank,
      trafficOpportunity: safeOpp || "+500 Ziyaretçi / ay"
    };

    setEditFormData(repaired);
    setEditValidationErrors({});
    setEditValidationBanner(null);
    setSaveToast("Metrikler otomatik olarak geçerli sayısal formatlara dönüştürüldü.");
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    
    // Validate all fields before saving
    const errors = validateRowEditMetrics(editFormData, comp1.name, comp2.name, comp3.name);
    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      const errCount = Object.keys(errors).length;
      const firstErrMsg = Object.values(errors)[0];
      setEditValidationBanner(`Sayısal Format Hatası (${errCount} Alan): ${firstErrMsg}`);
      
      const el = document.getElementById(`row-editing-${editFormData.id}`) || document.getElementById("edit-row-validation-error-banner");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    setEditValidationErrors({});
    setEditValidationBanner(null);

    const trimmedKeyword = editFormData.keyword.trim() || "Anahtar Kelime";
    
    // Parse numeric values safely
    const parsedDiff = typeof editFormData.difficulty === "number" 
      ? editFormData.difficulty 
      : parseInt(String(editFormData.difficulty), 10) || 0;

    const parsedUserRank = (editFormData.userRank === null || editFormData.userRank === "" || editFormData.userRank === undefined)
      ? null
      : parseInt(String(editFormData.userRank), 10);

    const parsedComp1Rank = (editFormData.comp1Rank === null || editFormData.comp1Rank === "" || editFormData.comp1Rank === undefined)
      ? null
      : parseInt(String(editFormData.comp1Rank), 10);

    const parsedComp2Rank = (editFormData.comp2Rank === null || editFormData.comp2Rank === "" || editFormData.comp2Rank === undefined)
      ? null
      : parseInt(String(editFormData.comp2Rank), 10);

    const parsedComp3Rank = (editFormData.comp3Rank === null || editFormData.comp3Rank === "" || editFormData.comp3Rank === undefined)
      ? null
      : parseInt(String(editFormData.comp3Rank), 10);

    // Recalculate gap and status
    const compRanks = [
      parsedComp1Rank,
      parsedComp2Rank,
      parsedComp3Rank
    ].filter((r): r is number => r !== null && !isNaN(r));
    const bestCompRank = compRanks.length > 0 ? Math.min(...compRanks) : 1;

    let newGap = 0;
    let newStatus: "leading" | "competing" | "trailing" | "missing" = "missing";

    if (parsedUserRank === null || isNaN(parsedUserRank)) {
      newGap = 99;
      newStatus = "missing";
    } else {
      newGap = parsedUserRank - bestCompRank;
      if (parsedUserRank === 1 || newGap < 0) {
        newStatus = "leading";
      } else if (parsedUserRank <= 4) {
        newStatus = "competing";
      } else {
        newStatus = "trailing";
      }
    }

    const updatedOverride: Partial<CompetitorKeywordRanking> & { competitorName?: string } = {
      keyword: trimmedKeyword,
      searchIntent: editFormData.searchIntent,
      monthlyVolume: editFormData.monthlyVolume.trim() || "1.000 / ay",
      difficulty: Math.max(0, Math.min(100, parsedDiff)),
      userRank: parsedUserRank,
      comp1Rank: parsedComp1Rank,
      comp2Rank: parsedComp2Rank,
      comp3Rank: parsedComp3Rank,
      competitorName: editFormData.competitorName.trim(),
      gap: newGap,
      status: newStatus,
      trafficOpportunity: editFormData.trafficOpportunity.trim(),
      aiRecommendation: editFormData.aiRecommendation.trim()
    };

    setRowOverrides((prev) => ({
      ...prev,
      [editFormData.id]: updatedOverride
    }));

    setEditingRowId(null);
    setEditFormData(null);

    setSaveToast(`"${trimmedKeyword}" satırı ve rakip metrik değerleri başarıyla güncellendi.`);
    setTimeout(() => {
      setSaveToast(null);
    }, 4000);

    if (onUpdateRanking) {
      const original = effectiveRankings.find((r) => r.id === editFormData.id);
      if (original) {
        onUpdateRanking({ ...original, ...updatedOverride } as CompetitorKeywordRanking);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData(null);
    setEditValidationErrors({});
    setEditValidationBanner(null);
  };

  // Single-click delete action for competitor ranking row
  const handleDeleteRow = (id: string, keyword: string) => {
    setDeletedRowIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (editingRowId === id) {
      setEditingRowId(null);
      setEditFormData(null);
    }
    setSaveToast(`"${keyword}" satırı tablodan tamamen kaldırıldı.`);
    setTimeout(() => {
      setSaveToast(null);
    }, 4500);

    if (onDeleteRanking) {
      onDeleteRanking(id);
    }
  };

  // Single-click duplicate / copy competitor row into a new row in the table
  const handleDuplicateRow = (sourceItem: CompetitorKeywordRanking) => {
    // Merge any active rowOverrides for the source item so current edits are preserved
    const currentOverride = rowOverrides[sourceItem.id] || {};
    const effectiveSource: CompetitorKeywordRanking = {
      ...sourceItem,
      ...currentOverride,
    };

    const newId = `row-${sourceItem.id}-copy-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Create new keyword label with (Kopya) suffix
    const baseKeyword = effectiveSource.keyword.replace(/\s*\(Kopya(\s+\d+)?\)$/i, "");
    const copiedKeyword = `${baseKeyword} (Kopya)`;

    const newItem: CompetitorKeywordRanking = {
      ...effectiveSource,
      id: newId,
      keyword: copiedKeyword,
    };

    setClonedRows((prev) => [...prev, { afterId: sourceItem.id, item: newItem }]);
    setRecentlyClonedId(newId);
    setTimeout(() => {
      setRecentlyClonedId((current) => (current === newId ? null : current));
    }, 3500);

    setSaveToast(`"${effectiveSource.keyword}" satırındaki veriler anında yeni bir satıra kopyalandı.`);
    setTimeout(() => {
      setSaveToast(null);
    }, 4500);

    if (onDuplicateRanking) {
      onDuplicateRanking(newItem);
    }
  };

  // Single-click Add New Empty Competitor Row to the bottom of the table
  const handleAddNewCompetitorRow = () => {
    const newId = `row-new-comp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newEmptyItem: CompetitorKeywordRanking = {
      id: newId,
      keyword: "", // Empty keyword ready for user input
      searchIntent: "Ticari",
      monthlyVolume: "—",
      difficulty: 0,
      userRank: null,
      comp1Rank: null,
      comp2Rank: null,
      comp3Rank: null,
      serpFeatures: ["Organik Arama"],
      gap: 0,
      status: "missing",
      trafficOpportunity: "+0 Ziyaretçi / ay",
      aiRecommendation: "Yeni eklenen rakip için hedef anahtar kelimeleri ve SERP fırsatlarını belirleyin."
    };

    setAddedRows((prev) => [...prev, newEmptyItem]);
    setRecentlyAddedId(newId);
    setTimeout(() => {
      setRecentlyAddedId((current) => (current === newId ? null : current));
    }, 4500);

    // Reset restrictive search/status filters so the newly created row is immediately visible
    if (searchTerm.trim()) setSearchTerm("");
    if (statusFilter !== "all") setStatusFilter("all");

    // Automatically open inline edit mode so user can immediately type in competitor name and metrics
    handleStartEdit(newEmptyItem);

    setSaveToast("Yeni boş rakip satırı tablonun en altına eklendi. Bilgileri doğrudan girebilirsiniz.");
    setTimeout(() => {
      setSaveToast(null);
    }, 4500);

    setTimeout(() => {
      const el = document.getElementById(`row-editing-${newId}`) || document.getElementById(`row-ranking-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);

    if (onAddRanking) {
      onAddRanking(newEmptyItem);
    }
  };

  // Bulk delete selected rows
  const handleBulkDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setDeletedRowIds((prev) => [...prev, ...Array.from(selectedIds).filter((id) => !prev.includes(id))]);
    setSelectedIds(new Set());
    setSaveToast(`Seçilen ${count} adet rakip satırı tablodan kaldırıldı.`);
    setTimeout(() => {
      setSaveToast(null);
    }, 4500);
  };

  // Restore deleted rows
  const handleRestoreDeletedRows = () => {
    setDeletedRowIds([]);
    setSaveToast("Kaldırılan tüm rakip satırları başarıyla geri yüklendi.");
    setTimeout(() => {
      setSaveToast(null);
    }, 4000);
  };

  const handleResetRowOverrides = () => {
    setRowOverrides({});
    setDeletedRowIds([]);
    setClonedRows([]);
    setAddedRows([]);
    setEditingRowId(null);
    setEditFormData(null);
    setSaveToast("Tüm satır düzenlemeleri, silinen, kopyalanan ve yeni eklenen satırlar sıfırlandı, orijinal değerlere dönüldü.");
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Quick jump & focus to table column headers
  const jumpToColumnHeader = (headerId: string) => {
    const el = document.getElementById(headerId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      el.classList.add("ring-2", "ring-amber-400", "bg-slate-800");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-amber-400", "bg-slate-800");
      }, 1500);
    }
  };

  // Quick launch row-level inline edit mode and focus row
  const jumpToAndEditRow = (rowId: string) => {
    const target = effectiveRankings.find((r) => r.id === rowId);
    if (target) {
      handleStartEdit(target);
      setTimeout(() => {
        const el = document.getElementById(`row-editing-${rowId}`) || document.getElementById(`row-${rowId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-4", "ring-amber-400/80");
          setTimeout(() => el.classList.remove("ring-4", "ring-amber-400/80"), 1600);
        }
      }, 120);
    }
  };

  // Competitor filter callback from Market Share Pie Chart module
  const handleCompetitorFilterFromPie = (filterKey: "all" | "comp1" | "comp2" | "comp3" | "leading" | "outranked") => {
    if (filterKey === "leading" || filterKey === "outranked") {
      setStatusFilter(filterKey);
      setTopEntityFilter("all");
    } else if (filterKey === "comp1" || filterKey === "comp2" || filterKey === "comp3") {
      setTopEntityFilter(filterKey);
      setStatusFilter("all");
    } else {
      setTopEntityFilter("all");
      setStatusFilter("all");
    }
    const filterName =
      filterKey === "comp1"
        ? comp1.name
        : filterKey === "comp2"
        ? comp2.name
        : filterKey === "comp3"
        ? comp3.name
        : filterKey === "leading"
        ? "Lider Olduğunuz Kelimelere"
        : "Tüm Kelimelere";
    setSaveToast(`Tablo ${filterName} göre filtrelendi.`);
    setTimeout(() => setSaveToast(null), 3500);

    setTimeout(() => {
      const el = document.getElementById("search-input-rankings") || document.getElementById("table-container-competitive");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div 
      id="seo-competitor-comparison-table" 
      data-testid="seo-competitor-comparison-table" 
      className={`space-y-6 relative ${className}`}
      onDragEnter={handleTableDragEnter}
      onDragOver={handleTableDragOver}
      onDragLeave={handleTableDragLeave}
      onDrop={handleTableDrop}
    >
      {/* Full-Table Drag & Drop Upload Overlay */}
      {isDraggingOverTable && (
        <div
          id="seo-table-drag-drop-overlay"
          data-testid="seo-table-drag-drop-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md border-4 border-dashed border-teal-400 pointer-events-none animate-in fade-in"
        >
          <div className="text-center space-y-4 max-w-lg p-8 rounded-3xl bg-slate-900/95 border border-teal-500/50 shadow-2xl shadow-teal-500/30">
            <div className="w-20 h-20 rounded-3xl bg-teal-500/20 text-teal-300 border-2 border-teal-400/60 flex items-center justify-center mx-auto animate-bounce shadow-inner">
              <UploadCloud className="w-10 h-10 text-teal-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white tracking-tight">
                CSV Dosyasını Tabloya Bırakın
              </h3>
              <p className="text-sm text-teal-200">
                Bıraktığınız anda <strong>Veri Eşleştirme Sihirbazı</strong> açılacak ve metrikleriniz otomatik haritalanacaktır.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-teal-300 text-xs font-mono font-bold border border-teal-500/30">
                .csv
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-teal-300 text-xs font-mono font-bold border border-teal-500/30">
                .tsv
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-teal-300 text-xs font-mono font-bold border border-teal-500/30">
                .txt
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. MODULE HEADER & OVERVIEW */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini Canlı SERP Benchmark</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Top 3 Yerel Rakip Kıyaslaması</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-mono">
                {effectiveRankings.length} Anahtar Kelime
              </span>

              {/* Automated Weekly Report Scheduler Header Badge */}
              <button
                type="button"
                id="btn-header-auto-report-badge"
                data-testid="header-auto-report-badge"
                onClick={() => setIsAutoReportModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  autoReportConfig.enabled
                    ? "bg-indigo-500/25 text-indigo-200 border-indigo-400/40 hover:bg-indigo-500/35 hover:border-indigo-300"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
                title="Haftalık otomatik raporlama zamanlayıcısını yapılandırın veya test raporu gönderin"
              >
                <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {autoReportConfig.enabled
                    ? `Haftalık Rapor: Aktif (${autoReportConfig.recipientEmail})`
                    : "Haftalık Rapor: Kapalı"}
                </span>
                {autoReportConfig.enabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {/* Impact Analysis Header Badge */}
              <button
                type="button"
                id="btn-header-impact-analysis-badge"
                data-testid="header-impact-analysis-badge"
                onClick={() => setIsImpactAnalysisModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-purple-500/20 text-purple-200 border-purple-400/40 hover:bg-purple-500/30 hover:border-purple-300 shadow-xs"
                title="Rakip metrikleri ile belirlenen hedefler arasındaki korelasyonu ve ısı haritasını açın"
              >
                <Activity className="w-3.5 h-3.5 text-purple-300" />
                <span>Etki Analizi</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-900 text-purple-300 font-mono text-[9px] border border-purple-500/30 flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span>Isı Haritası</span>
                </span>
              </button>

              {/* 3D Scatter Correlation Header Badge */}
              <button
                type="button"
                id="btn-header-3d-scatter-badge"
                data-testid="header-3d-scatter-badge"
                onClick={() => setIs3DScatterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-sky-500/20 text-sky-200 border-sky-400/40 hover:bg-sky-500/30 hover:border-sky-300 shadow-xs"
                title="Rakip verilerini ve anahtar kelimeleri 3D düzlemde görselleştiren korelasyon dağılım grafiğini açın"
              >
                <Box className="w-3.5 h-3.5 text-sky-300" />
                <span>3D Korelasyon</span>
                <span className="px-1.5 py-0.2 rounded bg-sky-900 text-sky-300 font-mono text-[9px] border border-sky-500/30 flex items-center gap-0.5">
                  <Compass className="w-2.5 h-2.5 text-sky-400" />
                  <span>Pazar Dağılımı</span>
                </span>
              </button>

              {/* Performance Improvement Recommendations Header Badge */}
              <button
                type="button"
                id="btn-header-recommendations-badge"
                data-testid="header-recommendations-badge"
                onClick={() => {
                  setSelectedCompetitorForRecommendations("all");
                  setIsRecommendationsDrawerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30 hover:border-emerald-300 shadow-xs"
                title="Tablodaki metrikleri analiz ederek her rakip için 'Performans İyileştirme Önerileri' sunan paneli açın"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Performans Önerileri</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/30 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>Aksiyon Planı</span>
                </span>
              </button>

              {/* Görsel Farklılık Vurgulayıcı Header Badge */}
              <button
                type="button"
                id="btn-header-variance-highlighter-badge"
                data-testid="header-variance-highlighter-badge"
                onClick={handleToggleVisualDiscrepancyMode}
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs ${
                  isVisualDiscrepancyMode
                    ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/60 font-black"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700"
                }`}
                title="Tablodaki tüm metrikleri otomatik tarayarak %20+ performans farklarını renklendiren Görsel Farklılık Vurgulayıcı modunu açın/kapatın"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isVisualDiscrepancyMode ? "text-slate-950 stroke-[2.5]" : "text-amber-400"}`} />
                <span>Görsel Farklılık Vurgulayıcı</span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-black ${
                  isVisualDiscrepancyMode ? "bg-slate-950 text-amber-300" : "bg-indigo-950 text-amber-300 border border-indigo-500/30"
                }`}>
                  %{discrepancyThreshold}+ ({discrepancyAnalysis.highlightedCount})
                </span>
              </button>

              {/* Rakip Grupları & Segment Analizi Header Badge */}
              <button
                type="button"
                id="btn-header-competitor-groups-badge"
                data-testid="header-competitor-groups-badge"
                onClick={handleToggleGroupManager}
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs ${
                  isGroupManagerOpen
                    ? "bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/40 font-black"
                    : "bg-slate-800/80 text-indigo-300 border-indigo-500/30 hover:bg-slate-700 hover:text-white"
                }`}
                title="Seçili rakipleri gruplayarak her grup için bağımsız performans ortalamaları hesaplayan Rakip Grupları panelini açın/kapatın"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Rakip Grupları</span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-black ${
                  isGroupManagerOpen ? "bg-slate-950 text-amber-300" : "bg-indigo-950 text-indigo-300 border border-indigo-500/30"
                }`}>
                  {competitorGroups.length} Grup
                </span>
              </button>

              {/* Pazar Payı ve Rekabet Analiz Raporu Header Badge Button */}
              <button
                type="button"
                id="btn-header-market-share-pdf-badge"
                data-testid="header-market-share-pdf-badge"
                onClick={handleDownloadMarketSharePdf}
                disabled={isGeneratingMarketSharePdf}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-rose-500/20 text-rose-200 border-rose-400/40 hover:bg-rose-500/30 hover:border-rose-300 shadow-xs disabled:opacity-60"
                title="Tüm rakip verilerini birleştirerek tek tıkla profesyonel Pazar Payı ve Rekabet Analiz Raporu (PDF) indirin"
              >
                {isGeneratingMarketSharePdf ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>Pazar Payı Raporu</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-mono text-[9px] border border-rose-500/30 flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5 text-amber-400" />
                  <span>Tek Tık PDF</span>
                </span>
              </button>

              {/* Profesyonel Rapor Oluşturucu (Logo & Özel Notlar) Header Badge Button */}
              <button
                type="button"
                id="btn-header-open-report-builder"
                data-testid="header-open-report-builder-badge"
                onClick={() => setIsReportBuilderModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-purple-500/20 text-purple-200 border-purple-400/40 hover:bg-purple-500/30 hover:border-purple-300 shadow-xs"
                title="Tüm rakip verilerini ve pazar payı analizini tek bir kapsamlı PDF dosyası olarak indirebileceğiniz, marka logolarını ve özel notları içeren profesyonel rapor oluşturma aracını açın"
              >
                <FileText className="w-3.5 h-3.5 text-purple-300" />
                <span>Rapor Oluşturucu</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono text-[9px] border border-purple-500/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Logo & Özel Not</span>
                </span>
              </button>

              {/* Pazar Payı Pasta Grafiği Header Badge Button */}
              <button
                type="button"
                id="btn-header-market-share-pie-badge"
                data-testid="header-market-share-pie-badge"
                onClick={() => {
                  setIsMarketSharePieVisible(true);
                  if (viewMode === "chart") setViewMode("table");
                  setTimeout(() => {
                    const el = document.getElementById("seo-competitor-market-share-pie-chart-module");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 60);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30 hover:border-amber-300 shadow-xs"
                title="Tüm rakiplerin metriklerini karşılaştıran ve pazar payı dağılımını gösteren Pazar Payı Pasta Grafiği modülüne git"
              >
                <PieChart className="w-3.5 h-3.5 text-amber-400" />
                <span>Pazar Payı Pasta Grafiği</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono text-[9px] border border-amber-500/30 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 text-amber-400" />
                  <span>% Dağılım</span>
                </span>
              </button>

              {/* CSV İçe Aktar (CSV Import & Auto-Mapping) Header Badge */}
              <button
                type="button"
                id="btn-header-import-csv"
                data-testid="header-import-csv-badge"
                onClick={() => setIsCsvImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30 hover:border-emerald-300 shadow-xs"
                title="Harici bir CSV dosyasındaki rakip verilerini tabloya yükleyin ve otomatik eşleştirin"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-300" />
                <span>CSV İçe Aktar</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Otomatik Eşleştir</span>
                </span>
              </button>

              {/* D3 Grafik Renk Teması Seçici Header Badge */}
              <button
                type="button"
                id="btn-header-color-theme-badge"
                data-testid="header-color-theme-badge"
                onClick={() => setIsColorThemeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30 hover:border-amber-300 shadow-xs"
                title="D3.js grafik serilerinin renk paletini ve rakip renklerini kişiselleştirin"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Renk Teması</span>
                <div className="flex items-center -space-x-1 ml-0.5">
                  <span className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.user }} />
                  <span className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.comp1 }} />
                  <span className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.comp2 }} />
                  <span className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.comp3 }} />
                </div>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <Target className="w-6 h-6 text-amber-400" />
              <span>SEO Rakip Kıyaslama Tablosu</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Google arama motorunda sitenizin mevcut organik sıralamasını, bölgenizdeki en güçlü <strong>3 yerel rakiple</strong> birebir karşılaştırın. 
              Her rakip için en önemli 5 anahtar kelimeyi inceleyin, D3.js çubuk grafiği ile görselleştirin ve <strong>Dışa Aktar</strong> butonu ile tüm verileri CSV formatında indirin.
            </p>
          </div>

          {/* Quick Actions Header: CSV Export Button & View Mode Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* View Mode Toggle: Table View vs Market Share Pie Chart vs D3.js Bar Chart */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-700 shadow-inner">
              <button
                type="button"
                id="toggle-table-view-btn"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tablo görünümüne geç"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tablo Görünümü</span>
              </button>

              <button
                type="button"
                id="toggle-pie-chart-view-btn"
                data-testid="toggle-pie-chart-view-btn"
                onClick={() => {
                  setViewMode("pie");
                  setIsMarketSharePieVisible(true);
                  setTimeout(() => {
                    const el = document.getElementById("seo-competitor-market-share-pie-chart-module");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 60);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "pie"
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Pazar Payı Pasta Grafiği görünümüne geç"
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Pazar Payı Pasta Grafiği</span>
              </button>

              <button
                type="button"
                id="toggle-d3-chart-view-btn"
                onClick={() => setViewMode("chart")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "chart"
                    ? "bg-indigo-600 text-white font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="D3.js Çubuk Grafiği görünümüne geç"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>D3.js Çubuk Grafiği</span>
              </button>
            </div>

            {/* Sütunları Özelleştir (Customize Columns) Menu Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="btn-customize-csv-columns"
                data-testid="customize-csv-columns-button"
                onClick={() => setIsCustomizeColumnsOpen((prev) => !prev)}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isCustomizeColumnsOpen
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                    : "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
                title="CSV dosyasına hangi sütunların (örneğin: Rakip Adı, Domain Otoritesi, Anahtar Kelime Sayısı) dahil edileceğini seçin"
                aria-expanded={isCustomizeColumnsOpen}
                aria-haspopup="true"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Sütunları Özelleştir</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-black border border-slate-700">
                  {selectedCsvColumns.length}/{CSV_COLUMN_OPTIONS.length}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isCustomizeColumnsOpen ? "rotate-180 text-white" : ""}`} />
              </button>

              {/* Customize Columns Dropdown Menu */}
              {isCustomizeColumnsOpen && (
                <>
                  {/* Click outside backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsCustomizeColumnsOpen(false)}
                    aria-hidden="true" 
                  />

                  <div 
                    id="menu-customize-csv-columns"
                    data-testid="customize-csv-columns-menu"
                    className="absolute right-0 mt-2 w-[410px] max-w-[92vw] bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl z-50 p-4 space-y-3.5 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                            <span>Sütunları Özelleştir</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold">CSV</span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            CSV dışa aktarımına dahil edilecek sütunları seçin
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCustomizeColumnsOpen(false)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Kapat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        id="btn-csv-preset-competitor"
                        data-testid="csv-preset-competitor"
                        onClick={handleSelectCompetitorPreset}
                        className="px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[11px] font-black transition-all border border-amber-400/40 active:scale-95 flex items-center gap-1 cursor-pointer"
                        title="Örn: Rakip Adı, Domain Otoritesi, Anahtar Kelime Sayısı ve Sıralamalar"
                      >
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>🏆 Rakip Metrikleri (Özel)</span>
                      </button>
                      <button
                        type="button"
                        id="btn-csv-preset-all"
                        data-testid="csv-preset-all"
                        onClick={handleSelectAllCsvColumns}
                        className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                      >
                        Tümünü Seç ({CSV_COLUMN_OPTIONS.length})
                      </button>
                      <button
                        type="button"
                        id="btn-csv-preset-default"
                        data-testid="csv-preset-default"
                        onClick={handleResetCsvColumns}
                        className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all border border-slate-700 active:scale-95 cursor-pointer"
                      >
                        Varsayılan
                      </button>
                    </div>

                    {/* Scrollable Column Categories */}
                    <div className="max-h-72 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                      {/* 1. Competitor Benchmark Group (Explicit User Requirement) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-black text-amber-300 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span>Rakip Analiz Metrikleri</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded-full font-bold">
                            Örn: Rakip Adı, Domain Otoritesi...
                          </span>
                        </div>
                        <div className="bg-slate-950/70 p-1.5 rounded-2xl border border-amber-500/30 space-y-1">
                          {CSV_COLUMN_OPTIONS.filter((c) => c.category === "competitor").map((col) => {
                            const isChecked = selectedCsvColumns.includes(col.id);
                            return (
                              <label
                                key={col.id}
                                className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-amber-400/10 border border-amber-400/30 text-white"
                                    : "hover:bg-slate-800/60 text-slate-400 border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCsvColumn(col.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-600 focus:ring-amber-400 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`text-xs font-bold ${isChecked ? "text-amber-200" : "text-slate-300"}`}>
                                      {col.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                                      {col.exampleValue}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                    {col.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Keyword & Ranking Data Group */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider px-1 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Anahtar Kelime & Sıralama Sütunları</span>
                        </div>
                        <div className="bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 space-y-1">
                          {CSV_COLUMN_OPTIONS.filter((c) => c.category === "ranking").map((col) => {
                            const isChecked = selectedCsvColumns.includes(col.id);
                            return (
                              <label
                                key={col.id}
                                className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-indigo-600/15 border border-indigo-500/30 text-white"
                                    : "hover:bg-slate-800/60 text-slate-400 border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCsvColumn(col.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-400 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`text-xs font-bold ${isChecked ? "text-indigo-200" : "text-slate-300"}`}>
                                      {col.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                                      {col.exampleValue}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                    {col.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Strategic AI & SERP Group */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Stratejik SERP & AI Öngörüleri</span>
                        </div>
                        <div className="bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 space-y-1">
                          {CSV_COLUMN_OPTIONS.filter((c) => c.category === "strategic").map((col) => {
                            const isChecked = selectedCsvColumns.includes(col.id);
                            return (
                              <label
                                key={col.id}
                                className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-white"
                                    : "hover:bg-slate-800/60 text-slate-400 border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCsvColumn(col.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-600 focus:ring-emerald-400 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`text-xs font-bold ${isChecked ? "text-emerald-200" : "text-slate-300"}`}>
                                      {col.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                                      {col.exampleValue}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                    {col.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-medium text-slate-400">
                        <span className="text-amber-400 font-bold">{selectedCsvColumns.length}</span> / {CSV_COLUMN_OPTIONS.length} sütun seçili
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="btn-apply-customize-columns"
                          data-testid="apply-customize-columns-btn"
                          onClick={() => {
                            setIsCustomizeColumnsOpen(false);
                            setDownloadNotification(`CSV sütun yapılandırması güncellendi (${selectedCsvColumns.length} sütun aktif).`);
                            setTimeout(() => setDownloadNotification(null), 3000);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Uygula & Kapat
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* D3.js Grafik Serileri Renk Teması Seçici Butonu */}
            <button
              type="button"
              id="btn-open-color-theme-selector"
              data-testid="open-color-theme-selector-btn"
              onClick={() => setIsColorThemeModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              title="D3.js çubuk ve pasta grafiklerindeki rakip serilerinin renklerini özelleştirin"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Renk Teması</span>
              <div className="flex items-center -space-x-1 ml-0.5">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.user }} />
                <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.comp1 }} />
                <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.comp2 }} />
                <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: colorTheme.comp3 }} />
              </div>
            </button>

            {/* Düzenleme Araç Çubuğu Toggle Button (Header) */}
            <button
              type="button"
              id="btn-toggle-edit-toolbar-header"
              data-testid="btn-toggle-edit-toolbar-header"
              onClick={() => setIsEditToolbarOpen((prev) => !prev)}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                isEditToolbarOpen
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20 ring-2 ring-amber-400/40 font-black"
                  : "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
              title="Tablo başlıklarına ve satır bazlı düzenleme moduna hızlı erişim sağlayan Düzenleme Araç Çubuğunu açın/kapatın"
              aria-expanded={isEditToolbarOpen}
            >
              <Pencil className="w-4 h-4 text-amber-500" />
              <span>Düzenleme Araç Çubuğu</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${isEditToolbarOpen ? "bg-slate-900 text-amber-300" : "bg-slate-700 text-slate-300"}`}>
                {isEditToolbarOpen ? "Açık" : "Kapalı"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isEditToolbarOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Rakip Grubu Oluştur & Performans Ortalamaları Paneli Butonu */}
            <button
              type="button"
              id="btn-open-competitor-group-panel"
              data-testid="open-competitor-group-panel-button"
              onClick={() => {
                setIsGroupManagerOpen(true);
                setTimeout(() => {
                  const el = document.getElementById("competitor-group-manager-panel");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 60);
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/40 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 active:scale-95 group"
              title="Seçilen satırlardan veya otomatik kohortlardan yeni bir Rakip Grubu oluşturun ve bağımsız performans ortalamalarını hesaplayın"
              aria-label="Rakip Grubu Oluştur"
            >
              <Users className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Rakip Grubu Oluştur</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-black border border-indigo-400/40">
                {competitorGroups.length > 0 ? `${competitorGroups.length} Grup` : "Yeni"}
              </span>
            </button>

            {/* Hedef Belirleme (Custom KPI Targets & Competitor Benchmarking) Modülü Butonu */}
            <button
              type="button"
              id="btn-open-kpi-goals-module"
              data-testid="open-kpi-goals-module-button"
              onClick={handleToggleKpiGoalModule}
              className={`px-4 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 group ${
                isKpiGoalModuleOpen
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 border-amber-300 shadow-amber-400/25 ring-2 ring-amber-400/40"
                  : "bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white border-purple-400/40 shadow-purple-900/30"
              }`}
              title="Rakiplerle karşılaştırmak için özel KPI hedefleri (Trafik Artış Hedefi, SEO Skor Hedefi, Top 3 Kapsama ve Sayfa Hızı) belirleyebileceğiniz 'Hedef Belirleme' modülünü açın"
              aria-label="Hedef Belirleme Modülü Aç"
              aria-expanded={isKpiGoalModuleOpen}
            >
              <Target className={`w-4 h-4 transition-transform group-hover:scale-110 ${isKpiGoalModuleOpen ? "text-slate-950 stroke-[2.5]" : "text-amber-300"}`} />
              <span>Hedef Belirleme</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black border ${
                isKpiGoalModuleOpen
                  ? "bg-slate-950 text-amber-300 border-slate-900"
                  : "bg-slate-950/80 text-amber-300 border-indigo-400/40"
              }`}>
                +%{customKpiGoals.trafficGrowthPercent} Trafik | {customKpiGoals.targetSeoScore} Skor
              </span>
            </button>

            {/* Stratejik Notlar Yan Paneli Hızlı Erişim Butonu */}
            <button
              type="button"
              id="btn-open-strategic-notes-drawer"
              data-testid="btn-open-strategic-notes-drawer"
              onClick={() => setIsStrategicNotesDrawerOpen(true)}
              className={`px-4 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 group ${
                isStrategicNotesDrawerOpen
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 border-amber-300 shadow-amber-400/25 ring-2 ring-amber-400/40"
                  : "bg-gradient-to-r from-slate-800 via-slate-800/95 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/40 hover:border-amber-400 shadow-slate-900/40"
              }`}
              title="Tablodaki satırlara hızlıca erişim sağlayıp notları yönetebileceğiniz 'Stratejik Notlar' yan panelini açın"
              aria-label="Stratejik Notlar Yan Panelini Aç"
              aria-expanded={isStrategicNotesDrawerOpen}
            >
              <StickyNote className={`w-4 h-4 transition-transform group-hover:scale-110 ${isStrategicNotesDrawerOpen ? "text-slate-950 stroke-[2.5]" : "text-amber-400"}`} />
              <span>Stratejik Notlar</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                isStrategicNotesDrawerOpen
                  ? "bg-slate-950 text-amber-300 border-slate-900"
                  : "bg-amber-400/20 text-amber-300 border-amber-400/40"
              }`}>
                {notesCount} Not
              </span>
            </button>

            {/* Download Selected as CSV Button */}
            <button
              type="button"
              id="btn-download-selected-csv"
              data-testid="download-selected-csv-button"
              onClick={() => {
                if (selectedRankings.length === 0) {
                  setDownloadNotification("Lütfen önce tablodan indirmek istediğiniz satırları checkbox ile seçin.");
                  setTimeout(() => setDownloadNotification(null), 4000);
                  return;
                }
                handleExportSelectedCsv();
              }}
              className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                selectedRankings.length > 0
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-amber-400/20 font-black ring-2 ring-amber-400/40"
                  : "bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title={
                selectedRankings.length > 0
                  ? `Seçilen ${selectedRankings.length} satırı CSV dosyası olarak indirin`
                  : "Seçili satırları CSV olarak indirmek için önce tablodan seçim yapın"
              }
            >
              <Download className={`w-4 h-4 ${selectedRankings.length > 0 ? "text-slate-950" : "text-amber-400"}`} />
              <span>Seçilileri İndir</span>
              {selectedRankings.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                  {selectedRankings.length}
                </span>
              )}
            </button>

            {/* CSV İçe Aktar (Import External CSV) Button */}
            <button
              type="button"
              id="btn-import-competitor-csv"
              data-testid="import-competitor-csv-button"
              data-action="open-csv-import"
              onClick={() => setIsCsvImportModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-700/25 active:scale-95 group"
              title="Harici bir CSV dosyasındaki rakip verilerini tabloya otomatik olarak yükleyin ve eşleştirin"
              aria-label="CSV Dosyasından Veri İçe Aktar"
            >
              <UploadCloud className="w-4 h-4 text-emerald-200 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" />
              <span>CSV İçe Aktar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-black border border-emerald-400/40">
                Yükle
              </span>
            </button>

            {/* AI Strateji Özet Raporu Button */}
            <button
              type="button"
              id="btn-ai-strategy-summary-report"
              data-testid="ai-strategy-summary-report-button"
              data-action="open-ai-strategy-report"
              onClick={handleOpenStrategyReport}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-300/80 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20 active:scale-95 group"
              title="Tablodaki verileri analiz eden ve stratejik iyileştirme önerileri içeren AI Strateji Özet Raporunu görüntüleyin"
              aria-label="AI Strateji Özet Raporu Oluştur"
            >
              <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>AI Strateji Özet Raporu</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black shadow-xs">
                AI Rapor
              </span>
            </button>

            {/* Farklı Kaydet (Save As: CSV, PDF, JSON) Menu */}
            <TableSaveAsExportMenu
              allRankings={effectiveRankings}
              filteredRankings={filteredAndSortedRankings}
              selectedRankings={selectedRankings}
              userName={userName}
              userDomain={userDomain}
              competitors={effectiveCompetitors}
              goals={keywordGoals}
              strategicNotes={strategicNotes}
              selectedCsvColumns={selectedCsvColumns}
              onOpenPdfModal={handleOpenPdfExportModal}
              onOpenAutoReportScheduler={() => setIsAutoReportModalOpen(true)}
              onOpenImpactAnalysis={() => setIsImpactAnalysisModalOpen(true)}
              onOpen3DScatterPlot={() => setIs3DScatterModalOpen(true)}
              onOpenPerformanceRecommendations={() => {
                setSelectedCompetitorForRecommendations(null);
                setIsRecommendationsDrawerOpen(true);
              }}
              onExportMarketSharePdf={handleDownloadMarketSharePdf}
              onOpenAdvancedExportSettings={() => setIsAdvancedExportModalOpen(true)}
              onOpenCsvImport={() => setIsCsvImportModalOpen(true)}
              onNotification={(msg) => {
                setDownloadNotification(msg);
                setTimeout(() => setDownloadNotification(null), 3500);
              }}
            />

            {/* Pazar Payı ve Rekabet Analiz Raporu (Single-Click Market Share & Competitor PDF) Button */}
            <button
              type="button"
              id="btn-export-market-share-pdf"
              data-testid="export-market-share-pdf-button"
              data-action="export-market-share-pdf"
              onClick={handleDownloadMarketSharePdf}
              disabled={isGeneratingMarketSharePdf}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-700 via-indigo-600 to-indigo-800 hover:from-rose-600 hover:to-indigo-700 text-white border border-rose-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-700/25 active:scale-95 group disabled:opacity-75 disabled:cursor-not-allowed"
              title="Tüm rakip verilerini birleştirerek tek bir tıklamayla PDF formatında profesyonel 'Pazar Payı ve Rekabet Analiz Raporu' oluşturun ve indirin"
              aria-label="Pazar Payı ve Rekabet Analiz Raporu PDF İndir"
            >
              {isGeneratingMarketSharePdf ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>PDF Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-amber-300 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Pazar Payı Raporu</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 text-[10px] font-black border border-rose-400/40 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Tek Tık PDF</span>
                  </span>
                </>
              )}
            </button>

            {/* Profesyonel Rapor Oluşturma Aracı (Marka Logosu & Özel Notlar ile Kapsamlı PDF) Button */}
            <button
              type="button"
              id="btn-open-market-share-report-builder"
              data-testid="open-market-share-report-builder-button"
              data-action="open-market-share-report-builder"
              onClick={() => setIsReportBuilderModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white border border-indigo-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 active:scale-95 group"
              title="Tüm rakip verilerini ve pazar payı analizini tek bir kapsamlı PDF dosyası olarak indirebileceğiniz, marka logolarını ve özel notları içeren profesyonel rapor oluşturma aracını açın"
              aria-label="Profesyonel Rapor Oluşturma Aracı Aç"
            >
              <FileText className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Rapor Oluşturma Aracı</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-black border border-indigo-400/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Logo & Notlar</span>
              </span>
            </button>

            {/* Performans İyileştirme Önerileri (Competitor Performance Recommendations Drawer) Button */}
            <button
              type="button"
              id="btn-open-performance-recommendations-drawer"
              data-testid="open-performance-recommendations-drawer-button"
              data-action="open-performance-recommendations-drawer"
              onClick={() => {
                setSelectedCompetitorForRecommendations(null);
                setIsRecommendationsDrawerOpen(true);
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-600 to-indigo-700 hover:from-emerald-600 hover:to-indigo-600 text-white border border-emerald-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-700/25 active:scale-95 group"
              title="Tablodaki metrikleri analiz ederek her rakip için özelleştirilmiş 'Performans İyileştirme Önerileri' sunan tıklanabilir yan paneli açın"
              aria-label="Performans İyileştirme Önerileri Yan Paneli"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <span>Performans Önerileri</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-black border border-emerald-400/40 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Yan Panel</span>
              </span>
            </button>

            {/* 3D Korelasyon Dağılım Grafiği (3D Scatter & Market Positioning Plane) Button */}
            <button
              type="button"
              id="btn-open-3d-scatter-correlation"
              data-testid="open-3d-scatter-correlation-button"
              data-action="open-3d-scatter-correlation"
              onClick={() => setIs3DScatterModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-700 via-indigo-600 to-purple-700 hover:from-sky-600 hover:to-purple-600 text-white border border-sky-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-sky-700/25 active:scale-95 group"
              title="Rakip verilerini ve anahtar kelimeleri 3D koordinat düzleminde (X, Y, Z eksenleri) görselleştirerek pazar konumlandırmasını ve korelasyonunu analiz eden interaktif 3D katman"
              aria-label="3D Korelasyon Dağılım Grafiği"
            >
              <Box className="w-4 h-4 text-sky-200 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <span>3D Korelasyon</span>
              <span className="px-1.5 py-0.5 rounded-full bg-sky-950/80 text-sky-300 text-[10px] font-black border border-sky-400/40 flex items-center gap-1">
                <Compass className="w-3 h-3 text-sky-400" />
                <span>3D Düzlem</span>
              </span>
            </button>

            {/* Etki Analizi (Impact Analysis & Correlation Heatmap Overlay) Button */}
            <button
              type="button"
              id="btn-open-impact-analysis"
              data-testid="open-impact-analysis-button"
              data-action="open-impact-analysis"
              onClick={() => setIsImpactAnalysisModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border border-purple-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-700/25 active:scale-95 group"
              title="Seçili rakip metrikleri (hız, görünürlük, kelime sayısı, KD) ile belirlenen hedefler arasındaki korelasyonu ve başarıyı en çok etkileyen faktörleri gösteren Isı Haritası katmanı"
              aria-label="Etki Analizi Isı Haritası"
            >
              <Activity className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
              <span>Etki Analizi</span>
              <span className="px-1.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-black border border-purple-400/40 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Isı Haritası</span>
              </span>
            </button>

            {/* Otomatik Raporlama (Automated Weekly Report Scheduler) Button */}
            <button
              type="button"
              id="btn-auto-report-schedule"
              data-testid="auto-report-schedule-button"
              data-action="open-auto-report-scheduler"
              onClick={() => setIsAutoReportModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white border border-indigo-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-700/25 active:scale-95 group"
              title="Tablodaki verilerin haftalık otomatik özet raporu olarak kayıtlı e-posta adresine PDF/CSV formatında gönderilmesini sağlayan Otomatik Raporlama zamanlayıcısı"
              aria-label="Otomatik Raporlama Zamanlayıcısı"
            >
              <CalendarClock className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
              <span>Otomatik Raporlama</span>
              {autoReportConfig.enabled ? (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-black border border-emerald-400/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Haftalık: Aktif</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950/70 text-slate-400 text-[10px] font-bold border border-slate-700">
                  Zamanlayıcı
                </span>
              )}
            </button>

            {/* Excel Olarak Dışa Aktar (.xlsx) Quick Button */}
            <button
              type="button"
              id="btn-export-as-excel"
              data-testid="export-as-excel-button"
              data-action="export-excel"
              onClick={() => handleExportExcel(true)}
              className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-800/30 active:scale-95 group"
              title="Tablodaki tüm verileri doğrudan .xlsx (Microsoft Excel) formatında indirin"
              aria-label="Excel Olarak Dışa Aktar"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
              <span>Excel Olarak Dışa Aktar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-black border border-emerald-400/40">
                .xlsx
              </span>
            </button>

            {/* Dışa Aktar (Export as CSV) Buton Grubu & Gelişmiş Ayarlar Butonu */}
            <div className="inline-flex items-center rounded-2xl shadow-md shadow-emerald-600/25">
              <button
                type="button"
                id="btn-export-as-csv"
                data-testid="export-as-csv-button"
                data-action="export-csv"
                onClick={() => handleExportCsv(true)}
                className="px-4 py-2 rounded-l-2xl bg-emerald-600 hover:bg-emerald-500 text-white border-y border-l border-emerald-400/40 text-xs font-black flex items-center gap-2 transition-all cursor-pointer active:scale-95 group"
                title="Tablodaki tüm verileri CSV formatında indirin (Dışa Aktar)"
                aria-label="Dışa Aktar"
              >
                <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
                <span>Dışa Aktar</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 text-[10px] font-black border border-emerald-400/30">
                  CSV
                </span>
              </button>
              <button
                type="button"
                id="btn-export-as-csv-advanced-settings"
                data-testid="export-as-csv-advanced-settings-button"
                data-action="open-advanced-export-settings"
                onClick={() => setIsAdvancedExportModalOpen(true)}
                className="px-2.5 py-2 rounded-r-2xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 border border-emerald-400/50 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 group"
                title="Dışa Aktarma Gelişmiş Ayarları (PDF & JSON Özel Sıkıştırma ve Formatlama Penceresi)"
                aria-label="Dışa Aktarma Gelişmiş Ayarlarını Aç"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-200 group-hover:rotate-45 transition-transform" />
              </button>
            </div>

            {/* Gelişmiş Dışa Aktarma Butonu (PDF & JSON Özel Sıkıştırma ve Formatlama Penceresi) */}
            <button
              type="button"
              id="btn-open-advanced-export-settings"
              data-testid="open-advanced-export-settings-button"
              data-action="open-advanced-export-settings"
              onClick={() => setIsAdvancedExportModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 hover:from-emerald-600 hover:to-indigo-700 text-white border border-emerald-400/50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-900/30 active:scale-95 group"
              title="PDF ve JSON dosyaları için özel sıkıştırma düzeyi (Düşük/Orta/Yüksek) ve veri formatlama seçenekleri penceresini açın"
              aria-label="Gelişmiş Dışa Aktar (PDF & JSON)"
            >
              <Sliders className="w-4 h-4 text-emerald-200 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <span>Gelişmiş Dışa Aktar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950/70 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                PDF &bull; JSON
              </span>
            </button>

            {/* Copy CSV String Button */}
            <button
              type="button"
              id="btn-copy-csv-string"
              data-testid="copy-csv-string-button"
              onClick={handleCopyCsvString}
              className="px-3.5 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Tablo başlıklarını ve sıralama satırlarını temiz CSV formatında panoya kopyalayın"
            >
              {isCsvCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">CSV Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>CSV Kopyala</span>
                </>
              )}
            </button>

            {onRefresh && (
              <button
                type="button"
                id="btn-refresh-rankings"
                onClick={onRefresh}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                <Zap className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-300" : ""}`} />
                <span>{isLoading ? "Taranıyor..." : "Yenile"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Download Notification Toast */}
        {downloadNotification && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{downloadNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadNotification(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          
          {/* Card 1: Leading */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Lider Konumda
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.leadingCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">1. sırada veya rakiplerin önünde</p>
          </div>

          {/* Card 2: Competing */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-indigo-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                İlk 3 Rekabeti
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.competingCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">2-4. sıra arası yakın takip</p>
          </div>

          {/* Card 3: Trailing */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-rose-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Rakip Önde
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.outrankedCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">Rakiplerin sizden üstte olduğu</p>
          </div>

          {/* Card 4: Missing Gap */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                İçerik Boşluğu
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.missingCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">İlk 20'de bulunmayan kelimeler</p>
          </div>

          {/* Card 5: Traffic Opportunity */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Trafik Fırsatı
              </span>
              <span className="text-xs font-black text-emerald-400">{summaryMetrics.trafficPotential}</span>
            </div>
            <p className="text-[11px] text-slate-400">SERP farkı kapandığında tahmini kazanç</p>
          </div>
        </div>
      </div>

      {/* 1.2 HIZLI CSV YÜKLEME VE VERİ EŞLEŞTİRME SİHİRBAZI BARI */}
      <QuickCsvUploadBar
        onFileSelected={handleProcessCsvFile}
        onOpenWizard={handleOpenWizardDirectly}
        onLoadSample={handleQuickUploadSample}
        userName={userName}
        competitors={effectiveCompetitors}
        totalKeywordsCount={effectiveRankings.length}
      />

      {/* 1.5 PAZAR PAYI PASTA GRAFİĞİ & RAKİP METRİKLERİ KIYASLAMA MODÜLÜ */}
      {isMarketSharePieVisible && (
        <CompetitorMarketSharePieChart
          rankings={effectiveRankings}
          competitors={effectiveCompetitors}
          userName={userName}
          userDomain={userDomain}
          colorPalette={colorTheme}
          onOpenColorThemeSelector={() => setIsColorThemeModalOpen(true)}
          onSelectCompetitorFilter={handleCompetitorFilterFromPie}
          onExportMarketSharePdf={handleDownloadMarketSharePdf}
          onOpenReportBuilder={() => setIsReportBuilderModalOpen(true)}
          onExportExcel={() => handleExportExcel(true)}
        />
      )}

      {/* 2. TOP 5 KEYWORDS SELECTOR STRIP (HER RAKİP İÇİN EN ÖNEMLİ 5 KELİME) */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>En Önemli 5 Kelime Filtresi:</span>
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "Tüm Kelimeler" },
              { id: "top5_overall", label: "En Yüksek Hacimli 5 Kelime" },
              { id: "comp1", label: `${comp1.name.split(" ")[0]} Top 5` },
              { id: "comp2", label: `${comp2.name.split(" ")[0]} Top 5` },
              { id: "comp3", label: `${comp3.name.split(" ")[0]} Top 5` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTopEntityFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  topEntityFilter === f.id
                    ? "bg-amber-400 text-slate-950 font-black border-amber-300 shadow-xs"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>Gösterilen: <strong>{filteredAndSortedRankings.length}</strong> / {effectiveRankings.length}</span>
        </div>
      </div>

      {/* 3. D3.JS BAR CHART OR TABULAR VIEW */}
      {viewMode === "chart" ? (
        <CompetitorRankingD3BarChart
          rankings={filteredAndSortedRankings}
          userName={userName}
          competitors={effectiveCompetitors}
          colorPalette={colorTheme}
          onOpenColorThemeSelector={() => setIsColorThemeModalOpen(true)}
        />
      ) : viewMode === "pie" ? (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <PieChart className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-lg mx-auto">
            <h4 className="text-base font-black text-white">
              Pazar Payı Pasta Grafiği ve Rakip Kıyaslama Modu
            </h4>
            <p className="text-xs text-slate-400">
              Yukarıdaki interaktif pasta grafiğinden rakiplerin pazar paylarını ve organik görünürlüklerini inceleyin. 
              Detaylı anahtar kelime tablosuna geçmek için aşağıdaki butona tıklayabilirsiniz.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Tablo Görünümüne Geç</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadMarketSharePdf}
              disabled={isGeneratingMarketSharePdf}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-60"
            >
              <FileDown className="w-4 h-4" />
              <span>PDF Rapor İndir</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3.0 DYNAMIC METRIC FILTERING & SORTING PANEL */}
          <MetricFilteringPanel
            rankings={effectiveRankings}
            visibleCount={filteredAndSortedRankings.length}
            totalCount={effectiveRankings.length}
            hiddenCount={effectiveRankings.length - filteredAndSortedRankings.length}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            minVolume={minVolume}
            onMinVolumeChange={setMinVolume}
            minDifficulty={minDifficulty}
            onMinDifficultyChange={setMinDifficulty}
            minTrafficOpportunity={minTrafficOpportunity}
            onMinTrafficOpportunityChange={setMinTrafficOpportunity}
            maxRankLimit={maxRankLimit}
            onMaxRankLimitChange={setMaxRankLimit}
            activePreset={activeMetricPreset}
            onApplyPreset={handleApplyMetricPreset}
            onResetAllFilters={handleResetAllMetricFilters}
            isOpen={isMetricFilterPanelOpen}
            onToggleOpen={() => setIsMetricFilterPanelOpen((prev) => !prev)}
            competitors={effectiveCompetitors}
            userName={userName}
          />

          {/* 3.0.1 GOOGLE PAGESPEED INSIGHTS: CORE WEB VITALS COMPETITOR SPEED SCORE CARDS */}
          <CompetitorSpeedScoreCards
            competitors={effectiveCompetitors}
            userName={userName}
            userDomain={userDomain}
            userSpeedScore={98}
            isOpen={isSpeedScoreCardsOpen}
            onToggleOpen={() => setIsSpeedScoreCardsOpen((prev) => !prev)}
            highlightedCompetitorId={highlightedCompetitorSpeedId}
          />

          {/* 3.0.2 GELİŞİM İZLEME MODU (GOAL TRACKING SUMMARY PANEL) */}
          {isGoalTrackingMode && (
            <GoalTrackingSummaryPanel
              totalItems={effectiveRankings.length}
              goals={keywordGoals}
              rankings={effectiveRankings}
              onApplyBulkTarget={handleApplyBulkTarget}
              onApplyDynamicBeatCompetitorTargets={handleApplyDynamicBeatCompetitorTargets}
              onResetGoals={handleResetGoals}
              onClose={() => setIsGoalTrackingMode(false)}
            />
          )}

          {/* 3.1 SEARCH, STATUS, INTENT & SORT CONTROLS */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Left: Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Anahtar kelime, arama niyeti veya Gemini tavsiyesi ara..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Right: Filters and Sorting */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
                  {[
                    { id: "all", label: `Tümü (${effectiveRankings.length})` },
                    { id: "selected", label: `☑️ Seçilenler (${selectedRankings.length})` },
                    { id: "with_notes", label: `📝 Notlu (${notesCount})` },
                    { id: "outranked", label: `🚨 Rakip Önde (${summaryMetrics.outrankedCount})` },
                    { id: "leading", label: `🏆 Lider (${summaryMetrics.leadingCount})` },
                    { id: "competing", label: `⚔️ İlk 3 (${summaryMetrics.competingCount})` },
                    { id: "trailing", label: `⚠️ Geride (${summaryMetrics.trailingCount})` },
                    { id: "missing", label: `🎯 Eksik (${summaryMetrics.missingCount})` }
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === tab.id
                          ? "bg-white text-indigo-700 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Intent Filter */}
                <select
                  id="select-ranking-intent-filter"
                  value={intentFilter}
                  onChange={(e) => setIntentFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">Tüm Arama Niyetleri</option>
                  <option value="Acil">Acil / Yerel Niyet</option>
                  <option value="Ticari">Ticari Niyet</option>
                  <option value="İşlemsel">İşlemsel Niyet</option>
                  <option value="Bilgilendirici">Bilgilendirici Niyet</option>
                </select>

                {/* Sort By Selector */}
                <select
                  id="select-ranking-sort-by"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const parts = e.target.value.split("-");
                    const so = parts.pop() as "asc" | "desc";
                    const sb = parts.join("-") as RankingSortField;
                    setSortBy(sb);
                    setSortOrder(so);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  title="Sıralama kriterini seçin"
                >
                  <option value="userRank-asc">Sitenizin Sıralaması (En İyi Sıra - Keyword Rank)</option>
                  <option value="manual-asc">Manuel Sıralama (Sürükle-Bırak Özel Sırası)</option>
                  <option value="userRank-desc">Sitenizin Sıralaması (En Düşük Sıra)</option>
                  <option value="volume-desc">Arama Hacmi (En Yüksek - Search Volume)</option>
                  <option value="volume-asc">Arama Hacmi (En Düşük - Low Volume)</option>
                  <option value="traffic-desc">Trafik Fırsatı (En Yüksek - High Traffic Gain)</option>
                  <option value="traffic-asc">Trafik Fırsatı (En Düşük)</option>
                  <option value="difficulty-desc">SEO Skoru / Zorluk (En Zor - High KD)</option>
                  <option value="difficulty-asc">SEO Skoru / Zorluk (En Kolay - Low KD)</option>
                  <option value="competitorName-asc">Rakip Adı (A'dan Z'ye - Competitor Name)</option>
                  <option value="competitorName-desc">Rakip Adı (Z'den A'ya)</option>
                  <option value="keyword-asc">Anahtar Kelime (A-Z)</option>
                  <option value="keyword-desc">Anahtar Kelime (Z-A)</option>
                  <option value="gap-desc">Sıralama Farkı (En Büyük Fırsat)</option>
                  <option value="comp1Rank-asc">1. Rakip Sıralaması ({comp1.name.split(" ")[0]})</option>
                  <option value="comp2Rank-asc">2. Rakip Sıralaması ({comp2.name.split(" ")[0]})</option>
                  <option value="comp3Rank-asc">3. Rakip Sıralaması ({comp3.name.split(" ")[0]})</option>
                  <option value="goalAttainment-desc">Hedef Başarım Oranı (En Yüksek %)</option>
                  <option value="goalAttainment-asc">Hedef Başarım Oranı (En Düşük %)</option>
                  <option value="goalDeviation-asc">Hedef Sapması (Hedefe En Yakın / Sıfır Sapma)</option>
                  <option value="goalDeviation-desc">Hedef Sapması (En Yüksek Sapma)</option>
                </select>

                {/* Excel Olarak Dışa Aktar Button (Toolbar) */}
                <button
                  type="button"
                  id="btn-table-toolbar-export-excel"
                  data-testid="table-toolbar-export-excel-btn"
                  data-action="export-excel"
                  onClick={() => handleExportExcel(true)}
                  className="py-1.5 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-emerald-500/80 shrink-0"
                  title="Tablodaki tüm verileri doğrudan .xlsx (Excel) formatında indirin"
                  aria-label="Excel Olarak Dışa Aktar"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Excel Olarak Dışa Aktar</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] font-black">
                    .xlsx
                  </span>
                </button>

                {/* Dışa Aktar Button (Toolbar) & Gelişmiş Ayarlar */}
                <div className="inline-flex items-center rounded-xl shadow-xs shrink-0">
                  <button
                    type="button"
                    id="btn-table-toolbar-export-csv"
                    data-testid="table-toolbar-export-csv-btn"
                    onClick={() => handleExportCsv(true)}
                    className="py-1.5 px-3.5 rounded-l-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-y border-l border-emerald-500"
                    title="Tablodaki tüm verileri CSV formatında indirin"
                    aria-label="Dışa Aktar"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Dışa Aktar</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-100 text-[10px] font-black">
                      CSV
                    </span>
                  </button>
                  <button
                    type="button"
                    id="btn-table-toolbar-advanced-export"
                    data-testid="table-toolbar-advanced-export-btn"
                    onClick={() => setIsAdvancedExportModalOpen(true)}
                    className="py-1.5 px-2 rounded-r-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-emerald-200 text-xs font-bold flex items-center transition-all cursor-pointer border border-emerald-400/60"
                    title="Gelişmiş Dışa Aktarma Ayarları (PDF & JSON Sıkıştırma ve Formatlama)"
                    aria-label="Gelişmiş Dışa Aktarma Ayarları"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-200 hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Metrik Filtreleme Paneli Aç/Kapat Butonu (Toolbar) */}
                <button
                  type="button"
                  id="btn-toggle-metric-filter-panel"
                  data-testid="btn-toggle-metric-filter-panel"
                  onClick={() => setIsMetricFilterPanelOpen((prev) => !prev)}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                    isMetricFilterPanelOpen
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-indigo-500/20"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title="Tüm rakip verilerini metrik tipine göre sıralayan veya metrik eşiğinden düşük olanları gizleyen Metrik Filtreleme Panelini açın/kapatın"
                >
                  <SlidersHorizontal className={`w-3.5 h-3.5 ${isMetricFilterPanelOpen ? "text-amber-300" : "text-indigo-600"}`} />
                  <span>Metrik Filtresi</span>
                  {activeMetricFiltersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                      {activeMetricFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMetricFilterPanelOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Düzenleme Araç Çubuğu Toggle Button (Toolbar) */}
                <button
                  type="button"
                  id="btn-toggle-edit-toolbar-toolbar"
                  data-testid="btn-toggle-edit-toolbar-toolbar"
                  onClick={() => setIsEditToolbarOpen((prev) => !prev)}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                    isEditToolbarOpen
                      ? "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title="Tablo başlıklarına ve satır düzenleme moduna hızlı erişim sağlayan Düzenleme Araç Çubuğunu açın/kapatın"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-600" />
                  <span>Düzenleme Araçları</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isEditToolbarOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Google PageSpeed Insights Hız Skor Kartı Toggle Button */}
                <button
                  type="button"
                  id="btn-toggle-speed-cards"
                  data-testid="btn-toggle-speed-cards"
                  onClick={() => setIsSpeedScoreCardsOpen((prev) => !prev)}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                    isSpeedScoreCardsOpen
                      ? "bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800 shadow-slate-900/20"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title="Google PageSpeed Insights ve Core Web Vitals Hız Skor Kartını açın/kapatın"
                >
                  <Zap className={`w-3.5 h-3.5 ${isSpeedScoreCardsOpen ? "text-amber-400" : "text-amber-600"}`} />
                  <span>Hız Skor Kartı (PSI)</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] font-mono">
                    CWV 98
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSpeedScoreCardsOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Stratejik Notlar Hızlı Filtre / Göster Butonu */}
                <button
                  type="button"
                  id="btn-toggle-notes-filter"
                  data-testid="btn-toggle-notes-filter"
                  onClick={() => setStatusFilter((cur) => (cur === "with_notes" ? "all" : "with_notes"))}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                    statusFilter === "with_notes"
                      ? "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400 shadow-amber-300/30 ring-1 ring-amber-400"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title="Stratejik not eklenmiş rakipleri filtreleyin veya görüntüleyin"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                  <span>Stratejik Notlar</span>
                  <span className={`px-1.5 py-0.2 rounded-full font-black text-[10px] font-mono ${
                    statusFilter === "with_notes" ? "bg-amber-400 text-amber-950" : "bg-slate-200 text-slate-700"
                  }`}>
                    {notesCount}
                  </span>
                </button>

                {/* Gelişim İzleme Modu (Hedef Değer & Sapma) Toggle Button */}
                <button
                  type="button"
                  id="btn-toggle-goal-tracking-mode"
                  data-testid="btn-toggle-goal-tracking-mode"
                  onClick={() => {
                    setIsGoalTrackingMode((prev) => {
                      const next = !prev;
                      try {
                        localStorage.setItem("seo_goal_tracking_mode", String(next));
                      } catch (_) {}
                      return next;
                    });
                  }}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                    isGoalTrackingMode
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-indigo-600/25 ring-2 ring-indigo-300"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title="Kullanıcıların rakip metriklerine göre Hedef Değer sütunu ekleyebileceği ve sapmaları yüzdesel gösteren Gelişim İzleme modunu açın/kapatın"
                >
                  <Target className={`w-3.5 h-3.5 ${isGoalTrackingMode ? "text-amber-300" : "text-indigo-600"}`} />
                  <span>Gelişim İzleme</span>
                  <span className={`px-1.5 py-0.2 rounded-full font-black text-[10px] ${
                    isGoalTrackingMode ? "bg-amber-400 text-slate-950 font-mono" : "bg-slate-200 text-slate-700 font-mono"
                  }`}>
                    {isGoalTrackingMode ? "Aktif" : "Kapalı"}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isGoalTrackingMode ? "rotate-180" : ""}`} />
                </button>

                {/* Farklılıkları Vurgula (Diff View) Modu Toggle Button */}
                <button
                  type="button"
                  id="btn-toggle-diff-view-mode"
                  data-testid="btn-toggle-diff-view-mode"
                  onClick={handleToggleDiffView}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                    isDiffViewMode
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-400 font-black shadow-amber-400/25 ring-2 ring-amber-300"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title="İki veya daha fazla rakip satırını seçerek aralarındaki metrik farklarını ve varyasyonları vurgulayan Diff View modunu açın/kapatın"
                >
                  <GitCompare className={`w-3.5 h-3.5 ${isDiffViewMode ? "text-slate-950 stroke-[2.5]" : "text-indigo-600"}`} />
                  <span>Farklılıkları Vurgula</span>
                  <span className={`px-1.5 py-0.2 rounded-full font-black text-[10px] font-mono ${
                    isDiffViewMode ? "bg-slate-950 text-amber-300" : "bg-slate-200 text-slate-700"
                  }`}>
                    {isDiffViewMode ? `Diff (${selectedRankings.length})` : "Diff View"}
                  </span>
                </button>

                {/* 6 Aylık Trend Tahmin Çizgisi Modu Toggle Button */}
                <button
                  type="button"
                  id="btn-toggle-trend-forecast-mode"
                  data-testid="btn-toggle-trend-forecast-mode"
                  onClick={handleToggleTrendForecastModule}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                    isTrendForecastModuleOpen
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 font-black shadow-indigo-600/25 ring-2 ring-indigo-400"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title="Her rakip için mevcut metriklerle hesaplanan önümüzdeki 6 ay öngörülen büyüme oranları ve d3.js Trend Tahmin Çizgisi modülünü açın/kapatın"
                >
                  <TrendingUp className={`w-3.5 h-3.5 ${isTrendForecastModuleOpen ? "text-amber-300 stroke-[2.5]" : "text-indigo-600"}`} />
                  <span>Trend Tahmin Çizgisi</span>
                  <span className={`px-1.5 py-0.2 rounded-full font-black text-[10px] font-mono ${
                    isTrendForecastModuleOpen ? "bg-indigo-950 text-amber-300" : "bg-slate-200 text-slate-700"
                  }`}>
                    {isTrendForecastModuleOpen ? "d3.js Aktif" : "6-Ay Tahmin"}
                  </span>
                </button>

                {/* Stratejik Notlar Yan Paneli Hızlı Erişim Butonu (Tablo Üstü) */}
                <button
                  type="button"
                  id="btn-toggle-notes-drawer-filterbar"
                  data-testid="btn-toggle-notes-drawer-filterbar"
                  onClick={() => setIsStrategicNotesDrawerOpen(true)}
                  className="py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 hover:border-amber-400"
                  title="Stratejik Notlar Yan Panelini açarak tüm satırların notlarını merkezi olarak inceleyin ve düzenleyin"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                  <span>Stratejik Notlar</span>
                  <span className="px-1.5 py-0.2 rounded-full font-black text-[10px] font-mono bg-amber-200 text-amber-900 border border-amber-300">
                    {notesCount} Not
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Header Sort Shortcuts Strip */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hızlı Sıralama:</span>
              </span>

              <button
                type="button"
                id="btn-sort-by-trend-growth"
                onClick={() => handleHeaderSort("trendGrowth")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === "trendGrowth"
                    ? "bg-indigo-600 text-white shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="6 aylık öngörülen büyüme trendine göre sırala (d3.js Engine)"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>6-Ay Trendi</span>
                {renderSortIcon("trendGrowth")}
              </button>
              
              <button
                type="button"
                id="btn-sort-by-user-rank"
                onClick={() => handleHeaderSort("userRank")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === "userRank"
                    ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Sitenizin Google sıralamasına göre sırala (Keyword Rank)"
              >
                <span>Sıralama</span>
                {renderSortIcon("userRank")}
              </button>

              <button
                type="button"
                id="btn-sort-by-volume"
                onClick={() => handleHeaderSort("volume")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === "volume"
                    ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Aylık Google arama hacmine göre sırala (Search Volume)"
              >
                <span>Hacim (Volume)</span>
                {renderSortIcon("volume")}
              </button>

              <button
                type="button"
                id="btn-sort-by-traffic"
                onClick={() => handleHeaderSort("traffic")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === "traffic"
                    ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Trafik fırsatı / ziyaretçi artış potansiyeline göre sırala (Traffic Gain)"
              >
                <span>Trafik Fırsatı</span>
                {renderSortIcon("traffic")}
              </button>

              <button
                type="button"
                id="btn-sort-by-difficulty"
                onClick={() => handleHeaderSort("difficulty")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === "difficulty"
                    ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="SEO Skoru / Anahtar Kelime Zorluğuna (KD) göre sırala"
              >
                <span>SEO Skoru (KD)</span>
                {renderSortIcon("difficulty")}
              </button>

              <button
                type="button"
                id="btn-sort-by-competitor-name"
                onClick={() => handleHeaderSort("competitorName")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === "competitorName"
                    ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Lider rakip adına göre alfabetik sırala (Competitor Name)"
              >
                <span>Rakip Adı</span>
                {renderSortIcon("competitorName")}
              </button>

              <button
                type="button"
                id="btn-sort-by-gap"
                onClick={() => handleHeaderSort("gap")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === "gap"
                    ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Sıralama farkına göre sırala"
              >
                <span>Fark (Gap)</span>
                {renderSortIcon("gap")}
              </button>

              <button
                type="button"
                id="btn-sort-by-manual"
                data-testid="btn-sort-by-manual"
                onClick={() => {
                  setSortBy("manual");
                  setSortOrder("asc");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sortBy === "manual"
                    ? "bg-indigo-600 text-white shadow-xs font-black ring-2 ring-indigo-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Manuel sıralama modunu aç (Sürükle-Bırak Özel Sırası)"
              >
                <GripVertical className="w-3.5 h-3.5 text-amber-300" />
                <span>Manuel Sıra</span>
                {manualRowOrder.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Özel sıralama kayıtlı" />
                )}
              </button>

              {sortBy === "manual" && manualRowOrder.length > 0 && (
                <button
                  type="button"
                  id="btn-reset-manual-order"
                  data-testid="btn-reset-manual-order"
                  onClick={handleResetManualOrder}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Manuel sıralamayı sıfırla ve varsayılan sıralamaya dön"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Sıfırla</span>
                </button>
              )}
            </div>
          </div>

          {/* 3.1.5 BULK ACTION TOOLBAR FOR SELECTED ROWS */}
          {selectedRankings.length > 0 && (
            <div 
              id="seo-competitor-bulk-action-bar"
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/50 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 animate-fade-in"
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedRankings.length} Seçildi</span>
                </span>
                <span className="text-xs text-indigo-200 font-medium">
                  Seçilen rakipleri ve anahtar kelimeleri toplu analiz edin:
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Action 1: Compare on Separate Chart */}
                <button
                  type="button"
                  id="btn-bulk-compare-chart"
                  data-testid="bulk-compare-chart-button"
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-400/20 active:scale-95"
                  title="Seçilen kelimeleri ve rakipleri özel D3.js grafiğinde ayrı bir pencerede karşılaştırın"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                  <span>Ayrı Grafikte Karşılaştır</span>
                </button>

                {/* Action 1.2: Farklılıkları Vurgula (Diff View) */}
                <button
                  type="button"
                  id="btn-bulk-diff-view"
                  data-testid="btn-bulk-diff-view"
                  onClick={handleToggleDiffView}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 border ${
                    isDiffViewMode
                      ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 shadow-amber-400/25"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 shadow-indigo-600/30"
                  }`}
                  title="Seçilen 2 veya daha fazla rakip satırı arasındaki metrik farklarını ve varyasyonlarını vurgulayın"
                >
                  <GitCompare className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isDiffViewMode ? "Diff View Açık" : "Farklılıkları Vurgula"}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                    isDiffViewMode ? "bg-slate-950 text-amber-300" : "bg-indigo-950 text-indigo-200"
                  }`}>
                    {selectedRankings.length >= 2 ? `${selectedRankings.length} Satır` : "Diff"}
                  </span>
                </button>

                {/* Action 1.5: Export Selected as PDF (Seçilileri PDF Yap) */}
                <button
                  type="button"
                  id="btn-bulk-export-pdf"
                  data-testid="bulk-export-pdf-button"
                  data-action="export-pdf-selected"
                  onClick={handleDownloadSelectedPdf}
                  disabled={isGeneratingMarketSharePdf}
                  className={`px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/30 active:scale-95 border border-indigo-400/40 ${
                    isGeneratingMarketSharePdf ? "opacity-75 cursor-wait" : ""
                  }`}
                  title="Seçili anahtar kelimeleri içeren profesyonel Pazar Payı ve Rekabet Analiz Raporunu PDF olarak indirin"
                >
                  {isGeneratingMarketSharePdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>PDF Hazırlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5 text-amber-300" />
                      <span>Seçilileri PDF Yap</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-black border border-indigo-400/40">
                        PDF
                      </span>
                    </>
                  )}
                </button>

                {/* Action 2: Bulk Add to Targets */}
                {onApplyKeyword && (
                  <button
                    type="button"
                    id="btn-bulk-add-targets"
                    data-testid="bulk-add-targets-button"
                    onClick={handleBulkAddToTargets}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Seçili tüm kelimeleri SEO hedeflerinize ekleyin"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Hedeflere Ekle ({selectedRankings.length})</span>
                  </button>
                )}

                {/* Action 2.5: Customize CSV Columns */}
                <button
                  type="button"
                  id="btn-bulk-customize-csv-columns"
                  data-testid="bulk-customize-csv-columns-button"
                  onClick={() => setIsCustomizeColumnsOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border border-slate-700"
                  title="CSV dosyasına hangi sütunların ekleneceğini özelleştirin"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sütunları Özelleştir ({selectedCsvColumns.length})</span>
                </button>

                {/* Action 3: Export Selected as Excel */}
                <button
                  type="button"
                  id="btn-bulk-export-excel"
                  data-testid="bulk-export-excel-button"
                  data-action="export-excel-selected"
                  onClick={() => handleExportSelectedExcel()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Yalnızca seçilen satırları doğrudan .xlsx (Excel) formatında indirin"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Seçilileri Excel İndir</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-black">
                    .xlsx
                  </span>
                </button>

                {/* Action 3.5: Export Selected as CSV */}
                <button
                  type="button"
                  id="btn-bulk-export-csv"
                  data-testid="bulk-export-csv-button"
                  onClick={() => handleExportSelectedCsv()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Yalnızca seçilen satırları içeren özel CSV dosyasını indirin"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Seçilileri İndir</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-700 text-emerald-100 text-[10px] font-black">
                    {selectedRankings.length}
                  </span>
                </button>

                {/* Action 4: Copy Selected as CSV */}
                <button
                  type="button"
                  id="btn-bulk-copy-csv"
                  data-testid="bulk-copy-csv-button"
                  onClick={handleCopySelectedCsv}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Seçilen satırları CSV formatında kopyalayın"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopyala</span>
                </button>

                {/* Action 5: Bulk Delete Selected Rows */}
                <button
                  type="button"
                  id="btn-bulk-delete-selected"
                  data-testid="bulk-delete-selected-button"
                  onClick={handleBulkDeleteSelected}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Seçilen tüm rakip satırlarını tablodan kaldırın"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Seçilileri Sil</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-700 text-rose-100 text-[10px] font-black">
                    {selectedRankings.length}
                  </span>
                </button>

                {/* Action 6: Clear Selection */}
                <button
                  type="button"
                  id="btn-bulk-clear-selection"
                  data-testid="bulk-clear-selection-button"
                  onClick={clearSelection}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                  title="Tüm seçimleri temizle"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Temizle</span>
                </button>
              </div>
            </div>
          )}

          {/* Save & Update Notification Banner */}
          {saveToast && (
            <div 
              id="seo-table-save-notification"
              data-testid="seo-table-save-notification"
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1"
            >
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveToast}</span>
              </div>
              <div className="flex items-center gap-2">
                {lastManualOrderBackup && (
                  <button
                    type="button"
                    id="btn-undo-reorder-toast"
                    data-testid="btn-undo-reorder-toast"
                    onClick={handleUndoReorder}
                    className="text-xs font-bold text-indigo-700 underline hover:text-indigo-950 cursor-pointer transition-colors"
                  >
                    Taşımayı Geri Al
                  </button>
                )}
                {deletedRowIds.length > 0 && (
                  <button
                    type="button"
                    id="btn-undo-delete-toast"
                    data-testid="btn-undo-delete-toast"
                    onClick={handleRestoreDeletedRows}
                    className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer transition-colors"
                  >
                    Geri Al
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSaveToast(null)}
                  className="p-1 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 cursor-pointer transition-colors"
                  title="Kapat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Active Row Overrides Indicator */}
          {Object.keys(rowOverrides).length > 0 && (
            <div 
              id="seo-table-overrides-indicator"
              className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 shadow-2xs"
            >
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  <strong>{Object.keys(rowOverrides).length}</strong> satırda rakip adı veya metrikler güncellendi. D3.js grafiği ve CSV dışa aktarımı güncel değerleri kullanıyor.
                </span>
              </div>
              <button
                type="button"
                id="btn-reset-row-overrides"
                data-testid="btn-reset-row-overrides"
                onClick={handleResetRowOverrides}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-rose-700 bg-white hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-amber-300 hover:border-rose-300 cursor-pointer transition-all shadow-2xs"
                title="Tüm satır düzenlemelerini sıfırla ve varsayılan SERP verilerine dön"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Orijinal Değerlere Dön</span>
              </button>
            </div>
          )}

          {/* Deleted Rows Indicator Banner */}
          {deletedRowIds.length > 0 && (
            <div 
              id="seo-table-deleted-rows-indicator"
              data-testid="seo-table-deleted-rows-indicator"
              className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 text-rose-950 shadow-2xs animate-in fade-in"
            >
              <div className="flex items-center gap-2 font-medium">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>{deletedRowIds.length}</strong> rakip satırı tablodan kaldırıldı. Grafikler ve dışa aktarım güncel listeyi yansıtır.
                </span>
              </div>
              <button
                type="button"
                id="btn-restore-deleted-rows"
                data-testid="btn-restore-deleted-rows"
                onClick={handleRestoreDeletedRows}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-rose-300 hover:border-emerald-300 cursor-pointer transition-all shadow-2xs"
                title="Kaldırılan tüm satırları tabloya geri yükle"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Kaldırılan Satırları Geri Yükle ({deletedRowIds.length})</span>
              </button>
            </div>
          )}

          {/* 3.1.8 COLLAPSIBLE EDITING TOOLBAR (DÜZENLEME ARAÇ ÇUBUĞU) */}
          <div
            id="seo-table-editing-toolbar"
            data-testid="seo-table-editing-toolbar"
            className="rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/60 shadow-sm overflow-hidden transition-all duration-300"
          >
            {/* Toolbar Header Strip with Toggle Button */}
            <div className="px-4 py-3 bg-white/95 border-b border-indigo-100/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-2xs">
                  <Pencil className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span>Düzenleme Araç Çubuğu</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                      Açılır / Kapanır
                    </span>
                    {editingRowId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 text-[10px] font-bold border border-amber-400/40 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>1 Satır Düzenleniyor</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({effectiveRankings.length} Satır Mevcut)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Tablo sütun başlıklarına hızlı atlama yapın veya herhangi bir satırın düzenleme modunu anında başlatın.
                  </p>
                </div>
              </div>

              {/* Right controls: Collapse / Expand Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-toggle-edit-toolbar"
                  data-testid="btn-toggle-edit-toolbar"
                  onClick={() => setIsEditToolbarOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    isEditToolbarOpen
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 font-black shadow-xs"
                  }`}
                  title={isEditToolbarOpen ? "Düzenleme Araç Çubuğunu gizle" : "Düzenleme Araç Çubuğunu aç"}
                  aria-expanded={isEditToolbarOpen}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{isEditToolbarOpen ? "Araç Çubuğunu Gizle" : "Düzenleme Araç Çubuğunu Aç"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isEditToolbarOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Collapsible Content Body */}
            {isEditToolbarOpen && (
              <div className="p-4 space-y-4 animate-in fade-in duration-200">
                
                {/* SECTION 1: Tablo Başlıklarına Hızlı Erişim */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tablo Başlıklarına Hızlı Erişim:</span>
                      <span className="text-[11px] text-slate-400 font-normal hidden md:inline">
                        (Sütuna anında odaklanmak ve yatay kaydırmak için tıklayın)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: "th-col-select", label: "☑️ Seçim", title: "Seçim kutucuğu sütununa git" },
                      { id: "th-col-keyword", label: "🔤 Anahtar Kelime", title: "Anahtar kelime sütununa git" },
                      { id: "th-col-search-volume", label: "📊 Arama Hacmi", title: "Arama hacmi sütununa git" },
                      { id: "th-col-keyword-rank", label: `🎯 Keyword Rank (${userName})`, title: "Sitenizin sıralama sütununa git" },
                      { id: "th-col-competitor-name", label: "🏢 Lider Rakip Adı", title: "Rakip adı sütununa git" },
                      { id: "th-col-comp1", label: `🥇 1. ${comp1.name.split(" ")[0]}`, title: `${comp1.name} sütununa git` },
                      { id: "th-col-comp2", label: `🥈 2. ${comp2.name.split(" ")[0]}`, title: `${comp2.name} sütununa git` },
                      { id: "th-col-comp3", label: `🥉 3. ${comp3.name.split(" ")[0]}`, title: `${comp3.name} sütununa git` },
                      { id: "th-col-rank-gap", label: "⚖️ Sıralama Farkı (Gap)", title: "Sıralama farkı sütununa git" },
                      { id: "th-col-ai-recommendation", label: "💡 Gemini AI Eylemi", title: "AI tavsiyesi sütununa git" },
                      { id: "th-col-actions", label: "⚙️ Satır Eylemleri", title: "Satır eylemleri sütununa git" },
                      { id: "seo-competitor-growth-forecast-d3-chart", label: "📈 6 Aylık Büyüme Grafiği (D3)", title: "6 aylık tahmini performans büyümesi d3.js çizgi grafiğine git" }
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        id={`btn-jump-${col.id}`}
                        data-testid={`btn-jump-${col.id}`}
                        onClick={() => jumpToColumnHeader(col.id)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                        title={col.title}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: Satır Bazlı Düzenleme Moduna Hızlı Erişim */}
                <div className="pt-3 border-t border-indigo-100/90 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Pencil className="w-3.5 h-3.5 text-amber-600" />
                      <span>Satır Bazlı Düzenleme Modu:</span>
                      <span className="text-[11px] text-slate-400 font-normal hidden md:inline">
                        (Herhangi bir satırı seçerek değerleri, rakip adını ve sıralamaları anında güncelleyin)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                    {/* Quick Row Selector */}
                    <div className="flex-1 min-w-[240px] max-w-md">
                      <select
                        id="select-quick-edit-row"
                        data-testid="select-quick-edit-row"
                        value={editingRowId || quickEditRowSelection}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          if (targetId) {
                            setQuickEditRowSelection(targetId);
                            jumpToAndEditRow(targetId);
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer shadow-2xs"
                      >
                        <option value="">-- Düzenlemek İstediğiniz Satırı Seçin --</option>
                        {effectiveRankings.map((r, i) => {
                          const isCurEditing = editingRowId === r.id;
                          const userRankStr = r.userRank !== null ? `#${r.userRank}` : "İlk 20'de Yok";
                          return (
                            <option key={r.id} value={r.id}>
                              {i + 1}. {r.keyword} ({userRankStr}) {isCurEditing ? " ✏️ (Şu an düzenleniyor)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Quick Action 1: Edit First Row */}
                    {effectiveRankings.length > 0 && (
                      <button
                        type="button"
                        id="btn-quick-edit-first-row"
                        data-testid="btn-quick-edit-first-row"
                        onClick={() => jumpToAndEditRow(effectiveRankings[0].id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="İlk satırın düzenleme modunu başlat"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-600" />
                        <span>İlk Satırı Düzenle</span>
                      </button>
                    )}

                    {/* Quick Action 2: Add New Competitor Row */}
                    <button
                      type="button"
                      id="btn-quick-add-and-edit-row"
                      data-testid="btn-quick-add-and-edit-row"
                      onClick={handleAddNewCompetitorRow}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Tablonun en altına yeni boş bir rakip satırı ekleyin ve anında düzenleme modunu açın"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Satır Ekle & Düzenle</span>
                    </button>

                    {/* Stratejik Notlar Quick Drawer Button */}
                    <button
                      type="button"
                      id="btn-toolbar-open-strategic-notes"
                      data-testid="btn-toolbar-open-strategic-notes"
                      onClick={() => setIsStrategicNotesDrawerOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-900 hover:text-slate-950 border border-amber-400/80 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="Tüm satırlardaki stratejik notları görüntüleyin, yönetin ve satırlara hızlıca erişin"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-amber-700" />
                      <span>Stratejik Notlar Paneli ({notesCount})</span>
                    </button>

                    {/* Görsel Farklılık Vurgulayıcı Quick Toggle Button */}
                    <button
                      type="button"
                      id="btn-toolbar-toggle-visual-discrepancy"
                      data-testid="btn-toolbar-toggle-visual-discrepancy"
                      onClick={handleToggleVisualDiscrepancyMode}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 border ${
                        isVisualDiscrepancyMode
                          ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/60 font-black"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                      title="Metriklerde %20+ fark gösteren hücreleri ısı haritası prensibiyle renklendiren Görsel Farklılık Vurgulayıcı modunu açın/kapatın"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isVisualDiscrepancyMode ? "text-slate-950 stroke-[2.5]" : "text-amber-600"}`} />
                      <span>Farklılık Vurgulayıcı</span>
                      <span className={`px-1.5 py-0.2 rounded-md font-mono text-[9px] font-black ${
                        isVisualDiscrepancyMode ? "bg-slate-950 text-amber-300" : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}>
                        %{discrepancyThreshold}+ ({discrepancyAnalysis.highlightedCount})
                      </span>
                    </button>

                    {/* If currently editing a row: Save & Cancel Buttons right in the toolbar */}
                    {editingRowId && editFormData && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="btn-toolbar-save-active-edit"
                          data-testid="btn-toolbar-save-active-edit"
                          onClick={handleSaveEdit}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                            Object.keys(editValidationErrors).length > 0
                              ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          } text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95`}
                          title={
                            Object.keys(editValidationErrors).length > 0
                              ? `Doğrulama hatası var (${Object.keys(editValidationErrors).length} alan). Düzeltmek için tıklayın.`
                              : "Şu an düzenlenen satırdaki değişiklikleri kaydet"
                          }
                        >
                          {Object.keys(editValidationErrors).length > 0 ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Hataları Düzelt ({Object.keys(editValidationErrors).length})</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Kaydet</span>
                            </>
                          )}
                        </button>
                        {Object.keys(editValidationErrors).length > 0 && (
                          <button
                            type="button"
                            id="btn-toolbar-autofix-errors"
                            data-testid="btn-toolbar-autofix-errors"
                            onClick={handleAutoFixNumericErrors}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Tüm hatalı metrikleri otomatik geçerli sayısal formata dönüştür"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <span>Otomatik Düzelt</span>
                          </button>
                        )}
                        <button
                          type="button"
                          id="btn-toolbar-cancel-active-edit"
                          data-testid="btn-toolbar-cancel-active-edit"
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Düzenlemeyi iptal et"
                        >
                          <X className="w-3 h-3" />
                          <span>İptal</span>
                        </button>
                      </div>
                    )}

                    {/* Reset Overrides Button if any */}
                    {Object.keys(rowOverrides).length > 0 && (
                      <button
                        type="button"
                        id="btn-toolbar-reset-overrides"
                        data-testid="btn-toolbar-reset-overrides"
                        onClick={handleResetRowOverrides}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100/80 hover:bg-rose-50 text-amber-900 hover:text-rose-700 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        title="Tüm düzenlemeleri sıfırla ve varsayılana dön"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Sıfırla ({Object.keys(rowOverrides).length})</span>
                      </button>
                    )}
                  </div>

                  {/* Active Editing Row Status Banner */}
                  {editingRowId && editFormData && (
                    <div 
                      id="edit-row-validation-status-card"
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                        Object.keys(editValidationErrors).length > 0
                          ? "bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-400"
                          : "bg-amber-100/90 border-amber-300 text-amber-950 font-medium"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-2">
                        {Object.keys(editValidationErrors).length > 0 ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0 animate-bounce" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping shrink-0 mt-1 sm:mt-0" />
                        )}
                        <div>
                          {Object.keys(editValidationErrors).length > 0 ? (
                            <span>
                              <strong className="text-rose-700 font-black">Sayısal Doğrulama Uyarısı ({Object.keys(editValidationErrors).length} Hata):</strong>{" "}
                              {editValidationBanner || "Lütfen SEO skoru, arama hacmi ve sıralama metriklerinin sayısal formatta olduğunu kontrol edin."}
                            </span>
                          ) : (
                            <span>
                              Şu anda <strong>"{editFormData.keyword}"</strong> satırı düzenleniyor. Değerleri doğrudan tablodaki satırdan değiştirebilirsiniz.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {Object.keys(editValidationErrors).length > 0 && (
                          <button
                            type="button"
                            id="btn-toolbar-fix-now"
                            onClick={handleAutoFixNumericErrors}
                            className="text-[11px] font-black text-rose-700 hover:text-rose-900 underline cursor-pointer"
                          >
                            Hataları Düzelt
                          </button>
                        )}
                        <button
                          type="button"
                          id="btn-toolbar-focus-edit-row"
                          onClick={() => {
                            const el = document.getElementById(`row-editing-${editingRowId}`) || document.getElementById(`row-${editingRowId}`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                          className="text-[11px] font-bold text-amber-900 hover:underline cursor-pointer shrink-0"
                        >
                          Satıra Git &darr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* 3.1.9 FARKLILIKLARI VURGULA (DIFF VIEW) MODU PANELI */}
          {isDiffViewMode && (
            <CompetitorDiffViewPanel
              selectedRankings={selectedRankings}
              allRankings={effectiveRankings}
              userName={userName}
              competitors={effectiveCompetitors}
              onClose={() => setIsDiffViewMode(false)}
              baselineId={diffBaselineId || selectedRankings[0]?.id}
              onSelectBaseline={(id) => setDiffBaselineId(id)}
              onRemoveSelectedRow={(id) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
              }}
              onAddRowToDiff={(id) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  next.add(id);
                  return next;
                });
              }}
              onFocusRowInTable={(id) => {
                const el = document.getElementById(`row-${id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          )}

          {/* 3.1.10 6 AYLIK TREND TAHMİN ÇİZGİSİ (D3.JS) & ÖNGÖRÜLEN BÜYÜME MODÜLÜ */}
          {isTrendForecastModuleOpen && (
            <CompetitorTrendForecastModule
              rankings={effectiveRankings}
              competitors={effectiveCompetitors}
              userName={userName}
              userDomain={userDomain}
              colorPalette={colorTheme}
              isColumnVisible={isTrendColumnVisible}
              onToggleColumnVisibility={() => setIsTrendColumnVisible((prev) => !prev)}
              onClose={() => setIsTrendForecastModuleOpen(false)}
            />
          )}

          {/* 3.1.11 GÖRSEL FARKLILIK VURGULAYICI (%20+ METRİK FARKLARI) MODÜLÜ */}
          {isVisualDiscrepancyMode && (
            <VisualDiscrepancyHighlighterPanel
              isActive={isVisualDiscrepancyMode}
              analysis={discrepancyAnalysis}
              threshold={discrepancyThreshold}
              onChangeThreshold={(val) => setDiscrepancyThreshold(val)}
              focusFilter={discrepancyFocusFilter}
              onChangeFocusFilter={(f) => setDiscrepancyFocusFilter(f)}
              onlyShowDiscrepancyRows={onlyShowDiscrepancyRows}
              onToggleOnlyDiscrepancyRows={() => setOnlyShowDiscrepancyRows((prev) => !prev)}
              isPulseEnabled={isDiscrepancyPulseEnabled}
              onTogglePulse={() => setIsDiscrepancyPulseEnabled((prev) => !prev)}
              onClose={() => setIsVisualDiscrepancyMode(false)}
              onFocusRow={(id) => {
                const el = document.getElementById(`row-${id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          )}

          {/* 3.1.12 RAKİP GRUBU OLUŞTUR & KOHORT ANALİZ PANELİ */}
          {isGroupManagerOpen && (
            <CompetitorGroupManagerPanel
              rankings={effectiveRankings}
              competitors={effectiveCompetitors}
              userName={userName}
              userDomain={userDomain}
              selectedRowIds={selectedIds}
              onSelectRows={(ids) => setSelectedIds(new Set(ids))}
              activeGroupFilter={activeGroupFilter}
              onFilterByGroup={(groupId) => setActiveGroupFilter(groupId)}
              onClose={() => setIsGroupManagerOpen(false)}
            />
          )}

          {/* 3.1.13 HEDEF BELİRLEME (ÖZEL KPI HEDEFLERİ & RAKİP KIYASLAMA) MODÜLÜ */}
          {isKpiGoalModuleOpen && (
            <CompetitorKpiGoalManagerModule
              rankings={effectiveRankings}
              competitors={effectiveCompetitors}
              userName={userName}
              userDomain={userDomain}
              onClose={() => setIsKpiGoalModuleOpen(false)}
              onGoalsUpdated={(newGoals) => setCustomKpiGoals(newGoals)}
            />
          )}

          {/* Aktif Grup Filtresi Bildirim Barı (Panel kapalıyken filtre aktif ise) */}
          {activeGroupFilter && !isGroupManagerOpen && (
            <div
              id="active-group-filter-banner"
              data-testid="active-group-filter-banner"
              className="p-3.5 rounded-2xl bg-indigo-950 border border-indigo-500/50 text-white flex items-center justify-between gap-3 shadow-md animate-in fade-in"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold">
                  Grup Filtresi Aktif:{" "}
                  <strong className="text-amber-300 font-black">
                    {competitorGroups.find((g) => g.id === activeGroupFilter)?.name || "Seçili Grup"}
                  </strong>{" "}
                  ({filteredAndSortedRankings.length} kelime gösteriliyor)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupManagerOpen(true)}
                  className="px-3 py-1 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Grubu İncele
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGroupFilter(null)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Filtreyi Kaldır
                </button>
              </div>
            </div>
          )}

          {/* Isı Haritası Lejantı & Yoğunluk Göstergesi (Visual Discrepancy Active Legend) */}
          {isVisualDiscrepancyMode && (
            <div className="mb-3">
              <HeatmapMiniLegend
                threshold={discrepancyThreshold}
                positiveCount={discrepancyAnalysis.positiveCount}
                negativeCount={discrepancyAnalysis.negativeCount}
                opportunityCount={discrepancyAnalysis.opportunityCount}
                onToggleSettings={() => {
                  const el = document.getElementById("visual-discrepancy-highlighter-panel");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }}
              />
            </div>
          )}

          {/* 3.2 THE COMPARISON TABLE */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table id="seo-competitor-comparison-table-grid" className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-800 select-none">
                    
                    {/* Header: Drag & Drop Manual Reorder */}
                    <th 
                      scope="col"
                      id="th-col-drag"
                      data-testid="th-drag"
                      className={`py-3.5 px-2 w-12 text-center select-none cursor-pointer transition-colors group ${
                        sortBy === "manual" ? "bg-indigo-950 text-amber-300 ring-1 ring-inset ring-amber-400/40" : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                      }`}
                      onClick={() => {
                        setSortBy("manual");
                        setSortOrder("asc");
                      }}
                      title="Manuel Sıralama: Satırları sürükleyip bırakarak yukarı/aşağı taşıyın. Tıklayarak manuel sıralama modunu açın."
                    >
                      <button
                        type="button"
                        id="btn-th-manual-order"
                        data-testid="btn-th-manual-order"
                        className="w-full flex flex-col items-center justify-center gap-0.5 text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <GripVertical className="w-4 h-4 mx-auto group-hover:text-amber-300 transition-colors" />
                        <span className="text-[9px] font-mono font-bold leading-none">
                          {sortBy === "manual" ? "Özel" : "#"}
                        </span>
                      </button>
                    </th>

                    {/* Header 0: Master Checkbox */}
                    <th 
                      scope="col"
                      id="th-col-select"
                      data-testid="th-select"
                      className="py-3.5 px-3 w-10 text-center select-none"
                    >
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          id="select-all-rankings"
                          data-testid="select-all-checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = isSomeSelected;
                            }
                          }}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer transition-colors"
                          title={isAllSelected ? "Tüm seçimleri kaldır" : "Tablodaki tüm gösterilen kelimeleri seç"}
                          aria-label="Tüm satırları seç veya seçimi kaldır"
                        />
                      </div>
                    </th>

                    {/* Header 1: Keyword */}
                    <th 
                      scope="col"
                      id="th-col-keyword"
                      data-testid="th-keyword"
                      onClick={() => handleHeaderSort("keyword")}
                      className={`py-3.5 px-4 font-black uppercase tracking-wider text-[11px] min-w-[190px] cursor-pointer transition-colors group ${
                        sortBy === "keyword" ? "bg-slate-800 text-amber-300" : "text-white hover:bg-slate-800/80"
                      }`}
                      title="Anahtar kelimeye göre alfabetik sırala (A-Z / Z-A için tıklayın)"
                      aria-sort={sortBy === "keyword" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-keyword"
                        data-testid="sort-col-keyword-btn"
                        className="w-full flex items-center justify-between gap-1 text-left text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-black">Anahtar Kelime</span>
                          <HeaderMetricInfoTooltip
                            id="th-keyword"
                            title="Anahtar Kelime & Arama Niyeti"
                            description="SERP'te hedeflenen arama sorgusu, kullanıcı arama niyeti (Ticari, İşlemsel, Bilgi, Acil) ve anahtar kelime zorluk skorunu (KD) ifade eder."
                            formula="KD (0-100): Organik ilk 10'a girme zorluğu"
                            benchmark="KD < 30 kelimeler hızlı kazanım; Ticari niyetli kelimeler doğrudan satış ve dönüşüm getirir."
                            tag="SERP Arama"
                            align="left"
                          />
                        </div>
                        {renderSortIcon("keyword")}
                      </button>
                    </th>

                    {/* Header 2: Search Volume */}
                    <th 
                      scope="col"
                      id="th-col-search-volume"
                      data-testid="th-search-volume"
                      onClick={() => handleHeaderSort("volume")}
                      className={`py-3.5 px-3 font-black uppercase tracking-wider text-[11px] min-w-[130px] cursor-pointer transition-colors group ${
                        sortBy === "volume" ? "bg-slate-800 text-amber-300" : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`}
                      title="Aylık Google arama hacmine göre sırala (Artan / Azalan için tıklayın)"
                      aria-sort={sortBy === "volume" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-volume"
                        data-testid="sort-col-volume-btn"
                        className="w-full flex items-center justify-between gap-1 text-left text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-black">Search Volume</span>
                          <HeaderMetricInfoTooltip
                            id="th-volume"
                            title="Aylık Arama Hacmi (Search Volume)"
                            description="Son 30 günde Google Türkiye arama motorunda kullanıcıların bu terimi ortalama aylık kaç kez arattığını gösterir."
                            formula="Aylık Ortalama SERP Sorgu Sayısı"
                            benchmark="Yüksek hacimli sorgularda ilk 3 sıra toplam organik tıklamanın %60'ından fazlasını toplar."
                            tag="Talep Hacmi"
                            align="left"
                          />
                        </div>
                        {renderSortIcon("volume")}
                      </button>
                    </th>

                    {/* Header 3: Keyword Rank (Your Site SERP Rank) */}
                    <th 
                      scope="col"
                      id="th-col-keyword-rank"
                      data-testid="th-keyword-rank"
                      onClick={() => handleHeaderSort("userRank")}
                      className={`py-3.5 px-3.5 font-black uppercase tracking-wider text-[11px] min-w-[145px] border-x border-slate-800 cursor-pointer transition-colors group ${
                        sortBy === "userRank" ? "bg-indigo-900 text-amber-300" : "bg-indigo-950/90 text-amber-300 hover:bg-indigo-900/80"
                      }`}
                      title="Sitenizin Google arama sırasına göre sırala (Keyword Rank: #1, #2... için tıklayın)"
                      aria-sort={sortBy === "userRank" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-user-rank"
                        data-testid="sort-col-user-rank-btn"
                        className="w-full flex items-center justify-between gap-1.5 text-left text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate">Keyword Rank ({userName})</span>
                          <HeaderMetricInfoTooltip
                            id="th-user-rank"
                            title="Sitenizin Canlı SERP Sıralaması"
                            description="Kendi sitenizin bu anahtar kelimede Google arama sonuçlarındaki güncel organik pozisyonudur (#1 en üst sıra)."
                            formula="#1 = Lider • #2-#3 = İlk 3 • #4-#10 = İlk Sayfa"
                            benchmark="En yüksek CTR için hedef daima ilk 3 (#1-#3) pozisyondur."
                            tag="Canlı Sıra"
                            align="left"
                          />
                        </div>
                        {renderSortIcon("userRank")}
                      </button>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSpeedScoreCardsOpen(true);
                          setHighlightedCompetitorSpeedId("user-profile");
                          const el = document.getElementById("competitor-speed-score-cards-panel");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/40 transition-colors"
                        title="Google PageSpeed: 98/100 • Core Web Vitals: GEÇTİ (LCP 1.2s)"
                      >
                        <Zap className="w-2.5 h-2.5 text-amber-300" />
                        <span>PSI 98</span>
                        <span className="text-emerald-400 font-sans font-bold">CWV ✓</span>
                      </div>
                    </th>

                    {/* Header 3.5: Goal Tracking Mode (Hedef Değer & Gelişim Sapması) */}
                    {isGoalTrackingMode && (
                      <th 
                        scope="col"
                        id="th-col-goal-tracking"
                        data-testid="th-goal-tracking"
                        onClick={() => handleHeaderSort("goalAttainment")}
                        className={`py-3.5 px-3.5 font-black uppercase tracking-wider text-[11px] min-w-[170px] bg-indigo-950 text-amber-300 border-r border-indigo-800/80 cursor-pointer transition-colors group ${
                          sortBy === "goalAttainment" ? "bg-indigo-900 text-amber-300 ring-1 ring-amber-400" : "hover:bg-indigo-900/80"
                        }`}
                        title="Hedef Başarım Yüzdesine göre sırala (Artan / Azalan)"
                        aria-sort={sortBy === "goalAttainment" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                      >
                        <button
                          type="button"
                          id="sort-col-goal-attainment"
                          data-testid="sort-col-goal-attainment-btn"
                          className="w-full flex items-center justify-between gap-1 text-left text-inherit cursor-pointer focus:outline-hidden"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">Hedef Değer & Gelişim</span>
                            <HeaderMetricInfoTooltip
                              id="th-goal-tracking"
                              title="Hedef Değer & Gelişim İzleme"
                              description="Belirlenen hedef pozisyona göre (%100 tam hedef, pozitif % hedefin önünde, negatif % geride) ilerleme ve sapma analizidir."
                              formula="Başarım Oranı: 100% - ((Mevcut - Hedef) / 20 * 100)"
                              benchmark="Rakiplerin önüne geçmek için hedef sıra belirlenir ve sapma yüzdesi canlı hesaplanır."
                              tag="Gelişim İzleme"
                              align="left"
                            />
                          </div>
                          {renderSortIcon("goalAttainment")}
                        </button>
                      </th>
                    )}

                    {/* Header 3.6: 6 Aylık Trend Tahmini (d3.js Engine) */}
                    {isTrendColumnVisible && (
                      <th 
                        scope="col"
                        id="th-col-trend-forecast"
                        data-testid="th-trend-forecast"
                        onClick={() => handleHeaderSort("trendGrowth")}
                        className={`py-3.5 px-3 font-black uppercase tracking-wider text-[11px] min-w-[210px] bg-slate-900 border-r border-slate-800 cursor-pointer transition-colors group select-none ${
                          sortBy === "trendGrowth" ? "bg-indigo-900 text-amber-300 ring-1 ring-amber-400" : "text-white hover:bg-slate-800/80"
                        }`}
                        title="6 aylık öngörülen büyüme trendine göre sırala (d3.js Sparkline)"
                        aria-sort={sortBy === "trendGrowth" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                      >
                        <button
                          type="button"
                          id="sort-col-trend-growth"
                          data-testid="sort-col-trend-growth-btn"
                          className="w-full flex items-center justify-between gap-1 text-left text-inherit cursor-pointer focus:outline-hidden"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">6-Ay Trend Tahmini</span>
                            <span className="px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-200 text-[9px] font-mono font-bold">
                              d3.js
                            </span>
                            <HeaderMetricInfoTooltip
                              id="th-trend-forecast"
                              title="6 Aylık Büyüme & Trend Tahmin Çizgisi"
                              description="Mevcut SEO metrikleri, SERP sırası, Google PageSpeed ve içerik üretim hızına dayanarak d3.js ile hesaplanan 6 aylık organik büyüme ve pozisyon simülasyonudur."
                              formula="Ay 1 - Ay 6 Tahmini Sıralama Eğrisi (Siteniz vs. Rakipler)"
                              benchmark="Pozitif trend eğrileri içerik yatırımının ve teknik SEO optimizasyonunun getirisi olarak SERP ilk 3 sıraya tırmanışı simüle eder."
                              tag="d3.js Tahmin"
                              align="left"
                            />
                          </div>
                          {renderSortIcon("trendGrowth")}
                        </button>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1 font-normal lowercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                          <span>siteniz vs rakipler</span>
                        </div>
                      </th>
                    )}

                    {/* Header 4: Competitor Name */}
                    <th 
                      scope="col"
                      id="th-col-competitor-name"
                      data-testid="th-competitor-name"
                      onClick={() => handleHeaderSort("competitorName")}
                      className={`py-3.5 px-3 font-black uppercase tracking-wider text-[11px] min-w-[140px] cursor-pointer transition-colors group ${
                        sortBy === "competitorName" ? "bg-slate-800 text-amber-300" : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`}
                      title="Lider rakip adına göre alfabetik sırala (Competitor Name: A-Z / Z-A için tıklayın)"
                      aria-sort={sortBy === "competitorName" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-competitor-name"
                        data-testid="sort-col-competitor-name-btn"
                        className="w-full flex items-center justify-between gap-1 text-left text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-black">Competitor Name</span>
                          <HeaderMetricInfoTooltip
                            id="th-competitor-name"
                            title="Lider Rakip Domain"
                            description="Bu kelimede sitenizle en doğrudan rekabet eden veya SERP'te en güçlü organik sıraya sahip rakip alan adı."
                            benchmark="Rakip sayfa içeriğini, kelime yoğunluğunu ve backlink profilini analiz ederek içerik boşluğu (content gap) kapatılabilir."
                            tag="Rakip Analizi"
                            align="left"
                          />
                        </div>
                        {renderSortIcon("competitorName")}
                      </button>
                    </th>

                    {/* Header 5: Competitor 1 Rank */}
                    <th 
                      scope="col"
                      id="th-col-comp1"
                      onClick={() => handleHeaderSort("comp1Rank")}
                      className={`py-3.5 px-3 font-bold text-[11px] min-w-[110px] cursor-pointer transition-colors group ${
                        sortBy === "comp1Rank" ? "bg-slate-800 text-amber-300" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                      title={`${comp1.name} sıralamasına göre sırala`}
                      aria-sort={sortBy === "comp1Rank" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-comp1"
                        className="w-full text-left text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 truncate font-black" title={comp1.name}>
                            <span className="truncate">1. {comp1.name.split(" ")[0]}</span>
                            <HeaderMetricInfoTooltip
                              id="th-comp1"
                              title={`${comp1.name} Sıralama & Mobil PSI`}
                              description={`1. ana rakibinizin (${comp1.domain}) bu sorgudaki SERP konumu ve Google PageSpeed Core Web Vitals performansıdır.`}
                              benchmark="Rakibin LCP gecikmesi (>2.5s) varsa, daha hızlı sayfalarla teknik avantaj elde edebilirsiniz."
                              tag="1. Rakip"
                              align="left"
                            />
                          </div>
                          {renderSortIcon("comp1Rank")}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{comp1.domain}</div>
                      </button>
                      <div className="flex items-center gap-1 flex-wrap">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSpeedScoreCardsOpen(true);
                            setHighlightedCompetitorSpeedId(comp1.id || "comp-1");
                            const el = document.getElementById("competitor-speed-score-cards-panel");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/40 transition-colors cursor-pointer"
                          title={`${comp1.name} Google PageSpeed: 74/100 • LCP: 3.4s`}
                        >
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          <span>PSI {comp1.speedScore || 74}</span>
                          <span className="text-rose-300 font-sans font-bold">LCP 3.4s</span>
                        </div>
                        <button
                          type="button"
                          id="btn-header-comp1-recommendations"
                          data-testid="header-comp1-recommendations-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompetitorForRecommendations(comp1.id || "comp-1");
                            setIsRecommendationsDrawerOpen(true);
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 text-[9px] font-bold border border-indigo-400/40 transition-colors cursor-pointer"
                          title={`${comp1.name} için Performans İyileştirme Önerilerini Görüntüle`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>Öneriler</span>
                        </button>
                      </div>
                    </th>

                    {/* Header 6: Competitor 2 Rank */}
                    <th 
                      scope="col"
                      id="th-col-comp2"
                      onClick={() => handleHeaderSort("comp2Rank")}
                      className={`py-3.5 px-3 font-bold text-[11px] min-w-[110px] cursor-pointer transition-colors group ${
                        sortBy === "comp2Rank" ? "bg-slate-800 text-amber-300" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                      title={`${comp2.name} sıralamasına göre sırala`}
                      aria-sort={sortBy === "comp2Rank" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-comp2"
                        className="w-full text-left text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 truncate font-black" title={comp2.name}>
                            <span className="truncate">2. {comp2.name.split(" ")[0]}</span>
                            <HeaderMetricInfoTooltip
                              id="th-comp2"
                              title={`${comp2.name} Sıralama & Mobil PSI`}
                              description={`2. ana rakibinizin (${comp2.domain}) bu kelimedeki SERP sırası ve mobil hız değeridir.`}
                              benchmark="Rakibin ilk 3 dışında kaldığı aramalarda hedefli içerik güncellemeleriyle sıralama kazanılabilir."
                              tag="2. Rakip"
                              align="left"
                            />
                          </div>
                          {renderSortIcon("comp2Rank")}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{comp2.domain}</div>
                      </button>
                      <div className="flex items-center gap-1 flex-wrap">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSpeedScoreCardsOpen(true);
                            setHighlightedCompetitorSpeedId(comp2.id || "comp-2");
                            const el = document.getElementById("competitor-speed-score-cards-panel");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/40 transition-colors cursor-pointer"
                          title={`${comp2.name} Google PageSpeed: 81/100 • LCP: 2.7s`}
                        >
                          <Zap className="w-2.5 h-2.5 text-emerald-400" />
                          <span>PSI {comp2.speedScore || 81}</span>
                          <span className="text-emerald-300 font-sans font-bold">LCP 2.7s</span>
                        </div>
                        <button
                          type="button"
                          id="btn-header-comp2-recommendations"
                          data-testid="header-comp2-recommendations-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompetitorForRecommendations(comp2.id || "comp-2");
                            setIsRecommendationsDrawerOpen(true);
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 text-[9px] font-bold border border-indigo-400/40 transition-colors cursor-pointer"
                          title={`${comp2.name} için Performans İyileştirme Önerilerini Görüntüle`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>Öneriler</span>
                        </button>
                      </div>
                    </th>

                    {/* Header 7: Competitor 3 Rank */}
                    <th 
                      scope="col"
                      id="th-col-comp3"
                      onClick={() => handleHeaderSort("comp3Rank")}
                      className={`py-3.5 px-3 font-bold text-[11px] min-w-[110px] cursor-pointer transition-colors group ${
                        sortBy === "comp3Rank" ? "bg-slate-800 text-amber-300" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                      title={`${comp3.name} sıralamasına göre sırala`}
                      aria-sort={sortBy === "comp3Rank" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-comp3"
                        className="w-full text-left text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 truncate font-black" title={comp3.name}>
                            <span className="truncate">3. {comp3.name.split(" ")[0]}</span>
                            <HeaderMetricInfoTooltip
                              id="th-comp3"
                              title={`${comp3.name} Sıralama & Mobil PSI`}
                              description={`3. ana rakibinizin (${comp3.domain}) arama motoru konumu ve performans değeridir.`}
                              benchmark="Pazaryerlerine karşı spesifik uzmanlık rehberleri ve kullanıcı yorumlarıyla otorite kazanın."
                              tag="3. Rakip"
                              align="left"
                            />
                          </div>
                          {renderSortIcon("comp3Rank")}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{comp3.domain}</div>
                      </button>
                      <div className="flex items-center gap-1 flex-wrap">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSpeedScoreCardsOpen(true);
                            setHighlightedCompetitorSpeedId(comp3.id || "comp-3");
                            const el = document.getElementById("competitor-speed-score-cards-panel");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[9px] font-mono font-bold border border-rose-500/40 transition-colors cursor-pointer"
                          title={`${comp3.name} Google PageSpeed: 62/100 • LCP: 4.6s`}
                        >
                          <Zap className="w-2.5 h-2.5 text-rose-400" />
                          <span>PSI {comp3.speedScore || 62}</span>
                          <span className="text-rose-300 font-sans font-bold">LCP 4.6s</span>
                        </div>
                        <button
                          type="button"
                          id="btn-header-comp3-recommendations"
                          data-testid="header-comp3-recommendations-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompetitorForRecommendations(comp3.id || "comp-3");
                            setIsRecommendationsDrawerOpen(true);
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 text-[9px] font-bold border border-indigo-400/40 transition-colors cursor-pointer"
                          title={`${comp3.name} için Performans İyileştirme Önerilerini Görüntüle`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>Öneriler</span>
                        </button>
                      </div>
                    </th>

                    {/* Header 8: Rank Gap */}
                    <th 
                      scope="col"
                      id="th-col-rank-gap"
                      data-testid="th-rank-gap"
                      onClick={() => handleHeaderSort("gap")}
                      className={`py-3.5 px-3.5 font-black uppercase tracking-wider text-[11px] min-w-[125px] text-center cursor-pointer transition-colors group ${
                        sortBy === "gap" ? "bg-slate-800 text-amber-300" : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`}
                      title="Sıralama farkına göre sırala"
                      aria-sort={sortBy === "gap" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        id="sort-col-gap"
                        data-testid="sort-col-gap-btn"
                        className="w-full flex items-center justify-center gap-1 text-center text-inherit cursor-pointer focus:outline-hidden"
                      >
                        <span className="font-black">Rank Gap</span>
                        <HeaderMetricInfoTooltip
                          id="th-rank-gap"
                          title="Rank Gap (Sıralama Pozisyon Farkı)"
                          description="Sitenizin Google organik sırası ile en güçlü rakibin pozisyonu arasındaki net farktır."
                          formula="Pozitif (+) = Siteniz Önde • Negatif (-) = Rakip Önde"
                          benchmark="Hedef: Tüm kritik ticari kelimelerde pozitif Rank Gap yakalayarak lider olmak."
                          tag="SERP Farkı"
                          align="center"
                        />
                        {renderSortIcon("gap")}
                      </button>
                    </th>

                    {/* Header 9: AI Strategic Action */}
                    <th 
                      scope="col"
                      id="th-col-ai-recommendation"
                      className="py-3.5 px-4 font-black uppercase tracking-wider text-[11px] min-w-[240px] text-white"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span>Gemini Stratejik AI Eylemi</span>
                        <HeaderMetricInfoTooltip
                          id="th-ai-recommendation"
                          title="Gemini AI Stratejik Tavsiyesi"
                          description="Siteniz ile rakipler arasındaki SERP farkını, arama niyetini ve zorluk skorunu analiz eden Gemini yapay zeka modelinin ürettiği öncelikli optimizasyon eylemidir."
                          benchmark="'Hedeflere Ekle' veya 'AI Blog Yazısı Başlat' butonlarıyla öneriyi anında eyleme dönüştürebilirsiniz."
                          tag="Yapay Zeka"
                          align="right"
                        />
                      </div>
                    </th>

                    {/* Header 10: Actions (Not Ekle, Düzenle, Kopyala & Sil) */}
                    <th 
                      scope="col"
                      id="th-col-actions"
                      data-testid="th-actions"
                      className="py-3.5 px-3 font-black uppercase tracking-wider text-[11px] min-w-[280px] text-center text-slate-300"
                    >
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-amber-300">
                          <StickyNote className="w-3.5 h-3.5" />
                          <span>Not Ekle</span>
                        </span>
                        <span className="text-slate-600 font-normal">/</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </span>
                        <span className="text-slate-600 font-normal">/</span>
                        <span className="flex items-center gap-1 text-indigo-300">
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopyala</span>
                        </span>
                        <span className="text-slate-600 font-normal">/</span>
                        <span className="flex items-center gap-1 text-rose-300">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Sil</span>
                        </span>
                        <HeaderMetricInfoTooltip
                          id="th-actions"
                          title="Satır İçi İşlemler & Stratejik Notlar"
                          description="Her rakip için özel stratejik not ekleme/görüntüleme, metrikleri yerinde düzenleme, satırı kopyalama veya kaldırma aksiyonlarıdır."
                          benchmark="Eklediğiniz notlar yerel hafızada saklanır ve arama çubuğundan filtrelenebilir."
                          tag="Yönetim"
                          align="right"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedRankings.length === 0 ? (
                    <tr>
                      <td colSpan={currentTableColSpan} className="py-12 text-center text-slate-400">
                        {statusFilter === "selected" ? (
                          <div className="space-y-1.5 max-w-sm mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                            <p className="font-bold text-slate-700">Henüz hiç satır seçilmedi.</p>
                            <p className="text-xs text-slate-400">
                              Tablodaki satırların solundaki kutucukları (checkbox) işaretleyerek seçin veya "Tümü" sekmesine dönün.
                            </p>
                          </div>
                        ) : activeMetricFiltersCount > 0 ? (
                          <div className="space-y-2.5 max-w-md mx-auto p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                            <SlidersHorizontal className="w-8 h-8 text-amber-600 mx-auto mb-1" />
                            <p className="font-bold text-slate-800 text-sm">Belirlediğiniz metrik eşik kriterlerini karşılayan veri bulunamadı.</p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Aylık arama hacmi, SEO zorluğu veya trafik fırsatı eşik değerlerinden düşük olan kayıtlar gizlendi. Eşikleri düşürerek veya sıfırlayarak tüm verileri görüntüleyebilirsiniz.
                            </p>
                            <button
                              type="button"
                              onClick={handleResetAllMetricFilters}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Metrik Eşiklerini Sıfırla</span>
                            </button>
                          </div>
                        ) : statusFilter === "with_notes" ? (
                          <div className="space-y-1.5 max-w-sm mx-auto p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                            <StickyNote className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                            <p className="font-bold text-slate-800 text-sm">Henüz kayıtlı stratejik not bulunmuyor.</p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Rakip satırlarında bulunan <strong>"Not Ekle"</strong> butonuna tıklayarak ilk stratejik notunuzu, etiketlerinizi ve eylem planınızı kaydedebilirsiniz.
                            </p>
                          </div>
                        ) : (
                          <>
                            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-bold text-slate-700">Aramanızla eşleşen anahtar kelime bulunamadı.</p>
                            <p className="text-xs text-slate-400">Filtreleri temizleyerek tüm kelimeleri görüntüleyebilirsiniz.</p>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedRankings.map((item, idx) => {
                      const isSelected = selectedIds.has(item.id);
                      const isExpanded = expandedId === item.id;
                      const isCopied = copiedId === item.id;
                      const isAdded = addedId === item.id;

                      // Best competitor rank
                      const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((r): r is number => r !== null);
                      const bestCompRank = compRanks.length > 0 ? Math.min(...compRanks) : 1;

                      // Evaluate Gap
                      const isLeading = item.userRank !== null && item.userRank <= bestCompRank;
                      const isTrailing = item.userRank !== null && item.userRank > bestCompRank;

                      // Top competitor info
                      const compList = [
                        { name: comp1.name, domain: comp1.domain, rank: item.comp1Rank, speedScore: comp1.speedScore || 74 },
                        { name: comp2.name, domain: comp2.domain, rank: item.comp2Rank, speedScore: comp2.speedScore || 81 },
                        { name: comp3.name, domain: comp3.domain, rank: item.comp3Rank, speedScore: comp3.speedScore || 62 }
                      ].filter((c): c is { name: string; domain: string; rank: number; speedScore: number } => c.rank !== null)
                       .sort((a, b) => a.rank - b.rank);
                      const topComp = compList[0];

                      // Strategic Note for this competitor row
                      const itemNote = strategicNotes[item.id];
                      const isNotepadOpen = openNotepadIds.has(item.id);

                      // 3.3 INLINE EDIT MODE FOR THE ACTIVE ROW
                      if (editingRowId === item.id && editFormData) {
                        const compRanksPreview = [
                          editFormData.comp1Rank === null || editFormData.comp1Rank === "" ? null : Number(editFormData.comp1Rank),
                          editFormData.comp2Rank === null || editFormData.comp2Rank === "" ? null : Number(editFormData.comp2Rank),
                          editFormData.comp3Rank === null || editFormData.comp3Rank === "" ? null : Number(editFormData.comp3Rank),
                        ].filter((r): r is number => r !== null && !isNaN(r));
                        const bestCompRankPreview = compRanksPreview.length > 0 ? Math.min(...compRanksPreview) : 1;
                        const numUserRank = (editFormData.userRank === null || editFormData.userRank === "") ? null : Number(editFormData.userRank);
                        const gapPreview = (numUserRank !== null && !isNaN(numUserRank)) ? numUserRank - bestCompRankPreview : 99;
                        const hasValidationErrors = Object.keys(editValidationErrors).length > 0;

                        return (
                          <React.Fragment key={item.id || idx}>
                            {/* Validation Error Banner Row if invalid values entered */}
                            {hasValidationErrors && (
                              <tr 
                                id={`row-edit-validation-banner-${item.id}`}
                                data-testid={`row-edit-validation-banner-${item.id}`}
                                className="bg-rose-100/95 border-t-2 border-x-2 border-rose-500 shadow-xs animate-in fade-in duration-150"
                              >
                                <td colSpan={currentTableColSpan} className="py-2.5 px-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                                      <span>
                                        <strong>Sayısal Format Hatası ({Object.keys(editValidationErrors).length} Alan):</strong> Lütfen metrikleri sayısal formatta giriniz.
                                      </span>
                                      <span className="text-[11px] font-normal text-rose-800 hidden lg:inline">
                                        (SEO skoru: 0-100 tam sayı, Arama hacmi & sıralamalar: pozitif sayısal değerler)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        id={`btn-autofix-metrics-row-${item.id}`}
                                        data-testid={`btn-autofix-metrics-row-${item.id}`}
                                        onClick={handleAutoFixNumericErrors}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] shadow-xs cursor-pointer active:scale-95"
                                        title="Tüm hatalı metrikleri otomatik geçerli sayısal formata dönüştür"
                                      >
                                        <Sparkles className="w-3 h-3" />
                                        <span>Otomatik Sayısal Düzelt</span>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}

                            <tr 
                              id={`row-editing-${item.id}`}
                              data-testid={`row-editing-${item.id}`}
                              className={`${
                                hasValidationErrors ? "bg-rose-50/80 border-y-2 border-rose-500" : "bg-amber-50/95 border-y-2 border-amber-500"
                              } shadow-md transition-all`}
                            >
                              {/* Drag Handle Column (Locked in edit mode) */}
                              <td className="py-3 px-2 align-middle text-center">
                                <div className="flex flex-col items-center justify-center p-1 text-slate-300" title="Düzenleme sırasında satır taşınamaz">
                                  <GripVertical className="w-4 h-4 opacity-40 cursor-not-allowed" />
                                </div>
                              </td>

                              {/* 0. Row Status / Selection Checkbox & Edit Indicator */}
                              <td className="py-3 px-2.5 align-middle text-center">
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    id={`select-ranking-editing-${item.id}`}
                                    data-testid={`select-checkbox-editing-${item.id}`}
                                    checked={isSelected}
                                    onChange={() => toggleSelectRow(item.id)}
                                    className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition-colors"
                                    title={`"${item.keyword || 'Yeni Rakip'}" kelimesini seç`}
                                    aria-label={`"${item.keyword || 'Yeni Rakip'}" satırını seç`}
                                  />
                                  <span 
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                      hasValidationErrors ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                                    } font-bold text-xs shadow-xs`}
                                    title={hasValidationErrors ? "Sayısal doğrulama hatası mevcut" : "Satır içi düzenleme modu aktif"}
                                  >
                                    {hasValidationErrors ? (
                                      <AlertTriangle className="w-3 h-3" />
                                    ) : (
                                      <Pencil className="w-3 h-3 animate-pulse" />
                                    )}
                                  </span>
                                  <span className={`text-[8px] font-black ${hasValidationErrors ? "text-rose-800" : "text-amber-800"}`}>
                                    {hasValidationErrors ? "HATA" : "DÜZENLE"}
                                  </span>
                                </div>
                              </td>

                              {/* 1. Keyword & Intent Column */}
                              <td className="py-3 px-3 align-top min-w-[210px]">
                                <div className="space-y-1.5">
                                  <div>
                                    <label htmlFor={`edit-keyword-${item.id}`} className="block text-[10px] font-bold text-slate-700 mb-0.5">
                                      Anahtar Kelime:
                                    </label>
                                    <input
                                      type="text"
                                      id={`edit-keyword-${item.id}`}
                                      data-testid={`edit-keyword-${item.id}`}
                                      value={editFormData.keyword}
                                      onChange={(e) => handleUpdateEditField("keyword", e.target.value)}
                                      onBlur={() => handleBlurEditField("keyword")}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                      className={`w-full text-xs font-bold px-2 py-1.5 bg-white border rounded-lg focus:outline-none shadow-2xs transition-colors ${
                                        editValidationErrors.keyword
                                          ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50/60 text-rose-950"
                                          : "border-amber-400 focus:ring-2 focus:ring-amber-500 text-slate-900"
                                      }`}
                                      placeholder="Hedef anahtar kelime"
                                      autoFocus
                                    />
                                    {editValidationErrors.keyword && (
                                      <div 
                                        id={`error-msg-keyword-${item.id}`}
                                        data-testid={`error-msg-keyword-${item.id}`}
                                        className="text-[9px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-1 mt-1 leading-tight flex items-start gap-1 animate-in fade-in"
                                      >
                                        <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0 mt-0.5" />
                                        <span>{editValidationErrors.keyword}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                      <label htmlFor={`edit-intent-${item.id}`} className="block text-[9px] font-bold text-slate-500 mb-0.5">
                                        Niyet:
                                      </label>
                                      <select
                                        id={`edit-intent-${item.id}`}
                                        data-testid={`edit-intent-${item.id}`}
                                        value={editFormData.searchIntent}
                                        onChange={(e) => handleUpdateEditField("searchIntent", e.target.value as any)}
                                        className="w-full text-[11px] font-medium px-1.5 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500"
                                      >
                                        <option value="Ticari">Ticari</option>
                                        <option value="Acil / Yerel">Acil / Yerel</option>
                                        <option value="İşlemsel">İşlemsel</option>
                                        <option value="Bilgilendirici">Bilgilendirici</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label htmlFor={`edit-difficulty-${item.id}`} className="block text-[9px] font-bold text-slate-500 mb-0.5">
                                        KD (0-100):
                                      </label>
                                      <input
                                        type="text"
                                        id={`edit-difficulty-${item.id}`}
                                        data-testid={`edit-difficulty-${item.id}`}
                                        value={editFormData.difficulty ?? ""}
                                        onChange={(e) => handleUpdateEditField("difficulty", e.target.value)}
                                        onBlur={() => handleBlurEditField("difficulty")}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                        placeholder="0-100"
                                        className={`w-full text-[11px] font-mono font-bold px-1.5 py-1 bg-white border rounded-md transition-colors ${
                                          editValidationErrors.difficulty
                                            ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50 text-rose-950 font-black"
                                            : "border-slate-300 focus:ring-1 focus:ring-amber-500 text-slate-800"
                                        }`}
                                      />
                                      {editValidationErrors.difficulty && (
                                        <div 
                                          id={`error-msg-difficulty-${item.id}`}
                                          data-testid={`error-msg-difficulty-${item.id}`}
                                          className="text-[9px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-1 mt-1 leading-tight flex items-start gap-1 animate-in fade-in"
                                        >
                                          <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0 mt-0.5" />
                                          <span>{editValidationErrors.difficulty}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Monthly Volume Column */}
                              <td className="py-3 px-2.5 align-top min-w-[110px]">
                                <div className="space-y-1">
                                  <label htmlFor={`edit-volume-${item.id}`} className="block text-[10px] font-bold text-slate-700 mb-0.5">
                                    SERP Hacmi:
                                  </label>
                                  <input
                                    type="text"
                                    id={`edit-volume-${item.id}`}
                                    data-testid={`edit-volume-${item.id}`}
                                    value={editFormData.monthlyVolume}
                                    onChange={(e) => handleUpdateEditField("monthlyVolume", e.target.value)}
                                    onBlur={() => handleBlurEditField("monthlyVolume")}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                    className={`w-full text-xs font-mono font-bold px-2 py-1.5 bg-white border rounded-lg shadow-2xs transition-colors ${
                                      editValidationErrors.monthlyVolume
                                        ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50 text-rose-950 font-black"
                                        : "border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-800"
                                    }`}
                                    placeholder="18.400 / ay"
                                  />
                                  {editValidationErrors.monthlyVolume ? (
                                    <div 
                                      id={`error-msg-volume-${item.id}`}
                                      data-testid={`error-msg-volume-${item.id}`}
                                      className="text-[9px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-1 mt-1 leading-tight flex items-start gap-1 animate-in fade-in"
                                    >
                                      <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0 mt-0.5" />
                                      <span>{editValidationErrors.monthlyVolume}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-slate-400 block font-sans">Aylık aranma (sayısal)</span>
                                  )}
                                </div>
                              </td>

                              {/* 3. Your Site Rank Column */}
                              <td className="py-3 px-2.5 align-top min-w-[125px] bg-amber-100/70 border-x border-amber-300">
                                <div className="space-y-1">
                                  <label htmlFor={`edit-user-rank-${item.id}`} className="block text-[10px] font-black text-amber-950 mb-0.5">
                                    Siteniz ({userName}):
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-black text-amber-900">#</span>
                                    <input
                                      type="text"
                                      id={`edit-user-rank-${item.id}`}
                                      data-testid={`edit-user-rank-${item.id}`}
                                      value={editFormData.userRank ?? ""}
                                      onChange={(e) => handleUpdateEditField("userRank", e.target.value)}
                                      onBlur={() => handleBlurEditField("userRank")}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                      placeholder="Yok (>20)"
                                      className={`w-full text-xs font-mono font-black px-2 py-1.5 bg-white border rounded-lg shadow-2xs transition-colors ${
                                        editValidationErrors.userRank
                                          ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50 text-rose-950 font-black"
                                          : "border-amber-500 focus:ring-2 focus:ring-amber-600 text-slate-900"
                                      }`}
                                    />
                                  </div>
                                  {editValidationErrors.userRank ? (
                                    <div 
                                      id={`error-msg-user-rank-${item.id}`}
                                      data-testid={`error-msg-user-rank-${item.id}`}
                                      className="text-[9px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-1 mt-1 leading-tight flex items-start gap-1 animate-in fade-in"
                                    >
                                      <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0 mt-0.5" />
                                      <span>{editValidationErrors.userRank}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-amber-900/80 block font-medium">Boş = İlk 20'de Yok</span>
                                  )}
                                </div>
                              </td>

                              {/* Goal Tracking Column in Edit Mode */}
                              {isGoalTrackingMode && (
                                <td className="py-3 px-3 align-top bg-indigo-50/40 border-r border-indigo-100 min-w-[170px]">
                                  <GoalTrackingCell
                                    itemId={item.id}
                                    keyword={editFormData.keyword || item.keyword}
                                    currentRank={numUserRank}
                                    bestCompRank={bestCompRankPreview}
                                    bestCompName={editFormData.competitorName || topComp?.name || "Rakip"}
                                    targetRank={keywordGoals[item.id]?.targetRank || (numUserRank && numUserRank <= 3 ? 1 : 3)}
                                    onUpdateTarget={handleUpdateTarget}
                                  />
                                </td>
                              )}

                              {/* 4. Competitor Name Column */}
                              <td className="py-3 px-2.5 align-top min-w-[140px]">
                                <div className="space-y-1">
                                  <label htmlFor={`edit-competitor-name-${item.id}`} className="block text-[10px] font-bold text-slate-700 mb-0.5">
                                    Rakip Adı:
                                  </label>
                                  <input
                                    type="text"
                                    id={`edit-competitor-name-${item.id}`}
                                    data-testid={`edit-competitor-name-${item.id}`}
                                    value={editFormData.competitorName}
                                    onChange={(e) => handleUpdateEditField("competitorName", e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                    className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 shadow-2xs"
                                    placeholder="Lider Rakip Adı"
                                  />
                                  <span className="text-[9px] text-slate-400 block">Özel rakip / lider adı</span>
                                </div>
                              </td>

                              {/* 5. Competitor 1 Rank Column */}
                              <td className="py-3 px-2 align-top min-w-[85px]">
                                <div className="space-y-1">
                                  <label htmlFor={`edit-comp1-rank-${item.id}`} className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate" title={comp1.name}>
                                    1. {comp1.name.split(" ")[0]}
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400 font-mono">#</span>
                                    <input
                                      type="text"
                                      id={`edit-comp1-rank-${item.id}`}
                                      data-testid={`edit-comp1-rank-${item.id}`}
                                      value={editFormData.comp1Rank ?? ""}
                                      onChange={(e) => handleUpdateEditField("comp1Rank", e.target.value)}
                                      onBlur={() => handleBlurEditField("comp1Rank")}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                      placeholder="-"
                                      className={`w-full text-xs font-mono font-bold px-1.5 py-1 bg-white border rounded-md transition-colors ${
                                        editValidationErrors.comp1Rank
                                          ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50 text-rose-950 font-black"
                                          : "border-slate-300 focus:ring-1 focus:ring-amber-500 text-slate-800"
                                      }`}
                                    />
                                  </div>
                                  {editValidationErrors.comp1Rank && (
                                    <div 
                                      id={`error-msg-comp1-rank-${item.id}`}
                                      data-testid={`error-msg-comp1-rank-${item.id}`}
                                      className="text-[8px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-0.5 mt-1 leading-tight flex items-start gap-0.5 animate-in fade-in"
                                    >
                                      <AlertCircle className="w-2 h-2 text-rose-600 shrink-0 mt-0.5" />
                                      <span>{editValidationErrors.comp1Rank}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 6. Competitor 2 Rank Column */}
                              <td className="py-3 px-2 align-top min-w-[85px]">
                                <div className="space-y-1">
                                  <label htmlFor={`edit-comp2-rank-${item.id}`} className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate" title={comp2.name}>
                                    2. {comp2.name.split(" ")[0]}
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400 font-mono">#</span>
                                    <input
                                      type="text"
                                      id={`edit-comp2-rank-${item.id}`}
                                      data-testid={`edit-comp2-rank-${item.id}`}
                                      value={editFormData.comp2Rank ?? ""}
                                      onChange={(e) => handleUpdateEditField("comp2Rank", e.target.value)}
                                      onBlur={() => handleBlurEditField("comp2Rank")}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                      placeholder="-"
                                      className={`w-full text-xs font-mono font-bold px-1.5 py-1 bg-white border rounded-md transition-colors ${
                                        editValidationErrors.comp2Rank
                                          ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50 text-rose-950 font-black"
                                          : "border-slate-300 focus:ring-1 focus:ring-amber-500 text-slate-800"
                                      }`}
                                    />
                                  </div>
                                  {editValidationErrors.comp2Rank && (
                                    <div 
                                      id={`error-msg-comp2-rank-${item.id}`}
                                      data-testid={`error-msg-comp2-rank-${item.id}`}
                                      className="text-[8px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-0.5 mt-1 leading-tight flex items-start gap-0.5 animate-in fade-in"
                                    >
                                      <AlertCircle className="w-2 h-2 text-rose-600 shrink-0 mt-0.5" />
                                      <span>{editValidationErrors.comp2Rank}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 7. Competitor 3 Rank Column */}
                              <td className="py-3 px-2 align-top min-w-[85px]">
                                <div className="space-y-1">
                                  <label htmlFor={`edit-comp3-rank-${item.id}`} className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate" title={comp3.name}>
                                    3. {comp3.name.split(" ")[0]}
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400 font-mono">#</span>
                                    <input
                                      type="text"
                                      id={`edit-comp3-rank-${item.id}`}
                                      data-testid={`edit-comp3-rank-${item.id}`}
                                      value={editFormData.comp3Rank ?? ""}
                                      onChange={(e) => handleUpdateEditField("comp3Rank", e.target.value)}
                                      onBlur={() => handleBlurEditField("comp3Rank")}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                      placeholder="-"
                                      className={`w-full text-xs font-mono font-bold px-1.5 py-1 bg-white border rounded-md transition-colors ${
                                        editValidationErrors.comp3Rank
                                          ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50 text-rose-950 font-black"
                                          : "border-slate-300 focus:ring-1 focus:ring-amber-500 text-slate-800"
                                      }`}
                                    />
                                  </div>
                                  {editValidationErrors.comp3Rank && (
                                    <div 
                                      id={`error-msg-comp3-rank-${item.id}`}
                                      data-testid={`error-msg-comp3-rank-${item.id}`}
                                      className="text-[8px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-0.5 mt-1 leading-tight flex items-start gap-0.5 animate-in fade-in"
                                    >
                                      <AlertCircle className="w-2 h-2 text-rose-600 shrink-0 mt-0.5" />
                                      <span>{editValidationErrors.comp3Rank}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 8. Live Gap Preview Column */}
                              <td className="py-3 px-2.5 align-middle text-center min-w-[105px]">
                                <span className="text-[9px] text-slate-500 block mb-1 font-bold">Canlı Fark</span>
                                {editFormData.userRank === null || editFormData.userRank === "" ? (
                                  <span className="inline-block px-2 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                    Boşluk (+99)
                                  </span>
                                ) : gapPreview < 0 ? (
                                  <span className="inline-block px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    +{Math.abs(gapPreview)} Sıra Önde
                                  </span>
                                ) : gapPreview === 0 ? (
                                  <span className="inline-block px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    Eşit Sıra
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                    -{gapPreview} Sıra Fark
                                  </span>
                                )}
                              </td>

                              {/* 9. Gemini AI Recommendation & Traffic Opportunity Column */}
                              <td className="py-3 px-3 align-top min-w-[210px]">
                                <div className="space-y-1.5">
                                  <div>
                                    <label htmlFor={`edit-ai-rec-${item.id}`} className="block text-[9px] font-bold text-slate-600 mb-0.5">
                                      Stratejik AI Eylemi:
                                    </label>
                                    <input
                                      type="text"
                                      id={`edit-ai-rec-${item.id}`}
                                      data-testid={`edit-ai-rec-${item.id}`}
                                      value={editFormData.aiRecommendation}
                                      onChange={(e) => handleUpdateEditField("aiRecommendation", e.target.value)}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                      className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500"
                                      placeholder="Stratejik eylem"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor={`edit-traffic-opp-${item.id}`} className="block text-[9px] font-bold text-slate-600 mb-0.5">
                                      Trafik Fırsatı:
                                    </label>
                                    <input
                                      type="text"
                                      id={`edit-traffic-opp-${item.id}`}
                                      data-testid={`edit-traffic-opp-${item.id}`}
                                      value={editFormData.trafficOpportunity}
                                      onChange={(e) => handleUpdateEditField("trafficOpportunity", e.target.value)}
                                      onBlur={() => handleBlurEditField("trafficOpportunity")}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                                      className={`w-full text-xs px-2 py-1 bg-white border rounded-md transition-colors ${
                                        editValidationErrors.trafficOpportunity
                                          ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50 text-rose-950 font-bold"
                                          : "border-slate-300 focus:ring-1 focus:ring-amber-500 text-slate-800"
                                      }`}
                                      placeholder="Örn: +1.250 Ziyaretçi / ay"
                                    />
                                    {editValidationErrors.trafficOpportunity && (
                                      <div 
                                        id={`error-msg-traffic-opp-${item.id}`}
                                        data-testid={`error-msg-traffic-opp-${item.id}`}
                                        className="text-[9px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 rounded p-1 mt-1 leading-tight flex items-start gap-1 animate-in fade-in"
                                      >
                                        <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0 mt-0.5" />
                                        <span>{editValidationErrors.trafficOpportunity}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 10. Actions: Save, Cancel & Delete Buttons */}
                              <td className="py-3 px-2.5 align-middle text-center min-w-[115px]">
                                <div className="flex flex-col gap-1.5">
                                  <button
                                    type="button"
                                    id={`btn-save-edit-${item.id}`}
                                    data-testid={`btn-save-edit-${item.id}`}
                                    onClick={handleSaveEdit}
                                    className={`w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg ${
                                      hasValidationErrors
                                        ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse font-black"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                                    } text-xs shadow-xs transition-colors cursor-pointer`}
                                    title={
                                      hasValidationErrors
                                        ? `Sayısal format hataları var (${Object.keys(editValidationErrors).length} alan). Düzeltmek veya kaydetmek için tıklayın.`
                                        : "Değişiklikleri kaydet ve tabloyu güncelle (Enter)"
                                    }
                                  >
                                    {hasValidationErrors ? (
                                      <>
                                        <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Hata ({Object.keys(editValidationErrors).length})</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Kaydet</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    id={`btn-cancel-edit-${item.id}`}
                                    data-testid={`btn-cancel-edit-${item.id}`}
                                    onClick={handleCancelEdit}
                                    className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] transition-colors cursor-pointer"
                                    title="Düzenlemeyi iptal et (Esc)"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>İptal</span>
                                  </button>
                                  <button
                                    type="button"
                                    id={`btn-edit-copy-${item.id}`}
                                    data-testid={`btn-edit-copy-${item.id}`}
                                    onClick={() => handleDuplicateRow(item)}
                                    className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[10px] transition-colors cursor-pointer"
                                    title="Bu satırdaki verileri yeni bir satıra kopyala"
                                  >
                                    <Copy className="w-3 h-3 text-indigo-600" />
                                    <span>Satırı Kopyala</span>
                                  </button>
                                  <button
                                    type="button"
                                    id={`btn-edit-note-${item.id}`}
                                    data-testid={`btn-edit-note-${item.id}`}
                                    onClick={() => toggleNotepad(item.id)}
                                    className={`w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg border font-bold text-[10px] transition-colors cursor-pointer ${
                                      itemNote
                                        ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                                        : isNotepadOpen
                                        ? "bg-amber-200 text-amber-950 border-amber-400"
                                        : "bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-200"
                                    }`}
                                    title="Bu satıra ait stratejik notu aç veya düzenle"
                                  >
                                    <StickyNote className="w-3 h-3 text-amber-600" />
                                    <span>{itemNote ? "Notu Gör" : "Not Ekle"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    id={`btn-edit-delete-${item.id}`}
                                    data-testid={`btn-edit-delete-${item.id}`}
                                    onClick={() => handleDeleteRow(item.id, item.keyword)}
                                    className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] transition-colors cursor-pointer"
                                    title="Bu satırı tamamen kaldır"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                    <span>Satırı Sil</span>
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Inline Notepad in Edit Mode */}
                            {isNotepadOpen && (
                              <tr 
                                id={`row-notepad-edit-${item.id}`}
                                data-testid={`row-notepad-edit-${item.id}`}
                                className="bg-amber-50/50 border-y-2 border-amber-300 shadow-inner"
                              >
                                <td colSpan={currentTableColSpan} className="p-3 sm:p-4">
                                  <RowStrategicNotepad
                                    itemId={item.id}
                                    keyword={item.keyword}
                                    competitorName={(item as any).competitorName || topComp?.name || comp1.name}
                                    userRank={item.userRank}
                                    competitorRank={item.comp1Rank}
                                    note={itemNote}
                                    onSave={(text, tags) => handleSaveNote(item.id, text, tags)}
                                    onDelete={() => handleDeleteNote(item.id)}
                                    onClose={() => toggleNotepad(item.id)}
                                    toastMessage={noteSaveToast?.id === item.id ? noteSaveToast.message : null}
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      }

                      return (
                        <React.Fragment key={item.id || idx}>
                          <tr 
                            id={`row-${item.id}`}
                            data-testid={`row-${item.id}`}
                            draggable={true}
                            onMouseEnter={() => setHoveredRowId(item.id)}
                            onMouseLeave={() => setHoveredRowId((prev) => (prev === item.id ? null : prev))}
                            onDragStart={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.closest("input, select, button, textarea, a")) {
                                e.preventDefault();
                                return;
                              }
                              handleRowDragStart(e, item.id);
                            }}
                            onDragOver={(e) => handleRowDragOver(e, item.id)}
                            onDragEnter={(e) => handleRowDragEnter(e, item.id)}
                            onDragLeave={(e) => handleRowDragLeave(e, item.id)}
                            onDrop={(e) => handleRowDrop(e, item.id)}
                            onDragEnd={handleRowDragEnd}
                            className={`transition-all group group/row ${
                            draggedRowId === item.id
                              ? "opacity-30 bg-indigo-50/90 border-y-2 border-dashed border-indigo-500 scale-[0.995]"
                              : dragOverRowId === item.id && dropPosition === "above"
                              ? "border-t-4 border-t-indigo-600 bg-indigo-50/70 shadow-md ring-1 ring-indigo-300"
                              : dragOverRowId === item.id && dropPosition === "below"
                              ? "border-b-4 border-b-indigo-600 bg-indigo-50/70 shadow-md ring-1 ring-indigo-300"
                              : isDiffViewMode && isSelected
                              ? item.id === (diffBaselineId || selectedRankings[0]?.id)
                                ? "bg-indigo-100/90 border-l-4 border-l-indigo-700 ring-2 ring-indigo-400 shadow-md"
                                : "bg-amber-50/90 border-l-4 border-l-amber-500 ring-2 ring-amber-300 shadow-md"
                              : isDiffViewMode
                              ? "opacity-60 hover:opacity-100 transition-opacity"
                              : recentlyAddedId === item.id
                              ? "bg-emerald-50/90 border-l-4 border-l-emerald-600 shadow-sm"
                              : recentlyClonedId === item.id
                              ? "bg-indigo-50/90 border-l-4 border-l-indigo-600 shadow-sm"
                              : isSelected 
                              ? "bg-indigo-50/80 border-l-4 border-l-indigo-600 shadow-2xs" 
                              : idx % 2 === 1 ? "bg-slate-50/30" : "hover:bg-slate-50/80"
                          }`}>
                            
                            {/* Drag Handle Column */}
                            <td className="py-3.5 px-2 align-middle text-center select-none">
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <div
                                  id={`drag-handle-${item.id}`}
                                  data-testid={`drag-handle-${item.id}`}
                                  draggable={true}
                                  onDragStart={(e) => handleRowDragStart(e, item.id)}
                                  onDragEnd={handleRowDragEnd}
                                  className="p-1 rounded-lg cursor-grab active:cursor-grabbing hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center group-hover:text-slate-600"
                                  title={`"${item.keyword || 'Satır'}" satırını yukarı veya aşağı sürükleyin`}
                                  aria-label={`"${item.keyword || 'Satır'}" satırını taşıma tutamağı`}
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    id={`btn-move-up-${item.id}`}
                                    data-testid={`btn-move-up-${item.id}`}
                                    disabled={idx === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveRow(item.id, "up");
                                    }}
                                    className="p-0.5 rounded hover:bg-indigo-100 text-slate-400 hover:text-indigo-700 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                                    title="Bir Satır Yukarı Taşı"
                                    aria-label="Bir Satır Yukarı Taşı"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    id={`btn-move-down-${item.id}`}
                                    data-testid={`btn-move-down-${item.id}`}
                                    disabled={idx === filteredAndSortedRankings.length - 1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveRow(item.id, "down");
                                    }}
                                    className="p-0.5 rounded hover:bg-indigo-100 text-slate-400 hover:text-indigo-700 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                                    title="Bir Satır Aşağı Taşı"
                                    aria-label="Bir Satır Aşağı Taşı"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* 0. Row Selection Checkbox */}
                            <td className="py-3.5 px-3 align-top text-center">
                              <div className="flex items-center justify-center pt-0.5">
                                <input
                                  type="checkbox"
                                  id={`select-ranking-${item.id}`}
                                  data-testid={`select-checkbox-${item.id}`}
                                  checked={isSelected}
                                  onChange={() => toggleSelectRow(item.id)}
                                  className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition-colors"
                                  title={`"${item.keyword || 'Yeni Rakip'}" kelimesini seç`}
                                  aria-label={`"${item.keyword || 'Yeni Rakip'}" satırını seç`}
                                />
                              </div>
                            </td>

                            {/* 1. Keyword & Intent Column */}
                            <td className="py-3.5 px-4 align-top">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-black text-slate-900 text-xs sm:text-sm">
                                    {item.keyword ? (
                                      item.keyword
                                    ) : (
                                      <span className="text-slate-400 italic font-medium">
                                        (Anahtar Kelime Belirtilmedi)
                                      </span>
                                    )}
                                  </span>

                                  {/* Diff View Mode Badge */}
                                  {isDiffViewMode && isSelected && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono border ${
                                        item.id === (diffBaselineId || selectedRankings[0]?.id)
                                          ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                                          : "bg-amber-400 text-slate-950 border-amber-500 shadow-xs"
                                      }`}
                                    >
                                      {item.id === (diffBaselineId || selectedRankings[0]?.id)
                                        ? "Diff Baz Ref"
                                        : `Diff #${selectedRankings.findIndex((r) => r.id === item.id) + 1}`}
                                    </span>
                                  )}

                                  {item.id.includes("-copy-") && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                                      Kopya
                                    </span>
                                  )}

                                  {item.id.includes("-new-comp-") && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Yeni
                                    </span>
                                  )}

                                  {/* Competitor Group Membership Badges */}
                                  {competitorGroups
                                    .filter((g) => g.keywordIds.includes(item.id))
                                    .map((g) => (
                                      <span
                                        key={g.id}
                                        id={`badge-group-${g.id}-${item.id}`}
                                        data-testid={`badge-group-${g.id}-${item.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveGroupFilter(activeGroupFilter === g.id ? null : g.id);
                                        }}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                                        title={`"${g.name}" grubuna dahil. Tıklayarak bu gruba göre filtreleyin.`}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                        <span>{g.name}</span>
                                      </span>
                                    ))}
                                  
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(item.id, item.keyword)}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    title="Kelimeyi panoya kopyala"
                                  >
                                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>

                                  <button
                                    type="button"
                                    id={`btn-quick-copy-${item.id}`}
                                    data-testid={`btn-quick-copy-${item.id}`}
                                    onClick={() => handleDuplicateRow(item)}
                                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                                    title={`"${item.keyword}" satırındaki verileri yeni bir satıra kopyala`}
                                    aria-label={`"${item.keyword}" satırını yeni bir satıra kopyala`}
                                  >
                                    <Copy className="w-3 h-3 text-indigo-600" />
                                  </button>

                                  <button
                                    type="button"
                                    id={`btn-quick-edit-${item.id}`}
                                    data-testid={`btn-quick-edit-${item.id}`}
                                    onClick={() => handleStartEdit(item)}
                                    className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                                    title={`"${item.keyword}" satırını ve rakip metriklerini düzenle`}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    id={`btn-quick-delete-${item.id}`}
                                    data-testid={`btn-quick-delete-${item.id}`}
                                    onClick={() => handleDeleteRow(item.id, item.keyword)}
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                    title={`"${item.keyword}" satırını tablodan kaldır`}
                                    aria-label={`"${item.keyword}" satırını sil`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>

                                  {/* Quick Note Button with Hover Note Preview Bubble */}
                                  <div 
                                    className="relative inline-flex items-center"
                                    onMouseEnter={() => setHoveredNoteButtonId(item.id)}
                                    onMouseLeave={() => setHoveredNoteButtonId((prev) => (prev === item.id ? null : prev))}
                                  >
                                    <button
                                      type="button"
                                      id={`btn-quick-note-${item.id}`}
                                      data-testid={`btn-quick-note-${item.id}`}
                                      onClick={() => toggleNotepad(item.id)}
                                      className={`p-1 rounded-md cursor-pointer transition-colors relative ${
                                        itemNote
                                          ? "text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-2xs"
                                          : isNotepadOpen
                                          ? "text-amber-900 bg-amber-200 border border-amber-400"
                                          : "text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                                      }`}
                                      title={itemNote ? "Stratejik notu aç / düzenle (hover ile önizleyin)" : `"${item.keyword}" rakip satırına stratejik not ekle`}
                                      aria-label={`"${item.keyword}" satırına not ekle`}
                                    >
                                      <StickyNote className="w-3 h-3" />
                                      {itemNote && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white animate-pulse" />
                                      )}
                                    </button>

                                    {/* Önizleme Balonu (Hover Preview Bubble) */}
                                    {itemNote && itemNote.text && !isNotepadOpen && (
                                      <div
                                        id={`note-preview-bubble-${item.id}`}
                                        data-testid={`note-preview-bubble-${item.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleNotepad(item.id);
                                        }}
                                        className={`absolute z-50 left-0 sm:left-auto sm:right-full sm:mr-2.5 bottom-full sm:bottom-auto sm:-top-2 mb-2 sm:mb-0 w-72 sm:w-80 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white border border-amber-400/60 shadow-2xl transition-all duration-200 cursor-pointer pointer-events-auto select-none ${
                                          hoveredRowId === item.id || hoveredNoteButtonId === item.id
                                            ? "opacity-100 translate-y-0 visible scale-100"
                                            : "opacity-0 translate-y-1 invisible scale-95 group-hover/row:opacity-100 group-hover/row:translate-y-0 group-hover/row:visible group-hover/row:scale-100"
                                        }`}
                                        title="Notun tamamını açmak ve düzenlemek için tıklayın"
                                        aria-label={`"${item.keyword}" stratejik not önizleme balonu`}
                                      >
                                        {/* Balon Başlığı & Güncelleme Zamanı */}
                                        <div className="flex items-center justify-between gap-1.5 border-b border-slate-800 pb-1.5 mb-2">
                                          <div className="flex items-center gap-1.5">
                                            <StickyNote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span className="text-[11px] font-black text-amber-300 tracking-wide">
                                              Stratejik Not Önizlemesi
                                            </span>
                                          </div>
                                          {itemNote.updatedAt && (
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              {itemNote.updatedAt}
                                            </span>
                                          )}
                                        </div>

                                        {/* Varsa Stratejik Etiketler (Tags) */}
                                        {itemNote.tags && itemNote.tags.length > 0 && (
                                          <div className="flex items-center gap-1 flex-wrap mb-1.5">
                                            {itemNote.tags.map((tag, tIdx) => (
                                              <span
                                                key={tIdx}
                                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30"
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )}

                                        {/* Not Metni (Kırpılmış Parça) */}
                                        <p className="text-xs text-slate-200 leading-relaxed font-normal line-clamp-3">
                                          {itemNote.text.length > 130 ? itemNote.text.slice(0, 130) + "..." : itemNote.text}
                                        </p>

                                        {/* Alt Aksiyon & Düzenle İpucu */}
                                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-300 font-bold">
                                          <span>Tamamını Aç / Düzenle</span>
                                          <span className="inline-flex items-center gap-0.5 text-amber-400 hover:text-amber-300">
                                            Aç <ArrowUpRight className="w-3 h-3" />
                                          </span>
                                        </div>

                                        {/* Balon Oku / Caret (Masaüstünde sağa ok) */}
                                        <div className="hidden sm:block absolute -right-1.5 top-3.5 w-3 h-3 bg-slate-900 border-t border-r border-amber-400/60 rotate-45" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Search Intent Badge */}
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    item.searchIntent === "Acil / Yerel" ? "bg-rose-100 text-rose-800" :
                                    item.searchIntent === "Ticari" ? "bg-indigo-100 text-indigo-800" :
                                    item.searchIntent === "İşlemsel" ? "bg-emerald-100 text-emerald-800" :
                                    "bg-amber-100 text-amber-800"
                                  }`}>
                                    {item.searchIntent}
                                  </span>

                                  {/* SEO Difficulty Score */}
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium ${
                                    item.difficulty > 45 ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                    item.difficulty > 30 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                    "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`} title="SEO Zorluk Skoru (0-100)">
                                    KD: {item.difficulty}
                                  </span>

                                  {/* Görsel Farklılık Vurgulayıcı KD Fırsatı */}
                                  {isVisualDiscrepancyMode && discrepancyAnalysis.cellMap[`${item.id}_difficulty`] && (
                                    <DiscrepancyBadge
                                      discrepancy={discrepancyAnalysis.cellMap[`${item.id}_difficulty`]}
                                      focusFilter={discrepancyFocusFilter}
                                      isPulseEnabled={isDiscrepancyPulseEnabled}
                                    />
                                  )}
                                </div>

                                {/* Strategic Note Preview Strip if exists */}
                                {itemNote && (
                                  <div 
                                    id={`note-preview-badge-${item.id}`}
                                    data-testid={`note-preview-badge-${item.id}`}
                                    onClick={() => toggleNotepad(item.id)}
                                    className={`mt-1 flex items-center gap-1.5 p-1.5 px-2 rounded-lg text-[11px] cursor-pointer transition-all group/badge shadow-2xs ${
                                      hoveredRowId === item.id || hoveredNoteButtonId === item.id
                                        ? "bg-amber-100/95 text-amber-950 border border-amber-400 ring-1 ring-amber-300/60"
                                        : "bg-amber-50/90 hover:bg-amber-100 border border-amber-300/80 text-amber-950"
                                    }`}
                                    title="Stratejik not defterini aç ve düzenle (üzerine gelindiğinde önizleme balonu açılır)"
                                  >
                                    <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span className="font-bold text-amber-900 shrink-0">Not:</span>
                                    <span className="truncate text-slate-700 group-hover/badge:text-slate-900 max-w-[180px] sm:max-w-[240px]">
                                      {itemNote.text}
                                    </span>
                                    {itemNote.tags && itemNote.tags.length > 0 && (
                                      <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200/80 text-amber-900 shrink-0">
                                        {itemNote.tags[0]}
                                      </span>
                                    )}
                                    <span className="text-[9px] text-amber-700 font-mono ml-auto shrink-0 font-medium">
                                      {itemNote.updatedAt}
                                    </span>
                                    <ArrowUpRight className="w-3 h-3 text-amber-600 shrink-0 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 2. Search Volume Column */}
                            <td className={`py-3.5 px-3 align-top ${
                              isVisualDiscrepancyMode
                                ? getDiscrepancyCellClasses(
                                    discrepancyAnalysis.cellMap[`${item.id}_volume`],
                                    discrepancyFocusFilter,
                                    isDiscrepancyPulseEnabled
                                  )
                                : ""
                            }`}>
                              <div className="space-y-0.5 font-mono">
                                <div className="font-bold text-xs text-slate-900 flex items-center gap-1 flex-wrap">
                                  <span className="text-indigo-600">●</span>
                                  <span>{item.monthlyVolume}</span>
                                  {isVisualDiscrepancyMode && discrepancyAnalysis.cellMap[`${item.id}_volume`] && (
                                    <DiscrepancyBadge
                                      discrepancy={discrepancyAnalysis.cellMap[`${item.id}_volume`]}
                                      focusFilter={discrepancyFocusFilter}
                                      isPulseEnabled={isDiscrepancyPulseEnabled}
                                    />
                                  )}
                                  {isDiffViewMode && isSelected && (() => {
                                    const baseItem = selectedRankings.find(r => r.id === (diffBaselineId || selectedRankings[0]?.id));
                                    if (!baseItem || baseItem.id === item.id) return null;
                                    const curVol = parseInt(item.monthlyVolume?.replace(/[^0-9]/g, "") || "0", 10);
                                    const bVol = parseInt(baseItem.monthlyVolume?.replace(/[^0-9]/g, "") || "0", 10);
                                    const dVol = curVol - bVol;
                                    if (dVol === 0) return null;
                                    return (
                                      <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${
                                        dVol > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"
                                      }`}>
                                        {dVol > 0 ? `+${dVol.toLocaleString("tr-TR")}` : dVol.toLocaleString("tr-TR")}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans">
                                  SERP Hacmi
                                </div>
                              </div>
                            </td>

                            {/* 3. Your Site Rank (Golden prominent) */}
                            <td className={`py-3.5 px-3.5 align-top bg-indigo-50/40 border-x border-indigo-100 ${
                              isVisualDiscrepancyMode
                                ? getDiscrepancyCellClasses(
                                    discrepancyAnalysis.cellMap[`${item.id}_userRank`],
                                    discrepancyFocusFilter,
                                    isDiscrepancyPulseEnabled
                                  )
                                : ""
                            }`}>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {item.userRank === 1 ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xs">
                                      <Trophy className="w-3.5 h-3.5" />
                                      <span>#1 (Lider)</span>
                                    </span>
                                  ) : item.userRank !== null ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-black ${
                                      item.userRank <= 3 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-800"
                                    }`}>
                                      #{item.userRank}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200 text-slate-500 text-[11px] font-medium">
                                      İlk 20'de Yok
                                    </span>
                                  )}

                                  {/* Görsel Farklılık Vurgulayıcı Rozeti */}
                                  {isVisualDiscrepancyMode && (
                                    <DiscrepancyBadge
                                      discrepancy={discrepancyAnalysis.cellMap[`${item.id}_userRank`]}
                                      focusFilter={discrepancyFocusFilter}
                                      isPulseEnabled={isDiscrepancyPulseEnabled}
                                    />
                                  )}

                                  {isDiffViewMode && isSelected && (() => {
                                    const baseItem = selectedRankings.find(r => r.id === (diffBaselineId || selectedRankings[0]?.id));
                                    if (!baseItem || baseItem.id === item.id) return null;
                                    const curRk = item.userRank ?? 99;
                                    const bRk = baseItem.userRank ?? 99;
                                    const dRk = curRk - bRk;
                                    if (dRk === 0) return null;
                                    return (
                                      <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${
                                        dRk < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"
                                      }`}>
                                        {dRk < 0 ? `▲ +${Math.abs(dRk)} sıra` : `▼ -${dRk} sıra`}
                                      </span>
                                    );
                                  })()}
                                </div>

                                <div className="text-[10px] text-slate-500">
                                  {isLeading ? (
                                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Rakiplerin Önünde
                                    </span>
                                  ) : isTrailing ? (
                                    <span className="text-rose-600 font-bold">
                                      {item.gap} Sıra Geride
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 font-bold">
                                      Giriş Fırsatı (+99)
                                    </span>
                                  )}
                                </div>

                                {/* Siteniz PageSpeed Mini-Sparkline */}
                                <div className="pt-0.5">
                                  <CompetitorPsiSparkline
                                    competitorName={userName || "Siteniz"}
                                    currentScore={98}
                                    userScore={98}
                                    width={48}
                                    height={16}
                                    showScoreBadge={true}
                                    showDelta={false}
                                    isUser={true}
                                    id={`sparkline-user-${item.id}`}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Goal Tracking Mode Cell (Hedef Değer, Başarım % & Sapma) */}
                            {isGoalTrackingMode && (
                              <td className="py-3 px-3 align-top bg-indigo-50/25 border-r border-indigo-100 min-w-[170px]">
                                <GoalTrackingCell
                                  itemId={item.id}
                                  keyword={item.keyword}
                                  currentRank={item.userRank}
                                  bestCompRank={bestCompRank}
                                  bestCompName={topComp?.name || "Lider Rakip"}
                                  targetRank={keywordGoals[item.id]?.targetRank || (item.userRank && item.userRank <= 3 ? 1 : 3)}
                                  onUpdateTarget={handleUpdateTarget}
                                />
                              </td>
                            )}

                            {/* 6-Month Trend Forecast Cell (d3.js Engine Sparkline) */}
                            {isTrendColumnVisible && (
                              <td 
                                id={`td-col-trend-forecast-${item.id}`}
                                data-testid={`td-trend-forecast-${item.id}`}
                                className="py-3 px-3 align-top bg-slate-50/40 border-r border-slate-200/80 min-w-[210px]"
                              >
                                <CompetitorKeywordRowTrendSparkline
                                  item={item}
                                  profiles={competitorGrowthProfiles}
                                  colorPalette={colorTheme}
                                  width={135}
                                  height={36}
                                />
                              </td>
                            )}

                            {/* 4. Competitor Name (Leading Competitor) Column */}
                            <td className="py-3.5 px-3 align-top">
                              {((item as any).competitorName || topComp) ? (
                                <div className="space-y-1">
                                  <div 
                                    className="font-bold text-xs text-slate-900 truncate max-w-[130px] flex items-center gap-1" 
                                    title={(item as any).competitorName || topComp?.name}
                                  >
                                    <span className="truncate">{(item as any).competitorName || topComp?.name}</span>
                                    {(item as any).competitorName && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Kullanıcı tarafından düzenlenmiş rakip adı" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px]">
                                    {topComp?.rank && <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">#{topComp.rank}</span>}
                                    <span className="text-slate-400 font-mono truncate max-w-[85px]">{topComp?.domain || "Özel"}</span>
                                  </div>

                                  {/* Google PageSpeed Insights mini-sparkline for Leading Competitor */}
                                  <div className="pt-0.5">
                                    <CompetitorPsiSparkline
                                      competitorName={(item as any).competitorName || topComp?.name || comp1.name}
                                      competitorDomain={topComp?.domain || comp1.domain}
                                      currentScore={topComp?.speedScore || ((item as any).competitorName ? 74 : comp1.speedScore || 74)}
                                      userScore={98}
                                      width={64}
                                      height={18}
                                      showScoreBadge={true}
                                      showDelta={true}
                                      id={`sparkline-lead-${item.id}`}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>

                            {/* 5. Competitor 1 Rank */}
                            <td className={`py-3.5 px-3 align-top ${
                              isVisualDiscrepancyMode
                                ? getDiscrepancyCellClasses(
                                    discrepancyAnalysis.cellMap[`${item.id}_comp1Rank`],
                                    discrepancyFocusFilter,
                                    isDiscrepancyPulseEnabled
                                  )
                                : ""
                            }`}>
                              <div className="space-y-1">
                                <div className="font-mono font-bold text-xs text-slate-800 flex items-center gap-1 flex-wrap">
                                  {item.comp1Rank ? (
                                    <span className={item.comp1Rank === 1 ? "text-amber-600 font-black" : ""}>
                                      #{item.comp1Rank} {item.comp1Rank === 1 && "👑"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                  {isVisualDiscrepancyMode && (
                                    <DiscrepancyBadge
                                      discrepancy={discrepancyAnalysis.cellMap[`${item.id}_comp1Rank`]}
                                      focusFilter={discrepancyFocusFilter}
                                      isPulseEnabled={isDiscrepancyPulseEnabled}
                                    />
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[95px]">
                                  {comp1.name.split(" ")[0]}
                                </div>
                                <div className="pt-0.5">
                                  <CompetitorPsiSparkline
                                    competitorName={comp1.name}
                                    competitorDomain={comp1.domain}
                                    currentScore={comp1.speedScore || 74}
                                    userScore={98}
                                    width={48}
                                    height={16}
                                    showScoreBadge={true}
                                    showDelta={false}
                                    id={`sparkline-comp1-${item.id}`}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* 6. Competitor 2 Rank */}
                            <td className={`py-3.5 px-3 align-top ${
                              isVisualDiscrepancyMode
                                ? getDiscrepancyCellClasses(
                                    discrepancyAnalysis.cellMap[`${item.id}_comp2Rank`],
                                    discrepancyFocusFilter,
                                    isDiscrepancyPulseEnabled
                                  )
                                : ""
                            }`}>
                              <div className="space-y-1">
                                <div className="font-mono font-bold text-xs text-slate-800 flex items-center gap-1 flex-wrap">
                                  {item.comp2Rank ? (
                                    <span className={item.comp2Rank === 1 ? "text-amber-600 font-black" : ""}>
                                      #{item.comp2Rank} {item.comp2Rank === 1 && "👑"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                  {isVisualDiscrepancyMode && (
                                    <DiscrepancyBadge
                                      discrepancy={discrepancyAnalysis.cellMap[`${item.id}_comp2Rank`]}
                                      focusFilter={discrepancyFocusFilter}
                                      isPulseEnabled={isDiscrepancyPulseEnabled}
                                    />
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[95px]">
                                  {comp2.name.split(" ")[0]}
                                </div>
                                <div className="pt-0.5">
                                  <CompetitorPsiSparkline
                                    competitorName={comp2.name}
                                    competitorDomain={comp2.domain}
                                    currentScore={comp2.speedScore || 81}
                                    userScore={98}
                                    width={48}
                                    height={16}
                                    showScoreBadge={true}
                                    showDelta={false}
                                    id={`sparkline-comp2-${item.id}`}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* 7. Competitor 3 Rank */}
                            <td className={`py-3.5 px-3 align-top ${
                              isVisualDiscrepancyMode
                                ? getDiscrepancyCellClasses(
                                    discrepancyAnalysis.cellMap[`${item.id}_comp3Rank`],
                                    discrepancyFocusFilter,
                                    isDiscrepancyPulseEnabled
                                  )
                                : ""
                            }`}>
                              <div className="space-y-1">
                                <div className="font-mono font-bold text-xs text-slate-800 flex items-center gap-1 flex-wrap">
                                  {item.comp3Rank ? (
                                    <span className={item.comp3Rank === 1 ? "text-amber-600 font-black" : ""}>
                                      #{item.comp3Rank} {item.comp3Rank === 1 && "👑"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                  {isVisualDiscrepancyMode && (
                                    <DiscrepancyBadge
                                      discrepancy={discrepancyAnalysis.cellMap[`${item.id}_comp3Rank`]}
                                      focusFilter={discrepancyFocusFilter}
                                      isPulseEnabled={isDiscrepancyPulseEnabled}
                                    />
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[95px]">
                                  {comp3.name.split(" ")[0]}
                                </div>
                                <div className="pt-0.5">
                                  <CompetitorPsiSparkline
                                    competitorName={comp3.name}
                                    competitorDomain={comp3.domain}
                                    currentScore={comp3.speedScore || 62}
                                    userScore={98}
                                    width={48}
                                    height={16}
                                    showScoreBadge={true}
                                    showDelta={false}
                                    id={`sparkline-comp3-${item.id}`}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* 8. Gap Status Column */}
                            <td className={`py-3.5 px-3.5 align-top text-center ${
                              isVisualDiscrepancyMode
                                ? getDiscrepancyCellClasses(
                                    discrepancyAnalysis.cellMap[`${item.id}_gap`],
                                    discrepancyFocusFilter,
                                    isDiscrepancyPulseEnabled
                                  )
                                : ""
                            }`}>
                              {item.userRank === null ? (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                                  Boşluk (+99)
                                </span>
                              ) : item.gap < 0 ? (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                  +{Math.abs(item.gap)} Sıra Önde
                                </span>
                              ) : item.gap === 0 ? (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                                  Eşit Sıra
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                                  -{item.gap} Sıra Fark
                                </span>
                              )}
                              {isVisualDiscrepancyMode && (
                                <div className="mt-1 flex justify-center">
                                  <DiscrepancyBadge
                                    discrepancy={discrepancyAnalysis.cellMap[`${item.id}_gap`]}
                                    focusFilter={discrepancyFocusFilter}
                                    isPulseEnabled={isDiscrepancyPulseEnabled}
                                  />
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-1">
                                {item.trafficOpportunity}
                              </div>
                            </td>

                            {/* 9. Gemini Recommendation Column */}
                            <td className="py-3.5 px-4 align-top">
                              <div className="space-y-2">
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed">
                                  <div className="flex items-start gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                    <span>{item.aiRecommendation}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {onApplyKeyword && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdd(item.id, item.keyword)}
                                      disabled={isAdded}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                        isAdded
                                          ? "bg-emerald-100 text-emerald-800 cursor-default"
                                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                      }`}
                                      title="Sitenizin SEO hedeflerine ekle"
                                    >
                                      {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                      <span>{isAdded ? "Siteye Eklendi" : "Hedeflere Ekle"}</span>
                                    </button>
                                  )}

                                  {onSendToAiBlog && (
                                    <button
                                      type="button"
                                      onClick={() => onSendToAiBlog(item.keyword, `${item.keyword} Rehberi ve Çözümleri`)}
                                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-all"
                                      title="Bu kelimede sıralama almak için AI Blog yazısı üret"
                                    >
                                      <BookOpen className="w-3 h-3" />
                                      <span>AI Blog Yazısı Başlat</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-800 ml-auto flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span>{isExpanded ? "Kapat" : "Detay"}</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* 10. Actions / Inline Edit, Copy Row & Delete Row Column */}
                            <td className="py-3.5 px-3 align-middle text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap sm:flex-nowrap">
                                <button
                                  type="button"
                                  id={`btn-note-row-${item.id}`}
                                  data-testid={`btn-note-row-${item.id}`}
                                  onClick={() => toggleNotepad(item.id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs group ${
                                    itemNote
                                      ? "text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300"
                                      : isNotepadOpen
                                      ? "text-amber-950 bg-amber-200 border border-amber-400"
                                      : "text-slate-700 hover:text-amber-800 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300"
                                  }`}
                                  title={`"${item.keyword}" satırına stratejik SEO notu ekle veya düzenle`}
                                  aria-label={`"${item.keyword}" satırına not ekle`}
                                >
                                  <StickyNote className={`w-3.5 h-3.5 ${itemNote ? "text-amber-600" : "text-slate-500 group-hover:text-amber-600"} transition-colors`} />
                                  <span>{itemNote ? "Notu Gör" : "Not Ekle"}</span>
                                  {itemNote && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  id={`btn-edit-row-${item.id}`}
                                  data-testid={`btn-edit-row-${item.id}`}
                                  onClick={() => handleStartEdit(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
                                  title={`"${item.keyword}" satırındaki rakip adı veya metrik değerlerini doğrudan düzenle`}
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                                  <span>Düzenle</span>
                                </button>

                                <button
                                  type="button"
                                  id={`btn-copy-row-${item.id}`}
                                  data-testid={`btn-copy-row-${item.id}`}
                                  onClick={() => handleDuplicateRow(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 transition-all cursor-pointer shadow-2xs group"
                                  title={`"${item.keyword}" satırındaki verileri anında yeni bir satıra kopyala`}
                                  aria-label={`"${item.keyword}" satırını yeni bir satıra kopyala`}
                                >
                                  <Copy className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white transition-colors" />
                                  <span>Kopyala</span>
                                </button>

                                <button
                                  type="button"
                                  id={`btn-delete-row-${item.id}`}
                                  data-testid={`btn-delete-row-${item.id}`}
                                  onClick={() => handleDeleteRow(item.id, item.keyword)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all cursor-pointer shadow-2xs group"
                                  title={`"${item.keyword}" rakip satırını tek tıklamayla tamamen kaldır`}
                                  aria-label={`"${item.keyword}" satırını sil`}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover:text-white transition-colors" />
                                  <span>Satır Sil</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* 3.4 INLINE STRATEGIC NOTEPAD SUB-ROW */}
                          {isNotepadOpen && (
                            <tr 
                              id={`row-notepad-${item.id}`}
                              data-testid={`row-notepad-${item.id}`}
                              className="bg-amber-50/50 border-y-2 border-amber-300 shadow-inner"
                            >
                              <td colSpan={currentTableColSpan} className="p-3 sm:p-4">
                                <RowStrategicNotepad
                                  itemId={item.id}
                                  keyword={item.keyword}
                                  competitorName={(item as any).competitorName || topComp?.name || comp1.name}
                                  userRank={item.userRank}
                                  competitorRank={item.comp1Rank}
                                  note={itemNote}
                                  onSave={(text, tags) => handleSaveNote(item.id, text, tags)}
                                  onDelete={() => handleDeleteNote(item.id)}
                                  onClose={() => toggleNotepad(item.id)}
                                  toastMessage={noteSaveToast?.id === item.id ? noteSaveToast.message : null}
                                />
                              </td>
                            </tr>
                          )}

                          {/* Expanded Row Details */}
                          {isExpanded && (
                            <tr className="bg-indigo-50/30 border-b border-indigo-100">
                              <td colSpan={currentTableColSpan} className="p-4 sm:p-5">
                                <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-indigo-600" />
                                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                        "{item.keyword}" İçin Gemini Derin SERP Analizi & Aksiyon Planı
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        id={`btn-expanded-edit-${item.id}`}
                                        data-testid={`btn-expanded-edit-${item.id}`}
                                        onClick={() => handleStartEdit(item)}
                                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                        title="Satır içi düzenleme modunu aç"
                                      >
                                        <Pencil className="w-3 h-3" />
                                        <span>Satırı Düzenle</span>
                                      </button>
                                      <button
                                        type="button"
                                        id={`btn-expanded-copy-${item.id}`}
                                        data-testid={`btn-expanded-copy-${item.id}`}
                                        onClick={() => handleDuplicateRow(item)}
                                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                        title={`"${item.keyword}" satırındaki verileri yeni bir satıra kopyala`}
                                        aria-label={`"${item.keyword}" satırını kopyala`}
                                      >
                                        <Copy className="w-3 h-3 text-indigo-600" />
                                        <span>Satırı Kopyala</span>
                                      </button>
                                      <button
                                        type="button"
                                        id={`btn-expanded-delete-${item.id}`}
                                        data-testid={`btn-expanded-delete-${item.id}`}
                                        onClick={() => handleDeleteRow(item.id, item.keyword)}
                                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                        title={`"${item.keyword}" satırını sil`}
                                      >
                                        <Trash2 className="w-3 h-3 text-rose-600" />
                                        <span>Satırı Sil</span>
                                      </button>
                                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                        Hedeflenen Sıralama: #1 (Organik Lider)
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                      <div className="font-bold text-slate-800">1. Rakibin Güçlü Yönü:</div>
                                      <p className="text-slate-600 text-[11px]">
                                        "{comp1.name}" bu terimde {item.comp1Rank}. sırada. Sayfasında zengin anahtar kelime yoğunluğu ve SSS içeriği barındırıyor.
                                      </p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                                      <div className="font-bold text-emerald-900">Sizin Hız Üstünlüğünüz:</div>
                                      <p className="text-emerald-800 text-[11px]">
                                        Siteniz Cloudflare Edge üzerinde 98/100 Core Web Vitals skoruyla açılıyor. İçerik derinliği eklendiğinde Google botları sitenizi hızla öne taşıyacaktır.
                                      </p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/80 space-y-1">
                                      <div className="font-bold text-indigo-900">Tavsiye Edilen Meta Başlık:</div>
                                      <p className="text-indigo-800 text-[11px] font-medium">
                                        "{userName} | En Hızlı {item.keyword} & Şeffaf Fiyat Garantisi"
                                      </p>
                                    </div>
                                  </div>

                                  {/* Google PageSpeed Insights 6-Ay Geçmiş Denetim Matrisi */}
                                  <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2.5 shadow-xs">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                                          Google PageSpeed Insights • Son 6 Denetim Geçmiş Skor Kıyaslaması
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        Mobil SERP Sıralama Avantajı: Siteniz 98/100 ile tüm rakiplerin önünde
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                                      {/* Siteniz */}
                                      <div className="p-2.5 rounded-lg bg-slate-800/90 border border-emerald-500/50 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-emerald-300">★ {userName || "Siteniz"}</span>
                                          <span className="text-[11px] font-mono font-black text-emerald-400">98 / 100</span>
                                        </div>
                                        <CompetitorPsiSparkline
                                          competitorName={userName || "Siteniz"}
                                          currentScore={98}
                                          userScore={98}
                                          isUser={true}
                                          width={110}
                                          height={24}
                                          showScoreBadge={false}
                                          showDelta={true}
                                          id={`sparkline-exp-user-${item.id}`}
                                        />
                                        <div className="text-[9px] text-emerald-400/90 font-medium">✓ CWV Geçti • LCP 1.2s • Lider Trend</div>
                                      </div>

                                      {/* 1. Rakip */}
                                      <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-200 truncate max-w-[90px]">{comp1.name}</span>
                                          <span className="text-[11px] font-mono font-black text-amber-400">{comp1.speedScore || 74} / 100</span>
                                        </div>
                                        <CompetitorPsiSparkline
                                          competitorName={comp1.name}
                                          competitorDomain={comp1.domain}
                                          currentScore={comp1.speedScore || 74}
                                          userScore={98}
                                          width={110}
                                          height={24}
                                          showScoreBadge={false}
                                          showDelta={true}
                                          id={`sparkline-exp-comp1-${item.id}`}
                                        />
                                        <div className="text-[9px] text-amber-400/90">⚠️ LCP 3.4s • Sitenizden 24 Puan Yavaş</div>
                                      </div>

                                      {/* 2. Rakip */}
                                      <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-200 truncate max-w-[90px]">{comp2.name}</span>
                                          <span className="text-[11px] font-mono font-black text-emerald-400">{comp2.speedScore || 81} / 100</span>
                                        </div>
                                        <CompetitorPsiSparkline
                                          competitorName={comp2.name}
                                          competitorDomain={comp2.domain}
                                          currentScore={comp2.speedScore || 81}
                                          userScore={98}
                                          width={110}
                                          height={24}
                                          showScoreBadge={false}
                                          showDelta={true}
                                          id={`sparkline-exp-comp2-${item.id}`}
                                        />
                                        <div className="text-[9px] text-slate-400">⚠️ LCP 2.7s • Son 6 denetimde -4 düşüş</div>
                                      </div>

                                      {/* 3. Rakip */}
                                      <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-200 truncate max-w-[90px]">{comp3.name}</span>
                                          <span className="text-[11px] font-mono font-black text-rose-400">{comp3.speedScore || 62} / 100</span>
                                        </div>
                                        <CompetitorPsiSparkline
                                          competitorName={comp3.name}
                                          competitorDomain={comp3.domain}
                                          currentScore={comp3.speedScore || 62}
                                          userScore={98}
                                          width={110}
                                          height={24}
                                          showScoreBadge={false}
                                          showDelta={true}
                                          id={`sparkline-exp-comp3-${item.id}`}
                                        />
                                        <div className="text-[9px] text-rose-400/90">🚨 LCP 4.6s • CWV Başarısız • Fırsat</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}

                  {/* Table Bottom Action: 'Yeni Rakip Ekle' Row */}
                  <tr 
                    id="row-add-new-competitor-wrapper"
                    className="bg-slate-50/80 hover:bg-slate-100/90 transition-colors border-t-2 border-dashed border-slate-200"
                  >
                    <td colSpan={currentTableColSpan} className="py-4 px-4 text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          id="btn-add-new-competitor-row"
                          data-testid="btn-add-new-competitor-row"
                          onClick={handleAddNewCompetitorRow}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          title="Tablonun en altına yeni bir boş rakip satırı ekleyin ve doğrudan düzenleyin"
                          aria-label="Yeni Rakip Ekle"
                        >
                          <Plus className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" />
                          <span>Yeni Rakip Ekle</span>
                        </button>
                        <span className="text-slate-500 text-xs font-medium">
                          Tablonun en altına boş bir rakip satırı ekleyerek hedef anahtar kelimeleri ve metrikleri manuel olarak analiz edebilirsiniz.
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer with Timestamp & Summary & CSV Quick Actions */}
            <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <div>
                Toplam <strong>{effectiveRankings.length}</strong> anahtar kelime analiz edildi. Gösterilen: <strong>{filteredAndSortedRankings.length}</strong> kelime.
              </div>
              <div className="flex items-center gap-3 font-medium text-slate-600 flex-wrap">
                <button
                  type="button"
                  id="btn-footer-add-new-competitor"
                  data-testid="btn-footer-add-new-competitor"
                  onClick={handleAddNewCompetitorRow}
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  title="Tablonun en altına yeni bir boş rakip satırı ekleyin"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Yeni Rakip Ekle</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  id="btn-footer-export-as-csv"
                  data-testid="btn-footer-export-as-csv"
                  onClick={() => handleExportCsv(true)}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                  title="Tablodaki tüm verileri CSV formatında indirin"
                  aria-label="Dışa Aktar"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Dışa Aktar</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">CSV</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  id="btn-footer-copy-csv"
                  onClick={handleCopyCsvString}
                  className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  title="CSV metnini doğrudan panoya kopyala"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCsvCopied ? "CSV Kopyalandı!" : "CSV Metnini Kopyala"}</span>
                </button>
                <span>•</span>
                <span>Canlı SERP & Gemini AI Sinyalleri</span>
              </div>
            </div>
          </div>

          {/* 3. D3.JS LINE CHART: 6-MONTH COMPETITOR PERFORMANCE GROWTH FORECAST */}
          <CompetitorGrowthForecastD3Chart
            rankings={effectiveRankings}
            competitors={effectiveCompetitors}
            userName={userName}
            userDomain={userDomain}
            colorPalette={colorTheme}
          />

          {/* 4. D3.JS BAR CHART SUMMARY OF SELECTED DATA DISTRIBUTION */}
          <SelectedDataDistributionD3Chart
            selectedRankings={selectedRankings}
            allRankings={filteredAndSortedRankings.length > 0 ? filteredAndSortedRankings : effectiveRankings}
            userName={userName}
            competitors={effectiveCompetitors}
            colorPalette={colorTheme}
            onSelectAll={handleSelectAllRows}
            onClearSelection={clearSelection}
          />
        </>
      )}

      {/* 4. SEPARATE COMPARISON CHART MODAL */}
      <SelectedCompetitorComparisonChartModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        selectedRankings={selectedRankings}
        userName={userName}
        competitors={effectiveCompetitors}
        onApplyAllKeywords={(keywords) => {
          if (onApplyKeyword) {
            keywords.forEach((kw) => onApplyKeyword(kw));
            setDownloadNotification(`${keywords.length} anahtar kelime SEO hedeflerinize eklendi!`);
            setTimeout(() => setDownloadNotification(null), 3500);
          }
        }}
        onExportSelectedCsv={handleExportSelectedCsv}
      />

      {/* 5. AI STRATEGY SUMMARY REPORT MODAL */}
      <AiStrategySummaryReportModal
        isOpen={isStrategyReportModalOpen}
        onClose={() => setIsStrategyReportModalOpen(false)}
        reportData={strategyReportData}
        isLoading={isGeneratingStrategyReport}
        onRegenerate={handleGenerateStrategyReport}
        userName={userName}
        userDomain={userDomain}
      />

      {/* 6. TABLE PDF EXPORT MODAL */}
      <TablePdfExportModal
        isOpen={isPdfExportModalOpen}
        onClose={() => setIsPdfExportModalOpen(false)}
        rankings={pdfExportData}
        userName={userName}
        userDomain={userDomain}
        competitors={effectiveCompetitors}
        goals={keywordGoals}
        strategicNotes={strategicNotes}
        scopeLabel={pdfExportScopeLabel}
        onDownloadMarketSharePdf={handleDownloadMarketSharePdf}
      />

      {/* 7. AUTOMATED WEEKLY REPORT SCHEDULER MODAL */}
      <AutoReportSchedulerModal
        isOpen={isAutoReportModalOpen}
        onClose={() => setIsAutoReportModalOpen(false)}
        allRankings={effectiveRankings}
        filteredRankings={filteredAndSortedRankings}
        selectedRankings={selectedRankings}
        userName={userName}
        userDomain={userDomain}
        competitors={effectiveCompetitors}
        goals={keywordGoals}
        strategicNotes={strategicNotes}
        selectedCsvColumns={selectedCsvColumns}
        defaultUserEmail={siteConfig?.email || "selimoyan@gmail.com"}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 3500);
        }}
        onScheduleUpdated={(cfg) => setAutoReportConfig(cfg)}
      />

      {/* 8. COMPETITOR GOAL IMPACT ANALYSIS & HEATMAP OVERLAY MODAL */}
      <CompetitorGoalImpactAnalysisModal
        isOpen={isImpactAnalysisModalOpen}
        onClose={() => setIsImpactAnalysisModalOpen(false)}
        rankings={effectiveRankings}
        competitors={effectiveCompetitors}
        goals={keywordGoals}
        userName={userName}
        userDomain={userDomain}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 3500);
        }}
      />

      {/* 9. COMPETITOR 3D SCATTER CORRELATION & MARKET POSITIONING MODAL */}
      <Competitor3DScatterPlotModal
        isOpen={is3DScatterModalOpen}
        onClose={() => setIs3DScatterModalOpen(false)}
        rankings={effectiveRankings}
        competitors={effectiveCompetitors}
        goals={keywordGoals}
        userName={userName}
        userDomain={userDomain}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 3500);
        }}
      />

      {/* 10. COMPETITOR PERFORMANCE RECOMMENDATIONS DRAWER (Yan Panel) */}
      <CompetitorPerformanceRecommendationsDrawer
        isOpen={isRecommendationsDrawerOpen}
        onClose={() => setIsRecommendationsDrawerOpen(false)}
        rankings={effectiveRankings}
        competitors={effectiveCompetitors}
        goals={keywordGoals}
        userName={userName}
        userDomain={userDomain}
        initialCompetitorId={selectedCompetitorForRecommendations}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 3500);
        }}
      />

      {/* 11. PROFESYONEL PAZAR PAYI VE REKABET ANALİZ RAPORU OLUŞTURUCU (PDF, MARKA LOGOSU & ÖZEL NOTLAR) */}
      <MarketShareReportBuilderModal
        isOpen={isReportBuilderModalOpen}
        onClose={() => {
          setIsReportBuilderModalOpen(false);
          setReportBuilderCustomRankings(null);
        }}
        rankings={reportBuilderCustomRankings || effectiveRankings}
        competitors={effectiveCompetitors.map((c) => ({
          name: c.name,
          domain: c.domain,
          visibilityScore: c.visibilityScore,
          speedScore: c.speedScore,
          domainAuthority: c.domainAuthority,
          keywordCount: c.keywordCount,
          rank: c.rank
        }))}
        userName={userName}
        userDomain={userDomain}
        strategicNotes={strategicNotes}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 3500);
        }}
      />

      {/* 12. KAYAN TOPLU AKSİYON MENÜSÜ (FLOATING BULK ACTION BAR) */}
      <FloatingBulkActionBar
        selectedCount={selectedRankings.length}
        totalCount={effectiveRankings.length}
        selectedKeywords={selectedRankings.map((r) => r.keyword).filter(Boolean)}
        onBulkDelete={handleBulkDeleteSelected}
        onExportSelectedPdf={handleDownloadSelectedPdf}
        onOpenReportBuilder={handleOpenSelectedReportBuilder}
        onOpenCreateGroup={() => {
          setIsGroupManagerOpen(true);
          setTimeout(() => {
            const el = document.getElementById("competitor-group-manager-panel");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }}
        onExportSelectedExcel={handleExportSelectedExcel}
        onCompareSelected={() => setIsComparisonModalOpen(true)}
        onToggleDiffView={handleToggleDiffView}
        isDiffViewActive={isDiffViewMode}
        onClearSelection={clearSelection}
        onSelectAll={handleSelectAllRows}
        isAllSelected={isAllSelected}
        isGeneratingPdf={isGeneratingMarketSharePdf}
        onBulkAddToTargets={onApplyKeyword ? handleBulkAddToTargets : undefined}
      />

      {/* 13. HARİCİ CSV VERİSİ İÇE AKTARMA VE OTOMATİK EŞLEŞTİRME MODALI */}
      <CompetitorCsvImportModal
        isOpen={isCsvImportModalOpen}
        onClose={() => {
          setIsCsvImportModalOpen(false);
          setCsvModalInitialText("");
          setCsvModalInitialFileName(null);
          setCsvModalInitialFileSize(null);
          setCsvModalInitialStep(1);
        }}
        existingRankings={effectiveRankings}
        userName={userName}
        competitors={effectiveCompetitors.map((c) => ({
          name: c.name,
          domain: c.domain
        }))}
        initialRawText={csvModalInitialText}
        initialFileName={csvModalInitialFileName || undefined}
        initialFileSize={csvModalInitialFileSize || undefined}
        initialStep={csvModalInitialStep}
        onImportComplete={handleCsvImportComplete}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 4500);
        }}
      />

      {/* 14. D3.JS GRAFİK SERİLERİ RENK TEMASI SEÇİCİ MODALI */}
      <CompetitorColorThemeModal
        isOpen={isColorThemeModalOpen}
        onClose={() => setIsColorThemeModalOpen(false)}
        currentPalette={colorTheme}
        onApplyPalette={handleApplyColorTheme}
        userName={userName}
        competitors={effectiveCompetitors.map((c) => ({
          name: c.name,
          domain: c.domain
        }))}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 4000);
        }}
      />

      {/* 15. GELİŞMİŞ DIŞA AKTARMA AYARLARI PENCERESİ (PDF & JSON Özel Sıkıştırma ve Formatlama) */}
      <AdvancedExportSettingsModal
        isOpen={isAdvancedExportModalOpen}
        onClose={() => setIsAdvancedExportModalOpen(false)}
        allRankings={effectiveRankings}
        filteredRankings={filteredAndSortedRankings}
        selectedRankings={selectedRankings}
        userName={userName}
        userDomain={userDomain}
        competitors={effectiveCompetitors}
        goals={keywordGoals}
        strategicNotes={strategicNotes}
        initialSettings={advancedExportSettings}
        onSettingsChange={(newSettings) => {
          setAdvancedExportSettings(newSettings);
          saveAdvancedExportSettings(newSettings);
        }}
        onNotification={(msg) => {
          setDownloadNotification(msg);
          setTimeout(() => setDownloadNotification(null), 4000);
        }}
      />

      {/* 16. STRATEJİK NOTLAR YAN PANELİ (DRAWER) */}
      <StrategicNotesDrawerPanel
        isOpen={isStrategicNotesDrawerOpen}
        onClose={() => setIsStrategicNotesDrawerOpen(false)}
        rankings={effectiveRankings}
        notes={strategicNotes}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
        onJumpToRow={handleJumpToRowFromDrawer}
        userName={userName}
        userDomain={userDomain}
      />
    </div>
  );
};
