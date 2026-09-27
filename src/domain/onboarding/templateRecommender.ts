/**
 * JetKur Smart Onboarding - Deterministic Initial Template Recommender (Sprint 11)
 *
 * ARCHITECTURAL PRINCIPLE:
 * Deterministically recommends an optimal initial TemplateManifest based on
 * industry archetype, presentation intent, and recommended sections.
 *
 * INVARIANT:
 * Recommendation does NOT create hard coupling. The site and industry
 * do not permanently depend on the recommended template, and the customer
 * can switch templates freely at any time.
 */

import { TemplateManifest } from "../templates/types";
import {
  resolveTemplate,
  CANONICAL_TEMPLATE_MANIFESTS,
} from "../templates/catalog";
import { rapidServiceManifest } from "../templates/manifests/rapidService";
import { clinicalPureManifest } from "../templates/manifests/clinicalPure";
import { formalLegalManifest } from "../templates/manifests/formalLegal";
import { artisanWarmManifest } from "../templates/manifests/artisanWarm";
import { corporatePrestigeManifest } from "../templates/manifests/corporatePrestige";

/**
 * Deterministic mapping of industry slugs to recommended template manifests
 */
const INDUSTRY_TEMPLATE_RECOMMENDATIONS: Record<string, TemplateManifest> = {
  // Rapid emergency & mobile services
  "oto-kurtarma": rapidServiceManifest,
  "sihhi-tesisat": rapidServiceManifest,
  "kombi-klima-servisi": rapidServiceManifest,
  "evden-eve-nakliyat": rapidServiceManifest,

  // Health, clinic, and medical care
  "dis-hekimligi": clinicalPureManifest,

  // Legal, advisory, and professional consultation
  "hukuk-avukat": formalLegalManifest,

  // Local artisan, home hygiene, and craft services
  "hali-yikama": artisanWarmManifest,

  // Generic business / corporate fallback
  "genel-isletme": corporatePrestigeManifest,
};

/**
 * Recommends an initial TemplateManifest for an industry slug.
 * Always returns a valid, platform-owned TemplateManifest.
 */
export function recommendTemplateForIndustry(
  industrySlug: string,
  category?: string
): TemplateManifest {
  if (!industrySlug) {
    return corporatePrestigeManifest;
  }

  // 1. Direct slug recommendation
  const direct = INDUSTRY_TEMPLATE_RECOMMENDATIONS[industrySlug];
  if (direct) {
    return direct;
  }

  // 2. Category-based fallback heuristic
  if (category) {
    if (category === "emergency" || category === "home_services" || category === "automotive") {
      return rapidServiceManifest;
    }
    if (category === "health" || category === "medical") {
      return clinicalPureManifest;
    }
    if (category === "legal" || category === "finance") {
      return formalLegalManifest;
    }
    if (category === "artisanal" || category === "craft") {
      return artisanWarmManifest;
    }
  }

  // 3. Platform default for generic business
  return corporatePrestigeManifest;
}

/**
 * Validates a user-requested template ID or returns the recommended template.
 */
export function resolveOnboardingTemplate(
  requestedTemplateId: string | undefined,
  industrySlug: string,
  category?: string
): TemplateManifest {
  if (requestedTemplateId) {
    const resolved = resolveTemplate(requestedTemplateId);
    if (resolved) {
      return resolved;
    }
  }

  return recommendTemplateForIndustry(industrySlug, category);
}
