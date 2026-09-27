/**
 * JetKur Smart Onboarding - Industry Resolver & Fallback Boundary (Sprint 11)
 *
 * ARCHITECTURAL PRINCIPLE:
 * Resolves user-entered or user-selected industry strings deterministically
 * using Sprint 05 canonical resolvers without AI dependency.
 *
 * UNKNOWN INDUSTRY INVARIANT:
 * If an industry cannot be resolved against the 7 canonical packs,
 * falls back safely to the platform-owned `genericBusinessIndustryPack`.
 * Does NOT crash and does NOT invent regulated professional claims.
 */

import { IndustryPack } from "../industries/types";
import {
  ALL_INDUSTRY_PACKS,
  toIndustryPackSummary,
} from "../industries/catalog";
import {
  resolveIndustryPack,
  getIndustryPackBySlug,
  searchIndustryPacks,
} from "../industries/resolver";
import { genericBusinessIndustryPack } from "../industries/packs/genericBusiness";

export interface ResolvedOnboardingIndustry {
  pack: IndustryPack;
  isFallback: boolean;
  resolvedBy: "exact" | "alias" | "fallback";
}

/**
 * Deterministically resolves arbitrary customer input to an IndustryPack,
 * falling back to genericBusinessIndustryPack when unknown.
 */
export function resolveOnboardingIndustry(input: string): ResolvedOnboardingIndustry {
  if (!input || typeof input !== "string" || !input.trim()) {
    return {
      pack: genericBusinessIndustryPack,
      isFallback: true,
      resolvedBy: "fallback",
    };
  }

  const trimmed = input.trim();

  // 1. Direct slug or alias lookup using Sprint 05 canonical resolver
  const direct = getIndustryPackBySlug(trimmed);
  if (direct) {
    return {
      pack: direct,
      isFallback: false,
      resolvedBy: "exact",
    };
  }

  const result = resolveIndustryPack(trimmed);

  if (result.status === "EXACT_MATCH" && result.pack) {
    return {
      pack: result.pack,
      isFallback: false,
      resolvedBy: "exact",
    };
  }

  if (result.status === "ALIAS_MATCH" && result.pack) {
    return {
      pack: result.pack,
      isFallback: false,
      resolvedBy: "alias",
    };
  }

  if (result.status === "AMBIGUOUS" && result.candidates && result.candidates.length > 0) {
    return {
      pack: result.candidates[0],
      isFallback: false,
      resolvedBy: "alias",
    };
  }

  // Check if generic business was explicitly requested
  if (
    trimmed.toLowerCase() === "genel" ||
    trimmed.toLowerCase() === "diger" ||
    trimmed.toLowerCase() === "diğer" ||
    trimmed.toLowerCase() === "generic" ||
    trimmed.toLowerCase() === "genel-isletme"
  ) {
    return {
      pack: genericBusinessIndustryPack,
      isFallback: false,
      resolvedBy: "exact",
    };
  }

  // 2. Safe Fallback to platform-owned generic business pack
  return {
    pack: genericBusinessIndustryPack,
    isFallback: true,
    resolvedBy: "fallback",
  };
}

/**
 * Returns list of selectable industry options for onboarding UI
 */
export function listOnboardingIndustries() {
  const canonicalSummaries = ALL_INDUSTRY_PACKS.map(toIndustryPackSummary);
  const genericSummary = toIndustryPackSummary(genericBusinessIndustryPack);

  return [...canonicalSummaries, genericSummary];
}
