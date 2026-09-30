/**
 * JetKur Ephemeral Candidate Template Preview Engine (Sprint 15)
 *
 * Core Principle:
 * "Önizleme geçicidir; sitenin verisini değiştirmez."
 *
 * Renders the customer's REAL draft content (BusinessProfile, SiteContent,
 * BrandKit, MediaAsset, SectionConfiguration) using a candidate TemplateManifest,
 * WITHOUT persisting or mutating anything.
 */

import { CanonicalSite } from "../site/site";
import { resolveTemplate, CANONICAL_TEMPLATE_MANIFESTS } from "./catalog";
import { toSiteConfig } from "../site/legacyAdapter";
import { generateProductionPreviewHtml } from "../../utils/productionGeneratorBridge";
import { computeSiteFingerprint } from "../lifecycle/fingerprint";

// Bounded in-memory preview cache (max 50 entries, 10 min TTL)
interface PreviewCacheEntry {
  html: string;
  expiresAt: number;
}
const PREVIEW_CACHE = new Map<string, PreviewCacheEntry>();
const CACHE_MAX_ENTRIES = 50;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generates an ephemeral HTML preview of the customer's draft under a candidate template.
 * ZERO database mutations. ZERO draft mutations. ZERO live mutations.
 */
export function generateCandidatePreviewHtml(
  site: CanonicalSite,
  candidateTemplateId: string
): { html: string; cached: boolean; manifestName: string } {
  const manifest = resolveTemplate(candidateTemplateId) || CANONICAL_TEMPLATE_MANIFESTS[0];
  const fingerprint = computeSiteFingerprint(site);
  const cacheKey = `${site.id}:${fingerprint}:${manifest.id}`;

  const cached = PREVIEW_CACHE.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return { html: cached.html, cached: true, manifestName: manifest.name };
  }

  // Deep clone draft to strictly prevent any mutation to in-memory state
  const candidateDraft: CanonicalSite = JSON.parse(JSON.stringify(site));
  candidateDraft.designTemplate = {
    templateId: manifest.id,
    templateSlug: manifest.slug,
    customTokens: {},
  };

  // Convert to SiteConfig bridge and generate canonical HTML
  const bridgeConfig = toSiteConfig(candidateDraft);
  bridgeConfig.templateId = manifest.id;
  (bridgeConfig as any).theme = manifest.slug;

  const html = generateProductionPreviewHtml(bridgeConfig);

  // Store in bounded cache
  if (PREVIEW_CACHE.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = PREVIEW_CACHE.keys().next().value;
    if (oldestKey) PREVIEW_CACHE.delete(oldestKey);
  }
  PREVIEW_CACHE.set(cacheKey, {
    html,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return { html, cached: false, manifestName: manifest.name };
}

/**
 * Clears candidate preview cache (for tests)
 */
export function clearCandidatePreviewCache(): void {
  PREVIEW_CACHE.clear();
}
