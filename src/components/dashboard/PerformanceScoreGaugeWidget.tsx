import React, { useState, useMemo } from "react";
import { 
  Gauge, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  ChevronRight, 
  ChevronDown, 
  Sliders, 
  Layers, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  ExternalLink,
  Flame,
  Award,
  Clock,
  Activity
} from "lucide-react";
import { SiteConfig, PerformanceOptimizationSettings } from "../../types";
import { 
  simulateLighthousePerformance, 
  CoreWebVitalMetric, 
  OptimizationCheckItem,
  DEFAULT_OPTIMIZATION_SETTINGS
} from "../../utils/coreWebVitalsSimulator";

interface PerformanceScoreGaugeWidgetProps {
  config: SiteConfig;
  onChange?: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  className?: string;
  variant?: "full" | "compact";
}

export const PerformanceScoreGaugeWidget: React.FC<PerformanceScoreGaugeWidgetProps> = ({
  config,
  onChange,
  onNavigateTab,
  className = "",
  variant = "full"
}) => {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showConfigOptimizer, setShowConfigOptimizer] = useState(false);
  const [optimizingKey, setOptimizingKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute live simulated Lighthouse metrics based on current config
  const simResult = useMemo(() => {
    return simulateLighthousePerformance(config, device);
  }, [config, device]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run simulated audit animation
  const handleRunAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditStep("DOM taranıyor...");

    setTimeout(() => {
      setAuditStep("LCP & Görsel yükleri hesaplanıyor...");
    }, 250);

    setTimeout(() => {
      setAuditStep("CLS & Layout shift analiz ediliyor...");
    }, 500);

    setTimeout(() => {
      setAuditStep("INP & Main thread yanıt süreleri test ediliyor...");
    }, 750);

    setTimeout(() => {
      setIsAuditing(false);
      setAuditStep(null);
      showToast(`Lighthouse ${device === "mobile" ? "Mobil" : "Masaüstü"} denetimi tamamlandı: ${simResult.overallScore}/100`);
    }, 1050);
  };

  // Toggle or enable a single optimization
  const handleToggleOptimization = (key: keyof PerformanceOptimizationSettings) => {
    if (!onChange) return;
    setOptimizingKey(key);

    const currentSettings: PerformanceOptimizationSettings = {
      ...DEFAULT_OPTIMIZATION_SETTINGS,
      ...(config.performanceOptimizations || {})
    };

    const updatedSettings: PerformanceOptimizationSettings = {
      ...currentSettings,
      [key]: !currentSettings[key]
    };

    setTimeout(() => {
      onChange({
        ...config,
        performanceOptimizations: updatedSettings
      });
      setOptimizingKey(null);
      const isNowEnabled = updatedSettings[key];
      showToast(isNowEnabled ? "Optimizasyon aktifleştirildi, Lighthouse skoru yükseltildi!" : "Ayar güncellendi.");
    }, 250);
  };

  // Boost all optimizations to 100%
  const handleOptimizeAll = () => {
    if (!onChange || simResult.potentialScoreGain === 0) return;
    setOptimizingKey("all");

    const fullyOptimizedSettings: PerformanceOptimizationSettings = {
      webpAutoConversion: true,
      lazyLoadImages: true,
      fontDisplaySwap: true,
      criticalCssInlining: true,
      htmlMinification: true,
      brotliCompression: true,
      http3Quic: true,
      earlyHints103: true,
      zeroRenderBlocking: true,
      edgeCacheTtlDays: 365,
    };

    setTimeout(() => {
      onChange({
        ...config,
        performanceOptimizations: fullyOptimizedSettings
      });
      setOptimizingKey(null);
      showToast("Tüm Core Web Vitals optimizasyonları aktifleştirildi! Lighthouse skoru 100/100 seviyesine getirildi.");
    }, 450);
  };

  // Circular gauge SVG calculations
  // Circumference = 2 * PI * r = 2 * 3.14159 * 48 = 301.59
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (simResult.overallScore / 100) * circumference;

  // Render metric card
  const renderVitalCard = (metric: CoreWebVitalMetric) => {
    const isGood = metric.status === "good";
    const isNeedsImp = metric.status === "needs-improvement";
    
    const statusBg = isGood 
      ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
      : isNeedsImp 
        ? "bg-amber-50 text-amber-800 border-amber-200" 
        : "bg-rose-50 text-rose-800 border-rose-200";

    const dotColor = isGood ? "bg-emerald-500" : isNeedsImp ? "bg-amber-500" : "bg-rose-500";

    return (
      <div 
        key={metric.id}
        id={`cwv-card-${metric.id}`}
        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 tracking-tight">{metric.name}</span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">({metric.weight}% Ağırlık)</span>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${statusBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span>{metric.statusLabel}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-xl font-black text-slate-900 font-mono tracking-tight">
              {metric.valueFormatted}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              (Hedef: &le;{metric.thresholds.good}{metric.unit})
            </span>
          </div>

          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
            {metric.impactDescription}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="font-mono">Puan: %{metric.score}</span>
          <span className="text-emerald-700 font-medium">{metric.status === "good" ? "Örnek Düzeyde" : "Optimizasyon Gerekli"}</span>
        </div>
      </div>
    );
  };

  // Render compact badge variant
  if (variant === "compact") {
    return (
      <button
        type="button"
        id="compact-performance-gauge-btn"
        onClick={() => onNavigateTab ? onNavigateTab("performance") : undefined}
        className={`px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-xs group ${className}`}
        title={`Google Lighthouse Skoru: ${simResult.overallScore}/100 - ${simResult.allVitalsPassed ? "Tüm Vitals Geçti" : "Optimizasyon Önerisi Var"}`}
      >
        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" className="text-slate-700 stroke-current" strokeWidth="3.5" fill="transparent" />
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke={simResult.gradeColor}
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 14}
              strokeDashoffset={2 * Math.PI * 14 - (simResult.overallScore / 100) * 2 * Math.PI * 14}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-black" style={{ color: simResult.gradeColor }}>
            {simResult.overallScore}
          </span>
        </div>
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-white">Lighthouse</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {simResult.overallScore}/100
            </span>
          </div>
          <span className="text-[9px] text-slate-400">
            {simResult.allVitalsPassed ? "Vitals: Mükemmel" : `+${simResult.potentialScoreGain} Puan Artırılabilir`}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div 
      id="performance-score-gauge-widget"
      className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden ${className}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-lg border border-slate-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Performans Skoru & Core Web Vitals
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Lighthouse v11.4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mevcut web sitesi yapılandırmanızın Google Core Web Vitals ve sayfa açılış hızına etkisi.
            </p>
          </div>
        </div>

        {/* Device Switcher & Re-simulate Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Device toggle */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              type="button"
              id="btn-perf-device-mobile"
              onClick={() => setDevice("mobile")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                device === "mobile" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Mobil Cihaz (4G & CPU Kısıtlaması Simülasyonu)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px]">Mobil</span>
            </button>
            <button
              type="button"
              id="btn-perf-device-desktop"
              onClick={() => setDevice("desktop")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                device === "desktop" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Masaüstü Cihaz (Fiber Bağlantı Simülasyonu)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px]">Masaüstü</span>
            </button>
          </div>

          {/* Re-simulate Button */}
          <button
            type="button"
            id="btn-perf-resimulate"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Yapılandırmayı yeniden analiz et ve simüle et"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin text-amber-400" : ""}`} />
            <span>{isAuditing ? "Taranıyor..." : "Yeniden Simüle Et"}</span>
          </button>
        </div>
      </div>

      {/* Auditing progress notification banner */}
      {isAuditing && (
        <div className="my-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
            <span>{auditStep || "Google Lighthouse sentetik testi çalıştırılıyor..."}</span>
          </div>
          <span className="text-[11px] font-mono text-amber-700 font-bold">Simülasyon Aktif</span>
        </div>
      )}

      {/* Main Grid: Left Gauge | Center Vitals Cards | Right Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        
        {/* LEFT COLUMN: Circular Radial Gauge (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-100 text-center relative">
          {/* Radial SVG Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background track circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-slate-100 stroke-current"
                strokeWidth="9"
                fill="transparent"
              />
              {/* Foreground animated progress circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={simResult.gradeColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span 
                className="text-4xl font-black tracking-tight font-mono"
                style={{ color: simResult.gradeColor }}
              >
                {simResult.overallScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                / 100 Puan
              </span>
            </div>
          </div>

          {/* Grade Badge */}
          <div className="mt-2 space-y-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${simResult.gradeBadgeClass}`}>
              {simResult.allVitalsPassed ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{simResult.gradeLabel}</span>
            </span>

            <div className="text-[11px] text-slate-500 font-medium">
              {simResult.allVitalsPassed ? (
                <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tüm Core Web Vitals Kriterleri Geçti</span>
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  {simResult.potentialScoreGain} Puanlık Optimizasyon Potansiyeli
                </span>
              )}
            </div>
          </div>

          {/* 1-Click Boost Button if not 100 */}
          {simResult.potentialScoreGain > 0 && onChange ? (
            <button
              type="button"
              id="btn-perf-boost-all"
              onClick={handleOptimizeAll}
              disabled={optimizingKey === "all"}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{optimizingKey === "all" ? "Optimize Ediliyor..." : `1-Tıkla %100'e Yükselt (+${simResult.potentialScoreGain} Puan)`}</span>
            </button>
          ) : (
            <div className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Maksimum Hız & 0.02s Yayında</span>
            </div>
          )}

          {/* Simulated hardware & network conditions badge */}
          <div className="mt-3 w-full px-2.5 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/60 text-[10px] text-slate-500 font-medium flex items-center justify-between">
            <span className="truncate">{simResult.simulatedEnvironment.connectionType}</span>
            <span className="font-mono font-bold text-slate-700 shrink-0 ml-1">{simResult.simulatedEnvironment.rttMs}ms RTT</span>
          </div>
        </div>

        {/* CENTER & RIGHT COLUMN: Core Web Vitals Breakdown (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Google Resmi Metrikleri (Core Web Vitals)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                3 Ana Metrik
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigOptimizer(!showConfigOptimizer)}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>{showConfigOptimizer ? "Ayarları Gizle" : "Optimizasyon Ayarları"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showConfigOptimizer ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* 3 Core Web Vitals Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {renderVitalCard(simResult.lcp)}
            {renderVitalCard(simResult.inp)}
            {renderVitalCard(simResult.cls)}
          </div>

          {/* Responsiveness Standing & Interaction Latency Bar */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                simResult.responsivenessGrade === "ultra"
                  ? "bg-emerald-100 text-emerald-800"
                  : simResult.responsivenessGrade === "good"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
              }`}>
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">Yapılandırma Tepkisellik Durumu</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    simResult.responsivenessGrade === "ultra"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : simResult.responsivenessGrade === "good"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      simResult.responsivenessGrade === "ultra" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`} />
                    <span>{simResult.responsivenessLabel}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (%{simResult.responsivenessScore} Tepki Skoru)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {simResult.responsivenessSummary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">Gecikme / INP</div>
                <div className="text-xs font-mono font-bold text-slate-900">{simResult.inp.valueFormatted}</div>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">Bloke / TBT</div>
                <div className="text-xs font-mono font-bold text-slate-900">{simResult.tbt.valueFormatted}</div>
              </div>
            </div>
          </div>

          {/* Secondary Diagnostic Metrics Toggle Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px] flex-wrap">
              <span>FCP: <strong className="text-slate-900">{simResult.fcp.valueFormatted}</strong></span>
              <span>TBT: <strong className="text-slate-900">{simResult.tbt.valueFormatted}</strong></span>
              <span>TTFB: <strong className="text-slate-900">{simResult.ttfb.valueFormatted}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-toggle-diagnostics"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>{showDiagnostics ? "Tanı Detaylarını Kapat" : "Tanı Detaylarını Aç"}</span>
              </button>

              {onNavigateTab && (
                <button
                  type="button"
                  id="btn-perf-full-tab"
                  onClick={() => onNavigateTab("performance")}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Tam Rapor & Hız Testi</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* EXPANDABLE SECTION 1: Diagnostic Companion Metrics */}
      {showDiagnostics && (
        <div className="mt-5 pt-5 border-t border-slate-100 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Gelişmiş Laboratuvar Tanı Metrikleri (Lighthouse Diagnostics)</span>
            </h3>
            <span className="text-[10px] text-slate-400">Sunucu ve ağ katmanı analizleri</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* FCP */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">FCP (İlk İçerikli Boyama)</span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {simResult.fcp.valueFormatted}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {simResult.fcp.impactDescription}
              </p>
            </div>

            {/* TBT */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">TBT (Toplam Engelleme Süresi)</span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {simResult.tbt.valueFormatted}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {simResult.tbt.impactDescription}
              </p>
            </div>

            {/* TTFB */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">TTFB (İlk Yanıt Baytı)</span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {simResult.ttfb.valueFormatted}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {simResult.ttfb.impactDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDABLE SECTION 2: Configuration Optimization Checklist */}
      {showConfigOptimizer && (
        <div className="mt-5 pt-5 border-t border-slate-100 animate-fade-in space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Site Yapılandırması & Optimizasyon Ayarları</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aktif/pasif ayarlarınızın doğrudan Lighthouse performans puanına olan etkisini inceleyin ve tek tıkla uygulayın.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">
                Aktif: <span className="text-emerald-600">{simResult.activeOptimizationsCount}</span> / {simResult.totalOptimizationsCount}
              </span>
              {simResult.potentialScoreGain > 0 && onChange && (
                <button
                  type="button"
                  onClick={handleOptimizeAll}
                  disabled={optimizingKey === "all"}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                  <span>Tümünü Aç (+{simResult.potentialScoreGain} Puan)</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {simResult.optimizations.map((item) => (
              <div
                key={item.key}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  item.enabled 
                    ? "bg-slate-50/60 border-slate-200" 
                    : "bg-amber-50/50 border-amber-200 ring-1 ring-amber-200"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.label}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-slate-200/80 text-slate-700">
                      {item.relatedMetric.toUpperCase()}
                    </span>
                    {!item.enabled && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        +{item.scoreImpact} Puan
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {item.description}
                  </p>
                </div>

                {onChange && (
                  <button
                    type="button"
                    onClick={() => handleToggleOptimization(item.key)}
                    disabled={optimizingKey === item.key || optimizingKey === "all"}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      item.enabled
                        ? "bg-emerald-100 text-emerald-800 hover:bg-rose-50 hover:text-rose-700"
                        : "bg-amber-500 text-slate-950 hover:bg-amber-400 font-black shadow-2xs"
                    }`}
                    title={item.enabled ? "Kapatmak için tıklayın" : "Aktifleştir ve puan kazan"}
                  >
                    {optimizingKey === item.key ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : item.enabled ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <span>Aç</span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Audit Signature */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Statik Edge Mimarisi & Google Core Web Vitals Uyumlu</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Son Sentetik Simülasyon: {simResult.auditDate}</span>
          <span className="font-mono text-slate-500">v11.4 Engine</span>
        </div>
      </div>
    </div>
  );
};
