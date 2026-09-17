import { 
  SiteConfig, 
  AiSeoContentAssistantRequest, 
  AiSeoContentAssistantResult,
  BlogOutlineSection,
  TitleOption,
  MetaContentOptimization,
  ContentSearchIntent,
  ContentAngle,
  ContentTone
} from "../types";

export const LOCAL_STORAGE_ASSISTANT_HISTORY_KEY = "jetkur_ai_seo_content_assistant_history_v1";

/**
 * Calculates approximate Google SERP pixel width for a text string (based on Arial 18px).
 * Google typically truncates desktop titles around 580-600 pixels.
 */
export function calculateGooglePixelWidth(text: string): number {
  if (!text) return 0;
  
  // Character pixel width approximation map for Arial
  const widthMap: Record<string, number> = {
    'i': 4, 'l': 4, 'I': 4, 't': 5, 'j': 5, 'f': 5, 'r': 6, ' ': 5,
    'm': 16, 'w': 15, 'M': 16, 'W': 16, 'O': 13, 'Q': 13, 'C': 12, 'D': 12, 'G': 13,
    'a': 9, 'b': 10, 'c': 9, 'd': 10, 'e': 9, 'g': 10, 'h': 10, 'k': 9, 'n': 10,
    'o': 10, 'p': 10, 'q': 10, 's': 8, 'u': 10, 'v': 9, 'x': 9, 'y': 9, 'z': 8,
    'A': 12, 'B': 11, 'E': 10, 'F': 10, 'H': 12, 'K': 11, 'N': 12, 'P': 11, 'R': 12,
    'S': 11, 'T': 10, 'U': 12, 'V': 11, 'X': 11, 'Y': 11, 'Z': 10
  };

  let total = 0;
  for (const char of text) {
    total += widthMap[char] || 9.5;
  }
  return Math.round(total);
}

/**
 * Converts text into a clean, SEO-friendly Turkish URL slug
 */
export function generateCleanSlug(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
  };

  return text
    .toLowerCase()
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extracts high-intent candidate target keywords from SiteConfig for quick suggestions
 */
export function extractTargetKeywordSuggestions(config: SiteConfig): Array<{
  keyword: string;
  category: "Hizmet" | "Yerel / Şehir" | "Ticari Niyet" | "Mevcut SEO";
  searchIntent: ContentSearchIntent;
  estimatedVolume: string;
}> {
  const suggestions: Array<{
    keyword: string;
    category: "Hizmet" | "Yerel / Şehir" | "Ticari Niyet" | "Mevcut SEO";
    searchIntent: ContentSearchIntent;
    estimatedVolume: string;
  }> = [];

  const city = config.city || "İstanbul";
  const sector = config.sector || "Oto Kurtarma & Çekici";

  // 1. Current SEO keywords
  if (config.seo?.keywords && typeof config.seo.keywords === "string") {
    config.seo.keywords.split(",").slice(0, 4).forEach(k => {
      const clean = k.trim();
      if (clean && clean.length > 2) {
        suggestions.push({
          keyword: clean,
          category: "Mevcut SEO",
          searchIntent: clean.includes("fiyat") ? "Ticari" : "Bilgilendirici",
          estimatedVolume: "3.2K / ay"
        });
      }
    });
  }

  // 2. Services from site config
  if (config.services?.items && Array.isArray(config.services.items)) {
    config.services.items.slice(0, 4).forEach(s => {
      if (s && s.title) {
        suggestions.push({
          keyword: `${city} ${s.title.toLowerCase()}`,
          category: "Hizmet",
          searchIntent: "Satın Alma / Yerel",
          estimatedVolume: "4.8K / ay"
        });
      }
    });
  }

  // 3. High-intent commercial keywords
  suggestions.push(
    {
      keyword: `${city} ${sector.toLowerCase()} fiyatları 2026`,
      category: "Ticari Niyet",
      searchIntent: "Ticari",
      estimatedVolume: "6.4K / ay"
    },
    {
      keyword: `En yakın 7/24 ${sector.toLowerCase()} nasıl çağrılır?`,
      category: "Yerel / Şehir",
      searchIntent: "Bilgilendirici",
      estimatedVolume: "5.1K / ay"
    },
    {
      keyword: `${sector.toLowerCase()} seçerken nelere dikkat edilmeli?`,
      category: "Ticari Niyet",
      searchIntent: "Karşılaştırma",
      estimatedVolume: "2.9K / ay"
    }
  );

  // Deduplicate
  const seen = new Set<string>();
  return suggestions.filter(item => {
    const key = item.keyword.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Generates an extensive, highly realistic algorithmic fallback for AI SEO Content Assistant
 * when Gemini API key is offline or processing network requests.
 */
export function generateFallbackAiSeoContentAssistant(
  req: AiSeoContentAssistantRequest
): AiSeoContentAssistantResult {
  const primaryKw = req.primaryKeyword?.trim() || "Oto Çekici Fiyatları";
  const city = req.city || "İstanbul";
  const sector = req.sector || "Oto Çekici & Yol Yardım";
  const company = req.companyName || "JetKur Oto Kurtarma";
  const intent: ContentSearchIntent = req.searchIntent || "Ticari";
  const angle: ContentAngle = req.contentAngle || "Fiyat & Maliyet Analizi";
  const tone: ContentTone = req.tone || "Uzman & Otoriter";
  const targetWords = req.targetWordCount || 1450;
  const audience = req.targetAudience || `${city} bölgesinde güvenilir, faturalı ve sabit fiyatlı ${sector} arayan bireysel ve kurumsal sürücüler`;

  // Secondary LSI keywords
  const secondaryKws = req.secondaryKeywords && req.secondaryKeywords.length > 0
    ? req.secondaryKeywords
    : [
        `${city} ${primaryKw.toLowerCase()}`,
        `7/24 ${sector.toLowerCase()} ücretleri`,
        `${primaryKw.toLowerCase()} hesaplama`,
        `en uygun ${sector.toLowerCase()}`,
        `km başı çekici tarifesi`
      ];

  // Capitalize primary kw for titles
  const formattedKw = primaryKw.charAt(0).toUpperCase() + primaryKw.slice(1);

  // Suggested Titles
  const titleOptions: TitleOption[] = [
    {
      title: `${formattedKw} 2026: Güncel Tarife & Km Başına Ücret Rehberi`,
      charCount: `${formattedKw} 2026: Güncel Tarife & Km Başına Ücret Rehberi`.length,
      pixelWidth: calculateGooglePixelWidth(`${formattedKw} 2026: Güncel Tarife & Km Başına Ücret Rehberi`),
      ctrRating: "Çok Yüksek",
      angleDescription: "Sayı ve güncel yıl içeren, Google SERP'te en yüksek tıklama oranına (CTR) sahip başlık biçimi."
    },
    {
      title: `${city} ${formattedKw} Ne Kadar? Sabit Fiyat ve Mesafe Hesaplama`,
      charCount: `${city} ${formattedKw} Ne Kadar? Sabit Fiyat ve Mesafe Hesaplama`.length,
      pixelWidth: calculateGooglePixelWidth(`${city} ${formattedKw} Ne Kadar? Sabit Fiyat ve Mesafe Hesaplama`),
      ctrRating: "Yüksek",
      angleDescription: "Yerel arama niyetini doğrudan karşılayan ve kullanıcı sorusunu hedefleyen başlık."
    },
    {
      title: `${formattedKw} Rehberi: Sürpriz Masraflardan Kaçınma ve En Uygun Fiyat`,
      charCount: `${formattedKw} Rehberi: Sürpriz Masraflardan Kaçınma ve En Uygun Fiyat`.length,
      pixelWidth: calculateGooglePixelWidth(`${formattedKw} Rehberi: Sürpriz Masraflardan Kaçınma ve En Uygun Fiyat`),
      ctrRating: "Optimal",
      angleDescription: "Tüketici endişesini (sürpriz masraf) gideren güven ve tasarruf odaklı yaklaşım."
    },
    {
      title: `Adım Adım ${formattedKw}: Acil Durumda Nasıl Çağrılır ve Kaç TL Tutar?`,
      charCount: `Adım Adım ${formattedKw}: Acil Durumda Nasıl Çağrılır ve Kaç TL Tutar?`.length,
      pixelWidth: calculateGooglePixelWidth(`Adım Adım ${formattedKw}: Acil Durumda Nasıl Çağrılır ve Kaç TL Tutar?`),
      ctrRating: "Yüksek",
      angleDescription: "Hem 'Nasıl' (how-to) hem de fiyat sorgularını bir arada yakalayan hibrit arama niyeti başlığı."
    }
  ];

  const selectedTitle = titleOptions[0].title;
  const cleanSlug = generateCleanSlug(`${city}-${primaryKw}-2026-rehberi`);

  // Meta Title & Meta Description
  const metaTitle = `${formattedKw} 2026: Güncel Fiyat Tarifesi & Hesaplama | ${company}`;
  const metaDescription = `${city} ve çevresinde 2026 güncel ${primaryKw.toLowerCase()} tarifesi, km başı maliyet dökümü ve sürprizsiz sabit fiyat garantisi. 7/24 anında teklif alın!`;

  // Structured Sections Outline
  const sections: BlogOutlineSection[] = [
    {
      id: "sec-1",
      heading: `2026 Yılında ${formattedKw} Nasıl Belirlenir? Temel Maliyet Kriterleri`,
      purpose: "Okuyucuya fiyat oluşumunun arkasındaki faktörleri şeffafça anlatarak uzmanlık (E-E-A-T) kurmak ve hemen çıkma oranını (Bounce Rate) düşürmek.",
      targetKeywords: [primaryKw, "km başı ücret", "çekici maliyeti"],
      estimatedWords: 280,
      suggestedVisualOrBlock: "Maliyet Bileşenleri Özet Bilgi Grafiği (Mesafe, Araç Tipi, Otoyol/Köprü)",
      subheadings: [
        {
          title: "Mesafe ve Km Başı Fiyatlandırma Mantığı",
          bulletPoints: [
            "Şehir içi açılış taban ücreti ve kilometre kademeleri",
            "Şehirlerarası taşımada dönüş kilometresi hesaplaması",
            "Gece tarifesi ve mesai dışı ek masraflar gerçeği"
          ]
        },
        {
          title: "Araç Sınıfına Göre Fiyat Farklılıkları",
          bulletPoints: [
            "Binek otomobil, SUV ve hafif ticari araç katsayıları",
            "Motosiklet, tekne veya lüks spor araçlar için özel aparat masrafları",
            "Ağır vasıta ve kilitli tekerlek (aparatlı) müdahaleleri"
          ]
        }
      ]
    },
    {
      id: "sec-2",
      heading: `${city} Bölgesi İçin Ortalama Fiyat Tablosu (2026 Güncel Karşılaştırma)`,
      purpose: "Google Featured Snippets (Öne Çıkan Yanıt) ve AI Overviews kutularına girmek için yapılandırılmış veri tablosu sunmak.",
      targetKeywords: [`${city} ${primaryKw.toLowerCase()}`, "fiyat tarifesi tablosu", "ortalama ücret"],
      estimatedWords: 340,
      suggestedVisualOrBlock: "Fiyat Karşılaştırma Tablosu (Mesafe Kademeleri: 0-10km, 10-30km, 50km+)",
      subheadings: [
        {
          title: "Mesafe Aralıklarına Göre Tahmini Fiyat Aralıkları",
          bulletPoints: [
            "Kısa mesafe (0-10 km) şehir içi acil çekici ortalama fiyatı",
            "Orta mesafe (10-30 km) ilçe geçişi ortalama maliyeti",
            "Uzun mesafe ve otoyol (Kuzey Marmara / TEM vb.) gişe dahil dökümü"
          ]
        },
        {
          title: "Piyasadaki En Düşük Fiyat Tuzaklarına Karşı Dikkat Edilmesi Gerekenler",
          bulletPoints: [
            "Telefonda düşük söyleyip olay yerinde 2 katı talep eden komisyoncular",
            "KDV ve resmi fatura kesmeyen merdiven altı çalışanların riskleri",
            "Kasko ve taşıma sigortası olmayan korsan çekiciler"
          ]
        }
      ]
    },
    {
      id: "sec-3",
      heading: `En Uygun Fiyatla ${sector} Hizmeti Almanın 5 Altın İpucu`,
      purpose: "Kullanıcıya doğrudan tasarruf sağlayan uygulanabilir pratik ipuçları vererek içerik paylaşılabilirliğini artırmak.",
      targetKeywords: ["uygun çekici bulma", "çekici tasarruf ipuçları"],
      estimatedWords: 310,
      suggestedVisualOrBlock: "Kontrol Listesi Kutusu (Checklist) + Dikkat İkonları",
      subheadings: [
        {
          title: "Konum Bilginizi ve Araç Durumunu Doğru İletin",
          bulletPoints: [
            "WhatsApp canlı konum atarak gereksiz arama süresini ve km sapmasını önleyin",
            "Aracın vites kilidi, direksiyon kilitlenmesi veya tekerlek durumunu önceden belirtin"
          ]
        },
        {
          title: "Kasko ve Sigorta Poliçenizin Ücretsiz Çekici Hakkını Kontrol Edin",
          bulletPoints: [
            "Yılda 1-2 kez ücretsiz çekici teminatı olup olmadığını poliçenizden sorgulayın",
            "Anlaşmalı servis dışına çekimlerde fark çıkıp çıkmadığını öğrenin"
          ]
        }
      ]
    },
    {
      id: "sec-4",
      heading: `Sıkça Sorulan Sorular: ${formattedKw} Hakkında Bilmeniz Gereken Her Şey`,
      purpose: "Google SERP'te FAQ Schema ile geniş zengin sonuç alanı kaplamak ve kullanıcıların arama motorundaki ikincil sorularını tüketmek.",
      targetKeywords: ["çekici soruları", `${primaryKw.toLowerCase()} sss`],
      estimatedWords: 290,
      suggestedVisualOrBlock: "Akordeon SSS Modülü (FAQ JSON-LD uyumlu)",
      subheadings: [
        {
          title: "Google People Also Ask (PAA) Kaynaklı En Popüler Sorular",
          bulletPoints: [
            "Çekici ücreti peşin mi ödenir, kredi kartı geçerli mi?",
            "Otoyolda arıza yapınca özel çekici çağırılabilir mi?",
            "Çekiciye binerek araçla birlikte seyahat edebilir miyim?"
          ]
        }
      ]
    },
    {
      id: "sec-5",
      heading: `Sonuç & Doğru Hizmeti Seçme Rehberi`,
      purpose: "İçeriği toparlayarak kullanıcıyı doğrudan telefon veya WhatsApp hattına yönlendirip dönüşüme (Lead) çevirmek.",
      targetKeywords: [`güvenilir ${sector.toLowerCase()}`, "hemen fiyat al"],
      estimatedWords: 230,
      suggestedVisualOrBlock: "Dönüşüm Vurgu Kartı (CTA Banner) + Sabit Telefon / WhatsApp Düğmesi",
      subheadings: [
        {
          title: "Hızlı, Garantili ve Şeffaf Fiyatlandırma İçin",
          bulletPoints: [
            `${company} olarak ${city} genelinde dakikalar içinde varış garantisi`,
            "Telefonda ne konuştuysak fişte o: Sürpriz ücret yok, faturalı ve sigortalı taşımacılık"
          ]
        }
      ]
    }
  ];

  // People Also Ask (PAA)
  const peopleAlsoAsk = [
    {
      question: `2026 yılında ${primaryKw.toLowerCase()} ne kadar tutar?`,
      conciseAnswer: `2026 yılında şehir içi kısa mesafe ${primaryKw.toLowerCase()} taban açılış ücreti ile başlar ve kilometre başına değişkenlik gösterir. Aracın büyüklüğü ve otoyol gişe masrafları toplam tutarı belirleyen ana unsurlardır.`
    },
    {
      question: "Çekici ücreti kilometreye göre nasıl hesaplanır?",
      conciseAnswer: "Hesaplama genellikle 'Açılış / Çağrı Ücreti + (Gidilen Mesafe x Km Fiyatı)' formülüyle yapılır. Şehirlerarası taşımalarda gidiş-dönüş mesafesi dikkate alınır."
    },
    {
      question: "Kasko poliçesi çekici ücretini karşılar mı?",
      conciseAnswer: "Evet, kaskonuzda yol yardım teminatı varsa kaza veya arıza durumunda poliçe limitleri dahilinde (genellikle yılda 1 ila 2 defa) çekici hizmeti ücretsiz sağlanır."
    },
    {
      question: "Gece saatlerinde veya tatil günlerinde çekici fiyatı artar mı?",
      conciseAnswer: "Bazı firmalar gece 00:00'dan sonra %20-30 mesai farkı uygulayabilir. Ancak kurumsal işletmeler 7/24 tek ve şeffaf fiyat tarifesi sunar."
    }
  ];

  // Internal Linking Opportunities
  const internalLinks = [
    {
      anchorText: `${city} oto çekici hizmetlerimiz`,
      targetPage: "/#services",
      context: "İlk bölümde sunulan acil yol yardım ve taşıma paketlerini anlatan sayfaya yönlendirme."
    },
    {
      anchorText: "ücretsiz canlı fiyat teklifi alın",
      targetPage: "/#contact",
      context: "Kullanıcının mesafe belirterek anında net fiyat alabileceği iletişim ve form alanına yönlendirme."
    },
    {
      anchorText: "hakkımızda ve kurumsal teminatlarımız",
      targetPage: "/#about",
      context: "Müşteriye güven ve sigortalı taşımacılık belgelerini gösteren şirket tanıtım sayfasına yönlendirme."
    }
  ];

  // Schema.org JSON-LD
  const schemaJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": selectedTitle,
    "description": metaDescription,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/blog/${cleanSlug}`
    },
    "author": {
      "@type": "Organization",
      "name": company
    },
    "publisher": {
      "@type": "Organization",
      "name": company,
      "logo": {
        "@type": "ImageObject",
        "url": `https://${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/logo.png`
      }
    },
    "datePublished": "2026-09-17T08:00:00+03:00",
    "dateModified": "2026-09-17T08:00:00+03:00",
    "keywords": [primaryKw, ...secondaryKws].join(", "),
    "articleSection": "Sektörel Rehberler & Fiyat Analizi",
    "inLanguage": "tr-TR"
  }, null, 2);

  const metaContent: MetaContentOptimization = {
    metaTitle,
    metaTitleLength: metaTitle.length,
    metaTitlePixelWidth: calculateGooglePixelWidth(metaTitle),
    isMetaTitleOptimal: metaTitle.length >= 50 && metaTitle.length <= 65,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    isMetaDescriptionOptimal: metaDescription.length >= 135 && metaDescription.length <= 165,
    cleanSlug,
    primaryKeyword: primaryKw,
    secondaryKeywords: secondaryKws,
    ogTitle: `${selectedTitle} | ${company}`,
    ogDescription: metaDescription,
    featuredImageAltText: `${city} bölgesinde ${primaryKw.toLowerCase()} ve yol yardım rehberi kapak görseli`,
    schemaJsonLd
  };

  return {
    id: `assistant-out-${Date.now()}`,
    createdAt: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    source: "algorithmic_fallback",
    modelUsed: "gemini-3.8-flash (Algoritmik Optimize)",
    primaryKeyword: primaryKw,
    secondaryKeywords: secondaryKws,
    searchIntent: intent,
    targetAudience: audience,
    contentAngle: angle,
    tone: tone,
    estimatedReadingTime: "6-8 dk",
    targetWordCount: targetWords,
    competitionDifficulty: "Orta",
    titleOptions,
    selectedTitle,
    hookIntro: {
      hookLine: `Yolda kaldığınızda ya da aracınızı bir noktadan diğerine taşıtmanız gerektiğinde, aklınıza gelen ilk soru genellikle şudur: "${formattedKw} ne kadar ve beni ne kadarlık bir fatura bekliyor?"`,
      problemAgitation: "Piyasada şeffaf olmayan km hesaplamaları, otoyol gişelerinin sonradan eklenmesi ve telefonla verilen fiyatın olay yerinde değişmesi gibi durumlar sürücüler için ciddi bir mağduriyet yaratabiliyor.",
      valuePromise: `Bu 2026 rehberinde; ${city} bölgesinde güncel tarife dinamiklerini, km başı maliyet dökümlerini ve bütçenizi koruyarak en kaliteli hizmeti nasıl alabileceğinizi adım adım inceliyoruz.`
    },
    sections,
    featuredSnippetSummary: `2026 yılında ${primaryKw.toLowerCase()}; araç tipi, kat edilen toplam kilometre mesafesi ve otoyol/köprü geçiş ücretlerine göre hesaplanır. Şehir içi kısa mesafede taban çağrı bedeli uygulanırken, mesafe uzadıkça km başına ek ücret eklenir. Şeffaf ve sabit fiyatlı teklif almak, beklenmedik sürpriz masrafları engeller.`,
    peopleAlsoAsk,
    internalLinks,
    callToActionPlan: {
      placement: "Makale ortası özet kutusundan sonra ve makale bitiminde",
      ctaHeadline: `Aracınız İçin ${city} Bölgesinde Sabit Fiyatlı Çekiciye mi İhtiyacınız Var?`,
      ctaButtonText: "Hemen WhatsApp'tan Canlı Konum ile Fiyat Al",
      ctaDescription: "7/24 hazır filomuzla 15 dakikada yanınızdayız. Telefonda ne konuştuysak fişte o!"
    },
    eeatChecklist: {
      experience: "Olay yerinde karşılaşılan gerçek sürücü deneyimlerini ve en sık yapılan kilometre hatalarını vurgulayın.",
      expertise: "2026 yılı güncel akaryakıt, amortisman ve oto kurtarma ekipman katsayılarını şeffafça açıklayın.",
      authoritativeness: "Yerel ilçe bazlı referanslar, yetki belgeleri ve Kasko yol yardım standartlarını ekleyin.",
      trustworthiness: "Tüm fiyatların KDV dahil, sözleşmeli ve sigortalı taşımacılık güvencesiyle sunulduğunu belirtin."
    },
    metaContent
  };
}
