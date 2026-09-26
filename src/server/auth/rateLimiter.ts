import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // default 1 minute (60_000 ms)
  maxRequests?: number; // default 15
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 15;
  const message =
    options.message || "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.";

  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment, bypass rate limit
    if (process.env.NODE_ENV === "test") {
      next();
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const key = `${req.baseUrl}${req.path}:${ip}`;
    const now = Date.now();

    const record = memoryStore.get(key);

    if (!record || record.resetAt <= now) {
      memoryStore.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.status(429).json({
        error: message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfterSeconds,
      });
      return;
    }

    record.count++;
    next();
  };
}
