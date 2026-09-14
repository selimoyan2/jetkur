import { SiteConfig, AbTestExperiment, HeroVariantConfig, FormLead } from "../types";

export interface FunnelStageData {
  stageId: "views" | "clicks" | "leads";
  label: string;
  countA: number;
  countB: number;
  rateA: number; // percentage relative to views
  rateB: number; // percentage relative to views
  stepRetentionA: number; // percentage relative to previous step
  stepRetentionB: number; // percentage relative to previous step
  dropoffA: number; // count lost
  dropoffB: number; // count lost
  dropoffRateA: number; // percentage lost from previous step
  dropoffRateB: number; // percentage lost from previous step
}

export interface AbConversionAnalysis {
  experiment: AbTestExperiment;
  variantA: HeroVariantConfig;
  variantB: HeroVariantConfig;
  viewsA: number;
  viewsB: number;
  clicksA: number;
  clicksB: number;
  leadsA: number;
  leadsB: number;
  ctrA: number;
  ctrB: number;
  leadRateA: number;
  leadRateB: number;
  clickToLeadA: number;
  clickToLeadB: number;
  winnerVariant: "A" | "B" | "tie";
  leadDifference: number; // leadsB - leadsA (or absolute)
  leadLiftPercent: number; // percentage lift of winner over loser
  confidencePercent: number;
  isStatisticallySignificant: boolean;
  funnelStages: FunnelStageData[];
  history: {
    date: string;
    viewsA: number;
    clicksA: number;
    leadsA: number;
    viewsB: number;
    clicksB: number;
    leadsB: number;
    cumLeadsA: number;
    cumLeadsB: number;
  }[];
  summaryInsights: string[];
}

/**
 * Normalizes and extracts A/B test data from SiteConfig with complete safety fallbacks.
 */
export function getAbTestConversionAnalysis(config: SiteConfig): AbConversionAnalysis {
  const ab = config.abTesting;

  const defaultHeroBg = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80";
  const defaultChallengerBg = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80";

  // Build or extract safe variant A
  const variantA: HeroVariantConfig = ab?.variationA || {
    id: "A",
    label: "Varyasyon A (Kontrol - Standart Karşılama)",
    badge: config.hero?.badge || "✨ Kaliteli & Güvenilir Hizmet",
    title: config.hero?.title || `${config.companyName || "Firmamız"} ile Profesyonel Çözümler`,
    subtitle: config.hero?.subtitle || `${config.city || "Şehrinizde"} uzman ekibimiz ve garantili hizmet standartlarımızla 7/24 yanınızdayız.`,
    ctaPrimaryText: config.hero?.ctaPrimaryText || "Hemen Ara & Bilgi Al",
    ctaPrimaryLink: config.hero?.ctaPrimaryLink || `tel:${config.phone?.replace(/\s+/g, "") || "05320000000"}`,
    ctaSecondaryText: config.hero?.ctaSecondaryText || "WhatsApp İletişim",
    ctaSecondaryLink: config.hero?.ctaSecondaryLink || `https://wa.me/${config.whatsapp || "905320000000"}`,
    bgImage: config.hero?.bgImage || defaultHeroBg,
    views: 480,
    clicks: 112,
    leads: 28
  };

  // Build or extract safe variant B
  const variantB: HeroVariantConfig = ab?.variationB || {
    id: "B",
    label: "Varyasyon B (Challenger - Aciliyet & Net Fiyat)",
    badge: "⚡ 15 Dakika Ulaşım Garantisi & %20 İndirim",
    title: "Yolda Kalmayın: Sabit Fiyat, Anında Müdahale!",
    subtitle: "Ekstra sürpriz ücret olmadan şeffaf fiyat garantisi. Canlı konum paylaşımı ile uzman ekibimiz dakikalar içinde kapınızda.",
    ctaPrimaryText: "Anında Fiyat Al & Çağır",
    ctaPrimaryLink: `tel:${config.phone?.replace(/\s+/g, "") || "05320000000"}`,
    ctaSecondaryText: "WhatsApp Canlı Konum",
    ctaSecondaryLink: `https://wa.me/${config.whatsapp || "905320000000"}`,
    bgImage: defaultChallengerBg,
    views: 495,
    clicks: 178,
    leads: 46
  };

  // Count leads from actual lead database if present
  let realLeadsA = 0;
  let realLeadsB = 0;
  if (Array.isArray(config.leads)) {
    for (const lead of config.leads) {
      if ((lead as FormLead).heroVariant === "A") realLeadsA++;
      else if ((lead as FormLead).heroVariant === "B") realLeadsB++;
    }
  }

  // Determine views
  const viewsA = Math.max(1, ab?.stats?.variantA?.views || variantA.views || 480);
  const viewsB = Math.max(1, ab?.stats?.variantB?.views || variantB.views || 495);

  // Determine clicks
  const clicksA = ab?.stats?.variantA?.clicks ?? variantA.clicks ?? Math.round(viewsA * 0.233);
  const clicksB = ab?.stats?.variantB?.clicks ?? variantB.clicks ?? Math.round(viewsB * 0.360);

  // Determine leads (incorporate recorded leads or stats)
  const leadsA = (ab?.stats?.variantA?.leads || variantA.leads || 28) + (realLeadsA > 0 ? realLeadsA : 0);
  const leadsB = (ab?.stats?.variantB?.leads || variantB.leads || 46) + (realLeadsB > 0 ? realLeadsB : 0);

  // Conversion rates
  const ctrA = (clicksA / viewsA) * 100;
  const ctrB = (clicksB / viewsB) * 100;
  const leadRateA = (leadsA / viewsA) * 100;
  const leadRateB = (leadsB / viewsB) * 100;
  const clickToLeadA = clicksA > 0 ? (leadsA / clicksA) * 100 : 0;
  const clickToLeadB = clicksB > 0 ? (leadsB / clicksB) * 100 : 0;

  // Determine winning variant BASED ON LEAD COUNT (per instructions)
  let winnerVariant: "A" | "B" | "tie" = "tie";
  let leadDifference = 0;
  let leadLiftPercent = 0;

  if (leadsB > leadsA) {
    winnerVariant = "B";
    leadDifference = leadsB - leadsA;
    leadLiftPercent = Number((((leadsB - leadsA) / (leadsA || 1)) * 100).toFixed(1));
  } else if (leadsA > leadsB) {
    winnerVariant = "A";
    leadDifference = leadsA - leadsB;
    leadLiftPercent = Number((((leadsA - leadsB) / (leadsB || 1)) * 100).toFixed(1));
  } else {
    winnerVariant = "tie";
    leadDifference = 0;
    leadLiftPercent = 0;
  }

  // Statistical significance (Z-Score approximation)
  const pA = leadsA / viewsA;
  const pB = leadsB / viewsB;
  const pPool = (leadsA + leadsB) / (viewsA + viewsB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / viewsA + 1 / viewsB));
  let confidencePercent = 50;
  let isStatisticallySignificant = false;

  if (se > 0) {
    const z = Math.abs(pB - pA) / se;
    const erf = (x: number) => {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      const absX = Math.abs(x);
      const t = 1.0 / (1.0 + p * absX);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
      return sign * y;
    };
    const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
    confidencePercent = Math.min(99.9, Math.round(cdf * 1000) / 10);
    isStatisticallySignificant = confidencePercent >= 95;
  }

  // Build Funnel Stages
  const funnelStages: FunnelStageData[] = [
    {
      stageId: "views",
      label: "1. Hero Gösterimi (Views)",
      countA: viewsA,
      countB: viewsB,
      rateA: 100,
      rateB: 100,
      stepRetentionA: 100,
      stepRetentionB: 100,
      dropoffA: 0,
      dropoffB: 0,
      dropoffRateA: 0,
      dropoffRateB: 0
    },
    {
      stageId: "clicks",
      label: "2. Buton & CTA Tıklaması (Clicks)",
      countA: clicksA,
      countB: clicksB,
      rateA: Number(ctrA.toFixed(1)),
      rateB: Number(ctrB.toFixed(1)),
      stepRetentionA: Number(ctrA.toFixed(1)),
      stepRetentionB: Number(ctrB.toFixed(1)),
      dropoffA: Math.max(0, viewsA - clicksA),
      dropoffB: Math.max(0, viewsB - clicksB),
      dropoffRateA: Number(((Math.max(0, viewsA - clicksA) / viewsA) * 100).toFixed(1)),
      dropoffRateB: Number(((Math.max(0, viewsB - clicksB) / viewsB) * 100).toFixed(1))
    },
    {
      stageId: "leads",
      label: "3. Müşteri Talebi / Lead (Dönüşüm)",
      countA: leadsA,
      countB: leadsB,
      rateA: Number(leadRateA.toFixed(1)),
      rateB: Number(leadRateB.toFixed(1)),
      stepRetentionA: Number(clickToLeadA.toFixed(1)),
      stepRetentionB: Number(clickToLeadB.toFixed(1)),
      dropoffA: Math.max(0, clicksA - leadsA),
      dropoffB: Math.max(0, clicksB - leadsB),
      dropoffRateA: clicksA > 0 ? Number(((Math.max(0, clicksA - leadsA) / clicksA) * 100).toFixed(1)) : 0,
      dropoffRateB: clicksB > 0 ? Number(((Math.max(0, clicksB - leadsB) / clicksB) * 100).toFixed(1)) : 0
    }
  ];

  // History extraction or synthesized daily trajectory
  const rawHistory = ab?.stats?.history || [
    { date: "28 Ağu", viewsA: 65, clicksA: 15, leadsA: 4, viewsB: 70, clicksB: 24, leadsB: 6 },
    { date: "29 Ağu", viewsA: 72, clicksA: 17, leadsA: 3, viewsB: 68, clicksB: 25, leadsB: 7 },
    { date: "30 Ağu", viewsA: 80, clicksA: 19, leadsA: 5, viewsB: 84, clicksB: 31, leadsB: 8 },
    { date: "31 Ağu", viewsA: 88, clicksA: 21, leadsA: 6, viewsB: 92, clicksB: 33, leadsB: 9 },
    { date: "1 Eyl",  viewsA: 85, clicksA: 20, leadsA: 4, viewsB: 89, clicksB: 31, leadsB: 8 },
    { date: "2 Eyl",  viewsA: 90, clicksA: 20, leadsA: 6, viewsB: 92, clicksB: 34, leadsB: 8 }
  ];

  let cumulativeA = 0;
  let cumulativeB = 0;
  const history = rawHistory.map((item) => {
    cumulativeA += item.leadsA;
    cumulativeB += item.leadsB;
    return {
      date: item.date,
      viewsA: item.viewsA,
      clicksA: item.clicksA ?? Math.round(item.viewsA * 0.23),
      leadsA: item.leadsA,
      viewsB: item.viewsB,
      clicksB: item.clicksB ?? Math.round(item.viewsB * 0.35),
      leadsB: item.leadsB,
      cumLeadsA: cumulativeA,
      cumLeadsB: cumulativeB
    };
  });

  // Actionable Insights
  const summaryInsights: string[] = [];
  if (winnerVariant === "B") {
    summaryInsights.push(
      `🏆 Varyasyon B, toplam ${leadsB} müşteri talebi elde ederek Varyasyon A'ya göre +${leadDifference} adet daha fazla lead üretmiştir (%${leadLiftPercent} performans artışı).`
    );
    summaryInsights.push(
      `💡 Varyasyon B'nin CTA tıklama oranı %${ctrB.toFixed(1)} iken Varyasyon A %${ctrA.toFixed(1)} seviyesinde kalmıştır. Başlıktaki aciliyet ve net indirim vurgusu ziyaretçileri doğrudan harekete geçirmektedir.`
    );
    if (confidencePercent >= 95) {
      summaryInsights.push(
        `✅ İstatistiki Güven Seviyesi %${confidencePercent}. Bu test sonucuna güvenerek Varyasyon B'yi ana site hero alanı olarak kalıcı yayına alabilirsiniz.`
      );
    } else {
      summaryInsights.push(
        `📊 Güven Seviyesi %${confidencePercent}. Güçlü bir kazanma eğilimi mevcut, 100+ ilave gösterim sonrasında nihai karar kesinleşecektir.`
      );
    }
  } else if (winnerVariant === "A") {
    summaryInsights.push(
      `🏆 Varyasyon A (Kontrol), toplam ${leadsA} müşteri talebi elde ederek Varyasyon B'ye göre +${leadDifference} lead önde yer almaktadır (%${leadLiftPercent} üstünlük).`
    );
    summaryInsights.push(
      `💡 Güven ve kurumsal deneyim vurgusu yapan orijinal karşılama mesajı sektörünüzde daha yüksek form doldurma oranı sağlamaktadır.`
    );
  } else {
    summaryInsights.push(
      `⚖️ Her iki varyasyon da ${leadsA} müşteri talebi ile başa baş gitmektedir. Test henüz devam etmekte olup daha net bir ayrışma için trafik akışı sürdürülmelidir.`
    );
  }

  const experiment: AbTestExperiment = {
    enabled: ab?.enabled ?? true,
    testName: ab?.testName || "Ana Sayfa Hero & Dönüşüm Testi",
    status: ab?.status || "active",
    trafficSplit: ab?.trafficSplit ?? 50,
    startedAt: ab?.startedAt || "28 Ağustos 2026",
    winnerVariant: winnerVariant !== "tie" ? winnerVariant : null,
    variationA: variantA,
    variationB: variantB,
    stats: {
      variantA: { views: viewsA, clicks: clicksA, leads: leadsA },
      variantB: { views: viewsB, clicks: clicksB, leads: leadsB },
      history: rawHistory
    }
  };

  return {
    experiment,
    variantA,
    variantB,
    viewsA,
    viewsB,
    clicksA,
    clicksB,
    leadsA,
    leadsB,
    ctrA,
    ctrB,
    leadRateA,
    leadRateB,
    clickToLeadA,
    clickToLeadB,
    winnerVariant,
    leadDifference,
    leadLiftPercent,
    confidencePercent,
    isStatisticallySignificant,
    funnelStages,
    history,
    summaryInsights
  };
}

/**
 * Applies the winning variant to the live SiteConfig hero section and marks the winner.
 */
export function applyWinningVariantToLiveHero(
  config: SiteConfig,
  winningVariantId: "A" | "B"
): SiteConfig {
  const analysis = getAbTestConversionAnalysis(config);
  const winner = winningVariantId === "A" ? analysis.variantA : analysis.variantB;

  const updatedHero = {
    ...config.hero,
    badge: winner.badge || config.hero?.badge,
    title: winner.title || config.hero?.title,
    subtitle: winner.subtitle || config.hero?.subtitle,
    ctaPrimaryText: winner.ctaPrimaryText || config.hero?.ctaPrimaryText,
    ctaPrimaryLink: winner.ctaPrimaryLink || config.hero?.ctaPrimaryLink,
    ctaSecondaryText: winner.ctaSecondaryText || config.hero?.ctaSecondaryText,
    ctaSecondaryLink: winner.ctaSecondaryLink || config.hero?.ctaSecondaryLink,
    bgImage: winner.bgImage || config.hero?.bgImage
  };

  const updatedAb: AbTestExperiment = {
    ...analysis.experiment,
    status: "completed",
    winnerVariant: winningVariantId,
    winningVariant: winningVariantId,
    trafficSplit: winningVariantId === "A" ? 100 : 0
  };

  return {
    ...config,
    hero: updatedHero,
    abTesting: updatedAb
  };
}

/**
 * Adds a simulated lead or view to the test for live experimentation and testing.
 */
export function recordSimulatedAbLead(
  config: SiteConfig,
  variant: "A" | "B"
): SiteConfig {
  const analysis = getAbTestConversionAnalysis(config);
  const currentAb = analysis.experiment;

  const prevStats = currentAb.stats || {
    variantA: { views: analysis.viewsA, clicks: analysis.clicksA, leads: analysis.leadsA },
    variantB: { views: analysis.viewsB, clicks: analysis.clicksB, leads: analysis.leadsB },
    history: analysis.history
  };

  const target = variant === "A" ? "variantA" : "variantB";
  const updatedVariantStats = {
    ...prevStats[target],
    views: prevStats[target].views + 1,
    clicks: (prevStats[target].clicks || 0) + 1,
    leads: prevStats[target].leads + 1
  };

  const updatedAb: AbTestExperiment = {
    ...currentAb,
    stats: {
      ...prevStats,
      [target]: updatedVariantStats
    }
  };

  return {
    ...config,
    abTesting: updatedAb
  };
}
