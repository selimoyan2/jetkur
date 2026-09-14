import JSZip from "jszip";
import { SiteConfig, ServiceItem, ProductItem, GalleryItem, BlogPostItem, TestimonialItem, CustomPageItem } from "../types";
import { slugify } from "./url";
import { createManualBackup, formatBackupDate, getTodayDateString } from "./backupManager";

export interface DiscoveredMediaAsset {
  id: string;
  sourceUrl: string;
  category: "logo" | "hero" | "service" | "product" | "gallery" | "blog" | "testimonial" | "page" | "general";
  title: string;
  targetFilename: string;
  dataUrlOrBlob?: Blob | string;
  sizeBytes?: number;
  status: "pending" | "downloaded" | "fallback" | "data_url";
  notes?: string;
}

export interface SnapshotProgress {
  step: "scanning" | "fetching_media" | "building_zip" | "generating_viewer" | "finalizing" | "completed" | "error";
  percent: number;
  message: string;
  currentAsset?: string;
  downloadedCount: number;
  totalAssets: number;
}

export interface SnapshotResult {
  success: boolean;
  zipFilename: string;
  zipSizeBytes: number;
  totalAssets: number;
  downloadedAssets: number;
  fallbackAssets: number;
  configSizeKb: number;
  manifest: SnapshotManifest;
  error?: string;
}

export interface SnapshotManifest {
  appName: string;
  generator: string;
  version: string;
  createdAt: string;
  companyName: string;
  siteId: string;
  summary: {
    pageCount: number;
    servicesCount: number;
    productsCount: number;
    blogPostsCount: number;
    galleryCount: number;
    leadsCount: number;
    totalMediaAssets: number;
    downloadedMediaAssets: number;
    configSizeKb: number;
  };
  mediaAssets: Array<{
    category: string;
    title: string;
    sourceUrl: string;
    localPath: string;
    status: string;
    sizeBytes?: number;
  }>;
}

/**
 * Normalizes an extension from a URL or mime type.
 */
function getExtensionFromUrl(url: string, defaultExt = "jpg"): string {
  try {
    if (url.startsWith("data:")) {
      const mime = url.substring(5, url.indexOf(";"));
      if (mime.includes("png")) return "png";
      if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
      if (mime.includes("webp")) return "webp";
      if (mime.includes("svg")) return "svg";
      if (mime.includes("gif")) return "gif";
      if (mime.includes("avif")) return "avif";
      return defaultExt;
    }
    const cleanUrl = url.split("?")[0].split("#")[0];
    const match = cleanUrl.match(/\.([a-zA-Z0-9]{3,4})$/);
    if (match && match[1]) {
      const ext = match[1].toLowerCase();
      if (["jpg", "jpeg", "png", "webp", "avif", "svg", "gif"].includes(ext)) {
        return ext === "jpeg" ? "jpg" : ext;
      }
    }
  } catch {
    // fallback
  }
  return defaultExt;
}

/**
 * Converts a base64 data URL to an ArrayBuffer.
 */
function dataUrlToArrayBuffer(dataUrl: string): { buffer: ArrayBuffer; mimeType: string } | null {
  try {
    const parts = dataUrl.split(",");
    if (parts.length < 2) return null;
    const header = parts[0];
    const mimeMatch = header.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const binary = atob(parts[1]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { buffer: bytes.buffer, mimeType };
  } catch (err) {
    console.warn("Failed to convert dataUrl to ArrayBuffer", err);
    return null;
  }
}

/**
 * Scans the entire site configuration and collects all unique media asset references.
 */
export function collectAllMediaAssets(config: SiteConfig): DiscoveredMediaAsset[] {
  const assets: DiscoveredMediaAsset[] = [];
  const seenUrls = new Set<string>();

  const addAsset = (
    url: string | undefined | null,
    category: DiscoveredMediaAsset["category"],
    title: string,
    prefix: string
  ) => {
    if (!url || typeof url !== "string") return;
    const trimmed = url.trim();
    if (!trimmed || trimmed.length < 5) return;
    if (seenUrls.has(trimmed)) return;
    seenUrls.add(trimmed);

    const ext = getExtensionFromUrl(trimmed, "jpg");
    const safeTitle = slugify(title).substring(0, 30) || "asset";
    const count = assets.filter((a) => a.category === category).length + 1;
    const paddedIndex = String(count).padStart(2, "0");
    const targetFilename = `${prefix}_${paddedIndex}_${safeTitle}.${ext}`;

    assets.push({
      id: `asset_${category}_${count}_${Math.random().toString(36).substring(2, 6)}`,
      sourceUrl: trimmed,
      category,
      title,
      targetFilename,
      status: trimmed.startsWith("data:") ? "data_url" : "pending"
    });
  };

  // 1. Header Logo (logoImage)
  if (config.header?.logoImage) {
    addAsset(config.header.logoImage, "logo", "Site Başlık Logosu", "logo");
  }

  // 2. Hero Background Image
  if (config.hero?.bgImage) {
    addAsset(config.hero.bgImage, "hero", "Hero Ana Arkaplan Görseli", "hero_bg");
  }

  // Hero Slides
  if (config.hero?.slides && Array.isArray(config.hero.slides)) {
    config.hero.slides.forEach((slide, sIdx) => {
      if (slide.bgImage) {
        addAsset(slide.bgImage, "hero", slide.title || `Hero Slayt ${sIdx + 1}`, "hero_slide");
      }
    });
  }

  // 3. About Us Image
  if (config.about?.image) {
    addAsset(config.about.image, "general", "Hakkımızda Kurumsal Görseli", "about");
  }

  // 4. Services Images
  if (config.services?.items && Array.isArray(config.services.items)) {
    config.services.items.forEach((svc: ServiceItem, idx: number) => {
      if (svc.image) {
        addAsset(svc.image, "service", svc.title || `Hizmet ${idx + 1}`, "service");
      }
      if (svc.bannerImage) {
        addAsset(svc.bannerImage, "service", `${svc.title || 'Hizmet'} Detay Banner`, "service_banner");
      }
      if (svc.ogImage) {
        addAsset(svc.ogImage, "service", `${svc.title || 'Hizmet'} Sosyal Paylaşım`, "service_og");
      }
    });
  }

  // 5. Products Images
  if (config.products?.items && Array.isArray(config.products.items)) {
    config.products.items.forEach((prod: ProductItem, idx: number) => {
      if (prod.featuredImage) {
        addAsset(prod.featuredImage, "product", `${prod.title || 'Ürün'} Öne Çıkan`, "product_feat");
      }
      if (prod.image) {
        addAsset(prod.image, "product", prod.title || `Ürün ${idx + 1}`, "product");
      }
      if (Array.isArray(prod.images)) {
        prod.images.forEach((imgUrl: string, imgIdx: number) => {
          addAsset(imgUrl, "product", `${prod.title || 'Ürün'} Görsel ${imgIdx + 1}`, "product_gallery");
        });
      }
      if (prod.ogImage) {
        addAsset(prod.ogImage, "product", `${prod.title || 'Ürün'} Sosyal Paylaşım`, "product_og");
      }
    });
  }

  // 6. Gallery Items
  if (config.gallery?.items && Array.isArray(config.gallery.items)) {
    config.gallery.items.forEach((item: GalleryItem, idx: number) => {
      if (item.imageUrl) {
        addAsset(item.imageUrl, "gallery", item.title || `Galeri Görseli ${idx + 1}`, "gallery");
      }
    });
  }

  // 7. Testimonials Avatars
  if (config.testimonials?.items && Array.isArray(config.testimonials.items)) {
    config.testimonials.items.forEach((testi: TestimonialItem, idx: number) => {
      if (testi.avatar) {
        addAsset(testi.avatar, "testimonial", testi.name || `Müşteri ${idx + 1}`, "testimonial");
      }
    });
  }

  // 8. Blog Posts Images
  if (config.blog?.items && Array.isArray(config.blog.items)) {
    config.blog.items.forEach((post: BlogPostItem, idx: number) => {
      if (post.coverImage) {
        addAsset(post.coverImage, "blog", `${post.title || 'Blog'} Kapak Resmi`, "blog_cover");
      }
      if (post.image) {
        addAsset(post.image, "blog", post.title || `Blog ${idx + 1}`, "blog");
      }
      if (post.ogImage) {
        addAsset(post.ogImage, "blog", `${post.title || 'Blog'} Sosyal Paylaşım`, "blog_og");
      }
    });
  }

  // 9. SEO OpenGraph Image
  if (config.seo?.ogImage) {
    addAsset(config.seo.ogImage, "general", "Site Geneli Sosyal Medya Paylaşım Görseli (OG Image)", "seo_og");
  }

  // 10. Media Library Items (if populated)
  if (config.mediaLibrary && Array.isArray(config.mediaLibrary)) {
    config.mediaLibrary.forEach((med, idx) => {
      if (med.url) {
        addAsset(med.url, "general", med.name || `Medya Dosyası ${idx + 1}`, "media");
      }
      if (med.thumbnailUrl) {
        addAsset(med.thumbnailUrl, "general", `${med.name || 'Medya'} Küçük Görsel`, "thumb");
      }
      if (med.webpUrl) {
        addAsset(med.webpUrl, "general", `${med.name || 'Medya'} WebP Sürüm`, "webp");
      }
      if (med.avifUrl) {
        addAsset(med.avifUrl, "general", `${med.name || 'Medya'} AVIF Sürüm`, "avif");
      }
    });
  }

  // 11. Custom Independent Pages
  if (config.pages && Array.isArray(config.pages)) {
    config.pages.forEach((page: CustomPageItem, pIdx: number) => {
      if (page.bannerImage) {
        addAsset(page.bannerImage, "page", `${page.title || 'Sayfa'} Banner`, "page_banner");
      }
      if (page.ogImage) {
        addAsset(page.ogImage, "page", `${page.title || 'Sayfa'} Sosyal Paylaşım`, "page_og");
      }
    });
  }

  return assets;
}

/**
 * Generates an SVG placeholder when remote CORS image download fails.
 */
function createFallbackImageBlob(asset: DiscoveredMediaAsset, companyName: string): Blob {
  const safeName = asset.title.replace(/[<>&"]/g, "");
  const safeCat = asset.category.toUpperCase();
  const safeCompany = companyName.replace(/[<>&"]/g, "");

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" />
  <rect x="20" y="20" width="760" height="560" rx="16" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="8 8" />
  <circle cx="400" cy="220" r="48" fill="#3b82f6" fill-opacity="0.2" />
  <path d="M380 220 L420 220 M400 200 L400 240" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" />
  <text x="400" y="320" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24" font-weight="bold" fill="#f8fafc" text-anchor="middle">${safeName}</text>
  <text x="400" y="356" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Kategori: ${safeCat} | ${safeCompany}</text>
  <text x="400" y="420" font-family="monospace" font-size="11" fill="#64748b" text-anchor="middle">Orijinal URL: ${asset.sourceUrl.substring(0, 70)}...</text>
  <text x="400" y="445" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12" fill="#38bdf8" text-anchor="middle">⚡ HızlıWeb Tek Tıkla Site Snapshot Çevrimdışı Arşivi</text>
</svg>`;

  return new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
}

/**
 * Builds an offline HTML document to view the snapshot data locally without a server.
 */
function buildOfflineViewerHtml(
  config: SiteConfig,
  assets: DiscoveredMediaAsset[],
  manifest: SnapshotManifest
): string {
  const company = config.companyName || "HızlıWeb Sitesi";
  const dateStr = formatBackupDate(Date.now());
  const safeJson = JSON.stringify(config).replace(/</g, "\\u003c");

  const mediaCardsHtml = assets
    .map((asset) => {
      return `
      <div class="media-card">
        <div class="media-preview">
          <img src="media/${asset.targetFilename}" alt="${asset.title}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🖼️</text></svg>'"/>
        </div>
        <div class="media-info">
          <div class="media-badge ${asset.category}">${asset.category.toUpperCase()}</div>
          <div class="media-title" title="${asset.title}">${asset.title}</div>
          <div class="media-file">media/${asset.targetFilename}</div>
          <div class="media-status ${asset.status}">${asset.status === 'downloaded' ? '✓ İndirildi' : asset.status === 'data_url' ? '✓ DataURL' : 'ℹ Çevrimdışı Görsel'}</div>
        </div>
      </div>`;
    })
    .join("\n");

  const servicesHtml = (config.services?.items || [])
    .map(
      (s: ServiceItem) => `
      <div class="item-chip">
        <strong>${s.title || 'Hizmet'}</strong>
        <p>${s.desc || ''}</p>
      </div>`
    )
    .join("\n");

  const productsHtml = (config.products?.items || [])
    .map(
      (p: ProductItem) => `
      <div class="item-chip">
        <strong>${p.title || 'Ürün'}</strong>
        <span>${p.price ? p.price + ' TL' : ''}</span>
      </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${company} - Çevrimdışı Site Snapshot & Medya Arşivi</title>
  <style>
    :root {
      --bg: #0b1120;
      --card-bg: #1e293b;
      --card-border: #334155;
      --primary: #3b82f6;
      --primary-light: #60a5fa;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; line-height: 1.5; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid var(--card-border); border-radius: 16px; padding: 32px; margin-bottom: 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; }
    .header-info h1 { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
    .header-info p { color: var(--text-muted); font-size: 14px; }
    .badge-snapshot { background: #065f46; color: #34d399; border: 1px solid #059669; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 18px; text-align: center; }
    .stat-num { font-size: 28px; font-weight: 800; color: var(--primary-light); }
    .stat-lbl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .section-box { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid var(--card-border); padding-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
    .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .media-card { background: #0f172a; border: 1px solid var(--card-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease; }
    .media-card:hover { transform: translateY(-3px); border-color: var(--primary); }
    .media-preview { width: 100%; height: 140px; background: #020617; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .media-preview img { width: 100%; height: 100%; object-fit: cover; }
    .media-info { padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .media-title { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
    .media-file { font-size: 10px; font-family: monospace; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .media-badge { align-self: flex-start; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
    .media-badge.logo { background: #831843; color: #f472b6; }
    .media-badge.hero { background: #1e3a8a; color: #93c5fd; }
    .media-badge.service { background: #064e3b; color: #6ee7b7; }
    .media-badge.product { background: #701a75; color: #f0abfc; }
    .media-badge.gallery { background: #14532d; color: #86efac; }
    .media-badge.blog { background: #7c2d12; color: #fdba74; }
    .media-badge.page { background: #431407; color: #fb923c; }
    .media-badge.testimonial { background: #581c87; color: #c084fc; }
    .media-badge.general { background: #334155; color: #cbd5e1; }
    .media-status { font-size: 10px; font-weight: bold; margin-top: auto; }
    .media-status.downloaded { color: #34d399; }
    .media-status.data_url { color: #38bdf8; }
    .media-status.fallback { color: #fbbf24; }
    .item-chip { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .item-chip strong { display: block; font-size: 14px; color: #fff; }
    .item-chip p { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; text-decoration: none; }
    .btn:hover { background: #2563eb; }
    .btn-secondary { background: #334155; color: #f1f5f9; }
    .btn-secondary:hover { background: #475569; }
    pre { background: #020617; border: 1px solid var(--card-border); padding: 16px; border-radius: 10px; overflow-x: auto; color: #38bdf8; font-size: 12px; max-height: 400px; }
    footer { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 40px; padding: 20px; border-top: 1px solid var(--card-border); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-info">
        <span class="badge-snapshot">✓ ÇEVRİMDIŞI SİTE SNAPSHOT YEDEĞİ</span>
        <h1 style="margin-top: 8px;">${company}</h1>
        <p>Arşivlenme Tarihi: ${dateStr} | Sürüm: ${manifest.version} | HızlıWeb Edge Altyapısı</p>
      </div>
      <div>
        <a href="siteConfig.json" download="siteConfig.json" class="btn">
          ⬇ siteConfig.json İndir
        </a>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">${manifest.summary.totalMediaAssets}</div>
        <div class="stat-lbl">Medya Varlığı</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${manifest.summary.servicesCount}</div>
        <div class="stat-lbl">Hizmet</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${manifest.summary.productsCount}</div>
        <div class="stat-lbl">Ürün</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${manifest.summary.blogPostsCount}</div>
        <div class="stat-lbl">Blog Yazısı</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${manifest.summary.configSizeKb} KB</div>
        <div class="stat-lbl">Konfig Boyutu</div>
      </div>
    </div>

    <!-- Media Assets Section -->
    <div class="section-box">
      <div class="section-title">
        <span>🖼️ Yerel Medya Arşivi (media/ Klasörü)</span>
        <span style="font-size: 12px; color: var(--text-muted);">${assets.length} Adet Dosya</span>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
        Bu arşivdeki tüm medya varlıkları bu HTML ile aynı dizindeki <code>media/</code> klasöründe yer alır. Çevrimdışı olarak bağımsız görüntülenebilir.
      </p>
      <div class="media-grid">
        ${mediaCardsHtml || '<p style="color: var(--text-muted); grid-column: 1/-1;">Kayıtlı medya varlığı bulunamadı.</p>'}
      </div>
    </div>

    <!-- Content Sections Overview -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div class="section-box">
        <div class="section-title">🛠️ Hizmetler (${(config.services?.items || []).length})</div>
        <div>${servicesHtml || '<p style="color: var(--text-muted);">Tanımlı hizmet yok.</p>'}</div>
      </div>
      <div class="section-box">
        <div class="section-title">📦 Ürünler & Fiyatlar (${(config.products?.items || []).length})</div>
        <div>${productsHtml || '<p style="color: var(--text-muted);">Tanımlı ürün yok.</p>'}</div>
      </div>
    </div>

    <!-- Raw JSON Inspector -->
    <div class="section-box">
      <div class="section-title">
        <span>📄 siteConfig.json Önizleme</span>
        <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(JSON.stringify(rawConfig, null, 2)); alert('siteConfig.json panoya kopyalandı!');">📋 JSON Kopyala</button>
      </div>
      <pre id="json-viewer"></pre>
    </div>

    <footer>
      ⚡ HızlıWeb.com.tr One-Click Site Snapshot • Tamamen Çevrimdışı Güvenli Yerel Depolama
    </footer>
  </div>

  <script>
    const rawConfig = ${safeJson};
    document.getElementById('json-viewer').textContent = JSON.stringify(rawConfig, null, 2);
  </script>
</body>
</html>`;
}

/**
 * Executes a one-click manual site snapshot:
 * 1. Collects all media references from siteConfig.
 * 2. Fetches media data / decodes base64 data URLs.
 * 3. Packages siteConfig.json, all media assets into a 'media/' folder, manifest, README, and offline viewer HTML.
 * 4. Downloads as a single .zip file.
 * 5. Records a backup entry into localStorage history.
 */
export async function downloadOneClickSiteSnapshot(
  config: SiteConfig,
  onProgress?: (progress: SnapshotProgress) => void
): Promise<SnapshotResult> {
  const updateProgress = (
    step: SnapshotProgress["step"],
    percent: number,
    message: string,
    downloadedCount = 0,
    totalAssets = 0,
    currentAsset?: string
  ) => {
    if (onProgress) {
      onProgress({
        step,
        percent,
        message,
        downloadedCount,
        totalAssets,
        currentAsset
      });
    }
  };

  try {
    updateProgress("scanning", 10, "Site konfigürasyonu taranıyor ve doğrulanıyor...");

    const serializedConfig = JSON.stringify(config, null, 2);
    const configSizeKb = Math.round((serializedConfig.length / 1024) * 10) / 10;
    const company = config.companyName || "HizliWeb";
    const companySlug = slugify(company);
    const dateStamp = getTodayDateString();
    const timeStamp = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
    const zipFilename = `${companySlug}-site-snapshot-${dateStamp}_${timeStamp}.zip`;

    // 1. Collect all media
    updateProgress("scanning", 20, "Tüm medya varlıkları (Galeri, Logo, Hizmetler, Ürünler) tespit ediliyor...");
    const discoveredAssets = collectAllMediaAssets(config);
    const totalAssets = discoveredAssets.length;

    updateProgress(
      "fetching_media",
      30,
      `${totalAssets} adet medya varlığı bulundu. Dosyalar yerel olarak paketleniyor...`,
      0,
      totalAssets
    );

    const zip = new JSZip();
    const mediaFolder = zip.folder("media");

    let downloadedAssets = 0;
    let fallbackAssets = 0;

    // 2. Fetch and package each media asset
    for (let i = 0; i < discoveredAssets.length; i++) {
      const asset = discoveredAssets[i];
      const progressPercent = Math.round(30 + ((i + 1) / totalAssets) * 45);

      updateProgress(
        "fetching_media",
        progressPercent,
        `Medya indiriliyor (${i + 1}/${totalAssets}): ${asset.title}`,
        downloadedAssets,
        totalAssets,
        asset.title
      );

      try {
        if (asset.sourceUrl.startsWith("data:")) {
          // Data URL conversion
          const converted = dataUrlToArrayBuffer(asset.sourceUrl);
          if (converted && mediaFolder) {
            mediaFolder.file(asset.targetFilename, converted.buffer);
            asset.status = "data_url";
            asset.sizeBytes = converted.buffer.byteLength;
            downloadedAssets++;
          } else {
            throw new Error("Data URL convert failed");
          }
        } else {
          // Attempt HTTP fetch
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout per asset

          try {
            const resp = await fetch(asset.sourceUrl, {
              mode: "cors",
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (resp.ok) {
              const arrayBuffer = await resp.arrayBuffer();
              if (mediaFolder) {
                mediaFolder.file(asset.targetFilename, arrayBuffer);
                asset.status = "downloaded";
                asset.sizeBytes = arrayBuffer.byteLength;
                downloadedAssets++;
              }
            } else {
              throw new Error(`Fetch response not ok: ${resp.status}`);
            }
          } catch (fetchErr) {
            // Graceful fallback: CORS restriction or offline link
            clearTimeout(timeoutId);
            const fallbackBlob = createFallbackImageBlob(asset, company);
            const fallbackBuffer = await fallbackBlob.arrayBuffer();
            const fallbackFilename = asset.targetFilename.replace(/\.[a-zA-Z0-9]+$/, ".svg");
            asset.targetFilename = fallbackFilename;
            if (mediaFolder) {
              mediaFolder.file(fallbackFilename, fallbackBuffer);
            }
            asset.status = "fallback";
            asset.sizeBytes = fallbackBuffer.byteLength;
            asset.notes = "CORS veya uzak sunucu kısıtlaması nedeniyle çevrimdışı görsel referansı olarak paketlendi.";
            fallbackAssets++;
          }
        }
      } catch (assetErr) {
        // Fallback placeholder
        const fallbackBlob = createFallbackImageBlob(asset, company);
        const fallbackBuffer = await fallbackBlob.arrayBuffer();
        const fallbackFilename = asset.targetFilename.replace(/\.[a-zA-Z0-9]+$/, ".svg");
        asset.targetFilename = fallbackFilename;
        if (mediaFolder) {
          mediaFolder.file(fallbackFilename, fallbackBuffer);
        }
        asset.status = "fallback";
        asset.sizeBytes = fallbackBuffer.byteLength;
        fallbackAssets++;
      }
    }

    // 3. Build snapshot manifest
    updateProgress("building_zip", 80, "siteConfig.json ve manifest dosyaları oluşturuluyor...", downloadedAssets, totalAssets);

    const manifest: SnapshotManifest = {
      appName: "HızlıWeb.com.tr Site Snapshot Engine",
      generator: "One-Click Offline Snapshot Suite v1.0",
      version: "1.0",
      createdAt: new Date().toISOString(),
      companyName: company,
      siteId: config.id || "default",
      summary: {
        pageCount: config.pages?.length || 0,
        servicesCount: config.services?.items?.length || 0,
        productsCount: config.products?.items?.length || 0,
        blogPostsCount: config.blog?.items?.length || 0,
        galleryCount: config.gallery?.items?.length || 0,
        leadsCount: config.leads?.length || 0,
        totalMediaAssets: totalAssets,
        downloadedMediaAssets: downloadedAssets,
        configSizeKb
      },
      mediaAssets: discoveredAssets.map((a) => ({
        category: a.category,
        title: a.title,
        sourceUrl: a.sourceUrl.substring(0, 120),
        localPath: `media/${a.targetFilename}`,
        status: a.status,
        sizeBytes: a.sizeBytes
      }))
    };

    // 4. Add core files to ZIP
    zip.file("siteConfig.json", serializedConfig);
    zip.file("snapshot-manifest.json", JSON.stringify(manifest, null, 2));

    // Media manifest inside media/
    if (mediaFolder) {
      mediaFolder.file("media-manifest.json", JSON.stringify(manifest.mediaAssets, null, 2));
    }

    // README file
    const readmeContent = `================================================================================
⚡ HIZLIWEB - TEK TIKLA SİTE SNAPSHOT VE ÇEVRİMDISI YEDEK PAKETİ
================================================================================

Şirket / Web Sitesi: ${company}
Snapshot Oluşturma Tarihi: ${formatBackupDate(Date.now())}
Orijinal Site ID: ${config.id || "default"}
Yedek Dosya Adı: ${zipFilename}

--------------------------------------------------------------------------------
📦 BU ARŞİVİN İÇERİĞİ:
--------------------------------------------------------------------------------
1. siteConfig.json
   Web sitenizin tüm ayarlarını, metinlerini, renk paletini, sayfalarını,
   hizmetlerini, ürünlerini ve SEO yapılandırmasını içeren eksiksiz JSON veri tabanı.
   HızlıWeb Müşteri Paneli > "Yedekler" sekmesinden doğrudan geri yüklenebilir.

2. media/ Klasörü
   Sitenizde yer alan tüm görseller (${totalAssets} adet medya varlığı):
   - Logo ve Favicon
   - Hero / Manşet arkaplan görselleri
   - Hizmet ve Ürün katalog fotoğrafları
   - Galeri fotoğrafları
   - Blog kapak resimleri
   - Müşteri yorumları profil avatarları
   - Medya kütüphanesi dosyaları

3. snapshot-manifest.json
   Tüm medya dosyalarının kaynak URL'leri ve yerel dosya eşleşmelerini içeren indeks.

4. index-offline-viewer.html
   Bu HTML dosyasını herhangi bir tarayıcıda (Chrome, Safari, Edge) çift tıklayarak
   açabilirsiniz. İnternet bağlantısı olmadan sitenizin içeriğini ve medya
   galerisini yerel olarak incelemenizi sağlar.

--------------------------------------------------------------------------------
🔄 BU YEDEĞİ GERİ YÜKLEME (RESTORE) REHBERİ:
--------------------------------------------------------------------------------
1. HızlıWeb Müşteri Panelinize giriş yapın.
2. Üst menüden "Yedekler" (Backups) sekmesini açın.
3. "Yedek İçe Aktar" (JSON Yükle) butonuna tıklayın.
4. Bu arşiv içerisindeki "siteConfig.json" dosyasını seçin.
5. Siteniz saniyeler içerisinde bu snapshot'taki tüm içerik ve düzenine geri dönecektir.

© ${new Date().getFullYear()} HızlıWeb.com.tr - Dünyanın En Hızlı Web Sitesi Altyapısı.
Tüm hakları saklıdır.
`;
    zip.file("README-OFFLINE-STORAGE.txt", readmeContent);

    // 5. Offline Viewer HTML
    updateProgress("generating_viewer", 90, "Çevrimdışı etkileşimli HTML görüntüleyici hazırlanıyor...", downloadedAssets, totalAssets);
    const viewerHtml = buildOfflineViewerHtml(config, discoveredAssets, manifest);
    zip.file("index-offline-viewer.html", viewerHtml);

    // 6. Generate ZIP Blob and trigger download
    updateProgress("finalizing", 95, "ZIP arşivi sıkıştırılıyor ve indirme başlatılıyor...", downloadedAssets, totalAssets);
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    const zipSizeBytes = zipBlob.size;

    // Trigger browser download
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = zipFilename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);

    // 7. Also record this in the internal backup history!
    try {
      createManualBackup(
        config,
        `Tek Tıkla Site Snapshot (${totalAssets} Medya, ${Math.round(zipSizeBytes / 1024)} KB ZIP)`
      );
    } catch {
      // ignore localStorage quota warnings
    }

    updateProgress("completed", 100, "Site Snapshot ve tüm medya varlıkları başarıyla indirildi!", downloadedAssets, totalAssets);

    return {
      success: true,
      zipFilename,
      zipSizeBytes,
      totalAssets,
      downloadedAssets,
      fallbackAssets,
      configSizeKb,
      manifest
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu";
    updateProgress("error", 0, `Hata: ${errorMsg}`);
    return {
      success: false,
      zipFilename: "",
      zipSizeBytes: 0,
      totalAssets: 0,
      downloadedAssets: 0,
      fallbackAssets: 0,
      configSizeKb: 0,
      manifest: {} as SnapshotManifest,
      error: errorMsg
    };
  }
}
