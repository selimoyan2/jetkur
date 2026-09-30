/**
 * JetKur Real Cloudflare REST API Client & Production Adapter (Sprint 16.2)
 *
 * Implements:
 * 1. Exact REST API endpoints for Cloudflare Workers Static Assets.
 * 2. Strict target protection: ONLY interacts with "jetkur-customer-sites".
 * 3. Never mutates, lists, or overwrites other Workers in the account.
 * 4. Error and log sanitization: guarantees zero API token leakage.
 * 5. Dry-run safety gate: blocks live API requests unless explicitly opt-in.
 */

import { WORKER_NAME } from "./workerScript";
import { DeploymentExecutionMode } from "../domain/types";

export interface CloudflareApiConfig {
  accountId?: string;
  apiToken?: string;
  workerName?: string;
  mode?: DeploymentExecutionMode;
}

export interface CloudflareAssetUploadSessionResult {
  uploadJwt?: string;
  buckets?: string[];
  manifestHash?: string;
}

export interface CloudflareDeploymentApiResponse {
  success: boolean;
  errors?: { code: number; message: string }[];
  messages?: string[];
  result?: any;
}

/**
 * Sanitizes any string or error object by scrubbing tokens and secrets
 */
export function sanitizeApiError(error: any, apiToken?: string): string {
  let message = typeof error === "string" ? error : error?.message || JSON.stringify(error);
  if (apiToken && apiToken.length > 5) {
    message = message.split(apiToken).join("[REDACTED_API_TOKEN]");
  }
  // Also redact common Authorization header patterns
  message = message.replace(/Bearer\s+[a-zA-Z0-9_-]+/gi, "Bearer [REDACTED]");
  return message;
}

export class CloudflareApiClient {
  readonly accountId?: string;
  readonly workerName: string;
  readonly mode: DeploymentExecutionMode;
  private readonly apiToken?: string;

  constructor(config?: CloudflareApiConfig) {
    this.accountId = config?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    this.apiToken = config?.apiToken || process.env.CLOUDFLARE_API_TOKEN;
    this.workerName = config?.workerName || process.env.CLOUDFLARE_WORKER_NAME || WORKER_NAME;
    this.mode =
      config?.mode ||
      (process.env.CLOUDFLARE_STATIC_ASSETS_MODE as DeploymentExecutionMode) ||
      "DRY_RUN";

    // Hardcoded safety gate: protect other workers in the user's account
    if (this.workerName !== WORKER_NAME) {
      throw new Error(
        `GÜVENLİK İHLALİ: CloudflareApiClient yalnızca "${WORKER_NAME}" hedefi için çalışabilir. "${this.workerName}" hedefi kesinlikle engellendi.`
      );
    }
  }

  /**
   * Asserts that REAL mode preconditions are met
   */
  private assertRealModeReady(): void {
    if (this.mode !== "REAL") {
      throw new Error(
        `DRY_RUN KORUMASI: Deployment modu "${this.mode}". Gerçek Cloudflare API çağrısı engellendi.`
      );
    }

    if (process.env.CLOUDFLARE_REAL_DEPLOYMENT_ENABLED !== "true") {
      throw new Error(
        "GÜVENLİK KİLİDİ: CLOUDFLARE_REAL_DEPLOYMENT_ENABLED=true tanımlanmadı. Gerçek dağıtım engellendi."
      );
    }

    if (!this.apiToken) {
      throw new Error("CLOUDFLARE_API_TOKEN eksik. Gerçek dağıtım yapılamaz.");
    }

    if (!this.accountId) {
      throw new Error("CLOUDFLARE_ACCOUNT_ID eksik. Gerçek dağıtım yapılamaz.");
    }
  }

  /**
   * Endpoint 1: Inspects the status of the target Worker script
   * GET /client/v4/accounts/{accountId}/workers/scripts/{scriptName}
   */
  async getWorkerScriptInfo(): Promise<CloudflareDeploymentApiResponse> {
    if (this.mode !== "REAL") {
      return {
        success: true,
        messages: [`[DRY_RUN] Worker bilgisi simüle edildi: ${this.workerName}`],
        result: { id: this.workerName, created_on: new Date().toISOString() },
      };
    }

    this.assertRealModeReady();
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/workers/scripts/${this.workerName}`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as CloudflareDeploymentApiResponse;
      return data;
    } catch (err: any) {
      throw new Error(sanitizeApiError(err, this.apiToken));
    }
  }

  /**
   * Endpoint 2: Initiates a Static Assets upload session
   * POST /client/v4/accounts/{accountId}/workers/scripts/{scriptName}/assets-upload-session
   */
  async createAssetUploadSession(
    assetManifest: Record<string, { hash: string; size: number }>
  ): Promise<CloudflareDeploymentApiResponse> {
    if (this.mode !== "REAL") {
      return {
        success: true,
        messages: [
          `[DRY_RUN] Asset upload session simüle edildi (${Object.keys(assetManifest).length} dosya)`,
        ],
        result: { uploadJwt: "mock-jwt-dry-run", buckets: [] },
      };
    }

    this.assertRealModeReady();
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/workers/scripts/${this.workerName}/assets-upload-session`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ manifest: assetManifest }),
      });

      const data = (await response.json()) as CloudflareDeploymentApiResponse;
      return data;
    } catch (err: any) {
      throw new Error(sanitizeApiError(err, this.apiToken));
    }
  }

  /**
   * Endpoint 2b: Uploads an individual asset bucket using the session JWT
   * POST /client/v4/accounts/{accountId}/workers/assets/upload?base64=true
   * Authorization: Bearer <uploadJwt>
   */
  async uploadAssetBucket(
    bucketHashes: string[],
    filesByHash: Map<string, string>,
    uploadJwt: string
  ): Promise<CloudflareDeploymentApiResponse> {
    if (!uploadJwt || uploadJwt.trim().length === 0) {
      throw new Error("Geçersiz veya eksik upload JWT. Asset bucket yüklenemez.");
    }

    if (bucketHashes.length === 0) {
      // Empty bucket is a valid no-op
      return {
        success: true,
        messages: ["Boş bucket (yüklenecek dosya yok, mevcut edge cache kullanıldı)."],
        result: { uploadedCount: 0 },
      };
    }

    // Build payload and validate that all requested hashes are provided
    const payload: Record<string, string> = {};
    for (const hash of bucketHashes) {
      const content = filesByHash.get(hash);
      if (content === undefined) {
        throw new Error(`Eksik dosya içeriği: Cloudflare tarafından talep edilen hash "${hash}" bulunamadı.`);
      }
      payload[hash] = Buffer.from(content, "utf8").toString("base64");
    }

    if (this.mode !== "REAL") {
      return {
        success: true,
        messages: [
          `[DRY_RUN] Asset bucket simüle edildi (${bucketHashes.length} dosya base64 yüklendi)`,
        ],
        result: { uploadedCount: bucketHashes.length },
      };
    }

    this.assertRealModeReady();
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/workers/assets/upload?base64=true`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${uploadJwt}`, // Uses upload session JWT!
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as CloudflareDeploymentApiResponse;
      if (!response.ok || !data.success) {
        throw new Error(
          data.errors?.map((e) => e.message).join(", ") || `HTTP ${response.status} bucket yükleme hatası`
        );
      }
      return data;
    } catch (err: any) {
      throw new Error(sanitizeApiError(err, this.apiToken));
    }
  }

  /**
   * Endpoint 3: Uploads the Worker Script and binds Static Assets
   * PUT /client/v4/accounts/{accountId}/workers/scripts/{scriptName}
   */
  async deployWorkerWithStaticAssets(
    workerScriptCode: string,
    assetJwt: string
  ): Promise<CloudflareDeploymentApiResponse> {
    if (this.mode !== "REAL") {
      return {
        success: true,
        messages: [
          `[DRY_RUN] Worker script deploy simüle edildi (${workerScriptCode.length} bytes)`,
        ],
        result: { id: this.workerName, deployed: true },
      };
    }

    this.assertRealModeReady();
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/workers/scripts/${this.workerName}`;

    try {
      // In real mode, Cloudflare expects multipart/form-data with metadata and script
      const formData = new FormData();
      const metadata = {
        main_module: "worker.js",
        bindings: [
          {
            type: "assets",
            name: "ASSETS",
          },
        ],
        assets: {
          jwt: assetJwt,
        },
      };

      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      formData.append(
        "worker.js",
        new Blob([workerScriptCode], { type: "application/javascript+module" }),
        "worker.js"
      );

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: formData,
      });

      const data = (await response.json()) as CloudflareDeploymentApiResponse;
      return data;
    } catch (err: any) {
      throw new Error(sanitizeApiError(err, this.apiToken));
    }
  }

  /**
   * High-Level Pipeline: Orchestrates all 3 stages of Cloudflare Workers Static Assets deployment:
   * 1. Register asset manifest (createAssetUploadSession)
   * 2. Upload all requested asset buckets using uploadJwt (uploadAssetBucket)
   * 3. Deploy Worker script with attached assets binding (deployWorkerWithStaticAssets)
   *
   * Invariant: If any bucket fails, the pipeline aborts immediately; final deploy is NEVER executed.
   */
  async executeFullStaticAssetsDeployment(options: {
    assetManifest: Record<string, { hash: string; size: number }>;
    filesByHash: Map<string, string>;
    workerScriptCode: string;
  }): Promise<{
    success: boolean;
    uploadSessionCreated: boolean;
    bucketsUploadedCount: number;
    uploadJwtUsed: boolean;
    workerDeployed: boolean;
    mode: DeploymentExecutionMode;
    message: string;
  }> {
    // Stage 1: Register manifest & get upload session
    const sessionRes = await this.createAssetUploadSession(options.assetManifest);
    if (!sessionRes.success || !sessionRes.result?.uploadJwt) {
      throw new Error(
        sessionRes.errors?.map((e) => e.message).join(", ") || "Asset upload session başlatılamadı."
      );
    }

    const uploadJwt = sessionRes.result.uploadJwt;
    const buckets: string[][] = sessionRes.result.buckets || [];
    let bucketsUploaded = 0;

    // Stage 2: Upload each requested asset bucket
    for (const bucket of buckets) {
      const bucketRes = await this.uploadAssetBucket(bucket, options.filesByHash, uploadJwt);
      if (!bucketRes.success) {
        throw new Error("Asset bucket yüklemesi başarısız oldu. Dağıtım durduruldu.");
      }
      bucketsUploaded++;
    }

    // Stage 3: Final Worker deploy with assets binding
    const deployRes = await this.deployWorkerWithStaticAssets(options.workerScriptCode, uploadJwt);
    if (!deployRes.success) {
      throw new Error(
        deployRes.errors?.map((e) => e.message).join(", ") || "Worker script dağıtımı başarısız oldu."
      );
    }

    return {
      success: true,
      uploadSessionCreated: true,
      bucketsUploadedCount: bucketsUploaded,
      uploadJwtUsed: true,
      workerDeployed: true,
      mode: this.mode,
      message: `[${this.mode}] Cloudflare Workers Static Assets 3 aşamalı dağıtım başarıyla tamamlandı.`,
    };
  }
}

