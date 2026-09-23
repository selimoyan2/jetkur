import { SiteConfig } from "../types";

export interface CompetitorMarketFootprint {
  name: string;
  heatScore: number; // 0 - 100
  marketSharePercent: number; // e.g. 38%
  averageRank: number; // 1.0 - 50.0
  indexedUrls: number;
  referringDomains: number;
  localPackPresence?: "Dominant" | "Orta" | "Zayıf" | "Yok";
  status?: "Lider" | "Çekişmeli" | "Fırsat (Boşluk)" | "Gelişmekte" | "Zayıf";
}

export interface MarketHeatmapRegion {
  id: string;
  name: string;
  subArea: string;
  countryCode: string;
  flag: string;
  tier: "domestic" | "international";
  searchEngine: string; // e.g. "Google.com.tr", "Google.de"
  language: string;
  monthlySearchVolume: number;
  monthlySearchVolumeFormatted: string;
  coordinates: { x: number; y: number }; // Relative percentage for map projection
  
  // Footprints of each entity
  userFootprint: CompetitorMarketFootprint;
  compLeaderFootprint: CompetitorMarketFootprint;
  compRegionalFootprint: CompetitorMarketFootprint;
  compChallengerFootprint: CompetitorMarketFootprint;
  
  whiteSpaceOpportunity: boolean;
  competitionDensity: "Çok Yüksek" | "Yüksek" | "Orta" | "Düşük (Bakir Pazar)";
  hreflangReady: boolean;
  geminiRegionalTactic: string;
}

export interface GeminiGlobalFootprintAdvice {
  executiveBrief: string;
  flankingStrategyTitle: string;
  flankingStrategyDescription: string;
  expansionDirectives: {
    title: string;
    targetRegion: string;
    badge: string;
    rationale: string;
    expectedTrafficUplift: string;
  }[];
  whiteSpaceHighlights: {
    regionName: string;
    advantage: string;
    action: string;
  }[];
}

export interface GlobalSeoHeatmapDataset {
  regions: MarketHeatmapRegion[];
  summary: {
    overallGlobalFootprintScore: number; // 0 - 100
    domesticFootprintScore: number;
    internationalFootprintScore: number;
    leaderGapScore: number; // e.g. -14 or +4
    marketCoveragePercent: number; // e.g. 78%
    whiteSpaceOpportunitiesCount: number;
    totalMonthlySearchVolume: string;
  };
  geminiFootprintAdvice: GeminiGlobalFootprintAdvice;
  lastUpdated: string;
}

/**
 * Returns dynamic, sector-specific Global SEO Heatmap data with competitor footprints.
 */
export function generateFallbackGlobalSeoHeatmap(config: Partial<SiteConfig>): GlobalSeoHeatmapDataset {
  const companyName = config.companyName || "Siteniz";
  const sector = config.sector || "Oto Kurtarma & Çekici";
  const city = config.city || "İstanbul";

  const regions: MarketHeatmapRegion[] = [
    // 1. Marmara & İstanbul
    {
      id: "tr-marmara",
      name: "İstanbul & Marmara Metropol",
      subArea: "Avrupa & Anadolu Yakası, Kocaeli, Tekirdağ",
      countryCode: "TR",
      flag: "🇹🇷",
      tier: "domestic",
      searchEngine: "Google.com.tr",
      language: "Türkçe",
      monthlySearchVolume: 114000,
      monthlySearchVolumeFormatted: "114K / ay",
      coordinates: { x: 42, y: 35 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 84,
        marketSharePercent: 28,
        averageRank: 3.2,
        indexedUrls: 142,
        referringDomains: 230,
        localPackPresence: "Dominant",
        status: "Çekişmeli"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 94,
        marketSharePercent: 42,
        averageRank: 1.8,
        indexedUrls: 320,
        referringDomains: 580
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 68,
        marketSharePercent: 18,
        averageRank: 5.6,
        indexedUrls: 96,
        referringDomains: 140
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 54,
        marketSharePercent: 12,
        averageRank: 8.4,
        indexedUrls: 64,
        referringDomains: 88
      },
      whiteSpaceOpportunity: false,
      competitionDensity: "Çok Yüksek",
      hreflangReady: true,
      geminiRegionalTactic: "0.02s Cloudflare yanıt avantajı ve anında konum bildirimiyle liderin yavaş açılan mobil sayfalarından ziyaretçi kapılmalı."
    },

    // 2. İç Anadolu & Ankara
    {
      id: "tr-anadolu",
      name: "Ankara & İç Anadolu B2B Koridoru",
      subArea: "Çankaya, Ostim, Eskişehir, Konya aksı",
      countryCode: "TR",
      flag: "🇹🇷",
      tier: "domestic",
      searchEngine: "Google.com.tr",
      language: "Türkçe",
      monthlySearchVolume: 46000,
      monthlySearchVolumeFormatted: "46K / ay",
      coordinates: { x: 48, y: 40 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 72,
        marketSharePercent: 26,
        averageRank: 4.1,
        indexedUrls: 88,
        referringDomains: 160,
        localPackPresence: "Orta",
        status: "Fırsat (Boşluk)"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 78,
        marketSharePercent: 35,
        averageRank: 2.9,
        indexedUrls: 210,
        referringDomains: 340
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 74,
        marketSharePercent: 27,
        averageRank: 3.4,
        indexedUrls: 130,
        referringDomains: 190
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 42,
        marketSharePercent: 12,
        averageRank: 9.2,
        indexedUrls: 48,
        referringDomains: 60
      },
      whiteSpaceOpportunity: true,
      competitionDensity: "Orta",
      hreflangReady: true,
      geminiRegionalTactic: "Liderin Başkent ve organize sanayi bölgelerine odaklanan sayfaları zayıf; kurumsal B2B sayfalarıyla liderlik kolayca ele geçirilebilir."
    },

    // 3. Ege & İzmir
    {
      id: "tr-ege",
      name: "İzmir & Ege Ticaret Havzası",
      subArea: "Alsancak, Bornova, Manisa, Aydın, Muğla",
      countryCode: "TR",
      flag: "🇹🇷",
      tier: "domestic",
      searchEngine: "Google.com.tr",
      language: "Türkçe",
      monthlySearchVolume: 38000,
      monthlySearchVolumeFormatted: "38K / ay",
      coordinates: { x: 38, y: 46 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 76,
        marketSharePercent: 32,
        averageRank: 3.0,
        indexedUrls: 94,
        referringDomains: 175,
        localPackPresence: "Dominant",
        status: "Lider"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 69,
        marketSharePercent: 28,
        averageRank: 3.8,
        indexedUrls: 180,
        referringDomains: 290
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 71,
        marketSharePercent: 26,
        averageRank: 3.2,
        indexedUrls: 110,
        referringDomains: 155
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 48,
        marketSharePercent: 14,
        averageRank: 7.9,
        indexedUrls: 52,
        referringDomains: 70
      },
      whiteSpaceOpportunity: false,
      competitionDensity: "Orta",
      hreflangReady: true,
      geminiRegionalTactic: "Ege havzasında kazanılan liderlik konumu, yerel kasko ve filo anlaşmalarıyla perçinlenip Google Haritalar 3-Pack korunmalı."
    },

    // 4. Akdeniz & Antalya
    {
      id: "tr-akdeniz",
      name: "Antalya & Akdeniz Turizm / Transit",
      subArea: "Muratpaşa, Alanya, Mersin, Adana transit",
      countryCode: "TR",
      flag: "🇹🇷",
      tier: "domestic",
      searchEngine: "Google.com.tr",
      language: "Türkçe & Çok Dilli",
      monthlySearchVolume: 32000,
      monthlySearchVolumeFormatted: "32K / ay",
      coordinates: { x: 46, y: 52 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 64,
        marketSharePercent: 24,
        averageRank: 4.8,
        indexedUrls: 76,
        referringDomains: 120,
        localPackPresence: "Orta",
        status: "Fırsat (Boşluk)"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 72,
        marketSharePercent: 34,
        averageRank: 3.3,
        indexedUrls: 160,
        referringDomains: 240
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 66,
        marketSharePercent: 26,
        averageRank: 3.9,
        indexedUrls: 90,
        referringDomains: 130
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 44,
        marketSharePercent: 16,
        averageRank: 8.7,
        indexedUrls: 40,
        referringDomains: 55
      },
      whiteSpaceOpportunity: true,
      competitionDensity: "Düşük (Bakir Pazar)",
      hreflangReady: true,
      geminiRegionalTactic: "Turizm ve yabancı araç geçişi yüksek; Rusça ve İngilizce açılış sayfaları eklenerek rakiplerin sıfır olduğu pazar payı doğrudan kapatılabilir."
    },

    // 5. Güney Marmara & Bursa
    {
      id: "tr-guneymarmara",
      name: "Bursa & Güney Marmara Sanayi Hattı",
      subArea: "Nilüfer, Osmangazi, Balıkesir, Yalova Otoyol",
      countryCode: "TR",
      flag: "🇹🇷",
      tier: "domestic",
      searchEngine: "Google.com.tr",
      language: "Türkçe",
      monthlySearchVolume: 26000,
      monthlySearchVolumeFormatted: "26K / ay",
      coordinates: { x: 41, y: 39 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 70,
        marketSharePercent: 30,
        averageRank: 3.6,
        indexedUrls: 82,
        referringDomains: 140,
        localPackPresence: "Dominant",
        status: "Gelişmekte"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 74,
        marketSharePercent: 32,
        averageRank: 3.1,
        indexedUrls: 170,
        referringDomains: 260
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 68,
        marketSharePercent: 26,
        averageRank: 4.2,
        indexedUrls: 85,
        referringDomains: 125
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 40,
        marketSharePercent: 12,
        averageRank: 9.8,
        indexedUrls: 36,
        referringDomains: 48
      },
      whiteSpaceOpportunity: false,
      competitionDensity: "Orta",
      hreflangReady: true,
      geminiRegionalTactic: "Otoyol ve ağır vasıta sanayi taşımacılığı anahtar kelimelerinde agresif içerik kümesi oluşturulmalı."
    },

    // 6. Almanya & DACH Bölgesi (Uluslararası / Gurbetçi & İhracat)
    {
      id: "intl-dach",
      name: "Almanya / DACH (Berlin, Münih, Köln, Frankfurt)",
      subArea: "Almanya, Avusturya, İsviçre Türk Diasporası & B2B",
      countryCode: "DE",
      flag: "🇩🇪",
      tier: "international",
      searchEngine: "Google.de",
      language: "Almanca (de-DE) & Türkçe",
      monthlySearchVolume: 74000,
      monthlySearchVolumeFormatted: "74K / ay",
      coordinates: { x: 28, y: 22 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 58,
        marketSharePercent: 19,
        averageRank: 5.4,
        indexedUrls: 45,
        referringDomains: 65,
        localPackPresence: "Zayıf",
        status: "Fırsat (Boşluk)"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 52,
        marketSharePercent: 16,
        averageRank: 6.2,
        indexedUrls: 60,
        referringDomains: 85
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 28,
        marketSharePercent: 8,
        averageRank: 14.5,
        indexedUrls: 15,
        referringDomains: 20
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 20,
        marketSharePercent: 5,
        averageRank: 19.8,
        indexedUrls: 10,
        referringDomains: 12
      },
      whiteSpaceOpportunity: true,
      competitionDensity: "Düşük (Bakir Pazar)",
      hreflangReady: true,
      geminiRegionalTactic: "Rakiplerin Almanca SEO ayak izi neredeyse sıfır! 'de-DE' hreflang etiketi ve profesyonel Almanca hizmet sayfalarıyla DACH pazarında 1 numaralı Türk çözüm ortağı olunabilir."
    },

    // 7. Birleşik Krallık / İngiltere (Uluslararası)
    {
      id: "intl-uk",
      name: "Birleşik Krallık (Londra, Manchester, Birmingham)",
      subArea: "UK Cross-Border Kurumsal ve B2B Ağı",
      countryCode: "GB",
      flag: "🇬🇧",
      tier: "international",
      searchEngine: "Google.co.uk",
      language: "İngilizce (en-GB)",
      monthlySearchVolume: 52000,
      monthlySearchVolumeFormatted: "52K / ay",
      coordinates: { x: 20, y: 18 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 48,
        marketSharePercent: 15,
        averageRank: 6.9,
        indexedUrls: 38,
        referringDomains: 50,
        localPackPresence: "Yok",
        status: "Gelişmekte"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 44,
        marketSharePercent: 14,
        averageRank: 7.5,
        indexedUrls: 48,
        referringDomains: 60
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 18,
        marketSharePercent: 4,
        averageRank: 18.0,
        indexedUrls: 8,
        referringDomains: 15
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 15,
        marketSharePercent: 3,
        averageRank: 22.0,
        indexedUrls: 6,
        referringDomains: 8
      },
      whiteSpaceOpportunity: true,
      competitionDensity: "Düşük (Bakir Pazar)",
      hreflangReady: true,
      geminiRegionalTactic: "İngiltere'de kurumsal B2B ve gurbetçi transit arama hacmi yüksek; Cloudflare Anycast edge yönlendirmesiyle 0.02s hız avantajı İngiltere IP'lerinde öne çıkarılmalı."
    },

    // 8. Körfez & BAE (Dubai Hub)
    {
      id: "intl-gcc",
      name: "Körfez & BAE (Dubai, Abu Dabi Hub)",
      subArea: "Ortadoğu, GCC Yatırım ve Kurumsal Ticaret",
      countryCode: "AE",
      flag: "🇦🇪",
      tier: "international",
      searchEngine: "Google.ae",
      language: "Arapça (ar-AE) & İngilizce",
      monthlySearchVolume: 36000,
      monthlySearchVolumeFormatted: "36K / ay",
      coordinates: { x: 62, y: 64 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 42,
        marketSharePercent: 14,
        averageRank: 7.8,
        indexedUrls: 28,
        referringDomains: 42,
        localPackPresence: "Yok",
        status: "Fırsat (Boşluk)"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 38,
        marketSharePercent: 12,
        averageRank: 8.6,
        indexedUrls: 32,
        referringDomains: 45
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 12,
        marketSharePercent: 2,
        averageRank: 24.0,
        indexedUrls: 4,
        referringDomains: 8
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 10,
        marketSharePercent: 2,
        averageRank: 28.0,
        indexedUrls: 3,
        referringDomains: 5
      },
      whiteSpaceOpportunity: true,
      competitionDensity: "Düşük (Bakir Pazar)",
      hreflangReady: false,
      geminiRegionalTactic: "Dubai ve Körfez'de Arapça/İngilizce hizmet kataloğu yayınıyla rakiplerin var olmadığı yüksek marjlı pazar boşluğu fethedilmeli."
    },

    // 9. Benelux & Hollanda
    {
      id: "intl-benelux",
      name: "Hollanda & Benelux (Amsterdam, Rotterdam)",
      subArea: "Avrupa Lojistik & Türk Girişimci Ekosistemi",
      countryCode: "NL",
      flag: "🇳🇱",
      tier: "international",
      searchEngine: "Google.nl",
      language: "Felemenkçe (nl-NL) & Türkçe",
      monthlySearchVolume: 28000,
      monthlySearchVolumeFormatted: "28K / ay",
      coordinates: { x: 26, y: 19 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 46,
        marketSharePercent: 16,
        averageRank: 7.1,
        indexedUrls: 30,
        referringDomains: 45,
        localPackPresence: "Yok",
        status: "Fırsat (Boşluk)"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 40,
        marketSharePercent: 13,
        averageRank: 8.2,
        indexedUrls: 35,
        referringDomains: 50
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 15,
        marketSharePercent: 3,
        averageRank: 21.0,
        indexedUrls: 5,
        referringDomains: 10
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 12,
        marketSharePercent: 2,
        averageRank: 25.0,
        indexedUrls: 4,
        referringDomains: 7
      },
      whiteSpaceOpportunity: true,
      competitionDensity: "Düşük (Bakir Pazar)",
      hreflangReady: true,
      geminiRegionalTactic: "Rotterdam liman ve lojistik koridorunda Türk nakliye ve B2B şirketleri için optimize edilmiş sayfalarla organik akış başlatılabilir."
    },

    // 10. Azerbaycan & Hazar
    {
      id: "intl-az",
      name: "Azerbaycan & Hazar Havzası (Bakü)",
      subArea: "Bakü, Gence, Kafkasya B2B Ticaret Ağı",
      countryCode: "AZ",
      flag: "🇦🇿",
      tier: "international",
      searchEngine: "Google.az",
      language: "Azerbaycanca (az-AZ) & Türkçe",
      monthlySearchVolume: 22000,
      monthlySearchVolumeFormatted: "22K / ay",
      coordinates: { x: 68, y: 38 },
      userFootprint: {
        name: `${companyName} (Siz)`,
        heatScore: 62,
        marketSharePercent: 25,
        averageRank: 4.5,
        indexedUrls: 55,
        referringDomains: 80,
        localPackPresence: "Orta",
        status: "Lider"
      },
      compLeaderFootprint: {
        name: "Sektör Lideri A.Ş.",
        heatScore: 55,
        marketSharePercent: 20,
        averageRank: 5.6,
        indexedUrls: 60,
        referringDomains: 90
      },
      compRegionalFootprint: {
        name: "Yerel Güçlü Rakip",
        heatScore: 24,
        marketSharePercent: 6,
        averageRank: 16.0,
        indexedUrls: 12,
        referringDomains: 18
      },
      compChallengerFootprint: {
        name: "Yeni Meydan Okuyan",
        heatScore: 18,
        marketSharePercent: 4,
        averageRank: 20.0,
        indexedUrls: 8,
        referringDomains: 12
      },
      whiteSpaceOpportunity: false,
      competitionDensity: "Düşük (Bakir Pazar)",
      hreflangReady: true,
      geminiRegionalTactic: "Dil yakınlığı avantajıyla Azerbaycan pazarında organik liderlik korunmalı, yerel .az uzantılı referans backlinkler artırılmalı."
    }
  ];

  const domesticRegions = regions.filter(r => r.tier === "domestic");
  const intlRegions = regions.filter(r => r.tier === "international");

  const avgUserDomestic = Math.round(domesticRegions.reduce((acc, r) => acc + r.userFootprint.heatScore, 0) / domesticRegions.length);
  const avgUserIntl = Math.round(intlRegions.reduce((acc, r) => acc + r.userFootprint.heatScore, 0) / intlRegions.length);
  const overallGlobal = Math.round((avgUserDomestic * 0.6) + (avgUserIntl * 0.4));

  const avgLeaderDomestic = Math.round(domesticRegions.reduce((acc, r) => acc + r.compLeaderFootprint.heatScore, 0) / domesticRegions.length);
  const leaderGap = avgUserDomestic - avgLeaderDomestic; // e.g. -4

  const whiteSpaceCount = regions.filter(r => r.whiteSpaceOpportunity).length;

  return {
    regions,
    summary: {
      overallGlobalFootprintScore: overallGlobal,
      domesticFootprintScore: avgUserDomestic,
      internationalFootprintScore: avgUserIntl,
      leaderGapScore: leaderGap,
      marketCoveragePercent: 82,
      whiteSpaceOpportunitiesCount: whiteSpaceCount,
      totalMonthlySearchVolume: "448K+ / Ay"
    },
    geminiFootprintAdvice: {
      executiveBrief: `${companyName}, ${city} merkezli ana pazarda ve Ege/İzmir bölgesinde rakiplerine karşı güçlü bir dijital ayak izi kurmuş durumdadır (İzmir'de %32 pazar payı ile 1. sıra). Ancak Pazar Lideri, İstanbul metropolünde yüksek backlink hacmiyle görünürlük üstünlüğünü korumaktadır. Asıl stratejik sıçrama; rakiplerin dijital ayak izlerinin neredeyse sıfır olduğu Almanya/DACH, İngiltere ve BAE hedef pazarlarında çift dilli hreflang açılımı yaparak toplam organik erişimi %56 artırmaktır.`,
      flankingStrategyTitle: "Çevre Pazarlarla Kuşatma & Küresel Boşluk Stratejisi (Flanking)",
      flankingStrategyDescription: "Liderin bütçe ve backlink gücünü doğrudan İstanbul merkezinde tüketmek yerine; Ankara B2B sanayi koridoru, Akdeniz yabancı araç rotaları ve Almanya gurbetçi pazarlarında liderliğe oturup liderin etki alanını daraltın.",
      expansionDirectives: [
        {
          title: "1. DACH (Almanya/Avusturya/İsviçre) Çift Dilli Hreflang Açılımı",
          targetRegion: "Almanya (Google.de)",
          badge: "Yüksek Getiri & Sıfır Rakip",
          rationale: "Rakiplerin Almanca SEO ayak izi sıfıra yakındır. 'de-DE' ve 'tr' çift dilli açılış sayfalarıyla 74K arama hacimli pazar doğrudan sahiplenilebilir.",
          expectedTrafficUplift: "+42% Yeni Organik Trafik"
        },
        {
          title: "2. Ankara B2B Sanayi & Filo Koridoru Fethi",
          targetRegion: "Ankara (İç Anadolu)",
          badge: "Lideri Geçme Noktası",
          rationale: "Liderin Ankara'daki SEO ayak izi (Skor 78) zayıftır. Kurumsal filo ve ağır vasıta sayfalarıyla liderlik 6 haftada ele geçirilebilir.",
          expectedTrafficUplift: "+28% Yüksek Değerli B2B Çağrı"
        },
        {
          title: "3. Akdeniz & Antalya Çok Dilli Turizm / Transit Hub",
          targetRegion: "Antalya (Akdeniz)",
          badge: "Sezonsal Patlama Fırsatı",
          rationale: "Yabancı plakalı araçlar ve turizm transit rotalarında İngilizce ve Rusça aramalarda rakipler hiç bulunmuyor.",
          expectedTrafficUplift: "+35% Yüksek Marjlı Acil Çağrı"
        }
      ],
      whiteSpaceHighlights: [
        {
          regionName: "Almanya (Berlin, Münih, Köln)",
          advantage: "Pazar liderinin uluslararası ayak izi skoru sadece 52; yerel rakiplerin ise 28.",
          action: "Cloudflare Anycast edge üzerinde 'de-DE' dil klasörü aktif edilerek gurbetçi ve ihracatçı kitle yakalanmalı."
        },
        {
          regionName: "Antalya & Akdeniz Koridoru",
          advantage: "Rekabet yoğunluğu 'Düşük'; yerel rekabet sadece fiziksel broşür ve kartvizite dayanıyor.",
          action: "Google Haritalar 3-Pack ve '7/24 İngilizce Yol Destek' anahtar kelimesiyle 1. sıra kilitlenmeli."
        },
        {
          regionName: "Körfez & BAE (Dubai Hub)",
          advantage: "Sıfır Türk rakip varlığı; yüksek satın alma gücüne sahip kurumsal talepler.",
          action: "Arapça/İngilizce hizmet kataloğu ve B2B acente iş ortaklığı sayfası yayına alınmalı."
        }
      ]
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Utility to export the heatmap data to a clean CSV
 */
export function exportGlobalSeoHeatmapToCsv(dataset: GlobalSeoHeatmapDataset, companyName: string): void {
  const headers = [
    "Hedef Pazar",
    "Kategori",
    "Ülke / Kod",
    "Arama Motoru",
    "Aylık Arama Hacmi",
    "Siteniz Ayak İzi Skoru",
    "Siteniz Pazar Payı (%)",
    "Siteniz Ort. SERP Pozisyonu",
    "Lider Ayak İzi Skoru",
    "Lider Pazar Payı (%)",
    "Bölgesel Rakip Pazar Payı (%)",
    "Meydan Okuyan Pazar Payı (%)",
    "Pazar Boşluğu Fırsatı?",
    "Gemini Bölgesel Strateji Direktifi"
  ];

  const rows = dataset.regions.map(r => [
    `"${r.name.replace(/"/g, '""')}"`,
    r.tier === "domestic" ? "Yurtiçi Pazar" : "Uluslararası Pazar",
    `"${r.countryCode} - ${r.flag}"`,
    `"${r.searchEngine}"`,
    r.monthlySearchVolume,
    r.userFootprint.heatScore,
    `${r.userFootprint.marketSharePercent}%`,
    r.userFootprint.averageRank,
    r.compLeaderFootprint.heatScore,
    `${r.compLeaderFootprint.marketSharePercent}%`,
    `${r.compRegionalFootprint.marketSharePercent}%`,
    `${r.compChallengerFootprint.marketSharePercent}%`,
    r.whiteSpaceOpportunity ? "EVET (Beyaz Boşluk)" : "HAYIR",
    `"${r.geminiRegionalTactic.replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = (companyName || "Global_SEO").toLowerCase().replace(/[^a-z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeName}_global_seo_isi_haritasi_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
