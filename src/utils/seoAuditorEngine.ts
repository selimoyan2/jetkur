import { SiteConfig, ServiceItem, ProductItem, BlogPostItem, GalleryItem, TestimonialItem } from "../types";

export interface AuditedImageItem {
  id: string;
  url: string;
  sourceType: "hero" | "headerLogo" | "about" | "service" | "product" | "gallery" | "blog" | "testimonial" | "mediaAsset";
  sectionLabel: string;
  title: string;
  currentAlt: string;
  hasAlt: boolean;
  isGeneric: boolean;
  suggestedAlt: string;
  itemId?: string;
  subIndex?: number;
}

export interface ImageAltAuditResult {
  totalImages: number;
  imagesWithAlt: number;
  imagesMissingAlt: number;
  coveragePercentage: number;
  healthScore: number; // 0 - 100
  items: AuditedImageItem[];
}

export interface MetaSuggestion {
  id: string;
  type: "local" | "conversion" | "branding" | "compact";
  label: string;
  value: string;
  charCount: number;
  reason: string;
}

export interface MetaTagCheckResult {
  tag: "title" | "description" | "keywords" | "ogImage" | "robots";
  label: string;
  currentValue: string;
  charCount?: number;
  status: "success" | "warning" | "critical";
  message: string;
  issues: string[];
  suggestions: MetaSuggestion[];
}

export interface MetaTagsAuditResult {
  healthScore: number; // 0 - 100
  titleCheck: MetaTagCheckResult;
  descriptionCheck: MetaTagCheckResult;
  keywordsCheck: MetaTagCheckResult;
  ogCheck: MetaTagCheckResult;
  robotsCheck: MetaTagCheckResult;
  checks: MetaTagCheckResult[];
  missingKeywords: Array<{ keyword: string; intent: string; volume: string }>;
}

export interface SeoAuditorReport {
  overallHealthScore: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C";
  gradeLabel: string;
  gradeColor: string;
  gradeBg: string;
  gradeBorder: string;
  summary: string;
  subScores: {
    metaTags: number;
    imageAlt: number;
    technical: number;
  };
  imageAudit: ImageAltAuditResult;
  metaAudit: MetaTagsAuditResult;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  passedCount: number;
}

/**
 * Check if an alt text is generic or placeholder-like
 */
function isAltGeneric(alt: string): boolean {
  if (!alt || alt.trim().length === 0) return true;
  const lower = alt.trim().toLowerCase();
  const genericTerms = [
    "image",
    "img",
    "foto",
    "fotograf",
    "resim",
    "görsel",
    "gorsel",
    "picture",
    "photo",
    "unnamed",
    "placeholder",
    "dsc_",
    "screenshot",
    "untitled",
    "adsız"
  ];

  if (genericTerms.includes(lower)) return true;
  if (lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".webp") || lower.endsWith(".jpeg") || lower.endsWith(".svg")) {
    return true;
  }
  return false;
}

/**
 * Audit all images across siteConfig for missing or generic alt text
 */
export function auditImageAltTexts(config: SiteConfig): ImageAltAuditResult {
  const items: AuditedImageItem[] = [];
  const company = (config.companyName || "İşletme").trim();
  const city = (config.city || "İstanbul").trim();
  const sector = (config.sector || "Hizmet").trim();
  const altMap = config.seo?.imageAltMap || {};

  // 1. Hero background image
  if (config.hero?.bgImage) {
    const url = config.hero.bgImage;
    const currentAlt = (config.hero.bgImageAlt || altMap[url] || "").trim();
    const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
    const isGeneric = isAltGeneric(currentAlt);
    const suggestedAlt = `${company} | ${city} ${sector} - Ana Sayfa Kapak Görseli`;

    items.push({
      id: "img-hero-bg",
      url,
      sourceType: "hero",
      sectionLabel: "Ana Sayfa Hero Kapağı",
      title: config.hero.title || "Hero Banner",
      currentAlt,
      hasAlt,
      isGeneric,
      suggestedAlt
    });
  }

  // 2. Header logo image (if image logo is configured)
  if (config.header?.logoImage) {
    const url = config.header.logoImage;
    const currentAlt = (config.hero?.logoAlt || altMap[url] || "").trim();
    const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
    const isGeneric = isAltGeneric(currentAlt);
    const suggestedAlt = `${company} - ${city} Kurumsal Logo`;

    items.push({
      id: "img-header-logo",
      url,
      sourceType: "headerLogo",
      sectionLabel: "Üst Menü (Header) Logo",
      title: `${company} Logo`,
      currentAlt,
      hasAlt,
      isGeneric,
      suggestedAlt
    });
  }

  // 3. About section image
  if (config.about?.image) {
    const url = config.about.image;
    const currentAlt = (config.about.imageAlt || config.about.altText || altMap[url] || "").trim();
    const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
    const isGeneric = isAltGeneric(currentAlt);
    const suggestedAlt = `${company} - ${city} ${sector} Ekibi ve Kurumsal Tanıtım`;

    items.push({
      id: "img-about",
      url,
      sourceType: "about",
      sectionLabel: "Hakkımızda Bölümü",
      title: config.about.title || "Hakkımızda Görseli",
      currentAlt,
      hasAlt,
      isGeneric,
      suggestedAlt
    });
  }

  // 4. Services images
  (config.services?.items || []).forEach((service: ServiceItem, idx: number) => {
    if (service.image) {
      const url = service.image;
      const currentAlt = (service.altText || service.imageAlt || altMap[url] || "").trim();
      const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
      const isGeneric = isAltGeneric(currentAlt);
      const suggestedAlt = `${service.title} - ${city} ${company} Güvencesiyle`;

      items.push({
        id: `img-service-${service.id || idx}`,
        url,
        sourceType: "service",
        sectionLabel: `Hizmetler: ${service.title}`,
        title: service.title,
        currentAlt,
        hasAlt,
        isGeneric,
        suggestedAlt,
        itemId: service.id
      });
    }
  });

  // 5. Products images
  (config.products?.items || []).forEach((product: ProductItem, idx: number) => {
    const mainImg = product.featuredImage || product.image || (product.images && product.images[0]);
    if (mainImg) {
      const url = mainImg;
      const currentAlt = (product.altText || product.imageAlt || altMap[url] || "").trim();
      const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
      const isGeneric = isAltGeneric(currentAlt);
      const suggestedAlt = `${product.title} - ${company} Orijinal Ürün & Hizmet`;

      items.push({
        id: `img-product-${product.id || idx}`,
        url,
        sourceType: "product",
        sectionLabel: `Katalog / Ürün: ${product.title}`,
        title: product.title,
        currentAlt,
        hasAlt,
        isGeneric,
        suggestedAlt,
        itemId: product.id
      });
    }
  });

  // 6. Gallery items
  (config.gallery?.items || []).forEach((galleryItem: GalleryItem, idx: number) => {
    if (galleryItem.imageUrl) {
      const url = galleryItem.imageUrl;
      const currentAlt = (galleryItem.altText || galleryItem.imageAlt || altMap[url] || "").trim();
      const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
      const isGeneric = isAltGeneric(currentAlt);
      const suggestedAlt = `${galleryItem.title || 'Fotoğraf'} - ${city} ${company} Galeri Çalışması`;

      items.push({
        id: `img-gallery-${galleryItem.id || idx}`,
        url,
        sourceType: "gallery",
        sectionLabel: `Fotoğraf Galerisi: ${galleryItem.title || `#${idx + 1}`}`,
        title: galleryItem.title || `Galeri Fotoğrafı ${idx + 1}`,
        currentAlt,
        hasAlt,
        isGeneric,
        suggestedAlt,
        itemId: galleryItem.id
      });
    }
  });

  // 7. Blog items
  (config.blog?.items || []).forEach((post: BlogPostItem, idx: number) => {
    const postImg = post.coverImage || post.image;
    if (postImg) {
      const url = postImg;
      const currentAlt = (post.altText || post.imageAlt || altMap[url] || "").trim();
      const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
      const isGeneric = isAltGeneric(currentAlt);
      const suggestedAlt = `${post.title} - ${company} Blog Rehberi`;

      items.push({
        id: `img-blog-${post.id || idx}`,
        url,
        sourceType: "blog",
        sectionLabel: `Blog: ${post.title}`,
        title: post.title,
        currentAlt,
        hasAlt,
        isGeneric,
        suggestedAlt,
        itemId: post.id
      });
    }
  });

  // 8. Testimonial avatars
  (config.testimonials?.items || []).forEach((test: TestimonialItem, idx: number) => {
    if (test.avatar) {
      const url = test.avatar;
      const currentAlt = (test.avatarAlt || test.altText || altMap[url] || "").trim();
      const hasAlt = Boolean(currentAlt && !isAltGeneric(currentAlt));
      const isGeneric = isAltGeneric(currentAlt);
      const suggestedAlt = `${test.name} - ${company} Müşteri Referansı ve Yorumu`;

      items.push({
        id: `img-testimonial-${test.id || idx}`,
        url,
        sourceType: "testimonial",
        sectionLabel: `Müşteri Yorumu: ${test.name}`,
        title: `${test.name} Avatar`,
        currentAlt,
        hasAlt,
        isGeneric,
        suggestedAlt,
        itemId: test.id
      });
    }
  });

  const totalImages = items.length;
  const imagesWithAlt = items.filter(i => i.hasAlt).length;
  const imagesMissingAlt = totalImages - imagesWithAlt;
  const coveragePercentage = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100;

  // Score calculation:
  // If 0 images, score 100. Otherwise, coverage % with slight curve
  let healthScore = coveragePercentage;
  if (totalImages > 0 && imagesMissingAlt > 0) {
    // Penalty scale
    healthScore = Math.max(10, Math.round(coveragePercentage * 0.95));
  }

  return {
    totalImages,
    imagesWithAlt,
    imagesMissingAlt,
    coveragePercentage,
    healthScore,
    items
  };
}

/**
 * Audit meta tags (Title, Description, Keywords, OpenGraph, Robots) and build actionable suggestions
 */
export function auditMetaTags(config: SiteConfig): MetaTagsAuditResult {
  const company = (config.companyName || "İşletme").trim();
  const city = (config.city || "İstanbul").trim();
  const sector = (config.sector || "Hizmet").trim();
  const phone = (config.phone || "").trim();

  const currentTitle = (config.seo?.metaTitle || "").trim();
  const currentDesc = (config.seo?.metaDescription || "").trim();
  const currentKeywords = (config.seo?.keywords || "").trim();
  const currentOg = (config.seo?.ogImage || "").trim();
  const currentRobots = (config.seo?.robots || "index, follow").trim();

  // -------------------------------------------------------------
  // 1. Meta Title Audit
  // -------------------------------------------------------------
  const titleLen = currentTitle.length;
  const titleIssues: string[] = [];
  let titleStatus: "success" | "warning" | "critical" = "success";
  let titleMessage = "Başlık Google ideal sınırlarında ve arama motorları için optimize edilmiş.";

  if (!currentTitle || titleLen === 0) {
    titleStatus = "critical";
    titleIssues.push("Meta başlığı (Title tag) tamamen boş!");
    titleMessage = "Google arama motoru dizinine eklerken sayfa başlığı olmadan sonuçlarda rastgele veya bozuk görünürsünüz.";
  } else {
    if (titleLen < 30) {
      titleStatus = "warning";
      titleIssues.push(`Başlık çok kısa (${titleLen} karakter). İdeal aralık 45-60 karakterdir.`);
      titleMessage = "Kısa başlıklar değerli anahtar kelime fırsatlarını kaçırır ve tıklama oranını düşürür.";
    } else if (titleLen > 60) {
      titleStatus = "warning";
      titleIssues.push(`Başlık biraz uzun (${titleLen} karakter). Google 60 karakter sonrasını '...' ile keser.`);
      titleMessage = "Google mobilde ve masaüstünde 58-60 karakter sonrasını kırpar.";
    }

    if (!currentTitle.toLowerCase().includes(city.toLowerCase())) {
      titleIssues.push(`Başlıkta hedef lokasyon ('${city}') geçmiyor.`);
      if (titleStatus === "success") titleStatus = "warning";
    }

    if (!currentTitle.toLowerCase().includes(company.toLowerCase())) {
      titleIssues.push(`Başlıkta firma adı ('${company}') yer almıyor.`);
      if (titleStatus === "success") titleStatus = "warning";
    }
  }

  // Meta Title Suggestions
  const titleSuggestions: MetaSuggestion[] = [
    {
      id: "title-sug-local",
      type: "local",
      label: "Yerel SEO & 7/24 Çağrı",
      value: `${company} | ${city} ${sector} & 7/24 Kesintisiz Hizmet`.slice(0, 58),
      charCount: `${company} | ${city} ${sector} & 7/24 Kesintisiz Hizmet`.slice(0, 58).length,
      reason: "Şehir, sektör ve 7/24 acil çağrı niyetini birleştirerek yerel sıralamayı ve tıklama oranını (CTR) maksimize eder."
    },
    {
      id: "title-sug-conv",
      type: "conversion",
      label: "En İyi Fiyat & Hızlı Çözüm",
      value: `${city} ${sector} Fiyatları | ${company} Güvenilir Çözüm`.slice(0, 58),
      charCount: `${city} ${sector} Fiyatları | ${company} Güvenilir Çözüm`.slice(0, 58).length,
      reason: "Fiyat araştırması yapan ticari arama niyetini doğrudan hedefler."
    },
    {
      id: "title-sug-compact",
      type: "compact",
      label: "Kurumsal & Minimal",
      value: `${company} - ${city} Profesyonel ${sector} Hizmetleri`.slice(0, 58),
      charCount: `${company} - ${city} Profesyonel ${sector} Hizmetleri`.slice(0, 58).length,
      reason: "Kurumsal marka kimliğini öne çıkaran dengeli ve sade yapı."
    }
  ];

  const titleCheck: MetaTagCheckResult = {
    tag: "title",
    label: "Meta Başlığı (Title)",
    currentValue: currentTitle || "(Boş)",
    charCount: titleLen,
    status: titleStatus,
    message: titleMessage,
    issues: titleIssues,
    suggestions: titleSuggestions
  };

  // -------------------------------------------------------------
  // 2. Meta Description Audit
  // -------------------------------------------------------------
  const descLen = currentDesc.length;
  const descIssues: string[] = [];
  let descStatus: "success" | "warning" | "critical" = "success";
  let descMessage = "Açıklama Google arama snippet alanı için ideal uzunlukta ve net eyleme çağrı içeriyor.";

  if (!currentDesc || descLen === 0) {
    descStatus = "critical";
    descIssues.push("Meta açıklaması (Description) tanımlanmamış!");
    descMessage = "Açıklama girilmediğinde Google sayfadaki menü veya rastgele metinleri gösterir.";
  } else {
    if (descLen < 80) {
      descStatus = "warning";
      descIssues.push(`Açıklama çok kısa (${descLen} karakter). İdeal aralık 120-160 karakterdir.`);
      descMessage = "Kısa açıklamalar arama sonucunda güven verici ve ikna edici bilgileri iletmekte yetersiz kalır.";
    } else if (descLen > 165) {
      descStatus = "warning";
      descIssues.push(`Açıklama uzun (${descLen} karakter). Google mobilde 155-160 karakterden sonrasını keser.`);
      descMessage = "En sondaki telefon veya çağrı eylemi mobilde kesintiye uğrayabilir.";
    }

    const hasPhoneOrContact = descLen > 0 && (
      currentDesc.includes("ara") ||
      currentDesc.includes("iletişim") ||
      currentDesc.includes("05") ||
      currentDesc.includes("whatsapp") ||
      currentDesc.includes("teklif")
    );
    if (!hasPhoneOrContact) {
      descIssues.push("Eyleme çağrı (CTA) veya telefon/iletişim vurgusu bulunmuyor.");
      if (descStatus === "success") descStatus = "warning";
    }

    if (!currentDesc.toLowerCase().includes(city.toLowerCase())) {
      descIssues.push(`Açıklamada hedef şehir ('${city}') geçmiyor.`);
      if (descStatus === "success") descStatus = "warning";
    }
  }

  // Meta Description Suggestions
  const phoneText = phone ? `Hemen arayın: ${phone}` : "Hemen arayın veya WhatsApp'tan yazın.";
  const descSuggestions: MetaSuggestion[] = [
    {
      id: "desc-sug-conv",
      type: "conversion",
      label: "Yüksek Dönüşüm & Telefon Odaklı",
      value: `${city} bölgesinde 7/24 profesyonel ${sector.toLowerCase()} hizmeti. ${company} güvencesiyle 15 dakikada hızlı servis ve şeffaf fiyatlar. ${phoneText}`.slice(0, 155),
      charCount: `${city} bölgesinde 7/24 profesyonel ${sector.toLowerCase()} hizmeti. ${company} güvencesiyle 15 dakikada hızlı servis ve şeffaf fiyatlar. ${phoneText}`.slice(0, 155).length,
      reason: "Hızlı varış süresi, güven taahhüdü ve doğrudan arama numarası ile anında müşteri telefonlarına dönüştürür."
    },
    {
      id: "desc-sug-branding",
      type: "branding",
      label: "Kurumsal Güven & Kaskolu Taşıma",
      value: `${company}, ${city} ve çevresinde garantili, kaskolu ve kurumsal ${sector.toLowerCase()} çözümleri sunar. Müşteri memnuniyeti ve uygun fiyat için bize ulaşın.`.slice(0, 155),
      charCount: `${company}, ${city} ve çevresinde garantili, kaskolu ve kurumsal ${sector.toLowerCase()} çözümleri sunar. Müşteri memnuniyeti ve uygun fiyat için bize ulaşın.`.slice(0, 155).length,
      reason: "Kurumsal müşterilere ve kurumsal güvenlik arayanlara odaklanır."
    }
  ];

  const descriptionCheck: MetaTagCheckResult = {
    tag: "description",
    label: "Meta Açıklaması (Description)",
    currentValue: currentDesc || "(Boş)",
    charCount: descLen,
    status: descStatus,
    message: descMessage,
    issues: descIssues,
    suggestions: descSuggestions
  };

  // -------------------------------------------------------------
  // 3. Meta Keywords Audit
  // -------------------------------------------------------------
  const kwList = currentKeywords ? currentKeywords.split(",").map(k => k.trim()).filter(Boolean) : [];
  const kwIssues: string[] = [];
  let kwStatus: "success" | "warning" | "critical" = "success";
  let kwMessage = `${kwList.length} adet anahtar kelime tanımlı ve yerel hedefleri kapsıyor.`;

  if (kwList.length === 0) {
    kwStatus = "critical";
    kwIssues.push("Hedef anahtar kelimeler tanımlanmamış.");
    kwMessage = "Arama motoru robotları ve sayfa içi içerik hiyerarşisi için hedef kelimelerinizi belirtmelisiniz.";
  } else if (kwList.length < 4) {
    kwStatus = "warning";
    kwIssues.push(`Az sayıda anahtar kelime (${kwList.length} adet).`);
    kwMessage = "En az 5-8 adet yüksek niyetli sektörel ve lokasyon kelimesi tavsiye edilir.";
  }

  // Recommended keywords to add
  const potentialKeywords = [
    { keyword: `${city} ${sector.toLowerCase()}`, intent: "Yerel Arama", volume: "Çok Yüksek" },
    { keyword: `${sector.toLowerCase()} fiyatları`, intent: "Fiyat / Ticari", volume: "Çok Yüksek" },
    { keyword: `en yakın ${sector.toLowerCase()} ${city}`, intent: "Acil Konum", volume: "Yüksek" },
    { keyword: `7/24 ${sector.toLowerCase()} ${city}`, intent: "Acil Çağrı", volume: "Yüksek" },
    { keyword: `${company} ${city}`, intent: "Marka", volume: "Orta" },
    { keyword: `güvenilir ${sector.toLowerCase()} firması`, intent: "Kalite", volume: "Orta" }
  ];

  const missingKeywords = potentialKeywords.filter(
    pk => !kwList.some(k => k.toLowerCase() === pk.keyword.toLowerCase())
  );

  const keywordsCheck: MetaTagCheckResult = {
    tag: "keywords",
    label: "Anahtar Kelimeler (Keywords)",
    currentValue: currentKeywords || "(Boş)",
    status: kwStatus,
    message: kwMessage,
    issues: kwIssues,
    suggestions: []
  };

  // -------------------------------------------------------------
  // 4. OpenGraph Social Share Preview (og:image)
  // -------------------------------------------------------------
  const ogIssues: string[] = [];
  let ogStatus: "success" | "warning" = "success";
  let ogMessage = "Sosyal medya ve WhatsApp link paylaşımları için görsel kart aktif.";

  if (!currentOg) {
    ogStatus = "warning";
    ogIssues.push("Sosyal paylaşım görseli (og:image) belirlenmemiş.");
    ogMessage = "WhatsApp veya sosyal medyada link paylaşıldığında görsel çıkmayacaktır.";
  }

  const fallbackOgUrl = config.hero?.bgImage || config.services?.items?.[0]?.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80";

  const ogCheck: MetaTagCheckResult = {
    tag: "ogImage",
    label: "Sosyal Paylaşım Görseli (Open Graph)",
    currentValue: currentOg || "(Tanımlanmamış)",
    status: ogStatus,
    message: ogMessage,
    issues: ogIssues,
    suggestions: [
      {
        id: "og-sug-hero",
        type: "branding",
        label: "Hero Görselini Varsayılan OG Yap",
        value: fallbackOgUrl,
        charCount: fallbackOgUrl.length,
        reason: "WhatsApp ve sosyal ağlarda çekici kurumsal önizleme sağlar."
      }
    ]
  };

  // -------------------------------------------------------------
  // 5. Robots Directive
  // -------------------------------------------------------------
  const robotsIssues: string[] = [];
  let robotsStatus: "success" | "warning" | "critical" = "success";
  let robotsMessage = "Robots direktifi Google botlarının sitenizi dizine eklemesine izin veriyor (index, follow).";

  if (currentRobots.includes("noindex")) {
    robotsStatus = "critical";
    robotsIssues.push("Kritik: Robots etiketinde 'noindex' var! Google sitenizi dizine eklemeyecektir.");
    robotsMessage = "noindex direktifi arama motorlarında sıralama almanızı tamamen engeller.";
  }

  const robotsCheck: MetaTagCheckResult = {
    tag: "robots",
    label: "Robots İndeksleme Direktifi",
    currentValue: currentRobots,
    status: robotsStatus,
    message: robotsMessage,
    issues: robotsIssues,
    suggestions: [
      {
        id: "robots-sug-index",
        type: "branding",
        label: "İndekslemeyi Aç (index, follow)",
        value: "index, follow",
        charCount: 13,
        reason: "Tüm arama motorlarının sitenizi tarayıp ilk sayfaya çıkarması için zorunludur."
      }
    ]
  };

  // Meta Health Score Calculation
  let metaHealthScore = 100;
  if (titleStatus === "critical") metaHealthScore -= 30;
  else if (titleStatus === "warning") metaHealthScore -= 12;

  if (descStatus === "critical") metaHealthScore -= 30;
  else if (descStatus === "warning") metaHealthScore -= 12;

  if (kwStatus === "critical") metaHealthScore -= 20;
  else if (kwStatus === "warning") metaHealthScore -= 8;

  if (ogStatus === "warning") metaHealthScore -= 10;
  if (robotsStatus === "critical") metaHealthScore -= 40;

  metaHealthScore = Math.max(15, Math.min(100, metaHealthScore));

  return {
    healthScore: metaHealthScore,
    titleCheck,
    descriptionCheck,
    keywordsCheck,
    ogCheck,
    robotsCheck,
    checks: [titleCheck, descriptionCheck, keywordsCheck, ogCheck, robotsCheck],
    missingKeywords
  };
}

/**
 * Generate full SEO Auditor Report with overall Health Score
 */
export function generateSeoAuditorReport(config: SiteConfig): SeoAuditorReport {
  const imageAudit = auditImageAltTexts(config);
  const metaAudit = auditMetaTags(config);

  // Technical score: NAP + Harita + Robots
  let technicalScore = 100;
  if (!config.phone || config.phone.trim().length < 6) technicalScore -= 20;
  if (!config.address || config.address.trim().length < 6) technicalScore -= 20;
  if (!config.googleMapsEmbed) technicalScore -= 15;
  if (config.seo?.robots?.includes("noindex")) technicalScore -= 40;
  technicalScore = Math.max(20, Math.min(100, technicalScore));

  // Weighted overall health score:
  // Meta tags: 40%
  // Image alt texts: 35%
  // Technical & local: 25%
  const overallHealthScore = Math.round(
    (metaAudit.healthScore * 0.40) +
    (imageAudit.healthScore * 0.35) +
    (technicalScore * 0.25)
  );

  let grade: "A+" | "A" | "B" | "C" = "A";
  let gradeLabel = "İyi Seviye";
  let gradeColor = "text-emerald-500";
  let gradeBg = "bg-emerald-500/10";
  let gradeBorder = "border-emerald-500/30";
  let summary = "Sitenizin SEO sağlığı yüksek. Görsel alt metinleri ve meta etiketlerdeki önerileri tamamlayarak mükemmel skora ulaşabilirsiniz.";

  if (overallHealthScore >= 90) {
    grade = "A+";
    gradeLabel = "Mükemmel";
    gradeColor = "text-emerald-500";
    gradeBg = "bg-emerald-500/10";
    gradeBorder = "border-emerald-500/30";
    summary = "Siteniz Google arama motoru standartlarına tam uyumlu. Meta etiketleriniz ve görsel alt metinleriniz zengin anahtar kelimeler içeriyor.";
  } else if (overallHealthScore >= 75) {
    grade = "A";
    gradeLabel = "İyi Seviye";
    gradeColor = "text-teal-600";
    gradeBg = "bg-teal-500/10";
    gradeBorder = "border-teal-500/30";
    summary = "Temel SEO gereksinimleri karşılanmış. Eksik görsel alt metinlerini tamamlayarak yerel sıralamalarda fark yaratabilirsiniz.";
  } else if (overallHealthScore >= 55) {
    grade = "B";
    gradeLabel = "Geliştirilmeli";
    gradeColor = "text-amber-500";
    gradeBg = "bg-amber-500/10";
    gradeBorder = "border-amber-500/30";
    summary = "Sitenizde eksik alt metinler ve optimize edilmemiş meta etiketler bulunuyor. Önerilen düzeltmeleri uygulayarak puanınızı artırın.";
  } else {
    grade = "C";
    gradeLabel = "Kritik Eksikler";
    gradeColor = "text-rose-500";
    gradeBg = "bg-rose-500/10";
    gradeBorder = "border-rose-500/30";
    summary = "Arama motorlarının sitenizi doğru taramasını ve üst sıralarda göstermesini engelleyen eksikler var. Lütfen tek tıkla düzeltmeleri uygulayın.";
  }

  // Count issues
  let criticalIssuesCount = 0;
  let warningIssuesCount = 0;
  let passedCount = 0;

  metaAudit.checks.forEach(c => {
    if (c.status === "critical") criticalIssuesCount++;
    else if (c.status === "warning") warningIssuesCount++;
    else passedCount++;
  });

  if (imageAudit.imagesMissingAlt > 0) {
    if (imageAudit.imagesMissingAlt > 3) criticalIssuesCount++;
    else warningIssuesCount++;
  } else {
    passedCount++;
  }

  if (technicalScore >= 80) passedCount++;
  else warningIssuesCount++;

  return {
    overallHealthScore,
    grade,
    gradeLabel,
    gradeColor,
    gradeBg,
    gradeBorder,
    summary,
    subScores: {
      metaTags: metaAudit.healthScore,
      imageAlt: imageAudit.healthScore,
      technical: technicalScore
    },
    imageAudit,
    metaAudit,
    criticalIssuesCount,
    warningIssuesCount,
    passedCount
  };
}

/**
 * Apply individual image alt text fix into SiteConfig
 */
export function updateSingleImageAltText(
  config: SiteConfig,
  item: AuditedImageItem,
  newAltText: string
): SiteConfig {
  const alt = newAltText.trim();
  let updated = { ...config };

  // Always register in imageAltMap
  const newAltMap = { ...(updated.seo?.imageAltMap || {}), [item.url]: alt };
  updated = {
    ...updated,
    seo: {
      ...updated.seo,
      imageAltMap: newAltMap
    }
  };

  if (item.sourceType === "hero") {
    updated = {
      ...updated,
      hero: {
        ...updated.hero,
        bgImageAlt: alt
      }
    };
  } else if (item.sourceType === "headerLogo") {
    updated = {
      ...updated,
      hero: {
        ...updated.hero,
        logoAlt: alt
      }
    };
  } else if (item.sourceType === "about") {
    updated = {
      ...updated,
      about: {
        ...updated.about,
        imageAlt: alt,
        altText: alt
      }
    };
  } else if (item.sourceType === "service" && item.itemId) {
    updated = {
      ...updated,
      services: {
        ...updated.services,
        items: (updated.services?.items || []).map(s => 
          s.id === item.itemId ? { ...s, altText: alt, imageAlt: alt } : s
        )
      }
    };
  } else if (item.sourceType === "product" && item.itemId) {
    updated = {
      ...updated,
      products: {
        ...updated.products,
        items: (updated.products?.items || []).map(p => 
          p.id === item.itemId ? { ...p, altText: alt, imageAlt: alt } : p
        )
      }
    };
  } else if (item.sourceType === "gallery" && item.itemId) {
    updated = {
      ...updated,
      gallery: {
        ...updated.gallery,
        items: (updated.gallery?.items || []).map(g => 
          g.id === item.itemId ? { ...g, altText: alt, imageAlt: alt } : g
        )
      }
    };
  } else if (item.sourceType === "blog" && item.itemId) {
    updated = {
      ...updated,
      blog: {
        ...updated.blog,
        items: (updated.blog?.items || []).map(b => 
          b.id === item.itemId ? { ...b, altText: alt, imageAlt: alt } : b
        )
      }
    };
  } else if (item.sourceType === "testimonial" && item.itemId) {
    updated = {
      ...updated,
      testimonials: {
        ...updated.testimonials,
        items: (updated.testimonials?.items || []).map(t => 
          t.id === item.itemId ? { ...t, avatarAlt: alt, altText: alt } : t
        )
      }
    };
  }

  return updated;
}

/**
 * 1-Click: Auto-fill all missing alt texts across all images using smart contextual suggestions
 */
export function autoFixAllMissingAltTexts(config: SiteConfig): { updatedConfig: SiteConfig; fixedCount: number } {
  const audit = auditImageAltTexts(config);
  let updated = { ...config };
  let fixedCount = 0;

  audit.items.forEach(item => {
    if (!item.hasAlt || item.isGeneric) {
      updated = updateSingleImageAltText(updated, item, item.suggestedAlt);
      fixedCount++;
    }
  });

  return { updatedConfig: updated, fixedCount };
}

/**
 * Apply Meta Title Suggestion
 */
export function applyMetaTitle(config: SiteConfig, newTitle: string): SiteConfig {
  return {
    ...config,
    seo: {
      ...config.seo,
      metaTitle: newTitle.trim()
    }
  };
}

/**
 * Apply Meta Description Suggestion
 */
export function applyMetaDescription(config: SiteConfig, newDescription: string): SiteConfig {
  return {
    ...config,
    seo: {
      ...config.seo,
      metaDescription: newDescription.trim()
    }
  };
}

/**
 * Add Keyword to Meta Keywords
 */
export function addKeyword(config: SiteConfig, newKeyword: string): SiteConfig {
  const current = (config.seo?.keywords || "").trim();
  const kwArray = current ? current.split(",").map(k => k.trim()).filter(Boolean) : [];
  if (!kwArray.some(k => k.toLowerCase() === newKeyword.toLowerCase())) {
    kwArray.push(newKeyword.trim());
  }
  return {
    ...config,
    seo: {
      ...config.seo,
      keywords: kwArray.join(", ")
    }
  };
}

/**
 * 1-Click: Auto-apply best recommendations for all meta tags
 */
export function autoFixAllMetaRecommendations(config: SiteConfig): { updatedConfig: SiteConfig; fixedCount: number } {
  const audit = auditMetaTags(config);
  let updated = { ...config };
  let fixedCount = 0;

  // Title
  if (audit.titleCheck.status !== "success" && audit.titleCheck.suggestions.length > 0) {
    updated = applyMetaTitle(updated, audit.titleCheck.suggestions[0].value);
    fixedCount++;
  }

  // Description
  if (audit.descriptionCheck.status !== "success" && audit.descriptionCheck.suggestions.length > 0) {
    updated = applyMetaDescription(updated, audit.descriptionCheck.suggestions[0].value);
    fixedCount++;
  }

  // Keywords: add all high intent missing keywords
  if (audit.missingKeywords.length > 0) {
    const current = (updated.seo?.keywords || "").trim();
    const existing = current ? current.split(",").map(k => k.trim()).filter(Boolean) : [];
    audit.missingKeywords.slice(0, 4).forEach(mk => {
      if (!existing.some(e => e.toLowerCase() === mk.keyword.toLowerCase())) {
        existing.push(mk.keyword);
        fixedCount++;
      }
    });
    updated = {
      ...updated,
      seo: {
        ...updated.seo,
        keywords: existing.join(", ")
      }
    };
  }

  // OG Image
  if (audit.ogCheck.status !== "success" && audit.ogCheck.suggestions.length > 0) {
    updated = {
      ...updated,
      seo: {
        ...updated.seo,
        ogImage: audit.ogCheck.suggestions[0].value
      }
    };
    fixedCount++;
  }

  // Robots
  if (audit.robotsCheck.status !== "success") {
    updated = {
      ...updated,
      seo: {
        ...updated.seo,
        robots: "index, follow"
      }
    };
    fixedCount++;
  }

  return { updatedConfig: updated, fixedCount };
}
