import { FormLead, LeadTimelineEntry, LeadTimelineEventType } from "../types";

/**
 * Intelligent parser that extracts timestamps, brackets, or standard notes
 * into structured timeline entries.
 */
export function parseNotesIntoEntries(leadId: string, notesText: string): LeadTimelineEntry[] {
  if (!notesText || !notesText.trim()) return [];

  // Check if the notes contain timestamped blocks like: [07.09.2026 14:30 - Telefon Görüşmesi]: Mesaj
  const regex = /\[(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4}\s+\d{1,2}:\d{2})\s*-\s*([^\]]+)\]:\s*([^\[]+)/g;
  const entries: LeadTimelineEntry[] = [];
  let match: RegExpExecArray | null;
  let matchIndex = 0;

  while ((match = regex.exec(notesText)) !== null) {
    const rawDate = match[1].trim();
    const rawPrefix = match[2].trim();
    const rawBody = match[3].trim();

    let eventType: LeadTimelineEventType = "note";
    const lowerPrefix = rawPrefix.toLowerCase();
    if (lowerPrefix.includes("telefon") || lowerPrefix.includes("arama")) eventType = "call";
    else if (lowerPrefix.includes("whatsapp")) eventType = "whatsapp";
    else if (lowerPrefix.includes("e-posta") || lowerPrefix.includes("email")) eventType = "email";
    else if (lowerPrefix.includes("teklif") || lowerPrefix.includes("fiyat")) eventType = "quote";
    else if (lowerPrefix.includes("toplantı") || lowerPrefix.includes("ziyaret")) eventType = "meeting";

    entries.push({
      id: `tle-parsed-${leadId}-${matchIndex}`,
      type: eventType,
      date: rawDate,
      title: `Özel Not: ${rawPrefix}`,
      description: rawBody,
      author: "Dahili Yönetici",
      outcome: "Kaydedildi"
    });
    matchIndex++;
  }

  // If no bracketed matches found, but notes exist, return as a single clean note entry
  if (entries.length === 0) {
    entries.push({
      id: `tle-note-${leadId}`,
      type: "note",
      date: "Özel Not",
      title: "Dahili Özel Not & Operasyon Gözlemleri",
      description: notesText.trim(),
      author: "Yönetici / Ekip",
      outcome: "Aktif Not"
    });
  }

  return entries;
}

/**
 * Builds a comprehensive, realistic chronological timeline for a lead
 * combining initial form submissions, communications, notes, and status changes.
 */
export function buildInitialLeadTimeline(lead: FormLead, companyName: string = "Firmamız"): LeadTimelineEntry[] {
  // If lead already has explicitly stored timeline entries, return them
  if (lead.timeline && lead.timeline.length > 0) {
    return lead.timeline;
  }

  const result: LeadTimelineEntry[] = [];
  const baseDate = lead.date || "Bugün 10:00";

  // 1. Initial Web Form submission (The birth of the lead)
  result.push({
    id: `tle-${lead.id}-form`,
    type: "form_submission",
    date: baseDate,
    title: "Web Sitesi Form Talebi İletildi",
    description: `Müşteri "${lead.serviceOrProduct || "Genel Teklif"}" talebi için "${lead.sourcePage || "İletişim Formu"}" üzerinden form gönderdi: "${lead.message || "Mesaj belirtilmedi."}"`,
    author: lead.name || "Ziyaretçi",
    outcome: "Talep Alındı",
    pinned: true
  });

  // 2. Automated Thank You Email / Response
  if (lead.thankYouEmailSent || lead.thankYouEmailSentAt || lead.email) {
    result.push({
      id: `tle-${lead.id}-auto-email`,
      type: "email",
      date: lead.thankYouEmailSentAt || baseDate,
      title: "Otomatik Bilgilendirme & Doğrulama E-postası",
      description: `Alıcı: ${lead.email || "Müşteri e-postası"}. ${companyName} karşılama otomasyonu kapsamında teşekkür mesajı iletildi. Durum: ${lead.thankYouEmailStatus === "delivered" ? "Teslim Edildi (250 OK)" : "Kuyrukta Bekliyor"}.`,
      author: "Sistem Otomasyonu",
      outcome: lead.thankYouEmailStatus === "delivered" ? "Teslim Edildi" : "Kuyrukta"
    });
  }

  // 3. Lead Scoring & Assessment
  if (lead.leadScore !== undefined && lead.leadScore > 0) {
    result.push({
      id: `tle-${lead.id}-score`,
      type: "score",
      date: baseDate,
      title: `Lead Scoring Öncelik Değerlendirmesi: ${lead.leadScore}/100`,
      description: `${lead.leadScorePriority === "high" ? "🔥 Yüksek Öncelikli Talep" : lead.leadScorePriority === "medium" ? "⚡ Orta Öncelik" : "Standart Talep"}. Puan faktörleri: ${(lead.leadScoreReasons || ["İletişim bilgisi tam", "Yüksek dönüşüm potansiyeli"]).join(" • ")}`,
      author: "CRM Akıllı Puanlama",
      outcome: lead.leadScorePriority?.toUpperCase() || "ANALİZ EDİLDİ"
    });
  }

  // 4. Initial Communication (Phone or WhatsApp) if contacted/offered/closed
  if (lead.status !== "new") {
    result.push({
      id: `tle-${lead.id}-first-call`,
      type: "call",
      date: lead.date.includes(":") ? lead.date : "Bugün 11:30",
      title: `Telefon Görüşmesi Yapıldı`,
      description: `${lead.phone} üzerinden müşteri arandı. İhtiyaç duyulan ${lead.serviceOrProduct} detayları, konum bilgisi ve zamanlama netleştirildi.`,
      duration: "4 dk 20 sn",
      author: "Müşteri Danışmanı",
      outcome: "Ulaşıldı & Teyit Edildi"
    });

    result.push({
      id: `tle-${lead.id}-status-contacted`,
      type: "status_change",
      date: lead.date.includes(":") ? lead.date : "Bugün 11:35",
      title: "Talep Durumu Değiştirildi: İletişime Geçildi",
      description: "Müşteri ile ilk görüşme tamamlandı, talep pipeline üzerinde 'İletişime Geçildi' aşamasına aktarıldı.",
      author: "Müşteri Danışmanı",
      statusFrom: "new",
      statusTo: "contacted",
      outcome: "İletişime Geçildi"
    });
  }

  // 5. WhatsApp Follow-up (Realistic scenario for mobile/field services)
  if (lead.status === "offered" || lead.status === "closed") {
    result.push({
      id: `tle-${lead.id}-whatsapp-info`,
      type: "whatsapp",
      date: "Bugün 12:15",
      title: "WhatsApp Bilgi & Konum Paylaşımı",
      description: "Müşteriye WhatsApp üzerinden araç plakası, görevli ekip iletişim bilgileri ve konum krokisi iletildi.",
      author: "Operatör",
      outcome: "İletildi (Çift Mavi Tık)"
    });
  }

  // 6. Quotation / Deal Value Offered
  if (lead.dealValue && (lead.status === "offered" || lead.status === "closed")) {
    result.push({
      id: `tle-${lead.id}-quote`,
      type: "quote",
      date: "Bugün 12:45",
      title: `Resmi Fiyat Teklifi İletildi: ₺${lead.dealValue.toLocaleString("tr-TR")}`,
      description: `${lead.serviceOrProduct} hizmeti için ₺${lead.dealValue.toLocaleString("tr-TR")} tutarında fiyat teklifi sunuldu ve koşullar paylaşıldı.`,
      dealValue: lead.dealValue,
      author: "Satış Yetkilisi",
      outcome: lead.status === "closed" ? "Müşteri Tarafından Onaylandı" : "Değerlendirme Aşamasında"
    });

    if (lead.status === "offered") {
      result.push({
        id: `tle-${lead.id}-status-offered`,
        type: "status_change",
        date: "Bugün 12:46",
        title: "Talep Durumu Değiştirildi: Fiyat Teklifi Verildi",
        description: "Fiyat teklifi müşteriye iletildi, durum 'Teklif & Müzakere' aşamasına güncellendi.",
        author: "Satış Yetkilisi",
        statusFrom: "contacted",
        statusTo: "offered",
        outcome: "Fiyat Teklifi Verildi"
      });
    }
  }

  // 7. Parse or include existing Private Notes
  const existingNotes = lead.privateNotes || lead.dealNotes;
  if (existingNotes && existingNotes.trim()) {
    const parsedNotes = parseNotesIntoEntries(lead.id, existingNotes);
    result.push(...parsedNotes);
  }

  // 8. Deal Completion (Closed)
  if (lead.status === "closed") {
    result.push({
      id: `tle-${lead.id}-closed`,
      type: "deal_closed",
      date: lead.completedAt || "Bugün 16:00",
      title: "Satış & Hizmet Başarıyla Tamamlandı 🎉",
      description: `Hizmet başarıyla icra edildi, fatura/makbuz kesildi ve müşteri memnuniyeti sağlandı. Kapanan Ciro: ₺${(lead.dealValue || 0).toLocaleString("tr-TR")}.`,
      dealValue: lead.dealValue,
      author: "Operasyon Müdürü",
      outcome: "Başarıyla Kapandı"
    });

    result.push({
      id: `tle-${lead.id}-status-closed`,
      type: "status_change",
      date: lead.completedAt || "Bugün 16:01",
      title: "Talep Durumu Değiştirildi: Satış Tamamlandı (Kapandı)",
      description: "Tüm süreçler tamamlandı ve talep başarılı şekilde sonlandırıldı.",
      author: "Operasyon Müdürü",
      statusFrom: "offered",
      statusTo: "closed",
      outcome: "Satış Tamamlandı"
    });
  }

  // 9. Archived
  if (lead.status === "archived") {
    result.push({
      id: `tle-${lead.id}-archived`,
      type: "archive",
      date: lead.archivedAt ? new Date(lead.archivedAt).toLocaleDateString("tr-TR") : "Bugün",
      title: "Talep Arşivlendi",
      description: lead.archivedReason || "Süre aşımı veya işlem yapılmadığı için arşive taşındı.",
      author: "Sistem / Yönetici",
      statusTo: "archived",
      outcome: "Arşivde"
    });
  }

  return result;
}

/**
 * Appends a new timeline entry to a lead and synchronizes notes and lastActivityAt
 */
export function addTimelineEntryToLead(
  lead: FormLead,
  newEntry: Omit<LeadTimelineEntry, "id">,
  companyName?: string
): FormLead {
  const currentTimeline = buildInitialLeadTimeline(lead, companyName);
  const entryId = `tle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const createdEntry: LeadTimelineEntry = {
    ...newEntry,
    id: entryId
  };

  const updatedTimeline = [createdEntry, ...currentTimeline];

  // If this entry is a private note or call with notes, also append a timestamped stamp to privateNotes
  let updatedPrivateNotes = lead.privateNotes || lead.dealNotes || "";
  if (newEntry.type === "note" || newEntry.type === "call" || newEntry.type === "meeting") {
    const stamp = `\n[${newEntry.date} - ${newEntry.title}]: ${newEntry.description}`;
    updatedPrivateNotes = updatedPrivateNotes ? `${updatedPrivateNotes.trimEnd()}${stamp}` : stamp.trim();
  }

  return {
    ...lead,
    timeline: updatedTimeline,
    privateNotes: updatedPrivateNotes,
    dealNotes: updatedPrivateNotes,
    lastActivityAt: new Date().toISOString(),
    ...(newEntry.dealValue !== undefined ? { dealValue: newEntry.dealValue } : {}),
    ...(newEntry.statusTo ? { status: newEntry.statusTo } : {})
  };
}

/**
 * Removes a timeline entry from lead
 */
export function removeTimelineEntryFromLead(
  lead: FormLead,
  entryId: string,
  companyName?: string
): FormLead {
  const currentTimeline = buildInitialLeadTimeline(lead, companyName);
  const updatedTimeline = currentTimeline.filter((e) => e.id !== entryId);

  return {
    ...lead,
    timeline: updatedTimeline,
    lastActivityAt: new Date().toISOString()
  };
}

/**
 * Updates an existing timeline entry
 */
export function updateTimelineEntryInLead(
  lead: FormLead,
  entryId: string,
  updates: Partial<LeadTimelineEntry>,
  companyName?: string
): FormLead {
  const currentTimeline = buildInitialLeadTimeline(lead, companyName);
  const updatedTimeline = currentTimeline.map((item) => {
    if (item.id === entryId) {
      return { ...item, ...updates };
    }
    return item;
  });

  return {
    ...lead,
    timeline: updatedTimeline,
    lastActivityAt: new Date().toISOString()
  };
}

/**
 * Exports the timeline to a nicely formatted text report
 */
export function exportTimelineToText(lead: FormLead, timeline: LeadTimelineEntry[]): string {
  const lines: string[] = [];
  lines.push(`========================================================`);
  lines.push(`LEAD ZAMAN ÇİZELGESİ VE İLETİŞİM GEÇMİŞİ`);
  lines.push(`Müşteri Adı: ${lead.name}`);
  lines.push(`Telefon: ${lead.phone} | E-posta: ${lead.email || "-"}`);
  lines.push(`Hizmet: ${lead.serviceOrProduct}`);
  lines.push(`Mevcut Durum: ${lead.status.toUpperCase()} | Değer: ₺${(lead.dealValue || 0).toLocaleString("tr-TR")}`);
  lines.push(`Rapor Oluşturma: ${new Date().toLocaleString("tr-TR")}`);
  lines.push(`========================================================\n`);

  timeline.forEach((item, idx) => {
    lines.push(`[${idx + 1}] ${item.date} | ${item.type.toUpperCase()} | ${item.title}`);
    lines.push(`    Ekleyen / Muhatap: ${item.author || "Belirtilmedi"}`);
    if (item.duration) lines.push(`    Süre: ${item.duration}`);
    if (item.outcome) lines.push(`    Sonuç: ${item.outcome}`);
    if (item.dealValue) lines.push(`    Tutar: ₺${item.dealValue.toLocaleString("tr-TR")}`);
    lines.push(`    Detay: ${item.description}`);
    lines.push(`--------------------------------------------------------`);
  });

  return lines.join("\n");
}

/**
 * Triggers a download of the timeline text report
 */
export function downloadTimelineReport(lead: FormLead, timeline: LeadTimelineEntry[]): void {
  const text = exportTimelineToText(lead, timeline);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanName = (lead.name || "lead").replace(/[^a-zA-Z0-9_-]/g, "_");
  link.href = url;
  link.download = `zaman_cizelgesi_${cleanName}_${lead.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
