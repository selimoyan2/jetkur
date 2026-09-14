import { FormLead, LeadAutoArchiveConfig } from "../types";

export const DEFAULT_AUTO_ARCHIVE_CONFIG: LeadAutoArchiveConfig = {
  enabled: true,
  daysInactive: 30,
  targetStatuses: ["new", "contacted"],
  autoTag: "30+ Gün İnaktif",
  notifyOnArchive: true,
  totalArchivedCount: 0
};

const TURKISH_MONTHS: Record<string, number> = {
  ocak: 0,
  subat: 1,
  şubat: 1,
  mart: 2,
  nisan: 3,
  mayis: 4,
  mayıs: 4,
  haziran: 5,
  temmuz: 6,
  agustos: 7,
  ağustos: 7,
  eylul: 8,
  eylül: 8,
  ekim: 9,
  kasim: 10,
  kasım: 10,
  aralik: 11,
  aralık: 11,
  // Short names
  oca: 0,
  sub: 1,
  şub: 1,
  mar: 2,
  nis: 3,
  may: 4,
  haz: 5,
  tem: 6,
  agu: 7,
  ağu: 7,
  eyl: 8,
  eki: 9,
  kas: 10,
  ara: 11
};

/**
 * Calculates how many days have passed since the lead's last recorded activity or creation.
 */
export function getLeadAgeInDays(lead: FormLead): number {
  const now = Date.now();

  // 1. If explicit lastActivityAt exists, calculate against it
  if (lead.lastActivityAt) {
    const actTime = new Date(lead.lastActivityAt).getTime();
    if (!isNaN(actTime) && actTime > 0) {
      const diffDays = Math.floor((now - actTime) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
  }

  // 2. If explicit createdAt exists
  if (lead.createdAt) {
    const createdTime = new Date(lead.createdAt).getTime();
    if (!isNaN(createdTime) && createdTime > 0) {
      const diffDays = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
  }

  // 3. Check if lead.id contains a milliseconds timestamp (e.g. "lead-1725619200000")
  const idTimestampMatch = (lead.id || "").match(/lead-(\d{10,13})/);
  if (idTimestampMatch) {
    const parsedTs = parseInt(idTimestampMatch[1], 10);
    const validTs = parsedTs < 10000000000 ? parsedTs * 1000 : parsedTs;
    if (validTs > 1577836800000 && validTs <= now + 86400000) {
      const diffDays = Math.floor((now - validTs) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
  }

  // 4. Parse Turkish date strings in lead.date (e.g. "Bugün 15:10", "Dün 14:20", "3 gün önce", "15 Tem 2026")
  const dateStr = (lead.date || "").trim().toLowerCase();

  if (!dateStr || dateStr.includes("bugün") || dateStr.includes("az önce") || dateStr.includes("saat önce") || dateStr.includes("dakika önce")) {
    return 0;
  }

  if (dateStr.includes("dün")) {
    return 1;
  }

  // "X gün önce"
  const gunMatch = dateStr.match(/(\d+)\s*gün önce/);
  if (gunMatch) {
    return parseInt(gunMatch[1], 10);
  }

  // "X ay önce"
  const ayMatch = dateStr.match(/(\d+)\s*ay önce/);
  if (ayMatch) {
    return parseInt(ayMatch[1], 10) * 30;
  }

  // "X yıl önce"
  const yilMatch = dateStr.match(/(\d+)\s*yıl önce/);
  if (yilMatch) {
    return parseInt(yilMatch[1], 10) * 365;
  }

  // Standard ISO check: "2026-07-15"
  const isoCheck = new Date(lead.date);
  if (!isNaN(isoCheck.getTime()) && isoCheck.getTime() > 1577836800000) {
    const diffDays = Math.floor((now - isoCheck.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Parse patterns like "15 Tem", "24 Temmuz 2026", "05.06.2026"
  const dotDateMatch = dateStr.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (dotDateMatch) {
    const day = parseInt(dotDateMatch[1], 10);
    const month = parseInt(dotDateMatch[2], 10) - 1;
    let year = parseInt(dotDateMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      const diffDays = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
  }

  // Text month parsing: "12 Ağu 2026" or "12 Ağustos"
  const textDateMatch = dateStr.match(/(\d{1,2})\s+([a-zğüşöçı]+)(?:\s+(\d{4}))?/);
  if (textDateMatch) {
    const day = parseInt(textDateMatch[1], 10);
    const monthKey = textDateMatch[2];
    const year = textDateMatch[3] ? parseInt(textDateMatch[3], 10) : new Date().getFullYear();
    const monthIndex = TURKISH_MONTHS[monthKey];
    if (monthIndex !== undefined) {
      const d = new Date(year, monthIndex, day);
      if (!isNaN(d.getTime())) {
        const diffDays = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      }
    }
  }

  return 0;
}

/**
 * Checks if a specific lead is eligible for auto-archiving based on status and inactivity duration.
 */
export function isLeadEligibleForAutoArchive(
  lead: FormLead,
  config: LeadAutoArchiveConfig = DEFAULT_AUTO_ARCHIVE_CONFIG
): boolean {
  if (config.enabled === false) return false;
  if (lead.status === "archived") return false;

  const targetStatuses = config.targetStatuses || ["new", "contacted"];
  if (!targetStatuses.includes(lead.status as any)) {
    return false;
  }

  const thresholdDays = Number(config.daysInactive) || 30;
  const ageDays = getLeadAgeInDays(lead);

  return ageDays >= thresholdDays;
}

/**
 * Executes the auto-archive evaluation routine on a list of leads.
 * Automatically moves leads that remain 'new' or 'contacted' for > 30 days into 'archived' status.
 */
export function processAutoArchiveLeads(
  leads: FormLead[],
  config: LeadAutoArchiveConfig = DEFAULT_AUTO_ARCHIVE_CONFIG
): {
  updatedLeads: FormLead[];
  archivedCount: number;
  archivedLeadNames: string[];
  archivedLeadIds: string[];
} {
  const effectiveConfig = { ...DEFAULT_AUTO_ARCHIVE_CONFIG, ...config };
  if (effectiveConfig.enabled === false || !leads || leads.length === 0) {
    return {
      updatedLeads: leads,
      archivedCount: 0,
      archivedLeadNames: [],
      archivedLeadIds: []
    };
  }

  let count = 0;
  const archivedNames: string[] = [];
  const archivedIds: string[] = [];
  const nowIso = new Date().toISOString();
  const thresholdDays = Number(effectiveConfig.daysInactive) || 30;

  const updatedLeads = leads.map((lead) => {
    if (isLeadEligibleForAutoArchive(lead, effectiveConfig)) {
      count++;
      archivedNames.push(lead.name);
      archivedIds.push(lead.id);

      const existingTags = lead.tags || [];
      const autoTag = effectiveConfig.autoTag || "30+ Gün İnaktif";
      const tagsWithArchive = existingTags.includes(autoTag)
        ? existingTags
        : [...existingTags, autoTag];

      return {
        ...lead,
        status: "archived" as const,
        isRead: true,
        archivedAt: nowIso,
        archivedReason: `${thresholdDays} günden uzun süredir işlem yapılmadığı için sistem tarafından otomatik arşivlendi.`,
        tags: tagsWithArchive,
        privateNotes: lead.privateNotes
          ? `${lead.privateNotes}\n[Otomatik Arşivleme]: ${thresholdDays} gün inaktiflik sebebiyle arşivlendi (${new Date().toLocaleDateString("tr-TR")}).`
          : `[Otomatik Arşivleme]: ${thresholdDays} gün inaktiflik sebebiyle arşive taşındı (${new Date().toLocaleDateString("tr-TR")}).`
      };
    }
    return lead;
  });

  return {
    updatedLeads,
    archivedCount: count,
    archivedLeadNames: archivedNames,
    archivedLeadIds: archivedIds
  };
}

/**
 * Restores an archived lead back to an active status.
 */
export function restoreArchivedLead(
  lead: FormLead,
  targetStatus: "new" | "contacted" = "contacted"
): FormLead {
  const autoTag = "30+ Gün İnaktif";
  const updatedTags = (lead.tags || []).filter((t) => t !== autoTag && t !== "Otomatik Arşiv");

  return {
    ...lead,
    status: targetStatus,
    archivedAt: undefined,
    archivedReason: undefined,
    lastActivityAt: new Date().toISOString(),
    tags: updatedTags,
    privateNotes: lead.privateNotes
      ? `${lead.privateNotes}\n[Arşivden Çıkarıldı]: ${new Date().toLocaleDateString("tr-TR")} tarihinde tekrar aktif takibe alındı.`
      : `[Arşivden Çıkarıldı]: Tekrar aktif takibe alındı.`
  };
}
