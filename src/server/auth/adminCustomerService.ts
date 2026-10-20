import { prisma } from "../db/client";
import { entitlementService } from "../entitlements/entitlementService";
import { siteRepository } from "../db/siteRepository";

export interface CanonicalCustomerSiteSummary {
  id: string;
  workspaceId: string;
  name: string;
  companyName: string;
  slug: string;
  primaryDomain: string;
  sector: string;
  structureMode: string;
  status: string;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalCustomerWorkspaceSummary {
  id: string;
  name: string;
  type: "BUSINESS" | "AGENCY" | "PLATFORM";
  memberRole: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  subscription: {
    id: string;
    planCode: string;
    planName: string;
    status: string;
    effectiveStatus: string;
    isTrial: boolean;
    trialStartsAt: string | null;
    trialEndsAt: string | null;
    trialDaysRemaining: number;
    currentPeriodEndsAt: string | null;
    isExpired: boolean;
    isReadOnly: boolean;
    siteLimit: number;
    activeSitesCount: number;
  };
  sites: CanonicalCustomerSiteSummary[];
}

export interface CanonicalCustomerAccountDetails {
  userId: string;
  customerName: string;
  registrationEmail: string;
  phone: string | null;
  platformRole: "NORMAL" | "SUPER_ADMIN";
  accountStatus: "ACTIVE" | "INVITED" | "SUSPENDED";
  accountCreatedAt: string;
  lastLoginAt: string | null;
  emailVerifiedAt: string | null;
  subscriptionStatus: string;
  planName: string;
  planCode: string;
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  isTrial: boolean;
  isExpired: boolean;
  totalWorkspaces: number;
  totalSites: number;
  workspaces: CanonicalCustomerWorkspaceSummary[];
  sites: CanonicalCustomerSiteSummary[];
}

const FORBIDDEN_SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "tokenHash",
  "sessionToken",
  "rawToken",
]);

/**
 * Strips any sensitive authentication/session fields recursively as a defense-in-depth measure.
 */
export function sanitizeCustomerAccountPayload<T>(payload: T): T {
  if (!payload || typeof payload !== "object") {
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeCustomerAccountPayload(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload as Record<string, any>)) {
    if (FORBIDDEN_SENSITIVE_KEYS.has(key)) {
      continue;
    }
    if (value && typeof value === "object" && !(value instanceof Date)) {
      clean[key] = sanitizeCustomerAccountPayload(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}

export class AdminCustomerService {
  /**
   * Lists all canonical customer accounts with their workspaces, subscriptions, and sites.
   * Uses explicit Prisma field selection so passwordHash and session tokens are never read.
   */
  async listCustomerAccounts(): Promise<CanonicalCustomerAccountDetails[]> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          platformRole: true,
          status: true,
          lastLoginAt: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          memberships: {
            select: {
              id: true,
              role: true,
              createdAt: true,
              workspace: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  createdAt: true,
                  subscriptions: {
                    include: {
                      plan: true,
                    },
                    orderBy: { createdAt: "desc" },
                  },
                  sites: {
                    include: {
                      businessProfile: true,
                      settings: true,
                      domains: true,
                    },
                    orderBy: { createdAt: "desc" },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const accounts: CanonicalCustomerAccountDetails[] = [];
      for (const user of users) {
        const mapped = await this.mapUserToCustomerAccountDetails(user);
        accounts.push(mapped);
      }

      return sanitizeCustomerAccountPayload(accounts);
    } catch {
      // Database offline or unavailable in preview environment: return empty array gracefully
      return [];
    }
  }

  /**
   * Resolves a single customer account by userId, email, workspaceId, or siteId.
   */
  async getCustomerAccountByIdentifier(
    identifier: string
  ): Promise<CanonicalCustomerAccountDetails | null> {
    if (!identifier || !identifier.trim()) {
      return null;
    }

    const cleanId = identifier.trim();
    const normalizedEmail = cleanId.toLowerCase();

    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { email: normalizedEmail },
            {
              memberships: {
                some: {
                  OR: [
                    { workspaceId: cleanId },
                    {
                      workspace: {
                        sites: {
                          some: {
                            OR: [{ id: cleanId }, { slug: cleanId }],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          platformRole: true,
          status: true,
          lastLoginAt: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          memberships: {
            select: {
              id: true,
              role: true,
              createdAt: true,
              workspace: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  createdAt: true,
                  subscriptions: {
                    include: {
                      plan: true,
                    },
                    orderBy: { createdAt: "desc" },
                  },
                  sites: {
                    include: {
                      businessProfile: true,
                      settings: true,
                      domains: true,
                    },
                    orderBy: { createdAt: "desc" },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const details = await this.mapUserToCustomerAccountDetails(user);
      return sanitizeCustomerAccountPayload(details);
    } catch {
      return null;
    }
  }

  private async mapUserToCustomerAccountDetails(
    user: any
  ): Promise<CanonicalCustomerAccountDetails> {
    const workspaces: CanonicalCustomerWorkspaceSummary[] = [];
    const allSites: CanonicalCustomerSiteSummary[] = [];
    let primaryPhone: string | null = null;

    for (const membership of user.memberships || []) {
      const ws = membership.workspace;
      if (!ws) continue;

      const effectiveSub = await entitlementService.getEffectiveSubscription(ws.id);
      const rawSub = ws.subscriptions?.[0] || null;

      // Map sites from DB or in-memory repository
      const dbSites = Array.isArray(ws.sites) ? ws.sites : [];
      const mappedSites: CanonicalCustomerSiteSummary[] = dbSites.map((s: any) => {
        const bp = s.businessProfile;
        if (!primaryPhone && (bp?.phone || bp?.whatsapp)) {
          primaryPhone = bp.phone || bp.whatsapp;
        }
        const primaryDomObj =
          s.domains?.find((d: any) => d.isPrimary) || s.domains?.[0] || null;
        const primaryDomain =
          primaryDomObj?.hostname || `${s.slug || s.id}.jetkur.app`;

        return {
          id: s.id,
          workspaceId: ws.id,
          name: s.name,
          companyName: bp?.companyName || s.name,
          slug: s.slug,
          primaryDomain,
          sector: bp?.sector || "Genel Kurumsal",
          structureMode: s.settings?.structureMode || "single-page",
          status: s.status,
          trialEndsAt: s.trialEndsAt ? new Date(s.trialEndsAt).toISOString() : null,
          createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
        };
      });

      if (mappedSites.length === 0) {
        const memSites = await siteRepository.listSitesByWorkspace(ws.id);
        for (const ms of memSites) {
          const phoneCandidate =
            ms.businessProfile?.contact?.phone || ms.businessProfile?.contact?.whatsapp;
          if (!primaryPhone && phoneCandidate) {
            primaryPhone = phoneCandidate;
          }
          mappedSites.push({
            id: ms.id,
            workspaceId: ws.id,
            name: ms.businessProfile?.identity?.companyName || ms.id,
            companyName: ms.businessProfile?.identity?.companyName || ms.id,
            slug: ms.id,
            primaryDomain: ms.settings?.domain?.hostname || `${ms.id}.jetkur.app`,
            sector: ms.businessProfile?.identity?.sector || "Genel Kurumsal",
            structureMode: ms.settings?.structureMode || "single-page",
            status: String(ms.status || "ACTIVE").toUpperCase(),
            trialEndsAt: null,
            createdAt: ms.createdAt || new Date().toISOString(),
            updatedAt: ms.updatedAt || new Date().toISOString(),
          });
        }
      }

      const activeSitesCount = mappedSites.filter((s) => s.status !== "ARCHIVED").length;

      workspaces.push({
        id: ws.id,
        name: ws.name,
        type: ws.type,
        memberRole: membership.role,
        createdAt: ws.createdAt ? new Date(ws.createdAt).toISOString() : new Date().toISOString(),
        subscription: {
          id: effectiveSub.id,
          planCode: effectiveSub.planCode,
          planName: effectiveSub.planName,
          status: effectiveSub.status,
          effectiveStatus: effectiveSub.effectiveStatus,
          isTrial: effectiveSub.isTrial,
          trialStartsAt: effectiveSub.trialStartsAt
            ? effectiveSub.trialStartsAt.toISOString()
            : null,
          trialEndsAt: effectiveSub.trialEndsAt
            ? effectiveSub.trialEndsAt.toISOString()
            : null,
          trialDaysRemaining: effectiveSub.trialDaysRemaining,
          currentPeriodEndsAt: rawSub?.currentPeriodEndsAt
            ? new Date(rawSub.currentPeriodEndsAt).toISOString()
            : effectiveSub.trialEndsAt
            ? effectiveSub.trialEndsAt.toISOString()
            : null,
          isExpired: effectiveSub.isExpired,
          isReadOnly: effectiveSub.isReadOnly,
          siteLimit: effectiveSub.siteLimit,
          activeSitesCount,
        },
        sites: mappedSites,
      });

      allSites.push(...mappedSites);
    }

    const primaryWs =
      workspaces.find((w) => w.memberRole === "OWNER") || workspaces[0] || null;

    return {
      userId: user.id,
      customerName: user.name,
      registrationEmail: user.email,
      phone: primaryPhone,
      platformRole: user.platformRole,
      accountStatus: user.status,
      accountCreatedAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString(),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
      emailVerifiedAt: user.emailVerifiedAt
        ? new Date(user.emailVerifiedAt).toISOString()
        : null,
      subscriptionStatus: primaryWs?.subscription.effectiveStatus || "TRIALING",
      planName: primaryWs?.subscription.planName || "İşletme",
      planCode: primaryWs?.subscription.planCode || "BUSINESS",
      trialEndsAt: primaryWs?.subscription.trialEndsAt || null,
      trialDaysRemaining: primaryWs?.subscription.trialDaysRemaining ?? 14,
      isTrial: primaryWs?.subscription.isTrial ?? true,
      isExpired: primaryWs?.subscription.isExpired ?? false,
      totalWorkspaces: workspaces.length,
      totalSites: allSites.length,
      workspaces,
      sites: allSites,
    };
  }
}

export const adminCustomerService = new AdminCustomerService();
export default adminCustomerService;
