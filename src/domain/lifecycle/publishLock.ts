/**
 * JetKur Site-Level Publish Lock & Idempotency Manager (Sprint 13)
 *
 * Prevents concurrent duplicate deployments for the same site.
 * Supports stale lock recovery (auto-release after TTL).
 */

import crypto from "crypto";

interface LockEntry {
  token: string;
  acquiredAt: number;
  expiresAt: number;
}

const DEFAULT_LOCK_TTL_MS = 120 * 1000; // 2 minutes max lock duration

class PublishLockManager {
  private locks = new Map<string, LockEntry>();

  /**
   * Attempts to acquire an exclusive publish lock for a site.
   * If a lock exists but has expired (stale), it is automatically recovered.
   */
  acquireLock(
    siteId: string,
    ttlMs = DEFAULT_LOCK_TTL_MS
  ): { acquired: boolean; token?: string; staleRecovered?: boolean } {
    const now = Date.now();
    const existing = this.locks.get(siteId);

    if (existing) {
      if (now < existing.expiresAt) {
        // Lock is active and fresh - rejection
        return { acquired: false };
      }
      // Stale lock detected - automatically recover
      const token = crypto.randomBytes(16).toString("hex");
      this.locks.set(siteId, {
        token,
        acquiredAt: now,
        expiresAt: now + ttlMs,
      });
      return { acquired: true, token, staleRecovered: true };
    }

    const token = crypto.randomBytes(16).toString("hex");
    this.locks.set(siteId, {
      token,
      acquiredAt: now,
      expiresAt: now + ttlMs,
    });
    return { acquired: true, token, staleRecovered: false };
  }

  /**
   * Releases an acquired publish lock using its token.
   */
  releaseLock(siteId: string, token: string): boolean {
    const existing = this.locks.get(siteId);
    if (!existing) {
      return true;
    }
    if (existing.token === token) {
      this.locks.delete(siteId);
      return true;
    }
    return false;
  }

  /**
   * Checks whether a site is currently actively locked.
   */
  isLocked(siteId: string): boolean {
    const existing = this.locks.get(siteId);
    if (!existing) return false;
    if (Date.now() >= existing.expiresAt) {
      this.locks.delete(siteId);
      return false;
    }
    return true;
  }

  /**
   * Force clears all locks (useful for test teardown)
   */
  clearAll(): void {
    this.locks.clear();
  }
}

export const publishLockManager = new PublishLockManager();
