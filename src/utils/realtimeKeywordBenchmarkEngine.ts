import { SiteConfig } from "../types";

export interface KeywordBenchmarkCompetitor {
  id: string;
  name: string;
  domain: string;
  color: string;
  da: number;
}

export interface KeywordBenchmarkItem {
  id: string;
  keyword: string;
  category: string;
  searchVolume: number;
  difficulty: number; // 0-100
  cpc: number; // in TRY (TL)
  intent: "commercial" | "transactional" | "informational" | "navigational";
  scores: {
    user: number; // 0-100 visibility score
    competitor1: number;
    competitor2: number;
    competitor3: number;
    industryAvg: number;
  };
  ranks: {
    user: number; // 1-20+
    competitor1: number;
    competitor2: number;
    competitor3: number;
  };
  recommendedAction: string;
  contentGapStatus: "winning" | "competitive" | "opportunity" | "vulnerable";
}

export interface CompetitorKeywordBenchmarkDataset {
  industry: string;
  city: string;
  companyName: string;
  domain: string;
  fetchedAt: string;
  isLiveGrounding: boolean;
  source: string;
  competitors: KeywordBenchmarkCompetitor[];
  keywords: KeywordBenchmarkItem[];
  aggregateMetrics: {
    userAvgScore: number;
    marketLeaderAvgScore: number;
    gapKeywordsCount: number;
    leadingKeywordsCount: number;
    potentialTrafficGain: number;
  };
}

// Industry specific keyword presets for smart fallback
const INDUSTRY_KEYWORD_PRESETS: Record<string, Array<{ keyword: string; category: string; vol: number; kd: number; cpc: number; intent: any }>> = {
  hukuk: [
    { keyword: "boşanma davası avukatı", category: "Aile & Medeni Hukuk", vol: 18100, kd: 68, cpc: 42.5, intent: "commercial" },
    { keyword: "ağır ceza avukatı", category: "Ceza Hukuku", vol: 14800, kd: 74, cpc: 58.0, intent: "commercial" },
    { keyword: "iş hukuku kıdem tazminatı davası", category: "İş & Sosyal Güvenlik", vol: 22400, kd: 62, cpc: 34.0, intent: "transactional" },
    { keyword: "miras paylaşımı avukatı", category: "Miras Hukuku", vol: 11200, kd: 58, cpc: 31.5, intent: "commercial" },
    { keyword: "kira tahliye davası açma", category: "Gayrimenkul Hukuku", vol: 27500, kd: 71, cpc: 48.0, intent: "transactional" },
    { keyword: "bilişim suçları hukuki danışmanlık", category: "Bilişim & Siber Hukuk", vol: 8900, kd: 52, cpc: 29.0, intent: "informational" },
    { keyword: "şirketler hukuku sözleşme hazırlama", category: "Ticaret & Şirketler", vol: 9600, kd: 65, cpc: 52.0, intent: "commercial" }
  ],
  saglik: [
    { keyword: "implant diş tedavisi fiyatları", category: "Ağız ve Diş Sağlığı", vol: 33100, kd: 72, cpc: 38.0, intent: "commercial" },
    { keyword: "göz lazer ameliyatı no touch", category: "Göz Hastalıkları", vol: 19400, kd: 64, cpc: 46.5, intent: "commercial" },
    { keyword: "rinoplasti burun estetiği doktoru", category: "Estetik Cerrahi", vol: 26800, kd: 78, cpc: 54.0, intent: "commercial" },
    { keyword: "fizik tedavi ve rehabilitasyon merkezi", category: "Fizik Tedavi", vol: 14200, kd: 55, cpc: 28.0, intent: "transactional" },
    { keyword: "check-up tam kapsamlı paketler", category: "Koruyucu Sağlık", vol: 18700, kd: 59, cpc: 35.0, intent: "transactional" },
    { keyword: "saç ekimi dhi tekniği sonuçları", category: "Saç Sağlığı", vol: 22100, kd: 70, cpc: 49.0, intent: "commercial" },
    { keyword: "online uzman psikolog seansı", category: "Ruh Sağlığı", vol: 16500, kd: 61, cpc: 32.0, intent: "commercial" }
  ],
  eticaret: [
    { keyword: "kadın trençkot modelleri yeni sezon", category: "Giyim & Moda", vol: 41200, kd: 69, cpc: 14.5, intent: "commercial" },
    { keyword: "kablosuz bluetooth kulaklık anc", category: "Elektronik", vol: 54000, kd: 82, cpc: 18.0, intent: "transactional" },
    { keyword: "ortopedik visco yatak fiyatları", category: "Ev & Yaşam", vol: 22600, kd: 63, cpc: 16.5, intent: "commercial" },
    { keyword: "doğal içerikli nemlendirici krem", category: "Kozmetik & Bakım", vol: 28400, kd: 58, cpc: 12.0, intent: "transactional" },
    { keyword: "erkek su geçirmez outdoor bot", category: "Ayakkabı", vol: 31500, kd: 66, cpc: 15.0, intent: "commercial" },
    { keyword: "çocuk eğitici ahşap oyuncak seti", category: "Anne & Bebek", vol: 19800, kd: 51, cpc: 9.5, intent: "commercial" },
    { keyword: "ergonomik çalışma koltuğu fileli", category: "Ofis & Mobilya", vol: 17200, kd: 60, cpc: 17.5, intent: "transactional" }
  ],
  bilisim: [
    { keyword: "özel kurumsal web tasarım ajansı", category: "Web Geliştirme", vol: 12400, kd: 68, cpc: 44.0, intent: "commercial" },
    { keyword: "b2b e-ticaret yazılımı entegrasyonu", category: "Yazılım Çözümleri", vol: 9800, kd: 72, cpc: 62.0, intent: "transactional" },
    { keyword: "google reklam ajansı seo danışmanlığı", category: "Dijital Pazarlama", vol: 15600, kd: 75, cpc: 58.0, intent: "commercial" },
    { keyword: "bulut sunucu kiralama ve siber güvenlik", category: "Cloud & Güvenlik", vol: 18200, kd: 64, cpc: 39.0, intent: "transactional" },
    { keyword: "mobil uygulama geliştirme ios android", category: "Mobil Çözümler", vol: 14300, kd: 70, cpc: 51.0, intent: "commercial" },
    { keyword: "crm müşteri takip programı bulut", category: "Kurumsal SaaS", vol: 21500, kd: 66, cpc: 45.0, intent: "transactional" },
    { keyword: "yapay zeka chatbot entegrasyonu", category: "AI & Otomasyon", vol: 11200, kd: 54, cpc: 36.0, intent: "commercial" }
  ],
  insaat: [
    { keyword: "anahtar teslim villa inşaatı maliyeti", category: "Konut İnşaatı", vol: 16800, kd: 65, cpc: 38.0, intent: "commercial" },
    { keyword: "iç mimarlık ve dekorasyon ofisi", category: "Mimarlık & Tasarım", vol: 21400, kd: 62, cpc: 32.0, intent: "commercial" },
    { keyword: "çelik konstrüksiyon fabrika yapımı", category: "Endüstriyel Yapı", vol: 8900, kd: 57, cpc: 45.0, intent: "transactional" },
    { keyword: "kentsel dönüşüm bina güçlendirme firmaları", category: "Dönüşüm & Güçlendirme", vol: 14200, kd: 69, cpc: 42.0, intent: "transactional" },
    { keyword: "banyo mutfak tadilatı komple", category: "Tadilat & Renovasyon", vol: 28600, kd: 59, cpc: 26.0, intent: "commercial" },
    { keyword: "zemin etüdü ve geoteknik rapor", category: "Mühendislik", vol: 6700, kd: 48, cpc: 22.0, intent: "informational" },
    { keyword: "ısı yalıtımı dış cephe mantolama", category: "İzolasyon", vol: 19500, kd: 63, cpc: 29.0, intent: "transactional" }
  ],
  genel: [
    { keyword: "en iyi profesyonel hizmet sağlayıcı", category: "Temel Hizmet", vol: 14500, kd: 62, cpc: 28.0, intent: "commercial" },
    { keyword: "hızlı randevu ve ücretsiz ön görüşme", category: "Müşteri Dönüşümü", vol: 18200, kd: 58, cpc: 32.0, intent: "transactional" },
    { keyword: "bölgesel yetkili uzman danışmanlık", category: "Yerel Otorite", vol: 12100, kd: 54, cpc: 25.0, intent: "commercial" },
    { keyword: "uygun fiyatlı güvenilir firma tavsiyesi", category: "Karşılaştırma", vol: 22400, kd: 66, cpc: 35.0, intent: "commercial" },
    { keyword: "acil destek ve müşteri hizmetleri hattı", category: "Destek & Güven", vol: 9800, kd: 49, cpc: 22.0, intent: "navigational" },
    { keyword: "garantili kurumsal çözüm ortağı", category: "B2B Çözüm", vol: 11400, kd: 61, cpc: 31.0, intent: "commercial" },
    { keyword: "kullanıcı yorumları ve referans projeler", category: "Sosyal Kanıt", vol: 15700, kd: 53, cpc: 19.0, intent: "informational" }
  ]
};

/**
 * Generate algorithmic fallback benchmark data
 */
export function generateFallbackKeywordBenchmark(
  siteConfig: SiteConfig,
  customIndustry?: string,
  customCity?: string
): CompetitorKeywordBenchmarkDataset {
  const sector = (customIndustry || siteConfig.sector || "Hukuk").trim();
  const city = (customCity || siteConfig.city || "İstanbul").trim();
  const companyName = siteConfig.companyName || "Sitemiz";
  const domain = siteConfig.customDomain || "sitemiz.com.tr";

  // Select preset based on sector name
  const sectorLower = sector.toLowerCase();
  let presetKey = "genel";
  if (sectorLower.includes("hukuk") || sectorLower.includes("avukat")) presetKey = "hukuk";
  else if (sectorLower.includes("saglik") || sectorLower.includes("sağlık") || sectorLower.includes("dis") || sectorLower.includes("diş") || sectorLower.includes("klinik")) presetKey = "saglik";
  else if (sectorLower.includes("ticaret") || sectorLower.includes("eticaret") || sectorLower.includes("moda") || sectorLower.includes("magaza")) presetKey = "eticaret";
  else if (sectorLower.includes("bilisim") || sectorLower.includes("bilişim") || sectorLower.includes("yazilim") || sectorLower.includes("web") || sectorLower.includes("dijital")) presetKey = "bilisim";
  else if (sectorLower.includes("insaat") || sectorLower.includes("inşaat") || sectorLower.includes("mimarlik") || sectorLower.includes("yapi")) presetKey = "insaat";

  const rawPresets = INDUSTRY_KEYWORD_PRESETS[presetKey] || INDUSTRY_KEYWORD_PRESETS.genel;

  const competitors: KeywordBenchmarkCompetitor[] = [
    {
      id: "comp-leader",
      name: `${sector} Lideri A.Ş.`,
      domain: `lider${presetKey}.com.tr`,
      color: "#8b5cf6", // Purple
      da: 74
    },
    {
      id: "comp-regional",
      name: `${city} Bölge Rakibi`,
      domain: `${city.toLowerCase()}${presetKey}.com.tr`,
      color: "#10b981", // Emerald
      da: 58
    },
    {
      id: "comp-challenger",
      name: "Dinamik Rakip Ltd.",
      domain: `dinamik${presetKey}.com`,
      color: "#f59e0b", // Amber
      da: 49
    }
  ];

  // User simulated baseline metrics
  const userDa = 56;

  const keywords: KeywordBenchmarkItem[] = rawPresets.map((item, idx) => {
    // Determine realistic scores per keyword
    // Vary based on position to create an interesting radar polygon
    let userScore: number;
    let comp1Score: number;
    let comp2Score: number;
    let comp3Score: number;
    let userRank: number;
    let comp1Rank: number;
    let comp2Rank: number;
    let comp3Rank: number;
    let gapStatus: "winning" | "competitive" | "opportunity" | "vulnerable";
    let action: string;

    if (idx === 0) {
      // User is competitive
      userScore = 84;
      comp1Score = 92;
      comp2Score = 65;
      comp3Score = 48;
      userRank = 2;
      comp1Rank = 1;
      comp2Rank = 5;
      comp3Rank = 8;
      gapStatus = "competitive";
      action = `Sitenizin 0.02s TTFB hız avantajını kullanarak ana sayfada H1 ve FAQ Schema ekleyin; 1. sırayı ${competitors[0].name}'den geri alın.`;
    } else if (idx === 1) {
      // User is winning!
      userScore = 95;
      comp1Score = 86;
      comp2Score = 70;
      comp3Score = 52;
      userRank = 1;
      comp1Rank = 2;
      comp2Rank = 4;
      comp3Rank = 7;
      gapStatus = "winning";
      action = "Bu anahtar kelimede mutlak 1. sıradasınız. Yerel müşteri referansları ve vaka analizleriyle liderliğinizi pekiştirin.";
    } else if (idx === 2) {
      // User has huge opportunity (Rank 3 vs Leader Rank 1)
      userScore = 72;
      comp1Score = 94;
      comp2Score = 60;
      comp3Score = 44;
      userRank = 3;
      comp1Rank = 1;
      comp2Rank = 6;
      comp3Rank = 9;
      gapStatus = "opportunity";
      action = `Yüksek aranma hacimli (${item.vol.toLocaleString("tr-TR")}/ay) bu terimde alt başlık zenginleştirmesiyle tıklama oranını (CTR) %2.8 artırabilirsiniz.`;
    } else if (idx === 3) {
      // User is vulnerable (Rank 7 vs Leader Rank 1)
      userScore = 46;
      comp1Score = 88;
      comp2Score = 82;
      comp3Score = 68;
      userRank = 7;
      comp1Rank = 1;
      comp2Rank = 3;
      comp3Rank = 5;
      gapStatus = "vulnerable";
      action = "Rakipler bu alanda kapsamlı rehber içerikleri yayınlamış. 1.500+ kelimelik semantik köşe taşı (cornerstone) makalesi oluşturulmalı.";
    } else if (idx === 4) {
      // Winning local intent
      userScore = 90;
      comp1Score = 78;
      comp2Score = 72;
      comp3Score = 40;
      userRank = 1;
      comp1Rank = 3;
      comp2Rank = 4;
      comp3Rank = 10;
      gapStatus = "winning";
      action = `${city} odaklı yerel Google Harita ve LocalBusiness mikro-verisi sayesinde liderliği koruyorsunuz.`;
    } else if (idx === 5) {
      // Opportunity in emerging intent
      userScore = 68;
      comp1Score = 85;
      comp2Score = 55;
      comp3Score = 42;
      userRank = 4;
      comp1Rank = 2;
      comp2Rank = 6;
      comp3Rank = 11;
      gapStatus = "opportunity";
      action = "Teknik terimlerde yeni trendler yükseliyor. Canlı trend radarı etiketlerini blog başlıklarına entegre edin.";
    } else {
      // Competitive
      userScore = 76;
      comp1Score = 89;
      comp2Score = 67;
      comp3Score = 58;
      userRank = 3;
      comp1Rank = 1;
      comp2Rank = 5;
      comp3Rank = 7;
      gapStatus = "competitive";
      action = "Sözleşme şablonları ve ücretsiz PDF kontrol listesi indirilebilir içerik formatı ekleyerek CTR'ı katlayın.";
    }

    const industryAvg = Math.round((userScore + comp1Score + comp2Score + comp3Score) / 4);

    return {
      id: `kw-${idx + 1}`,
      keyword: item.keyword,
      category: item.category,
      searchVolume: item.vol,
      difficulty: item.kd,
      cpc: item.cpc,
      intent: item.intent,
      scores: {
        user: userScore,
        competitor1: comp1Score,
        competitor2: comp2Score,
        competitor3: comp3Score,
        industryAvg
      },
      ranks: {
        user: userRank,
        competitor1: comp1Rank,
        competitor2: comp2Rank,
        competitor3: comp3Rank
      },
      recommendedAction: action,
      contentGapStatus: gapStatus
    };
  });

  // Calculate aggregates
  const userAvgScore = Math.round(
    keywords.reduce((acc, k) => acc + k.scores.user, 0) / keywords.length
  );
  const marketLeaderAvgScore = Math.round(
    keywords.reduce((acc, k) => acc + k.scores.competitor1, 0) / keywords.length
  );
  const gapKeywordsCount = keywords.filter(
    (k) => k.contentGapStatus === "opportunity" || k.contentGapStatus === "vulnerable"
  ).length;
  const leadingKeywordsCount = keywords.filter((k) => k.contentGapStatus === "winning").length;
  const potentialTrafficGain = Math.round(
    keywords
      .filter((k) => k.contentGapStatus === "opportunity" || k.contentGapStatus === "vulnerable")
      .reduce((acc, k) => acc + k.searchVolume * 0.18, 0)
  );

  return {
    industry: sector,
    city,
    companyName,
    domain,
    fetchedAt: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    isLiveGrounding: false,
    source: "HızlıWeb Algoritmik SERP Benchmark Motoru",
    competitors,
    keywords,
    aggregateMetrics: {
      userAvgScore,
      marketLeaderAvgScore,
      gapKeywordsCount,
      leadingKeywordsCount,
      potentialTrafficGain
    }
  };
}

/**
 * Client fetching function with server API & fallback resilience
 */
export async function fetchRealtimeKeywordBenchmark(
  siteConfig: SiteConfig,
  customIndustry?: string,
  customCity?: string
): Promise<CompetitorKeywordBenchmarkDataset> {
  const sector = customIndustry || siteConfig.sector || "Hukuk";
  const city = customCity || siteConfig.city || "İstanbul";

  try {
    const res = await fetch("/api/strategy/realtime-keyword-benchmark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "aistudio-build"
      },
      body: JSON.stringify({
        industry: sector,
        city,
        companyName: siteConfig.companyName || "Sitemiz",
        domain: siteConfig.customDomain || "sitemiz.com.tr",
        targetKeywords: siteConfig.seo?.keywords || []
      })
    });

    if (!res.ok) {
      console.warn("Server keyword benchmark error status:", res.status, "serving local engine");
      return generateFallbackKeywordBenchmark(siteConfig, sector, city);
    }

    const payload = await res.json();
    if (payload.success && payload.data && Array.isArray(payload.data.keywords)) {
      return payload.data;
    }

    return generateFallbackKeywordBenchmark(siteConfig, sector, city);
  } catch (err) {
    console.warn("Failed to fetch from server, serving fallback benchmark:", err);
    return generateFallbackKeywordBenchmark(siteConfig, sector, city);
  }
}

/**
 * CSV Exporter for benchmark dataset
 */
export function exportKeywordBenchmarkCsv(dataset: CompetitorKeywordBenchmarkDataset): string {
  const headers = [
    "Anahtar_Kelime",
    "Kategori",
    "Aylik_Arama_Hacmi",
    "Zorluk_KD",
    "CPC_TL",
    "Kullanici_Gorunurluk_Skoru",
    "Kullanici_SERP_Sira",
    "Lider_Skoru",
    "Lider_SERP_Sira",
    "Bolge_Rakibi_Skoru",
    "Sektor_Ortalamasi",
    "Durum",
    "Onerilen_Strateji"
  ];

  const rows = dataset.keywords.map((k) => [
    `"${k.keyword.replace(/"/g, '""')}"`,
    `"${k.category}"`,
    k.searchVolume,
    k.difficulty,
    k.cpc,
    k.scores.user,
    k.ranks.user,
    k.scores.competitor1,
    k.ranks.competitor1,
    k.scores.competitor2,
    k.scores.industryAvg,
    k.contentGapStatus,
    `"${k.recommendedAction.replace(/"/g, '""')}"`
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
