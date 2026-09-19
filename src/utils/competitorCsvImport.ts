import { CompetitorKeywordRanking } from "../types";

export interface CsvColumnMapping {
  keywordCol: number;
  volumeCol: number;
  userRankCol: number;
  comp1RankCol: number;
  comp2RankCol: number;
  comp3RankCol: number;
  difficultyCol: number;
  intentCol: number;
  serpFeaturesCol: number;
  trafficOppCol: number;
  aiRecommendationCol: number;
}

export interface ParsedCsvResult {
  headers: string[];
  rows: string[][];
  delimiter: string;
  totalRows: number;
  mapping: CsvColumnMapping;
  confidenceScore: number;
}

/**
 * Detects whether delimiter is comma, semicolon, or tab
 */
export function detectDelimiter(text: string): string {
  const firstLines = text.split(/\r?\n/).slice(0, 5).join("\n");
  const commaCount = (firstLines.match(/,/g) || []).length;
  const semiCount = (firstLines.match(/;/g) || []).length;
  const tabCount = (firstLines.match(/\t/g) || []).length;

  if (semiCount > commaCount && semiCount > tabCount) return ";";
  if (tabCount > commaCount && tabCount > semiCount) return "\t";
  return ",";
}

/**
 * Parses raw CSV string according to RFC 4180 rules, handling quotes, escapes, and delimiters.
 */
export function parseCsvRaw(csvText: string, customDelimiter?: string): { headers: string[]; rows: string[][]; delimiter: string } {
  // Strip BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, "").trim();
  if (!cleanText) {
    return { headers: [], rows: [], delimiter: "," };
  }

  const delimiter = customDelimiter || detectDelimiter(cleanText);
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentCell += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (!insideQuotes && char === delimiter) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      i++;
      continue;
    }

    if (!insideQuotes && (char === "\r" || char === "\n")) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      i++;
      continue;
    }

    currentCell += char;
    i++;
  }

  // Add final cell & row if any
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [], delimiter };
  }

  const headers = rows[0].map((h) => h.replace(/^["']|["']$/g, "").trim());
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim().length > 0));

  return { headers, rows: dataRows, delimiter };
}

/**
 * Normalizes text for header matching (lowercase, removes accents and special chars)
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Automatically guesses column mapping based on standard Turkish and English SEO header names
 */
export function autoDetectColumnMapping(headers: string[]): CsvColumnMapping {
  const normalized = headers.map(normalizeHeader);

  const findCol = (keywords: string[]): number => {
    for (const kw of keywords) {
      const idx = normalized.findIndex((h) => h.includes(kw));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  // Keyword / Anahtar Kelime
  let keywordCol = findCol(["anahtarkelime", "keyword", "kelime", "query", "sorgu", "terim", "aranankelime"]);
  if (keywordCol === -1 && headers.length > 0) keywordCol = 0;

  // Monthly Volume / Arama Hacmi
  const volumeCol = findCol(["aramahacmi", "monthlyvolume", "volume", "hacim", "aylikhacim", "searchvolume"]);

  // User Rank / Bizim Sıra / Siteniz Sırası
  const userRankCol = findCol([
    "sitenizsirasi",
    "bizimsira",
    "userrank",
    "myrank",
    "bizimsirasi",
    "pozisyon",
    "position",
    "sira",
    "rank"
  ]);

  // Competitor 1 Rank
  const comp1RankCol = findCol(["comp1rank", "rakip1", "competitor1", "dentaclinic", "rakip1sirasi"]);

  // Competitor 2 Rank
  const comp2RankCol = findCol(["comp2rank", "rakip2", "competitor2", "hospitadent", "rakip2sirasi"]);

  // Competitor 3 Rank
  const comp3RankCol = findCol(["comp3rank", "rakip3", "competitor3", "dentgroup", "rakip3sirasi"]);

  // Difficulty / Zorluk
  const difficultyCol = findCol(["zorluk", "difficulty", "kd", "zorlukderecesi", "keyworddifficulty"]);

  // Search Intent / Niyet
  const intentCol = findCol(["armaniyeti", "searchintent", "intent", "niyet"]);

  // SERP Features
  const serpFeaturesCol = findCol(["serpfeatures", "serpozellikleri", "serp", "ozellikler", "snippet"]);

  // Traffic Opportunity
  const trafficOppCol = findCol(["trafficopportunity", "firsat", "trafikfirsati", "ziyaretcifirsati"]);

  // AI Recommendation
  const aiRecommendationCol = findCol(["airecommendation", "oneri", "strateji", "notlar", "aksiyon", "recommendation"]);

  return {
    keywordCol,
    volumeCol,
    userRankCol,
    comp1RankCol,
    comp2RankCol,
    comp3RankCol,
    difficultyCol,
    intentCol,
    serpFeaturesCol,
    trafficOppCol,
    aiRecommendationCol
  };
}

/**
 * Parses numeric rank from raw string cell (e.g. "#1", "2.", "3", "-", ">20" -> null)
 */
export function parseRankValue(raw: string | undefined): number | null {
  if (!raw) return null;
  const clean = raw.toString().trim();
  if (clean === "" || clean === "-" || clean === "—" || clean === ">20" || clean === ">100" || clean.toLowerCase() === "yok") {
    return null;
  }
  const digits = clean.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const num = parseInt(digits, 10);
  if (isNaN(num) || num < 1 || num > 100) return null;
  return num;
}

/**
 * Normalizes monthly volume string (e.g. 12500 -> "12.500", "14,800" -> "14.800")
 */
export function formatMonthlyVolume(raw: string | undefined): string {
  if (!raw) return "1.000";
  const clean = raw.trim();
  if (!clean || clean === "-" || clean === "—") return "1.000";
  
  // If already formatted like "14.800" or "4.2K"
  if (clean.includes("K") || clean.includes("k") || clean.includes("M")) return clean;

  const numOnly = parseInt(clean.replace(/[^0-9]/g, ""), 10);
  if (isNaN(numOnly)) return clean;
  return numOnly.toLocaleString("tr-TR");
}

/**
 * Converts a parsed CSV row into a structured CompetitorKeywordRanking item
 */
export function convertRowToRanking(
  row: string[],
  mapping: CsvColumnMapping,
  index: number
): CompetitorKeywordRanking | null {
  const keyword = mapping.keywordCol !== -1 ? (row[mapping.keywordCol] || "").trim() : "";
  if (!keyword) return null;

  const monthlyVolume = mapping.volumeCol !== -1 ? formatMonthlyVolume(row[mapping.volumeCol]) : "2.400";

  let difficulty = 45;
  if (mapping.difficultyCol !== -1 && row[mapping.difficultyCol]) {
    const parsedDiff = parseInt(row[mapping.difficultyCol].replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsedDiff) && parsedDiff >= 0 && parsedDiff <= 100) {
      difficulty = parsedDiff;
    }
  }

  const userRank = mapping.userRankCol !== -1 ? parseRankValue(row[mapping.userRankCol]) : null;
  const comp1Rank = mapping.comp1RankCol !== -1 ? parseRankValue(row[mapping.comp1RankCol]) : null;
  const comp2Rank = mapping.comp2RankCol !== -1 ? parseRankValue(row[mapping.comp2RankCol]) : null;
  const comp3Rank = mapping.comp3RankCol !== -1 ? parseRankValue(row[mapping.comp3RankCol]) : null;

  // Search intent detection
  let searchIntent: CompetitorKeywordRanking["searchIntent"] = "Ticari";
  if (mapping.intentCol !== -1 && row[mapping.intentCol]) {
    const rawIntent = row[mapping.intentCol].toLowerCase();
    if (rawIntent.includes("bilgi") || rawIntent.includes("info")) {
      searchIntent = "Bilgilendirici";
    } else if (rawIntent.includes("acil") || rawIntent.includes("yerel") || rawIntent.includes("local")) {
      searchIntent = "Acil / Yerel";
    } else if (rawIntent.includes("islem") || rawIntent.includes("transact")) {
      searchIntent = "İşlemsel";
    }
  } else {
    // Heuristic based on keyword text
    const lower = keyword.toLowerCase();
    if (lower.includes("fiyat") || lower.includes("ücret") || lower.includes("ucret") || lower.includes("satın") || lower.includes("randevu")) {
      searchIntent = "İşlemsel";
    } else if (lower.includes("nedir") || lower.includes("nasıl") || lower.includes("nasil") || lower.includes("tedavi")) {
      searchIntent = "Bilgilendirici";
    } else if (lower.includes("nöbetçi") || lower.includes("nobetci") || lower.includes("yakın") || lower.includes("acil")) {
      searchIntent = "Acil / Yerel";
    }
  }

  // SERP Features
  let serpFeatures: string[] = ["Organik Arama"];
  if (mapping.serpFeaturesCol !== -1 && row[mapping.serpFeaturesCol]) {
    const rawFeatures = row[mapping.serpFeaturesCol];
    const splitted = rawFeatures.split(/[,;|]/).map((f) => f.trim()).filter(Boolean);
    if (splitted.length > 0) {
      serpFeatures = splitted;
    }
  } else {
    // Default features
    if (searchIntent === "Acil / Yerel") serpFeatures = ["Local 3-Pack", "Harita"];
    else if (difficulty > 65) serpFeatures = ["Featured Snippet", "Kullanıcılar Bunu da Sordu"];
  }

  // Calculate gap & status
  // User vs best competitor
  const compRanks = [comp1Rank, comp2Rank, comp3Rank].filter((r): r is number => r !== null);
  const bestCompRank = compRanks.length > 0 ? Math.min(...compRanks) : null;

  let gap = 0;
  let status: CompetitorKeywordRanking["status"] = "missing";

  if (userRank === null) {
    status = "missing";
    gap = 99;
  } else if (bestCompRank === null) {
    status = "leading";
    gap = -userRank;
  } else {
    gap = userRank - bestCompRank;
    if (gap < 0) status = "leading";
    else if (gap === 0) status = "competing";
    else status = "trailing";
  }

  // Traffic opportunity estimate
  let trafficOpportunity = "+250 Ziyaretçi / ay";
  if (mapping.trafficOppCol !== -1 && row[mapping.trafficOppCol]) {
    trafficOpportunity = row[mapping.trafficOppCol].trim();
  } else {
    const volNum = parseInt(monthlyVolume.replace(/[^0-9]/g, ""), 10) || 1000;
    if (status === "missing") {
      trafficOpportunity = `+${Math.round(volNum * 0.22).toLocaleString("tr-TR")} Ziyaretçi / ay`;
    } else if (status === "trailing") {
      trafficOpportunity = `+${Math.round(volNum * 0.15).toLocaleString("tr-TR")} Ziyaretçi / ay`;
    } else {
      trafficOpportunity = `+${Math.round(volNum * 0.05).toLocaleString("tr-TR")} Ziyaretçi / ay`;
    }
  }

  // AI Recommendation
  let aiRecommendation = "Bu anahtar kelimede sıralamayı artırmak için sayfa içi başlık ve içerik optimizasyonu yapın.";
  if (mapping.aiRecommendationCol !== -1 && row[mapping.aiRecommendationCol]) {
    aiRecommendation = row[mapping.aiRecommendationCol].trim();
  } else if (status === "missing") {
    aiRecommendation = "Bu sorguda henüz ilk 20'de değilsiniz. Kapsamlı bir rehber içerik oluşturup rakipleri yakalayın.";
  } else if (status === "trailing") {
    aiRecommendation = `En iyi rakip #${bestCompRank} sırada. Teknik SEO ve iç linkleme ile ilk 3'e yükselme potansiyeli yüksek.`;
  } else if (status === "leading") {
    aiRecommendation = "Lider pozisyondasınız. SERP featured snippet pozisyonunu korumak için içeriği güncel tutun.";
  }

  return {
    id: `csv-imp-${Date.now().toString(36)}-${index}-${Math.random().toString(36).substring(2, 6)}`,
    keyword,
    searchIntent,
    monthlyVolume,
    difficulty,
    userRank,
    comp1Rank,
    comp2Rank,
    comp3Rank,
    serpFeatures,
    status,
    gap,
    trafficOpportunity,
    aiRecommendation
  };
}

/**
 * Creates a sample CSV template with UTF-8 BOM ready to download
 */
export function generateSampleCsvTemplate(userName: string, comp1: string, comp2: string, comp3: string): string {
  const headers = [
    "Anahtar Kelime",
    "Arama Hacmi",
    `${userName || "Bizim Site"} Sırası`,
    `${comp1 || "Rakip 1"} Sırası`,
    `${comp2 || "Rakip 2"} Sırası`,
    `${comp3 || "Rakip 3"} Sırası`,
    "Zorluk (0-100)",
    "Arama Niyeti",
    "SERP Özellikleri",
    "Trafik Fırsatı",
    "Stratejik Not"
  ];

  const sampleRows = [
    [
      "implant diş fiyatları 2026",
      "18.400",
      "2",
      "1",
      "4",
      "7",
      "76",
      "Ticari",
      "Local 3-Pack; Fiyat Tablosu",
      "+1.420 Ziyaretçi / ay",
      "Fiyat şeffaflığı ve hasta yorumlarıyla #1 sırayı geri kazanın."
    ],
    [
      "zirkonyum kaplama yorumları",
      "9.600",
      "1",
      "3",
      "5",
      "8",
      "58",
      "Bilgilendirici",
      "Featured Snippet; Yıldızlı Yorum",
      "+380 Ziyaretçi / ay",
      "Mevcut #1 sırayı korumak için SSS şemasını güncelleyin."
    ],
    [
      "nöbetçi diş hekimi kadıköy",
      "6.200",
      "3",
      "2",
      "1",
      "6",
      "62",
      "Acil / Yerel",
      "Local 3-Pack; Harita",
      "+850 Ziyaretçi / ay",
      "Google Haritalar profili çalışma saatlerini acil olarak vurgulayın."
    ],
    [
      "şeffaf plak telsiz ortodonti",
      "7.800",
      "—",
      "2",
      "3",
      "4",
      "69",
      "Ticari",
      "Görsel Paketi; SSS",
      "+1.150 Ziyaretçi / ay",
      "Bu kelimede sıralamada yoksunuz. Kapsamlı bir tedavi rehberi yayınlayın."
    ],
    [
      "diş beyazlatma acıtır mı",
      "4.500",
      "4",
      "5",
      "2",
      "9",
      "41",
      "Bilgilendirici",
      "Featured Snippet",
      "+460 Ziyaretçi / ay",
      "Hızlı bir video ve hekim açıklaması ile rakip 2'nin önüne geçin."
    ]
  ];

  const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = sampleRows.map((row) => row.map(escapeCell).join(","));

  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}
