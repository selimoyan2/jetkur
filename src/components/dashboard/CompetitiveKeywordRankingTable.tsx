import React, { useState, useMemo } from "react";
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
  Settings2,
  CheckSquare,
  Square,
  Pencil,
  RotateCcw,
  Trash2,
  StickyNote
} from "lucide-react";
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
import { RowStrategicNotepad, StrategicCompetitorNote } from "./RowStrategicNotepad";
import { HeaderMetricInfoTooltip } from "./HeaderMetricInfoTooltip";
import { generateCompetitorData } from "../../utils/competitiveSeoUtils";

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
  | "comp3Rank";

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
  // View mode: Table view vs D3.js bar chart representation
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

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

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "selected" | "with_notes" | "outranked" | "leading" | "competing" | "trailing" | "missing">("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [topEntityFilter, setTopEntityFilter] = useState<"all" | "top5_overall" | "comp1" | "comp2" | "comp3">("all");
  const [sortBy, setSortBy] = useState<RankingSortField>("userRank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
      // Search volume and Gap are best viewed highest first (desc)
      // Ranks and Names are best viewed ascending (#1 best rank, A-Z)
      if (field === "volume" || field === "gap") {
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

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "gap") {
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
    strategicNotes
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
      selectedColumnIds: selectedCsvColumns
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
      selectedColumnIds: selectedCsvColumns
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
      selectedColumnIds: selectedCsvColumns
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
      selectedColumnIds: selectedCsvColumns
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

  return (
    <div 
      id="seo-competitor-comparison-table" 
      data-testid="seo-competitor-comparison-table" 
      className={`space-y-6 ${className}`}
    >
      
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
            
            {/* View Mode Toggle: Table View vs D3.js Bar Chart */}
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

            {/* Dışa Aktar (Export as CSV) Button */}
            <button
              type="button"
              id="btn-export-as-csv"
              data-testid="export-as-csv-button"
              data-action="export-csv"
              onClick={() => handleExportCsv(true)}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 group"
              title="Tablodaki tüm verileri CSV formatında indirin (Dışa Aktar)"
              aria-label="Dışa Aktar"
            >
              <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
              <span>Dışa Aktar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 text-[10px] font-black border border-emerald-400/30">
                CSV
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
        />
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
                </select>

                {/* Dışa Aktar Button (Toolbar) */}
                <button
                  type="button"
                  id="btn-table-toolbar-export-csv"
                  data-testid="table-toolbar-export-csv-btn"
                  onClick={() => handleExportCsv(true)}
                  className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-emerald-500 shrink-0"
                  title="Tablodaki tüm verileri CSV formatında indirin"
                  aria-label="Dışa Aktar"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Dışa Aktar</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-100 text-[10px] font-black">
                    CSV
                  </span>
                </button>

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

                {/* Action 3: Export Selected as CSV */}
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

          {/* 3.2 THE COMPARISON TABLE */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table id="seo-competitor-comparison-table-grid" className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-800 select-none">
                    
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
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSpeedScoreCardsOpen(true);
                          setHighlightedCompetitorSpeedId(comp1.id || "comp-1");
                          const el = document.getElementById("competitor-speed-score-cards-panel");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/40 transition-colors"
                        title={`${comp1.name} Google PageSpeed: 74/100 • LCP: 3.4s`}
                      >
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span>PSI {comp1.speedScore || 74}</span>
                        <span className="text-rose-300 font-sans font-bold">LCP 3.4s</span>
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
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSpeedScoreCardsOpen(true);
                          setHighlightedCompetitorSpeedId(comp2.id || "comp-2");
                          const el = document.getElementById("competitor-speed-score-cards-panel");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/40 transition-colors"
                        title={`${comp2.name} Google PageSpeed: 81/100 • LCP: 2.7s`}
                      >
                        <Zap className="w-2.5 h-2.5 text-emerald-400" />
                        <span>PSI {comp2.speedScore || 81}</span>
                        <span className="text-emerald-300 font-sans font-bold">LCP 2.7s</span>
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
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSpeedScoreCardsOpen(true);
                          setHighlightedCompetitorSpeedId(comp3.id || "comp-3");
                          const el = document.getElementById("competitor-speed-score-cards-panel");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[9px] font-mono font-bold border border-rose-500/40 transition-colors"
                        title={`${comp3.name} Google PageSpeed: 62/100 • LCP: 4.6s`}
                      >
                        <Zap className="w-2.5 h-2.5 text-rose-400" />
                        <span>PSI {comp3.speedScore || 62}</span>
                        <span className="text-rose-300 font-sans font-bold">LCP 4.6s</span>
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
                      <td colSpan={11} className="py-12 text-center text-slate-400">
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
                        { name: comp1.name, domain: comp1.domain, rank: item.comp1Rank },
                        { name: comp2.name, domain: comp2.domain, rank: item.comp2Rank },
                        { name: comp3.name, domain: comp3.domain, rank: item.comp3Rank }
                      ].filter((c): c is { name: string; domain: string; rank: number } => c.rank !== null)
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
                                <td colSpan={11} className="py-2.5 px-3">
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
                              {/* 0. Row Status / Edit Active Indicator */}
                              <td className="py-3 px-2.5 align-middle text-center">
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span 
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
                                      hasValidationErrors ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                                    } font-bold text-xs shadow-xs`}
                                    title={hasValidationErrors ? "Sayısal doğrulama hatası mevcut" : "Satır içi düzenleme modu aktif"}
                                  >
                                    {hasValidationErrors ? (
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                    ) : (
                                      <Pencil className="w-3.5 h-3.5 animate-pulse" />
                                    )}
                                  </span>
                                  <span className={`text-[9px] font-black ${hasValidationErrors ? "text-rose-800" : "text-amber-800"}`}>
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
                                <td colSpan={11} className="p-3 sm:p-4">
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
                            className={`hover:bg-slate-50/80 transition-colors ${
                            recentlyAddedId === item.id
                              ? "bg-emerald-50/90 border-l-4 border-l-emerald-600 shadow-sm"
                              : recentlyClonedId === item.id
                              ? "bg-indigo-50/90 border-l-4 border-l-indigo-600 shadow-sm"
                              : isSelected 
                              ? "bg-indigo-50/80 border-l-4 border-l-indigo-600 shadow-2xs" 
                              : idx % 2 === 1 ? "bg-slate-50/30" : ""
                          }`}>
                            
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

                                  <button
                                    type="button"
                                    id={`btn-quick-note-${item.id}`}
                                    data-testid={`btn-quick-note-${item.id}`}
                                    onClick={() => toggleNotepad(item.id)}
                                    className={`p-1 rounded-md cursor-pointer transition-colors relative ${
                                      itemNote
                                        ? "text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300"
                                        : isNotepadOpen
                                        ? "text-amber-900 bg-amber-200 border border-amber-400"
                                        : "text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                                    }`}
                                    title={itemNote ? "Stratejik notu aç / düzenle" : `"${item.keyword}" rakip satırına stratejik not ekle`}
                                    aria-label={`"${item.keyword}" satırına not ekle`}
                                  >
                                    <StickyNote className="w-3 h-3" />
                                    {itemNote && (
                                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                                    )}
                                  </button>
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
                                </div>

                                {/* Strategic Note Preview Strip if exists */}
                                {itemNote && (
                                  <div 
                                    id={`note-preview-badge-${item.id}`}
                                    data-testid={`note-preview-badge-${item.id}`}
                                    onClick={() => toggleNotepad(item.id)}
                                    className="mt-1 flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-amber-50/90 hover:bg-amber-100 border border-amber-300/80 text-amber-950 text-[11px] cursor-pointer transition-colors group shadow-2xs"
                                    title="Stratejik not defterini aç ve düzenle"
                                  >
                                    <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span className="font-bold text-amber-900 shrink-0">Not:</span>
                                    <span className="truncate text-slate-700 group-hover:text-slate-900 max-w-[180px] sm:max-w-[240px]">
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
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 2. Search Volume Column */}
                            <td className="py-3.5 px-3 align-top">
                              <div className="space-y-0.5 font-mono">
                                <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                                  <span className="text-indigo-600">●</span>
                                  <span>{item.monthlyVolume}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans">
                                  SERP Hacmi
                                </div>
                              </div>
                            </td>

                            {/* 3. Your Site Rank (Golden prominent) */}
                            <td className="py-3.5 px-3.5 align-top bg-indigo-50/40 border-x border-indigo-100">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
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
                              </div>
                            </td>

                            {/* 4. Competitor Name (Leading Competitor) Column */}
                            <td className="py-3.5 px-3 align-top">
                              {((item as any).competitorName || topComp) ? (
                                <div className="space-y-0.5">
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
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>

                            {/* 5. Competitor 1 Rank */}
                            <td className="py-3.5 px-3 align-top">
                              <div className="space-y-0.5">
                                <div className="font-mono font-bold text-xs text-slate-800">
                                  {item.comp1Rank ? (
                                    <span className={item.comp1Rank === 1 ? "text-amber-600 font-black" : ""}>
                                      #{item.comp1Rank} {item.comp1Rank === 1 && "👑"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[95px]">
                                  {comp1.name.split(" ")[0]}
                                </div>
                              </div>
                            </td>

                            {/* 6. Competitor 2 Rank */}
                            <td className="py-3.5 px-3 align-top">
                              <div className="space-y-0.5">
                                <div className="font-mono font-bold text-xs text-slate-800">
                                  {item.comp2Rank ? (
                                    <span className={item.comp2Rank === 1 ? "text-amber-600 font-black" : ""}>
                                      #{item.comp2Rank} {item.comp2Rank === 1 && "👑"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[95px]">
                                  {comp2.name.split(" ")[0]}
                                </div>
                              </div>
                            </td>

                            {/* 7. Competitor 3 Rank */}
                            <td className="py-3.5 px-3 align-top">
                              <div className="space-y-0.5">
                                <div className="font-mono font-bold text-xs text-slate-800">
                                  {item.comp3Rank ? (
                                    <span className={item.comp3Rank === 1 ? "text-amber-600 font-black" : ""}>
                                      #{item.comp3Rank} {item.comp3Rank === 1 && "👑"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[95px]">
                                  {comp3.name.split(" ")[0]}
                                </div>
                              </div>
                            </td>

                            {/* 8. Gap Status Column */}
                            <td className="py-3.5 px-3.5 align-top text-center">
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
                              <td colSpan={11} className="p-3 sm:p-4">
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
                              <td colSpan={11} className="p-4 sm:p-5">
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
                    <td colSpan={11} className="py-4 px-4 text-center">
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
          />

          {/* 4. D3.JS BAR CHART SUMMARY OF SELECTED DATA DISTRIBUTION */}
          <SelectedDataDistributionD3Chart
            selectedRankings={selectedRankings}
            allRankings={filteredAndSortedRankings.length > 0 ? filteredAndSortedRankings : effectiveRankings}
            userName={userName}
            competitors={effectiveCompetitors}
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
    </div>
  );
};
