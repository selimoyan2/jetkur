import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { SiteConfig } from "../../types";
import {
  burnLogoIntoQrCode,
  generateBrandedQrSvg,
  renderMarketingTemplateCanvas,
  downloadCanvasAsPng
} from "../../utils/qrMarketingCanvas";
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Store,
  FileImage,
  Sparkles,
  Printer,
  ChevronRight,
  CheckCircle2,
  Package
} from "lucide-react";

interface QrMarketingQuickCardProps {
  config: SiteConfig;
  onNavigateToQrStudio: () => void;
}

export const QrMarketingQuickCard: React.FC<QrMarketingQuickCardProps> = ({
  config,
  onNavigateToQrStudio
}) => {
  // Determine canonical live URL
  const primaryDomain = useMemo(() => {
    if (config.cloudflare?.customDomain) {
      return config.cloudflare.customDomain.startsWith("http")
        ? config.cloudflare.customDomain
        : `https://${config.cloudflare.customDomain}`;
    }
    if (config.cloudflare?.deployedUrl) {
      return config.cloudflare.deployedUrl;
    }
    const sub = config.cloudflare?.subdomain || "sirket";
    return `https://${sub}.hizliweb.site`;
  }, [config.cloudflare]);

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [burnedQrDataUrl, setBurnedQrDataUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const safeCompanyName = useMemo(() => {
    return config.companyName
      ? config.companyName.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")
      : "firma";
  }, [config.companyName]);

  useEffect(() => {
    let isCancelled = false;

    const generateInitialQr = async () => {
      try {
        const png = await QRCode.toDataURL(primaryDomain, {
          errorCorrectionLevel: "H",
          width: 1024,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff"
          }
        });

        const effectiveLogo = config.header?.logoImage && config.header.logoType === "image" ? config.header.logoImage : undefined;

        const svg = await generateBrandedQrSvg({
          url: primaryDomain,
          fgColor: "#0f172a",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          includeCenterBadge: true,
          companyName: config.companyName || "W",
          logoImage: effectiveLogo,
          badgeShape: "rounded",
          badgeBgColor: "#f59e0b"
        });

        const burned = await burnLogoIntoQrCode(
          png,
          1024,
          "#0f172a",
          config.companyName || "W",
          effectiveLogo
        );

        if (!isCancelled) {
          setQrDataUrl(png);
          setBurnedQrDataUrl(burned);
          setQrSvgString(svg);
        }
      } catch (err) {
        console.error("Quick QR generation failed:", err);
      }
    };

    generateInitialQr();

    return () => {
      isCancelled = true;
    };
  }, [primaryDomain, config.companyName, config.header?.logoImage, config.header?.logoType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(primaryDomain);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadRawPng = () => {
    const activeUrl = burnedQrDataUrl || qrDataUrl;
    if (!activeUrl) return;
    const a = document.createElement("a");
    a.href = activeUrl;
    a.download = `${safeCompanyName}_web_qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadNotice("PNG QR İndirildi");
    setTimeout(() => setDownloadNotice(null), 2500);
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeCompanyName}_web_qr_vektorel.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotice("Vektörel SVG İndirildi");
    setTimeout(() => setDownloadNotice(null), 2500);
  };

  const handleQuickDownloadTemplate = async (template: "table-stand" | "window-sticker") => {
    const activeUrl = burnedQrDataUrl || qrDataUrl;
    if (!activeUrl) return;

    try {
      setIsExporting(true);
      const canvas = await renderMarketingTemplateCanvas(template, activeUrl, config, primaryDomain);
      const filename = `${safeCompanyName}_pazarlama_${template}.png`;
      downloadCanvasAsPng(canvas, filename);

      setDownloadNotice(template === "table-stand" ? "Masa Kartı İndirildi (PNG)" : "Vitrin Çıkartması İndirildi (PNG)");
      setTimeout(() => setDownloadNotice(null), 3000);
    } catch (err) {
      console.error("Template generation error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm text-white space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info & direct links */}
        <div className="flex items-start gap-4">
          {/* QR thumbnail box */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-2xl border-2 border-amber-400/80 shadow-md shrink-0 flex items-center justify-center relative group">
            {(burnedQrDataUrl || qrDataUrl) ? (
              <img
                src={burnedQrDataUrl || qrDataUrl}
                alt="Web Sitesi QR Kodu"
                className="w-full h-full object-contain"
              />
            ) : (
              <QrCode className="w-10 h-10 text-slate-400 animate-pulse" />
            )}
            <div className="absolute -bottom-2 bg-slate-950 text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-400/50 shadow-xs">
              Canlı QR
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Pazarlama &amp; Baskı Kiti
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>300 DPI Baskı Uyumlu</span>
              </span>
              {downloadNotice && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30 animate-pulse">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{downloadNotice}</span>
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Web Siteniz İçin Dinamik QR Kod &amp; Pazarlama Materyalleri
            </h3>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Müşterilerinizin telefon kamerasıyla anında sitenize ulaşmasını sağlayın. Masa üstü standı, vitrin etiketi veya matbaa için vektörel SVG formatında doğrudan indirin.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              <span className="font-mono text-amber-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] truncate max-w-xs sm:max-w-md">
                {primaryDomain}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? "Kopyalandı" : "Kopyala"}</span>
              </button>
              <a
                href={primaryDomain}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Test Et</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-center">
          <button
            type="button"
            onClick={onNavigateToQrStudio}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Store className="w-4 h-4" />
            <span>Pazarlama Kitini Özelleştir</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleDownloadRawPng}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-slate-700 cursor-pointer"
              title="Yüksek çözünürlüklü PNG indir"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>PNG QR</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-slate-700 cursor-pointer"
              title="Matbaalar için vektörel SVG indir"
            >
              <FileImage className="w-3.5 h-3.5 text-purple-400" />
              <span>SVG Vektör</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDownloadTemplate("table-stand")}
              disabled={isExporting}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-black text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 border border-amber-500/30 cursor-pointer disabled:opacity-50"
              title="Masa Üstü Kartını Doğrudan PNG Olarak İndir"
            >
              <Download className="w-3 h-3" />
              <span>Masa Kartı PNG</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDownloadTemplate("window-sticker")}
              disabled={isExporting}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-black text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 border border-amber-500/30 cursor-pointer disabled:opacity-50"
              title="Vitrin Çıkartmasını Doğrudan PNG Olarak İndir"
            >
              <Download className="w-3 h-3" />
              <span>Vitrin PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
