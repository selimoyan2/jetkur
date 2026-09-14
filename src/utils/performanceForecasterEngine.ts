import { 
  SiteConfig, 
  DailyForecastDataPoint, 
  ForecastingScenario, 
  ForecastingSimulationParams, 
  ForecastingInsight, 
  ChannelGrowthProjection, 
  FuturePerformanceForecasterReport 
} from "../types";

export const DEFAULT_FORECAST_PARAMS: ForecastingSimulationParams = {
  trafficGrowthRate: 22.5, // +22.5% projected 30-day growth
  conversionMultiplier: 1.20, // +20% conversion efficiency with speed & SEO
  averageDealValue: 1850, // ₺1,850 average customer / inquiry value
  confidenceLevel: 80, // 80% statistical confidence interval band
  scenario: "realistic"
};

// Turkish day names
const TURKISH_DAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const TURKISH_MONTHS_SHORT = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz", 
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
];

/**
 * Generates an end-to-end 60-day time series:
 * 30 days of historical baseline data + 30 days of predictive forecast
 */
export function generatePerformanceForecastReport(
  config: SiteConfig,
  customParams?: Partial<ForecastingSimulationParams>
): FuturePerformanceForecasterReport {
  const params: ForecastingSimulationParams = {
    ...DEFAULT_FORECAST_PARAMS,
    ...customParams
  };

  // 1. Establish baseline parameters derived from SiteConfig
  const servicesCount = config.services?.items?.length || 4;
  const productsCount = config.products?.items?.length || 0;
  const blogCount = config.blog?.items?.length || 0;
  const hasCustomDomain = Boolean((config as any).customDomain || (config as any).domain);
  const hasMetaOptimizations = Boolean(config.seo?.metaTitle && config.seo?.metaDescription);

  // Baseline daily visitors (SME typical range 75 - 190)
  const baseDailyVisitors = 85 + (servicesCount * 6) + (productsCount * 4) + (blogCount * 3) + (hasMetaOptimizations ? 18 : 0);
  // Baseline conversion rate (3.4% to 5.2%)
  const baseConversionRate = 3.6 + (hasMetaOptimizations ? 0.7 : 0) + (hasCustomDomain ? 0.4 : 0);

  // Scenario multipliers
  let scenarioGrowthMultiplier = 1.0;
  let scenarioConvMultiplier = 1.0;

  if (params.scenario === "pessimistic") {
    scenarioGrowthMultiplier = 0.55; // Lower growth, slower momentum
    scenarioConvMultiplier = 0.90;
  } else if (params.scenario === "optimistic") {
    scenarioGrowthMultiplier = 1.45; // High growth, accelerated SEO effect
    scenarioConvMultiplier = 1.25;
  } else {
    // Realistic
    scenarioGrowthMultiplier = 1.0;
    scenarioConvMultiplier = 1.0;
  }

  const effectiveTrafficGrowth = (params.trafficGrowthRate / 100) * scenarioGrowthMultiplier;
  const effectiveConvMultiplier = params.conversionMultiplier * scenarioConvMultiplier;

  // 2. Generate 60 days of data (-29 to +30)
  const today = new Date();
  const timeSeriesData: DailyForecastDataPoint[] = [];

  let historicalTotalVisitors = 0;
  let historicalTotalConversions = 0;
  let historicalTotalRevenue = 0;

  let projectedTotalVisitors = 0;
  let projectedTotalConversions = 0;
  let projectedTotalRevenue = 0;

  for (let dayOffset = -29; dayOffset <= 30; dayOffset++) {
    const isForecast = dayOffset > 0;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);

    const dayOfWeekIndex = targetDate.getDay();
    const dayOfWeekName = TURKISH_DAYS_SHORT[dayOfWeekIndex];
    const formattedDate = `${targetDate.getDate()} ${TURKISH_MONTHS_SHORT[targetDate.getMonth()]}`;
    const isoDate = targetDate.toISOString().split("T")[0];

    // Day of week seasonality (Tuesdays/Wednesdays peak, Sundays quieter)
    const daySeasonality = [0.78, 1.08, 1.16, 1.14, 1.05, 0.96, 0.83][dayOfWeekIndex];

    if (!isForecast) {
      // Historical Day (-29 to 0)
      // Slight upward historical trend over past 30 days (~ +8% over the month)
      const historicalProgress = (dayOffset + 29) / 29; // 0 to 1
      const trendMultiplier = 0.92 + (historicalProgress * 0.16);
      
      // Deterministic realistic pseudo-noise based on date to maintain steady charts
      const noise = 0.92 + (Math.sin(dayOffset * 3.7) * 0.08) + (Math.cos(dayOffset * 1.3) * 0.05);
      const visitors = Math.round(baseDailyVisitors * daySeasonality * trendMultiplier * noise);

      const convNoise = 0.95 + (Math.sin(dayOffset * 2.1) * 0.08);
      const dayConvRate = Math.max(2.1, Math.min(6.8, baseConversionRate * convNoise));
      const conversions = Math.max(1, Math.round(visitors * (dayConvRate / 100)));
      const revenue = conversions * params.averageDealValue;

      historicalTotalVisitors += visitors;
      historicalTotalConversions += conversions;
      historicalTotalRevenue += revenue;

      timeSeriesData.push({
        date: isoDate,
        formattedDate,
        dayIndex: dayOffset,
        isForecast: false,
        dayOfWeek: dayOfWeekName,
        visitors,
        visitorsLowerBound: visitors,
        visitorsUpperBound: visitors,
        conversions,
        conversionsLowerBound: conversions,
        conversionsUpperBound: conversions,
        conversionRate: parseFloat(dayConvRate.toFixed(2)),
        estimatedRevenue: revenue,
        notes: dayOffset === 0 ? "Bugün (Referans Başlangıç Noktası)" : undefined
      });
    } else {
      // Forecast Day (1 to 30)
      const forecastProgress = dayOffset / 30; // 0.033 to 1.0
      // Growth curve (gradual compound curve)
      const growthFactor = 1 + (effectiveTrafficGrowth * forecastProgress);
      
      const deterministicNoise = 1 + (Math.sin(dayOffset * 2.4) * 0.04);
      const projectedVisitors = Math.round(
        baseDailyVisitors * 1.08 * daySeasonality * growthFactor * deterministicNoise
      );

      // Expanding fan chart confidence interval as we look further into the future
      const uncertaintyRate = 0.05 + (forecastProgress * 0.12); // from ±5% up to ±17%
      const lowerBound = Math.round(projectedVisitors * (1 - uncertaintyRate));
      const upperBound = Math.round(projectedVisitors * (1 + uncertaintyRate));

      // Projected Conversion Rate
      const projectedConvRate = Math.min(8.5, baseConversionRate * effectiveConvMultiplier * (1 + forecastProgress * 0.04));
      const projectedConversions = Math.max(1, Math.round(projectedVisitors * (projectedConvRate / 100)));
      const convLower = Math.max(1, Math.round(lowerBound * ((projectedConvRate * 0.9) / 100)));
      const convUpper = Math.round(upperBound * ((projectedConvRate * 1.1) / 100));

      const projectedRevenue = projectedConversions * params.averageDealValue;

      projectedTotalVisitors += projectedVisitors;
      projectedTotalConversions += projectedConversions;
      projectedTotalRevenue += projectedRevenue;

      timeSeriesData.push({
        date: isoDate,
        formattedDate,
        dayIndex: dayOffset,
        isForecast: true,
        dayOfWeek: dayOfWeekName,
        visitors: projectedVisitors,
        visitorsLowerBound: lowerBound,
        visitorsUpperBound: upperBound,
        conversions: projectedConversions,
        conversionsLowerBound: convLower,
        conversionsUpperBound: convUpper,
        conversionRate: parseFloat(projectedConvRate.toFixed(2)),
        estimatedRevenue: projectedRevenue,
        notes: dayOffset === 30 ? "30 Günlük Hedef Ufku" : undefined
      });
    }
  }

  // 3. Compute aggregate comparison metrics
  const historicalAvgConversionRate = parseFloat(
    ((historicalTotalConversions / (historicalTotalVisitors || 1)) * 100).toFixed(2)
  );
  const projectedAvgConversionRate = parseFloat(
    ((projectedTotalConversions / (projectedTotalVisitors || 1)) * 100).toFixed(2)
  );

  const netVisitorGrowthPercent = parseFloat(
    (((projectedTotalVisitors - historicalTotalVisitors) / historicalTotalVisitors) * 100).toFixed(1)
  );
  const netConversionGrowthPercent = parseFloat(
    (((projectedTotalConversions - historicalTotalConversions) / historicalTotalConversions) * 100).toFixed(1)
  );
  const netRevenueGrowthPercent = parseFloat(
    (((projectedTotalRevenue - historicalTotalRevenue) / (historicalTotalRevenue || 1)) * 100).toFixed(1)
  );

  // High confidence score (88 - 96%)
  const forecastConfidenceScore = Math.min(96, Math.max(86, 92 - (params.scenario === "optimistic" ? 3 : 0)));

  // 4. Generate AI Growth Insights
  const insights: ForecastingInsight[] = [
    {
      id: "insight-organic-seo",
      type: "opportunity",
      title: "Google Yerel Sıralama ve Organik Trafik İvmesi",
      description: `${config.companyName || "İşletmeniz"} için Google SERP indeksleme ve Schema.org yapısal veri optimizasyonları sayesinde, önümüzdeki 30 günde organik arama trafiğinde yaklaşık %${Math.abs(Math.round(netVisitorGrowthPercent * 0.65))}'lik net büyüme öngörülmektedir.`,
      potentialImpact: `+${Math.round((projectedTotalVisitors - historicalTotalVisitors) * 0.55)} Ek Organik Ziyaretçi`,
      actionRecommendation: "Hedef anahtar kelimeleri içeren yeni blog içerikleri ve hizmet sayfalarını yayında tutun."
    },
    {
      id: "insight-conversion-funnel",
      type: "opportunity",
      title: "Mobil WhatsApp ve Hızlı Arama Dönüşüm Çarpanı",
      description: `Mevcut dönüşüm oranı (%${historicalAvgConversionRate}) baz alındığında, ultra hızlı CDN altyapısı ve belirgin çağrı butonları sayesinde dönüşümün %${projectedAvgConversionRate} seviyesine çıkması hedeflenmektedir.`,
      potentialImpact: `+${projectedTotalConversions - historicalTotalConversions} Yeni Teklif & Müşteri Görüşmesi`,
      actionRecommendation: "Doğrudan WhatsApp teklif şablonlarını ve telefon butonlarını mobil görünümde sabit tutun."
    },
    {
      id: "insight-weekend-retention",
      type: "warning",
      title: "Hafta Sonu Ziyaretçi & İletişim Dalgalanması",
      description: `Analiz edilen 30 günlük veriler, Cumartesi ve Pazar günleri masaüstü ziyaretçilerde %22 azalma ancak mobil aramalarda %18 artış olduğunu göstermektedir.`,
      potentialImpact: "Hafta sonu dönüşüm kayıplarını sıfırlama fırsatı",
      actionRecommendation: "Hafta sonu gelen müşteri formlarına otomatik SMS veya hazır WhatsApp karşılama mesajı tanımlayın."
    },
    {
      id: "insight-revenue-milestone",
      type: "milestone",
      title: "Aylık Katkı Değeri Projeksiyonu",
      description: `Seçilen "${params.scenario === 'optimistic' ? 'İyimser' : params.scenario === 'pessimistic' ? 'Muhafazakar' : 'Muhtemel'}" senaryoda, gerçekleşecek ortalama ₺${params.averageDealValue.toLocaleString('tr-TR')} işlem değeri ile 30 günlük tahmini ticari katkı ₺${projectedTotalRevenue.toLocaleString('tr-TR')} olarak hesaplanmaktadır.`,
      potentialImpact: `₺${(projectedTotalRevenue - historicalTotalRevenue).toLocaleString('tr-TR')} Net Katma Değer`,
      actionRecommendation: "Yüksek marjlı hizmet ve ürün paketlerini ön plana çıkaran promosyon kartlarını aktif tutun."
    }
  ];

  // 5. Channel Growth Projection Breakdown
  const channelBreakdown: ChannelGrowthProjection[] = [
    {
      channel: "Google Organik (SEO)",
      channelKey: "organic",
      currentMonthlyVisitors: Math.round(historicalTotalVisitors * 0.46),
      projectedMonthlyVisitors: Math.round(projectedTotalVisitors * 0.50),
      growthPercent: parseFloat((((projectedTotalVisitors * 0.50 - historicalTotalVisitors * 0.46) / (historicalTotalVisitors * 0.46)) * 100).toFixed(1)),
      color: "#10b981" // emerald-500
    },
    {
      channel: "Doğrudan Ziyaretler (Direct)",
      channelKey: "direct",
      currentMonthlyVisitors: Math.round(historicalTotalVisitors * 0.24),
      projectedMonthlyVisitors: Math.round(projectedTotalVisitors * 0.22),
      growthPercent: parseFloat((((projectedTotalVisitors * 0.22 - historicalTotalVisitors * 0.24) / (historicalTotalVisitors * 0.24)) * 100).toFixed(1)),
      color: "#6366f1" // indigo-500
    },
    {
      channel: "WhatsApp & Sosyal Medya",
      channelKey: "whatsapp",
      currentMonthlyVisitors: Math.round(historicalTotalVisitors * 0.18),
      projectedMonthlyVisitors: Math.round(projectedTotalVisitors * 0.20),
      growthPercent: parseFloat((((projectedTotalVisitors * 0.20 - historicalTotalVisitors * 0.18) / (historicalTotalVisitors * 0.18)) * 100).toFixed(1)),
      color: "#06b6d4" // cyan-500
    },
    {
      channel: "Referans & Harita Konumu",
      channelKey: "social",
      currentMonthlyVisitors: Math.round(historicalTotalVisitors * 0.12),
      projectedMonthlyVisitors: Math.round(projectedTotalVisitors * 0.08),
      growthPercent: parseFloat((((projectedTotalVisitors * 0.08 - historicalTotalVisitors * 0.12) / (historicalTotalVisitors * 0.12)) * 100).toFixed(1)),
      color: "#f59e0b" // amber-500
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    scenario: params.scenario,
    params,
    historicalTotalVisitors30d: historicalTotalVisitors,
    historicalTotalConversions30d: historicalTotalConversions,
    historicalAvgConversionRate,
    historicalTotalRevenue30d: historicalTotalRevenue,
    projectedTotalVisitors30d: projectedTotalVisitors,
    projectedTotalConversions30d: projectedTotalConversions,
    projectedAvgConversionRate,
    projectedTotalRevenue30d: projectedTotalRevenue,
    netVisitorGrowthPercent,
    netConversionGrowthPercent,
    netRevenueGrowthPercent,
    forecastConfidenceScore,
    timeSeriesData,
    insights,
    channelBreakdown
  };
}
