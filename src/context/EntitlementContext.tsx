/**
 * JetKur Client Entitlement & Feature Capability Context (Sprint 04)
 * 
 * Provides UX visibility and feature capability evaluation:
 * const { can, getLimit, subscription, usage } = useEntitlements();
 * if (can("site.blog")) { ... }
 * 
 * Security Principle:
 * Client evaluation is for UX visibility only.
 * Server is ALWAYS authoritative for security and mutations.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { EntitlementSnapshot } from "../domain/entitlements/types";
import { CANONICAL_PLANS, DEFAULT_TRIAL_PLAN_CODE } from "../server/entitlements/planDefinitions";

interface EntitlementContextType {
  can: (featureKey: string) => boolean;
  getLimit: (limitKey: string) => number | null;
  snapshot: EntitlementSnapshot | null;
  plan: EntitlementSnapshot["plan"] | null;
  subscription: EntitlementSnapshot["subscription"] | null;
  usage: {
    used: number;
    max: number;
    remaining: number;
    canCreate: boolean;
  } | null;
  isLoading: boolean;
  refetchEntitlements: () => Promise<void>;
}

const EntitlementContext = createContext<EntitlementContextType | undefined>(undefined);

export const EntitlementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeWorkspaceId, isAuthenticated, user } = useAuth();
  const [snapshot, setSnapshot] = useState<EntitlementSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEntitlements = useCallback(async () => {
    if (!activeWorkspaceId || !isAuthenticated) {
      setSnapshot(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/entitlements`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data: EntitlementSnapshot = await res.json();
        setSnapshot(data);
      } else {
        // Fallback default client snapshot
        const defaultDef = CANONICAL_PLANS[DEFAULT_TRIAL_PLAN_CODE];
        setSnapshot({
          plan: {
            code: DEFAULT_TRIAL_PLAN_CODE,
            name: defaultDef.name,
            description: defaultDef.description,
            status: "ACTIVE",
          },
          subscription: {
            id: `client-sub-${activeWorkspaceId}`,
            status: "TRIALING",
            effectiveStatus: "TRIALING",
            isTrial: true,
            trialDaysRemaining: 14,
            isExpired: false,
            isReadOnly: false,
          },
          limits: {
            sites: {
              used: 0,
              max: defaultDef.siteLimit,
              remaining: defaultDef.siteLimit,
              canCreate: true,
            },
            languages: { max: 3 },
            teamMembers: { max: 3 },
          },
          features: { ...defaultDef.features },
        });
      }
    } catch {
      // Network fallback
      const defaultDef = CANONICAL_PLANS[DEFAULT_TRIAL_PLAN_CODE];
      setSnapshot({
        plan: {
          code: DEFAULT_TRIAL_PLAN_CODE,
          name: defaultDef.name,
          description: defaultDef.description,
          status: "ACTIVE",
        },
        subscription: {
          id: `client-sub-${activeWorkspaceId}`,
          status: "TRIALING",
          effectiveStatus: "TRIALING",
          isTrial: true,
          trialDaysRemaining: 14,
          isExpired: false,
          isReadOnly: false,
        },
        limits: {
          sites: {
            used: 0,
            max: defaultDef.siteLimit,
            remaining: defaultDef.siteLimit,
            canCreate: true,
          },
          languages: { max: 3 },
          teamMembers: { max: 3 },
        },
        features: { ...defaultDef.features },
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, isAuthenticated]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  const can = useCallback(
    (featureKey: string): boolean => {
      // Super Admin bypass for client UX
      if (user?.role === "admin") return true;
      if (!snapshot) return false;
      return Boolean(snapshot.features[featureKey]);
    },
    [snapshot, user]
  );

  const getLimit = useCallback(
    (limitKey: string): number | null => {
      if (user?.role === "admin") return 999;
      if (!snapshot) return null;
      if (limitKey === "sites.max") return snapshot.limits.sites.max;
      if (limitKey === "languages.max") return snapshot.limits.languages.max;
      if (limitKey === "teamMembers.max") return snapshot.limits.teamMembers.max;
      return snapshot.limits[limitKey] ?? null;
    },
    [snapshot, user]
  );

  const plan = snapshot?.plan ?? null;
  const subscription = snapshot?.subscription ?? null;
  const usage = snapshot?.limits.sites
    ? {
        used: snapshot.limits.sites.used,
        max: snapshot.limits.sites.max,
        remaining: snapshot.limits.sites.remaining,
        canCreate: snapshot.limits.sites.canCreate,
      }
    : null;

  return (
    <EntitlementContext.Provider
      value={{
        can,
        getLimit,
        snapshot,
        plan,
        subscription,
        usage,
        isLoading,
        refetchEntitlements: fetchEntitlements,
      }}
    >
      {children}
    </EntitlementContext.Provider>
  );
};

export function useEntitlements() {
  const ctx = useContext(EntitlementContext);
  if (!ctx) {
    throw new Error("useEntitlements must be used within an EntitlementProvider");
  }
  return ctx;
}
