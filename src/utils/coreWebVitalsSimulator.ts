import { SiteConfig, PerformanceOptimizationSettings } from "../types";

export interface CoreWebVitalMetric {
  id: "lcp" | "inp" | "cls" | "fcp" | "tbt" | "ttfb";
  name: string;
  fullName: string;
  category: "core" | "diagnostic";
  valueFormatted: string;
  rawValue: number;
  unit: string;
  thresholds: {
    good: number;
    needsImprovement: number;
  };
  status: "good" | "needs-improvement" | "poor";
  statusLabel: string;
  score: number; // 0-100 metric subscore
  weight: number; // weight in Lighthouse performance score
  impactDescription: string;
  recommendation: string;
}

export interface OptimizationCheckItem {
  key: keyof PerformanceOptimizationSettings;
  label: string;
  description: string;
  enabled: boolean;
  scoreImpact: number; // Estimated points gained if enabled
  relatedMetric: "lcp" | "inp" | "cls" | "fcp" | "tbt" | "ttfb";
}

export interface SimulatedLighthouseScoreResult {
  overallScore: number; // 0-100
  device: "mobile" | "desktop";
  grade: "good" | "needs-improvement" | "poor";
  gradeLabel: string;
  gradeColor: string;
  gradeBadgeClass: string;
  allVitalsPassed: boolean;
  
  // Responsiveness standing & user interaction latency
  responsivenessScore: number; // 0-100
  responsivenessGrade: "ultra" | "good" | "laggy";
  responsivenessLabel: string;
  responsivenessSummary: string;

  // Core Web Vitals
  lcp: CoreWebVitalMetric;
  inp: CoreWebVitalMetric;
  cls: CoreWebVitalMetric;
  
  // Companion Lighthouse Diagnostics
  fcp: CoreWebVitalMetric;
  tbt: CoreWebVitalMetric;
  ttfb: CoreWebVitalMetric;
  
  // Optimization checks breakdown
  optimizations: OptimizationCheckItem[];
  activeOptimizationsCount: number;
  totalOptimizationsCount: number;
  potentialScoreGain: number;

  // Simulated device environment specs
  simulatedEnvironment: {
    connectionType: string;
    rttMs: number;
    cpuThrottling: string;
    viewport: string;
    userAgent: string;
  };
  
  auditDate: string;
}

export const DEFAULT_OPTIMIZATION_SETTINGS: PerformanceOptimizationSettings = {
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

/**
 * Calculates simulated Lighthouse Performance Score and Core Web Vitals
 * based on the user's active site configuration and performance optimizations.
 */
export function simulateLighthousePerformance(
  config: SiteConfig,
  device: "mobile" | "desktop" = "mobile"
): SimulatedLighthouseScoreResult {
  const opts: PerformanceOptimizationSettings = {
    ...DEFAULT_OPTIMIZATION_SETTINGS,
    ...(config.performanceOptimizations || {}),
  };

  // Base metrics for Cloudflare Edge + static architecture
  // (In ideal state: ultra fast static edge delivery)
  const isMobile = device === "mobile";
  const deviceMultiplier = isMobile ? 1.35 : 1.0;
  const cpuDelayMultiplier = isMobile ? 1.4 : 0.8;

  // 1. TTFB (Time to First Byte)
  let baseTtfb = 14; // ms in edge
  if (!opts.http3Quic) baseTtfb += 45;
  if (!opts.brotliCompression) baseTtfb += 30;
  if (!opts.htmlMinification) baseTtfb += 15;
  if (opts.edgeCacheTtlDays < 30) baseTtfb += 35;
  const ttfbMs = Math.round(baseTtfb * deviceMultiplier);

  // 2. FCP (First Contentful Paint)
  let baseFcp = 0.18; // seconds
  if (!opts.criticalCssInlining) baseFcp += 0.35;
  if (!opts.earlyHints103) baseFcp += 0.12;
  if (!opts.fontDisplaySwap) baseFcp += 0.28;
  if (!opts.zeroRenderBlocking) baseFcp += 0.40;
  baseFcp += (baseTtfb - 14) / 1000;
  const fcpSec = Number((baseFcp * deviceMultiplier).toFixed(2));

  // 3. LCP (Largest Contentful Paint) - Core Web Vital (25% Lighthouse weight)
  // Good: <= 2.5s, Poor: > 4.0s
  let baseLcp = 0.32; // seconds
  if (!opts.webpAutoConversion) baseLcp += 0.55; // Unoptimized heavy images
  if (!opts.lazyLoadImages) baseLcp += 0.25;
  if (!opts.criticalCssInlining) baseLcp += 0.25;
  if (!opts.earlyHints103) baseLcp += 0.15;
  if (!opts.fontDisplaySwap) baseLcp += 0.18;
  baseLcp += (baseFcp - 0.18) * 0.6;
  const lcpSec = Number((baseLcp * deviceMultiplier).toFixed(2));

  // 4. CLS (Cumulative Layout Shift) - Core Web Vital (25% Lighthouse weight)
  // Good: <= 0.1, Poor: > 0.25
  let baseCls = 0.000;
  if (!opts.fontDisplaySwap) baseCls += 0.035; // FOIT / FOUT font layout shift
  if (!opts.lazyLoadImages) baseCls += 0.020; // image aspect-ratio reflows
  if (!opts.criticalCssInlining) baseCls += 0.015;
  const clsScore = Number(baseCls.toFixed(3));

  // 5. TBT / INP (Total Blocking Time & Interaction to Next Paint) - (30% Lighthouse weight)
  // TBT Good: <= 200ms, Poor: > 600ms
  // INP Good: <= 200ms, Poor: > 500ms
  let baseTbt = 0; // ms
  let baseInp = 10; // ms
  if (!opts.zeroRenderBlocking) {
    baseTbt += 160;
    baseInp += 85;
  }
  if (!opts.htmlMinification) {
    baseTbt += 25;
    baseInp += 15;
  }
  // Check active embedded third-party widgets and scripts
  let scriptCount = 0;
  if (config.seo?.googleSearchConsoleTag) scriptCount++;
  if (config.whatsappWidget?.enabled) scriptCount++;
  if (config.contact?.showMap) scriptCount++; // Google Maps iframe / script embed
  if (config.testimonials?.googleRatingBadge) scriptCount++;

  if (scriptCount > 0 && !opts.zeroRenderBlocking) {
    baseTbt += scriptCount * 45;
    baseInp += scriptCount * 25;
  } else if (scriptCount > 0 && opts.zeroRenderBlocking) {
    baseTbt += scriptCount * 8;
    baseInp += scriptCount * 5;
  }

  // Factor in content volume & unoptimized image payloads
  const itemsCount = (config.services?.items?.length || 0) + (config.products?.items?.length || 0) + (config.gallery?.items?.length || 0);
  if (itemsCount > 10 && !opts.lazyLoadImages) {
    baseLcp += 0.28;
    baseTbt += 30;
  }
  const hasCustomHero = Boolean(config.hero?.bgImage || (config.hero?.slides && config.hero.slides.length > 0));
  if (hasCustomHero && !opts.webpAutoConversion) {
    baseLcp += 0.35;
  }

  const tbtMs = Math.round(baseTbt * cpuDelayMultiplier);
  const inpMs = Math.round(baseInp * cpuDelayMultiplier);

  // Subscores calculation (0-100 curve using official Lighthouse 10 scoring intervals)
  // LCP score: 0-2.5s is 100-90, 2.5-4.0s is 89-50, >4.0s is <50
  const calcLcpSubscore = (val: number): number => {
    if (val <= 1.2) return 100;
    if (val <= 2.0) return Math.round(100 - ((val - 1.2) / 0.8) * 10);
    if (val <= 2.5) return Math.round(90 - ((val - 2.0) / 0.5) * 5);
    if (val <= 4.0) return Math.max(50, Math.round(85 - ((val - 2.5) / 1.5) * 35));
    return Math.max(10, Math.round(50 - ((val - 4.0) / 2.0) * 40));
  };

  // CLS score: 0.0 - 0.1 is 100-90
  const calcClsSubscore = (val: number): number => {
    if (val <= 0.01) return 100;
    if (val <= 0.05) return 98;
    if (val <= 0.1) return Math.round(98 - ((val - 0.05) / 0.05) * 8);
    if (val <= 0.25) return Math.max(50, Math.round(90 - ((val - 0.1) / 0.15) * 40));
    return Math.max(10, Math.round(50 - ((val - 0.25) / 0.2) * 40));
  };

  // TBT score: 0-200ms is 100-90, 200-600ms is 89-50
  const calcTbtSubscore = (val: number): number => {
    if (val <= 50) return 100;
    if (val <= 150) return Math.round(100 - ((val - 50) / 100) * 8);
    if (val <= 200) return Math.round(92 - ((val - 150) / 50) * 5);
    if (val <= 600) return Math.max(50, Math.round(87 - ((val - 200) / 400) * 37));
    return Math.max(10, Math.round(50 - ((val - 600) / 400) * 40));
  };

  // FCP score: 0-1.8s is 100-90
  const calcFcpSubscore = (val: number): number => {
    if (val <= 0.9) return 100;
    if (val <= 1.8) return Math.round(100 - ((val - 0.9) / 0.9) * 10);
    if (val <= 3.0) return Math.max(50, Math.round(90 - ((val - 1.8) / 1.2) * 40));
    return Math.max(10, Math.round(50 - ((val - 3.0) / 2.0) * 40));
  };

  // TTFB score: 0-200ms is 100-90
  const calcTtfbSubscore = (val: number): number => {
    if (val <= 50) return 100;
    if (val <= 200) return Math.round(100 - ((val - 50) / 150) * 10);
    return Math.max(40, Math.round(90 - ((val - 200) / 400) * 40));
  };

  const lcpScore = calcLcpSubscore(lcpSec);
  const clsScoreVal = calcClsSubscore(clsScore);
  const tbtScore = calcTbtSubscore(tbtMs);
  const fcpScore = calcFcpSubscore(fcpSec);
  const ttfbScore = calcTtfbSubscore(ttfbMs);

  // Overall Lighthouse Weighted Calculation:
  // LCP: 25%, TBT: 30%, CLS: 25%, FCP: 10%, Speed Index / TTFB: 10%
  const calculatedOverall = Math.round(
    lcpScore * 0.25 +
    tbtScore * 0.30 +
    clsScoreVal * 0.25 +
    fcpScore * 0.10 +
    ttfbScore * 0.10
  );

  const overallScore = Math.min(100, Math.max(15, calculatedOverall));

  // Determine Grade
  let grade: "good" | "needs-improvement" | "poor" = "good";
  let gradeLabel = "Mükemmel (Hızlı)";
  let gradeColor = "#10b981"; // Emerald
  let gradeBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (overallScore < 50) {
    grade = "poor";
    gradeLabel = "Yavaş (Optimizasyon Gerekiyor)";
    gradeColor = "#ef4444"; // Red
    gradeBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (overallScore < 90) {
    grade = "needs-improvement";
    gradeLabel = "Geliştirilmeli (Orta Seviye)";
    gradeColor = "#f59e0b"; // Amber
    gradeBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
  }

  // Core Web Vitals Status Check (LCP <= 2.5s, CLS <= 0.1, INP <= 200ms)
  const lcpStatus: "good" | "needs-improvement" | "poor" =
    lcpSec <= 2.5 ? "good" : lcpSec <= 4.0 ? "needs-improvement" : "poor";
  const inpStatus: "good" | "needs-improvement" | "poor" =
    inpMs <= 200 ? "good" : inpMs <= 500 ? "needs-improvement" : "poor";
  const clsStatus: "good" | "needs-improvement" | "poor" =
    clsScore <= 0.1 ? "good" : clsScore <= 0.25 ? "needs-improvement" : "poor";

  const allVitalsPassed = lcpStatus === "good" && inpStatus === "good" && clsStatus === "good";

  // Individual metrics detail objects
  const lcpMetric: CoreWebVitalMetric = {
    id: "lcp",
    name: "LCP",
    fullName: "Largest Contentful Paint",
    category: "core",
    valueFormatted: `${lcpSec}s`,
    rawValue: lcpSec,
    unit: "s",
    thresholds: { good: 2.5, needsImprovement: 4.0 },
    status: lcpStatus,
    statusLabel: lcpStatus === "good" ? "İyi (Hızlı)" : lcpStatus === "needs-improvement" ? "Geliştirilmeli" : "Yavaş",
    score: lcpScore,
    weight: 25,
    impactDescription: "Ekrandaki ana görsel ve başlıkların kullanıcıya görünür olma hızı.",
    recommendation: opts.webpAutoConversion && opts.lazyLoadImages
      ? "WebP/AVIF ve geç yükleme aktif, LCP ultra-hızlı seviyede."
      : "WebP görsel sıkıştırmayı ve Lazy Load özelliğini aktif ederek LCP süresini düşürün.",
  };

  const inpMetric: CoreWebVitalMetric = {
    id: "inp",
    name: "INP",
    fullName: "Interaction to Next Paint",
    category: "core",
    valueFormatted: `${inpMs}ms`,
    rawValue: inpMs,
    unit: "ms",
    thresholds: { good: 200, needsImprovement: 500 },
    status: inpStatus,
    statusLabel: inpStatus === "good" ? "İyi (Akıcı)" : inpStatus === "needs-improvement" ? "Geliştirilmeli" : "Gecikmeli",
    score: tbtScore,
    weight: 30,
    impactDescription: "Kullanıcının buton veya menülere dokunduğunda sitenin anında yanıt verme kabiliyeti.",
    recommendation: opts.zeroRenderBlocking
      ? "Engelsiz JS/CSS ve statik mimari sayesinde yanıt süresi anında."
      : "Sıfır Render Engelleyici (Zero Render Blocking) açarak ana iş parçacığı gecikmesini önleyin.",
  };

  const clsMetric: CoreWebVitalMetric = {
    id: "cls",
    name: "CLS",
    fullName: "Cumulative Layout Shift",
    category: "core",
    valueFormatted: clsScore.toFixed(3),
    rawValue: clsScore,
    unit: "",
    thresholds: { good: 0.1, needsImprovement: 0.25 },
    status: clsStatus,
    statusLabel: clsStatus === "good" ? "İyi (Kararlı)" : clsStatus === "needs-improvement" ? "Geliştirilmeli" : "Kayma Var",
    score: clsScoreVal,
    weight: 25,
    impactDescription: "Sayfa yüklenirken metin ve butonların ekranda kaymasını veya sıçramasını önler.",
    recommendation: opts.fontDisplaySwap
      ? "Font Display Swap ile font yüklenirken görsel kayma sıfıra indirildi."
      : "Font-display: swap ve görsel boyutlandırmayı açarak sayfa kaymasını önleyin.",
  };

  const fcpMetric: CoreWebVitalMetric = {
    id: "fcp",
    name: "FCP",
    fullName: "First Contentful Paint",
    category: "diagnostic",
    valueFormatted: `${fcpSec}s`,
    rawValue: fcpSec,
    unit: "s",
    thresholds: { good: 1.8, needsImprovement: 3.0 },
    status: fcpSec <= 1.8 ? "good" : fcpSec <= 3.0 ? "needs-improvement" : "poor",
    statusLabel: fcpSec <= 1.8 ? "İyi" : "Geliştirilmeli",
    score: fcpScore,
    weight: 10,
    impactDescription: "Tarayıcının DOM'dan ilk metin veya görseli ekrana çizdiği ilk an.",
    recommendation: "Kritik CSS Satır İçi ve 103 Early Hints ile ilk çizim anında gerçekleşir.",
  };

  const tbtMetric: CoreWebVitalMetric = {
    id: "tbt",
    name: "TBT",
    fullName: "Total Blocking Time",
    category: "diagnostic",
    valueFormatted: `${tbtMs}ms`,
    rawValue: tbtMs,
    unit: "ms",
    thresholds: { good: 200, needsImprovement: 600 },
    status: tbtMs <= 200 ? "good" : tbtMs <= 600 ? "needs-improvement" : "poor",
    statusLabel: tbtMs <= 200 ? "İyi" : "Geliştirilmeli",
    score: tbtScore,
    weight: 10,
    impactDescription: "FCP ile TTI arasında fare veya klavye girdilerinin engellendiği toplam süre.",
    recommendation: "Harici JS komut dosyalarını erteleyerek ana iş parçacığını boş tutun.",
  };

  const ttfbMetric: CoreWebVitalMetric = {
    id: "ttfb",
    name: "TTFB",
    fullName: "Time to First Byte",
    category: "diagnostic",
    valueFormatted: `${ttfbMs}ms`,
    rawValue: ttfbMs,
    unit: "ms",
    thresholds: { good: 200, needsImprovement: 500 },
    status: ttfbMs <= 200 ? "good" : ttfbMs <= 500 ? "needs-improvement" : "poor",
    statusLabel: ttfbMs <= 200 ? "İyi (Anycast Edge)" : "Geliştirilmeli",
    score: ttfbScore,
    weight: 0,
    impactDescription: "Kullanıcı tarayıcısının sunucudan ilk yanıt baytını alma süresi.",
    recommendation: "Global Edge CDN ve Brotli 11 ile Türkiye ve küresel erişimde 15ms TTFB.",
  };

  // Optimization Checklist Items
  const optimizations: OptimizationCheckItem[] = [
    {
      key: "webpAutoConversion",
      label: "Edge Polish & WebP/AVIF Dönüşümü",
      description: "Görselleri otomatik modern WebP/AVIF formatına çevirir, bant genişliğini %70 düşürür.",
      enabled: Boolean(opts.webpAutoConversion),
      scoreImpact: 6,
      relatedMetric: "lcp",
    },
    {
      key: "lazyLoadImages",
      label: "Akıllı Geç Yükleme (Native Lazy Load)",
      description: "Ekran dışı görselleri kullanıcı sayfayı kaydırdıkça yükler, açılış hızını korur.",
      enabled: Boolean(opts.lazyLoadImages),
      scoreImpact: 4,
      relatedMetric: "lcp",
    },
    {
      key: "criticalCssInlining",
      label: "Kritik CSS Satır İçi Aktarımı (Inline Critical CSS)",
      description: "İlk ekran çizimi için gereken CSS kurallarını HTML içine gömer, render engelini kaldırır.",
      enabled: Boolean(opts.criticalCssInlining),
      scoreImpact: 5,
      relatedMetric: "fcp",
    },
    {
      key: "zeroRenderBlocking",
      label: "Sıfır Render Engelleyici (Zero Render-Blocking)",
      description: "Gereksiz JavaScript ve stil dosyalarını erteler, etkileşim süresini (INP) mükemmelleştirir.",
      enabled: Boolean(opts.zeroRenderBlocking),
      scoreImpact: 7,
      relatedMetric: "inp",
    },
    {
      key: "fontDisplaySwap",
      label: "Yazı Tipi Boyut Sabitleme (font-display: swap)",
      description: "Yazı tipleri yüklenirken metin kaymalarını ve düzen sıçramalarını (CLS) önler.",
      enabled: Boolean(opts.fontDisplaySwap),
      scoreImpact: 4,
      relatedMetric: "cls",
    },
    {
      key: "brotliCompression",
      label: "Brotli Level 11 + Zstandard Sıkıştırma",
      description: "Gzip'e göre %25 daha yüksek metin sıkıştırması sağlayarak transfer süresini kısaltır.",
      enabled: Boolean(opts.brotliCompression),
      scoreImpact: 3,
      relatedMetric: "ttfb",
    },
    {
      key: "http3Quic",
      label: "HTTP/3 & QUIC 0-RTT El Sıkışma",
      description: "Mobil ağlarda paket kaybı gecikmesini önler, ilk bağlantıyı anında kurar.",
      enabled: Boolean(opts.http3Quic),
      scoreImpact: 3,
      relatedMetric: "ttfb",
    },
    {
      key: "earlyHints103",
      label: "103 Early Hints Ön Yükleme Sinyali",
      description: "Tarayıcıya ana sayfa henüz hazırlanırken kritik font ve CSS kaynaklarını erken yükletir.",
      enabled: Boolean(opts.earlyHints103),
      scoreImpact: 3,
      relatedMetric: "fcp",
    },
    {
      key: "htmlMinification",
      label: "Statik HTML & SVG Küçültme (Minification)",
      description: "Gereksiz boşlukları, yorum satırlarını ve fazlalıkları ayıklayarak DOM boyutunu küçültür.",
      enabled: Boolean(opts.htmlMinification),
      scoreImpact: 2,
      relatedMetric: "fcp",
    }
  ];

  const activeOptimizationsCount = optimizations.filter(o => o.enabled).length;
  const totalOptimizationsCount = optimizations.length;
  const potentialScoreGain = optimizations
    .filter(o => !o.enabled)
    .reduce((sum, o) => sum + o.scoreImpact, 0);

  // Responsiveness Standing (INP & TBT user interaction latency)
  const responsivenessScore = Math.round(
    tbtScore * 0.6 + calcLcpSubscore(lcpSec) * 0.2 + calcClsSubscore(clsScore) * 0.2
  );
  let responsivenessGrade: "ultra" | "good" | "laggy" = "ultra";
  let responsivenessLabel = "Ultra Akıcı (Gecikmesiz)";
  let responsivenessSummary = "0.02s statik mimarisi sayesinde tüm dokunma, menü ve form etkileşimleri anında yanıt verir.";

  if (inpMs > 200 || tbtMs > 200) {
    responsivenessGrade = "laggy";
    responsivenessLabel = "Gecikmeli (Ana İş Parçacığı Meşgul)";
    responsivenessSummary = "Sayfadaki harici scriptler veya sıkıştırılmamış içerikler kullanıcı etkileşiminde mikro gecikmeye neden olabilir.";
  } else if (inpMs > 80 || tbtMs > 80) {
    responsivenessGrade = "good";
    responsivenessLabel = "İyi (Google Standartlarında)";
    responsivenessSummary = "Etkileşimler akıcı, Google INP eşiğinin (<200ms) oldukça altında stabil çalışıyor.";
  }

  const simulatedEnvironment = isMobile
    ? {
        connectionType: "Slow 4G Mobil Ağ (1.6 Mbps / 150ms RTT)",
        rttMs: 150,
        cpuThrottling: "4x CPU Slowdown (Standart Akıllı Telefon)",
        viewport: "412 x 915 (Mobil Ekran)",
        userAgent: "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/124.0.0.0",
      }
    : {
        connectionType: "Fiber Genişbant (100 Mbps / 10ms RTT Anycast)",
        rttMs: 10,
        cpuThrottling: "Filtresiz Yerel Masaüstü CPU (No Throttling)",
        viewport: "1920 x 1080 (Masaüstü)",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
      };

  return {
    overallScore,
    device,
    grade,
    gradeLabel,
    gradeColor,
    gradeBadgeClass,
    allVitalsPassed,
    responsivenessScore,
    responsivenessGrade,
    responsivenessLabel,
    responsivenessSummary,
    lcp: lcpMetric,
    inp: inpMetric,
    cls: clsMetric,
    fcp: fcpMetric,
    tbt: tbtMetric,
    ttfb: ttfbMetric,
    optimizations,
    activeOptimizationsCount,
    totalOptimizationsCount,
    potentialScoreGain: Math.min(100 - overallScore, potentialScoreGain),
    simulatedEnvironment,
    auditDate: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  };
}
