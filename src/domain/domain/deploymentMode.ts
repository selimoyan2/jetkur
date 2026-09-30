/**
 * JetKur Deployment Execution Mode & Live Status Guard (Sprint 16)
 *
 * Core Principle:
 * "SIMULATED deployment müşteri UI'ında 'Yayında' (LIVE) olarak gösterilmemelidir."
 */

import { DeploymentExecutionMode } from "./types";

export interface DeploymentStatusDisplay {
  badgeText: string;
  badgeVariant: "live" | "preview" | "pending" | "error";
  isActuallyLive: boolean;
  publicUrl?: string;
  description: string;
}

/**
 * Derives the honest customer-facing status badge based on execution mode
 */
export function getDeploymentStatusDisplay(
  mode: DeploymentExecutionMode,
  status: string,
  productionUrl?: string
): DeploymentStatusDisplay {
  if (status === "ERROR" || status === "FAILED") {
    return {
      badgeText: "Yayınlama Başarısız",
      badgeVariant: "error",
      isActuallyLive: false,
      description: "Son yayınlama denemesi tamamlanamadı. Canlı siteniz korunuyor.",
    };
  }

  if (status === "BUILDING" || status === "VERIFYING") {
    return {
      badgeText: "Hazırlanıyor...",
      badgeVariant: "pending",
      isActuallyLive: false,
      description: "Yeni sürüm dağıtılıyor.",
    };
  }

  // CRITICAL INVARIANT: SIMULATED / DRY_RUN cannot be branded as LIVE
  if (mode === "SIMULATED" || mode === "DRY_RUN") {
    return {
      badgeText: "Hazır (Önizleme)",
      badgeVariant: "preview",
      isActuallyLive: false, // NOT LIVE on internet
      publicUrl: productionUrl,
      description: "Taslak başarıyla derlendi ve önizlemeye hazır. Canlı yayınlama için alan adı doğrulaması bekleniyor.",
    };
  }

  if (mode === "REAL" && (status === "DEPLOYED" || status === "ACTIVE")) {
    return {
      badgeText: "Yayında",
      badgeVariant: "live",
      isActuallyLive: true,
      publicUrl: productionUrl,
      description: "Siteniz internet ortamında aktif ve tüm ziyaretçilere açık.",
    };
  }

  return {
    badgeText: "Taslak Modunda",
    badgeVariant: "preview",
    isActuallyLive: false,
    description: "Siteniz henüz yayınlanmadı.",
  };
}
