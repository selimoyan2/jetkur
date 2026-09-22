import { 
  SiteConfig, 
  DailyPerformanceTrendDataPoint, 
  PerformanceMilestoneEvent, 
  PerformanceTrendsSummary, 
  CoreVitalCorrelationInsight, 
  CoreWebVitalMetricKey,
  RollingWindowDays
} from "../types";

/**
 * Generates realistic, deterministic 90-day rolling window time-series data
 * comparing Core Web Vitals (LCP, INP, CLS, TTFB, FCP) against visitor bounce rates.
 */
export function generate90DayPerformanceTrendsData(
  config: SiteConfig,
  rollingDays: RollingWindowDays = 90
): {
  data: DailyPerformanceTrendDataPoint[];
  summary: PerformanceTrendsSummary;
  correlationInsights: CoreVitalCorrelationInsight[];
  milestones: PerformanceMilestoneEvent[];
} {
  const today = new Date();
  
  // Deterministic seed based on companyName or id
  const seedString = (config.companyName || "Site") + (config.id || "101");
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRandom = (seedOffset: number) => {
    const x = Math.sin(hash + seedOffset) * 10000;
    return x - Math.floor(x);
  };

  // 5 Infrastructure Milestones occurring across the 90-day window
  const rawMilestones: Array<Omit<PerformanceMilestoneEvent, "date">> = [
    {
      id: "ms-1-cdn",
      dayOffset: -76,
      title: "Global Anycast Edge CDN Kurulumu",
      category: "infrastructure",
      description: "Cloudflare Edge CDN ve statik önbellekleme devreye alındı. TTFB ve ilk yanıt sürelerinde dramatik düşüş sağlandı.",
      impactMetric: "TTFB",
      impactDelta: "-68%"
    },
    {
      id: "ms-2-images",
      dayOffset: -54,
      title: "Otomatik WebP/AVIF Görsel Dağıtımı",
      category: "optimization",
      description: "Tüm medya kütüphanesi yeni nesil sıkıştırmaya geçirildi. LCP görsel gecikmesi yarı yarıya azaldı.",
      impactMetric: "LCP",
      impactDelta: "-38%"
    },
    {
      id: "ms-3-protocols",
      dayOffset: -37,
      title: "HTTP/3 & Brotli Level 6 Sıkıştırma",
      category: "network",
      description: "Sunucu ağ katmanı QUIC ve HTTP/3 protokolüne yükseltildi. Mobil bağlantılarda paket kaybı gecikmeleri engellendi.",
      impactMetric: "FCP & TTFB",
      impactDelta: "-24%"
    },
    {
      id: "ms-4-cls",
      dayOffset: -21,
      title: "Kritik CSS & Font Preload Düzenlemesi",
      category: "deployment",
      description: "Sayfa yerleşim kaymaları (Layout Shifts) sıfırlandı, webfontlar önceden yüklendi.",
      impactMetric: "CLS",
      impactDelta: "-85%"
    },
    {
      id: "ms-5-edge-ssr",
      dayOffset: -7,
      title: "Edge SSR Mikro Önbellekleme",
      category: "infrastructure",
      description: "Sunucu taraflı HTML çıktıları uç noktalarda mikro-önbelleklendi (0.02s anlık açılış).",
      impactMetric: "Genel Sağlık",
      impactDelta: "+18 Puan"
    }
  ];

  const milestones: PerformanceMilestoneEvent[] = rawMilestones
    .filter(m => Math.abs(m.dayOffset) < rollingDays)
    .map(m => {
      const d = new Date(today);
      d.setDate(d.getDate() + m.dayOffset);
      return {
        ...m,
        date: d.toISOString().slice(0, 10)
      };
    });

  const milestoneMap = new Map<number, PerformanceMilestoneEvent>();
  milestones.forEach(m => milestoneMap.set(m.dayOffset, m));

  const data: DailyPerformanceTrendDataPoint[] = [];

  // Progression from day -(rollingDays - 1) to 0 (today)
  for (let i = -(rollingDays - 1); i <= 0; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const formattedDate = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

    // Progress parameter: 0.0 at oldest day -> 1.0 at day 0
    const progress = (i + (rollingDays - 1)) / (rollingDays - 1);
    
    // Natural jitter
    const noise = (pseudoRandom(i * 11) - 0.5) * 0.08;
    const noiseB = (pseudoRandom(i * 17) - 0.5) * 1.4;

    // Progression curve with step improvements around milestones
    let boost = 0;
    if (i >= -76) boost += 0.22;
    if (i >= -54) boost += 0.28;
    if (i >= -37) boost += 0.18;
    if (i >= -21) boost += 0.16;
    if (i >= -7) boost += 0.16;
    
    // Normalized smooth progress with milestone step weights
    const smoothedProgress = Math.min(1.0, progress * 0.35 + boost * 0.65);

    // 1. LCP: from ~3.25s down to ~1.12s (Google Good is < 2.5s)
    const lcpBase = 3.25 - smoothedProgress * 2.13;
    const lcp = Math.max(0.85, Number((lcpBase + noise * 1.2).toFixed(2)));

    // 2. INP: from ~220ms down to ~62ms (Google Good is < 200ms)
    const inpBase = 220 - smoothedProgress * 158;
    const inp = Math.max(40, Math.round(inpBase + noise * 18));

    // 3. CLS: from ~0.14 down to ~0.015 (Google Good is < 0.1)
    const clsBase = 0.14 - smoothedProgress * 0.125;
    const cls = Math.max(0.005, Number((clsBase + noise * 0.03).toFixed(3)));

    // 3b. FID (First Input Delay): from ~58ms down to ~16ms (Google Good is <= 100ms)
    const fidBase = 58 - smoothedProgress * 42;
    const fid = Math.max(10, Math.round(fidBase + noise * 8));

    // 4. TTFB: from ~240ms down to ~26ms (Google Good is < 800ms)
    const ttfbBase = 240 - smoothedProgress * 214;
    const ttfb = Math.max(18, Math.round(ttfbBase + noise * 22));

    // 5. FCP: from ~1.85s down to ~0.62s (Google Good is < 1.8s)
    const fcpBase = 1.85 - smoothedProgress * 1.23;
    const fcp = Math.max(0.45, Number((fcpBase + noise * 0.5).toFixed(2)));

    // 6. Visitor Bounce Rate (%): Drops as performance improves!
    // Slower pages lose visitors; sub-second pages retain visitors.
    // Starting ~48.5% down to ~22.4%
    const bounceBase = 48.5 - smoothedProgress * 26.1;
    const bounceRate = Math.max(18.0, Number((bounceBase + noiseB).toFixed(1)));

    // 7. Daily Visitors: Tends to grow as Google ranks faster pages better
    const visitorBase = 280 + smoothedProgress * 420;
    const dailyVisitors = Math.round(visitorBase + (pseudoRandom(i * 31) - 0.5) * 60);

    // 8. Session Duration & Pages per Session
    const avgSessionDurationSec = Math.round(95 + smoothedProgress * 110 + noiseB * 4);
    const pagesPerSession = Number((2.1 + smoothedProgress * 1.8 + (noise * 0.4)).toFixed(1));

    // 9. Infrastructure Health Score (0-100)
    const healthBase = 68 + smoothedProgress * 31;
    const healthScore = Math.min(100, Math.max(50, Math.round(healthBase + (noise * 12))));

    const cwvPassStatus = (lcp <= 2.5 && (fid <= 100 || inp <= 200) && cls <= 0.1) 
      ? "pass" 
      : (lcp <= 4.0 && (fid <= 300 || inp <= 500) && cls <= 0.25)
      ? "needs-improvement"
      : "fail";

    const milestone = milestoneMap.get(i);

    data.push({
      date: dateStr,
      formattedDate,
      dayIndex: i,
      lcp,
      inp,
      cls,
      fid,
      ttfb,
      fcp,
      bounceRate,
      dailyVisitors,
      avgSessionDurationSec,
      pagesPerSession,
      healthScore,
      cwvPassStatus,
      milestone
    });
  }

  // Calculate 7-day and 14-day rolling moving averages
  for (let i = 0; i < data.length; i++) {
    // 7d MA
    const start7 = Math.max(0, i - 6);
    const slice7 = data.slice(start7, i + 1);
    data[i].lcp_ma = Number((slice7.reduce((acc, p) => acc + p.lcp, 0) / slice7.length).toFixed(2));
    data[i].inp_ma = Math.round(slice7.reduce((acc, p) => acc + p.inp, 0) / slice7.length);
    data[i].cls_ma = Number((slice7.reduce((acc, p) => acc + p.cls, 0) / slice7.length).toFixed(3));
    data[i].fid_ma = Math.round(slice7.reduce((acc, p) => acc + p.fid, 0) / slice7.length);
    data[i].ttfb_ma = Math.round(slice7.reduce((acc, p) => acc + p.ttfb, 0) / slice7.length);
    data[i].fcp_ma = Number((slice7.reduce((acc, p) => acc + p.fcp, 0) / slice7.length).toFixed(2));
    data[i].bounceRate_ma = Number((slice7.reduce((acc, p) => acc + p.bounceRate, 0) / slice7.length).toFixed(1));
    data[i].healthScore_ma = Math.round(slice7.reduce((acc, p) => acc + p.healthScore, 0) / slice7.length);
  }

  // Helper function to calculate Pearson Correlation Coefficient
  const calculatePearsonR = (xVals: number[], yVals: number[]): number => {
    const n = xVals.length;
    if (n < 2) return 0;
    const meanX = xVals.reduce((a, b) => a + b, 0) / n;
    const meanY = yVals.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sumXsq = 0;
    let sumYsq = 0;

    for (let j = 0; j < n; j++) {
      const diffX = xVals[j] - meanX;
      const diffY = yVals[j] - meanY;
      numerator += diffX * diffY;
      sumXsq += diffX * diffX;
      sumYsq += diffY * diffY;
    }

    const denominator = Math.sqrt(sumXsq * sumYsq);
    if (denominator === 0) return 0;
    return Number((numerator / denominator).toFixed(2));
  };

  const bounceRates = data.map(d => d.bounceRate);
  const lcpValues = data.map(d => d.lcp);
  const inpValues = data.map(d => d.inp);
  const clsValues = data.map(d => d.cls);
  const ttfbValues = data.map(d => d.ttfb);
  const fcpValues = data.map(d => d.fcp);
  const healthValues = data.map(d => d.healthScore);

  const rLcp = calculatePearsonR(lcpValues, bounceRates);
  const rInp = calculatePearsonR(inpValues, bounceRates);
  const rCls = calculatePearsonR(clsValues, bounceRates);
  const rTtfb = calculatePearsonR(ttfbValues, bounceRates);
  const rHealth = calculatePearsonR(healthValues, bounceRates);

  const initialPoint = data[0];
  const currentPoint = data[data.length - 1];

  const correlationInsights: CoreVitalCorrelationInsight[] = [
    {
      metricKey: "lcp",
      metricLabel: "En Büyük İçerikli Boyama (LCP)",
      unit: "sn",
      pearsonR: rLcp,
      direction: "positive",
      elasticityStatement: "LCP'deki her 500 ms iyileşme, siteden anında ayrılma (bounce) oranını ortalama %5.4 oranında azalttı.",
      googleTargetThreshold: 2.5,
      isMeetingGoogleTarget: currentPoint.lcp <= 2.5,
      currentValue: currentPoint.lcp,
      initialValue: initialPoint.lcp,
      totalChangePercent: Number((((currentPoint.lcp - initialPoint.lcp) / initialPoint.lcp) * 100).toFixed(1)),
      verdict: "critical_driver"
    },
    {
      metricKey: "ttfb",
      metricLabel: "İlk Bayt Yanıt Süresi (TTFB)",
      unit: "ms",
      pearsonR: rTtfb,
      direction: "positive",
      elasticityStatement: "Anycast Edge CDN sayesinde TTFB'nin 240ms'den 26ms'ye inmesi, mobil ziyaretçi terk oranını doğrudan engelledi.",
      googleTargetThreshold: 800,
      isMeetingGoogleTarget: currentPoint.ttfb <= 800,
      currentValue: currentPoint.ttfb,
      initialValue: initialPoint.ttfb,
      totalChangePercent: Number((((currentPoint.ttfb - initialPoint.ttfb) / initialPoint.ttfb) * 100).toFixed(1)),
      verdict: "critical_driver"
    },
    {
      metricKey: "inp",
      metricLabel: "Etkileşimden Sonraki Boyama (INP)",
      unit: "ms",
      pearsonR: rInp,
      direction: "positive",
      elasticityStatement: "Menü açılışı ve buton tıklama gecikmelerinin 60ms civarına çekilmesi, kullanıcıların sitede daha uzun kalmasını sağladı.",
      googleTargetThreshold: 200,
      isMeetingGoogleTarget: currentPoint.inp <= 200,
      currentValue: currentPoint.inp,
      initialValue: initialPoint.inp,
      totalChangePercent: Number((((currentPoint.inp - initialPoint.inp) / initialPoint.inp) * 100).toFixed(1)),
      verdict: "moderate_driver"
    },
    {
      metricKey: "cls",
      metricLabel: "Kümülatif Düzen Kayması (CLS)",
      unit: "",
      pearsonR: rCls,
      direction: "positive",
      elasticityStatement: "Görsellerde en-boy oranı ve font ön yükleme ile sayfa zıplaması yok edildi, yanlış tıklamalar sıfırlandı.",
      googleTargetThreshold: 0.1,
      isMeetingGoogleTarget: currentPoint.cls <= 0.1,
      currentValue: currentPoint.cls,
      initialValue: initialPoint.cls,
      totalChangePercent: Number((((currentPoint.cls - initialPoint.cls) / initialPoint.cls) * 100).toFixed(1)),
      verdict: "moderate_driver"
    },
    {
      metricKey: "healthScore",
      metricLabel: "Genel Altyapı Sağlık Skoru",
      unit: "/100",
      pearsonR: rHealth,
      direction: "negative", // Higher health -> Lower bounce rate
      elasticityStatement: "Altyapı sağlık skorundaki her +10 puanlık artış, dönüşüm oranlarında %14 net büyüme üretti.",
      googleTargetThreshold: 90,
      isMeetingGoogleTarget: currentPoint.healthScore >= 90,
      currentValue: currentPoint.healthScore,
      initialValue: initialPoint.healthScore,
      totalChangePercent: Number((((currentPoint.healthScore - initialPoint.healthScore) / initialPoint.healthScore) * 100).toFixed(1)),
      verdict: "critical_driver"
    }
  ];

  const summary: PerformanceTrendsSummary = {
    periodDays: rollingDays,
    startDate: initialPoint.date,
    endDate: currentPoint.date,
    overallHealthScoreCurrent: currentPoint.healthScore,
    overallHealthScoreInitial: initialPoint.healthScore,
    healthDeltaPercent: Number((((currentPoint.healthScore - initialPoint.healthScore) / initialPoint.healthScore) * 100).toFixed(1)),
    
    lcpCurrent: currentPoint.lcp,
    lcpInitial: initialPoint.lcp,
    lcpDeltaPercent: Number((((currentPoint.lcp - initialPoint.lcp) / initialPoint.lcp) * 100).toFixed(1)),
    
    bounceRateCurrent: currentPoint.bounceRate,
    bounceRateInitial: initialPoint.bounceRate,
    bounceRateDeltaPercent: Number((((currentPoint.bounceRate - initialPoint.bounceRate) / initialPoint.bounceRate) * 100).toFixed(1)),
    
    inpCurrent: currentPoint.inp,
    inpInitial: initialPoint.inp,
    inpDeltaPercent: Number((((currentPoint.inp - initialPoint.inp) / initialPoint.inp) * 100).toFixed(1)),
    
    clsCurrent: currentPoint.cls,
    clsInitial: initialPoint.cls,
    clsDeltaPercent: Number((((currentPoint.cls - initialPoint.cls) / initialPoint.cls) * 100).toFixed(1)),
    
    ttfbCurrent: currentPoint.ttfb,
    ttfbInitial: initialPoint.ttfb,
    ttfbDeltaPercent: Number((((currentPoint.ttfb - initialPoint.ttfb) / initialPoint.ttfb) * 100).toFixed(1)),
    
    totalMilestones: milestones.length,
    googleCwvPassRate: 100,
    primaryCorrelationDriver: "LCP (Sayfa Açılış Hızı) ve TTFB (Sunucu Yanıtı)"
  };

  return {
    data,
    summary,
    correlationInsights,
    milestones
  };
}

/**
 * Exports the 90-day time-series data to CSV
 */
export function generatePerformanceTrendsCsv(
  data: DailyPerformanceTrendDataPoint[],
  summary: PerformanceTrendsSummary,
  config: SiteConfig
): string {
  const headers = [
    "Tarih",
    "Gun_Index",
    "LCP_sn",
    "LCP_7d_Ortalama",
    "Cikma_Orani_Yuzde",
    "Cikma_Orani_7d_Ortalama",
    "INP_ms",
    "CLS_Skor",
    "TTFB_ms",
    "FCP_sn",
    "Gunluk_Tekil_Ziyaretci",
    "Ort_Oturum_Suresi_sn",
    "Sayfa_Basina_Goruntulenme",
    "Altyapi_Saglik_Skoru_100",
    "Google_CWV_Durumu",
    "Altyapi_Kilometre_Tasi"
  ];

  const rows = data.map(d => [
    d.date,
    d.dayIndex,
    d.lcp,
    d.lcp_ma ?? d.lcp,
    d.bounceRate,
    d.bounceRate_ma ?? d.bounceRate,
    d.inp,
    d.cls,
    d.ttfb,
    d.fcp,
    d.dailyVisitors,
    d.avgSessionDurationSec,
    d.pagesPerSession,
    d.healthScore,
    d.cwvPassStatus,
    d.milestone ? `"${d.milestone.title.replace(/"/g, '""')} - ${d.milestone.impactMetric} (${d.milestone.impactDelta})"` : '""'
  ]);

  const summaryHeader = [
    `# 90 GUNLUK GELISMIS SITE PERFORMANS VE ZIYARETCI CIKMA ORANI ANALIZI`,
    `# Sirket: ${config.companyName || "Site"}`,
    `# Rapor Tarih Araligi: ${summary.startDate} - ${summary.endDate} (${summary.periodDays} Gun)`,
    `# LCP Degisimi: ${summary.lcpInitial}s -> ${summary.lcpCurrent}s (%${summary.lcpDeltaPercent})`,
    `# Cikma Orani Degisimi: %${summary.bounceRateInitial} -> %${summary.bounceRateCurrent} (%${summary.bounceRateDeltaPercent})`,
    `# Altyapi Saglik Skoru: ${summary.overallHealthScoreInitial}/100 -> ${summary.overallHealthScoreCurrent}/100 (%${summary.healthDeltaPercent})`,
    `# Google Core Web Vitals Basari Orani: %${summary.googleCwvPassRate}`,
    ""
  ].join("\n");

  const csvContent = summaryHeader + headers.join(";") + "\n" + rows.map(r => r.join(";")).join("\n");
  return "\uFEFF" + csvContent; // UTF-8 BOM for Excel
}

export function downloadPerformanceTrendsCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
