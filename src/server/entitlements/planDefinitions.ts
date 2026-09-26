/**
 * JetKur Canonical Plan Definitions & Seed Configurations (Sprint 04)
 * 
 * Machine Codes: ENTRY, BUSINESS, AGENCY
 * Display Names: "Başlangıç", "İşletme", "Ajans"
 * Default Trial Plan: BUSINESS (14 days)
 */

import { ENTITLEMENT_KEYS, LIMIT_KEYS } from "../../domain/entitlements/registry";

export const TRIAL_DAYS_DEFAULT = 14;

export const CANONICAL_PLAN_CODES = {
  ENTRY: "ENTRY",
  BUSINESS: "BUSINESS",
  AGENCY: "AGENCY",
} as const;

export const DEFAULT_TRIAL_PLAN_CODE = CANONICAL_PLAN_CODES.BUSINESS;

export interface CanonicalPlanDefinition {
  code: string;
  name: string;
  description: string;
  siteLimit: number;
  trialDays: number;
  monthlyPrice: number; // in kuruş (e.g. 29900 = 299 TL)
  currency: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export const CANONICAL_PLANS: Record<string, CanonicalPlanDefinition> = {
  [CANONICAL_PLAN_CODES.ENTRY]: {
    code: CANONICAL_PLAN_CODES.ENTRY,
    name: "Başlangıç",
    description: "Tek siteyle dijital varlığını hızlı ve zahmetsizce kurmak isteyen yerel esnaf ve KOBİ'ler için",
    siteLimit: 1,
    trialDays: TRIAL_DAYS_DEFAULT,
    monthlyPrice: 29900,
    currency: "TRY",
    features: {
      // Core Access
      [ENTITLEMENT_KEYS.SITE_VIEW]: true,
      [ENTITLEMENT_KEYS.SITE_CREATE]: true,
      [ENTITLEMENT_KEYS.SITE_EDIT]: true,
      [ENTITLEMENT_KEYS.SITE_PUBLISH]: true,
      [ENTITLEMENT_KEYS.SITE_FAQ]: true,
      [ENTITLEMENT_KEYS.SITE_GALLERY]: true,
      [ENTITLEMENT_KEYS.FORMS_BASIC]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: true,
      [ENTITLEMENT_KEYS.SEO_BASIC]: true,
      [ENTITLEMENT_KEYS.MARKETING_QR]: true,

      // Standard & Pro features (disabled in Entry)
      [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: false,
      [ENTITLEMENT_KEYS.SITE_BLOG]: false,
      [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: false,
      [ENTITLEMENT_KEYS.FORMS_ADVANCED]: false,
      [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: false,
      [ENTITLEMENT_KEYS.SEO_ADVANCED]: false,
      [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: false,
      [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: false,

      // Agency features (disabled in Entry)
      [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: false,
      [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: false,
      [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: false,
      [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: false,
      [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: false,
    },
    limits: {
      [LIMIT_KEYS.MAX_SITES]: 1,
      [LIMIT_KEYS.MAX_LANGUAGES]: 1,
      [LIMIT_KEYS.MAX_TEAM_MEMBERS]: 1,
    },
  },

  [CANONICAL_PLAN_CODES.BUSINESS]: {
    code: CANONICAL_PLAN_CODES.BUSINESS,
    name: "İşletme",
    description: "Kendi alan adını bağlamak, blog yayınlamak ve birden fazla lokasyonu yönetmek isteyen büyüyen işletmeler için",
    siteLimit: 3,
    trialDays: TRIAL_DAYS_DEFAULT,
    monthlyPrice: 69900,
    currency: "TRY",
    features: {
      // All Entry Features
      [ENTITLEMENT_KEYS.SITE_VIEW]: true,
      [ENTITLEMENT_KEYS.SITE_CREATE]: true,
      [ENTITLEMENT_KEYS.SITE_EDIT]: true,
      [ENTITLEMENT_KEYS.SITE_PUBLISH]: true,
      [ENTITLEMENT_KEYS.SITE_FAQ]: true,
      [ENTITLEMENT_KEYS.SITE_GALLERY]: true,
      [ENTITLEMENT_KEYS.FORMS_BASIC]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: true,
      [ENTITLEMENT_KEYS.SEO_BASIC]: true,
      [ENTITLEMENT_KEYS.MARKETING_QR]: true,

      // Standard & Pro Features (enabled in Business)
      [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: true,
      [ENTITLEMENT_KEYS.SITE_BLOG]: true,
      [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: true,
      [ENTITLEMENT_KEYS.FORMS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.SEO_ADVANCED]: true,
      [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: true,
      [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: true,

      // Agency Features (disabled in Business)
      [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: false,
      [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: false,
      [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: false,
      [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: false,
      [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: false,
    },
    limits: {
      [LIMIT_KEYS.MAX_SITES]: 3,
      [LIMIT_KEYS.MAX_LANGUAGES]: 3,
      [LIMIT_KEYS.MAX_TEAM_MEMBERS]: 3,
    },
  },

  [CANONICAL_PLAN_CODES.AGENCY]: {
    code: CANONICAL_PLAN_CODES.AGENCY,
    name: "Ajans",
    description: "Müşterilerine anahtar teslim web sitesi ve SEO yönetimi sunan dijital ajanslar ve profesyoneller için",
    siteLimit: 10,
    trialDays: TRIAL_DAYS_DEFAULT,
    monthlyPrice: 199900,
    currency: "TRY",
    features: {
      // All Business Features
      [ENTITLEMENT_KEYS.SITE_VIEW]: true,
      [ENTITLEMENT_KEYS.SITE_CREATE]: true,
      [ENTITLEMENT_KEYS.SITE_EDIT]: true,
      [ENTITLEMENT_KEYS.SITE_PUBLISH]: true,
      [ENTITLEMENT_KEYS.SITE_FAQ]: true,
      [ENTITLEMENT_KEYS.SITE_GALLERY]: true,
      [ENTITLEMENT_KEYS.FORMS_BASIC]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: true,
      [ENTITLEMENT_KEYS.SEO_BASIC]: true,
      [ENTITLEMENT_KEYS.MARKETING_QR]: true,
      [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: true,
      [ENTITLEMENT_KEYS.SITE_BLOG]: true,
      [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: true,
      [ENTITLEMENT_KEYS.FORMS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.SEO_ADVANCED]: true,
      [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: true,
      [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: true,

      // Agency Features (all enabled)
      [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: true,
      [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: true,
      [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: true,
      [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: true,
      [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: true,
    },
    limits: {
      [LIMIT_KEYS.MAX_SITES]: 10,
      [LIMIT_KEYS.MAX_LANGUAGES]: 10,
      [LIMIT_KEYS.MAX_TEAM_MEMBERS]: 20,
    },
  },
};
