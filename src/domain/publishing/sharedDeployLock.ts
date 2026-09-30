/**
 * JetKur Shared Worker Deployment Lock (Sprint 16.3)
 *
 * Core Architectural Requirement:
 * "Because this is ONE shared Worker, per-site locking alone is insufficient.
 * Two customers publishing simultaneously could each build a desired state from stale information.
 * Only one mutation of 'jetkur-customer-sites' may be executed at a time.
 * After acquiring the shared lock: re-read current authoritative active state, then build desired state."
 */

export class SharedWorkerDeployLock {
  private static instance: SharedWorkerDeployLock;
  private locked = false;
  private queue: Array<() => void> = [];
  private currentHolder: string | null = null;
  private acquiredAt: number | null = null;

  // Stale lock timeout (default 60 seconds)
  private readonly timeoutMs: number;

  constructor(timeoutMs = 60000) {
    this.timeoutMs = timeoutMs;
  }

  static getInstance(): SharedWorkerDeployLock {
    if (!SharedWorkerDeployLock.instance) {
      SharedWorkerDeployLock.instance = new SharedWorkerDeployLock();
    }
    return SharedWorkerDeployLock.instance;
  }

  /**
   * Acquires the exclusive deployment lock for the shared worker.
   * If already locked, queues the caller until previous deployment completes.
   */
  async acquire(siteId: string): Promise<() => void> {
    // Check if current lock is stale
    if (this.locked && this.acquiredAt && Date.now() - this.acquiredAt > this.timeoutMs) {
      console.warn(`[SHARED_LOCK] Stale lock held by "${this.currentHolder}" timed out. Forcing release.`);
      this.locked = false;
      this.currentHolder = null;
      this.acquiredAt = null;
    }

    if (this.locked) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.locked = true;
    this.currentHolder = siteId;
    this.acquiredAt = Date.now();

    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.release(siteId);
    };
  }

  private release(siteId: string): void {
    if (this.currentHolder !== siteId && this.locked) {
      console.warn(`[SHARED_LOCK] Release called by "${siteId}" but lock held by "${this.currentHolder}".`);
    }

    this.locked = false;
    this.currentHolder = null;
    this.acquiredAt = null;

    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  isLocked(): boolean {
    return this.locked;
  }

  getCurrentHolder(): string | null {
    return this.currentHolder;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

export const sharedWorkerDeployLock = SharedWorkerDeployLock.getInstance();
