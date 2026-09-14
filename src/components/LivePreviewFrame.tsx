import React, { useState, useEffect, useMemo, useRef } from "react";
import { SiteConfig, ColorPalette, GeneratedPageFile } from "../types";
import { COLOR_PALETTES } from "../data/templates";
import { generateAllSiteFiles } from "../utils/staticHtmlGenerator";
import { slugifySubdomain } from "../utils/url";
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Rocket,
  Check,
  RotateCcw,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowLeft,
  ArrowRight,
  Home,
  Copy,
  Globe,
  FileCode,
  Sparkles,
  ChevronRight,
  CornerDownLeft,
  Search,
  RotateCw,
  Maximize2
} from "lucide-react";
import {
  DeviceViewToggle,
  DeviceMode,
  Orientation,
  DevicePreset,
  DEVICE_PRESETS,
} from "./preview/DeviceViewToggle";
import { ResponsivenessAuditModal } from "./preview/ResponsivenessAuditModal";

interface LivePreviewFrameProps {
  config: SiteConfig;
  onChangePalette: (palette: ColorPalette) => void;
  onOpenDeploy: () => void;
  onOpenEditor: () => void;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({
  config,
  onChangePalette,
  onOpenDeploy,
  onOpenEditor,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [showBezel, setShowBezel] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<DevicePreset>(DEVICE_PRESETS[0]);
  const [isAutoTouring, setIsAutoTouring] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);

  const [iframeKey, setIframeKey] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);

  // Keyboard Shortcuts (1: Desktop, 2: Tablet, 3: Mobile, R: Rotate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      if (e.key === "1") {
        setDeviceMode("desktop");
        const preset = DEVICE_PRESETS.find((p) => p.id === "desktop-fluid")!;
        setActivePreset(preset);
      } else if (e.key === "2") {
        setDeviceMode("tablet");
        const preset = DEVICE_PRESETS.find((p) => p.id === "tablet-ipad")!;
        setActivePreset(preset);
      } else if (e.key === "3") {
        setDeviceMode("mobile");
        const preset = DEVICE_PRESETS.find((p) => p.id === "mobile-iphone-15")!;
        setActivePreset(preset);
      } else if (e.key === "r" || e.key === "R") {
        setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto Tour Timer (Cycles through Mobile -> Tablet -> Desktop every 3.5s)
  useEffect(() => {
    if (!isAutoTouring) return;

    const tourSteps: { mode: DeviceMode; presetId: string }[] = [
      { mode: "mobile", presetId: "mobile-iphone-15" },
      { mode: "tablet", presetId: "tablet-ipad" },
      { mode: "desktop", presetId: "desktop-fluid" },
    ];

    let stepIndex = tourSteps.findIndex((s) => s.mode === deviceMode);
    if (stepIndex === -1) stepIndex = 0;

    const timer = setInterval(() => {
      stepIndex = (stepIndex + 1) % tourSteps.length;
      const nextStep = tourSteps[stepIndex];
      setDeviceMode(nextStep.mode);
      const preset = DEVICE_PRESETS.find((p) => p.id === nextStep.presetId) || DEVICE_PRESETS[0];
      setActivePreset(preset);
    }, 3500);

    return () => clearInterval(timer);
  }, [isAutoTouring, deviceMode]);

  // Generate all site pages
  const allFiles: GeneratedPageFile[] = useMemo(() => {
    return generateAllSiteFiles(config);
  }, [config]);

  // Memory Router State
  const [historyStack, setHistoryStack] = useState<string[]>(["index.html"]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [activeFilename, setActiveFilename] = useState<string>("index.html");
  const [urlInput, setUrlInput] = useState<string>("index.html");

  const addressInputRef = useRef<HTMLInputElement>(null);

  // Helper to resolve route input to a valid GeneratedPageFile
  const resolveFile = (routeStr: string): GeneratedPageFile => {
    if (!routeStr) return allFiles[0];

    const clean = routeStr
      .trim()
      .replace(/^https?:\/\/[^/]+\/?/i, "")
      .replace(/^(\.\/|\/)/, "")
      .split("?")[0]
      .split("#")[0];

    if (!clean || clean === "" || clean === "index" || clean === "index.html" || clean === "home") {
      return allFiles[0];
    }

    // 1. Exact filename match (e.g. 'hizmet-oto-kurtarma.html')
    const exactFile = allFiles.find(
      (f) =>
        f.filename.toLowerCase() === clean.toLowerCase() ||
        f.fileName?.toLowerCase() === clean.toLowerCase()
    );
    if (exactFile) return exactFile;

    // 2. Slug match (e.g. 'hizmet-oto-kurtarma', 'about', 'services')
    const exactSlug = allFiles.find((f) => f.slug.toLowerCase() === clean.toLowerCase());
    if (exactSlug) return exactSlug;

    // 3. Match with .html appended
    const withHtml = allFiles.find(
      (f) => f.filename.toLowerCase() === `${clean.toLowerCase()}.html`
    );
    if (withHtml) return withHtml;

    // 4. Aliases
    if (clean === "kurumsal" || clean === "about") {
      const match = allFiles.find((f) => f.type === "page" && f.slug === "about");
      if (match) return match;
    }
    if (clean === "hizmetler" || clean === "services") {
      const match = allFiles.find((f) => f.type === "service-list");
      if (match) return match;
    }
    if (clean === "katalog" || clean === "urunler" || clean === "catalog" || clean === "products") {
      const match = allFiles.find((f) => f.type === "catalog");
      if (match) return match;
    }
    if (clean === "blog" || clean === "makaleler" || clean === "rehber") {
      const match = allFiles.find((f) => f.type === "blog-list");
      if (match) return match;
    }
    if (clean === "iletisim" || clean === "contact") {
      const match = allFiles.find((f) => f.type === "contact");
      if (match) return match;
    }

    // 5. Partial title / slug fuzzy match
    const fuzzy = allFiles.find(
      (f) =>
        f.slug.toLowerCase().includes(clean.toLowerCase()) ||
        f.title.toLowerCase().includes(clean.toLowerCase()) ||
        f.filename.toLowerCase().includes(clean.toLowerCase())
    );
    if (fuzzy) return fuzzy;

    return allFiles[0];
  };

  // Navigate to a new route in memory router
  const navigateTo = (targetRoute: string, replace = false) => {
    const targetFile = resolveFile(targetRoute);
    const targetFilename = targetFile.filename || targetFile.fileName || "index.html";

    // Simulate ultra-fast static transition (100ms)
    setIsLoadingTransition(true);
    setTimeout(() => {
      setIsLoadingTransition(false);
    }, 120);

    setActiveFilename(targetFilename);
    setUrlInput(targetFilename === "index.html" ? "" : targetFilename);

    if (replace) {
      setHistoryStack((prev) => {
        const copy = [...prev];
        copy[historyIndex] = targetFilename;
        return copy;
      });
    } else {
      setHistoryStack((prev) => {
        // Cut forward history and push new route
        const updated = prev.slice(0, historyIndex + 1);
        if (updated[updated.length - 1] !== targetFilename) {
          updated.push(targetFilename);
        }
        return updated;
      });
      setHistoryIndex((prev) => (historyStack[historyIndex] === targetFilename ? historyIndex : historyIndex + 1));
    }
  };

  // Go Back in history
  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const targetFilename = historyStack[newIndex];
      setHistoryIndex(newIndex);
      setActiveFilename(targetFilename);
      setUrlInput(targetFilename === "index.html" ? "" : targetFilename);
    }
  };

  // Go Forward in history
  const goForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      const targetFilename = historyStack[newIndex];
      setHistoryIndex(newIndex);
      setActiveFilename(targetFilename);
      setUrlInput(targetFilename === "index.html" ? "" : targetFilename);
    }
  };

  // Go Home
  const goHome = () => {
    navigateTo("index.html");
  };

  // Listen to postMessage navigation from inside the preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === "HIZLIWEB_NAVIGATE" || event.data.type === "PREVIEW_NAVIGATE") {
          const target = event.data.file || event.data.href || event.data.slug;
          if (target) {
            navigateTo(target);
          }
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [historyIndex, historyStack, allFiles]);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddressEditing(false);
    navigateTo(urlInput);
  };

  // Active current file object and HTML
  const currentFile = useMemo(() => {
    return resolveFile(activeFilename);
  }, [activeFilename, allFiles]);

  const currentHtml = currentFile.html || currentFile.content || "";

  // Group pages for the smart dropdown
  const groupedPages = useMemo(() => {
    const mainPages = allFiles.filter(
      (f) =>
        f.type === "home" ||
        (f.type === "page" && f.slug === "about") ||
        f.type === "service-list" ||
        f.type === "catalog" ||
        f.type === "blog-list" ||
        f.type === "contact"
    );
    const serviceDetails = allFiles.filter((f) => f.type === "service-detail");
    const productDetails = allFiles.filter((f) => f.type === "product-detail");
    const blogDetails = allFiles.filter((f) => f.type === "blog-detail");
    const customPages = allFiles.filter(
      (f) => f.type === "page" && f.slug !== "about" && f.slug !== "kurumsal"
    );

    return {
      mainPages,
      serviceDetails,
      productDetails,
      blogDetails,
      customPages,
    };
  }, [allFiles]);

  const filteredPages = useMemo(() => {
    if (!searchFilter.trim()) return allFiles;
    const q = searchFilter.toLowerCase();
    return allFiles.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.filename.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.slug.toLowerCase().includes(q)
    );
  }, [allFiles, searchFilter]);

  // Open standalone HTML in a new browser tab using Blob URL
  const handleOpenStandaloneTab = () => {
    const blob = new Blob([currentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleCopySimulatedUrl = () => {
    const domain = config.cloudflare?.subdomain ? slugifySubdomain(config.cloudflare.subdomain) : slugifySubdomain(config.companyName);
    const fullSimulatedUrl = config.cloudflare?.customDomain 
      ? `https://${config.cloudflare.customDomain}/${currentFile.filename === "index.html" ? "" : currentFile.filename}`
      : `https://${domain}.hizliweb.site/${currentFile.filename === "index.html" ? "" : currentFile.filename}`;
    navigator.clipboard.writeText(fullSimulatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Page Type Badge Color & Label
  const getPageTypeMeta = (type: GeneratedPageFile["type"]) => {
    switch (type) {
      case "home":
        return { label: "Ana Sayfa", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
      case "service-detail":
        return { label: "Hizmet Detayı", bg: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "product-detail":
        return { label: "Ürün Detayı", bg: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
      case "blog-detail":
        return { label: "Blog Yazısı", bg: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      case "catalog":
        return { label: "Katalog", bg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
      case "service-list":
        return { label: "Hizmetler", bg: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "blog-list":
        return { label: "Blog Listesi", bg: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      case "contact":
        return { label: "İletişim", bg: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
      default:
        return { label: "Kurumsal Sayfa", bg: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    }
  };

  const domainName = config.cloudflare?.subdomain 
    ? slugifySubdomain(config.cloudflare.subdomain) 
    : slugifySubdomain(config.companyName);
  const typeMeta = getPageTypeMeta(currentFile.type);

  // Dynamic dimensions for the active device
  const getDeviceFrameStyles = () => {
    if (deviceMode === "desktop") {
      return {
        containerWidth: activePreset.width > 0 ? `${activePreset.width}px` : "100%",
        viewportHeight: "760px",
      };
    }

    const isPortrait = orientation === "portrait";
    const width = isPortrait ? activePreset.width : activePreset.height;
    const height = isPortrait ? activePreset.height : activePreset.width;

    return {
      containerWidth: `${width}px`,
      viewportHeight: `${height}px`,
    };
  };

  const frameStyles = getDeviceFrameStyles();

  return (
    <div className="space-y-4 pb-12">
      {/* Top Preview Control Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Left: Client-Side Route Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="relative">
            <select
              value={currentFile.filename || currentFile.fileName || "index.html"}
              onChange={(e) => navigateTo(e.target.value)}
              aria-label="Aktif Sayfa Seçici"
              className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 max-w-[220px] sm:max-w-xs truncate cursor-pointer"
            >
              <optgroup label="📌 Ana Sayfalar">
                {groupedPages.mainPages.map((f) => (
                  <option key={f.filename} value={f.filename}>
                    📄 {f.title} ({f.filename})
                  </option>
                ))}
              </optgroup>

              {groupedPages.serviceDetails.length > 0 && (
                <optgroup label="🛠️ Hizmet Detay Sayfaları">
                  {groupedPages.serviceDetails.map((f) => (
                    <option key={f.filename} value={f.filename}>
                      🔧 {f.title} ({f.filename})
                    </option>
                  ))}
                </optgroup>
              )}

              {groupedPages.productDetails.length > 0 && (
                <optgroup label="📦 Ürün & Katalog Sayfaları">
                  {groupedPages.productDetails.map((f) => (
                    <option key={f.filename} value={f.filename}>
                      📦 {f.title} ({f.filename})
                    </option>
                  ))}
                </optgroup>
              )}

              {groupedPages.blogDetails.length > 0 && (
                <optgroup label="✍️ Blog & Makale Sayfaları">
                  {groupedPages.blogDetails.map((f) => (
                    <option key={f.filename} value={f.filename}>
                      ✍️ {f.title} ({f.filename})
                    </option>
                  ))}
                </optgroup>
              )}

              {groupedPages.customPages.length > 0 && (
                <optgroup label="📄 Özel Sayfalar">
                  {groupedPages.customPages.map((f) => (
                    <option key={f.filename} value={f.filename}>
                      📄 {f.title} ({f.filename})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            ({allFiles.length} URL)
          </span>
        </div>

        {/* Center: Live Color Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden xl:inline">Renk:</span>
          <div className="flex items-center gap-1">
            {COLOR_PALETTES.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => onChangePalette(p)}
                title={p.name}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                  config.palette.id === p.id
                    ? "border-amber-400 ring-2 ring-amber-400/40 scale-105"
                    : "border-slate-800"
                }`}
                style={{ backgroundColor: p.primary }}
              >
                {config.palette.id === p.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEditor}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Düzenleyiciye Dön
          </button>

          <button
            onClick={onOpenDeploy}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Statik Dağıt</span>
          </button>
        </div>
      </div>

      {/* Dedicated Device View Toggle Ribbon (Desktop, Tablet, Mobile) */}
      <DeviceViewToggle
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        orientation={orientation}
        onOrientationChange={setOrientation}
        showBezel={showBezel}
        onToggleBezel={() => setShowBezel((prev) => !prev)}
        activePreset={activePreset}
        onSelectPreset={(preset) => {
          setActivePreset(preset);
          setDeviceMode(preset.type);
        }}
        isAutoTouring={isAutoTouring}
        onToggleAutoTour={() => setIsAutoTouring((prev) => !prev)}
        onOpenAudit={() => setIsAuditOpen(true)}
      />

      {/* Simulated Browser Viewport with Lightweight Memory Router Chrome */}
      <div className="w-full mx-auto transition-all duration-300">
        <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
          
          {/* Top Browser Chrome Bar */}
          <div className="bg-slate-850 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-slate-800">
            
            {/* Window Dots & Navigation Controls (Memory Router Stack) */}
            <div className="flex items-center gap-3 shrink-0">
              {/* macOS style window buttons */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:opacity-100 transition-opacity"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Back / Forward / Refresh / Home Buttons */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={goBack}
                  disabled={historyIndex === 0}
                  className={`p-1.5 rounded-md transition-colors ${
                    historyIndex > 0
                      ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                  title="Geri (Önceki Sayfa)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={goForward}
                  disabled={historyIndex >= historyStack.length - 1}
                  className={`p-1.5 rounded-md transition-colors ${
                    historyIndex < historyStack.length - 1
                      ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                  title="İleri (Sonraki Sayfa)"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  title="Sayfayı Yenile"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoadingTransition ? "animate-spin text-amber-400" : ""}`} />
                </button>

                <button
                  onClick={goHome}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    activeFilename === "index.html"
                      ? "text-amber-400 bg-slate-800/80"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                  title="Ana Sayfaya Git"
                >
                  <Home className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Smart Omnibox / Interactive URL Bar */}
            <form
              onSubmit={handleUrlSubmit}
              className="flex-1 min-w-[240px] bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/30 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex items-center justify-between font-mono transition-all group"
            >
              <div className="flex items-center gap-1.5 flex-1 overflow-hidden mr-2">
                <span className="text-emerald-400 shrink-0 font-sans flex items-center gap-1 text-[11px]">
                  🔒 <span className="text-slate-400 font-mono">https://</span>
                </span>
                <span className="text-slate-300 font-semibold shrink-0">
                  {domainName}.com.tr/
                </span>

                <input
                  ref={addressInputRef}
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onFocus={() => setIsAddressEditing(true)}
                  onBlur={() => setIsAddressEditing(false)}
                  placeholder="index.html veya sayfa adı..."
                  className="bg-transparent text-amber-300 font-semibold focus:outline-none flex-1 min-w-[60px] text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Page Type Badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeMeta.bg} hidden sm:inline-block`}
                >
                  {typeMeta.label}
                </span>

                {/* 100/100 SPEED TAG */}
                <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
                  ⚡ 0.02s
                </span>

                {/* Enter submit icon if editing */}
                {isAddressEditing && (
                  <button type="submit" className="text-amber-400 hover:text-amber-300 p-0.5">
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Browser Utilities (Copy URL, Open in Standalone Tab) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopySimulatedUrl}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Simüle URL'yi Kopyala"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">{copiedUrl ? "Kopyalandı!" : "Linki Kopyala"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenStandaloneTab}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Yeni Sekmede Bağımsız Aç"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Yeni Sekme</span>
              </button>
            </div>
          </div>

          {/* Tab & Dynamic Route Breadcrumb Strip */}
          <div className="bg-slate-900 px-4 py-1.5 flex items-center justify-between border-b border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                {currentFile.title}
              </span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-slate-400">{currentFile.filename}</span>
            </div>

            {/* Quick Breadcrumb links for instant jumping */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
              <button
                onClick={() => navigateTo("index.html")}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Ana Sayfa
              </button>
              {currentFile.type !== "home" && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="text-slate-200 font-semibold truncate max-w-[150px]">
                    {currentFile.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Dynamic Route Pills Bar */}
          <div className="bg-slate-950/60 px-3 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 shrink-0">
              Hızlı Sayfalar:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {allFiles.slice(0, 8).map((f) => {
                const isActive = (f.filename || f.fileName) === (currentFile.filename || currentFile.fileName);
                return (
                  <button
                    key={f.filename}
                    onClick={() => navigateTo(f.filename)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                        : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60"
                    }`}
                  >
                    <span>{f.type === "service-detail" ? "🔧" : f.type === "product-detail" ? "📦" : f.type === "blog-detail" ? "✍️" : "📄"}</span>
                    <span>{f.title.split(":")[0].replace("Hizmet: ", "").replace("Ürün: ", "").replace("Makale: ", "")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Responsive Device Canvas Stage */}
          <div className="bg-slate-950/85 p-3 sm:p-6 md:p-8 flex flex-col items-center justify-start min-h-[820px] overflow-x-auto relative">
            {/* Stage Status & Rotate Ribbon */}
            <div className="w-full max-w-5xl flex items-center justify-between mb-4 text-xs text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">
                  {deviceMode === "desktop"
                    ? "Masaüstü Canlı Görünüm"
                    : deviceMode === "tablet"
                    ? "Apple iPad Görünümü (768px+)"
                    : "Akıllı Telefon Görünümü (390px)"}
                </span>
                <span className="text-slate-500 hidden sm:inline">
                  — {activePreset.name} {deviceMode !== "desktop" && `(${orientation === "landscape" ? "Yatay Mod" : "Dikey Mod"})`}
                </span>
              </div>

              {deviceMode !== "desktop" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-bold text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    title="Ekranı 90° Döndür (Kısayol: R)"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Döndür [R]</span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Viewport Window */}
            {deviceMode === "desktop" && (
              <div
                className="transition-all duration-300 mx-auto w-full"
                style={{ maxWidth: frameStyles.containerWidth }}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative">
                  {isLoadingTransition && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-30 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700">
                        <Zap className="w-4 h-4 animate-pulse" />
                        <span>0.02s Statik Sayfa Yükleniyor...</span>
                      </div>
                    </div>
                  )}
                  <iframe
                    key={`${iframeKey}-${activeFilename}`}
                    srcDoc={currentHtml}
                    title={`Canlı Önizleme - ${currentFile.title}`}
                    className="w-full h-[760px] border-0 block"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
              </div>
            )}

            {/* Tablet Viewport Window */}
            {deviceMode === "tablet" && (
              <div
                className="transition-all duration-300 mx-auto"
                style={{ width: frameStyles.containerWidth, maxWidth: "100%" }}
              >
                {showBezel ? (
                  <div className="bg-slate-900 border-[12px] border-slate-900 rounded-[38px] shadow-2xl shadow-black/80 ring-1 ring-slate-800/80 p-2 flex flex-col">
                    {/* Top Camera Bezel */}
                    <div className="flex items-center justify-center py-1.5 shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-900/70" />
                      </div>
                    </div>

                    {/* Tablet Screen */}
                    <div
                      className="rounded-[22px] overflow-hidden bg-white relative shadow-inner"
                      style={{ height: frameStyles.viewportHeight }}
                    >
                      {isLoadingTransition && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-30 flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700">
                            <Zap className="w-4 h-4 animate-pulse" />
                            <span>0.02s Tablet Yükleniyor...</span>
                          </div>
                        </div>
                      )}
                      <iframe
                        key={`${iframeKey}-${activeFilename}`}
                        srcDoc={currentHtml}
                        title={`Tablet Önizleme - ${currentFile.title}`}
                        className="w-full h-full border-0 block"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>

                    {/* Bottom Home Indicator */}
                    <div className="flex items-center justify-center py-2 shrink-0">
                      <div className="w-32 h-1 rounded-full bg-slate-600/80" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative"
                    style={{ height: frameStyles.viewportHeight }}
                  >
                    {isLoadingTransition && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-30 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700">
                          <Zap className="w-4 h-4 animate-pulse" />
                          <span>0.02s Tablet Yükleniyor...</span>
                        </div>
                      </div>
                    )}
                    <iframe
                      key={`${iframeKey}-${activeFilename}`}
                      srcDoc={currentHtml}
                      title={`Tablet Önizleme - ${currentFile.title}`}
                      className="w-full h-full border-0 block"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Mobile Viewport Window */}
            {deviceMode === "mobile" && (
              <div
                className="transition-all duration-300 mx-auto"
                style={{ width: frameStyles.containerWidth, maxWidth: "100%" }}
              >
                {showBezel ? (
                  <div className="bg-slate-900 border-[10px] border-slate-900 rounded-[46px] shadow-2xl shadow-black/80 ring-1 ring-slate-800/80 p-2 flex flex-col">
                    {/* Dynamic Island Bezel */}
                    <div className="flex items-center justify-center py-1.5 shrink-0">
                      <div className="w-28 h-5 rounded-full bg-black flex items-center justify-between px-3 border border-slate-800/50 shadow-inner">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                      </div>
                    </div>

                    {/* Smartphone Screen */}
                    <div
                      className="rounded-[34px] overflow-hidden bg-white relative shadow-inner"
                      style={{ height: frameStyles.viewportHeight }}
                    >
                      {isLoadingTransition && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-30 flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700">
                            <Zap className="w-4 h-4 animate-pulse" />
                            <span>0.02s Mobil Yükleniyor...</span>
                          </div>
                        </div>
                      )}
                      <iframe
                        key={`${iframeKey}-${activeFilename}`}
                        srcDoc={currentHtml}
                        title={`Mobil Önizleme - ${currentFile.title}`}
                        className="w-full h-full border-0 block"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>

                    {/* Bottom Home Swipe Indicator */}
                    <div className="flex items-center justify-center py-2 shrink-0">
                      <div className="w-32 h-1 rounded-full bg-slate-500/80" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative"
                    style={{ height: frameStyles.viewportHeight }}
                  >
                    {isLoadingTransition && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-30 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700">
                          <Zap className="w-4 h-4 animate-pulse" />
                          <span>0.02s Mobil Yükleniyor...</span>
                        </div>
                      </div>
                    )}
                    <iframe
                      key={`${iframeKey}-${activeFilename}`}
                      srcDoc={currentHtml}
                      title={`Mobil Önizleme - ${currentFile.title}`}
                      className="w-full h-full border-0 block"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Keyboard Shortcuts Tag */}
            <div className="mt-5 text-center text-[11px] text-slate-500 flex items-center gap-2 justify-center flex-wrap">
              <span>📱 Duyarlılık Simülasyonu</span>
              <span>•</span>
              <span>Klavye Kısayolları:</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">1: Masaüstü</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">2: Tablet</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">3: Mobil</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">R: Döndür</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Specifications Footer Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">0.02 Saniye Statik Yanıt (Edge SSG)</div>
            <div className="text-slate-500">PHP/MySQL sorgusu yok. Bağımsız URL'ler doğrudan Global Anycast Edge CDN üzerinden sunulur.</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Dinamik İstemci Yönlendirme (Router)</div>
            <div className="text-slate-500">Hizmet, ürün ve blog detay linklerine tıklandığında anında bağımsız URL olarak önizlenir.</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">AI Arama & Schema.org Uyumlu</div>
            <div className="text-slate-500">Her alt sayfa için özel OpenGraph, Title, Meta Description ve Schema JSON-LD etiketleri.</div>
          </div>
        </div>
      </div>

      {/* Responsiveness Pre-Deployment Audit Modal */}
      <ResponsivenessAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        onSelectDevice={(targetDevice) => {
          setDeviceMode(targetDevice);
          const foundPreset = DEVICE_PRESETS.find((p) => p.type === targetDevice);
          if (foundPreset) {
            setActivePreset(foundPreset);
          }
        }}
        onStartAutoTour={() => {
          setIsAutoTouring(true);
        }}
      />
    </div>
  );
};
