import { SiteConfig, TargetMarketRegion, RegionalKeywordVariation, GeoMarketAnalysis, GlobalSeoAgentReport, CustomPageItem } from "../types";

export const DEFAULT_TARGET_MARKETS: TargetMarketRegion[] = [
  // Domestic Geo-Targeted Markets
  {
    id: "tr-istanbul",
    name: "İstanbul (Avrupa & Anadolu Metropol)",
    countryCode: "TR",
    flag: "🇹🇷",
    language: "tr",
    languageLabel: "Türkçe",
    searchEngine: "Google.com.tr",
    tier: "domestic",
    selected: true,
    cityOrArea: "İstanbul",
    monthlyMarketVolumeEstimate: "85K+ Arama / Ay"
  },
  {
    id: "tr-ankara",
    name: "Ankara (İç Anadolu & Kurumsal B2B)",
    countryCode: "TR",
    flag: "🇹🇷",
    language: "tr",
    languageLabel: "Türkçe",
    searchEngine: "Google.com.tr",
    tier: "domestic",
    selected: true,
    cityOrArea: "Ankara",
    monthlyMarketVolumeEstimate: "32K+ Arama / Ay"
  },
  {
    id: "tr-izmir",
    name: "İzmir & Ege Bölgesi (Ticaret & İhracat)",
    countryCode: "TR",
    flag: "🇹🇷",
    language: "tr",
    languageLabel: "Türkçe",
    searchEngine: "Google.com.tr",
    tier: "domestic",
    selected: true,
    cityOrArea: "İzmir",
    monthlyMarketVolumeEstimate: "24K+ Arama / Ay"
  },
  {
    id: "tr-bursa",
    name: "Bursa & Güney Marmara (Sanayi & Üretim)",
    countryCode: "TR",
    flag: "🇹🇷",
    language: "tr",
    languageLabel: "Türkçe",
    searchEngine: "Google.com.tr",
    tier: "domestic",
    selected: false,
    cityOrArea: "Bursa",
    monthlyMarketVolumeEstimate: "18K+ Arama / Ay"
  },
  {
    id: "tr-antalya",
    name: "Antalya & Akdeniz (Turizm & Uluslararası)",
    countryCode: "TR",
    flag: "🇹🇷",
    language: "tr",
    languageLabel: "Türkçe",
    searchEngine: "Google.com.tr",
    tier: "domestic",
    selected: false,
    cityOrArea: "Antalya",
    monthlyMarketVolumeEstimate: "21K+ Arama / Ay"
  },

  // International & Cross-Border Target Markets
  {
    id: "intl-de",
    name: "Almanya / DACH (Berlin, Frankfurt, Münih)",
    countryCode: "DE",
    flag: "🇩🇪",
    language: "de",
    languageLabel: "Almanca (Deutsch)",
    searchEngine: "Google.de",
    tier: "international",
    selected: true,
    cityOrArea: "Almanya",
    monthlyMarketVolumeEstimate: "64K+ Arama / Ay"
  },
  {
    id: "intl-uk",
    name: "Birleşik Krallık / Londra (İngiltere Pazarı)",
    countryCode: "GB",
    flag: "🇬🇧",
    language: "en",
    languageLabel: "İngilizce (UK)",
    searchEngine: "Google.co.uk",
    tier: "international",
    selected: true,
    cityOrArea: "Londra / UK",
    monthlyMarketVolumeEstimate: "92K+ Arama / Ay"
  },
  {
    id: "intl-us",
    name: "Amerika Birleşik Devletleri (Global İngilizce)",
    countryCode: "US",
    flag: "🇺🇸",
    language: "en",
    languageLabel: "İngilizce (US)",
    searchEngine: "Google.com",
    tier: "international",
    selected: false,
    cityOrArea: "ABD",
    monthlyMarketVolumeEstimate: "180K+ Arama / Ay"
  },
  {
    id: "intl-ae",
    name: "Körfez & BAE (Dubai, Abu Dabi Hub)",
    countryCode: "AE",
    flag: "🇦🇪",
    language: "ar",
    languageLabel: "Arapça & İngilizce",
    searchEngine: "Google.ae",
    tier: "international",
    selected: false,
    cityOrArea: "Dubai / BAE",
    monthlyMarketVolumeEstimate: "38K+ Arama / Ay"
  },
  {
    id: "intl-nl",
    name: "Hollanda & Benelux (Amsterdam, Rotterdam)",
    countryCode: "NL",
    flag: "🇳🇱",
    language: "nl",
    languageLabel: "Felemenkçe / İngilizce",
    searchEngine: "Google.nl",
    tier: "international",
    selected: false,
    cityOrArea: "Amsterdam",
    monthlyMarketVolumeEstimate: "29K+ Arama / Ay"
  },
  {
    id: "intl-fr",
    name: "Fransa & Frankofon Pazar (Paris, Lyon)",
    countryCode: "FR",
    flag: "🇫🇷",
    language: "fr",
    languageLabel: "Fransızca",
    searchEngine: "Google.fr",
    tier: "international",
    selected: false,
    cityOrArea: "Paris / Fransa",
    monthlyMarketVolumeEstimate: "45K+ Arama / Ay"
  },
  {
    id: "intl-az",
    name: "Azerbaycan & Hazar Havzası (Bakü)",
    countryCode: "AZ",
    flag: "🇦🇿",
    language: "az",
    languageLabel: "Azerbaycanca",
    searchEngine: "Google.az",
    tier: "international",
    selected: false,
    cityOrArea: "Bakü",
    monthlyMarketVolumeEstimate: "14K+ Arama / Ay"
  }
];

export function generateFallbackGlobalSeoReport(
  config: SiteConfig,
  selectedMarketIds: string[] = ["tr-istanbul", "tr-ankara", "tr-izmir", "intl-de", "intl-uk"]
): GlobalSeoAgentReport {
  const companyName = config.companyName || "HızlıWeb";
  const sector = config.sector || "Web Tasarım & Yazılım";
  const baseCity = config.city || "İstanbul";

  const marketsToAnalyze = DEFAULT_TARGET_MARKETS.filter(m => selectedMarketIds.includes(m.id));

  // Build GeoMarketAnalysis items
  const analyzedMarkets: GeoMarketAnalysis[] = marketsToAnalyze.map((m) => {
    const isDomestic = m.tier === "domestic";
    const currentVis = isDomestic ? Math.floor(45 + Math.random() * 25) : Math.floor(15 + Math.random() * 20);
    const potentialVis = isDomestic ? Math.min(96, currentVis + 30) : Math.min(88, currentVis + 48);

    let topTrends = [];
    let culturalHabits = [];
    let competitorSignals = [];
    let hreflang = "tr-TR";
    let landingSuggestion = {
      title: `${m.cityOrArea || m.name} ${sector} Hizmetleri`,
      slug: `${(m.cityOrArea || "bolge").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      metaTitle: `${m.cityOrArea || m.name} ${sector} | ${companyName}`,
      metaDescription: `${m.cityOrArea || m.name} bölgesine özel garantili, hızlı ve kurumsal ${sector} çözümleri. Hemen keşif ve teklif alın.`,
      introParagraph: `${companyName}, ${m.cityOrArea || m.name} pazarındaki işletmelerin dijital görünürlüğünü ve satışlarını artırmak için yerel dinamiklere uygun çözümler sunar.`,
      keySellingPoints: [
        "Yerel pazar analizi ve rekabet avantajı",
        "Hızlı Anycast Edge CDN ile 300ms altı açılış hızı",
        "Bölgesel arama alışkanlıklarına optimize edilmiş içerik"
      ]
    };

    if (m.id === "tr-istanbul") {
      hreflang = "tr-TR";
      topTrends = [
        { query: `istanbul kurumsal ${sector.toLowerCase()} ajansı`, volumeEstimate: "4.8K/ay", spikeReason: "Yerinde toplantı ve acil keşif taleplerinde %42 artış", relevanceScore: 96, trendType: "steady_growth" as const },
        { query: `avrupa yakası hızlı ${sector.toLowerCase()}`, volumeEstimate: "2.1K/ay", spikeReason: "Bölgesel teslimat ve aynı gün teklif arayışı", relevanceScore: 89, trendType: "breakthrough" as const },
        { query: `${sector.toLowerCase()} fiyatları 2026 istanbul`, volumeEstimate: "3.4K/ay", spikeReason: "Şeffaf bütçe karşılaştırması", relevanceScore: 92, trendType: "steady_growth" as const }
      ];
      culturalHabits = [
        "Kullanıcılar WhatsApp ile 10 dakika içinde doğrudan kurucu veya proje yöneticisiyle iletişime geçmeyi tercih ediyor.",
        "Avrupa ve Anadolu yakası servis ayrımı SERP tıklama oranını (CTR) %34 artırıyor.",
        "Önceden referans iş örneklerini canlı görmek isteme eğilimi çok yüksek."
      ];
      competitorSignals = [
        { competitorDomain: "istanbultasarim.com", estimatedMarketShare: 24, dominantKeywords: ["istanbul web tasarım", "kurumsal site istanbul"], vulnerability: "Mobil Core Web Vitals skoru düşük (62), sayfa hızı zayıf" },
        { competitorDomain: "bogazicidijital.com", estimatedMarketShare: 18, dominantKeywords: ["beşiktaş dijital ajans", "şişli seo"], vulnerability: "Şeffaf fiyatlandırma eksik, teklif formu uzun" }
      ];
    } else if (m.id === "tr-ankara") {
      hreflang = "tr-TR";
      topTrends = [
        { query: `ankara kurumsal ${sector.toLowerCase()} çözümleri`, volumeEstimate: "2.9K/ay", spikeReason: "B2B sanayi ve kamu ihale yüklenici gereksinimleri", relevanceScore: 94, trendType: "steady_growth" as const },
        { query: `çankaya kızılay ${sector.toLowerCase()} firmaları`, volumeEstimate: "1.6K/ay", spikeReason: "Merkezi lokasyon güveni", relevanceScore: 88, trendType: "steady_growth" as const },
        { query: `b2b sanayi ${sector.toLowerCase()} ostim`, volumeEstimate: "1.2K/ay", spikeReason: "OSTİM ve İvedik sanayi firmalarında dijitalleşme atağı", relevanceScore: 91, trendType: "breakthrough" as const }
      ];
      culturalHabits = [
        "Kurumsal faturalandırma, sözleşme garantisi ve ISO belgelerine arama sorgularında öncelik veriliyor.",
        "Akademik ve kurumsal dil içeren meta açıklamaları daha yüksek CTR alıyor.",
        "Referans mektupları ve case study sayfaları karar sürecini %45 hızlandırıyor."
      ];
      competitorSignals = [
        { competitorDomain: "ankarayazilim.net", estimatedMarketShare: 21, dominantKeywords: ["ankara web tasarım", "ostim web yazılım"], vulnerability: "Teknoloji yığını eski (PHP 5/WordPress), modern Next.js/Vite hızı yok" }
      ];
    } else if (m.id === "tr-izmir") {
      hreflang = "tr-TR";
      topTrends = [
        { query: `izmir modern ${sector.toLowerCase()}`, volumeEstimate: "2.4K/ay", spikeReason: "Ege bölgesi ihracatçı KOBİ'lerinin web sitesi yenilemesi", relevanceScore: 91, trendType: "steady_growth" as const },
        { query: `alsancak bornova ${sector.toLowerCase()} ajansı`, volumeEstimate: "1.1K/ay", spikeReason: "Lokal ve genç ajans arayışı", relevanceScore: 86, trendType: "steady_growth" as const },
        { query: `e-ihracat çok dilli ${sector.toLowerCase()} ege`, volumeEstimate: "950/ay", spikeReason: "Almanya ve İtalya'ya ihracat yapan firmalar", relevanceScore: 89, trendType: "breakthrough" as const }
      ];
      culturalHabits = [
        "Kullanıcılar samimi, şeffaf ve minimalist tasarım diline pozitif tepki veriyor.",
        "E-İhracat ve çok dilli altyapı vurgusu İzmir aramalarında %40 daha fazla form dönüşümü sağlıyor."
      ];
      competitorSignals = [
        { competitorDomain: "egewebtasarim.com", estimatedMarketShare: 19, dominantKeywords: ["izmir web tasarım", "alsancak ajans"], vulnerability: "Mobil uyumluluk zayıf, SSL/HSTS optimizasyonu eksik" }
      ];
    } else if (m.id === "intl-de") {
      hreflang = "de-DE";
      landingSuggestion = {
        title: `Professionelle ${sector === "Web Tasarım & Yazılım" ? "Webentwicklung & Webdesign" : sector} für Deutschland`,
        slug: "de-professionelle-webentwicklung",
        metaTitle: `Webdesign Agentur Deutschland | DSGVO-konform & Ultra-schnell | ${companyName}`,
        metaDescription: `Maßgeschneiderte Webentwicklung für deutsche KMU. 100% DSGVO-konform, blitzschnelle Ladezeiten unter 300ms und Festpreisgarantie. Jetzt unverbindlich anfragen.`,
        introParagraph: `Effiziente und hochmoderne digitale Lösungen für Unternehmen in Deutschland, Österreich und der Schweiz. Höchste deutsche Qualitätsstandards kombiniert mit erstklassiger Entwicklungsgeschwindigkeit.`,
        keySellingPoints: [
          "100% DSGVO & Cookie-Compliance nach EU-Recht",
          "Ultraschnelle Anycast Edge CDN Infrastruktur",
          "Transparente Festpreisangebote ohne versteckte Kosten"
        ]
      };
      topTrends = [
        { query: "webseite erstellen lassen festpreis", volumeEstimate: "9.2K/ay", spikeReason: "Alman KOBİ'lerinde ajans maliyetlerinden kaçınarak şeffaf sabit fiyat arayışı", relevanceScore: 98, trendType: "breakthrough" as const },
        { query: "dsgvo konforme webseite kmu", volumeEstimate: "5.4K/ay", spikeReason: "Katı AB gizlilik cezaları nedeniyle yasal güvence arayışı", relevanceScore: 95, trendType: "steady_growth" as const },
        { query: "webdesign agentur berlin frankfurt", volumeEstimate: "7.1K/ay", spikeReason: "B2B dijitalleşme teşvikleri (Digitalbonus)", relevanceScore: 92, trendType: "steady_growth" as const }
      ];
      culturalHabits = [
        "Almanya arama motoru kullanıcıları 'Impressum', 'Datenschutz' (GDPR) ve 'TÜV/ISO' gibi güven mühürlerini SERP snippet'inde arar.",
        "Gündelik 'slang' yerine resmi, teknik açıdan net ve garantili vaatler tıklama oranını 2.4 katına çıkarır.",
        "Fiyatın 'ab ... €' (den başlayan) şeklinde açıkça belirtilmesi güven oluşturur."
      ];
      competitorSignals = [
        { competitorDomain: "webdesign-deutschland.de", estimatedMarketShare: 28, dominantKeywords: ["webseite erstellen lassen", "webdesign agentur"], vulnerability: "Fiyatlar çok yüksek (ortalama 4.500€+), teslimat süreleri 6-8 hafta" },
        { competitorDomain: "agentur-frankfurt.com", estimatedMarketShare: 16, dominantKeywords: ["b2b webdesign frankfurt"], vulnerability: "Modern JAMstack mimarisi yerine yavaş CMS şablonları kullanıyor" }
      ];
    } else if (m.id === "intl-uk") {
      hreflang = "en-GB";
      landingSuggestion = {
        title: `Bespoke ${sector === "Web Tasarım & Yazılım" ? "Web Design & Development" : sector} Services UK`,
        slug: "uk-bespoke-web-design",
        metaTitle: `Bespoke Web Design UK | Fast, Modern & High-Converting Websites | ${companyName}`,
        metaDescription: `Award-winning bespoke web design agency serving London and UK businesses. Ultra-fast performance, responsive layouts and proven ROI. Get a free quote today.`,
        introParagraph: `Empowering UK businesses with high-performance digital platforms built on global Anycast edge infrastructure, converting searchers into long-term clients.`,
        keySellingPoints: [
          "Bespoke UI/UX designed for UK commercial intent",
          "Sub-300ms TTFB across London & European edge nodes",
          "Clear milestone-based delivery with 100% satisfaction"
        ]
      };
      topTrends = [
        { query: "bespoke web design london affordable", volumeEstimate: "8.6K/ay", spikeReason: "Büyük Londra ajanslarının fahiş fiyatlarına karşı esnek ve hızlı alternatif arayışı", relevanceScore: 97, trendType: "breakthrough" as const },
        { query: "fast business website speed optimization uk", volumeEstimate: "4.2K/ay", spikeReason: "Google Core Web Vitals güncellemesi sonrası İngiliz e-ticaret sitelerinde hız paniği", relevanceScore: 93, trendType: "steady_growth" as const },
        { query: "b2b web development agency uk", volumeEstimate: "6.8K/ay", spikeReason: "Fintech ve danışmanlık firmalarının web yenilemesi", relevanceScore: 91, trendType: "steady_growth" as const }
      ];
      culturalHabits = [
        "İngiltere'de 'bespoke' (özel yapım) kelimesi 'custom' kelimesine göre %54 daha yüksek satın alma niyeti temsil eder.",
        "Case study'ler ve müşteri yorumları (Trustpilot / Google Reviews) snippet'ta yıldızlı görünmediğinde tıklama oranı belirgin düşer.",
        "Telefonla arama yerine randevu takvimi (Calendly) bağlantısı ekleme tercihi yüksektir."
      ];
      competitorSignals = [
        { competitorDomain: "londonwebstudio.co.uk", estimatedMarketShare: 26, dominantKeywords: ["bespoke web design london", "london web agency"], vulnerability: "Yüksek saatlik ücretler (£95-£140/saat), küçük KOBİ'ler için erişilmez" }
      ];
    } else if (m.id === "intl-us") {
      hreflang = "en-US";
      topTrends = [
        { query: "high converting custom business website", volumeEstimate: "14.2K/ay", spikeReason: "Dönüşüm odaklı büyüme ve funnel entegrasyonu", relevanceScore: 96, trendType: "steady_growth" as const },
        { query: "fast edge cdn web developer hire", volumeEstimate: "8.1K/ay", spikeReason: "Edge computing ve anında açılan siteler", relevanceScore: 92, trendType: "breakthrough" as const }
      ];
      culturalHabits = [
        "Dönüşüm oranı ve ROI rakamları doğrudan ana başlıkta beklenir.",
        "Stripe entegrasyonu ve anında online faturalandırma şart görülür."
      ];
      competitorSignals = [
        { competitorDomain: "uswebpro.com", estimatedMarketShare: 32, dominantKeywords: ["business website developer", "fast web design"], vulnerability: "Abonelik modeliyle müşteriyi kilitleme şikayetleri" }
      ];
    } else if (m.id === "intl-ae") {
      hreflang = "ar-AE";
      topTrends = [
        { query: "web development company dubai luxury", volumeEstimate: "6.2K/ay", spikeReason: "Lüks sektör ve emlak firmalarında yüksek bütçeli portal arayışı", relevanceScore: 95, trendType: "breakthrough" as const },
        { query: "best ecommerce website development uae", volumeEstimate: "4.8K/ay", spikeReason: "Körfez bölgesinde online sipariş patlaması", relevanceScore: 91, trendType: "steady_growth" as const }
      ];
      culturalHabits = [
        "WhatsApp doğrudan iletişim ve VIP acil destek rozetleri çok etkilidir.",
        "Hem İngilizce hem de sağdan sola (RTL) Arapça dil desteği arama tercihlerini belirler."
      ];
      competitorSignals = [
        { competitorDomain: "dubaiwebagency.ae", estimatedMarketShare: 22, dominantKeywords: ["web design dubai", "uae web agency"], vulnerability: "Yavaş sunucu altyapısı, Körfez içi latency problemleri" }
      ];
    } else {
      hreflang = `${m.language}-${m.countryCode}`;
      topTrends = [
        { query: `${m.cityOrArea || m.name} ${sector.toLowerCase()}`, volumeEstimate: "2.5K/ay", spikeReason: "Bölgesel güvenilir sağlayıcı arayışı", relevanceScore: 89, trendType: "steady_growth" as const }
      ];
      culturalHabits = [
        "Lokal dilde ve yerel para biriminde teklif sunulması dönüşümü doğrudan ikiye katlar."
      ];
      competitorSignals = [
        { competitorDomain: "regional-competitor.com", estimatedMarketShare: 15, dominantKeywords: ["local service"], vulnerability: "Geri kalmış SEO altyapısı" }
      ];
    }

    return {
      marketId: m.id,
      marketName: m.name,
      countryCode: m.countryCode,
      flag: m.flag,
      language: m.language,
      languageLabel: m.languageLabel,
      searchEngine: m.searchEngine,
      currentVisibilityScore: currentVis,
      potentialVisibilityScore: potentialVis,
      marketOpportunityScore: Math.round(potentialVis - currentVis * 0.4),
      topTrends,
      culturalSearchHabits: culturalHabits,
      localizedCompetitorSignals: competitorSignals,
      hreflangCode: hreflang,
      recommendedAction: isDomestic
        ? `${m.cityOrArea} bölgesine özel LocalBusiness şeması ve yerel referans projeleri yayınlayın.`
        : `${m.name} pazarı için ${m.language.toUpperCase()} dilli hreflang etiketi ve yerel güven rozetleri ekleyin.`,
      regionalLandingPageSuggestion: landingSuggestion
    };
  });

  // Generate rich regional keyword variations across all selected markets
  const allKeywords: RegionalKeywordVariation[] = [];

  marketsToAnalyze.forEach((m) => {
    if (m.id === "tr-istanbul") {
      allKeywords.push(
        {
          id: "rkw-tr-ist-1",
          keyword: `istanbul ${sector.toLowerCase()} ajansı`,
          originalBaseKeyword: `${sector} ajansı`,
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "commercial",
          searchVolumeIndex: 94,
          searchVolumeDisplay: "5.4K / ay",
          trendStatus: "rising",
          trendGrowthPercent: 38,
          competitionDifficulty: 52,
          difficultyLabel: "Orta",
          serpFeatures: ["Local Pack", "Site Links", "People Also Ask"],
          vernacularNote: "İstanbul aramalarında 'ajans' kelimesi 'hizmeti' kelimesine kıyasla B2B kurumsal müşterilerde %44 daha yüksek bütçe sinyali verir.",
          recommendedMetaTitle: `İstanbul ${sector} Ajansı | Hızlı Teslimat & 7/24 Destek | ${companyName}`,
          recommendedMetaDescription: `İstanbul genelinde profesyonel ${sector} hizmetleri. Anycast Edge CDN altyapısıyla 300ms altı hız garantisi. Hemen teklif alın.`,
          suggestedPageSlug: `istanbul-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ajansi`,
          localizedH1: `İstanbul'un En Hızlı Kurumsal ${sector} Çözümleri`
        },
        {
          id: "rkw-tr-ist-2",
          keyword: `anadolu yakası ${sector.toLowerCase()} firmaları`,
          originalBaseKeyword: `${sector} firmaları`,
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "local_navigational",
          searchVolumeIndex: 78,
          searchVolumeDisplay: "2.1K / ay",
          trendStatus: "breakthrough",
          trendGrowthPercent: 62,
          competitionDifficulty: 34,
          difficultyLabel: "Düşük",
          serpFeatures: ["Local Pack", "Maps Answer"],
          vernacularNote: "Kadıköy, Ümraniye ve Ataşehir işletmeleri köprü trafiği nedeniyle doğrudan 'Anadolu Yakası' nitelemesiyle arama yapıyor.",
          recommendedMetaTitle: `Anadolu Yakası ${sector} | Kadıköy & Ataşehir | ${companyName}`,
          recommendedMetaDescription: `İstanbul Anadolu Yakası firmalarına özel hızlı keşif, şeffaf fiyatlandırma ve kurumsal ${sector} çözümleri.`,
          suggestedPageSlug: `anadolu-yakasi-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          localizedH1: `Anadolu Yakası İşletmelerine Özel ${sector}`
        },
        {
          id: "rkw-tr-ist-3",
          keyword: `aynı gün teslim ${sector.toLowerCase()} istanbul`,
          originalBaseKeyword: `hızlı ${sector}`,
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "transactional",
          searchVolumeIndex: 82,
          searchVolumeDisplay: "1.8K / ay",
          trendStatus: "rising",
          trendGrowthPercent: 49,
          competitionDifficulty: 28,
          difficultyLabel: "Düşük",
          serpFeatures: ["Featured Snippet", "Shopping Box"],
          vernacularNote: "Acil açılış yapacak etkinlik ve lansman firmaları 'aynı gün' terimini sıklıkla kullanarak doğrudan satın almaya hazır arama yapıyor.",
          recommendedMetaTitle: `Aynı Gün Teslim ${sector} İstanbul | ${companyName}`,
          recommendedMetaDescription: `24 saatte yayında! İstanbul işletmeleri için acil, ultra hızlı ve modern ${sector} altyapısı.`,
          suggestedPageSlug: `ayni-gun-teslim-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-istanbul`,
          localizedH1: `24 Saatte Yayında: İstanbul'a Özel Acil ${sector}`
        }
      );
    } else if (m.id === "tr-ankara") {
      allKeywords.push(
        {
          id: "rkw-tr-ank-1",
          keyword: `ankara kurumsal ${sector.toLowerCase()} yazılım`,
          originalBaseKeyword: `kurumsal ${sector}`,
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "commercial",
          searchVolumeIndex: 88,
          searchVolumeDisplay: "3.2K / ay",
          trendStatus: "rising",
          trendGrowthPercent: 41,
          competitionDifficulty: 42,
          difficultyLabel: "Orta",
          serpFeatures: ["Local Pack", "People Also Ask"],
          vernacularNote: "Ankara pazarında 'yazılım' ve 'altyapı' kelimeleri sadece tasarıma göre %52 daha fazla B2B güven oluşturur.",
          recommendedMetaTitle: `Ankara Kurumsal ${sector} & Yazılım | ${companyName}`,
          recommendedMetaDescription: `Ankara merkezli KOBİ ve kurumlara özel sözleşmeli, garantili ve güvenli ${sector} çözümleri.`,
          suggestedPageSlug: `ankara-kurumsal-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          localizedH1: `Ankara Merkezli Kurumlar İçin Yüksek Performanslı ${sector}`
        },
        {
          id: "rkw-tr-ank-2",
          keyword: `ostim ivedik sanayi ${sector.toLowerCase()}`,
          originalBaseKeyword: `sanayi ${sector}`,
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "transactional",
          searchVolumeIndex: 72,
          searchVolumeDisplay: "1.4K / ay",
          trendStatus: "breakthrough",
          trendGrowthPercent: 55,
          competitionDifficulty: 24,
          difficultyLabel: "Düşük",
          serpFeatures: ["Local Pack", "Knowledge Graph"],
          vernacularNote: "İmalatçı ve ihracatçı KOBİ'ler kendi sanayi bölgelerini arayarak referans talep ediyor.",
          recommendedMetaTitle: `OSTİM & İvedik Sanayi ${sector} | Ankara | ${companyName}`,
          recommendedMetaDescription: `OSTİM ve İvedik OSB sanayi işletmelerine özel ürün kataloğu, çok dilli ihracat sitesi ve hızlı teklif modülü.`,
          suggestedPageSlug: `ostim-ivedik-sanayi-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          localizedH1: `OSTİM ve Sanayi Bölgesi İçin İhracat Odaklı ${sector}`
        }
      );
    } else if (m.id === "tr-izmir") {
      allKeywords.push(
        {
          id: "rkw-tr-izm-1",
          keyword: `izmir profesyonel ${sector.toLowerCase()} fiyatları`,
          originalBaseKeyword: `${sector} fiyatları`,
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "commercial",
          searchVolumeIndex: 82,
          searchVolumeDisplay: "2.6K / ay",
          trendStatus: "rising",
          trendGrowthPercent: 35,
          competitionDifficulty: 38,
          difficultyLabel: "Orta",
          serpFeatures: ["Local Pack", "Pricing Rich Snippet"],
          vernacularNote: "Ege bölgesinde fiyat şeffaflığı ve gizli maliyetsiz sabit paket aramaları %65 daha yüksek CTR sağlıyor.",
          recommendedMetaTitle: `İzmir ${sector} Fiyatları 2026 | Şeffaf Paketler | ${companyName}`,
          recommendedMetaDescription: `İzmir ve Ege bölgesinde şeffaf fiyatlı, garantili ve modern ${sector}. Paketlerimizi inceleyin.`,
          suggestedPageSlug: `izmir-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-fiyatlari`,
          localizedH1: `İzmir'e Özel Şeffaf Fiyatlı ${sector} Paketleri`
        }
      );
    } else if (m.id === "intl-de") {
      allKeywords.push(
        {
          id: "rkw-intl-de-1",
          keyword: "webseite erstellen lassen festpreis",
          originalBaseKeyword: "web sitesi yaptırma",
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "transactional",
          searchVolumeIndex: 96,
          searchVolumeDisplay: "8.9K / ay",
          trendStatus: "breakthrough",
          trendGrowthPercent: 74,
          competitionDifficulty: 48,
          difficultyLabel: "Orta",
          serpFeatures: ["Featured Snippet", "People Also Ask", "Reviews"],
          vernacularNote: "Almanya'da 'Webseite erstellen lassen' kalıbı 'Webdesign Agentur' kelimesine göre %62 daha yüksek satın alma niyeti ve bütçe taşır; 'Festpreis' (sabit fiyat) kelimesi CTR'ı ikiye katlar.",
          recommendedMetaTitle: `Webseite erstellen lassen Festpreis | DSGVO-konform | ${companyName}`,
          recommendedMetaDescription: `Moderne Unternehmenswebseite zum garantierten Festpreis. 100% DSGVO-sicher, blitzschnelle Ladezeit (<0.3s) und persönliche Betreuung. Jetzt anfragen!`,
          suggestedPageSlug: "webseite-erstellen-lassen-festpreis",
          localizedH1: "Professionelle Webseite erstellen lassen zum garantierten Festpreis"
        },
        {
          id: "rkw-intl-de-2",
          keyword: "dsgvo konforme homepage kmu deutschland",
          originalBaseKeyword: "gdpr uyumlu web sitesi",
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "commercial",
          searchVolumeIndex: 86,
          searchVolumeDisplay: "4.8K / ay",
          trendStatus: "rising",
          trendGrowthPercent: 52,
          competitionDifficulty: 36,
          difficultyLabel: "Düşük",
          serpFeatures: ["People Also Ask", "Knowledge Panel"],
          vernacularNote: "Alman mahkemelerinin Google Fonts ve çerez uyumsuzluk cezalarından sonra 'DSGVO-konform' ibaresi zorunlu bir SERP tıklama kriteri haline geldi.",
          recommendedMetaTitle: `DSGVO-konforme Homepage für KMU | Rechtssicher & Schnell | ${companyName}`,
          recommendedMetaDescription: `Abmahnsichere und DSGVO-konforme Webseiten für deutsche Betriebe. Lokale Cookie-Verwaltung, SSL und deutsches Impressum inklusive.`,
          suggestedPageSlug: "dsgvo-konforme-homepage-kmu",
          localizedH1: "100% DSGVO-konforme Homepage für mittelständische Unternehmen"
        },
        {
          id: "rkw-intl-de-3",
          keyword: "schnelle ladezeit website core web vitals optimieren",
          originalBaseKeyword: "sayfa hızı optimizasyonu",
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "informational",
          searchVolumeIndex: 79,
          searchVolumeDisplay: "3.5K / ay",
          trendStatus: "rising",
          trendGrowthPercent: 44,
          competitionDifficulty: 32,
          difficultyLabel: "Düşük",
          serpFeatures: ["Featured Snippet", "Video Carousel"],
          vernacularNote: "Teknik Alman yöneticiler doğrudan 'Core Web Vitals' ve 'Ladezeit' terimlerini aratarak ajans seçimi yapıyor.",
          recommendedMetaTitle: `Website Ladezeit & Core Web Vitals Optimierung | Anycast Edge | ${companyName}`,
          recommendedMetaDescription: `Bringen Sie Ihre Webseite auf <300ms Ladezeit. Anycast Edge CDN und moderne Next.js/Vite Performance-Optimierung.`,
          suggestedPageSlug: "core-web-vitals-optimierung-deutschland",
          localizedH1: "Core Web Vitals & Ladezeiten-Optimierung für höchste Google Rankings"
        }
      );
    } else if (m.id === "intl-uk") {
      allKeywords.push(
        {
          id: "rkw-intl-uk-1",
          keyword: "bespoke web design london affordable",
          originalBaseKeyword: "özel web tasarım",
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "transactional",
          searchVolumeIndex: 94,
          searchVolumeDisplay: "7.6K / ay",
          trendStatus: "rising",
          trendGrowthPercent: 58,
          competitionDifficulty: 54,
          difficultyLabel: "Orta",
          serpFeatures: ["Local Pack", "People Also Ask", "Reviews"],
          vernacularNote: "İngiltere'de 'bespoke' terimi jenerik 'custom' kelimesine göre %54 daha yüksek satın alma niyeti temsil eder; 'affordable' kelimesi Londra ajanslarının aşırı fiyatlarından kaçan KOBİ'leri çeker.",
          recommendedMetaTitle: `Bespoke Web Design London | Affordable & Ultra-Fast | ${companyName}`,
          recommendedMetaDescription: `Bespoke web design agency serving London & UK businesses. Sub-300ms speed on Anycast Edge CDN, custom UI and transparent pricing. Get a quote.`,
          suggestedPageSlug: "bespoke-web-design-london",
          localizedH1: "Award-Winning Bespoke Web Design in London at Sensible Prices"
        },
        {
          id: "rkw-intl-uk-2",
          keyword: "b2b lead generation website agency uk",
          originalBaseKeyword: "b2b web sitesi ajansı",
          targetMarketId: m.id,
          targetMarketName: m.name,
          countryCode: m.countryCode,
          language: m.language,
          searchIntent: "commercial",
          searchVolumeIndex: 88,
          searchVolumeDisplay: "5.1K / ay",
          trendStatus: "breakthrough",
          trendGrowthPercent: 67,
          competitionDifficulty: 46,
          difficultyLabel: "Orta",
          serpFeatures: ["People Also Ask", "Case Studies Snippet"],
          vernacularNote: "İngiliz işletmeler sitenin sadece estetiğiyle değil, doğrudan 'lead generation' (müşteri adayı üretme) kabiliyetiyle ilgileniyor.",
          recommendedMetaTitle: `B2B Lead Generation Websites UK | Proven ROI | ${companyName}`,
          recommendedMetaDescription: `Turn UK searchers into paying clients with high-conversion landing pages, automated WhatsApp/CRM integrations and lightning speed.`,
          suggestedPageSlug: "b2b-lead-generation-websites-uk",
          localizedH1: "B2B Websites Engineered to Generate High-Value UK Leads"
        }
      );
    } else {
      allKeywords.push({
        id: `rkw-${m.id}-1`,
        keyword: `${(m.cityOrArea || m.name).toLowerCase()} ${sector.toLowerCase()}`,
        originalBaseKeyword: sector,
        targetMarketId: m.id,
        targetMarketName: m.name,
        countryCode: m.countryCode,
        language: m.language,
        searchIntent: "commercial",
        searchVolumeIndex: 80,
        searchVolumeDisplay: "2.4K / ay",
        trendStatus: "rising",
        trendGrowthPercent: 30,
        competitionDifficulty: 35,
        difficultyLabel: "Orta",
        serpFeatures: ["Local Pack", "People Also Ask"],
        vernacularNote: `${m.name} bölgesel arama alışkanlıkları hedeflenmektedir.`,
        recommendedMetaTitle: `${m.name} ${sector} | ${companyName}`,
        recommendedMetaDescription: `${m.name} pazarında garantili ve hızlı ${sector} çözümleri.`,
        suggestedPageSlug: `${m.id}-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        localizedH1: `${m.name} İçin Yüksek Performanslı ${sector}`
      });
    }
  });

  const groundingSources = [
    {
      query: `google.com.tr "${sector.toLowerCase()}" bölgesel serp trendleri`,
      sources: [
        { title: "Google Trends Türkiye Bölgesel Arama Hacimleri 2026", uri: "https://trends.google.com/trends/explore?geo=TR" },
        { title: "Türkiye KOBİ E-Ticaret ve Hizmet Sektörü SERP Raporu", uri: "https://searchengineland.com/local-seo-turkey-insights" }
      ]
    },
    {
      query: `google.de "webseite erstellen lassen" dach market trends`,
      sources: [
        { title: "Google Trends Deutschland: Suchintention KMU Webdesign", uri: "https://trends.google.de/trends/explore?geo=DE" },
        { title: "Search Engine Journal: German SEO & DSGVO Compliance Trends", uri: "https://www.searchenginejournal.com/german-seo-best-practices/" }
      ]
    },
    {
      query: `google.co.uk "bespoke web design" commercial intent insights`,
      sources: [
        { title: "UK SERP Features & Local Commercial Intent Analysis", uri: "https://trends.google.co.uk/trends/explore?geo=GB" }
      ]
    }
  ];

  return {
    id: `gseo-rep-${Date.now()}`,
    analyzedAt: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    industry: sector,
    companyName: companyName,
    baseCity: baseCity,
    totalMarketsAnalyzed: analyzedMarkets.length,
    overallGlobalReachScore: Math.min(94, 65 + analyzedMarkets.length * 5),
    executiveStrategicSummary: `${companyName} için ${analyzedMarkets.length} hedef pazarda yapılan arama zekası analizi, özellikle bölgesel dildeki arama kalıplarına (örn. Almanya'da 'Festpreis', İngiltere'de 'Bespoke', İstanbul'da 'Aynı Gün Keşif') odaklanıldığında organik arama görünürlüğünün %140'a kadar artabileceğini ortaya koymaktadır. Anycast CDN altyapınız sayesinde küresel sunucu gecikmesi (TTFB) 300ms altında kalarak uluslararası SERP'lerde doğrudan teknik üstünlük sağlamaktadır.`,
    targetMarkets: analyzedMarkets,
    regionalKeywords: allKeywords,
    searchGroundingSources: groundingSources,
    macroGeoTrends: [
      {
        title: "Bölgesel Dil ve Ağız Özgüllüğü (Colloquial Vernacular)",
        region: "Global & DACH / UK",
        growth: "+58% Arama Hacmi",
        impact: "high",
        description: "Standart sözlük çevirileri yerine hedef ülkedeki yerel işletmelerin kullandığı kalıpları (Almanya'da 'DSGVO Festpreis', İngiltere'de 'Bespoke Agency') başlığa alan siteler %82 daha yüksek dönüşüm elde ediyor."
      },
      {
        title: "Lokal 'Near Me' ve İlçe Bazlı Spesifik Aramalar",
        region: "Türkiye (İstanbul, Ankara, İzmir)",
        growth: "+42% Yıllık Büyüme",
        impact: "high",
        description: "Kullanıcılar jenerik 'web tasarım' yerine doğrudan 'anadolu yakası kurumsal web' veya 'ostim b2b yazılım' şeklinde spesifik coğrafi sorgular giriyor."
      },
      {
        title: "Sertifika ve Yasal Uyumluluk Snippet Güveni",
        region: "Avrupa Birliği (DE, NL, FR)",
        growth: "+34% CTR Etkisi",
        impact: "high",
        description: "Avrupa pazarında meta description içinde GDPR/DSGVO, Impressum ve SSL sertifikasyonuna atıfta bulunulması arama sonucunun tıklanma ihtimalini ikiye katlıyor."
      }
    ],
    multilingualSeoChecklist: [
      {
        item: "Hreflang Etiket Yapısı",
        status: "needs_action",
        detail: "Seçilen uluslararası pazarlar için (de-DE, en-GB) HTML <head> içine doğru rel='alternate' hreflang bağlantıları tanımlanmalıdır."
      },
      {
        item: "Anycast Edge CDN Gecikme Hızı",
        status: "optimized",
        detail: "Global 300+ Edge lokasyonu sayesinde Berlin, Londra ve İstanbul kullanıcılarına 300ms altı First Contentful Paint sağlanmaktadır."
      },
      {
        item: "Bölgesel Para Birimi & İletişim Tercihleri",
        status: "ready",
        detail: "Avrupa hedefli sayfalarda Euro (€) ve randevu takvimi, Türkiye sayfalarında TL (₺) ve doğrudan WhatsApp widget önceliklendirilmelidir."
      },
      {
        item: "Hedef Pazar Bölgesel Landing Page'leri",
        status: "needs_action",
        detail: "İstanbul Anadolu Yakası, Ankara OSTİM ve Almanya DACH pazarı için 1 tıkla özel açılış sayfaları oluşturulabilir."
      }
    ],
    isGroundingLive: false
  };
}

/**
 * 1-Click apply: Adds a regional keyword variation to SiteConfig customPages as a dedicated landing page
 */
export function createRegionalLandingPageFromKeyword(
  config: SiteConfig,
  keyword: RegionalKeywordVariation
): { updatedConfig: SiteConfig; newPage: CustomPageItem } {
  const pages = config.pages || [];

  // Check if page already exists with this slug
  const existingIndex = pages.findIndex((p) => p.slug === keyword.suggestedPageSlug);

  const newPage: CustomPageItem = {
    id: `page-geo-${keyword.id}`,
    title: keyword.localizedH1 || `${keyword.targetMarketName} ${keyword.keyword}`,
    slug: keyword.suggestedPageSlug,
    content: `
      <div class="regional-landing-hero py-12 px-4 max-w-4xl mx-auto">
        <div class="inline-block bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
          📍 ${keyword.targetMarketName} Özel Bölgesel Çözüm
        </div>
        <h1 class="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          ${keyword.localizedH1}
        </h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-8">
          ${keyword.recommendedMetaDescription}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div class="text-2xl mb-2">⚡</div>
            <h3 class="font-bold text-slate-900 mb-2">300ms Altı Küresel Hız</h3>
            <p class="text-sm text-slate-600">Global Anycast Edge CDN ile ${keyword.targetMarketName} bölgesinden anında açılan sayfalar.</p>
          </div>
          <div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div class="text-2xl mb-2">🎯</div>
            <h3 class="font-bold text-slate-900 mb-2">Lokal Pazar Uyumlu</h3>
            <p class="text-sm text-slate-600">${keyword.vernacularNote}</p>
          </div>
          <div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div class="text-2xl mb-2">🛡️</div>
            <h3 class="font-bold text-slate-900 mb-2">%100 Güvenlik & Sözleşme</h3>
            <p class="text-sm text-slate-600">Kurumsal faturalandırma ve şeffaf teslimat taahhüdü.</p>
          </div>
        </div>
        <div class="p-8 bg-indigo-900 text-white rounded-3xl text-center shadow-xl">
          <h2 class="text-2xl font-bold mb-3">${keyword.targetMarketName} Bölgesinde Projenizi Başlatın</h2>
          <p class="text-indigo-200 mb-6 max-w-xl mx-auto text-sm">Hemen iletişime geçin, bölgenize özel detaylı analiz ve rekabetçi fiyat teklifini 15 dakikada hazırlayalım.</p>
          <a href="/#contact" class="inline-block bg-white text-indigo-900 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition shadow-md">
            Ücretsiz Keşif & Teklif Al
          </a>
        </div>
      </div>
    `,
    isNavVisible: true,
    seoTitle: keyword.recommendedMetaTitle,
    metaDescription: keyword.recommendedMetaDescription,
    seoKeywords: `${keyword.keyword}, ${keyword.originalBaseKeyword}, ${keyword.targetMarketName}`,
    canonicalUrl: `https://${config.customDomain || "hizliweb.app"}/${keyword.suggestedPageSlug}`,
    ogTitle: keyword.recommendedMetaTitle
  };

  let updatedPages: CustomPageItem[];
  if (existingIndex >= 0) {
    updatedPages = [...pages];
    updatedPages[existingIndex] = newPage;
  } else {
    updatedPages = [...pages, newPage];
  }

  // Also append to global SEO keywords if not already there
  const existingKeywords = (config.seo?.keywords || "").split(",").map(k => k.trim()).filter(Boolean);
  if (!existingKeywords.includes(keyword.keyword)) {
    existingKeywords.push(keyword.keyword);
  }

  return {
    updatedConfig: {
      ...config,
      pages: updatedPages,
      seo: {
        ...config.seo,
        keywords: existingKeywords.join(", ")
      }
    },
    newPage
  };
}

/**
 * Export regional keywords report to CSV
 */
export function exportGlobalSeoKeywordsToCsv(report: GlobalSeoAgentReport): void {
  const headers = [
    "Hedef Pazar",
    "Bölgesel Anahtar Kelime",
    "Arama Niyeti",
    "Aylık Hacim İndeksi",
    "Trend Durumu",
    "Trend Artış %",
    "Rekabet Zorluğu (0-100)",
    "Zorluk Derecesi",
    "Önerilen Meta Başlığı",
    "Önerilen Meta Açıklaması",
    "Bölgesel Dil/Ağız Notu",
    "Önerilen Sayfa Slug"
  ];

  const rows = report.regionalKeywords.map((k) => [
    `"${k.targetMarketName.replace(/"/g, '""')}"`,
    `"${k.keyword.replace(/"/g, '""')}"`,
    `"${k.searchIntent}"`,
    `"${k.searchVolumeDisplay}"`,
    `"${k.trendStatus}"`,
    `"+%${k.trendGrowthPercent}"`,
    k.competitionDifficulty,
    `"${k.difficultyLabel}"`,
    `"${k.recommendedMetaTitle.replace(/"/g, '""')}"`,
    `"${k.recommendedMetaDescription.replace(/"/g, '""')}"`,
    `"${k.vernacularNote.replace(/"/g, '""')}"`,
    `"/${k.suggestedPageSlug}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ai-global-seo-keywords-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export complete Global SEO report to JSON
 */
export function exportGlobalSeoReportToJson(report: GlobalSeoAgentReport): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `ai-global-seo-analysis-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
