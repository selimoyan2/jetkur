import React, { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import { SiteConfig } from "../../types";
import {
  burnLogoIntoQrCode,
  generateBrandedQrSvg,
  renderMarketingTemplateCanvas,
  downloadCanvasAsPng,
  MarketingTemplateType
} from "../../utils/qrMarketingCanvas";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
  Share2,
  Globe,
  MessageCircle,
  Phone,
  Layers,
  Palette,
  Eye,
  Sliders,
  CheckCircle2,
  FileImage,
  RefreshCw,
  Store,
  FileText,
  CreditCard,
  Smartphone,
  Package,
  BarChart3,
  Target,
  Zap,
  Tag,
  Upload,
  X,
  ChevronDown
} from "lucide-react";

interface QrCodeManagerProps {
  config: SiteConfig;
  onOpenPreview?: () => void;
}

type QrTargetType = "website" | "whatsapp" | "phone" | "custom";

export const QrCodeManager: React.FC<QrCodeManagerProps> = ({
  config,
  onOpenPreview
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

  const [targetType, setTargetType] = useState<QrTargetType>("website");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [customPath, setCustomPath] = useState<string>("");
  const [whatsappMessage, setWhatsappMessage] = useState<string>(
    `Merhaba ${config.companyName || "yetkili"}, web sitenizden ulaşıyorum, bilgi almak istiyorum.`
  );

  // UTM Marketing Campaign Tracking
  const [useUtm, setUseUtm] = useState<boolean>(false);
  const [utmSource, setUtmSource] = useState<string>("qr");
  const [utmMedium, setUtmMedium] = useState<string>("masa_standi");
  const [utmCampaign, setUtmCampaign] = useState<string>("offline_pazarlama_2026");

  // Styling options
  const [fgColor, setFgColor] = useState<string>("#0f172a"); // Default Slate-900
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("H");
  const [resolution, setResolution] = useState<number>(1024);
  const [includeCenterBadge, setIncludeCenterBadge] = useState<boolean>(true);
  const [customLogoImage, setCustomLogoImage] = useState<string>("");
  const [badgeShape, setBadgeShape] = useState<"rounded" | "circle">("rounded");
  const [badgeBgColor, setBadgeBgColor] = useState<string>("#f59e0b");
  const [ctaText, setCtaText] = useState<string>("📱 KAMERANIZLA OKUTUNUZ");
  const [activeTemplate, setActiveTemplate] = useState<MarketingTemplateType>("table-stand");

  // State outputs
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [burnedQrDataUrl, setBurnedQrDataUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [framedSvgString, setFramedSvgString] = useState<string>("");
  const [svgDropdownOpen, setSvgDropdownOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExportingTemplate, setIsExportingTemplate] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setCustomLogoImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCustomLogoImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Compute resolved target URL with UTM if enabled
  const resolvedUrl = useMemo(() => {
    let base = primaryDomain;
    switch (targetType) {
      case "website": {
        if (customPath.trim()) {
          const cleanPath = customPath.startsWith("/") ? customPath : `/${customPath}`;
          base = `${primaryDomain}${cleanPath}`;
        } else {
          base = primaryDomain;
        }
        break;
      }
      case "whatsapp": {
        const cleanPhone = (config.whatsapp || config.phone || "").replace(/[^0-9]/g, "");
        const textParam = whatsappMessage.trim() ? `?text=${encodeURIComponent(whatsappMessage)}` : "";
        return `https://wa.me/${cleanPhone}${textParam}`;
      }
      case "phone": {
        const cleanPhone = (config.phone || "").replace(/[^0-9]/g, "");
        return `tel:${cleanPhone}`;
      }
      case "custom": {
        base = customUrl.trim() || primaryDomain;
        break;
      }
      default:
        base = primaryDomain;
    }

    if (useUtm && (targetType === "website" || targetType === "custom")) {
      try {
        const separator = base.includes("?") ? "&" : "?";
        const params = new URLSearchParams();
        if (utmSource.trim()) params.set("utm_source", utmSource.trim());
        if (utmMedium.trim()) params.set("utm_medium", utmMedium.trim());
        if (utmCampaign.trim()) params.set("utm_campaign", utmCampaign.trim());
        const qs = params.toString();
        if (qs) return `${base}${separator}${qs}`;
      } catch {
        return base;
      }
    }

    return base;
  }, [targetType, primaryDomain, customPath, config.whatsapp, config.phone, whatsappMessage, customUrl, useUtm, utmSource, utmMedium, utmCampaign]);

  // Generate QR Code data whenever parameters change
  useEffect(() => {
    let isCancelled = false;
    setIsGenerating(true);

    const generateQR = async () => {
      try {
        const effectiveLogo = customLogoImage || (config.header?.logoImage && config.header.logoType === "image" ? config.header.logoImage : undefined);

        // Vector SVG with center brand emblem (Clean QR)
        const brandedSvg = await generateBrandedQrSvg({
          url: resolvedUrl,
          fgColor,
          bgColor,
          isTransparentBg,
          errorCorrectionLevel: errorCorrection,
          includeCenterBadge,
          companyName: config.companyName || "W",
          logoImage: effectiveLogo,
          badgeShape,
          badgeBgColor,
          withCardFrame: false
        });

        // Framed vector SVG presentation card
        const framedSvg = await generateBrandedQrSvg({
          url: resolvedUrl,
          fgColor,
          bgColor,
          isTransparentBg: false,
          errorCorrectionLevel: errorCorrection,
          includeCenterBadge,
          companyName: config.companyName || "Web Sitemiz",
          logoImage: effectiveLogo,
          badgeShape,
          badgeBgColor,
          withCardFrame: true,
          ctaText: ctaText || "📱 KAMERANIZLA OKUTUNUZ"
        });

        // High resolution raster PNG
        const baseDataUrl = await QRCode.toDataURL(resolvedUrl, {
          errorCorrectionLevel: errorCorrection,
          width: resolution,
          margin: 2,
          color: {
            dark: fgColor,
            light: isTransparentBg ? "#00000000" : bgColor
          }
        });

        // Center badge burn-in for PNG download & template rendering
        let finalPng = baseDataUrl;
        if (includeCenterBadge) {
          finalPng = await burnLogoIntoQrCode(
            baseDataUrl,
            resolution,
            fgColor,
            config.companyName || "W",
            effectiveLogo,
            badgeShape,
            badgeBgColor
          );
        }

        if (!isCancelled) {
          setQrDataUrl(baseDataUrl);
          setBurnedQrDataUrl(finalPng);
          setQrSvgString(brandedSvg);
          setFramedSvgString(framedSvg);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("QR Generation failed:", err);
        if (!isCancelled) setIsGenerating(false);
      }
    };

    generateQR();

    return () => {
      isCancelled = true;
    };
  }, [
    resolvedUrl,
    fgColor,
    bgColor,
    isTransparentBg,
    errorCorrection,
    resolution,
    includeCenterBadge,
    customLogoImage,
    badgeShape,
    badgeBgColor,
    ctaText,
    config.companyName,
    config.header?.logoImage,
    config.header?.logoType
  ]);

  const safeCompanyName = useMemo(() => {
    return config.companyName
      ? config.companyName.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")
      : "firma";
  }, [config.companyName]);

  // Handle Raw PNG Download
  const handleDownloadPng = () => {
    const activeQrUrl = includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl;
    if (!activeQrUrl) return;
    const a = document.createElement("a");
    const filename = `${safeCompanyName}_qr_${targetType}_${resolution}px${isTransparentBg ? "_seffaf" : ""}.png`;
    a.href = activeQrUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess(`PNG QR (${resolution}px) İndirildi`);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  // Handle SVG Download (Vector)
  const handleDownloadSvg = (framed: boolean = false) => {
    const activeSvg = framed ? framedSvgString : qrSvgString;
    if (!activeSvg) return;
    const blob = new Blob([activeSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = framed
      ? `${safeCompanyName}_qr_pazarlama_karti_vektorel.svg`
      : `${safeCompanyName}_qr_${targetType}_vektorel.svg`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(framed ? "Vektörel Pazarlama Kartı (SVG) İndirildi" : "Vektörel QR (SVG) İndirildi");
    setSvgDropdownOpen(false);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  // Handle direct download of chosen marketing template as a high-resolution PNG
  const handleDownloadTemplatePng = async (template: MarketingTemplateType) => {
    const activeQrUrl = includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl;
    if (!activeQrUrl) return;

    try {
      setIsExportingTemplate(true);
      const canvas = await renderMarketingTemplateCanvas(template, activeQrUrl, config, resolvedUrl);
      const filename = `${safeCompanyName}_pazarlama_${template}.png`;
      downloadCanvasAsPng(canvas, filename);

      const labelMap: Record<MarketingTemplateType, string> = {
        "table-stand": "Masa Üstü Kartı (PNG)",
        "window-sticker": "Vitrin Çıkartması (PNG)",
        "business-card": "Kartvizit & El İlanı (PNG)",
        "social-story": "Sosyal Medya Kartı (PNG)",
        "packaging-label": "Ürün & Ambalaj Etiketi (PNG)"
      };

      setDownloadSuccess(`${labelMap[template]} İndirildi`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error("Template export failed:", err);
    } finally {
      setIsExportingTemplate(false);
    }
  };

  // Batch download entire marketing kit (Raw QR, SVG, and all 5 templates)
  const handleDownloadAllMarketingKit = async () => {
    const activeQrUrl = includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl;
    if (!activeQrUrl) return;

    setIsExportingTemplate(true);
    setDownloadSuccess("Pazarlama Kiti Hazırlanıyor...");

    try {
      // 1. Raw QR PNG
      handleDownloadPng();

      // 2. Vector SVG (Clean Branded)
      await new Promise(r => setTimeout(r, 350));
      handleDownloadSvg(false);

      // 3. Vector SVG (Framed Marketing Card)
      await new Promise(r => setTimeout(r, 350));
      handleDownloadSvg(true);

      // 4. Table Stand
      await new Promise(r => setTimeout(r, 350));
      const standCanvas = await renderMarketingTemplateCanvas("table-stand", activeQrUrl, config, resolvedUrl);
      downloadCanvasAsPng(standCanvas, `${safeCompanyName}_pazarlama_masa_karti.png`);

      // 5. Window Sticker
      await new Promise(r => setTimeout(r, 350));
      const stickerCanvas = await renderMarketingTemplateCanvas("window-sticker", activeQrUrl, config, resolvedUrl);
      downloadCanvasAsPng(stickerCanvas, `${safeCompanyName}_pazarlama_vitrin_etiketi.png`);

      // 6. Business Card
      await new Promise(r => setTimeout(r, 350));
      const cardCanvas = await renderMarketingTemplateCanvas("business-card", activeQrUrl, config, resolvedUrl);
      downloadCanvasAsPng(cardCanvas, `${safeCompanyName}_pazarlama_kartvizit.png`);

      // 7. Social Story
      await new Promise(r => setTimeout(r, 350));
      const storyCanvas = await renderMarketingTemplateCanvas("social-story", activeQrUrl, config, resolvedUrl);
      downloadCanvasAsPng(storyCanvas, `${safeCompanyName}_pazarlama_sosyal_story.png`);

      // 8. Packaging Label
      await new Promise(r => setTimeout(r, 350));
      const packCanvas = await renderMarketingTemplateCanvas("packaging-label", activeQrUrl, config, resolvedUrl);
      downloadCanvasAsPng(packCanvas, `${safeCompanyName}_pazarlama_ambalaj_etiketi.png`);

      setDownloadSuccess("Tüm Pazarlama Paketi İndirildi (8 Dosya - SVG & PNG)");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error("Batch download error:", err);
    } finally {
      setIsExportingTemplate(false);
    }
  };

  // Handle Copy Image to Clipboard
  const handleCopyImage = async () => {
    const activeQrUrl = includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl;
    if (!activeQrUrl) return;
    try {
      const response = await fetch(activeQrUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } catch (err) {
      console.warn("Direct image clipboard copy not supported, falling back to URL:", err);
      navigator.clipboard.writeText(resolvedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Handle Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(resolvedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Print Template
  const handlePrint = () => {
    window.print();
  };

  const colorPresets = [
    { name: "Koyu Siyah", fg: "#0f172a", bg: "#ffffff" },
    { name: "Kurumsal Lacivert", fg: "#1e3a8a", bg: "#ffffff" },
    { name: "Zümrüt Yeşili", fg: "#065f46", bg: "#ffffff" },
    { name: "Amber Altın", fg: "#b45309", bg: "#ffffff" },
    { name: "Derin Bordo / Fuşya", fg: "#831843", bg: "#ffffff" }
  ];

  const destinationPresets = [
    { label: "/ (Ana Sayfa)", path: "" },
    { label: "/hizmetler", path: "hizmetler" },
    { label: "/katalog", path: "katalog" },
    { label: "/iletisim", path: "iletisim" },
    { label: "#lead-form (Teklif Al)", path: "#lead-form" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-amber-600 to-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  Dinamik QR Kod & Çevrimdışı Pazarlama Kiti
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Canlı & Taranabilir</span>
                </span>
                {useUtm && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-600" />
                    <span>UTM Kampanya Aktif</span>
                  </span>
                )}
                {downloadSuccess && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{downloadSuccess}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                İşletmenizin web sitesi için taranabilir dinamik QR kodlar üretin. Masa üstü kartları, dükkan vitrin çıkartmaları, el ilanları ve sosyal medya paylaşımları için yüksek çözünürlüklü pazarlama materyallerini doğrudan indirin.
              </p>
            </div>
          </div>

          {/* Quick Export Actions */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleDownloadAllMarketingKit}
              disabled={isExportingTemplate}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Tüm şablonları ve ham QR kodlarını tek tıkla indirin"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isExportingTemplate ? "Hazırlanıyor..." : "Tüm Pazarlama Paketini İndir"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>

            {onOpenPreview && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Siteyi Gör</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick URL Destination Info & Copy */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>Taranan Dinamik URL:</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-slate-800 break-all select-all">
              {resolvedUrl}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? "Kopyalandı" : "Linki Kopyala"}</span>
            </button>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 font-semibold text-[11px] flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 text-slate-500" />
              <span>Test Et</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings & QR Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Selector, UTM Campaign & Design Configurator (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Type Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">QR Kod Hedefi Belirleyin</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Dinamik Yönlendirme</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. Main Website */}
              <button
                type="button"
                onClick={() => setTargetType("website")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  targetType === "website"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-amber-400/40"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <Globe className={`w-4 h-4 mb-2 ${targetType === "website" ? "text-amber-400" : "text-slate-600"}`} />
                <span className="text-xs font-bold block">Ana Sayfa</span>
                <span className="text-[10px] opacity-75 block">Web sitesi kök adresi</span>
              </button>

              {/* 2. WhatsApp Direct */}
              <button
                type="button"
                onClick={() => setTargetType("whatsapp")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  targetType === "whatsapp"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-emerald-400/40"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <MessageCircle className={`w-4 h-4 mb-2 ${targetType === "whatsapp" ? "text-emerald-400" : "text-emerald-600"}`} />
                <span className="text-xs font-bold block">WhatsApp</span>
                <span className="text-[10px] opacity-75 block">Doğrudan mesaj & sipariş</span>
              </button>

              {/* 3. Phone Call */}
              <button
                type="button"
                onClick={() => setTargetType("phone")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  targetType === "phone"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-amber-400/40"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <Phone className={`w-4 h-4 mb-2 ${targetType === "phone" ? "text-amber-400" : "text-blue-600"}`} />
                <span className="text-xs font-bold block">Telefon</span>
                <span className="text-[10px] opacity-75 block">Tek dokunuşla ara</span>
              </button>

              {/* 4. Custom URL / Subpage */}
              <button
                type="button"
                onClick={() => setTargetType("custom")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  targetType === "custom"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-amber-400/40"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <ExternalLink className={`w-4 h-4 mb-2 ${targetType === "custom" ? "text-amber-400" : "text-purple-600"}`} />
                <span className="text-xs font-bold block">Özel URL</span>
                <span className="text-[10px] opacity-75 block">Menü, katalog veya sayfa</span>
              </button>
            </div>

            {/* Sub-inputs based on chosen target */}
            {targetType === "website" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Alt Sayfa veya Bölüm Yönlendirmesi (Opsiyonel)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Örn: hizmetler, iletisim</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">
                    {primaryDomain}/
                  </span>
                  <input
                    type="text"
                    value={customPath.replace(/^\//, "")}
                    onChange={(e) => setCustomPath(e.target.value.trim())}
                    placeholder="hizmetler veya iletisim"
                    className="w-full pl-44 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white outline-none focus:border-slate-900"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Hızlı Şablonlar:</span>
                  {destinationPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCustomPath(preset.path)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
                        customPath === preset.path
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {targetType === "whatsapp" && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>WhatsApp Numarası: {config.whatsapp || config.phone || "Tanımlanmadı"}</span>
                  <span className="text-[10px] text-emerald-700">Doğrudan Sohbet Linki</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Otomatik Karşılama Mesajı:
                  </label>
                  <input
                    type="text"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Merhaba, web sitenizden ulaşıyorum..."
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-xs bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {targetType === "phone" && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="text-xs font-bold text-blue-900">
                  Kayıtlı Telefon: {config.phone || "Numara bulunamadı"}
                </div>
                <p className="text-[11px] text-blue-700">
                  QR kodu okutan müşterinizin telefonunda arama ekranı otomatik açılır ve numaranız hazır olur.
                </p>
              </div>
            )}

            {targetType === "custom" && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                <label className="block text-xs font-bold text-purple-950">
                  Özel Web Adresi (Tam URL)
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://orneksite.com/kampanya"
                  className="w-full px-3 py-2 rounded-lg border border-purple-300 text-xs font-mono bg-white outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}

            {/* UTM Campaign Tracking Section */}
            {(targetType === "website" || targetType === "custom") && (
              <div className="pt-2 border-t border-slate-100">
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useUtm}
                        onChange={(e) => setUseUtm(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                      />
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pazarlama Kampanya Takip Kodu (UTM Parametreleri) Ekle</span>
                      </span>
                    </label>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                      Google &amp; Cloudflare Analytics
                    </span>
                  </div>

                  {useUtm && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/60">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Pazarlama Kanalı (Medium)
                        </label>
                        <select
                          value={utmMedium}
                          onChange={(e) => setUtmMedium(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-semibold outline-none"
                        >
                          <option value="masa_standi">Masa Standı (table_stand)</option>
                          <option value="vitrin_etiketi">Vitrin Etiketi (window_sticker)</option>
                          <option value="kartvizit">Kartvizit (business_card)</option>
                          <option value="el_ilani">El İlanı / Broşür (flyer)</option>
                          <option value="sosyal_story">Sosyal Medya / Story</option>
                          <option value="arac_giydirme">Araç Giydirme (vehicle)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Trafik Kaynağı (Source)
                        </label>
                        <input
                          type="text"
                          value={utmSource}
                          onChange={(e) => setUtmSource(e.target.value.trim())}
                          placeholder="qr"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-mono outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Kampanya Adı (Campaign)
                        </label>
                        <input
                          type="text"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value.trim())}
                          placeholder="offline_pazarlama"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-mono outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Style & Resolution Customizer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Tasarım, Logo &amp; Baskı Çözünürlüğü</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Baskı Uyumlu</span>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Hazır Renk Paletleri
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      fgColor === preset.fg
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Özel QR Rengi (Koyu)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Arka Plan Rengi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    disabled={isTransparentBg}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer disabled:opacity-40"
                  />
                  <input
                    type="text"
                    value={isTransparentBg ? "ŞEFFAF" : bgColor}
                    disabled={isTransparentBg}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Transparent Background Option */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={isTransparentBg}
                  onChange={(e) => setIsTransparentBg(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 accent-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Şeffaf Arka Plan (PNG &amp; SVG)
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Grafiker ve matbaalar için arka plan rengini kaldırarak şeffaf çıktı üretir.
                  </span>
                </div>
              </label>
            </div>

            {/* Error Correction & Output Resolution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Hata Düzeltme Seviyesi (Yıpranma Koruması)
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none"
                >
                  <option value="H">H - Yüksek (%30 Hasar Koruması - Önerilen)</option>
                  <option value="Q">Q - Çeyrek (%25 Koruma)</option>
                  <option value="M">M - Orta (%15 Koruma)</option>
                  <option value="L">L - Standart (%7 Koruma)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Basılı broşür ve masa kartlarında çizilse dahi telefonlar rahatça okur.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PNG Çıktı Çözünürlüğü
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none"
                >
                  <option value={512}>512 x 512 px (Dijital &amp; Web)</option>
                  <option value={1024}>1024 x 1024 px (Masa Kartı &amp; Broşür - 300 DPI)</option>
                  <option value={2048}>2048 x 2048 px (Büyük Afiş &amp; Vitrin)</option>
                  <option value={4096}>4096 x 4096 px (Ultra HD Matbaa &amp; Tabela)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Matbaa baskısı için 1024px+ veya kayıpsız vektörel SVG formatını tercih edin.
                </span>
              </div>
            </div>

            {/* Center Logo / Badge Toggle & Customization */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCenterBadge}
                  onChange={(e) => setIncludeCenterBadge(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 accent-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>QR Kod Merkezine Firma Logosu / Amblemi Yerleştir</span>
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Hem PNG hem de vektörel SVG çıktılarında merkeze marka rozeti gömülür.
                  </span>
                </div>
              </label>

              {includeCenterBadge && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3.5 animate-fadeIn">
                  {/* Logo Source & Upload */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-800 mb-2 flex items-center justify-between">
                      <span>Merkez Logosu / Görseli</span>
                      {customLogoImage && (
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="text-[10px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Özel Logoyu Sıfırla</span>
                        </button>
                      )}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {customLogoImage ? (
                          <img src={customLogoImage} alt="Özel Logo" className="w-full h-full object-contain p-1" />
                        ) : config.header?.logoImage && config.header.logoType === "image" ? (
                          <img src={config.header.logoImage} alt="Site Logosu" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-slate-900 bg-amber-400">
                            {(config.companyName || "W").trim().charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                          <span>{customLogoImage ? "Logoyu Değiştir" : "Özel Logo Yükle (PNG/SVG)"}</span>
                        </button>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {customLogoImage
                            ? "Yüklediğiniz özel logo QR merkezinde kullanılıyor."
                            : config.header?.logoImage
                            ? "Web sitenizin ana başlık logosu otomatik kullanılıyor."
                            : "Logo yüklü değilse firma baş harfiniz şık amblem olarak çizilir."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badge Shape & Background Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Rozet Köşe Şekli
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBadgeShape("rounded")}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            badgeShape === "rounded"
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          Yuvarlak Köşe
                        </button>
                        <button
                          type="button"
                          onClick={() => setBadgeShape("circle")}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            badgeShape === "circle"
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          Tam Daire
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Amblem Zemin Rengi
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={badgeBgColor}
                          onChange={(e) => setBadgeBgColor(e.target.value)}
                          className="w-8 h-8 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-500">Logo yoksa amblem arka planı</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Text customization */}
                  <div className="pt-2 border-t border-amber-200/60">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pazarlama &amp; Çerçeve Buton Metni
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Örn: 📱 KAMERANIZLA OKUTUNUZ"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live QR Card & Direct Export (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Canlı Önizleme</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Okutmaya Hazır</span>
              </span>
            </div>

            {/* QR Visual Showcase Card */}
            <div className={`relative p-6 rounded-2xl border-2 border-slate-200 shadow-inner inline-block mx-auto max-w-[320px] w-full ${isTransparentBg ? "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50" : "bg-gradient-to-b from-slate-50 to-white"}`}>
              <div className="relative inline-block mx-auto">
                {burnedQrDataUrl || qrDataUrl ? (
                  <div className="relative">
                    <img
                      src={includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl}
                      alt="Dinamik Web Sitesi QR Kodu"
                      className="w-56 h-56 mx-auto rounded-xl shadow-xs object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 mx-auto bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Target caption */}
              <div className="mt-3 pt-3 border-t border-slate-200/80">
                <div className="text-xs font-black text-slate-900 truncate">
                  {config.companyName || "Firma Adı"}
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate max-w-full">
                  {resolvedUrl}
                </div>
                <p className="text-[10px] font-bold text-amber-700 mt-1.5 flex items-center justify-center gap-1">
                  <span>📱 Telefon kameranızı ekrana tutarak test edin</span>
                </p>
              </div>
            </div>

            {/* Direct Export Buttons for Raw QR */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2 relative">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Yüksek çözünürlüklü PNG formatında doğrudan indirin"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>PNG QR İndir</span>
                </button>

                {/* Split / Dropdown SVG Button */}
                <div className="relative">
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDownloadSvg(false)}
                      className="flex-1 py-2.5 px-2 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate"
                      title="Kayıpsız vektörel SVG formatında indirin"
                    >
                      <FileImage className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>SVG İndir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSvgDropdownOpen(!svgDropdownOpen)}
                      className="px-2 hover:bg-slate-200 border-l border-slate-300 text-slate-600 transition-colors cursor-pointer"
                      title="SVG Seçenekleri"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {svgDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-30 text-left">
                      <button
                        type="button"
                        onClick={() => handleDownloadSvg(false)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <FileImage className="w-3.5 h-3.5 text-purple-600" />
                        <div>
                          <div className="font-bold">Sade QR (SVG)</div>
                          <div className="text-[10px] text-slate-400 font-normal">Matbaa &amp; Tasarımcılar için</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadSvg(true)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                      >
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        <div>
                          <div className="font-bold">Pazarlama Kartı (SVG)</div>
                          <div className="text-[10px] text-slate-400 font-normal">Firma logolu hazır çerçeve</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedImage ? "Görsel Kopyalandı" : "Panoya Kopyala"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTemplatePng(activeTemplate)}
                  disabled={isExportingTemplate}
                  className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Şu anda seçili olan baskı şablonunu PNG görseli olarak indirin"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Şablonu İndir</span>
                </button>
              </div>
            </div>

            {/* Offline Use Cases box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Kullanım Alanları &amp; Baskı Rehberi:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-500 pl-0.5">
                <li>Restoran &amp; kafe masaları için temassız menü standı</li>
                <li>Dükkan giriş kapısı ve vitrin çıkartmaları (A4 / A5)</li>
                <li>Müşterilere dağıtılan broşür, el ilanı ve kartvizitler</li>
                <li>Instagram hikayesi ve WhatsApp durumu paylaşım kartları</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PRINTABLE MARKETING MATERIALS STUDIO ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-600" />
                <span>Hazır Pazarlama Materyalleri &amp; Baskı Şablonları</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                PNG &amp; Baskı
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              İşletmeniz için özel olarak tasarlanmış masa standı, vitrin etiketi, kartvizit ve sosyal medya kartlarını doğrudan yüksek çözünürlüklü görsel olarak indirin.
            </p>
          </div>

          {/* Template Format Selector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTemplate("table-stand")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTemplate === "table-stand"
                  ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>1. Masa Üstü Kartı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplate("window-sticker")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTemplate === "window-sticker"
                  ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Vitrin Çıkartması</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplate("business-card")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTemplate === "business-card"
                  ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>3. Kartvizit &amp; El İlanı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplate("social-story")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTemplate === "social-story"
                  ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>4. Sosyal Medya Story</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplate("packaging-label")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTemplate === "packaging-label"
                  ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>5. Ürün &amp; Kutu Etiketi</span>
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div id="printable-qr-stand-area" ref={printAreaRef} className="p-4 sm:p-8 bg-slate-100 rounded-2xl flex justify-center">
          {/* 1. TABLE STAND TEMPLATE */}
          {activeTemplate === "table-stand" && (
            <div className="w-full max-w-sm bg-gradient-to-b from-amber-500 via-amber-600 to-slate-900 text-slate-950 rounded-3xl p-6 sm:p-8 border-4 border-slate-950 shadow-2xl text-center space-y-4">
              <div className="bg-slate-950 text-amber-400 text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase inline-block">
                MASA ÜSTÜ DİJİTAL MENÜ &amp; HİZMET
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-black text-sm flex items-center justify-center">
                  {config.companyName ? config.companyName.charAt(0).toUpperCase() : "W"}
                </div>
                <div className="text-xl font-black tracking-tight text-white">{config.companyName}</div>
              </div>

              <div className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                {config.slogan || "Hizmetlerimiz & Menümüz"}
              </div>

              {/* QR Container */}
              <div className="w-56 h-56 bg-white p-3.5 rounded-2xl mx-auto border-4 border-slate-950 shadow-md flex items-center justify-center relative">
                {(burnedQrDataUrl || qrDataUrl) && (
                  <img
                    src={includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl}
                    alt="Masa Standı QR Kodu"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="space-y-1 bg-slate-950/80 p-3 rounded-2xl border border-white/10">
                <div className="text-xs font-black text-amber-400">
                  📱 Kameranızla Okutun, Hızlıca Ulaşın
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate px-2">
                  {resolvedUrl}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-3 text-[11px] font-bold text-white flex-wrap">
                {config.phone && <span>📞 {config.phone}</span>}
                {config.whatsapp && <span>💬 WhatsApp</span>}
              </div>
            </div>
          )}

          {/* 2. SHOP WINDOW STICKER */}
          {activeTemplate === "window-sticker" && (
            <div className="w-full max-w-sm bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl text-center space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest">
                ✨ 7/24 DİJİTAL DÜKKAN
              </div>

              <div className="text-xl font-black tracking-tight text-white">
                {config.companyName}
              </div>

              <p className="text-xs text-slate-300">
                Tüm ürünlerimizi ve güncel fiyat listemizi telefonunuzdan inceleyin
              </p>

              {/* White QR Box */}
              <div className="w-56 h-56 bg-white p-3.5 rounded-2xl mx-auto border-2 border-amber-400 shadow-lg flex items-center justify-center relative">
                {(burnedQrDataUrl || qrDataUrl) && (
                  <img
                    src={includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl}
                    alt="Vitrin QR Kodu"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="text-xs font-extrabold font-mono text-amber-400 truncate px-2">
                {resolvedUrl}
              </div>

              <div className="pt-2 text-[11px] text-slate-400">
                📍 {config.address || `${config.city} / Türkiye`}
              </div>
            </div>
          )}

          {/* 3. BUSINESS CARD INSERT */}
          {activeTemplate === "business-card" && (
            <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-6 border-2 border-slate-300 shadow-xl flex items-center justify-between gap-5">
              <div className="space-y-2 text-left flex-1">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                  {config.companyName ? config.companyName.charAt(0).toUpperCase() : "W"}
                </div>
                <div className="text-base font-black text-slate-900">{config.companyName}</div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {config.slogan || "Kaliteli hizmet ve müşteri memnuniyeti"}
                </p>
                <div className="text-[10px] font-mono text-slate-700 font-bold">
                  {resolvedUrl}
                </div>
                <div className="text-[10px] text-slate-600 pt-1">
                  📞 {config.phone}
                </div>
              </div>

              <div className="w-36 h-36 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center">
                {(burnedQrDataUrl || qrDataUrl) && (
                  <img
                    src={includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl}
                    alt="Kartvizit QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* 4. SOCIAL STORY TEMPLATE */}
          {activeTemplate === "social-story" && (
            <div className="w-full max-w-xs bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border-4 border-amber-400 shadow-2xl text-center space-y-3.5">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest">
                🚀 YENİ WEB SİTEMİZ YAYINDA!
              </div>

              <div className="text-lg font-black tracking-tight text-white">
                {config.companyName}
              </div>

              <p className="text-[11px] text-slate-300">
                Kameranızı ekrana tutarak yeni sitemizi keşfedin
              </p>

              <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto border-2 border-amber-400 shadow-md flex items-center justify-center">
                {(burnedQrDataUrl || qrDataUrl) && (
                  <img
                    src={includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl}
                    alt="Sosyal Medya QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="text-[11px] font-mono font-bold text-amber-300 truncate">
                {resolvedUrl}
              </div>

              <div className="pt-1 text-[10px] text-slate-400">
                Instagram Hikaye &amp; WhatsApp Durumu Uyumlu
              </div>
            </div>
          )}

          {/* 5. PACKAGING & BOX LABEL TEMPLATE */}
          {activeTemplate === "packaging-label" && (
            <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border-4 border-slate-900 shadow-2xl text-center space-y-4">
              <div className="bg-slate-900 text-amber-300 text-[10px] font-black tracking-wider px-3.5 py-1 rounded-full uppercase inline-block">
                ❤️ BİZİ TERCİH ETTİĞİNİZ İÇİN TEŞEKKÜRLER
              </div>

              <div>
                <h4 className="font-black text-xl text-slate-900 truncate">
                  {config.companyName || "Firma Adı"}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                  {config.slogan || "Online Sipariş & Müşteri Hizmetleri"}
                </p>
              </div>

              <div className="w-48 h-48 bg-slate-50 p-3 rounded-2xl mx-auto border-2 border-slate-200 shadow-xs flex items-center justify-center">
                {(burnedQrDataUrl || qrDataUrl) && (
                  <img
                    src={includeCenterBadge && burnedQrDataUrl ? burnedQrDataUrl : qrDataUrl}
                    alt="Paketleme Etiketi QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="bg-amber-500 text-slate-950 font-black text-xs py-1.5 px-4 rounded-full inline-block shadow-xs">
                📱 TEKRAR SİPARİŞ &amp; GÜNCEL MENÜ
              </div>

              <div className="text-[11px] font-mono font-bold text-slate-700 truncate">
                {resolvedUrl}
              </div>

              <div className="pt-1 text-[10px] text-slate-400">
                Kutu, Poşet, Kargo Paketi &amp; Ambalaj Çıkartması
              </div>
            </div>
          )}
        </div>

        {/* Print & Direct PNG Download Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Yüksek çözünürlüklü PNG görselini matbaaya veya tasarımcıya gönderebilir, ya da doğrudan yazıcıdan bastırabilirsiniz.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleDownloadTemplatePng(activeTemplate)}
              disabled={isExportingTemplate}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingTemplate ? "İndiriliyor..." : "Bu Şablonu PNG Olarak İndir"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Yazdır / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
