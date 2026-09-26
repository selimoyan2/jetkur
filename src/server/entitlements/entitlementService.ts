/**
 * JetKur Server-Authoritative Entitlement & Subscription Service (Sprint 04)
 * 
 * Enforces:
 * 1. Plan resolution (ENTRY, BUSINESS, AGENCY)
 * 2. 14-day server-authoritative trial with automatic expiration check
 * 3. Server-enforced site limits (ENTRY: 1, BUSINESS: 3, AGENCY: 10)
 * 4. Archived site policy (ARCHIVED sites do not count towards site limit)
 * 5. Expired subscription policy (Read-only dashboard access; publish/mutations blocked; data never deleted)
 * 6. Centralized capability evaluation: can(featureKey)
 */

import { prisma } from "../db/client";
import {
  CanonicalPlanCode,
  EffectiveSubscription,
  EntitlementSnapshot,
  SiteCreationAllowanceResult,
  SubscriptionStatus,
  WorkspaceUsage,
} from "../../domain/entitlements/types";
import {
  ENTITLEMENT_KEYS,
  LIMIT_KEYS,
} from "../../domain/entitlements/registry";
import {
  CANONICAL_PLAN_CODES,
  CANONICAL_PLANS,
  DEFAULT_TRIAL_PLAN_CODE,
  TRIAL_DAYS_DEFAULT,
} from "./planDefinitions";

export class EntitlementError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 403, code = "FORBIDDEN_ENTITLEMENT") {
    super(message);
    this.name = "EntitlementError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class EntitlementService {
  /**
   * Resolves effective subscription for workspace.
   * Resilient to background cron delays by checking trialEndsAt <= serverNow dynamically.
   */
  async getEffectiveSubscription(
    workspaceId: string,
    customNow?: Date
  ): Promise<EffectiveSubscription> {
    const now = customNow || new Date();

    // Query database subscription with plan
    let dbSub: any = null;
    try {
      dbSub = await prisma.subscription.findFirst({
        where: { workspaceId },
        include: {
          plan: {
            include: {
              entitlements: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Database offline or query error, dbSub remains null
    }

    if (!dbSub) {
      // Fallback for new/unseeded workspace: default BUSINESS 14-day trial
      const defaultPlan = CANONICAL_PLANS[DEFAULT_TRIAL_PLAN_CODE];
      const trialStartsAt = new Date(now);
      const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS_DEFAULT * 24 * 60 * 60 * 1000);

      return {
        id: `mock-sub-${workspaceId}`,
        workspaceId,
        planId: `plan-${DEFAULT_TRIAL_PLAN_CODE.toLowerCase()}`,
        planCode: DEFAULT_TRIAL_PLAN_CODE,
        planName: defaultPlan.name,
        status: "TRIALING",
        effectiveStatus: "TRIALING",
        isTrial: true,
        trialStartsAt,
        trialEndsAt,
        trialDaysRemaining: TRIAL_DAYS_DEFAULT,
        isExpired: false,
        isReadOnly: false,
        siteLimit: defaultPlan.siteLimit,
      };
    }

    const planCode = dbSub.plan?.code || DEFAULT_TRIAL_PLAN_CODE;
    const planName = dbSub.plan?.name || CANONICAL_PLANS[planCode]?.name || "JetKur Planı";
    const siteLimit = dbSub.plan?.siteLimit || CANONICAL_PLANS[planCode]?.siteLimit || 1;

    let effectiveStatus: SubscriptionStatus = dbSub.status;
    let isExpired = false;
    let trialDaysRemaining = 0;

    if (dbSub.status === "TRIALING") {
      const endsAt = dbSub.trialEndsAt ? new Date(dbSub.trialEndsAt) : null;
      if (endsAt && endsAt.getTime() <= now.getTime()) {
        effectiveStatus = "EXPIRED";
        isExpired = true;
        trialDaysRemaining = 0;
      } else if (endsAt) {
        effectiveStatus = "TRIALING";
        isExpired = false;
        const diffMs = endsAt.getTime() - now.getTime();
        trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      } else {
        effectiveStatus = "TRIALING";
        isExpired = false;
        trialDaysRemaining = TRIAL_DAYS_DEFAULT;
      }
    } else if (dbSub.status === "EXPIRED" || dbSub.status === "CANCELED") {
      effectiveStatus = dbSub.status;
      isExpired = true;
      trialDaysRemaining = 0;
    } else if (dbSub.status === "ACTIVE") {
      effectiveStatus = "ACTIVE";
      isExpired = false;
      trialDaysRemaining = 0;
    }

    const isReadOnly = isExpired || effectiveStatus === "EXPIRED" || effectiveStatus === "CANCELED";

    return {
      id: dbSub.id,
      workspaceId,
      planId: dbSub.planId,
      planCode,
      planName,
      status: dbSub.status,
      effectiveStatus,
      isTrial: dbSub.status === "TRIALING",
      trialStartsAt: dbSub.trialStartsAt ? new Date(dbSub.trialStartsAt) : null,
      trialEndsAt: dbSub.trialEndsAt ? new Date(dbSub.trialEndsAt) : null,
      trialDaysRemaining,
      isExpired,
      isReadOnly,
      siteLimit,
    };
  }

  /**
   * Retrieves workspace site usage count based on the Archived Site Policy:
   * DRAFT, TRIAL, ACTIVE, SUSPENDED = COUNTED
   * ARCHIVED = NOT COUNTED
   */
  async getWorkspaceUsage(workspaceId: string, customNow?: Date): Promise<WorkspaceUsage> {
    const sub = await this.getEffectiveSubscription(workspaceId, customNow);

    let activeSites = 0;
    let archivedSites = 0;

    try {
      const sites = await prisma.site.findMany({
        where: { workspaceId },
        select: { status: true },
      });

      for (const site of sites) {
        if (site.status === "ARCHIVED") {
          archivedSites++;
        } else {
          activeSites++;
        }
      }
    } catch {
      // If DB offline, usage defaults to 0
    }

    const totalSites = activeSites + archivedSites;
    const canCreate = !sub.isReadOnly && activeSites < sub.siteLimit;

    return {
      activeSites,
      archivedSites,
      totalSites,
      siteLimit: sub.siteLimit,
      canCreateSite: canCreate,
    };
  }

  /**
   * Checks whether workspace can create a new site under current plan and limits
   */
  async canCreateSite(
    workspaceId: string,
    customNow?: Date
  ): Promise<SiteCreationAllowanceResult> {
    const sub = await this.getEffectiveSubscription(workspaceId, customNow);
    const usage = await this.getWorkspaceUsage(workspaceId, customNow);

    if (sub.isReadOnly || sub.effectiveStatus === "EXPIRED") {
      return {
        allowed: false,
        reason: "SUBSCRIPTION_EXPIRED",
        used: usage.activeSites,
        limit: sub.siteLimit,
      };
    }

    if (usage.activeSites >= sub.siteLimit) {
      return {
        allowed: false,
        reason: "SITE_LIMIT_REACHED",
        used: usage.activeSites,
        limit: sub.siteLimit,
      };
    }

    return {
      allowed: true,
      used: usage.activeSites,
      limit: sub.siteLimit,
    };
  }

  /**
   * Builds full workspace entitlement snapshot for UI and server guards
   */
  async getWorkspaceEntitlements(
    workspaceId: string,
    options?: { now?: Date; bypassSuperAdmin?: boolean }
  ): Promise<EntitlementSnapshot> {
    const effectiveSub = await this.getEffectiveSubscription(workspaceId, options?.now);
    const usage = await this.getWorkspaceUsage(workspaceId, options?.now);

    const canonicalDef = CANONICAL_PLANS[effectiveSub.planCode] || CANONICAL_PLANS[DEFAULT_TRIAL_PLAN_CODE];
    const features: Record<string, boolean> = { ...canonicalDef.features };
    const limits: Record<string, number> = {
      ...canonicalDef.limits,
      [LIMIT_KEYS.MAX_SITES]: effectiveSub.siteLimit,
    };

    // Apply workspace specific overrides if present in DB
    if (!effectiveSub.id.startsWith("mock-sub-") && !effectiveSub.id.startsWith("sub-")) {
      try {
        const overrides = await prisma.workspaceEntitlementOverride.findMany({
          where: {
            workspaceId,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: options?.now || new Date() } },
            ],
          },
        });

        for (const override of overrides) {
          if (override.enabled !== null) {
            features[override.featureKey] = override.enabled;
          }
          if (override.limitValue !== null) {
            limits[override.featureKey] = override.limitValue;
          }
        }
      } catch {
        // Ignore if database offline or table not created
      }
    }

    // Super Admin platform authority bypass (Section 24)
    if (options?.bypassSuperAdmin) {
      for (const key of Object.keys(features)) {
        features[key] = true;
      }
      limits[LIMIT_KEYS.MAX_SITES] = 999;
      limits[LIMIT_KEYS.MAX_LANGUAGES] = 50;
      limits[LIMIT_KEYS.MAX_TEAM_MEMBERS] = 100;

      return {
        plan: {
          code: effectiveSub.planCode,
          name: `${effectiveSub.planName} (Platform Super Admin)`,
          description: "Super Admin yetkisiyle tüm özellikler ve sınırsız limitler aktif",
          status: "ACTIVE",
        },
        subscription: {
          id: effectiveSub.id,
          status: "ACTIVE",
          effectiveStatus: "ACTIVE",
          isTrial: false,
          trialStartsAt: effectiveSub.trialStartsAt?.toISOString() || null,
          trialEndsAt: effectiveSub.trialEndsAt?.toISOString() || null,
          trialDaysRemaining: 999,
          isExpired: false,
          isReadOnly: false,
        },
        limits: {
          sites: {
            used: usage.activeSites,
            max: 999,
            remaining: 999 - usage.activeSites,
            canCreate: true,
          },
          languages: {
            max: 50,
          },
          teamMembers: {
            max: 100,
          },
        },
        features,
      };
    }

    // Expired Subscription Policy (Section 37):
    // Read-only dashboard access: site data is preserved and readable,
    // but publish, new site creation, and premium mutations are blocked.
    if (effectiveSub.isReadOnly) {
      features[ENTITLEMENT_KEYS.SITE_VIEW] = true; // Still allow viewing
      features[ENTITLEMENT_KEYS.SITE_PUBLISH] = false;
      features[ENTITLEMENT_KEYS.SITE_CREATE] = false;
      features[ENTITLEMENT_KEYS.SITE_EDIT] = false;
      features[ENTITLEMENT_KEYS.SITE_BLOG] = false;
      features[ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN] = false;
      features[ENTITLEMENT_KEYS.MARKETING_AB_TESTING] = false;
      features[ENTITLEMENT_KEYS.AGENCY_MULTI_SITE] = false;
    }

    const sitesRemaining = Math.max(0, effectiveSub.siteLimit - usage.activeSites);
    const canCreate = !effectiveSub.isReadOnly && usage.activeSites < effectiveSub.siteLimit;

    return {
      plan: {
        code: effectiveSub.planCode,
        name: effectiveSub.planName,
        description: canonicalDef.description,
        status: "ACTIVE",
      },
      subscription: {
        id: effectiveSub.id,
        status: effectiveSub.status,
        effectiveStatus: effectiveSub.effectiveStatus,
        isTrial: effectiveSub.isTrial,
        trialStartsAt: effectiveSub.trialStartsAt?.toISOString() || null,
        trialEndsAt: effectiveSub.trialEndsAt?.toISOString() || null,
        trialDaysRemaining: effectiveSub.trialDaysRemaining,
        isExpired: effectiveSub.isExpired,
        isReadOnly: effectiveSub.isReadOnly,
      },
      limits: {
        sites: {
          used: usage.activeSites,
          max: effectiveSub.siteLimit,
          remaining: sitesRemaining,
          canCreate,
        },
        languages: {
          max: limits[LIMIT_KEYS.MAX_LANGUAGES] || 1,
        },
        teamMembers: {
          max: limits[LIMIT_KEYS.MAX_TEAM_MEMBERS] || 1,
        },
      },
      features,
    };
  }

  /**
   * Checks a specific boolean capability
   */
  async hasEntitlement(
    workspaceId: string,
    featureKey: string,
    options?: { now?: Date; bypassSuperAdmin?: boolean }
  ): Promise<boolean> {
    const snapshot = await this.getWorkspaceEntitlements(workspaceId, options);
    return Boolean(snapshot.features[featureKey]);
  }

  /**
   * Retrieves a numeric limit
   */
  async getEntitlementLimit(
    workspaceId: string,
    limitKey: string,
    options?: { now?: Date }
  ): Promise<number | null> {
    const snapshot = await this.getWorkspaceEntitlements(workspaceId, options);
    if (limitKey === LIMIT_KEYS.MAX_SITES) {
      return snapshot.limits.sites.max;
    }
    if (limitKey === LIMIT_KEYS.MAX_LANGUAGES) {
      return snapshot.limits.languages.max;
    }
    if (limitKey === LIMIT_KEYS.MAX_TEAM_MEMBERS) {
      return snapshot.limits.teamMembers.max;
    }
    return snapshot.limits[limitKey] ?? null;
  }

  /**
   * Asserts that a workspace possesses a required feature entitlement; throws if not.
   */
  async assertEntitlement(
    workspaceId: string,
    featureKey: string,
    options?: { now?: Date; bypassSuperAdmin?: boolean }
  ): Promise<void> {
    const has = await this.hasEntitlement(workspaceId, featureKey, options);
    if (!has) {
      const snapshot = await this.getWorkspaceEntitlements(workspaceId, options);
      if (snapshot.subscription.isExpired) {
        throw new EntitlementError(
          "Deneme süreniz veya aboneliğiniz sona ermiştir. Bu işlem için aboneliğinizi yenileyiniz.",
          403,
          "SUBSCRIPTION_EXPIRED"
        );
      }
      throw new EntitlementError(
        `Bu işlem için gereken yetkiye ('${featureKey}') sahip değilsiniz. Lütfen paketinizi yükseltiniz.`,
        403,
        "FEATURE_NOT_ENTITLED"
      );
    }
  }

  /**
   * Transactional helper: creates initial trial subscription for a newly registered workspace
   */
  async createInitialTrialSubscription(
    workspaceId: string,
    planCode: string = DEFAULT_TRIAL_PLAN_CODE,
    customTrialDays: number = TRIAL_DAYS_DEFAULT,
    txClient?: any
  ) {
    const client = txClient || prisma;
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + customTrialDays * 24 * 60 * 60 * 1000);

    // Find or create Plan record in database
    let plan = await client.plan.findUnique({
      where: { code: planCode },
    });

    if (!plan) {
      const planDef = CANONICAL_PLANS[planCode] || CANONICAL_PLANS[DEFAULT_TRIAL_PLAN_CODE];
      plan = await client.plan.create({
        data: {
          code: planDef.code,
          name: planDef.name,
          description: planDef.description,
          siteLimit: planDef.siteLimit,
          trialDays: planDef.trialDays,
          monthlyPrice: planDef.monthlyPrice,
          currency: planDef.currency,
          status: "ACTIVE",
          entitlements: {
            create: Object.entries(planDef.features).map(([key, enabled]) => ({
              featureKey: key,
              enabled,
              limitValue: planDef.limits[key] || null,
            })),
          },
        },
      });
    }

    return client.subscription.create({
      data: {
        workspaceId,
        planId: plan.id,
        status: "TRIALING",
        trialStartsAt: now,
        trialEndsAt,
        currentPeriodStartsAt: now,
        currentPeriodEndsAt: trialEndsAt,
      },
    });
  }
}

export const entitlementService = new EntitlementService();
