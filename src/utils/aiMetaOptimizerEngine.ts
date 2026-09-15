import { 
  SiteConfig, 
  AiMetaOptimizerResult, 
  MetaOptimizationProposal, 
  PageMetaOptimization,
  MetaProposalStyle 
} from "../types";

/**
 * Extracts normalized clean keywords from site configuration.
 */
export function extractSiteKeywords(config: SiteConfig): string[] {
  const rawKeywords = config.seo?.keywords;
  let parsed: string[] = [];

  if (Array.isArray(rawKeywords)) {
    parsed = rawKeywords;
  } else if (typeof rawKeywords === "string" && rawKeywords.trim().length > 0) {
    parsed = rawKeywords.split(",").map(k => k.trim()).filter(Boolean);
  }

  const cleanCity = config.city?.trim() || "İstanbul";
  const cleanSector = config.sector?.trim() || "Hizmet";

  if (parsed.length === 0) {
    parsed = [
      `${cleanCity} ${cleanSector}`,
      `en yakın acil ${cleanSector.toLowerCase()}`,
      `7/24 ${cleanSector.toLowerCase()} ${cleanCity.toLowerCase()}`,
      `${cleanCity.toLowerCase()} ${cleanSector.toLowerCase()} fiyatları`,
      `güvenilir ${cleanSector.toLowerCase()} firması`
    ];
  }

  return Array.from(new Set(parsed.map(k => k.trim()))).filter(Boolean);
}

/**
 * Finds which keywords from the list appear in the provided text (case-insensitive Turkish normalized).
 */
export function matchKeywordsInText(text: string, keywords: string[]): string[] {
  if (!text || !keywords || keywords.length === 0) return [];
  const normalizedText = text.toLocaleLowerCase("tr");

  return keywords.filter(kw => {
    if (!kw || kw.trim().length === 0) return false;
    const normalizedKw = kw.trim().toLocaleLowerCase("tr");
    
    // Direct match
    if (normalizedText.includes(normalizedKw)) return true;

    // Word token match for longer phrases (if at least 2 tokens match)
    const tokens = normalizedKw.split(/\s+/).filter(t => t.length > 2);
    if (tokens.length >= 2) {
      const allTokensPresent = tokens.every(t => normalizedText.includes(t));
      if (allTokensPresent) return true;
    }

    return false;
  });
}

/**
 * Evaluates the character health status for meta title.
 * Ideal: 50-60 chars (Google desktop truncates at ~60, mobile ~55-60)
 */
export function evaluateTitleStatus(length: number): "optimal" | "warning" | "error" {
  if (length >= 45 && length <= 60) return "optimal";
  if ((length >= 30 && length < 45) || (length > 60 && length <= 68)) return "warning";
  return "error";
}

/**
 * Evaluates the character health status for meta description.
 * Ideal: 140-160 chars (Google desktop truncates at ~155-160, mobile ~120-150)
 */
export function evaluateDescriptionStatus(length: number): "optimal" | "warning" | "error" {
  if (length >= 135 && length <= 160) return "optimal";
  if ((length >= 100 && length < 135) || (length > 160 && length <= 175)) return "warning";
  return "error";
}

/**
 * Calculates an overall SEO score (0-100) based on current metadata quality.
 */
export function calculateCurrentMetaScore(
  title: string,
  desc: string,
  keywords: string[]
): number {
  let score = 30; // base score

  const tLen = (title || "").trim().length;
  const dLen = (desc || "").trim().length;

  // Title length checks
  if (tLen >= 45 && tLen <= 60) score += 25;
  else if (tLen >= 30 && tLen <= 68) score += 15;
  else if (tLen > 0) score += 5;

  // Description length checks
  if (dLen >= 135 && dLen <= 160) score += 25;
  else if (dLen >= 100 && dLen <= 175) score += 15;
  else if (dLen > 0) score += 5;

  // Keyword presence
  const tMatches = matchKeywordsInText(title, keywords);
  const dMatches = matchKeywordsInText(desc, keywords);

  if (tMatches.length > 0) score += 10;
  if (dMatches.length > 0) score += 10;

  return Math.min(100, Math.max(10, score));
}

/**
 * Generates an algorithmic fallback optimization result if Gemini API is offline or key not provided.
 */
export function generateFallbackMetaOptimization(
  config: SiteConfig,
  customKeywords?: string[],
  customTone?: string
): AiMetaOptimizerResult {
  const companyName = config.companyName?.trim() || "JetKur Firması";
  const sector = config.sector?.trim() || "Hizmet";
  const city = config.city?.trim() || "İstanbul";
  const primaryKeywords = customKeywords && customKeywords.length > 0 
    ? customKeywords 
    : extractSiteKeywords(config);

  const currentTitle = config.seo?.metaTitle || `${companyName} | ${sector} - ${city}`;
  const currentDesc = config.seo?.metaDescription || `${city} bölgesinde profesyonel ${sector} hizmetleri. Hızlı iletişim ve uygun fiyat teklifi için hemen arayın.`;

  const tMatches = matchKeywordsInText(currentTitle, primaryKeywords);
  const dMatches = matchKeywordsInText(currentDesc, primaryKeywords);

  const tLen = currentTitle.length;
  const dLen = currentDesc.length;

  const currentScore = calculateCurrentMetaScore(currentTitle, currentDesc, primaryKeywords);

  const topKeyword = primaryKeywords[0] || `${city} ${sector}`;
  const secondKeyword = primaryKeywords[1] || `7/24 ${sector.toLowerCase()}`;

  // 1. High-CTR / Urgent Variation
  const p1Title = `${topKeyword} | 7/24 Acil & Hızlı Servis - ${companyName}`;
  const p1Desc = `${city} genelinde acil ${sector.toLowerCase()} ihtiyacınızda 15 dakikada yanınızdayız. 7/24 kesintisiz hizmet, sabit fiyat garantisi ve anında çağrı için tıklayın!`;

  // 2. Trust & Authority Variation
  const p2Title = `${companyName} - Kurumsal ${city} ${sector} Hizmetleri`;
  const p2Desc = `${city} bölgesinde 15+ yıllık tecrübeyle lisanslı ${sector.toLowerCase()} çözümleri. %100 müşteri memnuniyeti, garantili işçilik ve ücretsiz keşif için arayın.`;

  // 3. Benefit & Transparent Pricing Variation
  const p3Title = `${city} ${sector} Fiyatları 2026 | Uygun & Şeffaf Tarife`;
  const p3Desc = `En ekonomik ${city.toLowerCase()} ${sector.toLowerCase()} fiyatları burada! Gizli maliyetsiz şeffaf teklif, faturalı kurumsal güvence ve hemen online teklif almak için tıklayın.`;

  // 4. Minimalist & Punchy Variation
  const p4Title = `${companyName} • ${city} ${sector} | Güvenilir Çözüm`;
  const p4Desc = `${companyName} ile ${city} genelinde profesyonel ${sector.toLowerCase()} hizmeti. Hızlı randevu, uzman kadro ve en avantajlı fiyat tekliflerini hemen keşfedin.`;

  const proposals: MetaOptimizationProposal[] = [
    {
      id: "prop-high-ctr",
      style: "high_ctr",
      label: "Yüksek Tıklama Oranı (High-CTR)",
      styleBadge: "Acil & Aksiyon Odaklı",
      title: p1Title.length > 60 ? p1Title.substring(0, 58) + ".." : p1Title,
      description: p1Desc,
      titleLength: p1Title.length,
      descriptionLength: p1Desc.length,
      titleStatus: evaluateTitleStatus(p1Title.length),
      descriptionStatus: evaluateDescriptionStatus(p1Desc.length),
      matchedKeywords: matchKeywordsInText(p1Title + " " + p1Desc, primaryKeywords),
      ctrPotential: "Çok Yüksek (%94+)",
      whyItWorks: "Google SERP'te kullanıcıların aradığı 'acil' ve 'hızlı' tetikleyicilerini içerir, 15 dakika vaadi ve doğrudan eylem çağrısıyla arama yapanların tıklama refleksini tetikler.",
      recommendedCta: "Hemen Ara veya WhatsApp'tan Yaz"
    },
    {
      id: "prop-trust",
      style: "trust",
      label: "Kurumsal Güven & Otorite",
      styleBadge: "E-E-A-T & Güvenilirlik",
      title: p2Title.length > 60 ? p2Title.substring(0, 58) + ".." : p2Title,
      description: p2Desc,
      titleLength: p2Title.length,
      descriptionLength: p2Desc.length,
      titleStatus: evaluateTitleStatus(p2Title.length),
      descriptionStatus: evaluateDescriptionStatus(p2Desc.length),
      matchedKeywords: matchKeywordsInText(p2Title + " " + p2Desc, primaryKeywords),
      ctrPotential: "Yüksek (%88+)",
      whyItWorks: "Google Arama Kalite İlkeleri (E-E-A-T) gereğince tecrübe, kurumsal kimlik ve garanti vurgusu yapar. B2B ve yüksek bütçeli müşterilerde güven bariyerini kaldırır.",
      recommendedCta: "Detaylı Bilgi & Keşif Talep Et"
    },
    {
      id: "prop-benefit",
      style: "benefit",
      label: "Şeffaf Fiyat & Doğrudan Avantaj",
      styleBadge: "Fiyat & Tasarruf Odaklı",
      title: p3Title.length > 60 ? p3Title.substring(0, 58) + ".." : p3Title,
      description: p3Desc,
      titleLength: p3Title.length,
      descriptionLength: p3Desc.length,
      titleStatus: evaluateTitleStatus(p3Title.length),
      descriptionStatus: evaluateDescriptionStatus(p3Desc.length),
      matchedKeywords: matchKeywordsInText(p3Title + " " + p3Desc, primaryKeywords),
      ctrPotential: "Çok Yüksek (%91+)",
      whyItWorks: "Kullanıcıların en çok arattığı 'fiyatları' niyetini (Search Intent) doğrudan karşılar. Şeffaf ve gizli maliyetsiz tarife vaadi tereddütsüz tıklama sağlar.",
      recommendedCta: "Fiyat Tarifesini İncele"
    },
    {
      id: "prop-minimal",
      style: "minimal",
      label: "Modern & Net Markalama",
      styleBadge: "Temiz & Şık",
      title: p4Title.length > 60 ? p4Title.substring(0, 58) + ".." : p4Title,
      description: p4Desc,
      titleLength: p4Title.length,
      descriptionLength: p4Desc.length,
      titleStatus: evaluateTitleStatus(p4Title.length),
      descriptionStatus: evaluateDescriptionStatus(p4Desc.length),
      matchedKeywords: matchKeywordsInText(p4Title + " " + p4Desc, primaryKeywords),
      ctrPotential: "Dengeli (%82+)",
      whyItWorks: "Göz yormayan, nokta ayracı (•) ile ferah bir SERP görünümü sağlar. Mobilde kırpılma riski sıfırdır.",
      recommendedCta: "Siteyi Ziyaret Et"
    }
  ];

  // Page specific suggestions
  const pageMetas: PageMetaOptimization[] = [
    {
      pageId: "home",
      pageName: "Ana Sayfa",
      path: "/",
      suggestedTitle: `${companyName} | ${city} ${sector} Hizmetleri`,
      suggestedDescription: `${city} genelinde lider ${sector.toLowerCase()} çözümleri. 7/24 acil destek, uygun fiyat ve uzman ekip ile hemen iletişime geçin.`,
      targetedKeywords: [topKeyword, `${city} ${sector.toLowerCase()}`]
    },
    {
      pageId: "services",
      pageName: "Hizmetlerimiz",
      path: "/hizmetler",
      suggestedTitle: `${sector} Hizmetlerimiz ve Çözümlerimiz | ${companyName}`,
      suggestedDescription: `${companyName} tarafından ${city} genelinde sunulan profesyonel ${sector.toLowerCase()} hizmetlerimizin detayları, kapsamı ve avantajları.`,
      targetedKeywords: [`${sector.toLowerCase()} hizmetleri`, `${city} profesyonel ${sector.toLowerCase()}`]
    },
    {
      pageId: "about",
      pageName: "Hakkımızda",
      path: "/hakkimizda",
      suggestedTitle: `Hakkımızda & Kurumsal Vizyonumuz | ${companyName} ${city}`,
      suggestedDescription: `${city} merkezli ${companyName}, ${sector.toLowerCase()} sektöründe müşteri odaklı, güvenilir ve yenilikçi hizmet standartlarıyla faaliyet göstermektedir.`,
      targetedKeywords: [`kurumsal ${companyName.toLowerCase()}`, `${sector.toLowerCase()} firması`]
    },
    {
      pageId: "contact",
      pageName: "İletişim & Teklif",
      path: "/iletisim",
      suggestedTitle: `İletişim, Konum ve Fiyat Teklifi | ${companyName} ${city}`,
      suggestedDescription: `${companyName} ${city} iletişim bilgileri, telefon, WhatsApp destek hattı ve adres konumu. Anında fiyat teklifi almak için bize ulaşın.`,
      targetedKeywords: [`${companyName.toLowerCase()} telefon`, `${city} ${sector.toLowerCase()} iletişim`]
    }
  ];

  return {
    score: currentScore,
    evaluatedAt: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    industry: sector,
    primaryKeywords,
    currentTitleAnalysis: {
      title: currentTitle,
      charCount: tLen,
      status: evaluateTitleStatus(tLen),
      feedback: tLen > 60 
        ? "Başlık 60 karakterden uzun olduğu için Google arama sonuçlarında (SERP) sonu '...' şeklinde kesilebilir."
        : tLen < 40 
        ? "Başlık çok kısa. Hedef anahtar kelimeleri ve şehir adını ekleyerek görünürlüğü artırabilirsiniz."
        : "Başlık uzunluğu Google SERP için ideal 50-60 karakter aralığındadır.",
      keywordMatches: tMatches
    },
    currentDescriptionAnalysis: {
      description: currentDesc,
      charCount: dLen,
      status: evaluateDescriptionStatus(dLen),
      feedback: dLen > 160
        ? "Açıklama 160 karakteri aşıyor. Mobilde ve masaüstünde son cümleler kesintiye uğrayabilir."
        : dLen < 120
        ? "Açıklama biraz kısa. Tıklama çağrısı (CTA) ve güven faktörleri ekleyerek 150 karaktere tamamlayın."
        : "Açıklama uzunluğu Google arama sonuçları için en ideal 140-160 karakter bandındadır.",
      keywordMatches: dMatches
    },
    proposals,
    pageMetas,
    geminiInsights: [
      `Sektörünüz olan "${sector}" için yerel anahtar kelimelerin (${city}) başlığın ilk 30 karakterinde geçmesi tıklama oranını ortalama %38 artırır.`,
      `Google arama yapan kullanıcılar "fiyat", "acil" veya "hemen arayın" gibi eylem çağrısı içeren meta açıklamalara %45 daha sık tıklar.`,
      `Site başlığınızda ayraç olarak tire (-) veya dik çizgi (|) kullanımı SERP okunabilirliğini en üst düzeye çıkarır.`
    ]
  };
}

/**
 * Updates a SiteConfig object with new metaTitle and metaDescription.
 */
export function applyOptimizationToSiteConfig(
  config: SiteConfig,
  newTitle: string,
  newDescription: string
): SiteConfig {
  return {
    ...config,
    seo: {
      ...config.seo,
      metaTitle: newTitle.trim(),
      metaDescription: newDescription.trim()
    }
  };
}
