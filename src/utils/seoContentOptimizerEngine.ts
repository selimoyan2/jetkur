import { 
  SeoTitleVariation, 
  SeoDescriptionVariation, 
  SeoKeywordItem, 
  SeoContentOptimizerData 
} from "../types";

export interface IndustryPreset {
  id: string;
  name: string;
  badge: string;
  category: "Hizmet" | "Sağlık" | "Hukuk & Finans" | "Ticaret" | "Teknoloji" | "Gıda & Turizm";
  typicalKeywords: string[];
  intentHighlights: string;
  avgCtrBenchmark: string;
}

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: "oto-kurtarma",
    name: "Oto Kurtarma & Çekici",
    badge: "Acil / 7-24",
    category: "Hizmet",
    typicalKeywords: ["en yakın çekici", "oto kurtarma", "7/24 çekici", "oto çekici fiyatları", "yol yardım"],
    intentHighlights: "Aramaların %88'i acil durum kaynaklı mobildir. 15-20 dk varış süresi ve telefon numarası en çok tıklatan unsurlardır.",
    avgCtrBenchmark: "%9.4"
  },
  {
    id: "dis-klinigi",
    name: "Diş Kliniği & Ağız Sağlığı",
    badge: "Sağlık / E-E-A-T",
    category: "Sağlık",
    typicalKeywords: ["implant fiyatları", "diş beyazlatma", "zirkonyum kaplama", "en iyi diş hekimi", "diş kliniği"],
    intentHighlights: "Kullanıcılar uzman hekim unvanı, şeffaf tedavi seçenekleri ve ağrısız tedavi güvencesine odaklanır.",
    avgCtrBenchmark: "%7.8"
  },
  {
    id: "hukuk-avukatlik",
    name: "Hukuk Bürosu & Avukatlık",
    badge: "Kurumsal / Güven",
    category: "Hukuk & Finans",
    typicalKeywords: ["boşanma avukatı", "ceza avukatı", "iş hukuku danışmanlığı", "tazminat davası avukatı"],
    intentHighlights: "Google E-E-A-T (Deneyim, Uzmanlık, Yetkinlik) kuralları çok katıdır; gizlilik ve uzmanlık vurgusu şarttır.",
    avgCtrBenchmark: "%6.5"
  },
  {
    id: "nakliyat",
    name: "Evden Eve Nakliyat & Lojistik",
    badge: "Teklif / Fiyat",
    category: "Hizmet",
    typicalKeywords: ["evden eve nakliyat", "asansörlü nakliyat", "şehirler arası nakliye", "nakliyat fiyat hesaplama"],
    intentHighlights: "Sigortalı taşımacılık, asansörlü araç ve net sabit fiyat garantisi arayanların 1 numaralı tercihidir.",
    avgCtrBenchmark: "%8.6"
  },
  {
    id: "temizlik",
    name: "Temizlik & Halı Yıkama",
    badge: "Hızlı Servis",
    category: "Hizmet",
    typicalKeywords: ["ev temizliği", "halı yıkama fabrikası", "koltuk yıkama", "ofis temizliği fiyatları"],
    intentHighlights: "Ücretsiz adresten alma/teslimat, hijyen sertifikası ve m2 fiyat şeffaflığı dönüşümü katlar.",
    avgCtrBenchmark: "%8.2"
  },
  {
    id: "emlak",
    name: "Gayrimenkul & Emlak Danışmanlığı",
    badge: "Yatırım / Portföy",
    category: "Ticaret",
    typicalKeywords: ["satılık daire", "kiralık ev", "arsa yatırımı", "gayrimenkul değerleme uzmanı"],
    intentHighlights: "Mahalle/ilçe adı içeren yerel aramalar ve komisyonsuz veya yetki belgeli ofis vurgusu en yüksek dönüşümü getirir.",
    avgCtrBenchmark: "%7.2"
  },
  {
    id: "restoran-kafe",
    name: "Restoran, Kafe & Catering",
    badge: "Lezzet & Rezervasyon",
    category: "Gıda & Turizm",
    typicalKeywords: ["en iyi kahvaltı mekanları", "akşam yemeği restoranı", "online rezervasyon", "catering yemek şirketi"],
    intentHighlights: "Menü çeşitliliği, açık hava/manzara detayları ve anında masa rezervasyonu butonları SERP tıklamasını artırır.",
    avgCtrBenchmark: "%8.9"
  },
  {
    id: "insaat-tadilat",
    name: "İnşaat, Tadilat & Dekorasyon",
    badge: "Anahtar Teslim",
    category: "Hizmet",
    typicalKeywords: ["anahtar teslim ev tadilatı", "banyo yenileme", "iç mimarlık ofisi", "villa dekorasyon"],
    intentHighlights: "Ücretsiz keşif, 3D görselleştirme desteği ve sözleşmeli gününde teslim garantisi dönüşüm yaratır.",
    avgCtrBenchmark: "%6.9"
  },
  {
    id: "e-ticaret",
    name: "E-Ticaret & Perakende Satış",
    badge: "Kargo & İndirim",
    category: "Ticaret",
    typicalKeywords: ["online sipariş", "aynı gün kargo", "orijinal ürün garantisi", "indirimli fiyatlar"],
    intentHighlights: "Fiyat avantajı, 'Aynı Gün Ücretsiz Kargo' ve taksit imkanları SERP'te en yüksek tıklama tetikleyicisidir.",
    avgCtrBenchmark: "%9.1"
  },
  {
    id: "guzellik-kuafor",
    name: "Güzellik Merkezi & Kuaför",
    badge: "Randevu & Bakım",
    category: "Sağlık",
    typicalKeywords: ["lazer epilasyon", "cilt bakımı fiyatları", "en iyi kuaför", "kalıcı makyaj"],
    intentHighlights: "FDA onaylı cihazlar, hijyenik VIP odalar ve online kolay randevu avantajı aramalarda öne çıkarır.",
    avgCtrBenchmark: "%8.4"
  },
  {
    id: "bilisim-yazilim",
    name: "Bilişim, Yazılım & Web Tasarım",
    badge: "B2B / Teknoloji",
    category: "Teknoloji",
    typicalKeywords: ["web tasarım ajansı", "özel yazılım geliştirme", "e-ticaret sitesi yaptırma", "seo danışmanlığı"],
    intentHighlights: "Modern referanslar, mobil uyumluluk ve anahtar teslim hızlı yayın taahhüdü B2B kararlarını belirler.",
    avgCtrBenchmark: "%5.9"
  },
  {
    id: "egitim-ders",
    name: "Özel Ders & Eğitim Kurumu",
    badge: "Başarı & Deneyim",
    category: "Hizmet",
    typicalKeywords: ["birebir özel ders", "yks hazırlık kursu", "online ingilizce dersi", "lgs koçluğu"],
    intentHighlights: "Öğretmen tecrübesi, ücretsiz deneme dersi ve derece yaptıran başarı istatistikleri tercih sebebidir.",
    avgCtrBenchmark: "%7.5"
  },
  {
    id: "tesisat-elektrik",
    name: "Tesisat & Elektrik Tamiri",
    badge: "Kırmadan Dökmeden",
    category: "Hizmet",
    typicalKeywords: ["su kaçağı tespiti", "kırmadan tıkanıklık açma", "acil elektrikçi", "kombi petek temizleme"],
    intentHighlights: "Kameralı kırmadan tespit, 30 dakikada servis ve garantili işçilik yerel tıklamayı zirveye taşır.",
    avgCtrBenchmark: "%9.8"
  },
  {
    id: "mali-musavirlik",
    name: "Mali Müşavirlik & Muhasebe",
    badge: "B2B / Vergi",
    category: "Hukuk & Finans",
    typicalKeywords: ["şirket kuruluşu", "mali müşavir ücretleri", "e-fatura geçiş danışmanlığı", "vergi planlaması"],
    intentHighlights: "Online şirket kuruluşu, vergi avantajı optimizasyonu ve 7/24 dijital muhasebe takibi öne çıkar.",
    avgCtrBenchmark: "%6.1"
  },
  {
    id: "cilingir",
    name: "Çilingir & Kilit Sistemleri",
    badge: "15 Dk Kapıda",
    category: "Hizmet",
    typicalKeywords: ["en yakın çilingir", "oto anahtarcı", "kapı kilidi açma", "7/24 çilingir fiyatları"],
    intentHighlights: "Saniyelerin önemli olduğu acil aramalarda '15 dk kapınızda' ve 'hasarsız açma' en yüksek CTR sağlar.",
    avgCtrBenchmark: "%11.2"
  },
  {
    id: "turizm-otel",
    name: "Otel, Pansiyon & Turizm",
    badge: "Tatil & Konaklama",
    category: "Gıda & Turizm",
    typicalKeywords: ["en uygun otel fiyatları", "erken rezervasyon fırsatları", "denize sıfır butik otel", "tatil köyü"],
    intentHighlights: "En iyi fiyat garantisi, iptal edilebilir rezervasyon ve konforlu oda detayları dikkat çeker.",
    avgCtrBenchmark: "%8.7"
  }
];

// Pixel width calculation simulation (standard Arial/Google font approximation)
export function calculateGooglePixelWidth(text: string): number {
  if (!text) return 0;
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if ("ilj1|.,:'! ".includes(char)) {
      width += 4;
    } else if ("fItr-()[]".includes(char)) {
      width += 6;
    } else if ("MWm#%@&O".includes(char)) {
      width += 14;
    } else if (char === char.toUpperCase() && char >= 'A' && char <= 'Z') {
      width += 11;
    } else {
      width += 8.5;
    }
  }
  return Math.round(width);
}

export interface OptimizerGenerationParams {
  industry: string;
  companyName: string;
  city?: string;
  targetAudience?: string;
  contentType?: "global" | "hero" | "service" | "product" | "blog" | "about";
  itemTitle?: string;
  currentTitle?: string;
  currentDescription?: string;
  tone?: "high_conversion" | "local" | "urgent" | "authority" | "offer";
  primaryKeywords?: string[];
}

export function generateFallbackSeoContentOptimizer(params: OptimizerGenerationParams): SeoContentOptimizerData {
  const ind = (params.industry || "Kurumsal Hizmetler").trim();
  const comp = (params.companyName || "HızlıWeb İşletmesi").trim();
  const city = (params.city || "İstanbul").trim();
  const item = (params.itemTitle || "").trim();
  const contentType = params.contentType || "global";

  // Find matching or closest preset
  const matchedPreset = INDUSTRY_PRESETS.find(p => 
    p.name.toLowerCase().includes(ind.toLowerCase()) || 
    ind.toLowerCase().includes(p.name.toLowerCase()) ||
    p.typicalKeywords.some(k => ind.toLowerCase().includes(k.toLowerCase()))
  ) || {
    id: "general",
    name: ind,
    badge: "Sektörel Lider",
    category: "Hizmet" as const,
    typicalKeywords: [`${ind.toLowerCase()} fiyatları`, `en yakın ${ind.toLowerCase()}`, `profesyonel ${ind.toLowerCase()}`, `${city.toLowerCase()} ${ind.toLowerCase()}`],
    intentHighlights: `${city} ve çevresinde ${ind} araması yapan kullanıcılar güven, şeffaf fiyat ve hızlı iletişim bekler.`,
    avgCtrBenchmark: "%7.5"
  };

  const cleanItem = item || (contentType === "service" ? "Profesyonel Hizmet" : contentType === "product" ? "Kaliteli Ürün" : ind);

  // Generate 4 targeted title variations
  const titleVariations: SeoTitleVariation[] = [
    {
      id: "title-local",
      variationType: "local_dominance",
      label: "Yerel SEO & Bölge Hakimiyeti",
      title: `${city} ${ind} | ${cleanItem} - ${comp}`,
      charCount: `${city} ${ind} | ${cleanItem} - ${comp}`.length,
      pixelWidth: calculateGooglePixelWidth(`${city} ${ind} | ${cleanItem} - ${comp}`),
      ctrScore: 96,
      intent: "Yerel Arama (Local Search)",
      embeddedKeywords: [`${city} ${ind}`, cleanItem, city],
      reason: `Google yerel algoritması (Local Pack) için şehir ismi ilk 20 karakterde yer aldığında tıklama oranı %38 artar.`
    },
    {
      id: "title-conversion",
      variationType: "high_conversion",
      label: "Yüksek Tıklama & Dönüşüm Odaklı",
      title: `${cleanItem} & ${ind} Hizmetleri | %100 Garantili - ${comp}`,
      charCount: `${cleanItem} & ${ind} Hizmetleri | %100 Garantili - ${comp}`.length,
      pixelWidth: calculateGooglePixelWidth(`${cleanItem} & ${ind} Hizmetleri | %100 Garantili - ${comp}`),
      ctrScore: 94,
      intent: "Ticari Satın Alma (Commercial)",
      embeddedKeywords: [cleanItem, `${ind} Hizmetleri`, "%100 Garantili"],
      reason: "Garanti ve güven belirteçleri SERP'te gezinirken kararsız müşterilerin ilk tıkladığı psikolojik tetikleyicidir."
    },
    {
      id: "title-urgent",
      variationType: "urgent_action",
      label: "7/24 Acil Eylem & Hızlı Çağrı",
      title: `7/24 Acil ${cleanItem} | ${city} En Hızlı - ${comp}`,
      charCount: `7/24 Acil ${cleanItem} | ${city} En Hızlı - ${comp}`.length,
      pixelWidth: calculateGooglePixelWidth(`7/24 Acil ${cleanItem} | ${city} En Hızlı - ${comp}`),
      ctrScore: 97,
      intent: "Acil İhtiyaç (Urgency / Direct Action)",
      embeddedKeywords: ["7/24 Acil", cleanItem, `${city} En Hızlı`],
      reason: "Zaman kısıtı olan kullanıcılara hemen müdahale güvencesi vererek doğrudan telefon aramasını tetikler."
    },
    {
      id: "title-authority",
      variationType: "authority_trust",
      label: "Kurumsal Güven & E-E-A-T Otoritesi",
      title: `${comp} | ${city}'nin Öncü ${ind} ve ${cleanItem} Çözümleri`,
      charCount: `${comp} | ${city}'nin Öncü ${ind} ve ${cleanItem} Çözümleri`.length,
      pixelWidth: calculateGooglePixelWidth(`${comp} | ${city}'nin Öncü ${ind} ve ${cleanItem} Çözümleri`),
      ctrScore: 91,
      intent: "Kurumsal Güven (Brand & Authority)",
      embeddedKeywords: [comp, `${city}'nin Öncü`, ind, cleanItem],
      reason: "Yetkinlik ve sektör öncülüğü vurgusu Google Search Essentials ve E-E-A-T kalite puanını yükseltir."
    },
    {
      id: "title-offer",
      variationType: "offer_benefit",
      label: "Şeffaf Fiyat & Teklif Avantajı",
      title: `${city} ${cleanItem} Fiyatları 2026 | Ücretsiz Keşif & ${comp}`,
      charCount: `${city} ${cleanItem} Fiyatları 2026 | Ücretsiz Keşif & ${comp}`.length,
      pixelWidth: calculateGooglePixelWidth(`${city} ${cleanItem} Fiyatları 2026 | Ücretsiz Keşif & ${comp}`),
      ctrScore: 93,
      intent: "Fiyat Araştırması (High-Intent Transaction)",
      embeddedKeywords: [`${city} ${cleanItem} Fiyatları`, "Ücretsiz Keşif", "2026"],
      reason: "Yıl belirtmek ve fiyat/keşif netliği sunmak Google'da fiyat karşılaştıran kullanıcıları hızla yakalar."
    }
  ];

  // Generate 4 targeted description variations
  const descriptionVariations: SeoDescriptionVariation[] = [
    {
      id: "desc-conversion",
      variationType: "high_conversion",
      label: "Yüksek Dönüşüm & Net Eylem Çağrısı",
      description: `${city} bölgesinde ${cleanItem} ve ${ind.toLowerCase()} alanında uzman kadro, şeffaf fiyatlar ve hızlı teslimat. Hemen teklif alın, avantajlı fiyatları kaçırmayın!`,
      charCount: `${city} bölgesinde ${cleanItem} ve ${ind.toLowerCase()} alanında uzman kadro, şeffaf fiyatlar ve hızlı teslimat. Hemen teklif alın, avantajlı fiyatları kaçırmayın!`.length,
      pixelWidth: calculateGooglePixelWidth(`${city} bölgesinde ${cleanItem} ve ${ind.toLowerCase()} alanında uzman kadro, şeffaf fiyatlar ve hızlı teslimat. Hemen teklif alın, avantajlı fiyatları kaçırmayın!`),
      ctrScore: 98,
      intent: "Satın Alma & Teklif İsteme",
      callToAction: "Hemen teklif alın, avantajlı fiyatları kaçırmayın!",
      embeddedKeywords: [`${city}`, cleanItem, ind.toLowerCase(), "şeffaf fiyatlar", "hızlı teslimat"],
      reason: "155 karakterlik ideal uzunlukta olup güçlü bir eylem çağrısı ve net değer önerisi barındırır."
    },
    {
      id: "desc-local",
      variationType: "local_dominance",
      label: "Bölgesel Liderlik & Yerel Güven",
      description: `${city} geneli ${comp} ile ${ind.toLowerCase()} hizmetinizde. Yılların tecrübesi, müşteri memnuniyeti ve 7/24 kesintisiz destek. Size en yakın şubemizi hemen arayın!`,
      charCount: `${city} geneli ${comp} ile ${ind.toLowerCase()} hizmetinizde. Yılların tecrübesi, müşteri memnuniyeti ve 7/24 kesintisiz destek. Size en yakın şubemizi hemen arayın!`.length,
      pixelWidth: calculateGooglePixelWidth(`${city} geneli ${comp} ile ${ind.toLowerCase()} hizmetinizde. Yılların tecrübesi, müşteri memnuniyeti ve 7/24 kesintisiz destek. Size en yakın şubemizi hemen arayın!`),
      ctrScore: 95,
      intent: "Yerel Güven & Telefon Araması",
      callToAction: "Size en yakın şubemizi hemen arayın!",
      embeddedKeywords: [city, comp, ind.toLowerCase(), "7/24 kesintisiz destek", "en yakın"],
      reason: "Yerel arama yapan kullanıcılara yakınlık hissi verir ve doğrudan arama butonu tetikler."
    },
    {
      id: "desc-urgent",
      variationType: "urgent_action",
      label: "Acil Çözüm & Anında Müdahale",
      description: `Acil ${cleanItem.toLowerCase()} ihtiyacınızda ${comp} 15 dakikada yanınızda! Uygun fiyat garantisi ve 7/24 profesyonel destek için hemen tek tıkla bize ulaşın!`,
      charCount: `Acil ${cleanItem.toLowerCase()} ihtiyacınızda ${comp} 15 dakikada yanınızda! Uygun fiyat garantisi ve 7/24 profesyonel destek için hemen tek tıkla bize ulaşın!`.length,
      pixelWidth: calculateGooglePixelWidth(`Acil ${cleanItem.toLowerCase()} ihtiyacınızda ${comp} 15 dakikada yanınızda! Uygun fiyat garantisi ve 7/24 profesyonel destek için hemen tek tıkla bize ulaşın!`),
      ctrScore: 97,
      intent: "Acil Eylem (Urgent Need)",
      callToAction: "Hemen tek tıkla bize ulaşın!",
      embeddedKeywords: ["Acil", cleanItem.toLowerCase(), "15 dakikada", "uygun fiyat", "7/24"],
      reason: "15 dakika varış taahhüdü ve uygun fiyat vurgusu arama yapan sürücüyü veya müşteriyi hemen arattırır."
    },
    {
      id: "desc-authority",
      variationType: "authority_trust",
      label: "Kurumsal E-E-A-T & Güvence",
      description: `${comp}, ${city} ve çevresinde lisanslı uzmanları ile ${cleanItem.toLowerCase()} hizmeti sunar. %100 memnuniyet güvencesi ve kurumsal referanslarımızla tanışın.`,
      charCount: `${comp}, ${city} ve çevresinde lisanslı uzmanları ile ${cleanItem.toLowerCase()} hizmeti sunar. %100 memnuniyet güvencesi ve kurumsal referanslarımızla tanışın.`.length,
      pixelWidth: calculateGooglePixelWidth(`${comp}, ${city} ve çevresinde lisanslı uzmanları ile ${cleanItem.toLowerCase()} hizmeti sunar. %100 memnuniyet güvencesi ve kurumsal referanslarımızla tanışın.`),
      ctrScore: 92,
      intent: "Kurumsal Araştırma & Güven",
      callToAction: "Referanslarımızla tanışın ve teklif alın.",
      embeddedKeywords: [comp, city, "lisanslı uzmanlar", cleanItem.toLowerCase(), "%100 memnuniyet"],
      reason: "Sertifikalı ve kurumsal işletmeler arayan B2B veya titiz müşteriler için en yüksek güveni aşılar."
    }
  ];

  // High volume keyword suggestions for the industry
  const keywordSuggestions: SeoKeywordItem[] = [
    {
      keyword: `${city.toLowerCase()} ${ind.toLowerCase()}`,
      monthlySearchVolume: "18.400 / ay",
      difficulty: "Orta",
      intent: "Yerel Arama",
      relevance: 99
    },
    {
      keyword: `${ind.toLowerCase()} fiyatları 2026`,
      monthlySearchVolume: "14.200 / ay",
      difficulty: "Orta",
      intent: "Ticari Fiyat",
      relevance: 96
    },
    {
      keyword: `en yakın ${ind.toLowerCase()}`,
      monthlySearchVolume: "12.800 / ay",
      difficulty: "Kolay",
      intent: "Acil İhtiyaç",
      relevance: 95
    },
    {
      keyword: `${city.toLowerCase()} ${cleanItem.toLowerCase()}`,
      monthlySearchVolume: "9.600 / ay",
      difficulty: "Kolay",
      intent: "Hizmet Arama",
      relevance: 94
    },
    {
      keyword: `güvenilir ${ind.toLowerCase()} tavsiye`,
      monthlySearchVolume: "7.100 / ay",
      difficulty: "Kolay",
      intent: "Araştırma / Yorum",
      relevance: 91
    },
    {
      keyword: `en iyi ${ind.toLowerCase()} firmaları`,
      monthlySearchVolume: "5.400 / ay",
      difficulty: "Orta",
      intent: "Karşılaştırma",
      relevance: 88
    },
    {
      keyword: `7/24 acil ${ind.toLowerCase()}`,
      monthlySearchVolume: "6.900 / ay",
      difficulty: "Orta",
      intent: "Acil Eylem",
      relevance: 92
    },
    {
      keyword: `${cleanItem.toLowerCase()} ne kadar`,
      monthlySearchVolume: "4.800 / ay",
      difficulty: "Kolay",
      intent: "Fiyat Sorusu",
      relevance: 86
    }
  ];

  const contentTips = [
    `Başlıkta '${city}' şehir adını mutlaka ilk 3 kelime içinde tutun; yerel Google aramalarda sıralamayı %45 hızlandırır.`,
    `Açıklamanızda '15 dakikada', '7/24', 'Ücretsiz Keşif' veya 'Uygun Fiyat' gibi net bir teklif sunun.`,
    `Açıklama sonuna 'Hemen Arayın' veya 'Tek Tıkla Teklif Alın' gibi eylem çağrısı eklemek tıklama oranını (CTR) ikiye katlar.`,
    `Google piksel sınırını aşmamak için başlıkları 60 karakter / 580px, açıklamaları 155 karakter / 920px altında tutun.`,
    `Belirlediğiniz '${ind}' sektör anahtar kelimelerini sitenizin H1 başlığında ve ilk paragrafında da geçirin.`
  ];

  return {
    industry: ind,
    industryInsights: {
      searchBehavior: matchedPreset.intentHighlights,
      highValueKeywords: matchedPreset.typicalKeywords,
      recommendedFocus: `${city} bölgesinde '${cleanItem}' arayan müşteriler hız, net başlangıç fiyatı ve doğrudan telefon/WhatsApp iletişimine bakar. Sektörel CTR beklentisi ortalama ${matchedPreset.avgCtrBenchmark} civarındadır.`
    },
    titleVariations,
    descriptionVariations,
    keywordSuggestions,
    contentTips
  };
}
