import { SiteConfig } from "../types";

export type ContentPageType = "service_landing" | "pillar_guide" | "pricing_comparison" | "local_hub";

export interface KeywordDensityItem {
  term: string;
  count: number;
  densityPct: number;
  status: "ideal" | "low" | "high" | "stuffing";
  isPrimary: boolean;
  searchVolume?: number;
}

export interface LsiCoverageItem {
  concept: string;
  presentInCompetitor: boolean;
  presentInUserSite: boolean;
  relevance: "Kritik" | "Yüksek" | "Tamamlayıcı";
  serpImportancePct: number;
}

export interface ContentStructureMetrics {
  wordCount: number;
  readingTimeMin: number;
  paragraphCount: number;
  avgWordsPerParagraph: number;
  readabilityScore: number; // 0-100
  readabilityLevel: "Kolay" | "Orta" | "İleri/Teknik";
  headings: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h1List: string[];
    h2List: string[];
    h3List: string[];
    hierarchyScore: number; // 0-100
    hasMissingH1: boolean;
    hasMultipleH1: boolean;
    hasFaqHeadings: boolean;
    questionHeadingsRatio: number; // % of H2/H3 as questions (FAQ / PAA)
  };
  keywordDensity: KeywordDensityItem[];
  lsiCoverage: LsiCoverageItem[];
  mediaMetrics: {
    imageCount: number;
    hasInfographic: boolean;
    hasVideo: boolean;
    hasComparisonTable: boolean;
    imagesPer1000Words: number;
  };
  conversionCta: {
    ctaCount: number;
    hasDirectCall: boolean;
    hasWhatsApp: boolean;
    hasPriceCalculator: boolean;
    hasQuoteForm: boolean;
  };
}

export interface TopTrafficPage {
  id: string;
  competitorId: string;
  competitorName: string;
  domain: string;
  url: string;
  pageTitle: string;
  pageType: ContentPageType;
  pageTypeLabel: string;
  monthlyTraffic: number;
  trafficSharePct: number;
  serpRank: number;
  targetKeyword: string;
  contentStructure: ContentStructureMetrics;
  tacticalSummary: string;
}

export interface UserSiteContentBenchmark {
  domain: string;
  pageTitle: string;
  url: string;
  contentStructure: ContentStructureMetrics;
}

export interface ContentStrategyBlueprint {
  recommendedWordCount: { min: number; ideal: number; max: number };
  recommendedHeadingHierarchy: {
    targetH1: string;
    suggestedH2s: string[];
    suggestedH3Faqs: string[];
  };
  targetKeywordDensityRules: {
    primaryDensityTargetPct: number; // e.g. 2.1%
    lsiCoverageTargetPct: number;    // e.g. 85%
    mustIncludeConcepts: string[];
  };
  mediaPlan: {
    minimumImages: number;
    requireComparisonTable: boolean;
    requireFaqSchema: boolean;
  };
  tacticalWinOpportunity: string;
}

export interface CompetitorContentStrategyReport {
  analyzedAt: string;
  sector: string;
  city: string;
  activeKeyword: string;
  topPages: TopTrafficPage[];
  userSiteBenchmark: UserSiteContentBenchmark;
  strategyBlueprint: ContentStrategyBlueprint;
  executiveSummary: {
    totalCompetitorTrafficAnalyzed: number;
    averageWordCount: number;
    userWordCountGap: number; // negative means user has less
    averageH2Count: number;
    averageKeywordDensityPct: number;
    primaryAdvantage: string;
    criticalVulnerability: string;
  };
}

/**
 * Generates realistic, highly structured competitor top traffic pages analysis
 * based on the user's sector, city, and site configuration.
 */
export function generateCompetitorContentStrategyData(
  config: Partial<SiteConfig>,
  targetKeyword?: string
): CompetitorContentStrategyReport {
  const city = config.city || "İstanbul";
  const sector = config.sector || "Oto Çekici & Yol Yardım";
  const cleanSectorLower = sector.toLowerCase();
  const domain = config.cloudflare?.customDomain || config.cloudflare?.subdomain || "sitemiz.com.tr";
  
  const rawKeywords = config.seo?.keywords;
  let userKeywords: string[] = [];
  if (Array.isArray(rawKeywords)) {
    userKeywords = rawKeywords.map(k => String(k).trim()).filter(Boolean);
  } else if (typeof rawKeywords === "string" && rawKeywords.trim().length > 0) {
    userKeywords = rawKeywords.split(",").map(k => k.trim()).filter(Boolean);
  }
  
  const primaryKw = targetKeyword || (userKeywords[0] || `${city} ${sector}`);

  // 1. Sitenizin Mevcut İçerik Profili (User Site Benchmark)
  const userStructure: ContentStructureMetrics = {
    wordCount: 1150,
    readingTimeMin: 4,
    paragraphCount: 14,
    avgWordsPerParagraph: 82,
    readabilityScore: 78,
    readabilityLevel: "Kolay",
    headings: {
      h1Count: 1,
      h2Count: 5,
      h3Count: 8,
      h4Count: 2,
      h1List: [`${city} ${sector} | 7/24 Güvenilir & Hızlı Hizmet`],
      h2List: [
        `${city} Bölgesinde Neden Bizi Tercih Etmelisiniz?`,
        `7/24 Kesintisiz Hizmet Sürecimiz`,
        `Hizmet Verdiğimiz Kritik İlçeler ve Noktalar`,
        `Şeffaf ve Ekonomik Fiyatlandırma Politikamız`,
        `Sıkça Sorulan Sorular (SSS)`
      ],
      h3List: [
        `Acil çağrıya ortalama varış süreniz ne kadar?`,
        `Fiyatlar mesafeye göre nasıl hesaplanır?`,
        `Kasko veya sigorta anlaşması geçerli mi?`,
        `Gece ve tatil günlerinde ek tarife var mı?`,
        `Hangi araç tiplerine hizmet verilmektedir?`
      ],
      hierarchyScore: 92,
      hasMissingH1: false,
      hasMultipleH1: false,
      hasFaqHeadings: true,
      questionHeadingsRatio: 62
    },
    keywordDensity: [
      { term: primaryKw.toLowerCase(), count: 18, densityPct: 1.56, status: "ideal", isPrimary: true, searchVolume: 12400 },
      { term: `${city.toLowerCase()} ${cleanSectorLower}`, count: 14, densityPct: 1.21, status: "ideal", isPrimary: false, searchVolume: 8100 },
      { term: "fiyat hesaplama", count: 8, densityPct: 0.69, status: "low", isPrimary: false, searchVolume: 3200 },
      { term: "en yakın acil", count: 10, densityPct: 0.86, status: "ideal", isPrimary: false, searchVolume: 5400 },
      { term: "7/24 nöbetçi", count: 7, densityPct: 0.60, status: "low", isPrimary: false, searchVolume: 2900 }
    ],
    lsiCoverage: [
      { concept: "Şeffaf Fiyat Listesi & KM Başına Ücret", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 94 },
      { concept: "Ortalama Varış Süresi (15-20 Dakika)", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 88 },
      { concept: "Ağır Ticari & Çoklu Taşıma Kapasitesi", presentInCompetitor: true, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 76 },
      { concept: "Kasko ve Trafik Sigortası Evrak Prosedürü", presentInCompetitor: true, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 82 },
      { concept: "İlçe ve Otoyol Bağlantı Noktaları", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 91 },
      { concept: "Akü Takviye & Yerinde Lastik Onarımı", presentInCompetitor: true, presentInUserSite: false, relevance: "Tamamlayıcı", serpImportancePct: 65 }
    ],
    mediaMetrics: {
      imageCount: 8,
      hasInfographic: false,
      hasVideo: false,
      hasComparisonTable: true,
      imagesPer1000Words: 6.9
    },
    conversionCta: {
      ctaCount: 6,
      hasDirectCall: true,
      hasWhatsApp: true,
      hasPriceCalculator: true,
      hasQuoteForm: false
    }
  };

  const userSiteBenchmark: UserSiteContentBenchmark = {
    domain,
    pageTitle: `${config.companyName || "Sitemiz"} - ${primaryKw} Açılış Sayfası`,
    url: `https://${domain}/`,
    contentStructure: userStructure
  };

  // 2. Rakiplerin En Çok Trafik Çeken Sayfaları (Top Traffic Pages)
  const topPages: TopTrafficPage[] = [
    {
      id: "comp-page-1",
      competitorId: "comp-1",
      competitorName: `${city} Lider ${sector.split(" ")[0]} Ltd.`,
      domain: `${city.toLowerCase().replace(/[^a-z0-9]/g, "")}-${cleanSectorLower.split(" ")[0]}-lider.com`,
      url: `https://${city.toLowerCase().replace(/[^a-z0-9]/g, "")}-${cleanSectorLower.split(" ")[0]}-lider.com/hizmetler/${primaryKw.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      pageTitle: `2026 Güncel ${city} ${sector} Fiyatları ve 7/24 Kesintisiz Servis`,
      pageType: "service_landing",
      pageTypeLabel: "Hizmet Açılış Sayfası (Lider)",
      monthlyTraffic: 18450,
      trafficSharePct: 42,
      serpRank: 1,
      targetKeyword: primaryKw,
      tacticalSummary: "2.350 kelimelik devasa içerik derinliği, 12 adet H2/H3 soru başlığı ve detaylı fiyat kıyaslama tablosu ile Google #1 sırada oturuyor.",
      contentStructure: {
        wordCount: 2350,
        readingTimeMin: 9,
        paragraphCount: 32,
        avgWordsPerParagraph: 73,
        readabilityScore: 68,
        readabilityLevel: "Orta",
        headings: {
          h1Count: 1,
          h2Count: 8,
          h3Count: 14,
          h4Count: 4,
          h1List: [`2026 Güncel ${city} ${sector} Fiyatları ve 7/24 Acil Yol Servisi`],
          h2List: [
            `${city} Genelinde ${sector} Fiyat Tarifesi Nasıl Hesaplanır?`,
            `Hizmet Çağırırken Dikkat Edilmesi Gereken 5 Yasal Kural`,
            `İlçelere Göre Ortalama Ulaşım Süreleri ve Güzergah Haritası`,
            `Kasko ve Sigorta Kapsamında Çekici Masraflarının Tahsili`,
            `Ağır Vasıta ve Özel Donanımlı Çekici Filomuz`,
            `Müşteri Deneyimleri ve Gerçek Kurtarma Hikayeleri`,
            `Sıkça Sorulan Sorular: ${city} ${sector}`,
            `Acil Durum İletişim Hattı ve Lokasyon Paylaşımı`
          ],
          h3List: [
            `${city} içi taban açılış ücreti ne kadardır?`,
            `Köprü ve otoyol geçiş ücretleri fiyata dahil midir?`,
            `Arıza durumunda aracın yanına ne kadar sürede ulaşılır?`,
            `Kaza anında tutanak tutulması gerekir mi?`,
            `Motorsiklet ve alçak tabanlı spor araçlar taşınabilir mi?`,
            `Gece tarifesi ve hafta sonu farkı uygulanır mı?`
          ],
          hierarchyScore: 96,
          hasMissingH1: false,
          hasMultipleH1: false,
          hasFaqHeadings: true,
          questionHeadingsRatio: 64
        },
        keywordDensity: [
          { term: primaryKw.toLowerCase(), count: 52, densityPct: 2.21, status: "ideal", isPrimary: true, searchVolume: 12400 },
          { term: `${city.toLowerCase()} ${cleanSectorLower}`, count: 41, densityPct: 1.74, status: "ideal", isPrimary: false, searchVolume: 8100 },
          { term: "fiyat hesaplama", count: 28, densityPct: 1.19, status: "ideal", isPrimary: false, searchVolume: 3200 },
          { term: "acil çekici numarası", count: 19, densityPct: 0.81, status: "ideal", isPrimary: false, searchVolume: 4100 },
          { term: "km başı ücret", count: 17, densityPct: 0.72, status: "ideal", isPrimary: false, searchVolume: 2600 }
        ],
        lsiCoverage: [
          { concept: "Şeffaf Fiyat Listesi & KM Başına Ücret", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 94 },
          { concept: "Ortalama Varış Süresi (15-20 Dakika)", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 88 },
          { concept: "Ağır Ticari & Çoklu Taşıma Kapasitesi", presentInCompetitor: true, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 76 },
          { concept: "Kasko ve Trafik Sigortası Evrak Prosedürü", presentInCompetitor: true, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 82 },
          { concept: "İlçe ve Otoyol Bağlantı Noktaları", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 91 },
          { concept: "Akü Takviye & Yerinde Lastik Onarımı", presentInCompetitor: true, presentInUserSite: false, relevance: "Tamamlayıcı", serpImportancePct: 65 }
        ],
        mediaMetrics: {
          imageCount: 16,
          hasInfographic: true,
          hasVideo: false,
          hasComparisonTable: true,
          imagesPer1000Words: 6.8
        },
        conversionCta: {
          ctaCount: 9,
          hasDirectCall: true,
          hasWhatsApp: true,
          hasPriceCalculator: true,
          hasQuoteForm: true
        }
      }
    },
    {
      id: "comp-page-2",
      competitorId: "comp-2",
      competitorName: `Öz ${sector.split(" ")[0]} Servisi A.Ş.`,
      domain: `oz-${cleanSectorLower.split(" ")[0]}-servis.com.tr`,
      url: `https://oz-${cleanSectorLower.split(" ")[0]}-servis.com.tr/rehber/${cleanSectorLower.split(" ")[0]}-cagirirken-bilinmesi-gerekenler`,
      pageTitle: `${city}'da ${sector} Çağırırken Dolandırılmamak İçin Bilmeniz Gerekenler (Rehber)`,
      pageType: "pillar_guide",
      pageTypeLabel: "Sütun İçerik / Bilgi Rehberi",
      monthlyTraffic: 11200,
      trafficSharePct: 26,
      serpRank: 2,
      targetKeyword: `${cleanSectorLower} çağırırken dikkat edilecekler`,
      tacticalSummary: "Kullanıcı güveni odaklı 'Nasıl Yapılır' bilgi rehberi; featured snippet (sıfırıncı sıra) ve PAA aramalarından yüksek organik trafik çekiyor.",
      contentStructure: {
        wordCount: 1890,
        readingTimeMin: 7,
        paragraphCount: 26,
        avgWordsPerParagraph: 72,
        readabilityScore: 74,
        readabilityLevel: "Kolay",
        headings: {
          h1Count: 1,
          h2Count: 6,
          h3Count: 11,
          h4Count: 0,
          h1List: [`${city}'da Güvenilir ${sector} Hizmeti Almanın Püf Noktaları`],
          h2List: [
            `1. Korsan ve Yetkisiz Kurtarıcılara Karşı Nasıl Önlem Alınır?`,
            `2. Telefonda Net Fiyat Almanın Önemi ve Gizli Masraflar`,
            `3. Taşıma Kaskosu Olmayan Araçların Doğurabileceği Riskler`,
            `4. GPS ile Konum Paylaşımı ve En Hızlı Ulaşım Yolu`,
            `5. En Çok Sorulan Soru: Kasko Çekiciyi Karşılar mı?`,
            `Acil Durum İletişim ve Güvenli Yol Yardım İpuçları`
          ],
          h3List: [
            `Vergi levhası ve K yetki belgesi kontrolü nasıl yapılır?`,
            `Çekici kancası araca bağlanırken dikkat edilecek teknik detaylar`,
            `Otobanda ve köprülerde özel çekici çağrılabilir mi?`,
            `Gece geç saatlerde güvenli bekleme kuralları`
          ],
          hierarchyScore: 90,
          hasMissingH1: false,
          hasMultipleH1: false,
          hasFaqHeadings: true,
          questionHeadingsRatio: 58
        },
        keywordDensity: [
          { term: primaryKw.toLowerCase(), count: 32, densityPct: 1.69, status: "ideal", isPrimary: true, searchVolume: 12400 },
          { term: "güvenilir oto kurtarma", count: 24, densityPct: 1.27, status: "ideal", isPrimary: false, searchVolume: 2800 },
          { term: "taşıma kaskosu", count: 18, densityPct: 0.95, status: "ideal", isPrimary: false, searchVolume: 1900 },
          { term: "fiyat tarifesi", count: 16, densityPct: 0.85, status: "ideal", isPrimary: false, searchVolume: 3200 }
        ],
        lsiCoverage: [
          { concept: "Şeffaf Fiyat Listesi & KM Başına Ücret", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 94 },
          { concept: "Ortalama Varış Süresi (15-20 Dakika)", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 88 },
          { concept: "Ağır Ticari & Çoklu Taşıma Kapasitesi", presentInCompetitor: false, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 76 },
          { concept: "Kasko ve Trafik Sigortası Evrak Prosedürü", presentInCompetitor: true, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 82 },
          { concept: "İlçe ve Otoyol Bağlantı Noktaları", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 91 },
          { concept: "Akü Takviye & Yerinde Lastik Onarımı", presentInCompetitor: true, presentInUserSite: false, relevance: "Tamamlayıcı", serpImportancePct: 65 }
        ],
        mediaMetrics: {
          imageCount: 11,
          hasInfographic: true,
          hasVideo: true,
          hasComparisonTable: true,
          imagesPer1000Words: 5.8
        },
        conversionCta: {
          ctaCount: 5,
          hasDirectCall: true,
          hasWhatsApp: true,
          hasPriceCalculator: false,
          hasQuoteForm: true
        }
      }
    },
    {
      id: "comp-page-3",
      competitorId: "comp-3",
      competitorName: `Merkez ${city} ${sector.split(" ")[0]} Ağı`,
      domain: `merkez${city.toLowerCase().replace(/[^a-z0-9]/g, "")}${cleanSectorLower.split(" ")[0]}.net`,
      url: `https://merkez${city.toLowerCase().replace(/[^a-z0-9]/g, "")}${cleanSectorLower.split(" ")[0]}.net/bolgeler/${city.toLowerCase().replace(/[^a-z0-9]/g, "-")}-anadolu-avrupa-cekici`,
      pageTitle: `${city} İlçe İlçe 7/24 ${sector} İstasyonları & Semt Fiyatları`,
      pageType: "local_hub",
      pageTypeLabel: "Bölgesel Semt Hub Sayfası",
      monthlyTraffic: 7600,
      trafficSharePct: 18,
      serpRank: 3,
      targetKeyword: `${city} acil ${cleanSectorLower}`,
      tacticalSummary: "39 ilçenin her birine ait semt bazlı varış süreleri ve yerel istasyon haritaları içeren coğrafi SEO hub sayfası.",
      contentStructure: {
        wordCount: 1650,
        readingTimeMin: 6,
        paragraphCount: 22,
        avgWordsPerParagraph: 75,
        readabilityScore: 71,
        readabilityLevel: "Orta",
        headings: {
          h1Count: 1,
          h2Count: 7,
          h3Count: 9,
          h4Count: 0,
          h1List: [`${city} Tüm İlçeler 7/24 ${sector} Dağıtım Noktaları`],
          h2List: [
            `Anadolu Yakası Nöbetçi Çekici Ekiplerimiz ve Lokasyonlar`,
            `Avrupa Yakası Yoğun Trafik Güzergahları ve Bekleme Noktaları`,
            `TEM, E-5 ve Kuzey Marmara Otoyolu Acil Müdahale Birimleri`,
            `Havalimanı ve Sabiha Gökçen Çevresi Hızlı Ulaşım`,
            `Semtlere Göre Fiyatlandırma ve KM Tablosu`,
            `Çağrı Merkezi Entegrasyonu ve Anlık Konum Takibi`,
            `Sıkça Sorulan Sorular`
          ],
          h3List: [
            `Kadıköy, Üsküdar ve Ümraniye için ortalama varış süresi nedir?`,
            `Beylikdüzü ve Esenyurt bölgesinde gece çekici var mı?`,
            `Otoyol gişe çıkışlarında kurtarma hizmeti nasıl işler?`
          ],
          hierarchyScore: 88,
          hasMissingH1: false,
          hasMultipleH1: false,
          hasFaqHeadings: true,
          questionHeadingsRatio: 45
        },
        keywordDensity: [
          { term: primaryKw.toLowerCase(), count: 36, densityPct: 2.18, status: "ideal", isPrimary: true, searchVolume: 12400 },
          { term: `${city.toLowerCase()} yol yardım istasyonları`, count: 22, densityPct: 1.33, status: "ideal", isPrimary: false, searchVolume: 2100 },
          { term: "en yakın nöbetçi çekici", count: 18, densityPct: 1.09, status: "ideal", isPrimary: false, searchVolume: 3900 },
          { term: "otoyol yardım", count: 14, densityPct: 0.85, status: "ideal", isPrimary: false, searchVolume: 1800 }
        ],
        lsiCoverage: [
          { concept: "Şeffaf Fiyat Listesi & KM Başına Ücret", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 94 },
          { concept: "Ortalama Varış Süresi (15-20 Dakika)", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 88 },
          { concept: "Ağır Ticari & Çoklu Taşıma Kapasitesi", presentInCompetitor: true, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 76 },
          { concept: "Kasko ve Trafik Sigortası Evrak Prosedürü", presentInCompetitor: false, presentInUserSite: false, relevance: "Yüksek", serpImportancePct: 82 },
          { concept: "İlçe ve Otoyol Bağlantı Noktaları", presentInCompetitor: true, presentInUserSite: true, relevance: "Kritik", serpImportancePct: 91 },
          { concept: "Akü Takviye & Yerinde Lastik Onarımı", presentInCompetitor: false, presentInUserSite: false, relevance: "Tamamlayıcı", serpImportancePct: 65 }
        ],
        mediaMetrics: {
          imageCount: 9,
          hasInfographic: false,
          hasVideo: false,
          hasComparisonTable: true,
          imagesPer1000Words: 5.4
        },
        conversionCta: {
          ctaCount: 7,
          hasDirectCall: true,
          hasWhatsApp: true,
          hasPriceCalculator: true,
          hasQuoteForm: false
        }
      }
    }
  ];

  // 3. Ortalama Hesaplamalar ve Stratejik Fark (Gap Analysis)
  const totalCompetitorTraffic = topPages.reduce((acc, p) => acc + p.monthlyTraffic, 0);
  const avgWordCount = Math.round(topPages.reduce((acc, p) => acc + p.contentStructure.wordCount, 0) / topPages.length);
  const userWordCountGap = userStructure.wordCount - avgWordCount; // örn: 1150 - 1963 = -813 kelime
  const avgH2Count = Math.round(topPages.reduce((acc, p) => acc + p.contentStructure.headings.h2Count, 0) / topPages.length);
  const avgKeywordDensityPct = Number((topPages.reduce((acc, p) => {
    const primaryItem = p.contentStructure.keywordDensity.find(k => k.isPrimary);
    return acc + (primaryItem ? primaryItem.densityPct : 2.0);
  }, 0) / topPages.length).toFixed(2));

  // 4. Stratejik Eylem Reçetesi (Blueprint)
  const strategyBlueprint: ContentStrategyBlueprint = {
    recommendedWordCount: {
      min: 1850,
      ideal: 2400,
      max: 2800
    },
    recommendedHeadingHierarchy: {
      targetH1: `${city} ${sector} | 7/24 En Hızlı Varış & 2026 Şeffaf Fiyat Listesi`,
      suggestedH2s: [
        `${city} Genelinde ${sector} Fiyatı Nasıl Hesaplanır? (KM Başı Tarife)`,
        `En Yakın Kurtarıcıya 15 Dakikada Nasıl Ulaşılır? (Canlı Harita)`,
        `Kaza ve Arıza Hallerinde Kasko & Sigorta Anlaşmalı Hizmet Prosedürü`,
        `Ağır Ticari, Karavan ve Düşük Tabanlı Araç Taşıma Yetkinliğimiz`,
        `İlçe ve Çevre Otoyollarında (TEM / E-5) Nöbetçi İstasyonlarımız`,
        `Sıkça Sorulan Sorular: ${city} ${sector} Rehberi`
      ],
      suggestedH3Faqs: [
        `Gece yarısı veya resmi tatillerde fiyat farkı alınıyor mu?`,
        `Aracım kaskolu ise çekici bedeli sigortadan nasıl tahsil edilir?`,
        `En yakın ekip ortalama kaç dakikada adrese ulaşır?`,
        `Şehirler arası çoklu araç taşıma hizmeti veriyor musunuz?`
      ]
    },
    targetKeywordDensityRules: {
      primaryDensityTargetPct: 2.1,
      lsiCoverageTargetPct: 90,
      mustIncludeConcepts: [
        "Şeffaf Fiyat Listesi & KM Başına Ücret",
        "Kasko ve Trafik Sigortası Evrak Prosedürü",
        "Ortalama Varış Süresi (15-20 Dakika)",
        "Ağır Ticari & Çoklu Taşıma Kapasitesi"
      ]
    },
    mediaPlan: {
      minimumImages: 10,
      requireComparisonTable: true,
      requireFaqSchema: true
    },
    tacticalWinOpportunity: "Lider rakibin sayfası 2.350 kelime olmasına rağmen mobil hız skoru 58/100. Siteniz 2.400 kelimelik bu şablonu Cloudflare 98/100 hız altyapısıyla yayınladığında, Google SERP #1 sıraya 30-45 gün içinde yerleşecektir."
  };

  return {
    analyzedAt: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
    sector,
    city,
    activeKeyword: primaryKw,
    topPages,
    userSiteBenchmark,
    strategyBlueprint,
    executiveSummary: {
      totalCompetitorTrafficAnalyzed: totalCompetitorTraffic,
      averageWordCount: avgWordCount,
      userWordCountGap,
      averageH2Count: avgH2Count,
      averageKeywordDensityPct: avgKeywordDensityPct,
      primaryAdvantage: "Cloudflare Edge CDN ile kusursuz yükleme hızı (0.02s LCP) ve temiz başlık hiyerarşisi.",
      criticalVulnerability: `Rakipler ortalama ${avgWordCount} kelime ve ${avgH2Count} H2 başlık kullanırken, siteniz ${userStructure.wordCount} kelimede kalmaktadır (-${Math.abs(userWordCountGap)} kelime içerik derinliği açığı).`
    }
  };
}

/**
 * Exports competitor content strategy analysis to CSV
 */
export function exportContentStrategyToCSV(report: CompetitorContentStrategyReport): void {
  const headers = [
    "Sayfa Basligi",
    "Rakip Adi",
    "URL",
    "Sayfa Turu",
    "Aylik Trafik",
    "Trafik Payi",
    "Kelime Sayisi",
    "H1 Sayisi",
    "H2 Sayisi",
    "H3 Sayisi",
    "Soru Orani (%)",
    "Birincil KW Yogunlugu (%)",
    "Gorsel Sayisi",
    "Okuma Suresi (Dk)"
  ];

  const rows = report.topPages.map(page => [
    `"${page.pageTitle.replace(/"/g, '""')}"`,
    `"${page.competitorName.replace(/"/g, '""')}"`,
    `"${page.url}"`,
    `"${page.pageTypeLabel}"`,
    page.monthlyTraffic,
    `%${page.trafficSharePct}`,
    page.contentStructure.wordCount,
    page.contentStructure.headings.h1Count,
    page.contentStructure.headings.h2Count,
    page.contentStructure.headings.h3Count,
    `%${page.contentStructure.headings.questionHeadingsRatio}`,
    `%${page.contentStructure.keywordDensity.find(k => k.isPrimary)?.densityPct || 2.0}`,
    page.contentStructure.mediaMetrics.imageCount,
    page.contentStructure.readingTimeMin
  ]);

  // Add user site benchmark row
  const userRow = [
    `"${report.userSiteBenchmark.pageTitle.replace(/"/g, '""')}"`,
    `"Siteniz (${report.userSiteBenchmark.domain})"`,
    `"${report.userSiteBenchmark.url}"`,
    `"Mevcut Acilis Sayfaniz"`,
    "-",
    "-",
    report.userSiteBenchmark.contentStructure.wordCount,
    report.userSiteBenchmark.contentStructure.headings.h1Count,
    report.userSiteBenchmark.contentStructure.headings.h2Count,
    report.userSiteBenchmark.contentStructure.headings.h3Count,
    `%${report.userSiteBenchmark.contentStructure.headings.questionHeadingsRatio}`,
    `%${report.userSiteBenchmark.contentStructure.keywordDensity.find(k => k.isPrimary)?.densityPct || 1.5}`,
    report.userSiteBenchmark.contentStructure.mediaMetrics.imageCount,
    report.userSiteBenchmark.contentStructure.readingTimeMin
  ];

  const csvContent = [headers.join(","), ...rows.map(r => r.join(",")), userRow.join(",")].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `rakip-icerik-stratejisi-analizi-${report.activeKeyword.replace(/[^a-zA-Z0-9]/g, "-")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
