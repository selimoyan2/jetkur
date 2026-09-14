import QRCode from "qrcode";
import { SiteConfig } from "../types";

export type MarketingTemplateType =
  | "table-stand"
  | "window-sticker"
  | "business-card"
  | "social-story"
  | "packaging-label";

export interface BrandedQrSvgOptions {
  url: string;
  fgColor?: string;
  bgColor?: string;
  isTransparentBg?: boolean;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  includeCenterBadge?: boolean;
  companyName: string;
  logoImage?: string;
  badgeShape?: "rounded" | "circle";
  badgeBgColor?: string;
  withCardFrame?: boolean;
  ctaText?: string;
}

// Fallback helper for drawing rounded rectangle
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Loads an image safely with promise
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
    img.src = src;
  });
}

// Burns the center logo/monogram badge directly into the QR code data URL
export async function burnLogoIntoQrCode(
  qrDataUrl: string,
  size: number,
  fgColor: string,
  companyName: string,
  logoImage?: string,
  badgeShape: "rounded" | "circle" = "rounded",
  badgeBgColor: string = "#f59e0b"
): Promise<string> {
  try {
    const qrImg = await loadImage(qrDataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return qrDataUrl;

    // Draw main QR code
    ctx.drawImage(qrImg, 0, 0, size, size);

    // Center badge dimensions (~22% of QR size preserves scanability with Error Correction Level H)
    const badgeSize = Math.round(size * 0.22);
    const x = (size - badgeSize) / 2;
    const y = (size - badgeSize) / 2;
    const radius = badgeShape === "circle" ? Math.round(badgeSize / 2) : Math.round(badgeSize * 0.22);

    // White backing with dark border
    ctx.save();
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, x - 4, y - 4, badgeSize + 8, badgeSize + 8, radius + 2);
    ctx.fill();

    ctx.strokeStyle = fgColor;
    ctx.lineWidth = Math.max(2, Math.round(size * 0.006));
    ctx.stroke();

    // Try drawing logo image
    let logoDrawn = false;
    if (logoImage && (logoImage.startsWith("data:") || logoImage.startsWith("http"))) {
      try {
        const logo = await loadImage(logoImage);
        ctx.save();
        drawRoundRect(ctx, x, y, badgeSize, badgeSize, radius);
        ctx.clip();
        ctx.drawImage(logo, x, y, badgeSize, badgeSize);
        ctx.restore();
        logoDrawn = true;
      } catch {
        logoDrawn = false;
      }
    }

    if (!logoDrawn) {
      // Draw stylized company monogram
      ctx.fillStyle = badgeBgColor;
      drawRoundRect(ctx, x, y, badgeSize, badgeSize, radius);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = `900 ${Math.round(badgeSize * 0.55)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const initial = (companyName || "W").trim().charAt(0).toUpperCase();
      ctx.fillText(initial, x + badgeSize / 2, y + badgeSize / 2);
    }

    ctx.restore();
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("Logo burning failed, using bare QR:", err);
    return qrDataUrl;
  }
}

// Generates a true, scalable vector SVG with center branded emblem or framed card
export async function generateBrandedQrSvg(options: BrandedQrSvgOptions): Promise<string> {
  const {
    url,
    fgColor = "#0f172a",
    bgColor = "#ffffff",
    isTransparentBg = false,
    errorCorrectionLevel = "H",
    includeCenterBadge = true,
    companyName,
    logoImage,
    badgeShape = "rounded",
    badgeBgColor = "#f59e0b",
    withCardFrame = false,
    ctaText = "📱 KAMERANIZLA OKUTUNUZ"
  } = options;

  const rawSvg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel,
    margin: withCardFrame ? 1 : 2,
    color: {
      dark: fgColor,
      light: isTransparentBg ? "#00000000" : bgColor
    }
  });

  // Extract viewBox width/height from QRCode output (e.g. viewBox="0 0 37 37")
  const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  const qrSize = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 37;

  // Center badge dimensions (~22% of QR size preserves scanability with Level H error correction)
  const badgeSize = qrSize * 0.22;
  const x = (qrSize - badgeSize) / 2;
  const y = (qrSize - badgeSize) / 2;
  const rx = badgeShape === "circle" ? badgeSize / 2 : badgeSize * 0.22;
  const initial = (companyName || "W").trim().charAt(0).toUpperCase();

  // Strip closing </svg> so we can inject elements
  let modifiedSvg = rawSvg.replace(/<\/svg>\s*$/, "");

  // If transparent background requested, remove the background rectangle path if it exists
  if (isTransparentBg) {
    modifiedSvg = modifiedSvg.replace(/<path fill="#00000000" [^>]+>/, "");
  }

  if (includeCenterBadge) {
    const strokeWidth = Math.max(0.25, qrSize * 0.008);
    const clipId = `qr-clip-${Math.random().toString(36).substring(2, 7)}`;

    let badgeSvg = `
  <g id="branded-center-badge">
    <!-- Center white backing shield to isolate QR modules -->
    <rect x="${x - 0.4}" y="${y - 0.4}" width="${badgeSize + 0.8}" height="${badgeSize + 0.8}" rx="${rx + 0.2}" fill="#ffffff" stroke="${fgColor}" stroke-width="${strokeWidth}" />
`;

    if (logoImage && (logoImage.startsWith("data:") || logoImage.startsWith("http"))) {
      badgeSvg += `
    <defs>
      <clipPath id="${clipId}">
        <rect x="${x}" y="${y}" width="${badgeSize}" height="${badgeSize}" rx="${rx}" />
      </clipPath>
    </defs>
    <image href="${logoImage}" x="${x}" y="${y}" width="${badgeSize}" height="${badgeSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />
`;
    } else {
      badgeSvg += `
    <rect x="${x}" y="${y}" width="${badgeSize}" height="${badgeSize}" rx="${rx}" fill="${badgeBgColor}" />
    <text x="${x + badgeSize / 2}" y="${y + badgeSize / 2 + (badgeSize * 0.04)}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${badgeSize * 0.55}" fill="#0f172a">${initial}</text>
`;
    }

    badgeSvg += `  </g>\n`;
    modifiedSvg += badgeSvg;
  }

  modifiedSvg += `</svg>`;

  if (!withCardFrame) {
    return modifiedSvg;
  }

  // If withCardFrame, wrap in a complete scalable vector presentation card
  const cardWidth = 600;
  const cardHeight = 780;
  const innerQrSize = 380;
  const innerQrX = (cardWidth - innerQrSize) / 2;
  const innerQrY = 165;

  const innerContent = modifiedSvg
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>/, "");

  const safeUrl = url.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeCompany = (companyName || "Web Sitemiz").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeCta = ctaText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const framedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${cardWidth} ${cardHeight}" width="${cardWidth}" height="${cardHeight}">
  <defs>
    <linearGradient id="cardBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Outer Card Frame -->
  <rect x="15" y="15" width="${cardWidth - 30}" height="${cardHeight - 30}" rx="32" fill="url(#cardBgGrad)" stroke="#e2e8f0" stroke-width="2" filter="url(#cardShadow)" />

  <!-- Top Accent Bar -->
  <rect x="240" y="36" width="120" height="6" rx="3" fill="${fgColor}" />

  <!-- Business Emblem / Initial -->
  <rect x="272" y="55" width="56" height="56" rx="16" fill="${fgColor}" />
  <text x="300" y="85" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#f59e0b">${initial}</text>

  <!-- Business Name -->
  <text x="300" y="132" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="26" fill="#0f172a">${safeCompany}</text>

  <!-- QR Inner Box Container -->
  <rect x="${innerQrX - 10}" y="${innerQrY - 10}" width="${innerQrSize + 20}" height="${innerQrSize + 20}" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />

  <!-- Nested Scalable QR Code -->
  <svg x="${innerQrX}" y="${innerQrY}" width="${innerQrSize}" height="${innerQrSize}" viewBox="0 0 ${qrSize} ${qrSize}">
    ${innerContent}
  </svg>

  <!-- Call to Action Pill Button -->
  <rect x="150" y="575" width="300" height="48" rx="24" fill="${fgColor}" />
  <text x="300" y="600" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="15" fill="#ffffff">${safeCta}</text>

  <!-- Website URL Caption -->
  <text x="300" y="650" text-anchor="middle" font-family="monospace, Courier" font-weight="700" font-size="14" fill="#64748b">${safeUrl}</text>

  <!-- Subtle Footer Info -->
  <text x="300" y="710" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">Kayıpsız Vektörel Baskı Formatı (SVG) • Tüm Tasarım &amp; Matbaa Programlarıyla Uyumlu</text>
</svg>`;

  return framedSvg;
}

// Renders complete marketing material templates ready for print or digital distribution
export async function renderMarketingTemplateCanvas(
  template: MarketingTemplateType,
  qrDataUrl: string,
  config: SiteConfig,
  resolvedUrl: string
): Promise<HTMLCanvasElement> {
  const qrImg = await loadImage(qrDataUrl);
  const companyName = config.companyName || "İşletme Adı";
  const slogan = config.slogan || "Kaliteli Hizmet & Müşteri Memnuniyeti";
  const phone = config.phone || "";
  const whatsapp = config.whatsapp || config.phone || "";
  const city = config.city || "Türkiye";
  const initial = companyName.charAt(0).toUpperCase();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");

  switch (template) {
    case "table-stand": {
      // A5/A6 Tent Table Stand (1200 x 1600 px)
      canvas.width = 1200;
      canvas.height = 1600;

      // Background Gradient (Deep Amber into Slate-950)
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1600);
      bgGrad.addColorStop(0, "#f59e0b");
      bgGrad.addColorStop(0.35, "#d97706");
      bgGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Outer border
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 24;
      ctx.strokeRect(12, 12, 1176, 1576);

      // Inner card frame
      ctx.fillStyle = "#ffffff";
      drawRoundRect(ctx, 60, 60, 1080, 1480, 48);
      ctx.fill();

      // Top Header Pill
      ctx.fillStyle = "#0f172a";
      drawRoundRect(ctx, 350, 100, 500, 56, 28);
      ctx.fill();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MASA ÜSTÜ DİJİTAL MENÜ & HİZMET", 600, 128);

      // Company Monogram & Name
      ctx.fillStyle = "#0f172a";
      drawRoundRect(ctx, 550, 180, 100, 100, 24);
      ctx.fill();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 56px sans-serif";
      ctx.fillText(initial, 600, 230);

      // Company Name
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 46px sans-serif";
      ctx.fillText(companyName, 600, 320);

      // Slogan
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(slogan, 600, 365);

      // QR Code Container Box
      ctx.fillStyle = "#f8fafc";
      drawRoundRect(ctx, 250, 420, 700, 700, 40);
      ctx.fill();

      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw QR Image
      ctx.drawImage(qrImg, 290, 460, 620, 620);

      // Call to action pill under QR
      ctx.fillStyle = "#0f172a";
      drawRoundRect(ctx, 320, 1150, 560, 64, 32);
      ctx.fill();

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("📱 KAMERANIZLA OKUTUNUZ", 600, 1182);

      // Instruction subtitle
      ctx.fillStyle = "#475569";
      ctx.font = "500 22px sans-serif";
      ctx.fillText("Menü, fiyatlar ve doğrudan sipariş için telefonunuzu tutun.", 600, 1245);

      // Resolved URL
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 24px monospace";
      ctx.fillText(resolvedUrl, 600, 1290);

      // Footer divider
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(120, 1340);
      ctx.lineTo(1080, 1340);
      ctx.stroke();

      // Footer Contacts
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 24px sans-serif";
      let footerText = "";
      if (phone) footerText += `📞 Tel: ${phone}   `;
      if (whatsapp) footerText += `💬 WhatsApp: ${whatsapp}   `;
      if (!footerText) footerText = `📍 ${city}`;
      ctx.fillText(footerText.trim(), 600, 1390);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px sans-serif";
      ctx.fillText("Anında Erişim • Hızlı ve Temassız", 600, 1435);
      break;
    }

    case "window-sticker": {
      // 1400 x 1400 px Square Window & Door Decal
      canvas.width = 1400;
      canvas.height = 1400;

      // Dark Obsidian Luxury Background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, 1400, 1400);

      // Gold Double Borders
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 14;
      drawRoundRect(ctx, 30, 30, 1340, 1340, 40);
      ctx.stroke();

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      drawRoundRect(ctx, 48, 48, 1304, 1304, 30);
      ctx.stroke();

      // Top Gold Pill
      ctx.fillStyle = "#f59e0b";
      drawRoundRect(ctx, 450, 70, 500, 60, 30);
      ctx.fill();

      ctx.fillStyle = "#090d16";
      ctx.font = "900 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✨ 7/24 DİJİTAL DÜKKAN & SİPARİŞ", 700, 100);

      // Company Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 52px sans-serif";
      ctx.fillText(companyName, 700, 185);

      // Subtitle
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("Tüm ürünlerimizi ve güncel fiyat listemizi telefonunuzdan inceleyin", 700, 240);

      // White QR Box
      ctx.fillStyle = "#ffffff";
      drawRoundRect(ctx, 350, 290, 700, 700, 40);
      ctx.fill();

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw QR Code
      ctx.drawImage(qrImg, 390, 330, 620, 620);

      // Under QR Instruction
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 34px monospace";
      ctx.fillText(resolvedUrl, 700, 1045);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("📱 Kameranızı Ekrana Tutunuz", 700, 1095);

      // Bottom address & details
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 1140);
      ctx.lineTo(1200, 1140);
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`📍 ${config.address || city}  •  📞 ${phone || "Bize Ulaşın"}`, 700, 1190);

      ctx.fillStyle = "#64748b";
      ctx.font = "20px sans-serif";
      ctx.fillText("Hızlı Sipariş • Doğrudan WhatsApp • Güncel Menü", 700, 1235);
      break;
    }

    case "business-card": {
      // 1600 x 900 px 16:9 Business Card & Flyer Back
      canvas.width = 1600;
      canvas.height = 900;

      // Clean White Card with Slate Left Frame
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1600, 900);

      // Slate Left Header Accent Bar
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 30, 900);

      // Border around entire card
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 1596, 896);

      // Left Column Content: Brand & Contacts
      // Monogram
      ctx.fillStyle = "#0f172a";
      drawRoundRect(ctx, 80, 80, 80, 80, 20);
      ctx.fill();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initial, 120, 120);

      // Company Name
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 48px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(companyName, 180, 120);

      // Slogan
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(slogan, 80, 200);

      // Divider
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 240);
      ctx.lineTo(880, 240);
      ctx.stroke();

      // Contact details
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 26px sans-serif";
      let yOffset = 300;

      if (phone) {
        ctx.fillText(`📞 Telefon: ${phone}`, 80, yOffset);
        yOffset += 50;
      }

      if (whatsapp) {
        ctx.fillText(`💬 WhatsApp: ${whatsapp}`, 80, yOffset);
        yOffset += 50;
      }

      ctx.fillStyle = "#d97706";
      ctx.font = "bold 24px monospace";
      ctx.fillText(`🌐 ${resolvedUrl}`, 80, yOffset);
      yOffset += 50;

      ctx.fillStyle = "#475569";
      ctx.font = "500 22px sans-serif";
      ctx.fillText(`📍 Konum: ${city} / Türkiye`, 80, yOffset);

      // Call to action banner at left bottom
      ctx.fillStyle = "#f8fafc";
      drawRoundRect(ctx, 80, 600, 800, 180, 24);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 24px sans-serif";
      ctx.fillText("Kameranızla QR Kodu Okutarak:", 110, 650);

      ctx.fillStyle = "#64748b";
      ctx.font = "20px sans-serif";
      ctx.fillText("• Güncel fiyat listemizi ve katalog ürünlerini anında inceleyin", 110, 690);
      ctx.fillText("• WhatsApp üzerinden tek tıkla doğrudan mesaj gönderin", 110, 725);
      ctx.fillText("• Adresimizi haritada açıp tek dokunuşla yol tarifi alın", 110, 760);

      // Right Column: QR Code Box
      ctx.fillStyle = "#f8fafc";
      drawRoundRect(ctx, 960, 100, 560, 680, 36);
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.drawImage(qrImg, 1000, 140, 480, 480);

      // QR label
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📱 Detaylı Bilgi İçin Okutun", 1240, 665);

      ctx.fillStyle = "#64748b";
      ctx.font = "18px monospace";
      ctx.fillText(resolvedUrl, 1240, 705);
      break;
    }

    case "social-story": {
      // 1080 x 1920 px 9:16 Social Story & WhatsApp Status
      canvas.width = 1080;
      canvas.height = 1920;

      // Indigo to Slate Luxury Gradient
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.4, "#1e1b4b");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Decorative Top Banner
      ctx.fillStyle = "#f59e0b";
      drawRoundRect(ctx, 290, 140, 500, 64, 32);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🚀 YENİ WEB SİTEMİZ YAYINDA!", 540, 172);

      // Company Emblem
      ctx.fillStyle = "#ffffff";
      drawRoundRect(ctx, 480, 260, 120, 120, 30);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 64px sans-serif";
      ctx.fillText(initial, 540, 320);

      // Company Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px sans-serif";
      ctx.fillText(companyName, 540, 430);

      // Slogan
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(slogan, 540, 485);

      // QR White Container
      ctx.fillStyle = "#ffffff";
      drawRoundRect(ctx, 160, 560, 760, 760, 48);
      ctx.fill();

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 12;
      ctx.stroke();

      // Draw QR
      ctx.drawImage(qrImg, 200, 600, 680, 680);

      // Scan Instructions
      ctx.fillStyle = "#fbbf24";
      drawRoundRect(ctx, 220, 1370, 640, 70, 35);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 26px sans-serif";
      ctx.fillText("👆 KAMERANIZLA OKUTUNUZ", 540, 1405);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 30px monospace";
      ctx.fillText(resolvedUrl, 540, 1485);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "22px sans-serif";
      ctx.fillText("Ekrandan doğrudan okutabilir veya ekran görüntüsü alabilirsiniz.", 540, 1535);

      // Bottom features box
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      drawRoundRect(ctx, 120, 1600, 840, 180, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`📞 İletişim: ${phone || whatsapp || "Web Sitemiz"}`, 540, 1660);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px sans-serif";
      ctx.fillText(`📍 ${city}  •  Online Sipariş & Hızlı Teklif`, 540, 1710);
      break;
    }

    case "packaging-label": {
      // 1200 x 1200 px Square Sticker for Packaging, Boxes & Bags
      canvas.width = 1200;
      canvas.height = 1200;

      // Clean White Background with Circular Dashed Die-Cut Guide
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1200, 1200);

      // Outer Rounded Border
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 12;
      drawRoundRect(ctx, 30, 30, 1140, 1140, 48);
      ctx.stroke();

      // Top Thank You Header Banner
      ctx.fillStyle = "#0f172a";
      drawRoundRect(ctx, 250, 70, 700, 64, 32);
      ctx.fill();

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("❤️ BİZİ TERCİH ETTİĞİNİZ İÇİN TEŞEKKÜRLER", 600, 102);

      // Company Name
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 48px sans-serif";
      ctx.fillText(companyName, 600, 180);

      // Slogan / Subtitle
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(slogan || "Online Sipariş & Müşteri Hizmetleri", 600, 225);

      // Center White Box for QR
      ctx.fillStyle = "#f8fafc";
      drawRoundRect(ctx, 300, 270, 600, 600, 36);
      ctx.fill();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw QR Image
      ctx.drawImage(qrImg, 330, 300, 540, 540);

      // Call to action pill under QR
      ctx.fillStyle = "#f59e0b";
      drawRoundRect(ctx, 300, 910, 600, 64, 32);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 24px sans-serif";
      ctx.fillText("📱 TEKRAR SİPARİŞ & GÜNCEL MENÜ", 600, 942);

      // Website URL
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 26px monospace";
      ctx.fillText(resolvedUrl, 600, 1020);

      // Bottom Info
      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px sans-serif";
      ctx.fillText("Kameranızı tutarak doğrudan web sitemize ulaşabilirsiniz", 600, 1070);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`📍 ${city}  •  📞 ${phone || "Bize Ulaşın"}`, 600, 1115);
      break;
    }
  }

  return canvas;
}

// Download canvas directly as PNG
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
