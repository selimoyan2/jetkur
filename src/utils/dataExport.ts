import * as XLSX from "xlsx";
import { ProductItem, FormLead, NewsletterSubscriber, SiteConfig } from "../types";
import { slugify } from "./url";

/**
 * Strips HTML tags from rich text strings for clean tabular export
 */
export function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Escapes a cell value according to RFC 4180 rules for CSV.
 */
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Calculates responsive column widths for an Excel worksheet
 */
function calculateColWidths(rows: (string | number)[][]): { wch: number }[] {
  if (rows.length === 0) return [];
  const colCount = rows[0].length;
  const widths: number[] = new Array(colCount).fill(10);

  rows.forEach(row => {
    row.forEach((cell, colIdx) => {
      const cellLen = cell !== undefined && cell !== null ? String(cell).length : 0;
      if (cellLen > widths[colIdx]) {
        widths[colIdx] = Math.min(Math.max(cellLen + 3, 10), 60);
      }
    });
  });

  return widths.map(w => ({ wch: w }));
}

/**
 * Translate lead status to human-readable Turkish label
 */
export function getLeadStatusLabel(status: FormLead["status"]): string {
  switch (status) {
    case "new":
      return "Yeni Talep";
    case "contacted":
      return "İletişime Geçildi";
    case "offered":
      return "Teklif Verildi";
    case "closed":
      return "Satış Tamamlandı (Kapandı)";
    default:
      return status;
  }
}

// ==========================================
// 1. PRODUCT CATALOG EXPORTS (CSV & EXCEL)
// ==========================================

export interface ProductExportRow {
  "Ürün Kodu (ID)": string;
  "Ürün / Hizmet Başlığı": string;
  "Kategori": string;
  "Satış Fiyatı": string;
  "Eski Fiyat (İndirimsiz)": string;
  "Stok Durumu": string;
  "Rozet / Kampanya": string;
  "Kısa Özet": string;
  "Detaylı Açıklama": string;
  "SEO URL (Slug)": string;
  "SEO Başlığı": string;
  "SEO Açıklaması": string;
  "Görsel Sayısı": number;
  "Ana Görsel Linki": string;
}

export function formatProductsForExport(products: ProductItem[]): (string | number)[][] {
  const headers = [
    "Ürün Kodu (ID)",
    "Ürün / Hizmet Adı",
    "Kategori",
    "Fiyat",
    "Eski Fiyat",
    "Stok Durumu",
    "Rozet / Kampanya",
    "Kısa Özet",
    "Detaylı Açıklama",
    "SEO URL (Slug)",
    "SEO Başlığı",
    "SEO Açıklaması",
    "Görsel Sayısı",
    "Ana Görsel Linki"
  ];

  const rows = (products || []).map(p => [
    p.id || "",
    p.title || "",
    p.category || "Genel",
    p.price || "",
    p.oldPrice || "",
    p.inStock ? "Stokta Var" : "Tükendi",
    p.badge || "",
    p.shortDescription || "",
    stripHtml(p.description),
    p.slug ? `/urun-${p.slug}.html` : "",
    p.seoTitle || p.title || "",
    p.seoDescription || p.shortDescription || "",
    p.images ? p.images.length : (p.image ? 1 : 0),
    p.featuredImage || p.image || (p.images && p.images[0]) || ""
  ]);

  return [headers, ...rows];
}

/**
 * Exports Product Catalog to Excel (.xlsx)
 */
export function exportProductsToExcel(products: ProductItem[], companyName?: string): void {
  const data = formatProductsForExport(products);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!cols"] = calculateColWidths(data);
  XLSX.utils.book_append_sheet(wb, ws, "Ürün Kataloğu");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const prefix = companyName ? slugify(companyName) : "katalog";
  const filename = `${prefix}-urun-katalogu-${dateStamp}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Exports Product Catalog to RFC 4180 CSV with UTF-8 BOM
 */
export function exportProductsToCsv(products: ProductItem[], companyName?: string): void {
  const data = formatProductsForExport(products);
  const csvRows = data.map(row => row.map(escapeCsv).join(","));
  const csvContent = "\uFEFF" + csvRows.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const prefix = companyName ? slugify(companyName) : "katalog";
  link.setAttribute("href", url);
  link.setAttribute("download", `${prefix}-urun-katalogu-${dateStamp}.csv`);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// 2. LEADS DATABASE EXPORTS (CSV & EXCEL)
// ==========================================

export function formatLeadsForExport(leads: FormLead[]): (string | number)[][] {
  const headers = [
    "Talep No (ID)",
    "Tarih / Zaman",
    "Müşteri Ad Soyad",
    "Telefon Numarası",
    "E-Posta Adresi",
    "İlgilenilen Hizmet / Ürün",
    "Müşteri Mesajı",
    "Kaynak Sayfa",
    "Durum",
    "A/B Hero Varyantı",
    "Anlaşma Tutarı (TL)",
    "Tamamlanma / Kapanış Tarihi",
    "Özel Alanlar (KVKK / Form Detayı)",
    "Etiketler (CRM Tags)",
    "Dahili Özel Notlar (Private Notes)"
  ];

  const rows = (leads || []).map(l => {
    const customFieldsSummary = l.customFields
      ? Object.entries(l.customFields)
          .map(([k, v]) => `${k}: ${v === true ? "Evet" : v === false ? "Hayır" : v}`)
          .join(" | ")
      : "";

    return [
      l.id || "",
      l.date || "",
      l.name || "",
      l.phone || "",
      l.email || "",
      l.serviceOrProduct || "",
      l.message || "",
      l.sourcePage || "İletişim Formu",
      getLeadStatusLabel(l.status),
      l.heroVariant ? `Varyant ${l.heroVariant}` : "Standart",
      l.dealValue !== undefined ? Number(l.dealValue) : "",
      l.completedAt || "",
      customFieldsSummary,
      (l.tags || []).join(", "),
      l.privateNotes || l.dealNotes || ""
    ];
  });

  return [headers, ...rows];
}

/**
 * Exports Leads Database to Excel (.xlsx)
 */
export function exportLeadsToExcel(leads: FormLead[], companyName?: string, fileNameSuffix?: string): void {
  const data = formatLeadsForExport(leads);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!cols"] = calculateColWidths(data);
  XLSX.utils.book_append_sheet(wb, ws, "Müşteri Talepleri (CRM)");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const prefix = companyName ? slugify(companyName) : "crm";
  const suffix = fileNameSuffix ? `-${slugify(fileNameSuffix)}` : "";
  const filename = `${prefix}-musteri-talepleri${suffix}-${dateStamp}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Exports Leads Database to RFC 4180 CSV with UTF-8 BOM
 */
export function exportLeadsToCsv(leads: FormLead[], companyName?: string, fileNameSuffix?: string): void {
  const data = formatLeadsForExport(leads);
  const csvRows = data.map(row => row.map(escapeCsv).join(","));
  const csvContent = "\uFEFF" + csvRows.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const prefix = companyName ? slugify(companyName) : "crm";
  const suffix = fileNameSuffix ? `-${slugify(fileNameSuffix)}` : "";
  link.setAttribute("href", url);
  link.setAttribute("download", `${prefix}-musteri-talepleri${suffix}-${dateStamp}.csv`);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Leads Database to cleanly formatted JSON
 */
export function exportLeadsToJson(leads: FormLead[], companyName?: string, fileNameSuffix?: string): void {
  const jsonContent = JSON.stringify(leads, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const prefix = companyName ? slugify(companyName) : "crm";
  const suffix = fileNameSuffix ? `-${slugify(fileNameSuffix)}` : "";
  link.setAttribute("href", url);
  link.setAttribute("download", `${prefix}-musteri-talepleri${suffix}-${dateStamp}.json`);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==============================================================
// 3. COMPREHENSIVE MULTI-SHEET EXCEL REPORT (CATALOG + LEADS + STATS)
// ==============================================================

/**
 * Generates an all-in-one comprehensive Excel report with separate worksheets:
 * 1. Genel Özet & KPI'lar (Company overview, conversion metrics, revenue)
 * 2. Ürün & Hizmet Kataloğu (All products with prices, stock, SEO)
 * 3. Müşteri Talepleri & CRM (All leads with status, deal value, variant)
 * 4. E-Bülten Aboneleri (Newsletter subscribers)
 * 5. A/B Test Performans Raporu (Hero variation metrics)
 */
export function exportComprehensiveReport(config: SiteConfig): void {
  const wb = XLSX.utils.book_new();
  const leads = config.leads || [];
  const products = config.products?.items || [];
  const subscribers = config.subscribers || [];
  const ab = config.abTesting;

  // -------------------------------------------------------------
  // Sheet 1: Executive KPI Summary
  // -------------------------------------------------------------
  const totalDeals = leads.filter(l => l.status === "closed").length;
  const totalRevenue = leads
    .filter(l => l.status === "closed" && l.dealValue)
    .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

  const summaryData: (string | number)[][] = [
    ["HIZLI WEB - KURUMSAL FAALİYET VE PERFORMANS RAPORU"],
    [`Oluşturulma Tarihi: ${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR")}`],
    [],
    ["Firma & Web Sitesi Bilgileri", ""],
    ["Firma Adı", config.companyName || "Belirtilmemiş"],
    ["Sektör", config.sector || "Genel"],
    ["Şehir / Lokasyon", config.city || "Türkiye"],
    ["Telefon", config.phone || ""],
    ["E-Posta", config.email || ""],
    ["WhatsApp", config.whatsapp || ""],
    [],
    ["Temel Metrikler & Performans Göstergeleri (KPI)", ""],
    ["Katalogdaki Toplam Ürün / Hizmet Sayısı", products.length],
    ["Toplam Gelen Müşteri Talebi (Form)", leads.length],
    ["Kapanan / Başarılı Satış Sayısı", totalDeals],
    ["Toplam Tahakkuk Eden Gelir (₺)", `${totalRevenue.toLocaleString("tr-TR")} ₺`],
    ["E-Bülten Abone Sayısı", subscribers.length],
    [],
    ["Lead Durum Dağılımı", "Adet"],
    ["Yeni Talepler (İncelenmeyi Bekleyen)", leads.filter(l => l.status === "new").length],
    ["İletişime Geçilenler", leads.filter(l => l.status === "contacted").length],
    ["Teklif Verilenler", leads.filter(l => l.status === "offered").length],
    ["Kapanan / Satışı Tamamlananlar", totalDeals]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 38 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Genel Özet & KPI");

  // -------------------------------------------------------------
  // Sheet 2: Ürün Kataloğu
  // -------------------------------------------------------------
  const productData = formatProductsForExport(products);
  const wsProducts = XLSX.utils.aoa_to_sheet(productData);
  wsProducts["!cols"] = calculateColWidths(productData);
  XLSX.utils.book_append_sheet(wb, wsProducts, "Ürün Kataloğu");

  // -------------------------------------------------------------
  // Sheet 3: Müşteri Talepleri (CRM)
  // -------------------------------------------------------------
  const leadsData = formatLeadsForExport(leads);
  const wsLeads = XLSX.utils.aoa_to_sheet(leadsData);
  wsLeads["!cols"] = calculateColWidths(leadsData);
  XLSX.utils.book_append_sheet(wb, wsLeads, "Müşteri Talepleri (CRM)");

  // -------------------------------------------------------------
  // Sheet 4: E-Bülten Aboneleri
  // -------------------------------------------------------------
  if (subscribers.length > 0) {
    const subHeaders = [
      "Abone ID",
      "Kayıt Tarihi",
      "E-Posta Adresi",
      "İsim / Ad Soyad",
      "Durum",
      "Kayıt Kaynağı",
      "Etiketler"
    ];
    const subRows = subscribers.map(s => [
      s.id || "",
      s.subscribedAt || "",
      s.email || "",
      s.name || "",
      s.status === "active" ? "Aktif" : "Abonelikten Çıktı",
      s.source || "Web Sitesi",
      (s.tags || []).join(", ")
    ]);
    const wsSub = XLSX.utils.aoa_to_sheet([subHeaders, ...subRows]);
    wsSub["!cols"] = calculateColWidths([subHeaders, ...subRows]);
    XLSX.utils.book_append_sheet(wb, wsSub, "E-Bülten Aboneleri");
  }

  // -------------------------------------------------------------
  // Sheet 5: A/B Test Raporu (Eğer varsa)
  // -------------------------------------------------------------
  if (ab && ab.variationA && ab.variationB) {
    const viewsA = ab.stats?.variantA?.views ?? ab.variationA.views ?? 0;
    const leadsA = ab.stats?.variantA?.leads ?? ab.variationA.leads ?? 0;
    const crA = viewsA > 0 ? ((leadsA / viewsA) * 100).toFixed(2) + "%" : "%0.00";

    const viewsB = ab.stats?.variantB?.views ?? ab.variationB.views ?? 0;
    const leadsB = ab.stats?.variantB?.leads ?? ab.variationB.leads ?? 0;
    const crB = viewsB > 0 ? ((leadsB / viewsB) * 100).toFixed(2) + "%" : "%0.00";

    const abData: (string | number)[][] = [
      ["A/B TESTİ DÖNÜŞÜM VE PERFORMANS RAPORU"],
      [`Test Adı: ${ab.testName || "Hero Başlık Testi"}`],
      [`Test Durumu: ${ab.status === "active" ? "Aktif Olarak Yayında" : ab.status === "completed" ? "Tamamlandı" : "Durduruldu"}`],
      [`Trafik Dağılımı: %${ab.trafficSplit} (Varyant A) / %${100 - ab.trafficSplit} (Varyant B)`],
      [],
      ["Metrik", "Varyasyon A (Kontrol)", "Varyasyon B (Challenger)"],
      ["Rozet / Badge", ab.variationA.badge || "", ab.variationB.badge || ""],
      ["H1 Başlık", ab.variationA.title || "", ab.variationB.title || ""],
      ["Alt Başlık", ab.variationA.subtitle || "", ab.variationB.subtitle || ""],
      ["Birincil CTA", ab.variationA.ctaPrimaryText || "", ab.variationB.ctaPrimaryText || ""],
      ["Gösterim Sayısı (Views)", viewsA, viewsB],
      ["Gelen Form Talebi (Leads)", leadsA, leadsB],
      ["Dönüşüm Oranı (CR%)", crA, crB]
    ];

    const wsAb = XLSX.utils.aoa_to_sheet(abData);
    wsAb["!cols"] = [{ wch: 30 }, { wch: 35 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsAb, "A-B Test Raporu");
  }

  const dateStamp = new Date().toISOString().slice(0, 10);
  const prefix = config.companyName ? slugify(config.companyName) : "rapor";
  const filename = `${prefix}-kapsamli-faaliyet-raporu-${dateStamp}.xlsx`;

  XLSX.writeFile(wb, filename);
}
