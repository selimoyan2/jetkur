/**
 * JetKur Edge Static Asset Router (Sprint 16.1)
 *
 * Core Product Principle:
 * "Shared customer-site publishing layer on Cloudflare Free.
 * Request -> Hostname -> Routing Manifest -> Static Asset.
 * Zero PostgreSQL roundtrips per visitor request."
 */

import { RoutingManifestStore } from "./manifest";

export interface EdgeResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  source: "STATIC_EDGE_ASSETS" | "ROUTING_FALLBACK";
}

/**
 * Maps standard file extensions to web MIME types
 */
function getMimeType(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (filePath.endsWith(".txt")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

/**
 * Simulates the Cloudflare Workers Static Assets router execution
 * Pure static mapping with 0 dynamic database hits
 */
export function handleEdgeRequest(
  hostname: string,
  pathname: string,
  manifestStore: RoutingManifestStore,
  staticAssetsStore: Map<string, string>
): EdgeResponse {
  // 1. Resolve hostname to immutable artifact prefix
  const route = manifestStore.resolveRoute(hostname);
  if (!route) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: `<!DOCTYPE html><html><body><h1>404 - Site Bulunamadı</h1><p>"${hostname}" adresi için aktif bir JetKur sitesi bulunamadı.</p></body></html>`,
      source: "ROUTING_FALLBACK",
    };
  }

  // 2. Normalize requested path (default to index.html)
  let relativeFile = pathname.replace(/^\/+/, "");
  if (!relativeFile || relativeFile === "" || relativeFile === "index" || relativeFile === "home") {
    relativeFile = "index.html";
  }

  // 3. Prevent path traversal attacks
  if (relativeFile.includes("..") || relativeFile.includes("\\")) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Bad Request: Path traversal rejected",
      source: "ROUTING_FALLBACK",
    };
  }

  // 4. Construct namespaced static asset key
  const assetKey = `${route.artifactPrefix}/${relativeFile}`;
  const assetContent = staticAssetsStore.get(assetKey);

  if (!assetContent) {
    // If subpage not found, check 404.html in artifact
    const notFoundKey = `${route.artifactPrefix}/404.html`;
    const notFoundContent = staticAssetsStore.get(notFoundKey);
    return {
      statusCode: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: notFoundContent || "<h1>404 - Sayfa Bulunamadı</h1>",
      source: "STATIC_EDGE_ASSETS",
    };
  }

  // 5. Build optimal edge caching headers
  const mimeType = getMimeType(relativeFile);
  const isImmutableAsset =
    relativeFile.startsWith("assets/") ||
    relativeFile.endsWith(".css") ||
    relativeFile.endsWith(".js") ||
    relativeFile.endsWith(".webp");

  const cacheControl = isImmutableAsset
    ? "public, max-age=31536000, immutable"
    : "public, max-age=0, must-revalidate";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-JetKur-Site-Id": route.siteId,
      "X-JetKur-Version": String(route.version),
    },
    body: assetContent,
    source: "STATIC_EDGE_ASSETS",
  };
}
