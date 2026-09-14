import React, { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Play,
  Pause,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Maximize2,
  Sliders,
  Laptop
} from "lucide-react";

export type DeviceMode = "desktop" | "tablet" | "mobile";
export type Orientation = "portrait" | "landscape";

export interface DevicePreset {
  id: string;
  name: string;
  type: DeviceMode;
  width: number;
  height: number;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl";
  label: string;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  // Desktop Presets
  {
    id: "desktop-fluid",
    name: "Akışkan Masaüstü",
    type: "desktop",
    width: 0,
    height: 800,
    breakpoint: "xl",
    label: "100% Responsive",
  },
  {
    id: "desktop-macbook",
    name: "MacBook / Laptop (13\")",
    type: "desktop",
    width: 1280,
    height: 800,
    breakpoint: "xl",
    label: "1280 × 800 px",
  },
  {
    id: "desktop-fhd",
    name: "Geniş Ekran Monitör",
    type: "desktop",
    width: 1440,
    height: 900,
    breakpoint: "xl",
    label: "1440 × 900 px",
  },

  // Tablet Presets
  {
    id: "tablet-ipad",
    name: "Apple iPad Air / 10.9\"",
    type: "tablet",
    width: 768,
    height: 1024,
    breakpoint: "md",
    label: "768 × 1024 px",
  },
  {
    id: "tablet-ipad-pro",
    name: "iPad Pro 11\" / Galaxy Tab",
    type: "tablet",
    width: 834,
    height: 1112,
    breakpoint: "md",
    label: "834 × 1112 px",
  },

  // Mobile Presets
  {
    id: "mobile-iphone-15",
    name: "iPhone 15 / 16 Pro",
    type: "mobile",
    width: 393,
    height: 852,
    breakpoint: "xs",
    label: "393 × 852 px",
  },
  {
    id: "mobile-iphone-se",
    name: "iPhone SE / Kompakt",
    type: "mobile",
    width: 375,
    height: 667,
    breakpoint: "xs",
    label: "375 × 667 px",
  },
  {
    id: "mobile-galaxy-s24",
    name: "Samsung Galaxy S24 / Pixel",
    type: "mobile",
    width: 412,
    height: 915,
    breakpoint: "xs",
    label: "412 × 915 px",
  },
];

interface DeviceViewToggleProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  orientation: Orientation;
  onOrientationChange: (orientation: Orientation) => void;
  showBezel: boolean;
  onToggleBezel: () => void;
  activePreset: DevicePreset;
  onSelectPreset: (preset: DevicePreset) => void;
  isAutoTouring: boolean;
  onToggleAutoTour: () => void;
  onOpenAudit: () => void;
}

export const DeviceViewToggle: React.FC<DeviceViewToggleProps> = ({
  deviceMode,
  onDeviceModeChange,
  orientation,
  onOrientationChange,
  showBezel,
  onToggleBezel,
  activePreset,
  onSelectPreset,
  isAutoTouring,
  onToggleAutoTour,
  onOpenAudit,
}) => {
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);

  // Compute active dimension labels
  const getDimensionLabel = () => {
    if (deviceMode === "desktop") {
      return activePreset.width > 0 ? `${activePreset.width} × ${activePreset.height} px` : "100% Akışkan (Fluid)";
    }
    const w = orientation === "portrait" ? activePreset.width : activePreset.height;
    const h = orientation === "portrait" ? activePreset.height : activePreset.width;
    return `${w} × ${h} px ${orientation === "landscape" ? "(Yatay)" : "(Dikey)"}`;
  };

  // Compute active Tailwind breakpoint based on current width and orientation
  const getEffectiveBreakpoint = (): "xs" | "sm" | "md" | "lg" | "xl" => {
    if (deviceMode === "desktop") {
      return activePreset.width === 0 || activePreset.width >= 1280 ? "xl" : "lg";
    }
    const currentW = orientation === "portrait" ? activePreset.width : activePreset.height;
    if (currentW < 640) return "xs";
    if (currentW < 768) return "sm";
    if (currentW < 1024) return "md";
    if (currentW < 1280) return "lg";
    return "xl";
  };

  const activeBreakpoint = getEffectiveBreakpoint();

  const handleToggleOrientation = () => {
    onOrientationChange(orientation === "portrait" ? "landscape" : "portrait");
  };

  const currentCategoryPresets = DEVICE_PRESETS.filter((p) => p.type === deviceMode);

  return (
    <div
      id="device-view-toggle-bar"
      className="bg-slate-900/95 backdrop-blur-md text-white px-3 sm:px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3"
    >
      {/* Left: 3-Segment Device View Toggle (Desktop, Tablet, Mobile) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-850 shadow-inner">
          {/* 1. Desktop Mode */}
          <button
            type="button"
            id="device-toggle-desktop-btn"
            onClick={() => {
              onDeviceModeChange("desktop");
              const defaultDesktop = DEVICE_PRESETS.find((p) => p.id === "desktop-fluid")!;
              onSelectPreset(defaultDesktop);
            }}
            className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceMode === "desktop"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
            title="Masaüstü Görünümü (Kısayol: 1)"
          >
            <Monitor className={`w-4 h-4 ${deviceMode === "desktop" ? "text-slate-950 stroke-[2.5]" : "text-slate-400 group-hover:text-amber-400"}`} />
            <span>Masaüstü</span>
            <span
              className={`text-[10px] font-mono px-1 rounded transition-colors hidden sm:inline ${
                deviceMode === "desktop" ? "bg-black/20 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
              }`}
            >
              1
            </span>
          </button>

          {/* 2. Tablet Mode */}
          <button
            type="button"
            id="device-toggle-tablet-btn"
            onClick={() => {
              onDeviceModeChange("tablet");
              const defaultTablet = DEVICE_PRESETS.find((p) => p.id === "tablet-ipad")!;
              onSelectPreset(defaultTablet);
            }}
            className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceMode === "tablet"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
            title="Tablet Görünümü - 768px (Kısayol: 2)"
          >
            <Tablet className={`w-4 h-4 ${deviceMode === "tablet" ? "text-slate-950 stroke-[2.5]" : "text-slate-400 group-hover:text-amber-400"}`} />
            <span>Tablet</span>
            <span
              className={`text-[10px] font-mono px-1 rounded transition-colors hidden sm:inline ${
                deviceMode === "tablet" ? "bg-black/20 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
              }`}
            >
              2
            </span>
          </button>

          {/* 3. Mobile Mode */}
          <button
            type="button"
            id="device-toggle-mobile-btn"
            onClick={() => {
              onDeviceModeChange("mobile");
              const defaultMobile = DEVICE_PRESETS.find((p) => p.id === "mobile-iphone-15")!;
              onSelectPreset(defaultMobile);
            }}
            className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
            title="Mobil Görünüm - 390px (Kısayol: 3)"
          >
            <Smartphone className={`w-4 h-4 ${deviceMode === "mobile" ? "text-slate-950 stroke-[2.5]" : "text-slate-400 group-hover:text-amber-400"}`} />
            <span>Mobil</span>
            <span
              className={`text-[10px] font-mono px-1 rounded transition-colors hidden sm:inline ${
                deviceMode === "mobile" ? "bg-black/20 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
              }`}
            >
              3
            </span>
          </button>
        </div>

        {/* Orientation Toggle (Portrait ⇄ Landscape) for Tablet & Mobile */}
        {deviceMode !== "desktop" && (
          <button
            type="button"
            id="device-toggle-rotate-btn"
            onClick={handleToggleOrientation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              orientation === "landscape"
                ? "bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-xs"
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
            }`}
            title="Ekranı 90° Döndür (Kısayol: R)"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${orientation === "landscape" ? "rotate-90 text-amber-400" : "text-slate-400"}`} />
            <span className="hidden sm:inline">
              {orientation === "landscape" ? "Yatay Mod" : "Dikey Mod"}
            </span>
          </button>
        )}

        {/* Device Frame / Bezel Toggle */}
        {deviceMode !== "desktop" && (
          <button
            type="button"
            id="device-toggle-bezel-btn"
            onClick={onToggleBezel}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showBezel
                ? "bg-slate-800 text-slate-200 border-slate-700 hover:text-white"
                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-300"
            }`}
            title={showBezel ? "Cihaz kasasını gizle (Sade önizleme)" : "Gerçekçi cihaz kasasını göster"}
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline text-[11px]">
              {showBezel ? "Kasa: Açık" : "Sade Çerçeve"}
            </span>
          </button>
        )}

        {/* Device Presets Dropdown */}
        <div className="relative">
          <button
            type="button"
            id="device-preset-dropdown-btn"
            onClick={() => setIsPresetMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Cihaz Modeli & Çözünürlük Seç"
          >
            <span className="truncate max-w-[130px] sm:max-w-[160px]">
              {activePreset.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isPresetMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsPresetMenuOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 z-30 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {deviceMode === "desktop"
                    ? "🖥️ Masaüstü Modelleri"
                    : deviceMode === "tablet"
                    ? "📱 Tablet Modelleri"
                    : "📲 Mobil Cihaz Modelleri"}
                </div>
                <div className="divide-y divide-slate-800/60">
                  {currentCategoryPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setIsPresetMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        activePreset.id === preset.id
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>{preset.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Dimension HUD, Tailwind Breakpoint Meters & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Live Dimension HUD & Breakpoint Indicator */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-850">
          <span className="text-xs font-mono font-bold text-amber-400">
            {getDimensionLabel()}
          </span>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          {/* Tailwind Breakpoint Pills */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((bp) => (
              <span
                key={bp}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  activeBreakpoint === bp
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-400"
                    : "text-slate-500 bg-slate-900/60"
                }`}
                title={`Tailwind ${bp.toUpperCase()} breakpoint (${
                  bp === "xs"
                    ? "<640px Mobil"
                    : bp === "sm"
                    ? "≥640px"
                    : bp === "md"
                    ? "≥768px Tablet"
                    : bp === "lg"
                    ? "≥1024px Laptop"
                    : "≥1280px Masaüstü"
                })`}
              >
                {bp.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Auto Responsiveness Tour Button */}
        <button
          type="button"
          id="btn-auto-responsiveness-tour"
          onClick={onToggleAutoTour}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isAutoTouring
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 animate-pulse"
              : "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
          }`}
          title="Tüm cihaz boyutlarını otomatik sırayla test et (Mobil -> Tablet -> Masaüstü)"
        >
          {isAutoTouring ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Turu Durdur</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Cihaz Turu</span>
            </>
          )}
        </button>

        {/* Pre-Deploy Responsiveness Audit Button */}
        <button
          type="button"
          id="btn-open-responsiveness-audit"
          onClick={onOpenAudit}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          title="Dağıtım öncesi mobil & duyarlılık kontrol listesi"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span className="hidden lg:inline">Duyarlılık Raporu</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-mono font-bold">
            100%
          </span>
        </button>
      </div>
    </div>
  );
};
