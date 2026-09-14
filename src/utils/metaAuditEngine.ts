import { SiteConfig, IndividualPageSeoMeta } from "../types";
import { getAllPagesSeoMeta, updatePageSeoMeta } from "./pageSeoRegistry";

export type MetaFieldType = 
  | "title" 
  | "description" 
  | "canonical" 
  | "ogImage" 
  | "ogTitle" 
  | "ogDescription" 
  | "keywords" 
  | "robots";

export type MetaAuditStatus = "missing" | "too_short" | "ideal" | "over_length";

export interface MetaFieldAuditResult {
  fieldType: MetaFieldType;
  fieldName: string;
  value: string;
  charCount: number;
  minRecommended: number;
  maxRecommended: number;
  status: MetaAuditStatus;
  statusLabel: string;
  statusColor: string;     // Tailwind text color
  badgeBg: string;         // Tailwind bg color
  badgeBorder: string;     // Tailwind border color
  progressPercent: number; // 0 to 100+
  pixelWidthEst: number;   // Estimated pixel width for SERP
  maxPixelWidth: number;
  overflowChars: number;   // Characters exceeding maxRecommended
  validPart: string;       // Characters up to maxRecommended
  overflowPart: string;    // Exceeding characters (to highlight in red)
  issues: string[];
  suggestions: string[];
  autoFixedValue: string;  // Recommended smart-trimmed or generated replacement
}

export interface AuditedPageMetaResult {
  pageId: string;
  pageTitle: string;
  pageType: string;
  slug: string;
  fullUrl: string;
  rawMeta: IndividualPageSeoMeta;
  titleAudit: MetaFieldAuditResult;
  descAudit: MetaFieldAuditResult;
  canonicalAudit: MetaFieldAuditResult;
  ogImageAudit: MetaFieldAuditResult;
  ogTitleAudit: MetaFieldAuditResult;
  ogDescAudit: MetaFieldAuditResult;
  keywordsAudit: MetaFieldAuditResult;
  robotsAudit: MetaFieldAuditResult;
  overallScore: number; // 0 to 100
  status: MetaAuditStatus;
  hasMissing: boolean;
  hasOverLength: boolean;
  hasTooShort: boolean;
  allIssues: Array<{ field: string; message: string; severity: "critical" | "warning" | "info" }>;
}

export interface SiteMetaAuditSummary {
  totalPages: number;
  totalChecks: number;
  passedChecks: number;
  criticalMissingCount: number;
  overLengthCount: number;
  tooShortCount: number;
  idealCount: number;
  siteHealthScore: number; // 0 - 100
  pages: AuditedPageMetaResult[];
}

/**
 * Trims text gracefully at the nearest word boundary without breaking words
 */
export function smartTrimText(text: string, maxLength: number): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  // Find last space before or at maxLength
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    return cut.slice(0, lastSpace).replace(/[,.:; -]+$/, "");
  }
  return cut.replace(/[,.:; -]+$/, "");
}

/**
 * Estimate approximate pixel width of title text in Google SERP (Arial ~20px)
 */
export function estimateTitlePixelWidth(text: string): number {
  if (!text) return 0;
  // Approximate average character width in Arial 20px is ~9.5px, but wide letters are larger
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[ijlI1.,'|:;!]/.test(char)) width += 4.5;
    else if (/[mwMW@%&]/.test(char)) width += 14;
    else if (/[A-Z]/.test(char)) width += 11.5;
    else if (/[a-z0-9]/.test(char)) width += 8.8;
    else width += 5; // space & symbols
  }
  return Math.round(width);
}

/**
 * Generates an SEO Title strictly within the 48-58 character safe range
 */
export function generateOptimalTitle(
  pageTitle: string,
  company: string,
  city: string,
  sector: string
): string {
  const cleanTitle = pageTitle.replace(/^(Hizmet|Ürün|Blog|Sayfa):\s*/i, "").trim();
  const base = `${cleanTitle} | ${city} ${company}`;
  if (base.length >= 45 && base.length <= 58) return base;

  if (base.length > 58) {
    const shortComp = company.length > 15 ? `${company.slice(0, 14)}.` : company;
    const candidate = `${cleanTitle} | ${city} ${shortComp}`;
    if (candidate.length <= 58) return candidate;
    return smartTrimText(candidate, 58);
  }

  // If too short, append sector or trust keyword
  const extended = `${cleanTitle} - ${city} ${sector} | ${company}`;
  if (extended.length <= 58) return extended;
  return smartTrimText(extended, 58);
}

/**
 * Generates an SEO Description strictly within 130-155 characters
 */
export function generateOptimalDescription(
  pageTitle: string,
  company: string,
  city: string,
  sector: string,
  phone?: string
): string {
  const cleanTitle = pageTitle.replace(/^(Hizmet|Ürün|Blog|Sayfa):\s*/i, "").trim();
  const phoneText = phone ? ` Tel: ${phone}` : " Hemen arayın!";
  const template = `${city} bölgesinde ${cleanTitle.toLowerCase()} hizmeti. ${company} kalitesiyle hızlı servis, şeffaf fiyatlar ve uzman destek.${phoneText}`;

  if (template.length >= 120 && template.length <= 155) return template;
  if (template.length > 155) {
    return smartTrimText(template, 155);
  }
  // If slightly short, pad with professional guarantee
  const padded = `${city} bölgesinde profesyonel ${cleanTitle.toLowerCase()} hizmeti. ${company} güvencesiyle 15 dakikada hızlı servis, garantili çözümler ve uygun fiyatlar.${phoneText}`;
  return smartTrimText(padded, 155);
}

/**
 * Real-time auditing of an individual meta field
 */
export function auditMetaField(
  fieldType: MetaFieldType,
  value: string | undefined | null,
  context?: {
    pageTitle?: string;
    companyName?: string;
    city?: string;
    sector?: string;
    phone?: string;
    fullUrl?: string;
  }
): MetaFieldAuditResult {
  const val = (value || "").trim();
  const len = val.length;
  const issues: string[] = [];
  const suggestions: string[] = [];

  const company = context?.companyName || "İşletme";
  const city = context?.city || "İstanbul";
  const sector = context?.sector || "Hizmet";
  const pageTitle = context?.pageTitle || "Sayfa";

  switch (fieldType) {
    case "title": {
      const minRecommended = 45;
      const maxRecommended = 60;
      const maxPixelWidth = 580;
      const pixelWidthEst = estimateTitlePixelWidth(val);
      let status: MetaAuditStatus = "ideal";
      let statusLabel = "İdeal Uzunluk (SERP Dostu)";
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (len === 0) {
        status = "missing";
        statusLabel = "Eksik (Başlık Yok!)";
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push("Meta başlığı (Title) tamamen boş! Google dizininde sayfanız başlıksız veya bozuk snippet olarak görünecektir.");
        suggestions.push("Sayfanız için hemen anahtar kelime ve şehir odaklı bir başlık girin.");
      } else if (len < 30) {
        status = "too_short";
        statusLabel = `Çok Kısa (${len} krkt - En az 45 olmalı)`;
        statusColor = "text-amber-600";
        badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
        badgeBorder = "border-amber-300";
        issues.push(`Başlık çok kısa (${len} karakter). İdeal aralık 45-60 karakterdir.`);
        suggestions.push("Başlığa lokasyon (şehir/ilçe) ve firma adınızı ekleyerek arama görünürlüğünü artırın.");
      } else if (len < minRecommended) {
        status = "too_short";
        statusLabel = `Biraz Kısa (${len} krkt - İdeal: 45-60)`;
        statusColor = "text-amber-600";
        badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
        badgeBorder = "border-amber-300";
        issues.push(`Başlık biraz kısa (${len} karakter). 45-60 karakter aralığı arama tıklanma oranını (CTR) maksimize eder.`);
      } else if (len > maxRecommended) {
        status = "over_length";
        const over = len - maxRecommended;
        statusLabel = `Önerilen Uzunluğu Aşıyor (+${over} krkt taşma)`;
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push(`Başlık ${len} karakter ile önerilen 60 karakter limitini ${over} karakter aşıyor! Google sonuçlarında son kısım '...' ile kesilecektir.`);
        suggestions.push(`Başlığı ${maxRecommended} karakteri geçmeyecek şekilde kısaltın veya akıllı kırpma aracını kullanın.`);
      }

      if (pixelWidthEst > maxPixelWidth && status !== "over_length") {
        issues.push(`Tahmini piksel genişliği (~${pixelWidthEst}px) Google sınırı olan 580px'i aşıyor olabilir.`);
      }

      const overflowChars = Math.max(0, len - maxRecommended);
      const validPart = val.slice(0, maxRecommended);
      const overflowPart = val.slice(maxRecommended);
      const autoFixedValue = generateOptimalTitle(pageTitle, company, city, sector);

      return {
        fieldType: "title",
        fieldName: "Meta Başlık (Title)",
        value: val,
        charCount: len,
        minRecommended,
        maxRecommended,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: Math.min(130, Math.round((len / maxRecommended) * 100)),
        pixelWidthEst,
        maxPixelWidth,
        overflowChars,
        validPart,
        overflowPart,
        issues,
        suggestions,
        autoFixedValue
      };
    }

    case "description": {
      const minRecommended = 120;
      const maxRecommended = 155;
      const maxPixelWidth = 960;
      const pixelWidthEst = Math.round(len * 6.2);
      let status: MetaAuditStatus = "ideal";
      let statusLabel = "İdeal Uzunluk (Tam Snippet)";
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (len === 0) {
        status = "missing";
        statusLabel = "Eksik (Açıklama Yok!)";
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push("Meta açıklaması (Description) eksik! Google sayfanızdaki rastgele menü veya alt bilgileri arama snippet'ı olarak çekecektir.");
        suggestions.push("Sayfanın amacını ve iletişim çağrısını özetleyen 130-155 karakterlik bir açıklama girin.");
      } else if (len < 80) {
        status = "too_short";
        statusLabel = `Çok Kısa (${len} krkt - En az 120 olmalı)`;
        statusColor = "text-amber-600";
        badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
        badgeBorder = "border-amber-300";
        issues.push(`Açıklama çok kısa (${len} karakter). Kullanıcıları sitenize tıklamaya ikna etmek için 120-155 karakter gereklidir.`);
        suggestions.push("Hizmet kapsamınızı, acil servis avantajınızı ve telefon/iletişim çağrınızı ekleyin.");
      } else if (len < minRecommended) {
        status = "too_short";
        statusLabel = `Biraz Kısa (${len} krkt - İdeal: 120-155)`;
        statusColor = "text-amber-600";
        badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
        badgeBorder = "border-amber-300";
        issues.push(`Açıklama (${len} karakter) ideal 120-155 aralığının biraz altında kalıyor.`);
      } else if (len > maxRecommended) {
        status = "over_length";
        const over = len - maxRecommended;
        statusLabel = `Önerilen Uzunluğu Aşıyor (+${over} krkt taşma)`;
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push(`Açıklama ${len} karakter ile önerilen 155 karakter sınırını ${over} karakter aşıyor! Özellikle mobil aramalarda son cümle kesintiye uğrayacaktır.`);
        suggestions.push(`Açıklamanızı ${maxRecommended} karaktere sığacak şekilde kısaltın veya akıllı kırpma ile telefon numarasını koruyun.`);
      }

      const overflowChars = Math.max(0, len - maxRecommended);
      const validPart = val.slice(0, maxRecommended);
      const overflowPart = val.slice(maxRecommended);
      const autoFixedValue = generateOptimalDescription(pageTitle, company, city, sector, context?.phone);

      return {
        fieldType: "description",
        fieldName: "Meta Açıklama (Description)",
        value: val,
        charCount: len,
        minRecommended,
        maxRecommended,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: Math.min(130, Math.round((len / maxRecommended) * 100)),
        pixelWidthEst,
        maxPixelWidth,
        overflowChars,
        validPart,
        overflowPart,
        issues,
        suggestions,
        autoFixedValue
      };
    }

    case "canonical": {
      const minRecommended = 10;
      const maxRecommended = 120;
      let status: MetaAuditStatus = "ideal";
      let statusLabel = "Geçerli Canonical URL";
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (len === 0) {
        status = "missing";
        statusLabel = "Eksik (Canonical Tanımsız)";
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push("Canonical URL etiketi (<link rel='canonical'>) tanımlanmamış. Kopya içerik uyarısı riski mevcuttur.");
      } else if (!val.startsWith("http://") && !val.startsWith("https://")) {
        status = "missing";
        statusLabel = "Geçersiz Protokol (http/https eksik)";
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push("Canonical URL mutlak (absolute) olmalıdır (https:// ile başlamalıdır).");
      } else if (val.startsWith("http://")) {
        issues.push("Canonical URL güvenli 'https://' protokolü kullanmalıdır.");
      }

      return {
        fieldType: "canonical",
        fieldName: "Canonical URL",
        value: val,
        charCount: len,
        minRecommended,
        maxRecommended,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: len > 0 ? 100 : 0,
        pixelWidthEst: 0,
        maxPixelWidth: 0,
        overflowChars: 0,
        validPart: val,
        overflowPart: "",
        issues,
        suggestions,
        autoFixedValue: context?.fullUrl || ""
      };
    }

    case "ogImage": {
      const minRecommended = 10;
      const maxRecommended = 250;
      let status: MetaAuditStatus = "ideal";
      let statusLabel = "Sosyal Görsel Tanımlı";
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (len === 0) {
        status = "missing";
        statusLabel = "Eksik (og:image Yok)";
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push("Sosyal Paylaşım Görseli (og:image) eksik! WhatsApp, Telegram veya LinkedIn paylaşımlarında kart boş veya kırık çıkacaktır.");
        suggestions.push("En az 1200x630 piksel yüksek çözünürlüklü bir paylaşım görseli URL'si ekleyin.");
      }

      return {
        fieldType: "ogImage",
        fieldName: "Open Graph Görseli (og:image)",
        value: val,
        charCount: len,
        minRecommended,
        maxRecommended,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: len > 0 ? 100 : 0,
        pixelWidthEst: 0,
        maxPixelWidth: 0,
        overflowChars: 0,
        validPart: val,
        overflowPart: "",
        issues,
        suggestions,
        autoFixedValue: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
      };
    }

    case "ogTitle": {
      const minRecommended = 30;
      const maxRecommended = 65;
      let status: MetaAuditStatus = "ideal";
      let statusLabel = "İdeal OG Başlık";
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (len === 0) {
        status = "missing";
        statusLabel = "Tanımsız (Meta Title Kullanılır)";
        statusColor = "text-amber-600";
        badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
        badgeBorder = "border-amber-300";
        suggestions.push("og:title belirtilmezse otomatik olarak sayfa meta başlığı kullanılır.");
      } else if (len > maxRecommended) {
        status = "over_length";
        const over = len - maxRecommended;
        statusLabel = `Önerilen Sınırı Aşıyor (+${over} krkt)`;
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push(`Sosyal paylaşım başlığı ${len} karakter ile 65 karakter limitini aşıyor.`);
      }

      return {
        fieldType: "ogTitle",
        fieldName: "Sosyal Paylaşım Başlığı (og:title)",
        value: val,
        charCount: len,
        minRecommended,
        maxRecommended,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: Math.min(120, Math.round((len / maxRecommended) * 100)),
        pixelWidthEst: 0,
        maxPixelWidth: 0,
        overflowChars: Math.max(0, len - maxRecommended),
        validPart: val.slice(0, maxRecommended),
        overflowPart: val.slice(maxRecommended),
        issues,
        suggestions,
        autoFixedValue: smartTrimText(val, maxRecommended)
      };
    }

    case "ogDescription": {
      const minRecommended = 50;
      const maxRecommended = 195;
      let status: MetaAuditStatus = "ideal";
      let statusLabel = "İdeal OG Açıklama";
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (len === 0) {
        status = "missing";
        statusLabel = "Tanımsız (Meta Desc Kullanılır)";
        statusColor = "text-amber-600";
        badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
        badgeBorder = "border-amber-300";
      } else if (len > maxRecommended) {
        status = "over_length";
        const over = len - maxRecommended;
        statusLabel = `Önerilen Sınırı Aşıyor (+${over} krkt)`;
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push(`Sosyal paylaşım açıklaması ${len} karakter ile 195 karakter limitini aşıyor.`);
      }

      return {
        fieldType: "ogDescription",
        fieldName: "Sosyal Paylaşım Açıklaması (og:description)",
        value: val,
        charCount: len,
        minRecommended,
        maxRecommended,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: Math.min(120, Math.round((len / maxRecommended) * 100)),
        pixelWidthEst: 0,
        maxPixelWidth: 0,
        overflowChars: Math.max(0, len - maxRecommended),
        validPart: val.slice(0, maxRecommended),
        overflowPart: val.slice(maxRecommended),
        issues,
        suggestions,
        autoFixedValue: smartTrimText(val, maxRecommended)
      };
    }

    case "keywords": {
      const kwList = val ? val.split(",").map(k => k.trim()).filter(Boolean) : [];
      let status: MetaAuditStatus = "ideal";
      let statusLabel = `${kwList.length} Anahtar Kelime`;
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (kwList.length === 0) {
        status = "missing";
        statusLabel = "Eksik (Kelime Yok)";
        statusColor = "text-amber-600";
        badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
        badgeBorder = "border-amber-300";
        issues.push("Hedef anahtar kelimeler belirtilmemiş.");
      } else if (kwList.length > 12) {
        status = "over_length";
        statusLabel = `Fazla Kelime (${kwList.length} adet - Spam Riski)`;
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push(`12'den fazla anahtar kelime (${kwList.length} adet) arama motorları tarafından 'Keyword Stuffing' (aşırı yükleme) olarak algılanabilir.`);
      }

      return {
        fieldType: "keywords",
        fieldName: "Anahtar Kelimeler (Keywords)",
        value: val,
        charCount: len,
        minRecommended: 3,
        maxRecommended: 10,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: Math.min(100, (kwList.length / 8) * 100),
        pixelWidthEst: 0,
        maxPixelWidth: 0,
        overflowChars: Math.max(0, kwList.length - 10),
        validPart: val,
        overflowPart: "",
        issues,
        suggestions,
        autoFixedValue: `${pageTitle.toLowerCase()}, ${city.toLowerCase()} ${sector.toLowerCase()}, ${company.toLowerCase()}`
      };
    }

    case "robots": {
      let status: MetaAuditStatus = "ideal";
      let statusLabel = val || "index, follow";
      let statusColor = "text-emerald-600";
      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let badgeBorder = "border-emerald-300";

      if (val.includes("noindex")) {
        status = "over_length"; // Critical warning
        statusLabel = "Kritik: noindex Aktif!";
        statusColor = "text-rose-600";
        badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
        badgeBorder = "border-rose-300";
        issues.push("Sayfada 'noindex' direktifi var! Bu sayfa Google arama sonuçlarında görünmeyecektir.");
      }

      return {
        fieldType: "robots",
        fieldName: "Robots Direktifi",
        value: val,
        charCount: len,
        minRecommended: 5,
        maxRecommended: 30,
        status,
        statusLabel,
        statusColor,
        badgeBg,
        badgeBorder,
        progressPercent: 100,
        pixelWidthEst: 0,
        maxPixelWidth: 0,
        overflowChars: 0,
        validPart: val,
        overflowPart: "",
        issues,
        suggestions,
        autoFixedValue: "index, follow"
      };
    }
  }
}

/**
 * Audits all meta tags of an individual page
 */
export function auditPageMetaTags(page: IndividualPageSeoMeta, config: SiteConfig): AuditedPageMetaResult {
  const companyName = config.companyName || "İşletme";
  const city = config.city || "İstanbul";
  const sector = config.sector || "Hizmet";
  const phone = config.phone || "";

  const context = {
    pageTitle: page.pageTitle,
    companyName,
    city,
    sector,
    phone,
    fullUrl: page.fullUrl
  };

  const titleAudit = auditMetaField("title", page.metaTitle, context);
  const descAudit = auditMetaField("description", page.metaDescription, context);
  const canonicalAudit = auditMetaField("canonical", page.canonicalUrl, context);
  const ogImageAudit = auditMetaField("ogImage", page.ogImage, context);
  const ogTitleAudit = auditMetaField("ogTitle", page.ogTitle, context);
  const ogDescAudit = auditMetaField("ogDescription", page.ogDescription, context);
  const keywordsAudit = auditMetaField("keywords", page.keywords, context);
  const robotsAudit = auditMetaField("robots", page.robots, context);

  const allIssues: Array<{ field: string; message: string; severity: "critical" | "warning" | "info" }> = [];

  [titleAudit, descAudit, canonicalAudit, ogImageAudit, ogTitleAudit, ogDescAudit, keywordsAudit, robotsAudit].forEach(audit => {
    audit.issues.forEach(msg => {
      const severity = audit.status === "missing" ? "critical" : audit.status === "over_length" ? "warning" : "info";
      allIssues.push({ field: audit.fieldName, message: msg, severity });
    });
  });

  const hasMissing = titleAudit.status === "missing" || descAudit.status === "missing" || canonicalAudit.status === "missing" || ogImageAudit.status === "missing";
  const hasOverLength = titleAudit.status === "over_length" || descAudit.status === "over_length" || ogTitleAudit.status === "over_length" || ogDescAudit.status === "over_length";
  const hasTooShort = titleAudit.status === "too_short" || descAudit.status === "too_short";

  // Calculate score 0-100
  let score = 100;
  if (titleAudit.status === "missing") score -= 30;
  else if (titleAudit.status === "over_length") score -= 15;
  else if (titleAudit.status === "too_short") score -= 10;

  if (descAudit.status === "missing") score -= 30;
  else if (descAudit.status === "over_length") score -= 15;
  else if (descAudit.status === "too_short") score -= 10;

  if (canonicalAudit.status === "missing") score -= 15;
  if (ogImageAudit.status === "missing") score -= 10;
  if (robotsAudit.status === "over_length") score -= 40;

  score = Math.max(10, Math.min(100, score));

  let pageOverallStatus: MetaAuditStatus = "ideal";
  if (hasMissing) pageOverallStatus = "missing";
  else if (hasOverLength) pageOverallStatus = "over_length";
  else if (hasTooShort) pageOverallStatus = "too_short";

  return {
    pageId: page.pageId,
    pageTitle: page.pageTitle,
    pageType: page.pageType,
    slug: page.slug,
    fullUrl: page.fullUrl,
    rawMeta: page,
    titleAudit,
    descAudit,
    canonicalAudit,
    ogImageAudit,
    ogTitleAudit,
    ogDescAudit,
    keywordsAudit,
    robotsAudit,
    overallScore: score,
    status: pageOverallStatus,
    hasMissing,
    hasOverLength,
    hasTooShort,
    allIssues
  };
}

/**
 * Site-wide audit across all pages
 */
export function auditAllSitePages(config: SiteConfig): SiteMetaAuditSummary {
  const allPages = getAllPagesSeoMeta(config);
  const auditedPages = allPages.map(p => auditPageMetaTags(p, config));

  let totalChecks = 0;
  let passedChecks = 0;
  let criticalMissingCount = 0;
  let overLengthCount = 0;
  let tooShortCount = 0;
  let idealCount = 0;

  auditedPages.forEach(p => {
    if (p.hasMissing) criticalMissingCount++;
    if (p.hasOverLength) overLengthCount++;
    if (p.hasTooShort) tooShortCount++;
    if (!p.hasMissing && !p.hasOverLength && !p.hasTooShort) idealCount++;

    const checks = [p.titleAudit, p.descAudit, p.canonicalAudit, p.ogImageAudit];
    totalChecks += checks.length;
    passedChecks += checks.filter(c => c.status === "ideal").length;
  });

  const avgScore = auditedPages.length > 0 
    ? Math.round(auditedPages.reduce((acc, p) => acc + p.overallScore, 0) / auditedPages.length)
    : 100;

  return {
    totalPages: auditedPages.length,
    totalChecks,
    passedChecks,
    criticalMissingCount,
    overLengthCount,
    tooShortCount,
    idealCount,
    siteHealthScore: avgScore,
    pages: auditedPages
  };
}

/**
 * Bulk fixes all over-length or missing titles and descriptions across the entire site
 */
export function autoFixAllMetaTags(config: SiteConfig): {
  updatedConfig: SiteConfig;
  fixedPagesCount: number;
} {
  let nextConfig = JSON.parse(JSON.stringify(config)) as SiteConfig;
  const summary = auditAllSitePages(nextConfig);
  let fixedCount = 0;

  summary.pages.forEach(page => {
    let needsUpdate = false;
    const partial: Partial<IndividualPageSeoMeta> = {};

    if (page.titleAudit.status === "over_length") {
      partial.metaTitle = smartTrimText(page.titleAudit.value, 58);
      needsUpdate = true;
    } else if (page.titleAudit.status === "missing") {
      partial.metaTitle = page.titleAudit.autoFixedValue;
      needsUpdate = true;
    }

    if (page.descAudit.status === "over_length") {
      partial.metaDescription = smartTrimText(page.descAudit.value, 155);
      needsUpdate = true;
    } else if (page.descAudit.status === "missing") {
      partial.metaDescription = page.descAudit.autoFixedValue;
      needsUpdate = true;
    }

    if (page.canonicalAudit.status === "missing") {
      partial.canonicalUrl = page.fullUrl;
      needsUpdate = true;
    }

    if (page.ogImageAudit.status === "missing") {
      partial.ogImage = nextConfig.hero?.bgImage || nextConfig.services?.items?.[0]?.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80";
      needsUpdate = true;
    }

    if (needsUpdate) {
      nextConfig = updatePageSeoMeta(nextConfig, page.pageId, partial);
      fixedCount++;
    }
  });

  return {
    updatedConfig: nextConfig,
    fixedPagesCount: fixedCount
  };
}
