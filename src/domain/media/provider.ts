/**
 * JetKur Image Provider Abstraction & Pexels Integration (Sprint 14)
 *
 * Implements:
 * 1. Provider-independent ImageProvider interface
 * 2. Server-side only PexelsProvider (never leaks API key to client)
 * 3. Graceful fallback on missing API key, timeout, or rate-limiting (429/500)
 * 4. Bounded search cache (max 100 items, 30 min TTL)
 * 5. Full attribution and license metadata preservation
 * 6. Zero Pexels runtime requests on published sites (PEXELS_RUNTIME_REQUESTS = 0)
 */

import {
  ImageIntent,
  MediaAsset,
  ProviderSearchResult,
  MediaSourceProvider,
} from "./types";
import { sanitizeImageUrl } from "./sanitizer";

export interface ImageProvider {
  readonly providerName: MediaSourceProvider;
  isAvailable(): boolean;
  searchImages(
    intent: ImageIntent,
    options?: { page?: number; perPage?: number; siteId?: string; workspaceId?: string }
  ): Promise<ProviderSearchResult>;
}

// Bounded in-memory search cache
interface CacheEntry {
  result: ProviderSearchResult;
  expiresAt: number;
}
const SEARCH_CACHE = new Map<string, CacheEntry>();
const CACHE_MAX_ENTRIES = 100;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCachedResult(cacheKey: string): ProviderSearchResult | null {
  const entry = SEARCH_CACHE.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    SEARCH_CACHE.delete(cacheKey);
    return null;
  }
  return entry.result;
}

function setCachedResult(cacheKey: string, result: ProviderSearchResult): void {
  if (SEARCH_CACHE.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = SEARCH_CACHE.keys().next().value;
    if (oldestKey) SEARCH_CACHE.delete(oldestKey);
  }
  SEARCH_CACHE.set(cacheKey, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * 1. Pexels Image Provider
 * Server-authoritative integration using Pexels Curated & Search API.
 */
export class PexelsProvider implements ImageProvider {
  readonly providerName: MediaSourceProvider = "pexels";
  private apiKey: string | null;

  constructor(apiKey?: string) {
    // Strictly server-side: read from process.env or constructor
    this.apiKey = apiKey || process.env.PEXELS_API_KEY || null;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async searchImages(
    intent: ImageIntent,
    options?: { page?: number; perPage?: number; siteId?: string; workspaceId?: string }
  ): Promise<ProviderSearchResult> {
    const page = options?.page || 1;
    const perPage = options?.perPage || 5;
    const query = intent.keywords.slice(0, 3).join(" ");
    const cacheKey = `pexels:${query}:${intent.orientation}:${page}:${perPage}`;

    // 1. Check in-memory bounded cache
    const cached = getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Check API key availability
    if (!this.isAvailable()) {
      return this.generateFallbackResult(intent, options, "PEXELS_API_KEY_NOT_CONFIGURED");
    }

    // 3. Execute HTTP request with 5000ms timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const url = new URL("https://api.pexels.com/v1/search");
      url.searchParams.set("query", query);
      url.searchParams.set("orientation", intent.orientation);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: this.apiKey!,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 429 rate limit or 500 server error gracefully
        return this.generateFallbackResult(
          intent,
          options,
          `Pexels API responded with status ${response.status}`
        );
      }

      const data = await response.json();
      const photos = data.photos || [];

      if (!Array.isArray(photos) || photos.length === 0) {
        return this.generateFallbackResult(intent, options, "No images found for query");
      }

      const siteId = options?.siteId || "default-site";
      const workspaceId = options?.workspaceId || "default-workspace";

      const assets: MediaAsset[] = photos.map((p: any) => {
        const pexelsId = String(p.id);
        const originalUrl = sanitizeImageUrl(p.src?.large2x || p.src?.large || p.src?.original);
        const photographer = p.photographer || "Pexels Creator";

        return {
          id: `media-pexels-${pexelsId}`,
          workspaceId,
          siteId,
          sourceType: "STOCK",
          originalUrl,
          mimeType: "image/jpeg",
          width: p.width || 1920,
          height: p.height || 1080,
          aspectRatio: p.width && p.height ? `${p.width}:${p.height}` : intent.preferredAspectRatio,
          altText: p.alt ? `${p.alt} - ${intent.suggestedAlt}` : intent.suggestedAlt,
          title: p.alt || intent.subject,
          sourceProvider: "pexels",
          sourceId: pexelsId,
          photographerName: photographer,
          sourcePageUrl: p.url || `https://www.pexels.com/photo/${pexelsId}`,
          licenseMetadata: {
            license: "Pexels Free to Use License",
            attributionRequired: true,
            photographerName: photographer,
            photographerUrl: p.photographer_url,
            sourcePageUrl: p.url,
          },
          variants: [
            { width: 1920, height: 1080, url: p.src?.large2x || originalUrl, mimeType: "image/jpeg" },
            { width: 1200, height: 675, url: p.src?.large || originalUrl, mimeType: "image/jpeg" },
            { width: 640, height: 360, url: p.src?.medium || originalUrl, mimeType: "image/jpeg" },
            { width: 320, height: 180, url: p.src?.small || originalUrl, mimeType: "image/jpeg" },
          ],
          assignedSlots: [{ sectionType: "general", slotKey: intent.slotKey, label: intent.subject }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      const result: ProviderSearchResult = {
        success: true,
        provider: "pexels",
        assets,
        totalResults: data.total_results || assets.length,
        page,
        perPage,
        fallbackUsed: false,
      };

      setCachedResult(cacheKey, result);
      return result;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === "AbortError";
      return this.generateFallbackResult(
        intent,
        options,
        isTimeout ? "Pexels API request timed out (5s)" : err?.message || String(err)
      );
    }
  }

  /**
   * Generates graceful fallback when Pexels is offline, rate-limited, or unconfigured.
   */
  private generateFallbackResult(
    intent: ImageIntent,
    options?: { page?: number; perPage?: number; siteId?: string; workspaceId?: string },
    reason?: string
  ): ProviderSearchResult {
    const siteId = options?.siteId || "default-site";
    const workspaceId = options?.workspaceId || "default-workspace";
    const fallbackUrl = sanitizeImageUrl(intent.fallbackUrl);

    const asset: MediaAsset = {
      id: `media-fallback-${intent.slotKey}`,
      workspaceId,
      siteId,
      sourceType: "LEGACY_EXTERNAL",
      originalUrl: fallbackUrl,
      mimeType: "image/jpeg",
      width: 1600,
      height: 900,
      aspectRatio: intent.preferredAspectRatio,
      altText: intent.suggestedAlt,
      title: intent.subject,
      sourceProvider: "internal",
      sourceId: `curated-${intent.industrySlug}-${intent.slotKey}`,
      photographerName: "JetKur Curated Library",
      sourcePageUrl: "https://jetkur.com.tr",
      licenseMetadata: {
        license: "Commercial Safe / Unsplash Royalty Free",
        attributionRequired: false,
      },
      variants: [
        { width: 1600, height: 900, url: fallbackUrl, mimeType: "image/jpeg" },
      ],
      assignedSlots: [{ sectionType: "general", slotKey: intent.slotKey, label: intent.subject }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      provider: "internal",
      assets: [asset],
      totalResults: 1,
      page: 1,
      perPage: 1,
      fallbackUsed: true,
      errorMessage: reason,
    };
  }
}

/**
 * 2. Fallback / Internal Image Provider
 * Always available offline with curated high-resolution photography.
 */
export class InternalFallbackProvider implements ImageProvider {
  readonly providerName: MediaSourceProvider = "internal";

  isAvailable(): boolean {
    return true;
  }

  async searchImages(
    intent: ImageIntent,
    options?: { page?: number; perPage?: number; siteId?: string; workspaceId?: string }
  ): Promise<ProviderSearchResult> {
    const siteId = options?.siteId || "default-site";
    const workspaceId = options?.workspaceId || "default-workspace";
    const fallbackUrl = sanitizeImageUrl(intent.fallbackUrl);

    const asset: MediaAsset = {
      id: `media-internal-${intent.slotKey}`,
      workspaceId,
      siteId,
      sourceType: "STOCK",
      originalUrl: fallbackUrl,
      mimeType: "image/jpeg",
      width: 1600,
      height: 900,
      aspectRatio: intent.preferredAspectRatio,
      altText: intent.suggestedAlt,
      title: intent.subject,
      sourceProvider: "internal",
      sourceId: `internal-${intent.industrySlug}-${intent.slotKey}`,
      photographerName: "JetKur Curated Media",
      sourcePageUrl: "https://jetkur.com.tr",
      licenseMetadata: {
        license: "JetKur Commercial License",
        attributionRequired: false,
      },
      assignedSlots: [{ sectionType: "general", slotKey: intent.slotKey, label: intent.subject }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      provider: "internal",
      assets: [asset],
      totalResults: 1,
      page: 1,
      perPage: 1,
      fallbackUsed: false,
    };
  }
}
