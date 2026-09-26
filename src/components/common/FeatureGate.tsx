/**
 * JetKur FeatureGate Component (Sprint 04)
 * 
 * Reusable declarative guard for UI feature gating.
 * 
 * Usage:
 * <FeatureGate feature="site.blog" fallback={<UpgradeBanner feature="Blog" />}>
 *   <BlogEditor />
 * </FeatureGate>
 */

import React from "react";
import { useEntitlements } from "../../context/EntitlementContext";

interface FeatureGateProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  fallback = null,
  children,
}) => {
  const { can, isLoading } = useEntitlements();

  if (isLoading) {
    return null;
  }

  if (!can(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
