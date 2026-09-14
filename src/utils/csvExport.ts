import { FormLead, NewsletterSubscriber } from "../types";
import { slugify } from "./url";

/**
 * Escapes a cell value according to RFC 4180 rules for CSV.
 * Encloses the content in quotes and doubles up any internal double quotes.
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Converts an array of FormLead objects into an RFC 4180 compliant CSV string.
 * Prepends the UTF-8 Byte Order Mark (\uFEFF) to guarantee proper character rendering
 * (including Turkish and European accented characters) in Microsoft Excel, Google Sheets, and Numbers.
 */
export function convertLeadsToCsv(leads: FormLead[]): string {
  const headers = [
    "ID",
    "Tarih / Date",
    "Müşteri Adı / Name",
    "Telefon / Phone",
    "E-Posta / Email",
    "Hizmet-Ürün / Service-Product",
    "Mesaj / Message",
    "Kaynak Sayfa / Source Page",
    "Durum / Status",
    "Anlaşma Tutarı (TL) / Deal Value",
    "Tamamlanma / Completed Date",
    "Etiketler / Tags",
    "Dahili Özel Notlar / Private Notes"
  ];

  const headerRow = headers.map(escapeCsvCell).join(",");

  const dataRows = (leads || []).map((lead) => [
    escapeCsvCell(lead.id),
    escapeCsvCell(lead.date),
    escapeCsvCell(lead.name),
    escapeCsvCell(lead.phone),
    escapeCsvCell(lead.email || ""),
    escapeCsvCell(lead.serviceOrProduct),
    escapeCsvCell(lead.message),
    escapeCsvCell(lead.sourcePage || ""),
    escapeCsvCell(lead.status),
    escapeCsvCell(lead.dealValue !== undefined ? lead.dealValue : ""),
    escapeCsvCell(lead.completedAt || ""),
    escapeCsvCell((lead.tags || []).join("; ")),
    escapeCsvCell(lead.privateNotes || lead.dealNotes || "")
  ].join(","));

  return "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a browser file download of the CSV content.
 */
export function downloadLeadsCsv(leads: FormLead[], companyName?: string): void {
  const csvContent = convertLeadsToCsv(leads);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const cleanPrefix = companyName ? slugify(companyName) : "musteri";
  link.setAttribute("href", url);
  link.setAttribute("download", `${cleanPrefix}-leads-${dateStamp}.csv`);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts an array of NewsletterSubscriber objects into an RFC 4180 compliant CSV string.
 * Uses UTF-8 BOM for full Turkish/international character compatibility in Excel and Sheets.
 */
export function convertSubscribersToCsv(subscribers: NewsletterSubscriber[]): string {
  const headers = [
    "ID",
    "Kayıt Tarihi / Subscribed Date",
    "E-Posta / Email",
    "Ad Soyad / Name",
    "Durum / Status",
    "Kaynak / Source",
    "Etiketler / Tags"
  ];

  const headerRow = headers.map(escapeCsvCell).join(",");

  const dataRows = (subscribers || []).map((sub) => [
    escapeCsvCell(sub.id),
    escapeCsvCell(sub.subscribedAt),
    escapeCsvCell(sub.email),
    escapeCsvCell(sub.name || ""),
    escapeCsvCell(sub.status === "active" ? "Aktif" : "Abonelik İptal"),
    escapeCsvCell(sub.source || "Web Sitesi E-Bülten Formu"),
    escapeCsvCell((sub.tags || []).join("; "))
  ].join(","));

  return "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a browser file download of subscribers CSV content.
 */
export function downloadSubscribersCsv(subscribers: NewsletterSubscriber[], companyName?: string): void {
  const csvContent = convertSubscribersToCsv(subscribers);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const cleanPrefix = companyName ? slugify(companyName) : "abone";
  link.setAttribute("href", url);
  link.setAttribute("download", `${cleanPrefix}-e-bulten-aboneleri-${dateStamp}.csv`);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

