/**
 * JetKur Entitlement & Subscription Domain Types (Sprint 04)
 */

export type CanonicalPlanCode = "ENTRY" | "BUSINESS" | "AGENCY" | (string & {});

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export interface PlanDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  siteLimit: number;
  trialDays: number;
  monthlyPrice?: number | null;
  yearlyPrice?: number | null;
  currency: string;
}

export interface EffectiveSubscription {
  id: string;
  workspaceId: string;
  planId: string;
  planCode: string;
  planName: string;
  status: SubscriptionStatus;
  effectiveStatus: SubscriptionStatus;
  isTrial: boolean;
  trialStartsAt?: Date | null;
  trialEndsAt?: Date | null;
  trialDaysRemaining: number;
  isExpired: boolean;
  isReadOnly: boolean;
  siteLimit: number;
}

export interface WorkspaceUsage {
  activeSites: number;
  archivedSites: number;
  totalSites: number;
  siteLimit: number;
  canCreateSite: boolean;
}

export interface EntitlementSnapshot {
  plan: {
    code: string;
    name: string;
    description?: string | null;
    status: string;
  };
  subscription: {
    id: string;
    status: SubscriptionStatus;
    effectiveStatus: SubscriptionStatus;
    isTrial: boolean;
    trialStartsAt?: string | null;
    trialEndsAt?: string | null;
    trialDaysRemaining: number;
    isExpired: boolean;
    isReadOnly: boolean;
  };
  limits: {
    sites: {
      used: number;
      max: number;
      remaining: number;
      canCreate: boolean;
    };
    languages: {
      max: number;
    };
    teamMembers: {
      max: number;
    };
    [key: string]: any;
  };
  features: Record<string, boolean>;
}

export interface SiteCreationAllowanceResult {
  allowed: boolean;
  reason?: "SITE_LIMIT_REACHED" | "SUBSCRIPTION_EXPIRED" | "WORKSPACE_NOT_FOUND";
  used: number;
  limit: number;
}
