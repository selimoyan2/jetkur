import * as XLSX from "xlsx";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../types";
import { KeywordGoalItem, calculateGoalProgress } from "../components/dashboard/GoalTrackingModule";
import { CSV_COLUMN_OPTIONS, SerializeRankingTableOptions } from "../components/dashboard/CompetitiveKeywordRankingTable";

/**
 * Calculates responsive column widths for an Excel worksheet
 */
function calculateColWidths(rows: (string | number)[][]): { wch: number }[] {
  if (rows.length === 0) return [];
  const colCount = rows[0].length;
  const widths: number[] = new Array(colCount).fill(12);

  rows.forEach((row) => {
    row.forEach((cell, colIdx) => {
      const cellLen = cell !== undefined && cell !== null ? String(cell).length : 0;
      if (cellLen > widths[colIdx]) {
        widths[colIdx] = Math.min(Math.max(cellLen + 3, 12), 65);
      }
    });
  });

  return widths.map((w) => ({ wch: w }));
}

/**
 * Extracts structured headers and 2D row data from competitor keyword rankings.
 */
export function extractRankingTableExcelData(
  rankings: CompetitorKeywordRanking[],
  options: SerializeRankingTableOptions = {}
): { headers: string[]; rows: (string | number)[][] } {
  const {
    userName = "Siteniz",
    comp1Name = "1. Rakip",
    comp2Name = "2. Rakip",
    comp3Name = "3. Rakip",
    competitors = [],
    selectedColumnIds,
    goals = {}
  } = options;

  const comp1 = competitors[0] || {
    name: comp1Name,
    domain: "rakip1.com",
    visibilityScore: 92,
    topKeywordReach: 320,
    indexedPages: 84,
    speedScore: 78,
    schemaScore: 88,
    keyStrengths: ["1500+ kelimelik rehberler"]
  };

  const comp2 = competitors[1] || {
    name: comp2Name,
    domain: "rakip2.com",
    visibilityScore: 84
  };

  const comp3 = competitors[2] || {
    name: comp3Name,
    domain: "rakip3.com",
    visibilityScore: 76
  };

  // Filter active columns based on user selection or defaults
  const activeColumns = CSV_COLUMN_OPTIONS.filter((col) => {
    if (!selectedColumnIds || selectedColumnIds.length === 0) {
      return col.defaultEnabled;
    }
    return selectedColumnIds.includes(col.id);
  });

  const headers = activeColumns.map((col) => {
    switch (col.id) {
      case "keyword":
        return "Anahtar Kelime (Keyword)";
      case "searchIntent":
        return "Arama Niyeti (Search Intent)";
      case "monthlyVolume":
        return "Aylık Hacim";
      case "difficulty":
        return "SEO Zorluğu (0-100)";
      case "userRank":
        return `Siteniz (${userName}) SERP Sırası`;
      case "comp1Rank":
        return `1. Rakip (${comp1.name || comp1Name}) Sırası`;
      case "comp2Rank":
        return `2. Rakip (${comp2.name || comp2Name}) Sırası`;
      case "comp3Rank":
        return `3. Rakip (${comp3.name || comp3Name}) Sırası`;
      case "gap":
        return "Sıralama Farkı (Gap)";
      case "status":
        return "Durum (Status)";
      case "competitorName":
        return `Lider Rakip (${comp1.name || comp1Name})`;
      case "domainAuthority":
        return `Domain Otoritesi (${comp1.name || comp1Name})`;
      case "keywordCount":
        return `Hedef Kelime Sayısı (${comp1.name || comp1Name})`;
      case "competitorStrengths":
        return `Rakip Teknik Sinyalleri (${comp1.name || comp1Name})`;
      case "trafficOpportunity":
        return "Trafik Potansiyeli";
      case "serpFeatures":
        return "SERP Özellikleri";
      case "aiRecommendation":
        return "Gemini AI Stratejik Tavsiye";
      case "targetRank":
        return "Hedeflenen Sıralama";
      case "goalAttainment":
        return "Hedef Başarım Oranı (%)";
      case "goalDeviation":
        return "Hedef Sapması (%)";
      default:
        return col.label;
    }
  });

  const rows = rankings.map((r) => {
    const userRankDisplay =
      r.userRank !== null && r.userRank !== undefined ? `#${r.userRank}` : "İlk 20'de Yok";
    const comp1RankDisplay =
      r.comp1Rank !== null && r.comp1Rank !== undefined ? `#${r.comp1Rank}` : "-";
    const comp2RankDisplay =
      r.comp2Rank !== null && r.comp2Rank !== undefined ? `#${r.comp2Rank}` : "-";
    const comp3RankDisplay =
      r.comp3Rank !== null && r.comp3Rank !== undefined ? `#${r.comp3Rank}` : "-";

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
          const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter(
            (n): n is number => n !== null && n !== undefined
          );
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const tr = goals[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
          return `#${tr}`;
        }
        case "goalAttainment": {
          const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter(
            (n): n is number => n !== null && n !== undefined
          );
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const tr = goals[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
          const p = calculateGoalProgress(r.userRank, tr, bestComp);
          return `%${p.attainmentPercent}`;
        }
        case "goalDeviation": {
          const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter(
            (n): n is number => n !== null && n !== undefined
          );
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const tr = goals[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
          const p = calculateGoalProgress(r.userRank, tr, bestComp);
          return p.deviationPercent >= 0 ? `+${p.deviationPercent}%` : `${p.deviationPercent}%`;
        }
        default:
          return "";
      }
    });
  });

  return { headers, rows };
}

/**
 * Creates a rich multi-sheet Excel workbook from competitor rankings data.
 */
export function generateRankingTableExcelWorkbook(
  rankings: CompetitorKeywordRanking[],
  options: SerializeRankingTableOptions = {}
): XLSX.WorkBook {
  const { headers, rows } = extractRankingTableExcelData(rankings, options);
  const wb = XLSX.utils.book_new();

  // 1. DATA SHEET: SEO Sıralama Tablosu
  const sheetData = [headers, ...rows];
  const wsData = XLSX.utils.aoa_to_sheet(sheetData);
  wsData["!cols"] = calculateColWidths(sheetData);
  XLSX.utils.book_append_sheet(wb, wsData, "SEO Sıralama Tablosu");

  // 2. SUMMARY SHEET: Yönetici Özeti & KPI'lar
  const totalKeywords = rankings.length;
  const userRank1Count = rankings.filter((r) => r.userRank === 1).length;
  const userTop3Count = rankings.filter((r) => r.userRank !== null && r.userRank !== undefined && r.userRank <= 3).length;
  const userTop10Count = rankings.filter((r) => r.userRank !== null && r.userRank !== undefined && r.userRank <= 10).length;
  const unrankedCount = rankings.filter((r) => r.userRank === null || r.userRank === undefined).length;
  const dateStamp = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const comp1 = options.competitors?.[0] || { name: options.comp1Name || "1. Rakip", domain: "rakip1.com", visibilityScore: 92 };
  const comp2 = options.competitors?.[1] || { name: options.comp2Name || "2. Rakip", domain: "rakip2.com", visibilityScore: 84 };
  const comp3 = options.competitors?.[2] || { name: options.comp3Name || "3. Rakip", domain: "rakip3.com", visibilityScore: 76 };

  const summarySheetData: (string | number)[][] = [
    ["SEO RAKİP KIYASLAMA VE PERFORMANS YÖNETİCİ ÖZETİ"],
    ["Rapor Tarihi", dateStamp],
    ["Analiz Edilen Firma / Site", options.userName || "Siteniz"],
    [""],
    ["TEMEL SIRALAMA & PERFORMANS METRİKLERİ", "DEĞER", "AÇIKLAMA"],
    ["Toplam Takip Edilen Anahtar Kelime", totalKeywords, "Kıyaslanan kelime havuzu"],
    ["#1 SERP Liderliği", userRank1Count, "Google ilk sırada yer alan kelimeler"],
    ["İlk 3 Pozisyon (En Yüksek CTR)", userTop3Count, `Kelime havuzunun %${totalKeywords > 0 ? Math.round((userTop3Count / totalKeywords) * 100) : 0}'i`],
    ["İlk 10 Pozisyon (Sayfa 1)", userTop10Count, `Sayfa 1 görünürlük oranı: %${totalKeywords > 0 ? Math.round((userTop10Count / totalKeywords) * 100) : 0}`],
    ["İlk 20 Dışında / Sıralamasız", unrankedCount, "Optimizasyon potansiyeli yüksek hedef kelimeler"],
    [""],
    ["KIYASLANAN RAKİP PROFİLLERİ", "DOMAİN", "GÖRÜNÜRLÜK PUANI (0-100)"],
    [`1. Rakip: ${comp1.name}`, (comp1 as any).domain || "-", `${comp1.visibilityScore || 92}/100`],
    [`2. Rakip: ${comp2.name}`, (comp2 as any).domain || "-", `${comp2.visibilityScore || 84}/100`],
    [`3. Rakip: ${comp3.name}`, (comp3 as any).domain || "-", `${comp3.visibilityScore || 76}/100`],
    [""],
    ["Rapor Üretici", "Google AI Studio SEO Rakip Analiz Modülü"],
    ["Format", "Microsoft Excel Açık XML (.xlsx)"]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  wsSummary["!cols"] = [
    { wch: 38 },
    { wch: 28 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Yönetici Özeti");

  return wb;
}

/**
 * Directly exports and triggers file download for Excel (.xlsx) format.
 * Returns the generated filename.
 */
export function exportRankingTableToExcel(
  rankings: CompetitorKeywordRanking[],
  options: SerializeRankingTableOptions = {},
  customFilename?: string
): string {
  const wb = generateRankingTableExcelWorkbook(rankings, options);

  const cleanName = (options.userName || "Firma")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `SEO-Rakip-Kiyaslama-${cleanName || "tablo"}-${dateStamp}.xlsx`;

  XLSX.writeFile(wb, filename);
  return filename;
}
