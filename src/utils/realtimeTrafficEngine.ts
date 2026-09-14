import { SiteConfig, PerformanceOptimizationSettings } from "../types";
import { simulateLighthousePerformance, DEFAULT_OPTIMIZATION_SETTINGS } from "./coreWebVitalsSimulator";

export interface HourlyTrafficDataPoint {
  hour: number; // 0-23
  hourLabel: string; // "00:00", "01:00", ... "23:00"
  timestamp: string;
  isCurrentHour: boolean;
  visitors: number;
  uniqueVisitors: number;
  pageviews: number;
  bounceRate: number; // Percentage (e.g. 21.4)
  avgSessionDurationSec: number;
  lcpSec: number; // Simulated LCP for that hour
  ttfbMs: number; // Simulated TTFB for that hour
  performanceScore: number; // 0-100 Lighthouse score
  deviceSplit: {
    mobile: number;
    desktop: number;
  };
  topSource: "Google Organik" | "Doğrudan (Direct)" | "Sosyal Medya" | "Referans" | "Google Ads";
  status: "optimal" | "normal" | "surge";
}

export interface LiveActiveVisitor {
  id: string;
  page: string;
  device: "mobile" | "desktop";
  city: string;
  source: string;
  durationSec: number;
  status: "active" | "converted" | "engaged";
}

export interface TrafficSimulationSummary {
  totalVisitors24h: number;
  totalUniqueVisitors24h: number;
  totalPageviews24h: number;
  avgBounceRate24h: number;
  peakHour: {
    hourLabel: string;
    visitors: number;
  };
  lowestBounceHour: {
    hourLabel: string;
    bounceRate: number;
  };
  currentLiveVisitors: number;
  deviceRatio: {
    mobilePercent: number;
    desktopPercent: number;
  };
  speedCorrelationInsight: string;
  bounceReductionVsBenchmark: number; // Percentage points lower than benchmark (e.g. 24.8% lower than 47%)
  hourlyPoints: HourlyTrafficDataPoint[];
  liveVisitors: LiveActiveVisitor[];
  activeOptimizationsCount: number;
  overallPerformanceScore: number;
  simulationMode: "optimized" | "degraded";
}

// Typical Turkish / local business hourly diurnal traffic weights (sum normalizes to 1.0)
const HOURLY_DIURNAL_WEIGHTS = [
  0.012, 0.008, 0.005, 0.004, 0.006, 0.012, // 00:00 - 05:00 (Night quiet)
  0.025, 0.045, 0.068, 0.082, 0.088, 0.075, // 06:00 - 11:00 (Morning work surge)
  0.062, 0.065, 0.078, 0.085, 0.074, 0.062, // 12:00 - 17:00 (Lunch & Afternoon inquiries)
  0.058, 0.064, 0.072, 0.068, 0.045, 0.024  // 18:00 - 23:00 (Evening mobile browsing)
];

const PAGES_LIST = [
  "Ana Sayfa (/)",
  "Hizmetlerimiz (/hizmetler)",
  "Hakkımızda (/hakkimizda)",
  "İletişim & Randevu (/iletisim)",
  "Galeri & Projeler (/galeri)",
  "Fiyatlandırma & Teklif (/fiyatlar)",
  "Blog & Rehberler (/blog)"
];

const SOURCES_LIST = [
  "Google Organik Arama",
  "Doğrudan Giriş (Direct)",
  "Instagram & Sosyal",
  "Google Haritalar (Local Pack)",
  "WhatsApp Paylaşımı"
];

/**
 * Calculates hourly traffic and bounce rates pulling directly from the
 * simulated site performance engine (Lighthouse, Core Web Vitals, Edge latency).
 */
export function generateRealtimeTrafficData(
  config: SiteConfig,
  options: {
    deviceFilter?: "all" | "mobile" | "desktop";
    simulationMode?: "optimized" | "degraded";
    timeWindow?: "24h" | "12h" | "6h";
    jitterSeed?: number;
  } = {}
): TrafficSimulationSummary {
  const {
    deviceFilter = "all",
    simulationMode = "optimized",
    timeWindow = "24h",
    jitterSeed = 1
  } = options;

  // Determine current system hour
  const now = new Date();
  const currentHour = now.getHours();

  // Run the simulated Lighthouse engine for both mobile and desktop
  const effectiveConfig = simulationMode === "degraded" ? {
    ...config,
    performanceOptimizations: {
      webpAutoConversion: false,
      lazyLoadImages: false,
      fontDisplaySwap: false,
      criticalCssInlining: false,
      htmlMinification: false,
      brotliCompression: false,
      http3Quic: false,
      earlyHints103: false,
      zeroRenderBlocking: false,
      edgeCacheTtlDays: 1
    }
  } : config;

  const simMobile = simulateLighthousePerformance(effectiveConfig, "mobile");
  const simDesktop = simulateLighthousePerformance(effectiveConfig, "desktop");

  const effectiveSim = deviceFilter === "mobile" 
    ? simMobile 
    : deviceFilter === "desktop" 
    ? simDesktop 
    : {
        overallScore: Math.round(simMobile.overallScore * 0.65 + simDesktop.overallScore * 0.35),
        lcp: { rawValue: Number((simMobile.lcp.rawValue * 0.65 + simDesktop.lcp.rawValue * 0.35).toFixed(2)) },
        ttfb: { rawValue: Math.round(simMobile.ttfb.rawValue * 0.65 + simDesktop.ttfb.rawValue * 0.35) }
      };

  const lcpValue = effectiveSim.lcp.rawValue; // in seconds
  const ttfbValue = effectiveSim.ttfb.rawValue; // in milliseconds
  const perfScore = effectiveSim.overallScore;

  // Calculate Base Bounce Rate directly tied to performance engine:
  // - Baseline: Under 1.0s LCP and sub-20ms TTFB => 18% - 22% bounce rate.
  // - Penalty: +8.5% bounce rate per additional second of LCP above 1.0s.
  // - High TTFB Penalty: +4% per 100ms of TTFB.
  // - Degraded mode or low score (< 70) pushes bounce rate to 45% - 62%.
  let calculatedBaseBounce = 19.5;

  if (lcpValue > 1.0) {
    calculatedBaseBounce += (lcpValue - 1.0) * 8.5;
  }
  if (ttfbValue > 30) {
    calculatedBaseBounce += ((ttfbValue - 30) / 100) * 4.5;
  }
  if (perfScore < 90) {
    calculatedBaseBounce += ((90 - perfScore) / 10) * 3.2;
  }
  if (deviceFilter === "mobile") {
    calculatedBaseBounce += 3.8; // Mobile users bounce slightly faster on friction
  } else if (deviceFilter === "desktop") {
    calculatedBaseBounce -= 2.2;
  }

  // Cap base bounce between realistic 16% and 72%
  calculatedBaseBounce = Math.min(72, Math.max(16, calculatedBaseBounce));

  // Determine Daily Traffic Scale from metadata
  const servicesCount = config.services?.items?.length || 4;
  const productsCount = config.products?.items?.length || 2;
  const leadsCount = (config.leads || []).length;
  const hasSeoOptimized = Boolean(config.seo?.metaTitle && config.seo?.metaDescription);

  let baselineDailyVisitors = 480 + (servicesCount * 38) + (productsCount * 26) + (leadsCount * 14);
  if (hasSeoOptimized) baselineDailyVisitors *= 1.35;
  if (perfScore >= 95) baselineDailyVisitors *= 1.22; // Fast sites get 22% more organic clicks/retention

  const hourlyPoints: HourlyTrafficDataPoint[] = [];

  for (let h = 0; h < 24; h++) {
    const isCurrent = h === currentHour;
    const hourLabel = `${h.toString().padStart(2, "0")}:00`;
    const weight = HOURLY_DIURNAL_WEIGHTS[h];

    // Seeded small deterministic jitter for natural realism
    const jitter = Math.sin((h + 1) * 3.7 + jitterSeed) * 0.12;
    const hourVisitors = Math.max(8, Math.round(baselineDailyVisitors * weight * (1 + jitter)));

    // Unique visitors are ~72-84% of total visitors
    const uniqueVisitors = Math.round(hourVisitors * (0.76 + Math.cos(h) * 0.05));
    // Pageviews are ~2.6-3.8 per visitor (faster sites get more pageviews per visit)
    const pageviewsMultiplier = 2.4 + (perfScore / 100) * 1.2;
    const pageviews = Math.round(hourVisitors * pageviewsMultiplier);

    // Hourly bounce rate fluctuation (peaks slightly late at night, lowest during morning high-intent)
    const hourlyBounceJitter = (Math.cos((h - 4) * 0.26) * 2.8);
    const hourBounceRate = Number(Math.min(78, Math.max(14, calculatedBaseBounce + hourlyBounceJitter)).toFixed(1));

    // Session duration: 130s to 240s based on performance
    const avgDuration = Math.round((140 + (perfScore * 0.85)) * (1 + Math.sin(h * 0.5) * 0.1));

    // Device split
    const mobileRatio = 0.65 + Math.sin(h * 0.3) * 0.08;
    const mobileCount = Math.round(hourVisitors * mobileRatio);
    const desktopCount = hourVisitors - mobileCount;

    // Simulated LCP and TTFB with slight server load variance during peak hours
    const isPeakTime = (h >= 10 && h <= 12) || (h >= 14 && h <= 16);
    const loadMultiplier = isPeakTime ? 1.12 : 0.96;
    const hourLcp = Number((lcpValue * loadMultiplier).toFixed(2));
    const hourTtfb = Math.round(ttfbValue * loadMultiplier);

    let topSource: HourlyTrafficDataPoint["topSource"] = "Google Organik";
    if (h >= 9 && h <= 12) topSource = "Google Organik";
    else if (h >= 14 && h <= 17) topSource = "Doğrudan (Direct)";
    else if (h >= 19 && h <= 22) topSource = "Sosyal Medya";
    else if (h % 3 === 0) topSource = "Referans";

    hourlyPoints.push({
      hour: h,
      hourLabel,
      timestamp: `${hourLabel}`,
      isCurrentHour: isCurrent,
      visitors: hourVisitors,
      uniqueVisitors,
      pageviews,
      bounceRate: hourBounceRate,
      avgSessionDurationSec: avgDuration,
      lcpSec: hourLcp,
      ttfbMs: hourTtfb,
      performanceScore: perfScore,
      deviceSplit: {
        mobile: mobileCount,
        desktop: desktopCount
      },
      topSource,
      status: isPeakTime ? "surge" : hourBounceRate < 22 ? "optimal" : "normal"
    });
  }

  // Filter time window if requested
  let displayedPoints = hourlyPoints;
  if (timeWindow === "12h") {
    // Show past 12 hours up to current hour
    const startHour = (currentHour - 11 + 24) % 24;
    displayedPoints = [];
    for (let i = 0; i < 12; i++) {
      const idx = (startHour + i) % 24;
      displayedPoints.push(hourlyPoints[idx]);
    }
  } else if (timeWindow === "6h") {
    const startHour = (currentHour - 5 + 24) % 24;
    displayedPoints = [];
    for (let i = 0; i < 6; i++) {
      const idx = (startHour + i) % 24;
      displayedPoints.push(hourlyPoints[idx]);
    }
  }

  const totalVisitors24h = displayedPoints.reduce((acc, p) => acc + p.visitors, 0);
  const totalUniqueVisitors24h = displayedPoints.reduce((acc, p) => acc + p.uniqueVisitors, 0);
  const totalPageviews24h = displayedPoints.reduce((acc, p) => acc + p.pageviews, 0);
  const avgBounceRate24h = Number(
    (displayedPoints.reduce((acc, p) => acc + p.bounceRate, 0) / displayedPoints.length).toFixed(1)
  );

  // Peak hour
  const peakHourPoint = [...displayedPoints].sort((a, b) => b.visitors - a.visitors)[0] || displayedPoints[0];
  const lowestBouncePoint = [...displayedPoints].sort((a, b) => a.bounceRate - b.bounceRate)[0] || displayedPoints[0];

  // Current live concurrent visitors
  const currentPoint = hourlyPoints[currentHour] || hourlyPoints[0];
  const liveConcurrentVisitors = Math.max(4, Math.round((currentPoint.visitors / 60) * 14 + (Math.sin(jitterSeed) * 5)));

  // Speed correlation narrative
  const industryBenchmarkBounce = 48.5; // Average website bounce rate (e.g. 45-50%)
  const bounceReduction = Number((industryBenchmarkBounce - avgBounceRate24h).toFixed(1));

  let speedCorrelationInsight = "";
  if (simulationMode === "optimized" && perfScore >= 90) {
    speedCorrelationInsight = `Lighthouse %${perfScore} performansı ve ${ttfbValue}ms anında Cloudflare yanıtı sayesinde hemen çıkma oranınız sektör ortalamasının (%${industryBenchmarkBounce}) ${bounceReduction} puan altında (%${avgBounceRate24h}) seyrediyor.`;
  } else if (simulationMode === "degraded") {
    speedCorrelationInsight = `Simüle edilen yavaş modda (Brotli & Edge önbellek kapalı, LCP ${lcpValue}s), hemen çıkma oranı %${avgBounceRate24h} seviyesine fırlamakta ve günlük ~${Math.round(totalVisitors24h * 0.32)} potansiyel müşteri siteyi terk etmektedir.`;
  } else {
    speedCorrelationInsight = `Mevcut optimizasyonlarla ortalama hemen çıkma oranınız %${avgBounceRate24h}. LCP süresi ${lcpValue}s seviyesinde korunarak ziyaretçi kaybı minimumda tutuluyor.`;
  }

  // Generate simulated live active visitor stream
  const cities = [config.city || "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Kocaeli"];
  const liveVisitors: LiveActiveVisitor[] = [];
  const activeCount = Math.min(8, Math.max(3, Math.round(liveConcurrentVisitors / 4)));

  for (let i = 0; i < activeCount; i++) {
    liveVisitors.push({
      id: `vis-${i + 1}`,
      page: PAGES_LIST[i % PAGES_LIST.length],
      device: (i % 3 === 0) ? "desktop" : "mobile",
      city: cities[(i + jitterSeed) % cities.length],
      source: SOURCES_LIST[(i * 2 + jitterSeed) % SOURCES_LIST.length],
      durationSec: 15 + (i * 22),
      status: i === 0 ? "converted" : i < 3 ? "engaged" : "active"
    });
  }

  return {
    totalVisitors24h,
    totalUniqueVisitors24h,
    totalPageviews24h,
    avgBounceRate24h,
    peakHour: {
      hourLabel: peakHourPoint.hourLabel,
      visitors: peakHourPoint.visitors
    },
    lowestBounceHour: {
      hourLabel: lowestBouncePoint.hourLabel,
      bounceRate: lowestBouncePoint.bounceRate
    },
    currentLiveVisitors: liveConcurrentVisitors,
    deviceRatio: {
      mobilePercent: 67,
      desktopPercent: 33
    },
    speedCorrelationInsight,
    bounceReductionVsBenchmark: Math.max(0, bounceReduction),
    hourlyPoints: displayedPoints,
    liveVisitors,
    activeOptimizationsCount: Object.values(effectiveConfig.performanceOptimizations || DEFAULT_OPTIMIZATION_SETTINGS).filter(Boolean).length,
    overallPerformanceScore: perfScore,
    simulationMode
  };
}

/**
 * Exports the hourly traffic data as a CSV download for executive reporting.
 */
export function exportTrafficCsv(points: HourlyTrafficDataPoint[], companyName: string = "Firma"): void {
  const headers = [
    "Saat",
    "Ziyaretçi Sayısı",
    "Tekil Ziyaretçi",
    "Sayfa Görüntüleme",
    "Hemen Çıkma Oranı (%)",
    "Ort. Kalma Süresi (sn)",
    "Simüle LCP (sn)",
    "Simüle TTFB (ms)",
    "Mobil Ziyaret",
    "Masaüstü Ziyaret",
    "Baskın Kaynak"
  ];

  const rows = points.map((p) => [
    p.hourLabel,
    p.visitors,
    p.uniqueVisitors,
    p.pageviews,
    p.bounceRate,
    p.avgSessionDurationSec,
    p.lcpSec,
    p.ttfbMs,
    p.deviceSplit.mobile,
    p.deviceSplit.desktop,
    p.topSource
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `Gercek_Zamanli_Trafik_Raporu_${cleanName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
