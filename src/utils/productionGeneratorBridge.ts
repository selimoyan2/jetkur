/**
 * JetKur Canonical Production Generation Bridge (Sprint 09.2)
 *
 * ARCHITECTURAL PURPOSE:
 * Serves as the single canonical generation authority bridge for production
 * UI consumers (StaticDeployModal, LivePreviewFrame, cloudflareDeployEngine).
 *
 * Flow:
 * SiteConfig (legacy UI state)
 *   -> fromLegacySiteConfig() => CanonicalSite
 *   -> resolveTemplate() => TemplateManifest
 *   -> generateStaticSite() => Canonical Modular Static Files
 */

import { SiteConfig, GeneratedPageFile } from "../types";
import { fromLegacySiteConfig } from "../domain/site/legacyAdapter";
import { resolveTemplate, CANONICAL_TEMPLATE_MANIFESTS } from "../domain/templates/catalog";
import { generateStaticSite } from "./generator";
import { TemplateManifest } from "../domain/templates/types";

export interface CanonicalGenerationResult {
  files: GeneratedPageFile[];
  manifestUsed: TemplateManifest;
  source: "canonical_renderer";
}

/**
 * Resolves a TemplateManifest for the given SiteConfig.
 * Checks templateId, designSet, sector, or falls back safely to default.
 */
export function resolveManifestForConfig(config: SiteConfig): TemplateManifest {
  const candidateKey = config.templateId || (config as any).designSet || config.sector || "";
  const resolved = resolveTemplate(candidateKey);
  return resolved || CANONICAL_TEMPLATE_MANIFESTS[0];
}

/**
 * Primary production cutover entrypoint.
 * Converts legacy SiteConfig to CanonicalSite, resolves TemplateManifest,
 * and generates static site artifacts via the canonical modular renderer.
 */
export function generateProductionSiteFiles(config: SiteConfig): GeneratedPageFile[] {
  // 1. Transform to CanonicalSite domain model
  const canonicalSite = fromLegacySiteConfig(config);

  // 2. Resolve TemplateManifest authority
  const manifest = resolveManifestForConfig(config);

  // 3. Delegate to canonical modular generator
  return generateStaticSite(canonicalSite, manifest, config);
}

/**
 * Production preview helper for LivePreviewFrame.
 * Uses the exact same canonical rendering pipeline as deployment/export.
 */
export function generateProductionPreviewHtml(config: SiteConfig, activeFilenameOrSlug?: string): string {
  const allFiles = generateProductionSiteFiles(config);
  if (!activeFilenameOrSlug || activeFilenameOrSlug === "home" || activeFilenameOrSlug === "index.html" || activeFilenameOrSlug === "index") {
    return allFiles[0]?.html || allFiles[0]?.content || "";
  }

  const match = allFiles.find(
    (f) =>
      f.slug === activeFilenameOrSlug ||
      f.filename === activeFilenameOrSlug ||
      f.fileName === activeFilenameOrSlug
  );

  return match ? (match.html || match.content || "") : (allFiles[0]?.html || allFiles[0]?.content || "");
}
