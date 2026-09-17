import { SiteConfig } from "../types";

export interface CompetitorKeywordRankingEntry {
  id: string;
  competitorId: string;
  competitorName: string;
  rank: number; // 1 to 20+, 1 is best
  url: string;
  change: number; // e.g. +2, 0, -1
  serpFeatures: string[]; // e.g. ["Local Pack", "Snippet", "Sitelinks"]
}

export interface MarketShareKeywordItem {
  id: string;
  keyword: string;
  searchIntent: "Ticari" | "Bilgilendirici" | "Acil / Yerel" | "İşlemsel" | "Fiyat & Maliyet" | "Marka / Güven";
  monthlySearchVolume: number;
  monthlyVolumeFormatted: string; // e.g. "14.2K"
  cpcValue: string; // e.g. "₺38.50"
  seoDifficulty: number; // 0-100
  difficultyLabel: "Kolay" | "Orta" | "Zor" | "Kritik";
  userRank: number; // 1-20+, 0 if not ranked
  userRankChange: number; // e.g. +3
  userEstimatedClicks: number;
  category: "Temel Hizmet" | "Acil & 7/24" | "Fiyat & Maliyet" | "Bölgesel / İlçe" | "Marka / Güven";
  competitorRankings: CompetitorKeywordRankingEntry[];
  bestCompetitor: {
    name: string;
    rank: number;
  };
  gapToLeader: number; // userRank - bestRank (e.g. 3 - 1 = 2 spots behind)
  opportunityScore: number; // 0-100 calculated from volume, difficulty & ranking gap
  trafficPotentialGain: string; // e.g. "+680 Ziyaret / Ay"
  actionableTactic: string;
}

export interface MarketShareCompetitorProfile {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  color: string;
  strokeColor: string;
  marketSharePercent: number; // 0-100
  estimatedOrganicTraffic: number;
  totalRankedKeywords: number;
  top3Count: number;
  top10Count: number;
  avgRanking: number; // average ranking position
  visibilityScore: number; // 0-100 weighted by rank & volume
  domainAuthority: number; // 0-100
  siteSpeedScore: number; // 0-100
  strengths: string[];
  vulnerabilities: string[];
}

export interface MarketShareAnalysisData {
  analyzedAt: string;
  sector: string;
  city: string;
  totalMarketSearchVolume: number;
  totalMarketSearchVolumeFormatted: string;
  userMarketShare: number;
  userMarketRank: number;
  competitors: MarketShareCompetitorProfile[];
  keywords: MarketShareKeywordItem[];
  userProfile: MarketShareCompetitorProfile;
  leaderProfile: MarketShareCompetitorProfile;
  summary: {
    topKeywordWins: number;
    headToHeadBattles: number;
    highPotentialGaps: number;
    immediateTrafficBoostOpportunity: string;
    keyTakeaway: string;
  };
}

/**
 * Generates market share, keyword performance, and Google ranking comparative data
 * grounded in the active site's sector, city, and content assets.
 */
export function generateMarketShareCompetitorData(config: SiteConfig): MarketShareAnalysisData {
  const companyName = config.companyName || "Bizim İşletme";
  const sector = config.sector || "Oto Çekici & Kurtarıcı";
  const city = config.city || "İstanbul";
  const domain =
    config.cloudflare?.customDomain ||
    (config.cloudflare?.subdomain
      ? `${config.cloudflare?.subdomain}.hizliweb.site`
      : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`);

  // Asset counts for realistic dynamic scaling
  const blogCount = config.blog?.items?.length || 0;
  const serviceCount = config.services?.items?.length || 0;
  const hasFaq = (config.faqs?.items?.length || 0) > 0;
  const hasCustomDomain = Boolean(config.cloudflare?.customDomain);

  // Dynamic user performance boost
  const userDa = hasCustomDomain ? Math.min(82, 45 + blogCount * 3) : 38;
  const userSpeed = 96; // Edge CDN
  const userTop3Count = Math.min(68, 14 + serviceCount * 4 + blogCount * 3);
  const userTop10Count = Math.min(180, 42 + serviceCount * 12 + blogCount * 8);
  const userTotalKw = Math.min(480, 110 + serviceCount * 28 + blogCount * 22);
  const userTraffic = 5400 + blogCount * 420 + serviceCount * 310;
  const userMarketShare = Math.min(38.5, Math.max(16.5, 21.0 + blogCount * 1.5 + (hasCustomDomain ? 3 : 0)));

  // Competitor Profiles
  const userProfile: MarketShareCompetitorProfile = {
    id: "user-entity",
    name: `${companyName} (Siz)`,
    domain,
    isUser: true,
    color: "#6366f1", // Indigo 500
    strokeColor: "#4338ca", // Indigo 700
    marketSharePercent: Number(userMarketShare.toFixed(1)),
    estimatedOrganicTraffic: userTraffic,
    totalRankedKeywords: userTotalKw,
    top3Count: userTop3Count,
    top10Count: userTop10Count,
    avgRanking: Number((4.2 - (blogCount > 2 ? 0.8 : 0)).toFixed(1)),
    visibilityScore: Math.min(94, 72 + blogCount * 2 + serviceCount * 2),
    domainAuthority: userDa,
    siteSpeedScore: userSpeed,
    strengths: [
      "0.02s Cloudflare Edge CDN & Anında Yükleme Hızı",
      "Kusursuz Mobil Deneyim & Doğrudan WhatsApp/Telefon Çağrı CTA'ları",
      "Zengin Yerel Hizmet & Semt Açılış Sayfaları"
    ],
    vulnerabilities: [
      blogCount < 3 ? "Rehber blog içerik havuzu henüz liderin gerisinde" : "Yeni backlink ediniminde artış gerekiyor"
    ]
  };

  const comp1Leader: MarketShareCompetitorProfile = {
    id: "comp-1-leader",
    name: `${city} Lider ${sector.split(" ")[0]} Ltd.`,
    domain: `${city.toLowerCase()}lider${sector.split(" ")[0].toLowerCase()}.com.tr`,
    isUser: false,
    color: "#f59e0b", // Amber 500
    strokeColor: "#b45309", // Amber 700
    marketSharePercent: 32.4,
    estimatedOrganicTraffic: 8900,
    totalRankedKeywords: 540,
    top3Count: 88,
    top10Count: 240,
    avgRanking: 3.1,
    visibilityScore: 88,
    domainAuthority: 58,
    siteSpeedScore: 68,
    strengths: [
      "8 Yıllık Kök Alan Adı Yaşı ve Yüksek Backlink Hacmi",
      "Kapsamlı Sektörel Rehber ve Fiyat Karşılaştırma Yazıları",
      "Google Haritalar 500+ Yorumlu Yerel İşletme Hesabı"
    ],
    vulnerabilities: [
      "Ağır WordPress altyapısı (LCP 3.2s, Düşük CWV)",
      "Mobil dönüşüm butonları yetersiz ve statik formlar"
    ]
  };

  const comp2Speed: MarketShareCompetitorProfile = {
    id: "comp-2-speed",
    name: `Hızlı ${sector.split(" ")[0]} Servisi`,
    domain: `hizli${sector.split(" ")[0].toLowerCase()}servisi.net`,
    isUser: false,
    color: "#06b6d4", // Cyan 500
    strokeColor: "#0e7490", // Cyan 700
    marketSharePercent: 21.8,
    estimatedOrganicTraffic: 4800,
    totalRankedKeywords: 320,
    top3Count: 46,
    top10Count: 145,
    avgRanking: 5.6,
    visibilityScore: 64,
    domainAuthority: 42,
    siteSpeedScore: 78,
    strengths: [
      "Agresif Google Ads ve Hedefli Yerel Arama Stratejisi",
      "Net Fiyat Politikası & Anlık WhatsApp Çözümleri"
    ],
    vulnerabilities: [
      "Düşük İçerik Kalitesi (Kopya Sayfalar ve Düşük Kelime Hacmi)",
      "Yapılandırılmış JSON-LD Şema Eksikliği"
    ]
  };

  const comp3Local: MarketShareCompetitorProfile = {
    id: "comp-3-local",
    name: `Merkez ${sector.split(" ")[0]} 7/24`,
    domain: `merkez${sector.split(" ")[0].toLowerCase()}724.com`,
    isUser: false,
    color: "#ec4899", // Pink 500
    strokeColor: "#be185d", // Pink 700
    marketSharePercent: 14.5,
    estimatedOrganicTraffic: 3100,
    totalRankedKeywords: 210,
    top3Count: 22,
    top10Count: 85,
    avgRanking: 7.8,
    visibilityScore: 48,
    domainAuthority: 34,
    siteSpeedScore: 54,
    strengths: [
      "7/24 Acil Çağrı & Santral Entegrasyonu",
      "Şehir İçi Belirli İlçelerde Yoğun Harita Varlığı"
    ],
    vulnerabilities: [
      "Eski Mobil Arayüz & Güvenlik Başlığı Açıkları",
      "Sayfa Başına 180 Kelime Altı Yetersiz Metin Derinliği"
    ]
  };

  // If user has custom monitored competitors, transform and merge them
  const customCompetitorsList: MarketShareCompetitorProfile[] = (config.monitoredCompetitors || [])
    .filter(c => c.isActive)
    .map((mc, idx) => {
      const paletteColors = ["#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6", "#10b981", "#f97316"];
      const strokeColors = ["#b45309", "#0e7490", "#be185d", "#6d28d9", "#047857", "#c2410c"];
      const color = mc.color || paletteColors[idx % paletteColors.length];
      const strokeColor = strokeColors[idx % strokeColors.length];

      return {
        id: mc.id,
        name: mc.name,
        domain: mc.domain,
        isUser: false,
        color,
        strokeColor,
        marketSharePercent: mc.marketSharePercent || Number(Math.max(8, 30 - idx * 6.5).toFixed(1)),
        estimatedOrganicTraffic: mc.estimatedMonthlyVisits || 5200,
        totalRankedKeywords: (mc.topKeywords?.length || 4) * 55,
        top3Count: Math.round((mc.domainAuthority || 42) * 0.8),
        top10Count: Math.round((mc.domainAuthority || 42) * 2.4),
        avgRanking: Number((3.2 + idx * 1.2).toFixed(1)),
        visibilityScore: mc.domainAuthority ? Math.min(95, mc.domainAuthority + 12) : 62,
        domainAuthority: mc.domainAuthority || 45,
        siteSpeedScore: mc.siteSpeedScore || 70,
        strengths: [
          mc.serverType ? `Sunucu: ${mc.serverType}` : "Aktif organik arama varlığı",
          mc.metaTitle ? `Başlık: ${mc.metaTitle.slice(0, 48)}...` : "Hızlı yanıt veren altyapı",
          mc.category ? `Segment: ${mc.category}` : "Yerel arama optimizasyonu"
        ],
        vulnerabilities: [
          (mc.siteSpeedScore || 70) < 80 ? `Sayfa hızı (${mc.siteSpeedScore || 70}/100) sitenizin gerisinde` : "Derinlemesine blog içeriklerinde eksiklikler",
          (mc.domainAuthority || 45) < 55 ? "Alan adı otoritesi ve harici backlink sayısı geliştirilmeye açık" : "Mobil kullanıcı deneyiminde iyileştirme potansiyeli"
        ]
      };
    });

  const allCompetitors = [
    userProfile,
    ...(customCompetitorsList.length > 0 ? customCompetitorsList : [comp1Leader, comp2Speed, comp3Local])
  ].sort((a, b) => b.marketSharePercent - a.marketSharePercent);

  const userRankIndex = allCompetitors.findIndex(c => c.isUser) + 1;

  // Curated keyword benchmark matrix tailored for high-intent SEO performance
  const keywordSeed = [
    {
      kw: `${city.toLowerCase()} ${sector.toLowerCase()}`,
      intent: "Ticari" as const,
      vol: 14800,
      volLabel: "14.8K",
      cpc: "₺42.50",
      diff: 68,
      diffLabel: "Zor" as const,
      userRank: hasCustomDomain ? 2 : 4,
      userRankChange: +2,
      userClicks: 1850,
      category: "Temel Hizmet" as const,
      c1: 1,
      c2: 3,
      c3: 6,
      tactic: "Google Answer Box ve Şema işaretlemelerini tamamlayarak #1 sırayı liderden kapın."
    },
    {
      kw: `en yakın ${sector.toLowerCase()}`,
      intent: "Acil / Yerel" as const,
      vol: 12200,
      volLabel: "12.2K",
      cpc: "₺48.00",
      diff: 54,
      diffLabel: "Orta" as const,
      userRank: 1, // User dominates speed/mobile
      userRankChange: +3,
      userClicks: 2420,
      category: "Acil & 7/24" as const,
      c1: 2,
      c2: 4,
      c3: 5,
      tactic: "1. Sıradasınız! Tıklama başına dönüşümü artırmak için acil telefon CTA butonunu sabit tutun."
    },
    {
      kw: `acil 7/24 ${sector.toLowerCase()} telefon`,
      intent: "Acil / Yerel" as const,
      vol: 8600,
      volLabel: "8.6K",
      cpc: "₺52.20",
      diff: 46,
      diffLabel: "Orta" as const,
      userRank: 2,
      userRankChange: +1,
      userClicks: 1140,
      category: "Acil & 7/24" as const,
      c1: 3,
      c2: 1,
      c3: 4,
      tactic: "Açılış sayfasına 'Ortalama 15 Dk Varış' zaman damgası ekleyerek #1 sırayı geri alın."
    },
    {
      kw: `${sector.toLowerCase()} fiyatları 2026`,
      intent: "Fiyat & Maliyet" as const,
      vol: 9400,
      volLabel: "9.4K",
      cpc: "₺28.40",
      diff: 59,
      diffLabel: "Orta" as const,
      userRank: blogCount > 1 ? 3 : 7,
      userRankChange: blogCount > 1 ? +4 : 0,
      userClicks: 680,
      category: "Fiyat & Maliyet" as const,
      c1: 1,
      c2: 2,
      c3: 8,
      tactic: "Güncel 2026 kilometre ve taban tarife karşılaştırma tablosunu içeren bir blog rehberi yayınlayın."
    },
    {
      kw: `${city.toLowerCase()} nöbetçi ${sector.toLowerCase()}`,
      intent: "Acil / Yerel" as const,
      vol: 5400,
      volLabel: "5.4K",
      cpc: "₺36.00",
      diff: 38,
      diffLabel: "Kolay" as const,
      userRank: 1,
      userRankChange: +1,
      userClicks: 1290,
      category: "Acil & 7/24" as const,
      c1: 4,
      c2: 3,
      c3: 2,
      tactic: "Lider konumdasınız. Gece saatlerinde dönüşüm oranını maksimize eden WhatsApp widget'ı aktif tutun."
    },
    {
      kw: `güvenilir ${sector.toLowerCase()} firması`,
      intent: "Marka / Güven" as const,
      vol: 3800,
      volLabel: "3.8K",
      cpc: "₺22.80",
      diff: 32,
      diffLabel: "Kolay" as const,
      userRank: 2,
      userRankChange: +2,
      userClicks: 640,
      category: "Marka / Güven" as const,
      c1: 1,
      c2: 5,
      c3: 7,
      tactic: "Google müşteri yorumları ve sigortalı taşıma lisans rozetlerini H2 altına yerleştirin."
    },
    {
      kw: `${city.toLowerCase()} kurumsal ${sector.toLowerCase()} sözleşmeli`,
      intent: "İşlemsel" as const,
      vol: 2900,
      volLabel: "2.9K",
      cpc: "₺34.50",
      diff: 42,
      diffLabel: "Orta" as const,
      userRank: 3,
      userRankChange: 0,
      userClicks: 320,
      category: "Temel Hizmet" as const,
      c1: 2,
      c2: 1,
      c3: 9,
      tactic: "Filo ve kurumsal şirketler için faturalı ve cari hesap seçeneklerini vurgulayan özel B2B sayfa açın."
    },
    {
      kw: `${city.toLowerCase()} uygun fiyatlı ${sector.toLowerCase()} tavsiye`,
      intent: "Ticari" as const,
      vol: 4700,
      volLabel: "4.7K",
      cpc: "₺26.00",
      diff: 44,
      diffLabel: "Orta" as const,
      userRank: 2,
      userRankChange: +3,
      userClicks: 780,
      category: "Fiyat & Maliyet" as const,
      c1: 1,
      c2: 4,
      c3: 6,
      tactic: "Müşteri başarı hikayeleri ve şeffaf fiyat garantisi rozetleriyle #1 sırayı hedefleyin."
    },
    {
      kw: `${sector.toLowerCase()} çağırırken nelere dikkat edilmeli`,
      intent: "Bilgilendirici" as const,
      vol: 3200,
      volLabel: "3.2K",
      cpc: "₺14.00",
      diff: 28,
      diffLabel: "Kolay" as const,
      userRank: blogCount > 0 ? 2 : 9,
      userRankChange: blogCount > 0 ? +5 : -1,
      userClicks: 490,
      category: "Temel Hizmet" as const,
      c1: 1,
      c2: 6,
      c3: 11,
      tactic: "Hemen 'Korsan Taşıyıcılardan Korunma Rehberi' başlıklı bir blog içeriği hazırlayarak trafiği yakalayın."
    },
    {
      kw: `${city.toLowerCase()} merkez ve çevre ilçeler ${sector.toLowerCase()}`,
      intent: "Ticari" as const,
      vol: 6100,
      volLabel: "6.1K",
      cpc: "₺31.00",
      diff: 51,
      diffLabel: "Orta" as const,
      userRank: 2,
      userRankChange: +1,
      userClicks: 910,
      category: "Bölgesel / İlçe" as const,
      c1: 1,
      c2: 3,
      c3: 5,
      tactic: "İlçe bazlı iç linkleme ağını güçlendirerek bölgesel otoriteyi artırın."
    }
  ];

  const keywords: MarketShareKeywordItem[] = keywordSeed.map((item, index) => {
    const compRankings: CompetitorKeywordRankingEntry[] = [
      {
        id: `cr-${index}-c1`,
        competitorId: comp1Leader.id,
        competitorName: comp1Leader.name,
        rank: item.c1,
        url: `https://${comp1Leader.domain}/${item.kw.replace(/\s+/g, "-")}`,
        change: item.c1 <= 2 ? 0 : -1,
        serpFeatures: item.c1 === 1 ? ["Snippet", "Local Pack"] : ["Site Bağlantıları"]
      },
      {
        id: `cr-${index}-c2`,
        competitorId: comp2Speed.id,
        competitorName: comp2Speed.name,
        rank: item.c2,
        url: `https://${comp2Speed.domain}/${item.kw.replace(/\s+/g, "-")}`,
        change: +1,
        serpFeatures: ["Google Ads", "WhatsApp İletişim"]
      },
      {
        id: `cr-${index}-c3`,
        competitorId: comp3Local.id,
        competitorName: comp3Local.name,
        rank: item.c3,
        url: `https://${comp3Local.domain}/${item.kw.replace(/\s+/g, "-")}`,
        change: -1,
        serpFeatures: ["Harita Konumu"]
      }
    ];

    const bestComp = compRankings.reduce((min, cur) => (cur.rank < min.rank ? cur : min), compRankings[0]);
    const gap = item.userRank - bestComp.rank;
    const oppScore = Math.min(
      98,
      Math.max(30, Math.round((item.vol / 250) * 0.4 + (100 - item.diff) * 0.3 + (gap > 0 ? gap * 8 : 10)))
    );

    return {
      id: `kw-item-${index + 1}`,
      keyword: item.kw,
      searchIntent: item.intent,
      monthlySearchVolume: item.vol,
      monthlyVolumeFormatted: item.volLabel,
      cpcValue: item.cpc,
      seoDifficulty: item.diff,
      difficultyLabel: item.diffLabel,
      userRank: item.userRank,
      userRankChange: item.userRankChange,
      userEstimatedClicks: item.userClicks,
      category: item.category,
      competitorRankings: compRankings,
      bestCompetitor: {
        name: bestComp.competitorName,
        rank: bestComp.rank
      },
      gapToLeader: gap,
      opportunityScore: oppScore,
      trafficPotentialGain: `+${Math.round(item.vol * 0.18)} Ziyaret / Ay`,
      actionableTactic: item.tactic
    };
  });

  const totalVol = keywords.reduce((sum, k) => sum + k.monthlySearchVolume, 0) * 1.8;
  const topWins = keywords.filter(k => k.userRank === 1).length;
  const headToHead = keywords.filter(k => Math.abs(k.gapToLeader) <= 2 && k.userRank > 1).length;
  const highGaps = keywords.filter(k => k.gapToLeader >= 3).length;

  return {
    analyzedAt: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    sector,
    city,
    totalMarketSearchVolume: Math.round(totalVol),
    totalMarketSearchVolumeFormatted: `${(totalVol / 1000).toFixed(1)}K`,
    userMarketShare: userProfile.marketSharePercent,
    userMarketRank: userRankIndex,
    competitors: allCompetitors,
    keywords,
    userProfile,
    leaderProfile: comp1Leader,
    summary: {
      topKeywordWins: topWins,
      headToHeadBattles: headToHead,
      highPotentialGaps: highGaps,
      immediateTrafficBoostOpportunity: "+3,450 Ziyaretçi / Ay",
      keyTakeaway:
        userRankIndex === 1
          ? "Siteniz pazar lideri konumunda! Hız ve mobil avantajınızı sürdürerek içerik derinliğini artırın."
          : `Pazar lideri (${comp1Leader.name}) ile aranızda yalnızca %${(
              comp1Leader.marketSharePercent - userProfile.marketSharePercent
            ).toFixed(1)} pazar payı farkı var. Hedefli 4 anahtar kelimede #1 sırayı alarak pazar liderliğine geçebilirsiniz.`
    }
  };
}

/**
 * Export comparative market share and Google ranking keyword data to CSV
 */
export function exportMarketShareAnalysisCsv(data: MarketShareAnalysisData): void {
  const headers = [
    "Anahtar Kelime",
    "Arama Niyeti",
    "Aylık Hacim",
    "TBM Değeri",
    "Zorluk",
    "Sizin Sıranız",
    "Sıra Değişimi",
    "Tahmini Tıklama",
    "En İyi Rakip",
    "Rakip Sırası",
    "Sıra Farkı",
    "Fırsat Skoru",
    "Potansiyel Trafik Kazancı",
    "Önerilen Taktik"
  ];

  const rows = data.keywords.map(k => [
    `"${k.keyword}"`,
    `"${k.searchIntent}"`,
    k.monthlySearchVolume,
    `"${k.cpcValue}"`,
    k.seoDifficulty,
    k.userRank,
    k.userRankChange > 0 ? `+${k.userRankChange}` : k.userRankChange,
    k.userEstimatedClicks,
    `"${k.bestCompetitor.name}"`,
    k.bestCompetitor.rank,
    k.gapToLeader > 0 ? `-${k.gapToLeader}` : `+${Math.abs(k.gapToLeader)}`,
    k.opportunityScore,
    `"${k.trafficPotentialGain}"`,
    `"${k.actionableTactic.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Pazar_Payi_Rakip_Analizi_${data.sector.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
