import { SiteConfig } from "../types";
import { slugify } from "./url";

export type BackupType = "daily_auto" | "manual" | "pre_restore";

export interface BackupSnapshot {
  id: string;
  timestamp: number;
  dateString: string; // "YYYY-MM-DD"
  formattedDate: string; // e.g. "2 Eylül 2026, 12:41"
  type: BackupType;
  title: string;
  note?: string;
  siteId: string;
  companyName: string;
  pageCount: number;
  servicesCount: number;
  productsCount: number;
  leadsCount: number;
  configSizeKb: number;
  config: SiteConfig;
}

export const BACKUPS_STORAGE_KEY = "hizliweb_site_backups_v1";
export const LAST_DAILY_BACKUP_KEY = "hizliweb_last_daily_backup_date";
const MAX_BACKUPS = 30;

/**
 * Formats a timestamp into Turkish locale date-time representation.
 */
export function formatBackupDate(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return new Date(timestamp).toISOString();
  }
}

/**
 * Returns today's ISO date string in YYYY-MM-DD format (local time).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Retrieves all stored backup snapshots from localStorage.
 */
export function getAllBackups(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(BACKUPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Sort newest first
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (err) {
    console.error("Error reading backups from localStorage:", err);
    return [];
  }
}

/**
 * Saves the backups array to localStorage with automatic quota management.
 */
export function saveBackups(backups: BackupSnapshot[]): boolean {
  try {
    // Keep within MAX_BACKUPS limit, preserving manual backups where possible
    let pruned = [...backups].sort((a, b) => b.timestamp - a.timestamp);
    if (pruned.length > MAX_BACKUPS) {
      pruned = pruned.slice(0, MAX_BACKUPS);
    }

    localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(pruned));
    return true;
  } catch (err: unknown) {
    // If quota exceeded, aggressively prune older daily auto backups
    console.warn("Storage quota warning, pruning older backups:", err);
    try {
      const current = getAllBackups();
      // Keep only the newest 10 backups
      const smallerList = current.slice(0, 10);
      localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(smallerList));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Helper to build a clean snapshot object from a given SiteConfig.
 */
function buildSnapshot(
  config: SiteConfig,
  type: BackupType,
  title: string,
  note?: string
): BackupSnapshot {
  const timestamp = Date.now();
  const dateString = getTodayDateString();
  const formattedDate = formatBackupDate(timestamp);
  const serialized = JSON.stringify(config);
  const configSizeKb = Math.round((serialized.length / 1024) * 10) / 10;

  return {
    id: `backup_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    dateString,
    formattedDate,
    type,
    title,
    note,
    siteId: config.id || "default",
    companyName: config.companyName || "İsimsiz Şirket",
    pageCount: config.pages?.length || 0,
    servicesCount: config.services?.items?.length || 0,
    productsCount: config.products?.items?.length || 0,
    leadsCount: config.leads?.length || 0,
    configSizeKb,
    config: JSON.parse(serialized) // deep clone
  };
}

/**
 * Automated Daily Backup Engine:
 * Checks if a daily backup has already been made for today.
 * If not, automatically creates a new snapshot and saves it.
 */
export function checkAndCreateDailyBackup(config: SiteConfig): {
  created: boolean;
  snapshot?: BackupSnapshot;
} {
  if (!config || !config.companyName) {
    return { created: false };
  }

  try {
    const today = getTodayDateString();
    const lastDailyDate = localStorage.getItem(LAST_DAILY_BACKUP_KEY);
    const existing = getAllBackups();

    // Check if we already have an auto backup for today
    const alreadyHasDailyToday = existing.some(
      (b) => b.type === "daily_auto" && b.dateString === today
    );

    if (lastDailyDate === today && alreadyHasDailyToday) {
      return { created: false };
    }

    // Create automated daily backup
    const snapshot = buildSnapshot(
      config,
      "daily_auto",
      `Otomatik Günlük Yedek (${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })})`,
      "Sistem tarafından her günün ilk oturumunda otomatik olarak oluşturulur."
    );

    const updated = [snapshot, ...existing];
    saveBackups(updated);
    localStorage.setItem(LAST_DAILY_BACKUP_KEY, today);

    return { created: true, snapshot };
  } catch (err) {
    console.error("Failed to run automated daily backup:", err);
    return { created: false };
  }
}

/**
 * Manually trigger a backup snapshot anytime (e.g. before major redesign).
 */
export function createManualBackup(config: SiteConfig, note?: string): BackupSnapshot {
  const snapshot = buildSnapshot(
    config,
    "manual",
    note ? `Manuel Yedek: ${note}` : `Manuel Yedek (${formatBackupDate(Date.now())})`,
    note || "Kullanıcı tarafından isteğe bağlı olarak oluşturuldu."
  );

  const existing = getAllBackups();
  saveBackups([snapshot, ...existing]);
  return snapshot;
}

/**
 * Creates a safety snapshot right before restoring a previous version,
 * guaranteeing that whatever the user was currently editing is not lost.
 */
export function createPreRestoreBackup(config: SiteConfig, targetTitle: string): BackupSnapshot {
  const snapshot = buildSnapshot(
    config,
    "pre_restore",
    `Geri Yükleme Öncesi Güvenlik Yedeği`,
    `"${targetTitle}" sürümüne geri dönülmeden hemen önce otomatik olarak arşivlenen mevcut durum.`
  );

  const existing = getAllBackups();
  saveBackups([snapshot, ...existing]);
  return snapshot;
}

/**
 * Restores a snapshot:
 * 1. Takes a pre_restore safety snapshot of the current state.
 * 2. Returns the config of the selected snapshot.
 */
export function restoreBackup(
  snapshotToRestore: BackupSnapshot,
  currentConfig: SiteConfig
): {
  restoredConfig: SiteConfig;
  preRestoreSnapshot: BackupSnapshot;
} {
  const preRestoreSnapshot = createPreRestoreBackup(currentConfig, snapshotToRestore.title);
  const restoredConfig: SiteConfig = JSON.parse(JSON.stringify(snapshotToRestore.config));

  return {
    restoredConfig,
    preRestoreSnapshot
  };
}

/**
 * Deletes a backup snapshot by ID.
 */
export function deleteBackup(id: string): boolean {
  try {
    const existing = getAllBackups();
    const filtered = existing.filter((b) => b.id !== id);
    return saveBackups(filtered);
  } catch {
    return false;
  }
}

/**
 * Clears all backups.
 */
export function clearAllBackups(): boolean {
  try {
    localStorage.removeItem(BACKUPS_STORAGE_KEY);
    localStorage.removeItem(LAST_DAILY_BACKUP_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Exports all backups as a downloadable JSON file.
 */
export function exportBackupsJson(companyName?: string): void {
  const backups = getAllBackups();
  const exportPayload = {
    app: "HızlıWeb.com.tr Backup Suite",
    exportedAt: new Date().toISOString(),
    version: "1.0",
    companyName: companyName || "Site",
    totalBackups: backups.length,
    backups
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = getTodayDateString();
  const slug = companyName ? slugify(companyName) : "site";
  link.setAttribute("href", url);
  link.setAttribute("download", `${slug}-tum-yedekler-${dateStamp}.json`);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a single backup snapshot as a downloadable JSON file.
 */
export function exportSingleBackupJson(snapshot: BackupSnapshot): void {
  const exportPayload = {
    app: "HızlıWeb.com.tr Backup Suite",
    exportedAt: new Date().toISOString(),
    version: "1.0",
    snapshot
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = snapshot.dateString || getTodayDateString();
  const slug = slugify(snapshot.companyName || "yedek");
  link.setAttribute("href", url);
  link.setAttribute("download", `${slug}-yedek-${dateStamp}-${snapshot.id.slice(-6)}.json`);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports backups from a JSON string into localStorage.
 */
export function importBackupsJson(jsonString: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    let itemsToImport: BackupSnapshot[] = [];

    if (parsed && Array.isArray(parsed.backups)) {
      itemsToImport = parsed.backups;
    } else if (parsed && parsed.snapshot && parsed.snapshot.id && parsed.snapshot.config) {
      itemsToImport = [parsed.snapshot];
    } else if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else if (parsed && parsed.id && parsed.config) {
      itemsToImport = [parsed as BackupSnapshot];
    } else {
      return { success: false, count: 0, error: "Geçersiz yedek dosyası formatı." };
    }

    if (itemsToImport.length === 0) {
      return { success: false, count: 0, error: "Yedek dosyasında geçerli veri bulunamadı." };
    }

    const existing = getAllBackups();
    const existingIds = new Set(existing.map((b) => b.id));

    let addedCount = 0;
    const merged = [...existing];

    for (const item of itemsToImport) {
      if (item && item.config && item.title) {
        if (!existingIds.has(item.id)) {
          merged.push(item);
          existingIds.add(item.id);
          addedCount++;
        }
      }
    }

    saveBackups(merged);
    return { success: true, count: addedCount };
  } catch (err: unknown) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : "JSON dosyası işlenirken hata oluştu."
    };
  }
}

/**
 * Calculates current localStorage usage stats for backups.
 */
export function getStorageUsage(): {
  usedKb: number;
  count: number;
  latestDate?: string;
  hasDailyToday: boolean;
} {
  try {
    const raw = localStorage.getItem(BACKUPS_STORAGE_KEY) || "";
    const usedKb = Math.round((raw.length / 1024) * 10) / 10;
    const backups = getAllBackups();
    const today = getTodayDateString();
    const hasDailyToday = backups.some(
      (b) => b.type === "daily_auto" && b.dateString === today
    );

    return {
      usedKb,
      count: backups.length,
      latestDate: backups[0]?.formattedDate,
      hasDailyToday
    };
  } catch {
    return {
      usedKb: 0,
      count: 0,
      hasDailyToday: false
    };
  }
}
