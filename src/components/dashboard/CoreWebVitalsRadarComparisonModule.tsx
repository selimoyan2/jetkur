import React, { useState, useMemo } from "react";
import {
  Radar as RadarIcon,
  Smartphone,
  Monitor,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Info,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
  Layers
} from "lucide-react";
import { CompetitorSpeedData } from "./CompetitorSpeedScoreCards";

export interface CoreWebVitalsRadarComparisonModuleProps {
  speedProfiles: CompetitorSpeedData[];
  device: "mobile" | "desktop";
  onDeviceChange?: (device: "mobile" | "desktop") => void;
  className?: string;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  lastSyncTime?: string;
  isSyncing?: boolean;
}

// Definition of each axis in the radar chart
interface MetricAxisDefinition {
  id: "score" | "lcp" | "inp" | "cls" | "fcp" | "ttfb";
  label: string;
  shortLabel: string;
  unit: string;
  targetText: string;
  goodThreshold: number;
  poorThreshold: number;
  description: string;
  higherIsBetter: boolean;
  normalize: (value: number) => number; // Returns 0 - 100
  formatRaw: (value: number) => string;
}

// 6 Core Web Vitals & Speed Axes normalized strictly from 0 to 100 (where 100 is always best)
const METRIC_AXES: MetricAxisDefinition[] = [
  {
    id: "score",
    label: "Genel Hız Skoru",
    shortLabel: "PageSpeed",
    unit: "/100",
    targetText: "≥ 90 Puan",
    goodThreshold: 90,
    poorThreshold: 50,
    description: "Google Lighthouse v12 ağırlıklı genel performans puanı.",
    higherIsBetter: true,
    normalize: (v) => Math.max(10, Math.min(100, Math.round(v))),
    formatRaw: (v) => `${Math.round(v)}/100`,
  },
  {
    id: "lcp",
    label: "LCP (En Büyük İçerikli Boyama)",
    shortLabel: "LCP",
    unit: "sn",
    targetText: "≤ 2.5s",
    goodThreshold: 2.5,
    poorThreshold: 4.0,
    description: "Kullanıcının gördüğü en büyük içerik bloğunun yüklenme süresi.",
    higherIsBetter: false,
    normalize: (v) => {
      // <= 2.5s -> 90-100, 2.5-4.0s -> 50-89, > 4.0s -> 10-49
      if (v <= 2.5) {
        return Math.min(100, Math.max(90, 100 - (v / 2.5) * 10));
      }
      if (v <= 4.0) {
        return Math.max(50, 90 - ((v - 2.5) / 1.5) * 40);
      }
      return Math.max(10, 50 - ((v - 4.0) / 2.0) * 40);
    },
    formatRaw: (v) => `${v.toFixed(1)}s`,
  },
  {
    id: "inp",
    label: "INP (Sonraki Etkileşim Gecikmesi)",
    shortLabel: "INP",
    unit: "ms",
    targetText: "≤ 200ms",
    goodThreshold: 200,
    poorThreshold: 500,
    description: "Tıklama veya dokunma sonrası sayfanın yanıt verme süresi.",
    higherIsBetter: false,
    normalize: (v) => {
      // <= 200ms -> 90-100, 200-500ms -> 50-89, > 500ms -> 10-49
      if (v <= 200) {
        return Math.min(100, Math.max(90, 100 - (v / 200) * 10));
      }
      if (v <= 500) {
        return Math.max(50, 90 - ((v - 200) / 300) * 40);
      }
      return Math.max(10, 50 - ((v - 500) / 500) * 40);
    },
    formatRaw: (v) => `${Math.round(v)}ms`,
  },
  {
    id: "cls",
    label: "CLS (Kümülatif Düzen Kayması)",
    shortLabel: "CLS",
    unit: "skor",
    targetText: "≤ 0.10",
    goodThreshold: 0.10,
    poorThreshold: 0.25,
    description: "Sayfa yüklenirken beklenmedik görsel kaymaların miktarı.",
    higherIsBetter: false,
    normalize: (v) => {
      // <= 0.10 -> 90-100, 0.10-0.25 -> 50-89, > 0.25 -> 10-49
      if (v <= 0.10) {
        return Math.min(100, Math.max(90, 100 - (v / 0.10) * 10));
      }
      if (v <= 0.25) {
        return Math.max(50, 90 - ((v - 0.10) / 0.15) * 40);
      }
      return Math.max(10, 50 - ((v - 0.25) / 0.25) * 40);
    },
    formatRaw: (v) => v.toFixed(2),
  },
  {
    id: "fcp",
    label: "FCP (İlk İçerikli Boyama)",
    shortLabel: "FCP",
    unit: "sn",
    targetText: "≤ 1.8s",
    goodThreshold: 1.8,
    poorThreshold: 3.0,
    description: "Sayfadaki ilk metin veya görselin belirdiği süre.",
    higherIsBetter: false,
    normalize: (v) => {
      if (v <= 1.8) {
        return Math.min(100, Math.max(90, 100 - (v / 1.8) * 10));
      }
      if (v <= 3.0) {
        return Math.max(50, 90 - ((v - 1.8) / 1.2) * 40);
      }
      return Math.max(10, 50 - ((v - 3.0) / 2.0) * 40);
    },
    formatRaw: (v) => `${v.toFixed(1)}s`,
  },
  {
    id: "ttfb",
    label: "TTFB (İlk Bayt Yanıt Süresi)",
    shortLabel: "TTFB",
    unit: "ms",
    targetText: "≤ 150ms",
    goodThreshold: 150,
    poorThreshold: 400,
    description: "Web sunucusundan ilk veri baytının tarayıcıya ulaşma süresi.",
    higherIsBetter: false,
    normalize: (v) => {
      if (v <= 150) {
        return Math.min(100, Math.max(90, 100 - (v / 150) * 10));
      }
      if (v <= 400) {
        return Math.max(50, 90 - ((v - 150) / 250) * 40);
      }
      return Math.max(10, 50 - ((v - 400) / 400) * 40);
    },
    formatRaw: (v) => `${Math.round(v)}ms`,
  },
];

// Color palette for each series in the radar
const SERIES_THEMES = [
  {
    id: "user",
    stroke: "#10b981", // Emerald
    fill: "rgba(16, 185, 129, 0.22)",
    hoverFill: "rgba(16, 185, 129, 0.40)",
    borderClass: "border-emerald-500",
    bgClass: "bg-emerald-500/20",
    textClass: "text-emerald-400",
    badgeClass: "bg-emerald-500 text-slate-950 font-black",
  },
  {
    id: "comp-1",
    stroke: "#6366f1", // Indigo
    fill: "rgba(99, 102, 241, 0.16)",
    hoverFill: "rgba(99, 102, 241, 0.35)",
    borderClass: "border-indigo-500",
    bgClass: "bg-indigo-500/20",
    textClass: "text-indigo-400",
    badgeClass: "bg-indigo-500 text-white font-bold",
  },
  {
    id: "comp-2",
    stroke: "#f43f5e", // Rose
    fill: "rgba(244, 63, 94, 0.16)",
    hoverFill: "rgba(244, 63, 94, 0.35)",
    borderClass: "border-rose-500",
    bgClass: "bg-rose-500/20",
    textClass: "text-rose-400",
    badgeClass: "bg-rose-500 text-white font-bold",
  },
  {
    id: "comp-3",
    stroke: "#a855f7", // Purple
    fill: "rgba(168, 85, 247, 0.16)",
    hoverFill: "rgba(168, 85, 247, 0.35)",
    borderClass: "border-purple-500",
    bgClass: "bg-purple-500/20",
    textClass: "text-purple-400",
    badgeClass: "bg-purple-500 text-white font-bold",
  },
];

export const CoreWebVitalsRadarComparisonModule: React.FC<CoreWebVitalsRadarComparisonModuleProps> = ({
  speedProfiles,
  device: controlledDevice,
  onDeviceChange,
  className = "",
  isOpen: propIsOpen,
  onToggleOpen,
  lastSyncTime,
  isSyncing,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(true);
  const isExpanded = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const togglePanel = onToggleOpen || (() => setInternalIsOpen((prev) => !prev));

  const [internalDevice, setInternalDevice] = useState<"mobile" | "desktop">(controlledDevice || "mobile");
  const device = controlledDevice || internalDevice;

  const handleDeviceSwitch = (newDev: "mobile" | "desktop") => {
    setInternalDevice(newDev);
    if (onDeviceChange) onDeviceChange(newDev);
  };

  // State to track which series/competitors are visible in the radar
  const [visibleSeriesIds, setVisibleSeriesIds] = useState<Record<string, boolean>>({
    "user-profile": true,
    "comp-1": true,
    "comp-2": true,
    "comp-3": true,
  });

  // State to track highlighted series when hovered
  const [hoveredSeriesId, setHoveredSeriesId] = useState<string | null>(null);

  // State to track focused metric axis (e.g. click to see breakdown)
  const [selectedAxisId, setSelectedAxisId] = useState<string | null>(null);

  // State to show tooltip details
  const [hoveredPoint, setHoveredPoint] = useState<{
    profileId: string;
    profileName: string;
    axisId: string;
    axisLabel: string;
    rawValue: string;
    normalizedScore: number;
    x: number;
    y: number;
  } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Toggle single series visibility
  const toggleSeriesVisibility = (id: string) => {
    setVisibleSeriesIds((prev) => {
      const current = prev[id] ?? true;
      return { ...prev, [id]: !current };
    });
  };

  // Isolate a competitor vs user
  const handleIsolateCompetitor = (compId: string) => {
    setVisibleSeriesIds({
      "user-profile": true,
      [compId]: true,
    });
  };

  // Reset all to visible
  const handleShowAll = () => {
    const allVisible: Record<string, boolean> = {};
    speedProfiles.forEach((p) => {
      allVisible[p.id] = true;
    });
    setVisibleSeriesIds(allVisible);
  };

  // Math geometry for 6-axis Radar Chart
  // Center is (230, 230), Max radius is 150
  const cx = 230;
  const cy = 230;
  const maxRadius = 150;
  const numAxes = METRIC_AXES.length;

  // Calculate coordinates for any axis and normalized score (0 - 100)
  const getCoordinates = (axisIndex: number, normalizedScore: number) => {
    // Top axis starts at -90deg (-PI/2)
    const angle = -Math.PI / 2 + (axisIndex * 2 * Math.PI) / numAxes;
    const r = (normalizedScore / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate concentric polygon grid points for background spider web
  const gridRings = useMemo(() => {
    const levels = [20, 40, 60, 80, 100];
    return levels.map((lvl) => {
      const points = METRIC_AXES.map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return { level: lvl, points };
    });
  }, []);

  // Compute points and polygon SVG path for each visible competitor
  const seriesPaths = useMemo(() => {
    return speedProfiles.map((profile, profileIdx) => {
      const theme = SERIES_THEMES[profileIdx % SERIES_THEMES.length];
      const metrics = profile[device];
      const isVisible = visibleSeriesIds[profile.id] ?? true;

      const axisData = METRIC_AXES.map((axisDef, axisIdx) => {
        const rawVal = metrics[axisDef.id as keyof typeof metrics] as number;
        const normalized = axisDef.normalize(rawVal);
        const { x, y } = getCoordinates(axisIdx, normalized);

        return {
          axisDef,
          axisIdx,
          rawVal,
          normalized,
          x,
          y,
        };
      });

      const polygonPoints = axisData.map((d) => `${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(" ");

      return {
        profile,
        theme,
        isVisible,
        axisData,
        polygonPoints,
      };
    });
  }, [speedProfiles, device, visibleSeriesIds]);

  // Find user's profile and competitor with largest gap
  const userProfile = speedProfiles[0];
  const userMetrics = userProfile ? userProfile[device] : null;

  // Best performer per axis
  const bestPerformers = useMemo(() => {
    const result: Record<string, { name: string; isUser: boolean; val: string }> = {};

    METRIC_AXES.forEach((axis) => {
      let bestVal: number | null = null;
      let bestName = "";
      let bestIsUser = false;

      speedProfiles.forEach((p) => {
        const v = p[device][axis.id as keyof typeof p[typeof device]] as number;
        if (bestVal === null) {
          bestVal = v;
          bestName = p.name;
          bestIsUser = !!p.isUser;
        } else if (axis.higherIsBetter) {
          if (v > bestVal) {
            bestVal = v;
            bestName = p.name;
            bestIsUser = !!p.isUser;
          }
        } else {
          if (v < bestVal) {
            bestVal = v;
            bestName = p.name;
            bestIsUser = !!p.isUser;
          }
        }
      });

      if (bestVal !== null) {
        result[axis.id] = {
          name: bestName,
          isUser: bestIsUser,
          val: axis.formatRaw(bestVal),
        };
      }
    });

    return result;
  }, [speedProfiles, device]);

  return (
    <div
      id="core-web-vitals-radar-comparison-module"
      data-testid="core-web-vitals-radar-comparison-module"
      className={`rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-indigo-900/50 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-3 sm:inset-6 z-50 overflow-y-auto flex flex-col" : ""
      } ${className}`}
    >
      {/* 1. MODULE HEADER & CONTROLS */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-slate-950/80 backdrop-blur-md">
        
        {/* Left: Branding & Core Concept */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 p-0.5 shadow-md shadow-indigo-500/25 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <RadarIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Hız Analiz Karşılaştırma Modülü</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/40 uppercase tracking-wide flex items-center gap-1">
                <Layers className="w-2.5 h-2.5 text-indigo-400" />
                <span>Çoklu Radar Çakıştırma</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 uppercase tracking-wide">
                Canlı Core Web Vitals
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tüm rakiplerin Core Web Vitals performanslarını tek bir radar grafiğinde üst üste bindirerek farkları anlık görselleştirin.
            </p>
          </div>
        </div>

        {/* Right: Device Switcher & Window Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          
          {/* Device Selector */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              id="radar-device-mobile-btn"
              data-testid="radar-device-mobile-btn"
              onClick={() => handleDeviceSwitch("mobile")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === "mobile"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mobil Core Web Vitals Simülasyonu"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>

            <button
              type="button"
              id="radar-device-desktop-btn"
              data-testid="radar-device-desktop-btn"
              onClick={() => handleDeviceSwitch("desktop")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === "desktop"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Masaüstü Core Web Vitals Simülasyonu"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Masaüstü</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            id="radar-fullscreen-toggle-btn"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran görüntüle"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            id="radar-collapse-toggle-btn"
            onClick={togglePanel}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            title={isExpanded ? "Modülü daralt" : "Modülü genişlet"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. EXPANDABLE RADAR BODY */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* 2.1 INTERACTIVE COMPETITOR LAYER TOGGLES (CHIPS) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Çakıştırma Katmanları:</span>
              </span>

              {speedProfiles.map((p, idx) => {
                const theme = SERIES_THEMES[idx % SERIES_THEMES.length];
                const isVisible = visibleSeriesIds[p.id] ?? true;
                const isHovered = hoveredSeriesId === p.id;

                return (
                  <button
                    key={p.id}
                    type="button"
                    id={`toggle-radar-layer-${p.id}`}
                    onClick={() => toggleSeriesVisibility(p.id)}
                    onMouseEnter={() => setHoveredSeriesId(p.id)}
                    onMouseLeave={() => setHoveredSeriesId(null)}
                    className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                      isVisible
                        ? `${theme.bgClass} ${theme.borderClass} text-white shadow-xs`
                        : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300"
                    } ${isHovered ? "ring-2 ring-white/50 scale-105" : ""}`}
                    title={`${p.name} katmanını aç/kapat (Tıkla)`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: isVisible ? theme.stroke : "#475569" }}
                    />
                    <span>{p.isUser ? `★ ${p.name}` : `#${p.rank} ${p.name}`}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      ({p[device].score}/100)
                    </span>
                    {isVisible ? (
                      <Eye className="w-3 h-3 text-slate-300 ml-0.5" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-600 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions: Show All / Solo User */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShowAll}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 transition-all cursor-pointer"
              >
                Hepsini Aç
              </button>
              {speedProfiles.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleIsolateCompetitor(speedProfiles[1].id)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold border border-indigo-800 transition-all cursor-pointer"
                  title="Sadece Siteniz ile #1 Rakip'i karşılaştır"
                >
                  Siteniz vs #1 Rakip
                </button>
              )}
            </div>
          </div>

          {/* 2.2 MAIN COMPARISON GRID: RADAR CHART ON LEFT, INSIGHTS & HEAD-TO-HEAD MATRIX ON RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* RADAR CANVAS CONTAINER (7 COLUMNS) */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-950/90 border border-slate-800/90 p-4 sm:p-5 flex flex-col items-center relative overflow-hidden">
              
              {/* Radar Chart Background Glow */}
              <div className="absolute inset-0 bg-radial from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

              <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 z-10">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Core Web Vitals Radar Çokgeni</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Daha geniş alan = Daha üstün hız & SEO avantajı
                </span>
              </div>

              {/* THE SVG RADAR CHART */}
              <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center select-none py-2">
                <svg
                  viewBox="0 0 460 460"
                  className="w-full h-full overflow-visible drop-shadow-xl"
                >
                  <defs>
                    {/* Radial gradient for user profile */}
                    <radialGradient id="userRadarGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </radialGradient>
                    <radialGradient id="comp1RadarGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
                    </radialGradient>
                    <radialGradient id="comp2RadarGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
                    </radialGradient>
                    <radialGradient id="comp3RadarGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
                    </radialGradient>
                  </defs>

                  {/* 1. BACKGROUND CONCENTRIC POLYGON RINGS */}
                  {gridRings.map((ring) => (
                    <polygon
                      key={`ring-${ring.level}`}
                      points={ring.points}
                      fill="none"
                      stroke={ring.level === 100 ? "#475569" : "#334155"}
                      strokeWidth={ring.level === 100 ? "1.5" : "0.75"}
                      strokeDasharray={ring.level === 100 ? "none" : "3,3"}
                      className="transition-all duration-300"
                    />
                  ))}

                  {/* Ring Level Guides (Text labels along the 12 o'clock spoke) */}
                  <text x={cx + 4} y={cy - 30} fill="#64748b" fontSize="8" fontWeight="bold">20% Zayıf</text>
                  <text x={cx + 4} y={cy - 60} fill="#64748b" fontSize="8" fontWeight="bold">40%</text>
                  <text x={cx + 4} y={cy - 90} fill="#64748b" fontSize="8" fontWeight="bold">60% Orta</text>
                  <text x={cx + 4} y={cy - 120} fill="#64748b" fontSize="8" fontWeight="bold">80% İyi</text>
                  <text x={cx + 4} y={cy - 148} fill="#94a3b8" fontSize="8" fontWeight="black">100% Eşik</text>

                  {/* 2. RADIAL AXIS SPOKES */}
                  {METRIC_AXES.map((axis, i) => {
                    const { x, y } = getCoordinates(i, 100);
                    const isSelected = selectedAxisId === axis.id;

                    return (
                      <g key={`spoke-${axis.id}`}>
                        <line
                          x1={cx}
                          y1={cy}
                          x2={x}
                          y2={y}
                          stroke={isSelected ? "#f59e0b" : "#475569"}
                          strokeWidth={isSelected ? "2" : "1"}
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}

                  {/* 3. OVERLAID COMPETITOR RADAR POLYGONS */}
                  {seriesPaths.map((series, idx) => {
                    if (!series.isVisible) return null;

                    const isHovered = hoveredSeriesId === series.profile.id;
                    const isAnyHovered = hoveredSeriesId !== null;
                    const strokeWidth = series.profile.isUser ? (isHovered ? 3.5 : 2.8) : (isHovered ? 3.0 : 1.8);
                    const fillOpacity = isAnyHovered ? (isHovered ? 0.45 : 0.08) : 0.22;

                    return (
                      <g key={`series-polygon-${series.profile.id}`} className="transition-all duration-500">
                        {/* Shaded Area */}
                        <polygon
                          points={series.polygonPoints}
                          fill={series.theme.stroke}
                          fillOpacity={fillOpacity}
                          stroke={series.theme.stroke}
                          strokeWidth={strokeWidth}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="transition-all duration-500 cursor-pointer"
                          onMouseEnter={() => setHoveredSeriesId(series.profile.id)}
                          onMouseLeave={() => setHoveredSeriesId(null)}
                        />

                        {/* Vertex Points (Circles) */}
                        {series.axisData.map((pt) => {
                          const isPtHovered =
                            hoveredPoint?.profileId === series.profile.id &&
                            hoveredPoint?.axisId === pt.axisDef.id;

                          return (
                            <circle
                              key={`pt-${series.profile.id}-${pt.axisDef.id}`}
                              cx={pt.x}
                              cy={pt.y}
                              r={isPtHovered ? 6.5 : series.profile.isUser ? 4.5 : 3.5}
                              fill={series.theme.stroke}
                              stroke="#0f172a"
                              strokeWidth={isPtHovered ? 2.5 : 1.5}
                              className="cursor-pointer transition-all duration-200"
                              onMouseEnter={(e) => {
                                setHoveredSeriesId(series.profile.id);
                                setHoveredPoint({
                                  profileId: series.profile.id,
                                  profileName: series.profile.name,
                                  axisId: pt.axisDef.id,
                                  axisLabel: pt.axisDef.label,
                                  rawValue: pt.axisDef.formatRaw(pt.rawVal),
                                  normalizedScore: pt.normalized,
                                  x: pt.x,
                                  y: pt.y,
                                });
                              }}
                              onMouseLeave={() => {
                                setHoveredPoint(null);
                              }}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* 4. AXIS VERTEX LABELS (OUTSIDE THE RADAR) */}
                  {METRIC_AXES.map((axis, i) => {
                    // Position slightly beyond maxRadius
                    const { x, y } = getCoordinates(i, 118);
                    const isSelected = selectedAxisId === axis.id;
                    const best = bestPerformers[axis.id];

                    // Determine text anchor based on angle
                    const angleDeg = ((-90 + (i * 360) / numAxes) + 360) % 360;
                    let textAnchor = "middle";
                    if (angleDeg > 20 && angleDeg < 160) textAnchor = "start";
                    else if (angleDeg > 200 && angleDeg < 340) textAnchor = "end";

                    return (
                      <g
                        key={`label-${axis.id}`}
                        className="cursor-pointer group"
                        onClick={() => setSelectedAxisId((prev) => (prev === axis.id ? null : axis.id))}
                      >
                        {/* Background pill for axis name */}
                        <text
                          x={x}
                          y={y - 6}
                          textAnchor={textAnchor}
                          fill={isSelected ? "#f59e0b" : "#f1f5f9"}
                          fontSize="11"
                          fontWeight={isSelected ? "900" : "bold"}
                          className="group-hover:fill-amber-400 transition-colors"
                        >
                          {axis.shortLabel}
                        </text>

                        <text
                          x={x}
                          y={y + 7}
                          textAnchor={textAnchor}
                          fill="#94a3b8"
                          fontSize="9"
                          fontWeight="normal"
                          className="font-mono"
                        >
                          Hedef: {axis.targetText}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* HOVER TOOLTIP FLOATING OVER SVG */}
                {hoveredPoint && (
                  <div
                    className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1 animate-in fade-in"
                    style={{
                      left: `${(hoveredPoint.x / 460) * 100}%`,
                      top: `${(hoveredPoint.y / 460) * 100}%`,
                    }}
                  >
                    <div className="font-bold text-white flex items-center justify-between gap-2">
                      <span>{hoveredPoint.profileName}</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {hoveredPoint.normalizedScore}/100 Skoru
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      {hoveredPoint.axisLabel}:{" "}
                      <strong className="text-amber-300 font-mono">{hoveredPoint.rawValue}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Radar Footer Legend & Advice */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Noktaların üzerine gelerek net milisaniye ve saniye verilerini görün.</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  ★ Siteniz: En geniş dış halka alanına sahip
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: COMPARATIVE ADVANTAGE, AXIS ANALYSIS & MATRIX (5 COLUMNS) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 2.2.1 SUMMARY OF COMPETITIVE SPEED MOAT */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Sıralama Hız Avantajınız</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-black text-[10px]">
                    %100 CWV GEÇTİ
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    Radar grafiğinde yeşil çokgenle temsil edilen siteniz, rakiplere göre hem <strong>yüklenme (LCP 1.2s)</strong> hem de <strong>etkileşim hızında (INP 48ms)</strong> açık ara öndedir.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Ortalama LCP Üstünlüğü</div>
                      <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                        +1.9s Daha Hızlı
                      </div>
                      <div className="text-[9px] text-slate-500">Rakipler 3.4s bekletiyor</div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Tıklama Reaksiyon (INP)</div>
                      <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                        162ms Daha Çevik
                      </div>
                      <div className="text-[9px] text-slate-500">Donma / gecikme yok</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2.2.2 DETAILED HEAD-TO-HEAD CWV METRICS MATRIX */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Metrik Bazlı Kıyaslama Tablosu ({device === "mobile" ? "Mobil" : "Masaüstü"})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {speedProfiles.length} Domain
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="pb-2 font-bold">Metrik</th>
                        {speedProfiles.map((p, idx) => (
                          <th key={p.id} className="pb-2 font-bold text-center">
                            <span className={p.isUser ? "text-amber-400 font-black" : "text-slate-300"}>
                              {p.isUser ? "Siteniz" : `Rakip #${p.rank}`}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {METRIC_AXES.map((axis) => {
                        const isSelected = selectedAxisId === axis.id;

                        return (
                          <tr
                            key={`matrix-row-${axis.id}`}
                            onClick={() => setSelectedAxisId((prev) => (prev === axis.id ? null : axis.id))}
                            className={`transition-colors cursor-pointer hover:bg-slate-900/60 ${
                              isSelected ? "bg-indigo-950/40" : ""
                            }`}
                          >
                            <td className="py-2 pr-2 text-[11px] font-sans font-bold text-slate-300 flex items-center justify-between">
                              <span>{axis.shortLabel}</span>
                              <span className="text-[9px] text-slate-500 font-normal">{axis.targetText}</span>
                            </td>

                            {speedProfiles.map((p) => {
                              const val = p[device][axis.id as keyof typeof p[typeof device]] as number;
                              const formatted = axis.formatRaw(val);
                              const isGood = axis.higherIsBetter
                                ? val >= axis.goodThreshold
                                : val <= axis.goodThreshold;
                              const isPoor = axis.higherIsBetter
                                ? val < axis.poorThreshold
                                : val > axis.poorThreshold;

                              return (
                                <td key={`cell-${p.id}-${axis.id}`} className="py-2 text-center text-[11px]">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-bold ${
                                      isGood
                                        ? "bg-emerald-500/20 text-emerald-300"
                                        : isPoor
                                        ? "bg-rose-500/20 text-rose-300"
                                        : "bg-amber-500/20 text-amber-300"
                                    }`}
                                  >
                                    {formatted}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2.2.3 CRITICAL COMPETITOR BOTTLENECKS (OPPORTUNITIES FOR SEO) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rakiplerin En Zayıf Halka Teşhisi</span>
                </div>

                <div className="space-y-2">
                  {speedProfiles.slice(1).map((comp) => (
                    <div key={`diag-${comp.id}`} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
                        <span>#{comp.rank} {comp.name} ({comp.domain})</span>
                        <span className="text-rose-400 font-mono">
                          {comp[device].score}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {comp[device].bottleneck}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
