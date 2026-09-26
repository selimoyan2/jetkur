/**
 * JetKur Industry Pack Resolver (Sprint 05)
 *
 * Deterministic resolution from user/wizard input to canonical IndustryPack:
 * - Exact slug matching
 * - Turkish-aware normalized alias matching
 * - Ambiguous match detection
 * - Graceful NOT_FOUND handling for unknown sectors
 */

import { IndustryPack, ResolveIndustryPackResult } from "./types";
import { ALL_INDUSTRY_PACKS, CANONICAL_INDUSTRY_PACKS } from "./catalog";
import { normalizeTurkishText, normalizeSlug } from "./normalization";

/**
 * Legacy slug compatibility aliases (e.g. Sprint 01/02 fixtures)
 */
const LEGACY_SLUG_MAP: Record<string, string> = {
  plumbing: "sihhi-tesisat",
  "car-recovery": "oto-kurtarma",
  dentist: "dis-hekimligi",
  lawyer: "hukuk-avukat",
  "carpet-cleaning": "hali-yikama",
  moving: "evden-eve-nakliyat",
  hvac: "kombi-klima-servisi",
};

/**
 * Retrieves an IndustryPack by exact or normalized slug
 */
export function getIndustryPackBySlug(slug: string): IndustryPack | undefined {
  if (!slug || typeof slug !== "string") return undefined;

  const direct = CANONICAL_INDUSTRY_PACKS[slug];
  if (direct) return direct;

  const normalized = normalizeSlug(slug);
  if (CANONICAL_INDUSTRY_PACKS[normalized]) {
    return CANONICAL_INDUSTRY_PACKS[normalized];
  }

  // Check legacy compatibility
  const canonicalSlug = LEGACY_SLUG_MAP[normalized] || LEGACY_SLUG_MAP[slug];
  if (canonicalSlug && CANONICAL_INDUSTRY_PACKS[canonicalSlug]) {
    return CANONICAL_INDUSTRY_PACKS[canonicalSlug];
  }

  return undefined;
}

/**
 * Finds an IndustryPack by searching its aliases
 */
export function findIndustryPackByAlias(alias: string): IndustryPack | undefined {
  if (!alias || typeof alias !== "string") return undefined;

  const normInput = normalizeTurkishText(alias);
  if (!normInput) return undefined;

  for (const pack of ALL_INDUSTRY_PACKS) {
    if (pack.status === "ARCHIVED") continue;

    for (const item of pack.aliases) {
      if (normalizeTurkishText(item) === normInput) {
        return pack;
      }
    }
  }

  return undefined;
}

/**
 * Lists all active Industry Packs available for customer onboarding
 */
export function listActiveIndustryPacks(): IndustryPack[] {
  return ALL_INDUSTRY_PACKS.filter((p) => p.status === "ACTIVE" || !p.status);
}

/**
 * Searches industry packs by keyword query
 */
export function searchIndustryPacks(query: string): IndustryPack[] {
  if (!query || typeof query !== "string") return [];

  const normQuery = normalizeTurkishText(query);
  if (!normQuery) return [];

  const matched = new Set<IndustryPack>();

  for (const pack of ALL_INDUSTRY_PACKS) {
    if (pack.status === "ARCHIVED") continue;

    const normName = normalizeTurkishText(pack.name);
    const normSlug = normalizeTurkishText(pack.slug);

    if (normSlug.includes(normQuery) || normName.includes(normQuery)) {
      matched.add(pack);
      continue;
    }

    for (const alias of pack.aliases) {
      if (normalizeTurkishText(alias).includes(normQuery)) {
        matched.add(pack);
        break;
      }
    }
  }

  return Array.from(matched);
}

/**
 * Resolves an arbitrary user input string to a canonical IndustryPack with comprehensive status typing
 */
export function resolveIndustryPack(input: string): ResolveIndustryPackResult {
  if (!input || typeof input !== "string" || !input.trim()) {
    return { status: "NOT_FOUND" };
  }

  const trimmed = input.trim();
  const normalized = normalizeTurkishText(trimmed);

  // 1. Exact slug match
  const bySlug = getIndustryPackBySlug(trimmed);
  if (bySlug && (bySlug.status === "ACTIVE" || !bySlug.status)) {
    return {
      status: "EXACT_MATCH",
      pack: bySlug,
      matchedBy: "slug",
      matchedTerm: trimmed,
    };
  }

  // 2. Normalized display name match
  for (const pack of ALL_INDUSTRY_PACKS) {
    if (pack.status === "ARCHIVED") continue;

    if (normalizeTurkishText(pack.name) === normalized) {
      return {
        status: "EXACT_MATCH",
        pack,
        matchedBy: "name",
        matchedTerm: pack.name,
      };
    }
  }

  // 3. Exact normalized alias matches
  const aliasCandidates: IndustryPack[] = [];

  for (const pack of ALL_INDUSTRY_PACKS) {
    if (pack.status === "ARCHIVED") continue;

    for (const alias of pack.aliases) {
      if (normalizeTurkishText(alias) === normalized) {
        if (!aliasCandidates.includes(pack)) {
          aliasCandidates.push(pack);
        }
        break;
      }
    }
  }

  if (aliasCandidates.length === 1) {
    return {
      status: "ALIAS_MATCH",
      pack: aliasCandidates[0],
      matchedBy: "alias",
      matchedTerm: trimmed,
    };
  }

  if (aliasCandidates.length > 1) {
    return {
      status: "AMBIGUOUS",
      candidates: aliasCandidates,
    };
  }

  // 4. Substring / partial alias containment search
  const partialCandidates = searchIndustryPacks(trimmed);

  if (partialCandidates.length === 1) {
    return {
      status: "ALIAS_MATCH",
      pack: partialCandidates[0],
      matchedBy: "alias",
      matchedTerm: trimmed,
    };
  }

  if (partialCandidates.length > 1) {
    return {
      status: "AMBIGUOUS",
      candidates: partialCandidates,
    };
  }

  // 5. Unknown industry
  return {
    status: "NOT_FOUND",
  };
}
