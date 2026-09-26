/**
 * JetKur Canonical Industry Pack Domain Types (Sprint 05)
 *
 * Core Equation:
 * SITE = BUSINESS PROFILE + INDUSTRY PACK + SITE CONTENT + DESIGN TEMPLATE + SECTION CONFIGURATION + SITE SETTINGS
 *
 * Invariant:
 * IndustryPack is PLATFORM OWNED.
 * SiteContent is CUSTOMER OWNED.
 */

import {
  IndustryPack,
  IndustryCategory,
  IndustryStarterService,
  IndustryStarterFaq,
  IndustryContentDefaults,
  IndustryImageIntent,
  IndustrySeoDefaults,
  IndustrySectionRecommendation,
  IndustrySchemaHints,
} from "../site/industryPack";

export type {
  IndustryPack,
  IndustryCategory,
  IndustryStarterService,
  IndustryStarterFaq,
  IndustryContentDefaults,
  IndustryImageIntent,
  IndustrySeoDefaults,
  IndustrySectionRecommendation,
  IndustrySchemaHints,
};

export type IndustryPackStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export interface ResolveIndustryPackResult {
  status: "EXACT_MATCH" | "ALIAS_MATCH" | "AMBIGUOUS" | "NOT_FOUND";
  pack?: IndustryPack;
  matchedBy?: "slug" | "name" | "alias";
  matchedTerm?: string;
  candidates?: IndustryPack[];
}

export interface IndustryPackSummary {
  id: string;
  slug: string;
  name: string;
  category: IndustryCategory;
  version: string;
  status: IndustryPackStatus;
  description?: string;
  serviceCount: number;
  faqCount: number;
  aliases: string[];
}
