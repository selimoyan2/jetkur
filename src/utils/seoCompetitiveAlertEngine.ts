import { 
  SiteConfig, 
  CompetitorKeywordRanking, 
  CompetitorContentMetric,
  SeoCompetitiveAlert, 
  SeoCompetitiveAlertSettings, 
  CompetitiveAlertSummary,
  CompetitiveAlertSeverity,
  CompetitiveAlertCategory
} from "../types";
import { generateFallbackCompetitiveSeo } from "./competitiveSeoUtils";

const LOCAL_STORAGE_ALERTS_KEY = "hizliweb_seo_competitive_alerts";
const LOCAL_STORAGE_SETTINGS_KEY = "hizliweb_seo_competitive_alert_settings";
const LOCAL_STORAGE_SNAPSHOT_KEY = "hizliweb_seo_competitive_rankings_snapshot";

export const DEFAULT_ALERT_SETTINGS: SeoCompetitiveAlertSettings = {
  browserPushEnabled: true,
  inAppToastEnabled: true,
  audioCueEnabled: true,
  alertOnAnyOvertake: true,
  alertOnTop3Loss: true,
  alertOnHighVolumeOnly: false,
  minimumRankGap: 1,
  alertOnVolumeSpike: true,
  volumeSpikeThresholdPercent: 35,
  autoCheckIntervalHours: 6
};

/**
 * Generates or derives SEO Competitive Alerts by evaluating current rankings against top competitors.
 */
export function evaluateCompetitiveRankings(
  config: SiteConfig,
  customRankings?: CompetitorKeywordRanking[],
  customCompetitors?: CompetitorContentMetric[],
  settings: SeoCompetitiveAlertSettings = DEFAULT_ALERT_SETTINGS
): SeoCompetitiveAlert[] {
  const fallbackData = generateFallbackCompetitiveSeo(config);
  const rankings = customRankings && customRankings.length > 0 ? customRankings : (fallbackData.keywordRankings || []);
  const competitors = customCompetitors && customCompetitors.length > 0 ? customCompetitors : fallbackData.competitors;

  const comp1 = competitors[0] || { name: "Lider Rakip A", domain: "rakip1.com" };
  const comp2 = competitors[1] || { name: "Bölgesel Rakip B", domain: "rakip2.com" };
  const comp3 = competitors[2] || { name: "Sektörel Rakip C", domain: "rakip3.com" };

  const alerts: SeoCompetitiveAlert[] = [];
  const now = new Date();

  rankings.forEach((kr, index) => {
    const userRank = kr.userRank;
    
    // Determine the best competitor on this keyword
    const compRanks = [
      { name: comp1.name, domain: comp1.domain, rank: kr.comp1Rank },
      { name: comp2.name, domain: comp2.domain, rank: kr.comp2Rank },
      { name: comp3.name, domain: comp3.domain, rank: kr.comp3Rank }
    ].filter(c => c.rank !== null && c.rank !== undefined) as { name: string; domain: string; rank: number }[];

    if (compRanks.length === 0) return;

    // Sort by best (lowest) rank
    compRanks.sort((a, b) => a.rank - b.rank);
    const bestComp = compRanks[0];

    const volumeNum = parseInt(kr.monthlyVolume.replace(/[^0-9]/g, ""), 10) * (kr.monthlyVolume.includes("K") ? 1000 : 1) || 1500;
    if (settings.alertOnHighVolumeOnly && volumeNum < 2500) {
      return;
    }

    const rankGap = userRank === null ? (20 - bestComp.rank) : (userRank - bestComp.rank);

    // Calculate simulated volume surge metrics for realism
    const surgeMultiplier = 1 + ((index * 29 + 45) % 115) / 100; // e.g. +45% to +145%
    const prevVol = Math.round(volumeNum / surgeMultiplier);
    const volumeChangePct = Math.round(((volumeNum - prevVol) / prevVol) * 100);
    const sparkline = [
      prevVol,
      Math.round(prevVol * 1.12),
      Math.round(prevVol * 1.25),
      Math.round(prevVol * 1.5),
      volumeNum
    ];
    const isExtremeSurge = volumeChangePct >= (settings.volumeSpikeThresholdPercent || 35);

    // Scenario 0: Sudden Search Volume Spike & Competitor Dominance (volume_spike / competitor_volume_hijack)
    if (settings.alertOnVolumeSpike && isExtremeSurge && bestComp.rank <= 3 && (userRank === null || userRank > bestComp.rank)) {
      const timeDiffMinutes = (index * 12 + 15) % 120;
      const detectedDate = new Date(now.getTime() - timeDiffMinutes * 60 * 1000).toISOString();

      alerts.push({
        id: `alert-vol-spike-${kr.id}`,
        keyword: kr.keyword,
        monthlyVolume: kr.monthlyVolume,
        searchIntent: kr.searchIntent,
        competitorName: bestComp.name,
        competitorDomain: bestComp.domain,
        userRank: userRank,
        competitorRank: bestComp.rank,
        previousUserRank: userRank,
        previousCompetitorRank: bestComp.rank + 1,
        rankDelta: rankGap,
        userRankChange: userRank ? -1 : null,
        competitorRankChange: +2,
        volumeChangePercentage: volumeChangePct,
        previousMonthlyVolume: `${(prevVol / 1000).toFixed(1)}K / ay`,
        currentMonthlyVolume: kr.monthlyVolume,
        volumeTrendSparkline: sparkline,
        volatilityLevel: volumeChangePct > 90 ? "extreme" : "high",
        competitorTrafficShare: `%${Math.min(75, 40 + (3 - bestComp.rank) * 15)} SERP Tıklama Payı`,
        severity: volumeChangePct > 90 ? "critical" : "warning",
        category: "volume_spike",
        title: `⚡ Ani Hacim Patlaması (+%${volumeChangePct}): "${kr.keyword}" aramasında ${bestComp.name} trafiği topluyor!`,
        description: `Bu anahtar kelimenin arama hacmi ${((prevVol / 1000)).toFixed(1)}K'dan ${kr.monthlyVolume}'e fırladı. ${bestComp.name} #${bestComp.rank} sırada konumlanarak artan arama talebini kendine çekiyor. Siteniz ${userRank ? `#${userRank}` : 'ilk 20 dışında'}.`,
        trafficLossEstimate: `Tahmini -${Math.round(volumeNum * 0.24)} Aylık Kaçırılan Tıklama Riski`,
        detectedAt: detectedDate,
        isRead: false,
        status: "active",
        rootCause: `Bölgesel acil talep artışı ve rakibin "${kr.keyword}" odaklı başlık & şema güncellemeleri ani hacim dalgasında öne çıkmasını sağladı.`,
        recommendedAction: {
          type: "blog",
          label: "Acil Karşı İçerik Yayınla",
          description: `AI Blog Engine ile "${kr.keyword}" aramasına özel yüksek dönüşümlü makale oluşturarak artan hacimden pay alın.`,
          targetTab: "ai-blog-engine",
          prefillKeyword: kr.keyword,
          prefillDraftTitle: `${config.city || 'Bölgesel'} En Hızlı ${kr.keyword} Çözümleri (2026 Güncel)`
        },
        serpFeatures: kr.serpFeatures
      });
      return;
    }

    // Scenario 1: Competitor took #1 or user lost #1
    if (bestComp.rank === 1 && (userRank === null || userRank > 1)) {
      const severity: CompetitiveAlertSeverity = "critical";
      const category: CompetitiveAlertCategory = userRank && userRank <= 3 ? "lost_number_one" : "overtaken";
      
      const timeDiffMinutes = (index * 17) % 180; // realistic staggered timestamp
      const detectedDate = new Date(now.getTime() - timeDiffMinutes * 60 * 1000).toISOString();

      alerts.push({
        id: `alert-overtaken-${kr.id}`,
        keyword: kr.keyword,
        monthlyVolume: kr.monthlyVolume,
        searchIntent: kr.searchIntent,
        competitorName: bestComp.name,
        competitorDomain: bestComp.domain,
        userRank: userRank,
        competitorRank: bestComp.rank,
        previousUserRank: userRank !== null && userRank <= 3 ? 1 : (userRank ? userRank - 1 : null),
        previousCompetitorRank: bestComp.rank + 2,
        rankDelta: rankGap,
        userRankChange: userRank && userRank <= 3 ? -2 : -1,
        competitorRankChange: +2,
        severity,
        category,
        title: `🚨 ${bestComp.name}, "${kr.keyword}" aramasında #1. sıraya yükselerek sitenizin önüne geçti!`,
        description: `Birincil anahtar kelimenizde rakip Google SERP'te 1. sırayı aldı. Siteniz şu an ${userRank ? `#${userRank}` : 'ilk 20 dışında'}. Bu kelimede acil tıklama kaybı riski oluştu.`,
        trafficLossEstimate: `Tahmini -${Math.round(volumeNum * 0.18)} Aylık Tıklama Riski`,
        detectedAt: detectedDate,
        isRead: false,
        status: "active",
        rootCause: "Rakip semt bazlı zengin H2 başlıkları, güncel 2026 fiyat listesi ve Google Haritalar (Local 3-Pack) entegrasyonu sağladı.",
        recommendedAction: {
          type: "blog",
          label: "Karşı Blog İçeriği Üret",
          description: `"${kr.keyword}" odağında yüksek CTR'lı ve rakip eksiklerini kapatan kapsamlı bir makale yayınlayın.`,
          targetTab: "ai-blog-engine",
          prefillKeyword: kr.keyword,
          prefillDraftTitle: `${config.city || 'Bölgenizde'} En İyi ${kr.keyword} Hizmeti: 2026 Fiyat ve Kalite Rehberi`
        },
        serpFeatures: kr.serpFeatures
      });
      return;
    }

    // Scenario 2: User fell out of Top 3 (lost_top3) while competitor is in Top 3
    if (userRank !== null && userRank > 3 && bestComp.rank <= 3) {
      const timeDiffMinutes = (index * 25 + 40) % 240;
      const detectedDate = new Date(now.getTime() - timeDiffMinutes * 60 * 1000).toISOString();

      alerts.push({
        id: `alert-top3-${kr.id}`,
        keyword: kr.keyword,
        monthlyVolume: kr.monthlyVolume,
        searchIntent: kr.searchIntent,
        competitorName: bestComp.name,
        competitorDomain: bestComp.domain,
        userRank: userRank,
        competitorRank: bestComp.rank,
        previousUserRank: 3,
        previousCompetitorRank: bestComp.rank + 1,
        rankDelta: rankGap,
        userRankChange: -(userRank - 3),
        competitorRankChange: +1,
        severity: "critical",
        category: "lost_top3",
        title: `⚠️ İlk 3 Sıra Kaybı: "${kr.keyword}" aramasında ${bestComp.name} öne geçti`,
        description: `Siteniz Google ilk 3 sıra (veya yerel harita paketi) görünürlüğünden geriledi (#${userRank}). Rakip #${bestComp.rank} sırada yer alıyor.`,
        trafficLossEstimate: `Tahmini -${Math.round(volumeNum * 0.12)} Aylık Tıklama Kaybı`,
        detectedAt: detectedDate,
        isRead: false,
        status: "active",
        rootCause: "Rakibin mobil sayfa yükleme hızı ve FAQ Schema.org yapılandırılmış verileri snippet alanını kazandı.",
        recommendedAction: {
          type: "meta",
          label: "Meta Başlık & Açıklamayı Güçlendir",
          description: "AI Meta-Optimizer ile tıklama oranını (CTR) artıracak acil durum ve fiyat avantajlı meta verileri uygulayın.",
          targetTab: "ai-meta-optimizer",
          prefillKeyword: kr.keyword
        },
        serpFeatures: kr.serpFeatures
      });
      return;
    }

    // Scenario 3: General Overtake (userRank > bestComp.rank by threshold)
    if (userRank !== null && rankGap >= settings.minimumRankGap && settings.alertOnAnyOvertake) {
      const timeDiffMinutes = (index * 30 + 70) % 360;
      const detectedDate = new Date(now.getTime() - timeDiffMinutes * 60 * 1000).toISOString();

      alerts.push({
        id: `alert-overtaken-${kr.id}`,
        keyword: kr.keyword,
        monthlyVolume: kr.monthlyVolume,
        searchIntent: kr.searchIntent,
        competitorName: bestComp.name,
        competitorDomain: bestComp.domain,
        userRank: userRank,
        competitorRank: bestComp.rank,
        previousUserRank: userRank,
        previousCompetitorRank: bestComp.rank + 2,
        rankDelta: rankGap,
        userRankChange: 0,
        competitorRankChange: +2,
        severity: "warning",
        category: "overtaken",
        title: `📉 Sıralama Uyarısı: ${bestComp.name}, "${kr.keyword}" aramasında ${rankGap} sıra önünüzde`,
        description: `Rakip #${bestComp.rank} sırada konumlanırken, siteniz #${userRank} sırada yer alıyor. Organik müşteri trafiğini korumak için içerik tazeleme önerilir.`,
        trafficLossEstimate: `Tahmini -${Math.round(volumeNum * 0.08)} Aylık Potansiyel Trafik`,
        detectedAt: detectedDate,
        isRead: false,
        status: "active",
        rootCause: "Rakip sayfa içi kelime yoğunluğunu ve müşteri değerlendirme zengin snippet'larını optimize etti.",
        recommendedAction: {
          type: "schema",
          label: "Local Business Şemasını Güçlendir",
          description: "Local Business ve Review Schema ile arama motorlarında yıldızlı puan görünümünü aktifleştirin.",
          targetTab: "local-seo-schema",
          prefillKeyword: kr.keyword
        },
        serpFeatures: kr.serpFeatures
      });
      return;
    }

    // Scenario 4: User is completely unranked (userRank === null) but keyword is high volume
    if (userRank === null && bestComp.rank <= 5) {
      const timeDiffMinutes = (index * 45 + 120) % 480;
      const detectedDate = new Date(now.getTime() - timeDiffMinutes * 60 * 1000).toISOString();

      alerts.push({
        id: `alert-missing-${kr.id}`,
        keyword: kr.keyword,
        monthlyVolume: kr.monthlyVolume,
        searchIntent: kr.searchIntent,
        competitorName: bestComp.name,
        competitorDomain: bestComp.domain,
        userRank: null,
        competitorRank: bestComp.rank,
        previousUserRank: null,
        previousCompetitorRank: bestComp.rank,
        rankDelta: 20 - bestComp.rank,
        severity: "opportunity",
        category: "high_volume_threat",
        title: `🎯 Kritik İçerik Boşluğu: "${kr.keyword}" aramasında rakip #${bestComp.rank}, siz ilk 20'de yoksunuz`,
        description: `Aylık ${kr.monthlyVolume} aranma hacmine sahip bu kritik terimde ${bestComp.name} üst sıralarda ciro topluyor. Sayfanızda bu anahtar kelimeye özel bir iniş sayfası (landing page) veya blog eksik.`,
        trafficLossEstimate: `Kaçırılan Fırsat: +${Math.round(volumeNum * 0.22)} Ziyaretçi / ay`,
        detectedAt: detectedDate,
        isRead: false,
        status: "active",
        rootCause: "Sitenizde bu konuyu doğrudan işleyen bir başlık veya ayrı hizmet sayfası henüz indekslenmemiş.",
        recommendedAction: {
          type: "blog",
          label: "Hemen Hedef Makale Oluştur",
          description: "AI Blog Engine ile 2 dakikada SEO uyumlu başlık ve içerik taslağını oluşturun.",
          targetTab: "ai-blog-engine",
          prefillKeyword: kr.keyword,
          prefillDraftTitle: `${kr.keyword}: Bilmeniz Gerekenler ve Profesyonel İpuçları`
        },
        serpFeatures: kr.serpFeatures
      });
    }
  });

  return alerts;
}

/**
 * Load stored alerts from localStorage or fallback to evaluation
 */
export function loadCompetitiveAlerts(config?: SiteConfig): SeoCompetitiveAlert[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not load competitive alerts from localStorage:", err);
  }

  // Generate initial set if config is provided
  if (config) {
    const initial = evaluateCompetitiveRankings(config);
    saveCompetitiveAlerts(initial);
    return initial;
  }
  return [];
}

/**
 * Persist alerts to localStorage
 */
export function saveCompetitiveAlerts(alerts: SeoCompetitiveAlert[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.warn("Could not save competitive alerts to localStorage:", err);
  }
}

/**
 * Load settings from localStorage
 */
export function loadCompetitiveAlertSettings(): SeoCompetitiveAlertSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn("Could not load competitive alert settings:", err);
  }
  return DEFAULT_ALERT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
export function saveCompetitiveAlertSettings(settings: SeoCompetitiveAlertSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Could not save competitive alert settings:", err);
  }
}

/**
 * Marks an alert as read (supports both (alerts, alertId) and (alertId))
 */
export function markAlertAsRead(arg1: SeoCompetitiveAlert[] | string, arg2?: string): SeoCompetitiveAlert[] {
  let list: SeoCompetitiveAlert[];
  let idToMark: string;
  if (typeof arg1 === "string") {
    idToMark = arg1;
    list = loadCompetitiveAlerts();
  } else {
    list = arg1;
    idToMark = arg2 || "";
  }
  const updated = list.map(a => a.id === idToMark ? { ...a, isRead: true } : a);
  saveCompetitiveAlerts(updated);
  return updated;
}

/**
 * Marks all alerts as read
 */
export function markAllAlertsAsRead(alerts: SeoCompetitiveAlert[]): SeoCompetitiveAlert[] {
  const updated = alerts.map(a => ({ ...a, isRead: true }));
  saveCompetitiveAlerts(updated);
  return updated;
}

/**
 * Marks an alert as resolved (counter-action taken)
 */
export function markAlertAsResolved(alerts: SeoCompetitiveAlert[], alertId: string): SeoCompetitiveAlert[] {
  const updated = alerts.map(a => a.id === alertId ? { ...a, status: "resolved" as const, isRead: true } : a);
  saveCompetitiveAlerts(updated);
  return updated;
}

/**
 * Dismisses an alert
 */
export function dismissAlert(alerts: SeoCompetitiveAlert[], alertId: string): SeoCompetitiveAlert[] {
  const updated = alerts.map(a => a.id === alertId ? { ...a, status: "dismissed" as const, isRead: true } : a);
  saveCompetitiveAlerts(updated);
  return updated;
}

/**
 * Computes high-level KPI metrics for the alert dashboard
 */
export function calculateAlertSummary(alerts: SeoCompetitiveAlert[], config?: SiteConfig): CompetitiveAlertSummary {
  const activeAlerts = alerts.filter(a => a.status === "active");
  const unreadCount = activeAlerts.filter(a => !a.isRead).length;
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const outrankedCount = activeAlerts.filter(a => a.userRank === null || (a.competitorRank < a.userRank)).length;

  // Determine top competitor outranking the user most frequently
  const compCountMap: Record<string, number> = {};
  activeAlerts.forEach(a => {
    compCountMap[a.competitorName] = (compCountMap[a.competitorName] || 0) + 1;
  });

  let topThreat = "Lider Rakip";
  let maxCount = 0;
  Object.entries(compCountMap).forEach(([comp, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topThreat = comp;
    }
  });

  // Calculate potential traffic at risk
  let totalRisk = 0;
  activeAlerts.forEach(a => {
    const match = a.trafficLossEstimate.match(/\d+/);
    if (match) {
      totalRisk += parseInt(match[0], 10);
    }
  });

  // Protected rankings count (where user is #1 or leads)
  let protectedCount = 5;
  if (config) {
    const fallback = generateFallbackCompetitiveSeo(config);
    protectedCount = (fallback.keywordRankings || []).filter(kr => kr.userRank === 1 || (kr.userRank !== null && kr.gap < 0)).length;
  }

  return {
    totalAlerts: alerts.length,
    activeCount: activeAlerts.length,
    unreadCount,
    criticalCount,
    outrankedCount,
    outrankedKeywordsCount: outrankedCount,
    topThreatCompetitor: topThreat,
    potentialTrafficAtRisk: `-${totalRisk.toLocaleString("tr-TR")} / ay`,
    protectedRankingsCount: protectedCount
  };
}

/**
 * Plays a pleasant, subtle Web Audio API chime when an alert or test notification fires
 */
export function playAlertChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2 (Higher note for pleasant alert)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, now + 0.09); // A5
    gain2.gain.setValueAtTime(0.09, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.55);
  } catch (err) {
    // Non-blocking fallback
  }
}

/**
 * Checks Notification permission status safely
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Requests browser Web Push notification permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn("Browser push permission request failed (likely iframe restriction):", err);
    return Notification.permission || "default";
  }
}

/**
 * Dispatches a native browser push notification if permitted
 */
export async function triggerBrowserPushNotification(alert: SeoCompetitiveAlert): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  try {
    if (Notification.permission === "granted") {
      const n = new Notification(alert.title, {
        body: `${alert.description} ${alert.trafficLossEstimate}`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: alert.id
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };

      return true;
    }
  } catch (err) {
    console.warn("Native Notification trigger error:", err);
  }
  return false;
}

/**
 * Simulates a fresh SERP rank monitor check that can detect sudden competitor ranking shifts
 */
export function simulateRankingShift(
  config: SiteConfig, 
  existingAlerts: SeoCompetitiveAlert[]
): {
  newAlert: SeoCompetitiveAlert;
  updatedAlerts: SeoCompetitiveAlert[];
} {
  const fallback = generateFallbackCompetitiveSeo(config);
  const comp = fallback.competitors[0] || { name: "Pro Hizmetler A.Ş.", domain: "prohizmet.com" };
  const freshKeyword = `${config.city || 'Bölgesel'} 7/24 ${config.sector || 'Hizmet'} Acil Servis`;

  const newAlert: SeoCompetitiveAlert = {
    id: `alert-shift-${Date.now()}`,
    keyword: freshKeyword,
    monthlyVolume: "5.4K / ay",
    searchIntent: "Acil / Yerel",
    competitorName: comp.name,
    competitorDomain: comp.domain,
    userRank: 4,
    competitorRank: 1,
    previousUserRank: 2,
    previousCompetitorRank: 3,
    rankDelta: 3,
    userRankChange: -2,
    competitorRankChange: +2,
    severity: "critical",
    category: "overtaken",
    title: `🚨 Canlı SERP Uyarısı: ${comp.name}, "${freshKeyword}" aramasında sitenizi geçerek #1 oldu!`,
    description: `Google canlı arama taramasında ${comp.name} 2 basamak yükselerek #1. sıraya oturdu. Siteniz #2'den #4'e geriledi.`,
    trafficLossEstimate: "Tahmini -390 Aylık Tıklama Kaybı",
    detectedAt: new Date().toISOString(),
    isRead: false,
    status: "active",
    rootCause: "Rakip, güncellenmiş müşteri incelemeleri ve hızlı mobil açılış sayfalarıyla öne çıktı.",
    recommendedAction: {
      type: "blog",
      label: "Karşı Blog Yazısı Yayınla",
      description: "AI Blog Engine ile bu anahtar kelimede hızla otoriter bir makale hazırlayın.",
      targetTab: "ai-blog-engine",
      prefillKeyword: freshKeyword,
      prefillDraftTitle: `${freshKeyword} - Güvenilir ve Garantili Çözümler`
    }
  };

  const updatedAlerts = [newAlert, ...existingAlerts];
  saveCompetitiveAlerts(updatedAlerts);

  return { newAlert, updatedAlerts };
}

/**
 * Simulates a sudden surge/spike in competitor keyword search volume and sends a real-time notification
 */
export function simulateVolumeSpikeAlert(
  config: SiteConfig,
  existingAlerts: SeoCompetitiveAlert[]
): {
  newAlert: SeoCompetitiveAlert;
  updatedAlerts: SeoCompetitiveAlert[];
} {
  const fallback = generateFallbackCompetitiveSeo(config);
  const comp = fallback.competitors[0] || { name: "Lider Rakip A", domain: "rakip1.com" };
  const sectorTerm = config.sector || "Oto Kurtarıcı & Çekici";
  const city = config.city || "İstanbul";

  const volumeSurges = [
    {
      keyword: `En Yakın 7/24 ${sectorTerm}`,
      prev: 2800,
      curr: 6900,
      pct: 146,
      intent: "Acil / Yerel" as const,
      sparkline: [2800, 3100, 3700, 5200, 6900]
    },
    {
      keyword: `${city} Acil ${sectorTerm} Fiyatları 2026`,
      prev: 1900,
      curr: 4600,
      pct: 142,
      intent: "Ticari" as const,
      sparkline: [1900, 2200, 2800, 3700, 4600]
    },
    {
      keyword: `Garantili ${sectorTerm} Hizmeti ${city}`,
      prev: 3200,
      curr: 7800,
      pct: 143,
      intent: "İşlemsel" as const,
      sparkline: [3200, 3600, 4400, 6100, 7800]
    }
  ];

  // Pick random or cycle
  const picked = volumeSurges[Math.floor(Math.random() * volumeSurges.length)];

  const newAlert: SeoCompetitiveAlert = {
    id: `alert-vol-spike-${Date.now()}`,
    keyword: picked.keyword,
    monthlyVolume: `${(picked.curr / 1000).toFixed(1)}K / ay`,
    previousMonthlyVolume: `${(picked.prev / 1000).toFixed(1)}K / ay`,
    currentMonthlyVolume: `${(picked.curr / 1000).toFixed(1)}K / ay`,
    volumeChangePercentage: picked.pct,
    volumeTrendSparkline: picked.sparkline,
    volatilityLevel: "extreme",
    competitorTrafficShare: "%64 SERP Trafik Payı",
    searchIntent: picked.intent,
    competitorName: comp.name,
    competitorDomain: comp.domain,
    userRank: 5,
    competitorRank: 1,
    previousUserRank: 3,
    previousCompetitorRank: 2,
    rankDelta: 4,
    userRankChange: -2,
    competitorRankChange: +1,
    severity: "critical",
    category: "volume_spike",
    title: `⚡ [ANİ HACİM ALARMI +%${picked.pct}] "${picked.keyword}" aramasında arama hacmi fırladı!`,
    description: `Arama hacmi son 48 saatte ${(picked.prev / 1000).toFixed(1)}K'dan ${(picked.curr / 1000).toFixed(1)}K'ya (+%${picked.pct}) fırladı! ${comp.name} #1 sırada tüm ani talebi toplarken, siteniz #5'e geriledi.`,
    trafficLossEstimate: `Tahmini -${Math.round(picked.curr * 0.28)} Kaçırılan Aylık Tıklama Riski`,
    detectedAt: new Date().toISOString(),
    isRead: false,
    status: "active",
    rootCause: `Bölgesel acil talep patlaması ve rakibin zengin snippet / hızlı mobil açılış sayfası güncellemesi.`,
    recommendedAction: {
      type: "blog",
      label: "Hemen Karşı Blog Yazısı Yayınla",
      description: `AI Blog Engine ile "${picked.keyword}" aramasında anında otoriter ve yüksek CTR'lı bir makale oluşturun.`,
      targetTab: "ai-blog-engine",
      prefillKeyword: picked.keyword,
      prefillDraftTitle: `${city} ${picked.keyword} - 7/24 Kesintisiz Profesyonel Çözümler`
    }
  };

  const updatedAlerts = [newAlert, ...existingAlerts];
  saveCompetitiveAlerts(updatedAlerts);

  return { newAlert, updatedAlerts };
}

/**
 * Dispatches audio chime, in-app toast, and native browser push notification
 */
export async function dispatchCompetitiveAlertNotification(
  alert: SeoCompetitiveAlert,
  settings: SeoCompetitiveAlertSettings
): Promise<void> {
  if (settings.audioCueEnabled) {
    playAlertChime();
  }
  if (settings.browserPushEnabled) {
    await triggerBrowserPushNotification(alert);
  }
}

