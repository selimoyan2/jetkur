import {
  FormLead,
  DailyForecastPoint,
  WeeklyForecastMilestone,
  ChannelForecastContribution,
  ForecastSimulationConfig,
  ForecastSummary
} from "../types";
import { escapeCsvCell } from "./csvExport";

const TURKISH_DAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const TURKISH_DAYS_FULL = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi"
];
const TURKISH_MONTHS_SHORT = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
];
const TURKISH_MONTHS_FULL = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

// Day of week seasonality factors (Business days higher, weekends moderate)
const DAY_OF_WEEK_FACTORS = [0.75, 1.15, 1.2, 1.15, 1.1, 1.05, 0.8]; // Sun=0, Mon=1, ..., Sat=6

/**
 * Calculates the next 30-day forecast based on historical lead performance and simulation parameters.
 */
export function calculateNext30DaysForecast(
  leads: FormLead[] = [],
  simulation: ForecastSimulationConfig = {
    conversionRateModifier: 0,
    trafficMultiplier: 1.0,
    dealValueMultiplier: 1.0,
    scenario: "realistic"
  }
): ForecastSummary {
  // 1. Analyze historical lead pool
  const totalLeads = leads.length;
  const closedLeads = leads.filter((l) => l.status === "closed");
  const offeredLeads = leads.filter((l) => l.status === "offered");
  const contactedLeads = leads.filter((l) => l.status === "contacted");
  const newLeads = leads.filter((l) => l.status === "new");

  // Historical conversion rate
  const rawConversionRate = totalLeads > 0 ? (closedLeads.length / totalLeads) * 100 : 32.5;
  const actualConversionRate = Math.max(5, Math.min(85, Math.round(rawConversionRate * 10) / 10));

  // Historical revenue and average deal value
  const closedDealValues = closedLeads
    .map((l) => Number(l.dealValue) || 0)
    .filter((v) => v > 0);

  const totalHistoricalRevenue = leads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

  const rawAvgDealValue =
    closedDealValues.length > 0
      ? Math.round(closedDealValues.reduce((a, b) => a + b, 0) / closedDealValues.length)
      : totalHistoricalRevenue > 0 && closedLeads.length > 0
      ? Math.round(totalHistoricalRevenue / closedLeads.length)
      : 3450; // default realistic SME benchmark

  const avgDealValue = Math.max(500, rawAvgDealValue);

  // Historical velocity estimation (leads arriving per day)
  // Baseline assumption for active SME website: 1.1 to 1.8 leads per day if leads array has standard sample
  const dailyVelocityBase = totalLeads > 0 ? Math.max(0.7, Math.min(3.5, totalLeads / 14)) : 1.25;

  // 2. Apply scenario & simulation configuration
  let conversionDelta = simulation.conversionRateModifier || 0;
  let trafficMult = simulation.trafficMultiplier || 1.0;
  let dealMult = simulation.dealValueMultiplier || 1.0;

  if (simulation.scenario === "optimistic") {
    conversionDelta += 6.5;
    trafficMult *= 1.25;
    dealMult *= 1.1;
  } else if (simulation.scenario === "conservative") {
    conversionDelta -= 5.5;
    trafficMult *= 0.8;
    dealMult *= 0.9;
  }

  const effectiveConversionRate = Math.max(
    5,
    Math.min(90, Math.round((actualConversionRate + conversionDelta) * 10) / 10)
  );
  const effectiveAvgDealValue = Math.round(avgDealValue * dealMult);
  const effectiveVelocity = dailyVelocityBase * trafficMult;

  // 3. Generate 30 consecutive days starting from tomorrow
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start tomorrow

  const dailyPoints: DailyForecastPoint[] = [];

  let runningCumulativeLeads = 0;
  let runningCumulativeWonDeals = 0;
  let runningCumulativeRevenue = 0;

  let runningMinCumRevenue = 0;
  let runningMaxCumRevenue = 0;
  let runningMinCumLeads = 0;
  let runningMaxCumLeads = 0;

  for (let i = 1; i <= 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (i - 1));

    const dayOfWeekIdx = currentDate.getDay();
    const dayOfWeek = TURKISH_DAYS_SHORT[dayOfWeekIdx];
    const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;
    const seasonalityFactor = DAY_OF_WEEK_FACTORS[dayOfWeekIdx];

    // Subtle gentle growth trend over the 30-day period (+3% to +8% naturally)
    const organicProgressFactor = 1 + (i / 30) * 0.08;

    // Small deterministic pseudo-wave (so data has natural realistic variation without flickering)
    const waveNoise = Math.sin(i * 1.3) * 0.12;

    const rawDailyLeads =
      effectiveVelocity * seasonalityFactor * organicProgressFactor * (1 + waveNoise);
    const expectedDailyLeads = Math.max(0.2, Math.round(rawDailyLeads * 10) / 10);

    const rawDailyWon = expectedDailyLeads * (effectiveConversionRate / 100);
    const expectedDailyWonDeals = Math.max(0.05, Math.round(rawDailyWon * 100) / 100);

    const expectedDailyRevenue = Math.round(expectedDailyWonDeals * effectiveAvgDealValue);

    // Cumulative sums
    runningCumulativeLeads += expectedDailyLeads;
    runningCumulativeWonDeals += expectedDailyWonDeals;
    runningCumulativeRevenue += expectedDailyRevenue;

    // Confidence intervals (Conservative: -18%, Optimistic: +22%)
    const minDailyRevenue = Math.round(expectedDailyRevenue * 0.82);
    const maxDailyRevenue = Math.round(expectedDailyRevenue * 1.22);
    const minDailyLeads = Math.max(0.1, Math.round(expectedDailyLeads * 0.82 * 10) / 10);
    const maxDailyLeads = Math.round(expectedDailyLeads * 1.22 * 10) / 10;

    runningMinCumRevenue += minDailyRevenue;
    runningMaxCumRevenue += maxDailyRevenue;
    runningMinCumLeads += minDailyLeads;
    runningMaxCumLeads += maxDailyLeads;

    const dateKey = currentDate.toISOString().slice(0, 10);
    const displayDate = `${currentDate.getDate()} ${TURKISH_MONTHS_SHORT[currentDate.getMonth()]}`;
    const fullDisplayDate = `${currentDate.getDate()} ${
      TURKISH_MONTHS_FULL[currentDate.getMonth()]
    } ${currentDate.getFullYear()}, ${TURKISH_DAYS_FULL[dayOfWeekIdx]}`;

    dailyPoints.push({
      dayIndex: i,
      date: currentDate,
      dateKey,
      displayDate,
      fullDisplayDate,
      dayOfWeek,
      isWeekend,
      expectedDailyLeads: Math.round(expectedDailyLeads * 10) / 10,
      expectedDailyWonDeals: Math.round(expectedDailyWonDeals * 10) / 10,
      expectedDailyRevenue,
      cumulativeLeads: Math.round(runningCumulativeLeads * 10) / 10,
      cumulativeWonDeals: Math.round(runningCumulativeWonDeals * 10) / 10,
      cumulativeRevenue: runningCumulativeRevenue,
      minRevenue: minDailyRevenue,
      maxRevenue: maxDailyRevenue,
      minCumulativeRevenue: runningMinCumRevenue,
      maxCumulativeRevenue: runningMaxCumRevenue,
      minLeads: minDailyLeads,
      maxLeads: maxDailyLeads,
      minCumulativeLeads: Math.round(runningMinCumLeads * 10) / 10,
      maxCumulativeLeads: Math.round(runningMaxCumLeads * 10) / 10
    });
  }

  // 4. Summarize 30-Day Totals
  const totalExpectedLeads = Math.round(runningCumulativeLeads);
  const totalExpectedWonDeals = Math.round(runningCumulativeWonDeals);
  const totalExpectedRevenue = runningCumulativeRevenue;

  const confidenceRange = {
    minRevenue: runningMinCumRevenue,
    maxRevenue: runningMaxCumRevenue,
    minLeads: Math.round(runningMinCumLeads),
    maxLeads: Math.round(runningMaxCumLeads),
    minWonDeals: Math.round(runningMinCumLeads * (effectiveConversionRate / 100)),
    maxWonDeals: Math.round(runningMaxCumLeads * (effectiveConversionRate / 100))
  };

  // 5. Weekly Milestones (4 blocks: Days 1-7, 8-14, 15-21, 22-30)
  const weeklyRanges = [
    { week: 1, start: 0, end: 7, label: "1. Hafta (1-7. Gün)" },
    { week: 2, start: 7, end: 14, label: "2. Hafta (8-14. Gün)" },
    { week: 3, start: 14, end: 21, label: "3. Hafta (15-21. Gün)" },
    { week: 4, start: 21, end: 30, label: "4. Hafta (22-30. Gün)" }
  ];

  const weeklyMilestones: WeeklyForecastMilestone[] = weeklyRanges.map((w) => {
    const slice = dailyPoints.slice(w.start, w.end);
    const expectedLeads = Math.round(slice.reduce((acc, p) => acc + p.expectedDailyLeads, 0));
    const expectedWonDeals = Math.round(slice.reduce((acc, p) => acc + p.expectedDailyWonDeals, 0));
    const expectedRevenue = slice.reduce((acc, p) => acc + p.expectedDailyRevenue, 0);
    const endPoint = slice[slice.length - 1];
    const cumulativeRevenueAtEnd = endPoint ? endPoint.cumulativeRevenue : 0;
    const shareOfTotalRevenue =
      totalExpectedRevenue > 0 ? Math.round((expectedRevenue / totalExpectedRevenue) * 1000) / 10 : 25;

    const firstDay = slice[0];
    const lastDay = slice[slice.length - 1];
    const dateRangeLabel = `${firstDay.displayDate} - ${lastDay.displayDate}`;

    return {
      weekNumber: w.week,
      weekLabel: w.label,
      dateRangeLabel,
      expectedLeads,
      expectedWonDeals,
      expectedRevenue,
      cumulativeRevenueAtEnd,
      shareOfTotalRevenue
    };
  });

  // 6. Channel Contributions
  // Count channel shares from historical leads or standard distributions
  const channelCounts: Record<string, { count: number; won: number; revenue: number }> = {
    organic: { count: 0, won: 0, revenue: 0 },
    ads: { count: 0, won: 0, revenue: 0 },
    social: { count: 0, won: 0, revenue: 0 },
    direct: { count: 0, won: 0, revenue: 0 },
    referral: { count: 0, won: 0, revenue: 0 }
  };

  leads.forEach((l) => {
    const ch = l.acquisitionChannel || "organic";
    if (channelCounts[ch]) {
      channelCounts[ch].count += 1;
      if (l.status === "closed") {
        channelCounts[ch].won += 1;
        channelCounts[ch].revenue += Number(l.dealValue) || 0;
      }
    }
  });

  const channelMeta: {
    channel: "organic" | "ads" | "social" | "direct" | "referral";
    label: string;
    baseShare: number;
    color: string;
  }[] = [
    { channel: "organic", label: "Organik SEO & Arama", baseShare: 0.38, color: "#10b981" },
    { channel: "ads", label: "Google Reklamları", baseShare: 0.32, color: "#3b82f6" },
    { channel: "social", label: "Sosyal Medya & İçerik", baseShare: 0.16, color: "#8b5cf6" },
    { channel: "referral", label: "Tavsiye & Doğrudan Ziyaret", baseShare: 0.14, color: "#f59e0b" }
  ];

  const channelContributions: ChannelForecastContribution[] = channelMeta.map((c) => {
    const chLeads = Math.round(totalExpectedLeads * c.baseShare);
    const chWon = Math.round(chLeads * (effectiveConversionRate / 100));
    const chRevenue = Math.round(chWon * effectiveAvgDealValue);
    const sharePercentage = Math.round(c.baseShare * 100);

    return {
      channel: c.channel,
      channelLabel: c.label,
      expectedLeads: chLeads,
      expectedWonDeals: chWon,
      expectedRevenue: chRevenue,
      sharePercentage,
      conversionRate: effectiveConversionRate,
      color: c.color
    };
  });

  // 7. Growth & Strategic Recommendations
  const growthRecommendations: string[] = [];

  if (effectiveConversionRate < 25) {
    growthRecommendations.push(
      "Dönüşüm oranınız (% " +
        effectiveConversionRate +
        ") sektör ortalamasının altında. Yeni gelen form taleplerine ilk 15 dakika içinde geri dönüş yaparak dönüşümü %40'a kadar artırabilirsiniz."
    );
  } else {
    growthRecommendations.push(
      "Mevcut dönüşüm oranınız (% " +
        effectiveConversionRate +
        ") oldukça kuvvetli. Reklam ve organik trafik akışını %20 artırmak beklenen ciroya doğrudan ₺" +
        Math.round(totalExpectedRevenue * 0.2).toLocaleString("tr-TR") +
        " katkı sağlayacaktır."
    );
  }

  growthRecommendations.push(
    "Önümüzdeki 30 günün en yoğun günleri Salı ve Çarşamba günleri olarak tahmin edilmektedir. Bu günlerde teklif bildirimlerini önceliklendirin."
  );

  const potentialExtraRevenue = Math.round(
    totalExpectedLeads * (0.05) * effectiveAvgDealValue
  );
  growthRecommendations.push(
    "Dönüşüm oranında yapılacak yalnızca %5'lik bir iyileştirme (What-If simülasyonu), gelecek ay işletmenize net ₺" +
      potentialExtraRevenue.toLocaleString("tr-TR") +
      " ilave ciro kazandıracaktır."
  );

  return {
    totalExpectedLeads,
    totalExpectedWonDeals,
    totalExpectedRevenue,
    effectiveConversionRate,
    effectiveAvgDealValue,
    confidenceRange,
    historicalMetrics: {
      totalLeads,
      closedLeads: closedLeads.length,
      offeredLeads: offeredLeads.length,
      contactedLeads: contactedLeads.length,
      newLeads: newLeads.length,
      actualConversionRate,
      avgDealValue,
      totalHistoricalRevenue,
      dailyVelocity: Math.round(dailyVelocityBase * 10) / 10
    },
    dailyPoints,
    weeklyMilestones,
    channelContributions,
    growthRecommendations
  };
}

/**
 * Generates and downloads a clean, RFC-4180 UTF-8 CSV of the 30-day forecast.
 */
export function downloadForecastCsv(forecast: ForecastSummary, companyName = "Isletme"): void {
  const headers = [
    "Gün No",
    "Tarih",
    "Haftanın Günü",
    "Beklenen Günlük Lead",
    "Beklenen Günlük Satış (Adet)",
    "Beklenen Günlük Ciro (TL)",
    "Kümülatif Lead",
    "Kümülatif Satış (Adet)",
    "Kümülatif Ciro (TL)",
    "Minimum Güven Sınırı (TL)",
    "Maksimum Güven Sınırı (TL)"
  ];

  const headerRow = headers.map(escapeCsvCell).join(",");

  const rows = forecast.dailyPoints.map((p) =>
    [
      escapeCsvCell(p.dayIndex),
      escapeCsvCell(p.dateKey),
      escapeCsvCell(p.dayOfWeek),
      escapeCsvCell(p.expectedDailyLeads),
      escapeCsvCell(p.expectedDailyWonDeals),
      escapeCsvCell(p.expectedDailyRevenue),
      escapeCsvCell(p.cumulativeLeads),
      escapeCsvCell(p.cumulativeWonDeals),
      escapeCsvCell(p.cumulativeRevenue),
      escapeCsvCell(p.minCumulativeRevenue),
      escapeCsvCell(p.maxCumulativeRevenue)
    ].join(",")
  );

  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const safeName = companyName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `gelecek_ay_tahmin_raporu_${safeName}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
