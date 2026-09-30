/**
 * JetKur Cloudflare Static Assets Publishing Provider (Sprint 16.1 & 16.3)
 *
 * Implements:
 * 1. Single shared customer-site publishing architecture for 0-100 sites on Cloudflare Free.
 * 2. AGGREGATE DESIRED STATE PLANNER: Every deployment includes all active customer sites.
 * 3. SHARED DEPLOYMENT LOCK: Serializes concurrent mutations of 'jetkur-customer-sites'.
 * 4. Immutable namespaced static asset generation (sites/<siteId>/v<version>/).
 * 5. Automatic edge rollback if live verification fails.
 * 6. Dry-run mode by default (ZERO live Cloudflare API mutations).
 * 7. Root Zone Mutation Guard.
 * 8. Usage observability metrics tracking (asset count, bytes, manifest size).
 */

import crypto from "crypto";
import {
  StaticAssetArtifact,
  NamespacedStaticFile,
  DeploymentPlanResult,
  DeploymentVerificationResult,
  UsageObservabilityMetrics,
} from "./types";
import { RoutingManifestStore, globalRoutingManifest } from "./manifest";
import { DeploymentExecutionMode } from "../domain/types";
import { GeneratedPageFile } from "../../types";
import { assertNotProtectedRootHostname } from "../domain/provider";
import {
  AggregateDesiredStatePlanner,
  globalDesiredStatePlanner,
  ActiveSiteDeploymentState,
  EdgeDesiredState,
} from "./edgeDesiredState";
import { SharedWorkerDeployLock, sharedWorkerDeployLock } from "./sharedDeployLock";
import { verifyLiveEdgeDeployment } from "./liveVerification";
import { executeAutomaticEdgeRollback } from "./edgeRollback";
import { CloudflareApiClient } from "./cloudflareApiClient";
import { generateCloudflareWorkerScript } from "./workerScript";

export interface StaticFileCandidate {
  filename?: string;
  fileName?: string;
  content?: string;
  html?: string;
  [key: string]: any;
}

export interface StaticDeploymentProvider {
  readonly providerName: string;
  readonly mode: DeploymentExecutionMode;

  prepareArtifact(
    siteId: string,
    version: number,
    fingerprint: string,
    files: (GeneratedPageFile | StaticFileCandidate)[]
  ): StaticAssetArtifact;

  validateArtifact(artifact: StaticAssetArtifact): { valid: boolean; error?: string };

  publishArtifact(
    siteId: string,
    version: number,
    hostname: string,
    artifact: StaticAssetArtifact,
    canonicalUrl?: string
  ): Promise<{
    success: boolean;
    mode: DeploymentExecutionMode;
    message: string;
    error?: string;
    desiredState?: EdgeDesiredState;
    verified?: boolean;
    rollbackAttempted?: boolean;
    rollbackSucceeded?: boolean;
  }>;

  verifyDeployment(
    hostname: string,
    expectedVersion: number,
    expectedFingerprint: string,
    siteId?: string
  ): Promise<DeploymentVerificationResult>;

  rollbackArtifact(
    hostname: string,
    siteId: string,
    targetVersion: number,
    fingerprint?: string
  ): Promise<{ success: boolean; message: string }>;

  generateDeploymentPlan(siteId: string, version: number, hostname: string): DeploymentPlanResult;

  getMetrics(): UsageObservabilityMetrics;
}

export class CloudflareStaticAssetsProvider implements StaticDeploymentProvider {
  readonly providerName = "cloudflare-static-assets";
  readonly mode: DeploymentExecutionMode;
  private manifestStore: RoutingManifestStore;
  private staticAssetsStore: Map<string, string> = new Map();
  private artifactHistory: Map<string, StaticAssetArtifact> = new Map();

  // Aggregate planner, lock, and API client
  private desiredStatePlanner: AggregateDesiredStatePlanner;
  private deployLock: SharedWorkerDeployLock;
  private apiClient: CloudflareApiClient;

  // Previous deployment state for edge rollback
  private lastDeployedWorkerScript?: string;
  private lastDeployedAssetJwt?: string;

  // Usage observability metrics
  private metrics: UsageObservabilityMetrics = {
    publishedSites: 0,
    activeHostnames: 0,
    artifactCount: 0,
    artifactBytes: 0,
    publishCount: 0,
    publishFailures: 0,
    lastUpdated: new Date().toISOString(),
  };

  constructor(options?: {
    mode?: DeploymentExecutionMode;
    manifestStore?: RoutingManifestStore;
    desiredStatePlanner?: AggregateDesiredStatePlanner;
    deployLock?: SharedWorkerDeployLock;
    apiClient?: CloudflareApiClient;
  }) {
    this.mode =
      options?.mode ||
      (process.env.CLOUDFLARE_STATIC_ASSETS_MODE as DeploymentExecutionMode) ||
      "DRY_RUN";
    this.manifestStore = options?.manifestStore || globalRoutingManifest;
    this.desiredStatePlanner = options?.desiredStatePlanner || globalDesiredStatePlanner;
    this.deployLock = options?.deployLock || sharedWorkerDeployLock;
    this.apiClient = options?.apiClient || new CloudflareApiClient({ mode: this.mode });
  }

  getManifestStore(): RoutingManifestStore {
    return this.manifestStore;
  }

  getStaticAssetsStore(): Map<string, string> {
    return this.staticAssetsStore;
  }

  getDesiredStatePlanner(): AggregateDesiredStatePlanner {
    return this.desiredStatePlanner;
  }

  getMetrics(): UsageObservabilityMetrics {
    return { ...this.metrics };
  }

  /**
   * Transforms raw generated static files into an immutable namespaced artifact
   */
  prepareArtifact(
    siteId: string,
    version: number,
    fingerprint: string,
    files: (GeneratedPageFile | StaticFileCandidate)[]
  ): StaticAssetArtifact {
    const namespacePrefix = RoutingManifestStore.sanitizeNamespace(siteId, version);
    let totalSizeBytes = 0;

    const namespacedFiles: NamespacedStaticFile[] = files.map((file) => {
      const filename = (file.filename || file.fileName || "index.html").replace(/^\/+/, "");
      const content = file.html || file.content || "";
      const sizeBytes = Buffer.byteLength(content, "utf8");
      totalSizeBytes += sizeBytes;

      const sha256 = crypto.createHash("sha256").update(content, "utf8").digest("hex");
      const path = `${namespacePrefix}/${filename}`;

      // In-memory static storage
      this.staticAssetsStore.set(path, content);

      let contentType = "text/html; charset=utf-8";
      if (filename.endsWith(".css")) contentType = "text/css; charset=utf-8";
      if (filename.endsWith(".xml")) contentType = "application/xml; charset=utf-8";
      if (filename.endsWith(".txt")) contentType = "text/plain; charset=utf-8";

      return {
        path,
        filename,
        content,
        sizeBytes,
        contentType,
        sha256,
      };
    });

    const artifact: StaticAssetArtifact = {
      siteId,
      version,
      fingerprint,
      namespacePrefix,
      files: namespacedFiles,
      totalSizeBytes,
      filesCount: namespacedFiles.length,
      createdAt: new Date().toISOString(),
    };

    // Store in historical registry for zero-rebuild rollback
    const historyKey = `${siteId}:v${version}`;
    this.artifactHistory.set(historyKey, artifact);

    // Update internal observability metrics
    this.metrics.artifactCount += namespacedFiles.length;
    this.metrics.artifactBytes += totalSizeBytes;
    this.metrics.lastUpdated = new Date().toISOString();

    return artifact;
  }

  /**
   * Validates artifact against performance invariants and required files
   */
  validateArtifact(artifact: StaticAssetArtifact): { valid: boolean; error?: string } {
    const hasIndexHtml = artifact.files.some((f) => f.filename === "index.html");
    if (!hasIndexHtml) {
      return { valid: false, error: "Artefakt index.html dosyası içermiyor." };
    }

    for (const f of artifact.files) {
      if (f.content.includes("cdn.tailwindcss.com")) {
        return { valid: false, error: "Güvenlik ihlali: Tailwind CDN referansı tespit edildi." };
      }
      if (f.content.includes("react-dom.production.min.js")) {
        return { valid: false, error: "Performans ihlali: Müşteri sitesinde React runtime tespit edildi." };
      }
      if (f.content.includes("api.cloudflare.com")) {
        return { valid: false, error: "Güvenlik sızıntısı: Cloudflare API endpoint referansı tespit edildi." };
      }
    }

    return { valid: true };
  }

  /**
   * Publishes artifact by building COMPLETE Edge Desired State across all active customer sites.
   * Acquires exclusive shared deployment lock on 'jetkur-customer-sites' to prevent lost updates.
   */
  async publishArtifact(
    siteId: string,
    version: number,
    hostname: string,
    artifact: StaticAssetArtifact,
    canonicalUrl?: string
  ): Promise<{
    success: boolean;
    mode: DeploymentExecutionMode;
    message: string;
    error?: string;
    desiredState?: EdgeDesiredState;
    verified?: boolean;
    rollbackAttempted?: boolean;
    rollbackSucceeded?: boolean;
  }> {
    assertNotProtectedRootHostname(hostname, "PUBLISH_STATIC_ASSET");

    const validation = this.validateArtifact(artifact);
    if (!validation.valid) {
      this.metrics.publishFailures++;
      return {
        success: false,
        mode: this.mode,
        message: validation.error || "Artefakt doğrulanamadı.",
        error: validation.error,
      };
    }

    // Acquire shared worker deployment lock (serializes concurrent publishes)
    const releaseLock = await this.deployLock.acquire(siteId);

    try {
      // 1. Candidate active site state
      const candidateState: ActiveSiteDeploymentState = {
        siteId,
        version,
        fingerprint: artifact.fingerprint,
        hostname,
        artifactPrefix: artifact.namespacePrefix,
        files: artifact.files,
        canonicalUrl: canonicalUrl || `https://${hostname}`,
        publishedAt: new Date().toISOString(),
      };

      // 2. Build COMPLETE desired edge state across all active sites
      const desiredState = this.desiredStatePlanner.buildDesiredState(candidateState);

      // 3. Generate production Worker script embedding the aggregate routing manifest
      const workerScriptCode = generateCloudflareWorkerScript(
        JSON.stringify(desiredState.routingManifest),
        siteId
      );

      // 4. Capture previous deployment state for emergency edge rollback
      const previousScript = this.lastDeployedWorkerScript;
      const previousJwt = this.lastDeployedAssetJwt;

      // 5. Execute Cloudflare Deployment
      if (this.mode === "REAL") {
        const deployRes = await this.apiClient.executeFullStaticAssetsDeployment({
          assetManifest: desiredState.completeAssetManifest,
          filesByHash: desiredState.filesByHash,
          workerScriptCode,
        });

        if (!deployRes.success) {
          throw new Error("Cloudflare 3 aşamalı statik dağıtım başarısız oldu.");
        }
      } else {
        // DRY_RUN / SIMULATED: update in-memory stores with complete desired state
        for (const [hash, content] of desiredState.filesByHash.entries()) {
          this.staticAssetsStore.set(`hash_${hash}`, content);
        }
        for (const f of artifact.files) {
          this.staticAssetsStore.set(f.path, f.content);
        }
        for (const [h, entry] of Object.entries(desiredState.routingManifest)) {
          this.manifestStore.setRoute(h, entry.siteId, entry.version, entry.fingerprint, entry.canonicalUrl);
        }
      }

      // 6. Real Live HTTP Verification
      const verifyRes = await this.verifyDeployment(hostname, version, artifact.fingerprint, siteId);

      if (!verifyRes.verified) {
        // Post-deploy verification failure: execute automatic edge rollback
        const rollbackRes = await executeAutomaticEdgeRollback(
          this.apiClient,
          previousScript,
          previousJwt
        );

        this.metrics.publishFailures++;
        return {
          success: false,
          mode: this.mode,
          message: "Canlı dağıtım doğrulanamadı. Otomatik geri alma uygulandı.",
          error: verifyRes.error,
          verified: false,
          rollbackAttempted: rollbackRes.rollbackAttempted,
          rollbackSucceeded: rollbackRes.rollbackSucceeded,
        };
      }

      // 7. Successful verification: Commit desired state into aggregate authority
      this.desiredStatePlanner.commitDesiredState(desiredState);
      this.lastDeployedWorkerScript = workerScriptCode;

      // Update observability metrics
      this.metrics.publishedSites = desiredState.activeSiteCount;
      this.metrics.activeHostnames = Object.keys(desiredState.routingManifest).length;
      this.metrics.artifactCount = desiredState.totalAssetCount;
      this.metrics.artifactBytes = desiredState.totalAssetBytes;
      this.metrics.publishCount++;
      this.metrics.lastUpdated = new Date().toISOString();

      const successMsg =
        this.mode === "DRY_RUN"
          ? `[DRY_RUN] Komple Edge Desired State (${desiredState.activeSiteCount} aktif site, ${desiredState.totalAssetCount} dosya) başarıyla planlandı. "${hostname}" yönlendirmesi simüle edildi.`
          : `Tebrikler! Siteniz Cloudflare edge üzerinde yayına alındı. (${hostname} -> ${artifact.namespacePrefix})`;

      return {
        success: true,
        mode: this.mode,
        message: successMsg,
        desiredState,
        verified: true,
      };
    } finally {
      releaseLock();
    }
  }

  /**
   * Verifies live deployment (REAL executes outbound HTTPS; DRY_RUN executes in-memory edge router)
   */
  async verifyDeployment(
    hostname: string,
    expectedVersion: number,
    expectedFingerprint: string,
    siteId?: string
  ): Promise<DeploymentVerificationResult> {
    return verifyLiveEdgeDeployment({
      hostname,
      expectedSiteId: siteId || "",
      expectedVersion,
      expectedFingerprint,
      mode: this.mode,
      manifestStore: this.manifestStore,
      staticAssetsStore: this.staticAssetsStore,
    });
  }

  /**
   * Rolls back a site mapping to a previously published immutable artifact
   */
  async rollbackArtifact(
    hostname: string,
    siteId: string,
    targetVersion: number,
    fingerprint?: string
  ): Promise<{ success: boolean; message: string }> {
    assertNotProtectedRootHostname(hostname, "ROLLBACK_STATIC_ASSET");

    const releaseLock = await this.deployLock.acquire(siteId);

    try {
      const historyKey = `${siteId}:v${targetVersion}`;
      const historicArtifact = this.artifactHistory.get(historyKey);

      const effectiveFingerprint =
        fingerprint || historicArtifact?.fingerprint || `fp_v${targetVersion}_rollback`;

      const files = historicArtifact?.files || [];
      const prefix = historicArtifact?.namespacePrefix || RoutingManifestStore.sanitizeNamespace(siteId, targetVersion);

      const candidateState: ActiveSiteDeploymentState = {
        siteId,
        version: targetVersion,
        fingerprint: effectiveFingerprint,
        hostname,
        artifactPrefix: prefix,
        files,
        canonicalUrl: `https://${hostname}`,
        publishedAt: new Date().toISOString(),
      };

      const desiredState = this.desiredStatePlanner.buildDesiredState(candidateState);
      this.desiredStatePlanner.commitDesiredState(desiredState);

      this.manifestStore.setRoute(
        hostname,
        siteId,
        targetVersion,
        effectiveFingerprint,
        `https://${hostname}`
      );

      return {
        success: true,
        message: `Başarıyla Sürüm ${targetVersion}'e geri dönüldü. Mevcut statik artefakt doğrudan yeniden bağlandı.`,
      };
    } finally {
      releaseLock();
    }
  }

  /**
   * Generates a concrete dry-run deployment execution plan
   */
  generateDeploymentPlan(siteId: string, version: number, hostname: string): DeploymentPlanResult {
    const namespace = RoutingManifestStore.sanitizeNamespace(siteId, version);

    return {
      siteId,
      version,
      hostname,
      mode: this.mode,
      artifactPrefix: namespace,
      readyForExecution: true,
      steps: [
        {
          step: 1,
          action: "PREPARE_STATIC_ARTIFACT",
          target: namespace,
          description: `Kanonik statik dosyaları "${namespace}" multi-tenant isim alanına derle.`,
          executionMode: this.mode,
        },
        {
          step: 2,
          action: "VALIDATE_ASSET_INVARIANTS",
          target: `${namespace}/index.html`,
          description: "0 Tailwind CDN, 0 customer React runtime ve 0 harici sızıntı denetimi yap.",
          executionMode: this.mode,
        },
        {
          step: 3,
          action: "ATOMIC_UPLOAD",
          target: "Cloudflare Workers Static Assets Storage",
          description: "Statik artefaktı Cloudflare Free edge depolama alanına yükle.",
          executionMode: this.mode,
        },
        {
          step: 4,
          action: "UPDATE_ROUTING_MANIFEST",
          target: "routing-manifest.json",
          description: `"${hostname}" anahtarını "${namespace}" hedefine atomik olarak bağla.`,
          executionMode: this.mode,
        },
        {
          step: 5,
          action: "VERIFY_DEPLOYMENT",
          target: `https://${hostname}`,
          description: "Müşteri sitesi dağıtım meta etiketini (jetkur-site-id) doğrula.",
          executionMode: this.mode,
        },
        {
          step: 6,
          action: "PROMOTE_LIVE",
          target: "Active Edge Routing",
          description: "Sürümü canlı trafik yönlendirmesine al.",
          executionMode: this.mode,
        },
      ],
      dnsRequirements: [
        {
          hostname,
          recordType: "CNAME",
          target: "jetkur-customer-sites.workers.dev",
          proxied: true,
        },
      ],
    };
  }
}
