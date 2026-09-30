/**
 * JetKur Post-Deploy Automatic Edge Rollback Module (Sprint 16.3)
 *
 * Requirements:
 * "If final deployment succeeds AND real verification fails:
 * attempt Cloudflare Worker rollback to previous known-good version.
 * If automatic rollback itself fails: mark deployment CRITICAL_FAILURE,
 * do not mark candidate LIVE, preserve explicit operator recovery instructions."
 */

import { CloudflareApiClient } from "./cloudflareApiClient";

export interface RollbackAttemptResult {
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  restoredVersionId?: string;
  error?: string;
  criticalFailure: boolean;
  operatorInstructions?: string;
}

export async function executeAutomaticEdgeRollback(
  apiClient: CloudflareApiClient,
  previousKnownGoodScriptCode?: string,
  previousAssetJwt?: string
): Promise<RollbackAttemptResult> {
  console.warn(
    "[EDGE_ROLLBACK] Canlı doğrulama başarısız oldu. Otomatik Cloudflare Worker geri alma başlatılıyor..."
  );

  // In DRY_RUN mode, simulate successful rollback
  if (apiClient.mode !== "REAL") {
    return {
      rollbackAttempted: true,
      rollbackSucceeded: true,
      restoredVersionId: "v_previous_dry_run",
      criticalFailure: false,
    };
  }

  // If we have the previous script & assetJwt, re-deploy the previous Worker
  if (previousKnownGoodScriptCode && previousAssetJwt) {
    try {
      const restoreRes = await apiClient.deployWorkerWithStaticAssets(
        previousKnownGoodScriptCode,
        previousAssetJwt
      );

      if (restoreRes.success) {
        console.info("[EDGE_ROLLBACK] Önceki çalışan Worker sürümü başarıyla geri yüklendi.");
        return {
          rollbackAttempted: true,
          rollbackSucceeded: true,
          restoredVersionId: restoreRes.result?.id || "previous_version",
          criticalFailure: false,
        };
      }
    } catch (err: any) {
      console.error("[EDGE_ROLLBACK] Otomatik geri yükleme başarısız:", err);
    }
  }

  // If automatic re-deploy fails or previous state was unavailable
  return {
    rollbackAttempted: true,
    rollbackSucceeded: false,
    criticalFailure: true,
    error: "Otomatik Cloudflare sürüm geri alma başarısız oldu.",
    operatorInstructions:
      "ACİL DURUM OPERATÖR MÜDAHALESİ GEREKLİ: Cloudflare Dashboard > Workers & Pages > jetkur-customer-sites > Deployments sekmesine gidin ve önceki çalışan sürüme 'Rollback' tıklayın.",
  };
}
