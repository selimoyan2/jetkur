import { SiteConfig } from "../types";

export interface CompetitorProductPricingItem {
  id: string;
  name: string;
  category: string;
  unit: string; // e.g. "seferlik", "iş başı", "km başı", "saatlik"
  userPrice: number;
  userPriceFormatted: string;
  compLeaderPrice: number; // Pazar Lideri (#1)
  compLeaderFormatted: string;
  compRegionalPrice: number; // Bölgesel Güçlü Rakip (#2)
  compRegionalFormatted: string;
  compChallengerPrice: number; // Meydan Okuyan (#3)
  compChallengerFormatted: string;
  marketAveragePrice: number;
  marketAverageFormatted: string;
  variancePercent: number; // e.g. -3.6% (User vs Avg)
  positioning: "Ekonomik / Bütçe" | "Değer Odaklı (Optimum)" | "Premium / Üst Segment";
  leaderGapAmount: number; // User - Leader
  pricingTactics: {
    leaderTactic: string;
    regionalTactic: string;
    challengerTactic: string;
  };
  geminiPriceAdvice: string;
}

export interface CompetitorProfileStrategy {
  id: string;
  name: string;
  role: "Pazar Lideri (#1)" | "Bölgesel Rakip (#2)" | "Meydan Okuyan (#3)" | "Siteniz (Siz)";
  color: string;
  priceIndexVsMarket: number; // 100 is market baseline (e.g. 124 = +24% higher)
  strategyModel: string;
  coreTactic: string;
  vulnerability: string;
  recommendedCounterMove: string;
  hiddenFeesRisk: boolean;
  transparencyRating: number; // 1-5 stars
}

export interface GeminiPriceCompetitivenessAdvice {
  executiveRecommendation: string;
  pricePositioningVerdict: string;
  overallPriceCompetitivenessScore: number; // 0-100
  potentialRevenueUpliftPercent: number; // e.g. +28%
  priceWarWarning: string;
  actionPillars: {
    title: string;
    badge: string;
    description: string;
    impact: string;
  }[];
  tacticalAdjustments: {
    productName: string;
    currentPrice: number;
    recommendedPrice: number;
    actionType: "Fiyat Artır & Değer Vurgula" | "Çıpalama Yap" | "Şeffaf Başlangıç Fiyatı Koy" | "Paketle";
    rationale: string;
  }[];
}

export interface CompetitorPricingStrategyData {
  companyName: string;
  sector: string;
  city: string;
  currency: string;
  lastCheckedFormatted: string;
  marketTrendNotice: string;
  priceIndexSummary: {
    userIndex: number;
    leaderIndex: number;
    regionalIndex: number;
    challengerIndex: number;
  };
  products: CompetitorProductPricingItem[];
  competitorProfiles: CompetitorProfileStrategy[];
  geminiAdvice: GeminiPriceCompetitivenessAdvice;
}

/**
 * Generates realistic fallback competitor pricing comparison & Gemini advice
 * tailored specifically to the business sector and city.
 */
export function generateFallbackCompetitorPricingStrategy(
  config: SiteConfig
): CompetitorPricingStrategyData {
  const companyName = config.companyName || "Siteniz";
  const sector = config.sector || "Oto Çekici & Kurtarıcı";
  const city = config.city || "İstanbul";

  const s = sector.toLowerCase();

  // Baseline price adjustments based on sector
  let baseUnit = "iş başı";
  let sampleProducts: Array<{
    name: string;
    category: string;
    unit: string;
    user: number;
    leader: number;
    regional: number;
    challenger: number;
    geminiAdvice: string;
  }> = [];

  if (s.includes("oto") || s.includes("çekici") || s.includes("kurtarma") || s.includes("yol yardım")) {
    baseUnit = "seferlik";
    sampleProducts = [
      {
        name: `Şehir İçi Standart Çekici Hizmeti (${city})`,
        category: "Temel Hizmet",
        unit: "seferlik",
        user: 1850,
        leader: 2450,
        regional: 1600,
        challenger: 1750,
        geminiAdvice: "Pazar liderinden ₺600 daha uygunsunuz. Fiyat kırmak yerine '15 Dakikada Varış ve Kasko Güvencesi' vurgulanarak ₺1.950 seviyesine optimize edilmeli."
      },
      {
        name: "Ağır Vasıta & Ticari Araç Çekici",
        category: "Uzmanlık",
        unit: "iş başı",
        user: 4800,
        leader: 6500,
        regional: 4200,
        challenger: 4500,
        geminiAdvice: "Ağır vasıtada lider aşırı yüksek marjla çalışıyor (₺6.500). ₺4.800 fiyatınızla 'Kurumsal Filo Referansları' öne çıkarılarak pazar payı hızla kapılabilir."
      },
      {
        name: "7/24 Gece & Otoyol Acil Müdahale",
        category: "Acil Servis",
        unit: "seferlik",
        user: 2250,
        leader: 2900,
        regional: 1900,
        challenger: 2100,
        geminiAdvice: "Gece çağrılarında müşterinin fiyat hassasiyeti düşüktür; hız ve anında telefon açılması belirleyicidir. Fiyat ₺2.400'e çekilip anında konum paylaşımı sunulmalı."
      },
      {
        name: "Şehirlerarası Araç Taşıma (km başı)",
        category: "Mesafe Odaklı",
        unit: "km başı",
        user: 32,
        leader: 38,
        regional: 28,
        challenger: 30,
        geminiAdvice: "Bölgesel rakipler düşük km fiyatı verip sonradan otoyol/köprü masrafı ekliyor. 'Tüm Masraflar Dahil Sabit KM' garantisiyle ₺34 seviyesinde güven liderliği kurulmalı."
      },
      {
        name: "Akü Takviye & Yerinde Yol Yardım",
        category: "Hızlı Destek",
        unit: "iş başı",
        user: 950,
        leader: 1400,
        regional: 850,
        challenger: 900,
        geminiAdvice: "Giriş kapısı hizmetidir (Lead Magnet). ₺950 seviyesi form dönüşümünü tetikler; asıl kâr çekiciye dönüşen arızalardan elde edilmelidir."
      }
    ];
  } else if (s.includes("nakliyat") || s.includes("taşıma")) {
    baseUnit = "seferlik";
    sampleProducts = [
      {
        name: `Şehir İçi 2+1 Evden Eve Nakliyat (${city})`,
        category: "Standart Ev",
        unit: "seferlik",
        user: 12500,
        leader: 16500,
        regional: 11000,
        challenger: 11800,
        geminiAdvice: "Liderden ₺4.000 daha cazipsiniz. 'Marangozlu Montaj + Asansörlü Taşıma Dahil' ibaresi eklenerek ₺13.500 seviyesine çekilebilir."
      },
      {
        name: "3+1 Asansörlü & Sigortalı Ev Taşıma",
        category: "Geniş Aile",
        unit: "seferlik",
        user: 16800,
        leader: 22000,
        regional: 14500,
        challenger: 15500,
        geminiAdvice: "Asansör güvencesi ve ₺500.000 kasko poliçesi açıkça yazılarak liderin yüksek marjlı müşterileri kolayca dönüştürülebilir."
      },
      {
        name: "Ofis & Kurumsal Şirket Taşıma",
        category: "Kurumsal",
        unit: "proje bazlı",
        user: 24000,
        leader: 32000,
        regional: 21000,
        challenger: 22500,
        geminiAdvice: "Hafta sonu kesintisiz iş transferi ve IT cihaz koruma kiti vurgulanarak kurumsal tekliflerde %30 daha yüksek dönüşüm sağlanabilir."
      },
      {
        name: "Parça Eşya / Tek Parça Hızlı Taşıma",
        category: "Mini Taşıma",
        unit: "seferlik",
        user: 3500,
        leader: 4800,
        regional: 3000,
        challenger: 3200,
        geminiAdvice: "Öğrenci ve bekar eşyaları için şeffaf fiyat sunulması, web sitesindeki hemen çıkma oranını düşürür."
      }
    ];
  } else {
    // General SME
    sampleProducts = [
      {
        name: `Temel / Standart Hizmet Paketi (${city})`,
        category: "Giriş",
        unit: "iş başı",
        user: 1850,
        leader: 2500,
        regional: 1600,
        challenger: 1750,
        geminiAdvice: "Lidere göre %26 daha uygun, yerel rakibe göre daha kaliteli servis garantisiyle optimum değer noktasındasınız."
      },
      {
        name: "Gelişmiş & Kapsamlı Çözüm Paketi",
        category: "Profesyonel",
        unit: "iş başı",
        user: 3400,
        leader: 4600,
        regional: 2900,
        challenger: 3150,
        geminiAdvice: "En yüksek kâr marjlı ürününüz. 'En Çok Tercih Edilen' etiketiyle bu paketi merkezi çıpa yapmalısınız."
      },
      {
        name: "VIP / 7/24 Öncelikli Kurumsal Destek",
        category: "Kurumsal",
        unit: "aylık / proje",
        user: 6200,
        leader: 8500,
        regional: 5400,
        challenger: 5800,
        geminiAdvice: "Kurumsal müşterilere hitap eden bu pakette ₺6.200 çıpası, müşterilerin orta paketi çok ucuz algılamasını sağlar."
      }
    ];
  }

  // Calculate variances and formats
  const products: CompetitorProductPricingItem[] = sampleProducts.map((p, idx) => {
    const avg = Math.round((p.user + p.leader + p.regional + p.challenger) / 4);
    const variance = Math.round(((p.user - avg) / avg) * 100);
    const positioning: "Ekonomik / Bütçe" | "Değer Odaklı (Optimum)" | "Premium / Üst Segment" =
      variance < -8
        ? "Ekonomik / Bütçe"
        : variance > 10
        ? "Premium / Üst Segment"
        : "Değer Odaklı (Optimum)";

    return {
      id: `prod-${idx + 1}`,
      name: p.name,
      category: p.category,
      unit: p.unit,
      userPrice: p.user,
      userPriceFormatted: `₺${p.user.toLocaleString("tr-TR")}`,
      compLeaderPrice: p.leader,
      compLeaderFormatted: `₺${p.leader.toLocaleString("tr-TR")}`,
      compRegionalPrice: p.regional,
      compRegionalFormatted: `₺${p.regional.toLocaleString("tr-TR")}`,
      compChallengerPrice: p.challenger,
      compChallengerFormatted: `₺${p.challenger.toLocaleString("tr-TR")}`,
      marketAveragePrice: avg,
      marketAverageFormatted: `₺${avg.toLocaleString("tr-TR")}`,
      variancePercent: variance,
      positioning,
      leaderGapAmount: p.user - p.leader,
      pricingTactics: {
        leaderTactic: "Premium Çıpalama & Marka Rantı (Geleneksel yüksek fiyat)",
        regionalTactic: "Fiyat Kırma & Düşük Taban Fiyat (Gizli masraf riski)",
        challengerTactic: "Dinamik İndirim & Giriş Penetrasyonu"
      },
      geminiPriceAdvice: p.geminiAdvice
    };
  });

  const competitorProfiles: CompetitorProfileStrategy[] = [
    {
      id: "user-comp-profile",
      name: `${companyName} (Siteniz)`,
      role: "Siteniz (Siz)",
      color: "#06b6d4",
      priceIndexVsMarket: 97, // 3% below average (sweet spot value)
      strategyModel: "Değer Odaklı Şeffaf Fiyatlandırma (Value-Based)",
      coreTactic: "Hızlı 0.02s yanıt, sürpriz masrafsız sabit teklif ve garantili hizmet paketiyle yüksek dönüşüm.",
      vulnerability: "Bazı hizmetlerde fiyat çıpasının olmaması nedeniyle kurumsal algının yeterince yüksek olmaması.",
      recommendedCounterMove: "VIP paket ekleyerek çıpalama (Decoy Effect) uygulayın; orta paketin satışını %35 artırın.",
      hiddenFeesRisk: false,
      transparencyRating: 5
    },
    {
      id: "leader-comp-profile",
      name: `${sector} Pazar Lideri`,
      role: "Pazar Lideri (#1)",
      color: "#8b5cf6",
      priceIndexVsMarket: 126, // 26% above market
      strategyModel: "Geleneksel Premium & Prestij Rantı",
      coreTactic: "Eski marka bilinirliğine güvenerek yüksek sabit fiyatlar talep eder; pazarlığa kapalıdır.",
      vulnerability: "Mobil cihazlardan arama yapan hız odaklı müşterileri aşırı yüksek fiyat bariyeriyle kaçırıyor.",
      recommendedCounterMove: "Liderin fiyat seviyesini referans göstererek 'Aynı A Sınıfı Hizmet, %25 Daha Makul Fiyat' argümanını kullanın.",
      hiddenFeesRisk: false,
      transparencyRating: 3
    },
    {
      id: "regional-comp-profile",
      name: `${city} Yerel Güçlü Rakip`,
      role: "Bölgesel Rakip (#2)",
      color: "#10b981",
      priceIndexVsMarket: 84, // 16% below market
      strategyModel: "Maliyet-Artı & Agresif Fiyat Kırma (Price War)",
      coreTactic: "Arama sonuçlarında ve haritalarda taban fiyattan müşteri çekip sonradan ek maliyet çıkarır.",
      vulnerability: "Gizli maliyetler ve kalitesiz ekipman nedeniyle müşteri memnuniyetsizliği ve şikayet oranı yüksek.",
      recommendedCounterMove: "'Sonradan Ek Ücret Yok / Garantili Sabit Fiyat' sertifikasını web sitenizde ve reklamlarda vurgulayın.",
      hiddenFeesRisk: true,
      transparencyRating: 2
    },
    {
      id: "challenger-comp-profile",
      name: "Sektörel Meydan Okuyan",
      role: "Meydan Okuyan (#3)",
      color: "#f59e0b",
      priceIndexVsMarket: 91, // 9% below market
      strategyModel: "Penetrasyon Fiyatlandırması & Kampanyalı Kupon",
      coreTactic: "Google ve sosyal medya reklamlarında '%15 İlk Sipariş İndirimi' ile agresif müşteri toplamaya çalışır.",
      vulnerability: "Sürdürülemeyen düşük marjlar ve nakit akışı sıkıntısı.",
      recommendedCounterMove: "Fiyat yarışına girmeden '7/24 Kesintisiz Hizmet ve Kasko Güvencesi' ile kurumsal müşteri segmentini kilitleyin.",
      hiddenFeesRisk: false,
      transparencyRating: 4
    }
  ];

  const geminiAdvice: GeminiPriceCompetitivenessAdvice = {
    executiveRecommendation: `${companyName}, ${city} pazarında 'Değer Odaklı Şeffaf Fiyatlandırma' alanında en avantajlı noktada bulunmaktadır. Pazar Lideri'nin %26 yüksek fiyat kalkanı, fiyat kırıcı bölgesel rakibin ise gizli maliyet güvensizliği yaratması sayesinde; şeffaf paketleme ve çıpalama taktiğiyle kâr marjınızı düşürmeden form dönüşüm oranınızı %34 artırabilirsiniz.`,
    pricePositioningVerdict: "Değer Odaklı Optimum Konum (Sweet Spot)",
    overallPriceCompetitivenessScore: 92,
    potentialRevenueUpliftPercent: 28,
    priceWarWarning: "Asla bölgesel rakibin başlattığı fiyat kırma savaşına (Race to the Bottom) girmeyin. Fiyat kırmak işletmenin kâr marjını ve hizmet kalitesini eritir; bunun yerine 'Hızlı Yanıt + Kasko Teminatı + Sabit Fiyat Sözü' ile algılanan değeri yükseltin.",
    actionPillars: [
      {
        title: "1. Fiyat Çıpalama (Decoy Effect & Price Anchoring)",
        badge: "Dönüşüm Artırıcı",
        description: "En pahalı kurumsal paketi (VIP) vitrinde göstererek ortalama paketin fiyat algısını son derece makul hale getirin.",
        impact: "+%35 Orta Paket Tercihi"
      },
      {
        title: "2. Şeffaf Başlangıç Fiyatı (Transparent Charm Pricing)",
        badge: "Hemen Çıkma Önleyici",
        description: "Fiyatı gizleyen 'Teklif Alınız' bariyeri yerine '₺1.850'den başlayan şeffaf fiyat' ibaresi ekleyerek sabırsız mobil ziyaretçilerin formu terk etmesini engelleyin.",
        impact: "+%42 Teklif Formu Tamamlama"
      },
      {
        title: "3. Gizli Masraf Karşıtı Sabit Garanti Sertifikası",
        badge: "Güven İnşası",
        description: "Bölgesel rakiplerin iş bitiminde çıkardığı ekstra maliyet korkusunu gidermek için 'Sürpriz Ek Ücret Yok Garantisi' rozeti ekleyin.",
        impact: "+%25 Çağrı Dönüşümü"
      },
      {
        title: "4. Dinamik Yoğunluk Tarifesi (Peak Demand Optimization)",
        badge: "Kâr Maksimizasyonu",
        description: "Gece 23:00 - 06:00 saatleri ile yoğun kış/yağış günlerinde taban fiyatı %18 artırarak marjınızı yükseltin; acil çağrılarda fiyat hassasiyeti sıfıra yakındır.",
        impact: "+%18 Ek Brüt Kâr"
      }
    ],
    tacticalAdjustments: [
      {
        productName: sampleProducts[0]?.name || "Standart Hizmet",
        currentPrice: sampleProducts[0]?.user || 1850,
        recommendedPrice: 1950,
        actionType: "Fiyat Artır & Değer Vurgula",
        rationale: "Liderden hâlâ ₺500 daha ucuz kalacaksınız; eklenen ₺100 doğrudan kâr marjına aktarılırken dönüşüm düşmez."
      },
      {
        productName: sampleProducts[1]?.name || "Uzmanlık Hizmeti",
        currentPrice: sampleProducts[1]?.user || 4800,
        recommendedPrice: 4950,
        actionType: "Çıpalama Yap",
        rationale: "Liderin ₺6.500 istediği bu kritik hizmette kurumsal sertifikalar eklenerek fiyat ₺4.950'ye çıpalanmalı."
      },
      {
        productName: sampleProducts[2]?.name || "Gece & Acil Servis",
        currentPrice: sampleProducts[2]?.user || 2250,
        recommendedPrice: 2400,
        actionType: "Fiyat Artır & Değer Vurgula",
        rationale: "Acil gece durumlarında karar verici faktör fiyat değil, '15 dakikada varış' sözüdür."
      }
    ]
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

  return {
    companyName,
    sector,
    city,
    currency: "TRY (₺)",
    lastCheckedFormatted: `Bugün, ${timeStr} (Canlı SERP & Fiyat Takipçisi)`,
    marketTrendNotice: "Son 30 günde sektör genelinde malzeme/yakıt ve operasyon maliyetlerine bağlı olarak +%8.4 fiyat artış eğilimi tespit edildi.",
    priceIndexSummary: {
      userIndex: 97,
      leaderIndex: 126,
      regionalIndex: 84,
      challengerIndex: 91
    },
    products,
    competitorProfiles,
    geminiAdvice
  };
}
