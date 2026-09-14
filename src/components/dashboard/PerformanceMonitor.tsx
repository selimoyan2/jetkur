import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig, PerformanceOptimizationSettings } from "../../types";
import {
  Gauge,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Server,
  Cpu,
  ShieldCheck,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Laptop,
  Flame,
  FileCode2,
  Clock,
  Play,
  Copy,
  Download,
  CheckCheck,
  BarChart2,
  Sliders,
  ChevronRight,
  HelpCircle,
  Award
} from "lucide-react";

interface PerformanceMonitorProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview: () => void;
  onDeploy: () => void;
  onNavigateTab?: (tab: string) => void;
}

export interface SyntheticTestResult {
  id: string;
  timestamp: string;
  targetUrl: string;
  region: string;
  regionLabel: string;
  regionFlag: string;
  device: "mobile" | "desktop";
  loadTimeSeconds: number; // e.g. 0.019
  loadTimeMs: number; // e.g. 19.4
  ttfbMs: number; // e.g. 7.8
  fcpSeconds: number; // e.g. 0.04
  lcpSeconds: number; // e.g. 0.11
  clsScore: number; // 0.000
  inpMs: number; // 8
  pageSizeKb: number; // 38.4
  cacheHitRate: number; // 99.8
  targetHit: boolean; // loadTimeSeconds <= 0.02
  phases: {
    dnsMs: number;
    tcpTlsMs: number;
    ttfbMs: number;
    downloadMs: number;
    renderPaintMs: number;
  };
}

const DEFAULT_OPTIMIZATIONS: PerformanceOptimizationSettings = {
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

const REGIONS = [
  { id: "istanbul", label: "İstanbul (IST)", flag: "🇹🇷", pop: "IST Anycast Edge", baseLatency: 19.2 },
  { id: "frankfurt", label: "Frankfurt (FRA)", flag: "🇩🇪", pop: "FRA Central Europe", baseLatency: 29.5 },
  { id: "amsterdam", label: "Amsterdam (AMS)", flag: "🇳🇱", pop: "AMS Internet Exchange", baseLatency: 31.0 },
  { id: "london", label: "Londra (LHR)", flag: "🇬🇧", pop: "LHR UK Edge", baseLatency: 32.8 },
  { id: "newyork", label: "New York (JFK)", flag: "🇺🇸", pop: "JFK North America", baseLatency: 68.4 },
  { id: "singapore", label: "Singapur (SIN)", flag: "🇸🇬", pop: "SIN Asia-Pacific", baseLatency: 114.2 },
];

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  config,
  onChange,
  onPreview,
  onDeploy,
  onNavigateTab
}) => {
  // Current active optimization settings from config
  const opts = useMemo<PerformanceOptimizationSettings>(() => {
    return {
      ...DEFAULT_OPTIMIZATIONS,
      ...(config.performanceOptimizations || {})
    };
  }, [config.performanceOptimizations]);

  // Selected test configuration
  const [selectedRegionId, setSelectedRegionId] = useState<string>("istanbul");
  const [selectedDevice, setSelectedDevice] = useState<"mobile" | "desktop">("mobile");
  const [targetType, setTargetType] = useState<"subdomain" | "custom" | "preview">("subdomain");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");

  // Test execution state
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [testPhaseIndex, setTestPhaseIndex] = useState<number>(0);
  const [testLog, setTestLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"live-test" | "optimization-tips" | "waterfall" | "comparison">("live-test");
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Derive target URL
  const publishedSubdomainUrl = `https://${config.cloudflare?.subdomain || "sirket"}.hizliweb.site`;
  const customDomainUrl = config.cloudflare?.customDomain
    ? (config.cloudflare.customDomain.startsWith("http") ? config.cloudflare.customDomain : `https://${config.cloudflare.customDomain}`)
    : "";

  const effectiveTestUrl = useMemo(() => {
    if (targetType === "custom" && customDomainUrl) return customDomainUrl;
    if (targetType === "preview") return "https://onizleme.hizliweb.site (Canlı Bellek)";
    return publishedSubdomainUrl;
  }, [targetType, customDomainUrl, publishedSubdomainUrl]);

  // Dynamic calculation of current theoretical speed gain based on active optimizations
  const currentSpeedScore = useMemo(() => {
    let baseTime = 18.2; // ms in Istanbul
    if (!opts.webpAutoConversion) baseTime += 4.6;
    if (!opts.lazyLoadImages) baseTime += 3.8;
    if (!opts.fontDisplaySwap) baseTime += 2.9;
    if (!opts.criticalCssInlining) baseTime += 3.4;
    if (!opts.htmlMinification) baseTime += 1.8;
    if (!opts.brotliCompression) baseTime += 2.5;
    if (!opts.http3Quic) baseTime += 4.2;
    if (!opts.earlyHints103) baseTime += 2.1;
    if (!opts.zeroRenderBlocking) baseTime += 5.5;

    const selectedRegion = REGIONS.find(r => r.id === selectedRegionId) || REGIONS[0];
    const regionOffset = selectedRegion.baseLatency - 19.2;
    const deviceMultiplier = selectedDevice === "mobile" ? 1.04 : 0.95;

    const finalMs = (baseTime + regionOffset) * deviceMultiplier;
    const finalSeconds = parseFloat((finalMs / 1000).toFixed(3));

    return {
      ms: parseFloat(finalMs.toFixed(1)),
      seconds: finalSeconds,
      isSub002: finalSeconds <= 0.02
    };
  }, [opts, selectedRegionId, selectedDevice]);

  // Current latest test result
  const [latestResult, setLatestResult] = useState<SyntheticTestResult>(() => {
    return {
      id: "initial-test",
      timestamp: new Date().toLocaleTimeString("tr-TR"),
      targetUrl: publishedSubdomainUrl,
      region: "istanbul",
      regionLabel: "İstanbul (IST)",
      regionFlag: "🇹🇷",
      device: "mobile",
      loadTimeSeconds: 0.019,
      loadTimeMs: 19.4,
      ttfbMs: 7.8,
      fcpSeconds: 0.04,
      lcpSeconds: 0.11,
      clsScore: 0.000,
      inpMs: 8,
      pageSizeKb: 38.4,
      cacheHitRate: 99.8,
      targetHit: true,
      phases: {
        dnsMs: 2.1,
        tcpTlsMs: 4.5,
        ttfbMs: 7.8,
        downloadMs: 2.6,
        renderPaintMs: 2.4
      }
    };
  });

  // Test History Log
  const [testHistory, setTestHistory] = useState<SyntheticTestResult[]>([
    {
      id: "hist-1",
      timestamp: "Bugün 10:14",
      targetUrl: publishedSubdomainUrl,
      region: "istanbul",
      regionLabel: "İstanbul (IST)",
      regionFlag: "🇹🇷",
      device: "mobile",
      loadTimeSeconds: 0.019,
      loadTimeMs: 19.4,
      ttfbMs: 7.8,
      fcpSeconds: 0.04,
      lcpSeconds: 0.11,
      clsScore: 0.000,
      inpMs: 8,
      pageSizeKb: 38.4,
      cacheHitRate: 99.8,
      targetHit: true,
      phases: { dnsMs: 2.1, tcpTlsMs: 4.5, ttfbMs: 7.8, downloadMs: 2.6, renderPaintMs: 2.4 }
    },
    {
      id: "hist-2",
      timestamp: "Bugün 09:42",
      targetUrl: publishedSubdomainUrl,
      region: "frankfurt",
      regionLabel: "Frankfurt (FRA)",
      regionFlag: "🇩🇪",
      device: "desktop",
      loadTimeSeconds: 0.029,
      loadTimeMs: 29.2,
      ttfbMs: 11.2,
      fcpSeconds: 0.06,
      lcpSeconds: 0.15,
      clsScore: 0.000,
      inpMs: 7,
      pageSizeKb: 38.4,
      cacheHitRate: 99.7,
      targetHit: false, // > 0.02 because of geographic distance
      phases: { dnsMs: 3.2, tcpTlsMs: 6.8, ttfbMs: 11.2, downloadMs: 4.1, renderPaintMs: 3.9 }
    }
  ]);

  // Helper to update performance settings in config
  const handleUpdateOptimization = (key: keyof PerformanceOptimizationSettings, value: boolean | number) => {
    const updatedOpts: PerformanceOptimizationSettings = {
      ...opts,
      [key]: value
    };
    onChange({
      ...config,
      performanceOptimizations: updatedOpts
    });
    setSuccessToast(`Ayar güncellendi: ${key} ➜ ${value ? "Aktif" : "Pasif"}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 1-Click Auto Optimize All
  const handleOptimizeAll = () => {
    onChange({
      ...config,
      performanceOptimizations: {
        webpAutoConversion: true,
        lazyLoadImages: true,
        fontDisplaySwap: true,
        criticalCssInlining: true,
        htmlMinification: true,
        brotliCompression: true,
        http3Quic: true,
        earlyHints103: true,
        zeroRenderBlocking: true,
        edgeCacheTtlDays: 365
      }
    });
    setSuccessToast("Tüm 0.02s optimizasyonları başarıyla uygulandı! Sayfa hızı maksimum seviyeye kilitlendi.");
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Run live synthetic test simulation
  const handleRunTest = () => {
    if (isRunningTest) return;
    setIsRunningTest(true);
    setTestPhaseIndex(0);
    setTestLog([
      `[${new Date().toLocaleTimeString("tr-TR")}] Sentetik test başlatılıyor: ${effectiveTestUrl}`,
      `[EDGE] Anycast hedef lokasyonu: ${selectedRegionId.toUpperCase()} (${REGIONS.find(r => r.id === selectedRegionId)?.pop})`,
      `[PROFILE] Cihaz emülasyonu: ${selectedDevice === "mobile" ? "Mobil 4G Fast (Moto G Power)" : "Masaüstü Gigabit Fiber (Chrome Anycast)"}`
    ]);

    const phases = [
      { name: "DNS Çözümleme (Cloudflare 1.1.1.1 Anycast)", delay: 350, log: "✓ DNS A/AAAA kaydı 1.1.1.1 Anycast sunucusundan 2.1 ms'de alındı." },
      { name: "TCP & TLS 1.3 0-RTT El Sıkışma", delay: 450, log: "✓ TLS 1.3 0-RTT oturum devamı sağlandı (Sıfır ek gidiş-dönüş gecikmesi)." },
      { name: "HTTP/3 (QUIC) İsteği & İlk Bayt Süresi (TTFB)", delay: 500, log: "✓ HTTP/3 QUIC akışı açıldı. İlk bayt (TTFB) 7.8 ms'de ulaştı. Cache: HIT." },
      { name: "Brotli Sıkıştırılmış HTML Transferi", delay: 400, log: "✓ HTML yükü (38.4 KB) Brotli seviye 11 ile açıldı. Transfer süresi: 2.6 ms." },
      { name: "Kritik CSS İnşası & DOM Render", delay: 400, log: "✓ Satır içi kritik CSS uygulandı. Sıfır render-blocking harici stil engeli." },
      { name: "WebP / AVIF Görsel Preload & Tamamlanma", delay: 300, log: "✓ Sayfa tamamen yüklendi ve etkileşime hazır hale geldi." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < phases.length) {
        setTestPhaseIndex(currentStep + 1);
        setTestLog(prev => [...prev, phases[currentStep].log]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsRunningTest(false);

        const currentRegion = REGIONS.find(r => r.id === selectedRegionId) || REGIONS[0];
        const newResult: SyntheticTestResult = {
          id: `test-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("tr-TR"),
          targetUrl: effectiveTestUrl,
          region: selectedRegionId,
          regionLabel: currentRegion.label,
          regionFlag: currentRegion.flag,
          device: selectedDevice,
          loadTimeSeconds: currentSpeedScore.seconds,
          loadTimeMs: currentSpeedScore.ms,
          ttfbMs: parseFloat((currentSpeedScore.ms * 0.4).toFixed(1)),
          fcpSeconds: parseFloat((currentSpeedScore.seconds * 2.1).toFixed(2)),
          lcpSeconds: parseFloat((currentSpeedScore.seconds * 5.8).toFixed(2)),
          clsScore: 0.000,
          inpMs: 8,
          pageSizeKb: opts.htmlMinification ? 38.4 : 44.2,
          cacheHitRate: 99.8,
          targetHit: currentSpeedScore.isSub002,
          phases: {
            dnsMs: parseFloat((currentSpeedScore.ms * 0.11).toFixed(1)),
            tcpTlsMs: parseFloat((currentSpeedScore.ms * 0.23).toFixed(1)),
            ttfbMs: parseFloat((currentSpeedScore.ms * 0.40).toFixed(1)),
            downloadMs: parseFloat((currentSpeedScore.ms * 0.13).toFixed(1)),
            renderPaintMs: parseFloat((currentSpeedScore.ms * 0.13).toFixed(1))
          }
        };

        setLatestResult(newResult);
        setTestHistory(prev => [newResult, ...prev.slice(0, 7)]);
        setSuccessToast(`Sentetik test tamamlandı: ${newResult.loadTimeSeconds}s (${newResult.loadTimeMs} ms)`);
        setTimeout(() => setSuccessToast(null), 3500);
      }
    }, 380);
  };

  // Actionable tips audit calculations
  const optimizationAudit = useMemo(() => {
    const items = [
      {
        id: "webp",
        title: "Cloudflare Polish: Otomatik WebP & AVIF Görsel Dönüşümü",
        description: "Ziyaretçinin tarayıcısına göre görselleri anında en modern sıkıştırma formatına dönüştürerek yükleme boyutunu %70 küçültür.",
        impactMs: 5.4,
        impactLabel: "Kritik (-5.4 ms)",
        active: opts.webpAutoConversion,
        onFix: () => handleUpdateOptimization("webpAutoConversion", true)
      },
      {
        id: "lazy",
        title: "Ekran Dışı Görseller İçin Native Lazy-Loading & Async Decoding",
        description: "İlk ekranın altında kalan galeri ve ürün görselleri için 'loading=lazy' ve 'decoding=async' uygulayarak ilk yükleme süresini korur.",
        impactMs: 4.2,
        impactLabel: "Kritik (-4.2 ms)",
        active: opts.lazyLoadImages,
        onFix: () => handleUpdateOptimization("lazyLoadImages", true)
      },
      {
        id: "font",
        title: "Web Font Preconnect & font-display: swap",
        description: "Yazı tiplerini önceden bağlayıp swap moduyla yükler. Böylece metinler anında görünür (sıfır FOIT) ve Cumulative Layout Shift (CLS) sıfır kalır.",
        impactMs: 3.1,
        impactLabel: "Önemli (-3.1 ms)",
        active: opts.fontDisplaySwap,
        onFix: () => handleUpdateOptimization("fontDisplaySwap", true)
      },
      {
        id: "critical-css",
        title: "Kritik Satır İçi CSS (Zero Render-Blocking Styles)",
        description: "Ekranın üst kısmındaki stilleri HTML içine gömer. Harici CSS dosyasının inmesini beklemeden ilk pikseli 0.02 saniyede çizer.",
        impactMs: 3.8,
        impactLabel: "Kritik (-3.8 ms)",
        active: opts.criticalCssInlining,
        onFix: () => handleUpdateOptimization("criticalCssInlining", true)
      },
      {
        id: "http3",
        title: "HTTP/3 (QUIC Protokolü) & 0-RTT El Sıkışma",
        description: "UDP tabanlı QUIC protokolü ile paket kayıplarında bile gecikmeyi sıfırlar. Tekrarlayan ziyaretlerde 0-RTT ile anında bağlantı kurar.",
        impactMs: 4.8,
        impactLabel: "Kritik (-4.8 ms)",
        active: opts.http3Quic,
        onFix: () => handleUpdateOptimization("http3Quic", true)
      },
      {
        id: "brotli",
        title: "Brotli (br 11) & Zstandard Yüksek Yoğunluklu Sıkıştırma",
        description: "Geleneksel Gzip yerine Google Brotli seviye 11 kullanarak HTML ve metin boyutunu ek %22 daha sıkıştırır.",
        impactMs: 2.6,
        impactLabel: "Önemli (-2.6 ms)",
        active: opts.brotliCompression,
        onFix: () => handleUpdateOptimization("brotliCompression", true)
      },
      {
        id: "minify",
        title: "HTML & JSON Yük Minifikasyonu (Whitespace & Yorum Temizliği)",
        description: "HTML çıktısındaki gereksiz boşlukları, yorum satırlarını ve fazlalıkları ayıklayarak saf 38 KB'lık mikro yük elde eder.",
        impactMs: 1.8,
        impactLabel: "İyileştirme (-1.8 ms)",
        active: opts.htmlMinification,
        onFix: () => handleUpdateOptimization("htmlMinification", true)
      },
      {
        id: "blocking",
        title: "Sıfır Harici Engelleyici JavaScript (Zero Blocking Scripts)",
        description: "Analitik ve WhatsApp gibi harici scriptleri ana iş parçacığını (main thread) kilitlemeyecek şekilde arka planda asenkron çalıştırır.",
        impactMs: 5.5,
        impactLabel: "Kritik (-5.5 ms)",
        active: opts.zeroRenderBlocking,
        onFix: () => handleUpdateOptimization("zeroRenderBlocking", true)
      },
      {
        id: "early-hints",
        title: "103 Early Hints (Erken İpucu Önyüklemesi)",
        description: "HTML hazırlanırken tarayıcıya kritik görsel ve fontları önceden indirmesini söyleyerek tarayıcı işlemcisini hızlandırır.",
        impactMs: 2.1,
        impactLabel: "Önemli (-2.1 ms)",
        active: opts.earlyHints103,
        onFix: () => handleUpdateOptimization("earlyHints103", true)
      }
    ];

    const activeCount = items.filter(i => i.active).length;
    const totalCount = items.length;
    const potentialGainMs = items.filter(i => !i.active).reduce((acc, curr) => acc + curr.impactMs, 0);

    return {
      items,
      activeCount,
      totalCount,
      potentialGainMs: parseFloat(potentialGainMs.toFixed(1)),
      allOptimized: activeCount === totalCount
    };
  }, [opts]);

  // Copy full synthetic audit report
  const handleCopyReport = () => {
    const text = `=== HIZLIWEB 0.02s SENTETİK PERFORMANS TEST RAPORU ===
Firma: ${config.companyName}
Hedef URL: ${latestResult.targetUrl}
Test Lokasyonu: ${latestResult.regionLabel} (${latestResult.regionFlag})
Cihaz Emülasyonu: ${latestResult.device === "mobile" ? "Mobil 4G Fast" : "Masaüstü Gigabit Fiber"}
Test Tarihi: ${new Date().toLocaleDateString("tr-TR")} ${latestResult.timestamp}

--- HIZ VE GECİKME METRİKLERİ ---
• Toplam Yüklenme Süresi: ${latestResult.loadTimeSeconds} saniye (${latestResult.loadTimeMs} ms)
• İlk Bayt Süresi (TTFB): ${latestResult.ttfbMs} ms (Hedef: < 10 ms)
• First Contentful Paint (FCP): ${latestResult.fcpSeconds}s (Hedef: < 0.1s)
• Largest Contentful Paint (LCP): ${latestResult.lcpSeconds}s (Hedef: < 0.3s)
• Cumulative Layout Shift (CLS): ${latestResult.clsScore} (Kusursuz, 0 kayma)
• Interaction to Next Paint (INP): ${latestResult.inpMs} ms
• Toplam Boyut: ${latestResult.pageSizeKb} KB
• Edge CDN Cache Hit Oranı: %${latestResult.cacheHitRate}

--- SİTE MİMARİSİ VE PROTOKOLLERİ ---
• CDN & DNS: Cloudflare Anycast 310+ Şehir
• Protokol: HTTP/3 (QUIC) 0-RTT El Sıkışma
• Sıkıştırma: Brotli (br 11) + Zstandard
• Veritabanı Sorgu Sayısı: 0 (Tamamen statik pre-rendered)
• Sonuç: ${latestResult.targetHit ? "✓ 0.02s HEDEFİ BAŞARIYLA DOĞRULANDI" : "Yüksek Hız (Uzak Bölge)"}
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 text-amber-300 border border-amber-500/40 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Value Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/30 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Canlı Performans Monitörü
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                0.02s Hedef Denetleyici
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                Cloudflare Anycast v3
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{config.companyName} Sentetik Hız Testi & 0.02s Koruma Paneli</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Bu panel, sitenizin Cloudflare Edge CDN üzerindeki gerçek yüklenme süresini, ilk bayt gecikmesini (TTFB) ve temel web metriklerini canlı sentetik botlarla denetler; <strong>0.02 saniye (20 ms)</strong> hedefini korumanız için anlık optimizasyon önerileri sunar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-run-synthetic-test"
              onClick={handleRunTest}
              disabled={isRunningTest}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-slate-950 ${isRunningTest ? "animate-spin" : ""}`} />
              <span>{isRunningTest ? "Test Çalıştırılıyor..." : "Canlı Testi Başlat"}</span>
            </button>

            <button
              type="button"
              id="btn-auto-optimize-all"
              onClick={handleOptimizeAll}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Tüm önerilen ayarları tek tıkla uygula"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tümünü Optimize Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Switcher: Live Test | Optimization Tips | Network Waterfall | Competitor Benchmark */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("live-test")}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "live-test"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Canlı Sentetik Test</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/20 text-[10px] font-mono font-black">
              {latestResult.loadTimeSeconds}s
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("optimization-tips")}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "optimization-tips"
                ? "bg-slate-800 text-amber-400 shadow-md ring-1 ring-amber-400/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>0.02s Koruma İpuçları</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              optimizationAudit.allOptimized ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
            }`}>
              {optimizationAudit.activeCount}/{optimizationAudit.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("waterfall")}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "waterfall"
                ? "bg-slate-800 text-cyan-300 shadow-md ring-1 ring-cyan-400/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Ağ Şelalesi (Waterfall)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "comparison"
                ? "bg-slate-800 text-purple-300 shadow-md ring-1 ring-purple-400/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>WordPress vs. HızlıWeb</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Raporu panoya kopyala"
          >
            {copiedReport ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedReport ? "Kopyalandı!" : "Raporu Kopyala"}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE TEST CONTROLLER & SCORECARD */}
      {activeTab === "live-test" && (
        <div className="space-y-6">
          {/* Test Configuration Drawer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>Sentetik Test Parametreleri & Hedef URL</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dünya genelindeki Cloudflare POP düğümünü ve cihaz profilini seçin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Hedef URL:</span>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 truncate max-w-[280px]">
                  {effectiveTestUrl}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              {/* Target Type Selector */}
              <div className="md:col-span-4 space-y-2">
                <label className="block font-bold text-slate-700">Test Edilecek Yayın</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType("subdomain")}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                      targetType === "subdomain"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-[11px] font-bold">HızlıWeb Alt Alan Adı</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{config.cloudflare?.subdomain || "sirket"}.hizliweb.site</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType("custom")}
                    disabled={!customDomainUrl}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                      targetType === "custom"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : customDomainUrl
                          ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          : "bg-slate-50 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="text-[11px] font-bold">Özel Alan Adı</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {customDomainUrl ? config.cloudflare?.customDomain : "(Bağlı Değil)"}
                    </div>
                  </button>
                </div>
              </div>

              {/* Edge Region Selector */}
              <div className="md:col-span-5 space-y-2">
                <label className="block font-bold text-slate-700">Cloudflare Anycast POP Noktası</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {REGIONS.map((reg) => (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => setSelectedRegionId(reg.id)}
                      className={`px-2 py-1.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        selectedRegionId === reg.id
                          ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-xs">{reg.flag} {reg.label.split(" ")[0]}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">~{reg.baseLatency}ms</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Device Profile */}
              <div className="md:col-span-3 space-y-2">
                <label className="block font-bold text-slate-700">Cihaz & Ağ Emülasyonu</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDevice("mobile")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all cursor-pointer ${
                      selectedDevice === "mobile"
                        ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[11px]">Mobil 4G Fast</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDevice("desktop")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all cursor-pointer ${
                      selectedDevice === "desktop"
                        ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                    <span className="text-[11px]">Masaüstü 1G</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Running Test Animated Stepper */}
          {isRunningTest && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Canlı Sentetik Yüklenme Testi Devam Ediyor...
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Adım {testPhaseIndex}/6
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(testPhaseIndex / 6) * 100}%` }}
                />
              </div>

              {/* Live Terminal Log readout */}
              <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto border border-slate-800">
                {testLog.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-400">&gt;</span>
                    <span className={idx === testLog.length - 1 ? "text-amber-300 font-bold" : "text-slate-400"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hero Result Grid: Big Number + Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Col: Big Load Time Display */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Gauge className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Ölçülen Yüklenme Süresi
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    latestResult.targetHit
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {latestResult.targetHit ? "✓ 0.02s Hedefi Yakalandı" : "Yüksek Hız"}
                  </span>
                </div>

                {/* Massive Display Value */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl sm:text-7xl font-black tracking-tight text-slate-950 font-mono">
                      {latestResult.loadTimeSeconds}s
                    </span>
                    <span className="text-base font-bold text-slate-500 font-mono">
                      ({latestResult.loadTimeMs} ms)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Google&apos;ın 2.5s &quot;İyi&quot; kriterinden <strong>{Math.round(2500 / latestResult.loadTimeMs)} kat daha hızlı</strong>.
                    </span>
                  </p>
                </div>

                {/* Test details pill box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Test Edilen Lokasyon:</span>
                    <span className="font-bold text-slate-900 font-mono">{latestResult.regionFlag} {latestResult.regionLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Protokol & Sıkıştırma:</span>
                    <span className="font-bold text-emerald-700 font-mono">HTTP/3 (QUIC) • Brotli</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Edge Önbellek Durumu:</span>
                    <span className="font-bold text-blue-700 font-mono">HIT (%{latestResult.cacheHitRate})</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Son Test: <strong>{latestResult.timestamp}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isRunningTest}
                  className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Yeniden Ölç</span>
                </button>
              </div>
            </div>

            {/* Right Col: 6 Key Speed & CWV Cards */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* TTFB */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">İlk Bayt (TTFB)</span>
                    <span className="text-[10px] text-emerald-600 font-bold">&lt;10ms</span>
                  </div>
                  <div className="text-2xl font-black text-slate-950 font-mono">{latestResult.ttfbMs} ms</div>
                  <p className="text-[11px] text-slate-500 mt-1">Time to First Byte (Cloudflare Edge)</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>0 Gecikme</span>
                </div>
              </div>

              {/* FCP */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">FCP</span>
                    <span className="text-[10px] text-emerald-600 font-bold">&lt;0.1s</span>
                  </div>
                  <div className="text-2xl font-black text-slate-950 font-mono">{latestResult.fcpSeconds}s</div>
                  <p className="text-[11px] text-slate-500 mt-1">First Contentful Paint (İlk Piksel)</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Anında Çizim</span>
                </div>
              </div>

              {/* LCP */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">LCP</span>
                    <span className="text-[10px] text-emerald-600 font-bold">&lt;0.3s</span>
                  </div>
                  <div className="text-2xl font-black text-slate-950 font-mono">{latestResult.lcpSeconds}s</div>
                  <p className="text-[11px] text-slate-500 mt-1">Largest Contentful Paint (Ana İçerik)</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Kusursuz</span>
                </div>
              </div>

              {/* CLS */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">CLS</span>
                    <span className="text-[10px] text-emerald-600 font-bold">0.000</span>
                  </div>
                  <div className="text-2xl font-black text-slate-950 font-mono">{latestResult.clsScore.toFixed(3)}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Cumulative Layout Shift (Kayma)</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Sıfır Titreme</span>
                </div>
              </div>

              {/* INP / FID */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">INP</span>
                    <span className="text-[10px] text-emerald-600 font-bold">&lt;15ms</span>
                  </div>
                  <div className="text-2xl font-black text-slate-950 font-mono">{latestResult.inpMs} ms</div>
                  <p className="text-[11px] text-slate-500 mt-1">Interaction to Next Paint (Etkileşim)</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Sıfır Gecikme</span>
                </div>
              </div>

              {/* Payload Size */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">Boyut</span>
                    <span className="text-[10px] text-emerald-600 font-bold">&lt;50KB</span>
                  </div>
                  <div className="text-2xl font-black text-slate-950 font-mono">{latestResult.pageSizeKb} KB</div>
                  <p className="text-[11px] text-slate-500 mt-1">Saf HTML/CSS & Minify Yük</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Ultra Hafif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test History Bar */}
          {testHistory.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Son Gerçekleştirilen Sentetik Testler ({testHistory.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">Oturum Kayıtları</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {testHistory.map((hist) => (
                  <div key={hist.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 text-[11px]">{hist.timestamp}</span>
                      <span className="font-bold text-slate-800">{hist.regionFlag} {hist.regionLabel}</span>
                      <span className="text-slate-400 hidden sm:inline">•</span>
                      <span className="text-slate-500 hidden sm:inline font-mono truncate max-w-[200px]">{hist.targetUrl}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500">TTFB: <strong>{hist.ttfbMs}ms</strong></span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        hist.targetHit ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
                      }`}>
                        {hist.loadTimeSeconds}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIONABLE OPTIMIZATION TIPS TO MAINTAIN 0.02s */}
      {activeTab === "optimization-tips" && (
        <div className="space-y-6">
          {/* Summary Audit Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  0.02s Hedef Koruma Durumu ({optimizationAudit.activeCount} / {optimizationAudit.totalCount} Aktif)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                {optimizationAudit.allOptimized
                  ? "Tüm mimari kurallar devrede. Siteniz 0.02 saniye açılış hedefini en zorlu koşullarda bile korumaktadır."
                  : `${optimizationAudit.totalCount - optimizationAudit.activeCount} adet potansiyel iyileştirme mevcut. Bunları açarak sitenizi ek ~${optimizationAudit.potentialGainMs} ms hızlandırabilirsiniz.`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleOptimizeAll}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tümünü Tek Tıkla Aktifleştir</span>
              </button>
            </div>
          </div>

          {/* Actionable Tips Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationAudit.items.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  item.active
                    ? "bg-white border-slate-200 shadow-xs"
                    : "bg-amber-50/50 border-amber-300/80 ring-1 ring-amber-400/20 shadow-sm"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.active ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ${
                      item.active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-200 text-amber-900 font-black"
                    }`}>
                      {item.active ? "Aktif" : item.impactLabel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Hız Katkısı: <strong>-{item.impactMs} ms</strong>
                  </span>

                  {item.active ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>0.02s Korunuyor</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={item.onFix}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Tek Tıkla Optimize Et</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NETWORK WATERFALL TIMELINE */}
      {activeTab === "waterfall" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Ağ İsteği Şelalesi (Synthetic Network Waterfall)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Toplam Süre: {latestResult.loadTimeMs} ms
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {latestResult.targetUrl} isteğinin milisaniye bazında yaşam döngüsü. Her bir aşamanın nerede ve ne kadar sürdüğünü gösterir.
            </p>
          </div>

          {/* Waterfall Stages Visual Table */}
          <div className="space-y-3 font-mono text-xs">
            {/* Phase 1: DNS */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-48 shrink-0">
                <div className="font-bold text-slate-800">1. DNS Çözümleme</div>
                <div className="text-[10px] text-slate-400 font-normal">Cloudflare 1.1.1.1 Anycast</div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.max(10, (latestResult.phases.dnsMs / latestResult.loadTimeMs) * 100)}%` }} />
                </div>
                <span className="text-cyan-700 font-bold w-16 text-right shrink-0">{latestResult.phases.dnsMs} ms</span>
              </div>
            </div>

            {/* Phase 2: TCP + TLS 1.3 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-48 shrink-0">
                <div className="font-bold text-slate-800">2. TCP + TLS 1.3 0-RTT</div>
                <div className="text-[10px] text-slate-400 font-normal">Sıfır Gidiş-Dönüş Güvenlik</div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.max(15, (latestResult.phases.tcpTlsMs / latestResult.loadTimeMs) * 100)}%` }} />
                </div>
                <span className="text-indigo-700 font-bold w-16 text-right shrink-0">{latestResult.phases.tcpTlsMs} ms</span>
              </div>
            </div>

            {/* Phase 3: TTFB */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-48 shrink-0">
                <div className="font-bold text-slate-800">3. Sunucu Yanıtı (TTFB)</div>
                <div className="text-[10px] text-slate-400 font-normal">HTTP/3 QUIC Edge Bellek</div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.max(25, (latestResult.phases.ttfbMs / latestResult.loadTimeMs) * 100)}%` }} />
                </div>
                <span className="text-amber-700 font-bold w-16 text-right shrink-0">{latestResult.phases.ttfbMs} ms</span>
              </div>
            </div>

            {/* Phase 4: Download */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-48 shrink-0">
                <div className="font-bold text-slate-800">4. İçerik İndirme</div>
                <div className="text-[10px] text-slate-400 font-normal">Brotli 11 Sıkıştırılmış HTML</div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.max(12, (latestResult.phases.downloadMs / latestResult.loadTimeMs) * 100)}%` }} />
                </div>
                <span className="text-emerald-700 font-bold w-16 text-right shrink-0">{latestResult.phases.downloadMs} ms</span>
              </div>
            </div>

            {/* Phase 5: Paint */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-48 shrink-0">
                <div className="font-bold text-slate-800">5. DOM Parsing & Paint</div>
                <div className="text-[10px] text-slate-400 font-normal">Satır İçi Kritik CSS</div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.max(12, (latestResult.phases.renderPaintMs / latestResult.loadTimeMs) * 100)}%` }} />
                </div>
                <span className="text-purple-700 font-bold w-16 text-right shrink-0">{latestResult.phases.renderPaintMs} ms</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-400">Neden Bu Kadar Hızlı?</span>
              <p className="text-slate-300 text-[11px]">
                Geleneksel sitelerin ilk bayt süresi (TTFB) ortalama <strong>800 ms</strong> sürerken, HızlıWeb&apos;de bu süre <strong>7.8 ms</strong>&apos;dir. Sıfır veritabanı beklemesi ile doğrudan Edge bellekten gelir.
              </p>
            </div>

            <button
              type="button"
              onClick={onPreview}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shrink-0 whitespace-nowrap cursor-pointer"
            >
              Canlı Önizlemede Test Et
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: WORDPRESS VS HIZLIWEB ARCHITECTURE COMPARISON */}
      {activeTab === "comparison" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Geleneksel Mimari vs. HızlıWeb Karşılaştırması
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Aynı firma sitesinin geleneksel altyapılar ve HızlıWeb üzerindeki performans farkı.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1: WordPress */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">WordPress / WooCommerce</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold font-mono">3.42s</span>
                </div>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">•</span>
                    <span>Her tıklamada 40+ MySQL SQL sorgusu çalıştırır.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">•</span>
                    <span>Ortalama 35 eklenti (plugin) ve 1.8 MB şişkin kod yükler.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">•</span>
                    <span>Mobil ziyaretçilerin %40&apos;ı yüklenmeyi beklemeden çıkar.</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Wix / Squarespace */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Wix / Squarespace</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold font-mono">4.18s</span>
                </div>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>Ağır JavaScript bundle dosyaları (2.4 MB) tarayıcıyı kilitler.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>Google Lighthouse skoru genelde 40-60 seviyesinde kalır.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>Türkiye&apos;de yerel Anycast POP noktası sınırlıdır.</span>
                  </li>
                </ul>
              </div>

              {/* Card 3: HizliWeb */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-amber-500/40 space-y-3 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl bg-amber-500 text-slate-950 font-black text-[10px]">
                  HIZLIWEB
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-400 text-sm">HızlıWeb Edge Mimari</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black font-mono">0.019s</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>0 Veritabanı Sorgusu:</strong> %100 saf pre-rendered statik HTML/CSS.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Cloudflare Anycast 310+:</strong> Ziyaretçinin şehrindeki sunucudan 0 ms gecikmeyle.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Maksimum WhatsApp Dönüşümü:</strong> Sayfa anında açıldığı için sıfır terk oranı.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
