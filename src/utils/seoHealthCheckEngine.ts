import { SiteConfig, ServiceItem, ProductItem, BlogPostItem, CustomPageItem } from "../types";
import { auditImageAltTexts, autoFixAllMissingAltTexts } from "./seoAuditorEngine";

export interface SeoAuditCheck {
  id: string;
  category: "meta" | "keywords" | "content" | "technical";
  categoryLabel: string;
  title: string;
  description: string;
  status: "critical" | "warning" | "success";
  impact: "high" | "medium" | "low";
  currentValue?: string;
  suggestedValue?: string;
  explanation: string;
  canAutoFix: boolean;
  applyFix: (config: SiteConfig) => SiteConfig;
}

export interface KeywordOpportunity {
  id: string;
  keyword: string;
  intent: "local" | "commercial" | "urgent" | "informational";
  intentLabel: string;
  isInKeywords: boolean;
  isInContent: boolean;
  relevanceScore: number; // 0 - 100
  searchVolumeLevel: "Yüksek" | "Çok Yüksek" | "Orta";
}

export interface SeoHealthReport {
  score: number;
  grade: string;
  gradeColor: string;
  gradeBg: string;
  gradeBorder: string;
  summaryText: string;
  subScores: {
    meta: number;
    keywords: number;
    content: number;
    technical: number;
  };
  counts: {
    total: number;
    passed: number;
    warnings: number;
    critical: number;
    autoFixable: number;
  };
  checks: SeoAuditCheck[];
  keywordOpportunities: KeywordOpportunity[];
}

/**
 * Generate sector-specific & localized high-intent keywords
 */
export function generateKeywordOpportunities(config: SiteConfig): KeywordOpportunity[] {
  const city = (config.city || "İstanbul").trim();
  const sector = (config.sector || "Hizmet").trim();
  const company = (config.companyName || "Firma").trim();
  const currentKeywordsStr = (config.seo?.keywords || "").toLowerCase();
  const allContentStr = [
    config.companyName,
    config.slogan,
    config.sector,
    config.city,
    config.seo?.metaTitle,
    config.seo?.metaDescription,
    ...(config.services?.items?.map(s => `${s.title} ${s.desc}`) || []),
    ...(config.products?.items?.map(p => `${p.title} ${p.shortDescription || ''}`) || [])
  ].join(" ").toLowerCase();

  const baseTerms: Array<{ keyword: string; intent: "local" | "commercial" | "urgent" | "informational"; intentLabel: string; volume: "Yüksek" | "Çok Yüksek" | "Orta" }> = [
    // Local keywords
    { keyword: `${city} ${sector.toLowerCase()}`, intent: "local", intentLabel: "Yerel Arama", volume: "Çok Yüksek" },
    { keyword: `En yakın ${sector.toLowerCase()} ${city}`, intent: "local", intentLabel: "Yerel Konum", volume: "Yüksek" },
    { keyword: `${city} profesyonel ${sector.toLowerCase()}`, intent: "local", intentLabel: "Yerel Arama", volume: "Orta" },
    
    // Commercial / Transaction intent
    { keyword: `${sector.toLowerCase()} fiyatları`, intent: "commercial", intentLabel: "Fiyat & Satın Alma", volume: "Çok Yüksek" },
    { keyword: `${city} ${sector.toLowerCase()} ücreti ve teklif`, intent: "commercial", intentLabel: "Fiyat & Teklif", volume: "Yüksek" },
    { keyword: `Güvenilir ${sector.toLowerCase()} firması`, intent: "commercial", intentLabel: "Kalite & Güven", volume: "Orta" },

    // Urgency & Direct intent
    { keyword: `7/24 ${sector.toLowerCase()} hattı`, intent: "urgent", intentLabel: "Acil Çağrı / 7-24", volume: "Yüksek" },
    { keyword: `Hızlı ${sector.toLowerCase()} hizmeti`, intent: "urgent", intentLabel: "Hızlı Müdahale", volume: "Orta" },

    // Brand + Sector
    { keyword: `${company} ${city}`, intent: "informational", intentLabel: "Marka Araması", volume: "Yüksek" },
    { keyword: `${company} ${sector.toLowerCase()} iletişim`, intent: "commercial", intentLabel: "İletişim & Randevu", volume: "Orta" }
  ];

  // Add top service keywords
  (config.services?.items || []).slice(0, 4).forEach(srv => {
    baseTerms.push({
      keyword: `${city} ${srv.title.toLowerCase()}`,
      intent: "local",
      intentLabel: "Hizmet Araması",
      volume: "Yüksek"
    });
    baseTerms.push({
      keyword: `${srv.title.toLowerCase()} fiyatları`,
      intent: "commercial",
      intentLabel: "Hizmet Fiyatı",
      volume: "Yüksek"
    });
  });

  // Deduplicate and map
  const seen = new Set<string>();
  const opportunities: KeywordOpportunity[] = [];

  baseTerms.forEach((t, index) => {
    const norm = t.keyword.toLowerCase().trim();
    if (!seen.has(norm)) {
      seen.add(norm);
      const isInKeywords = currentKeywordsStr.includes(norm);
      const isInContent = allContentStr.includes(norm);
      
      opportunities.push({
        id: `kw-${index}-${norm.replace(/[^a-z0-9]/gi, '_')}`,
        keyword: t.keyword,
        intent: t.intent,
        intentLabel: t.intentLabel,
        isInKeywords,
        isInContent,
        searchVolumeLevel: t.volume,
        relevanceScore: isInKeywords ? 95 : isInContent ? 80 : 65
      });
    }
  });

  return opportunities;
}

/**
 * Diagnostic Engine: Audits siteConfig against Google SEO Standards
 */
export function runSeoHealthCheck(config: SiteConfig): SeoHealthReport {
  const checks: SeoAuditCheck[] = [];
  const city = (config.city || "İstanbul").trim();
  const sector = (config.sector || "Hizmet").trim();
  const company = (config.companyName || "Firma").trim();
  const currentTitle = (config.seo?.metaTitle || "").trim();
  const currentDesc = (config.seo?.metaDescription || "").trim();
  const currentKeywords = (config.seo?.keywords || "").trim();
  const currentOgImage = (config.seo?.ogImage || "").trim();

  // -------------------------------------------------------------
  // 1. META TITLE CHECKS
  // -------------------------------------------------------------
  const titleLen = currentTitle.length;
  const optimalTitle = `${company} | ${city} ${sector} & 7/24 Hizmet`.slice(0, 58);

  if (!currentTitle || titleLen === 0) {
    checks.push({
      id: "meta-title-empty",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Ana Sayfa Meta Başlığı (Title) Eksik",
      description: "Google arama sonuçlarında görünen en kritik sıralama faktörü olan meta başlık henüz belirlenmemiş.",
      status: "critical",
      impact: "high",
      currentValue: "(Boş veya Tanımsız)",
      suggestedValue: optimalTitle,
      explanation: "Google arama motoru, sayfa başlığı olmayan siteleri arama sonuçlarında geriye atar veya rastgele metinler gösterir. 50-60 karakter arası şehir ve sektör içeren başlık CTR'ı %60 artırır.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          metaTitle: optimalTitle
        }
      })
    });
  } else if (titleLen < 30) {
    checks.push({
      id: "meta-title-short",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Başlığı Çok Kısa (< 30 karakter)",
      description: `Mevcut başlığınız (${titleLen} karakter) Google'ın önerdiği 30-60 karakter ideal aralığının altındadır.`,
      status: "warning",
      impact: "high",
      currentValue: currentTitle,
      suggestedValue: optimalTitle,
      explanation: "Kısa başlıklar anahtar kelime fırsatlarını kaçırır. Şehir ve sektör uzmanlığı ekleyerek yerel aramalarda 1. sayfaya çıkma şansınızı yükseltin.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          metaTitle: optimalTitle
        }
      })
    });
  } else if (titleLen > 60) {
    const shortened = currentTitle.slice(0, 57) + "...";
    checks.push({
      id: "meta-title-long",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Başlığı Fazla Uzun (> 60 karakter)",
      description: `Mevcut başlığınız ${titleLen} karakter. Google mobilde 55-60 karakterden sonrasını keser (...)`,
      status: "warning",
      impact: "medium",
      currentValue: currentTitle,
      suggestedValue: shortened,
      explanation: "Başlığın sonundaki önemli kelimeler kesildiği için ziyaretçiler başlığı tam okuyamaz ve tıklama oranı (CTR) düşer.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          metaTitle: shortened
        }
      })
    });
  } else if (!currentTitle.toLowerCase().includes(city.toLowerCase())) {
    const localizedTitle = `${currentTitle} - ${city}`.slice(0, 60);
    checks.push({
      id: "meta-title-no-city",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Başlığında Şehir / Konum Bilgisi Bulunmuyor",
      description: `Başlığınızda '${city}' ibaresi geçmiyor. Yerel müşteri aramalarında geriye düşebilirsiniz.`,
      status: "warning",
      impact: "high",
      currentValue: currentTitle,
      suggestedValue: localizedTitle,
      explanation: "Google yerel aramalarda (örneğin 'oto çekici izmir' veya 'kadıköy diş hekimi') başlığında şehir geçen siteleri Haritalar ve ilk sıralara taşır.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          metaTitle: localizedTitle
        }
      })
    });
  } else {
    checks.push({
      id: "meta-title-good",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Başlığı Mükemmel Uzunlukta ve Optimize",
      description: `${titleLen} karakter uzunluğundaki başlığınız Google standartlarına tam uygundur.`,
      status: "success",
      impact: "high",
      currentValue: currentTitle,
      explanation: "Başlığınız ideal aralıkta olup arama motoru sonuç sayfalarında (SERP) kesilmeden tam görüntülenir.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // 2. META DESCRIPTION CHECKS
  // -------------------------------------------------------------
  const descLen = currentDesc.length;
  const optimalDesc = `${city} bölgesinde profesyonel ${sector.toLowerCase()} hizmeti. ${company} güvencesiyle 7/24 hızlı çözüm ve uygun fiyatlar. Hemen arayın: ${config.phone || 'iletişime geçin'}.`.slice(0, 155);

  if (!currentDesc || descLen === 0) {
    checks.push({
      id: "meta-desc-empty",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Açıklaması (Description) Eksik",
      description: "Arama snippet'inde başlığın altında çıkan 2 satırlık tanıtım yazısı henüz girilmemiş.",
      status: "critical",
      impact: "high",
      currentValue: "(Boş veya Tanımsız)",
      suggestedValue: optimalDesc,
      explanation: "Açıklama girilmediğinde Google sayfadaki rastgele menü yazılarını çeker. Bu da ziyaretçilerin tıklama oranını (CTR) dramatik ölçüde düşürür.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          metaDescription: optimalDesc
        }
      })
    });
  } else if (descLen < 70) {
    checks.push({
      id: "meta-desc-short",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Açıklaması Çok Kısa (< 70 karakter)",
      description: `Mevcut açıklama (${descLen} karakter) arama snippet alanını tam doldurmuyor.`,
      status: "warning",
      impact: "medium",
      currentValue: currentDesc,
      suggestedValue: optimalDesc,
      explanation: "Kısa açıklamalar yeterli güven vermez. Eyleme çağrı (CTA), telefon numarası ve avantajlarınızı ekleyerek tıklanma oranınızı ikiye katlayın.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          metaDescription: optimalDesc
        }
      })
    });
  } else if (descLen > 160) {
    const trimmedDesc = currentDesc.slice(0, 155) + "...";
    checks.push({
      id: "meta-desc-long",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Açıklaması Fazla Uzun (> 160 karakter)",
      description: `Mevcut açıklama ${descLen} karakter. Google 155-160 karakterden sonrasını kesmektedir.`,
      status: "warning",
      impact: "low",
      currentValue: currentDesc,
      suggestedValue: trimmedDesc,
      explanation: "Açıklamanızın en sonundaki çağrı kelimesi (örn. telefon veya teklif alın) kesilebilir.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          metaDescription: trimmedDesc
        }
      })
    });
  } else {
    checks.push({
      id: "meta-desc-good",
      category: "meta",
      categoryLabel: "Meta Etiketleri",
      title: "Meta Açıklaması Optimize Edilmiş",
      description: `${descLen} karakter ile ideal Google masaüstü ve mobil sınırları içerisindedir.`,
      status: "success",
      impact: "high",
      currentValue: currentDesc,
      explanation: "Açıklamanız SERP üzerinde net ve okunabilir bir özet sunmaktadır.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // 3. KEYWORD & LOCAL SEO CHECKS
  // -------------------------------------------------------------
  const keywordArray = currentKeywords ? currentKeywords.split(",").map(k => k.trim()).filter(Boolean) : [];
  const recommendedKwList = [
    `${city} ${sector.toLowerCase()}`,
    `${sector.toLowerCase()} fiyatları`,
    `en yakın ${sector.toLowerCase()}`,
    `7/24 ${sector.toLowerCase()}`,
    `${company} ${city}`,
    `profesyonel ${sector.toLowerCase()} hizmeti`
  ];
  const suggestedKeywordsStr = Array.from(new Set([...keywordArray, ...recommendedKwList])).join(", ");

  if (keywordArray.length === 0) {
    checks.push({
      id: "keywords-empty",
      category: "keywords",
      categoryLabel: "Anahtar Kelimeler",
      title: "Hedef Anahtar Kelimeler Belirlenmemiş",
      description: "Sitenizin hangi aramalarda bulunmasını istediğinizi belirten meta anahtar kelimeler boş.",
      status: "critical",
      impact: "high",
      currentValue: "(Tanımlanmamış)",
      suggestedValue: suggestedKeywordsStr,
      explanation: "Doğru anahtar kelimeler hem arama botlarına odak konusu verir hem de sayfadaki başlık hiyerarşisine rehberlik eder.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          keywords: suggestedKeywordsStr
        }
      })
    });
  } else if (keywordArray.length < 4) {
    checks.push({
      id: "keywords-few",
      category: "keywords",
      categoryLabel: "Anahtar Kelimeler",
      title: "Yetersiz Anahtar Kelime Kapsamı (< 4 kelime)",
      description: `Şu anda yalnızca ${keywordArray.length} adet anahtar kelime tanımlı. Yüksek niyetli yerel aramalar kaçırılıyor olabilir.`,
      status: "warning",
      impact: "medium",
      currentValue: currentKeywords,
      suggestedValue: suggestedKeywordsStr,
      explanation: "Yerel 'fiyatları', 'en yakın' ve 7/24 varyasyonlarını ekleyerek arama hacminizi genişletin.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          keywords: suggestedKeywordsStr
        }
      })
    });
  } else {
    checks.push({
      id: "keywords-good",
      category: "keywords",
      categoryLabel: "Anahtar Kelimeler",
      title: "Zengin Anahtar Kelime Listesi",
      description: `${keywordArray.length} adet hedeflenmiş anahtar kelime tanımlanmış.`,
      status: "success",
      impact: "medium",
      currentValue: currentKeywords,
      explanation: "Sayfanız sektörel ve yerel arama niyetlerini karşılayacak zengin bir kelime tabanına sahip.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // 4. OPEN GRAPH & SOCIAL PREVIEW
  // -------------------------------------------------------------
  const fallbackOg = config.hero?.bgImage || config.services?.items?.[0]?.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341";

  if (!currentOgImage) {
    checks.push({
      id: "og-image-missing",
      category: "technical",
      categoryLabel: "Sosyal Paylaşım & Şema",
      title: "Sosyal Paylaşım Görseli (og:image) Eksik",
      description: "WhatsApp, Facebook, Twitter veya LinkedIn'de sitenizin linki paylaşıldığında görsel kart çıkmayacaktır.",
      status: "warning",
      impact: "medium",
      currentValue: "(Belirtilmemiş)",
      suggestedValue: fallbackOg,
      explanation: "Görselli paylaşımlar WhatsApp ve sosyal medyada 4 kat daha fazla tıklanır ve kurumsal güven oluşturur.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          ogImage: fallbackOg
        }
      })
    });
  } else {
    checks.push({
      id: "og-image-good",
      category: "technical",
      categoryLabel: "Sosyal Paylaşım & Şema",
      title: "OpenGraph Sosyal Medya Paylaşım Görseli Hazır",
      description: "Link paylaşımlarında zengin önizleme kartı ve görseli aktif.",
      status: "success",
      impact: "medium",
      currentValue: currentOgImage,
      explanation: "Sosyal medya ve mesajlaşma uygulamalarında profesyonel bir görünüm sunar.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // 5. SERVICES SEO COVERAGE
  // -------------------------------------------------------------
  const services = config.services?.items || [];
  const servicesMissingSeo = services.filter(s => !s.seoTitle || !s.seoDescription);

  if (services.length > 0 && servicesMissingSeo.length > 0) {
    checks.push({
      id: "services-seo-missing",
      category: "content",
      categoryLabel: "Sayfa & Hizmet Kapsamı",
      title: `${servicesMissingSeo.length} Hizmet Sayfasında Özel SEO Başlıkları Eksik`,
      description: `Toplam ${services.length} hizmetinizden ${servicesMissingSeo.length} tanesi için özel SEO başlığı ve açıklaması girilmemiş.`,
      status: "warning",
      impact: "high",
      currentValue: `${servicesMissingSeo.length} eksik hizmet`,
      suggestedValue: `Tüm hizmetlere otomatik yerel SEO başlıkları (${city} + Hizmet Adı + Fiyatlar) tanımlanabilir.`,
      explanation: "Hizmet sayfaları Google'da spesifik aramalardan en çok müşteri getiren sayfalardır (örneğin 'akü takviyesi fiyatı izmir'). Her birinin özgün başlığı olmalıdır.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        services: {
          ...cfg.services,
          items: cfg.services.items.map(s => ({
            ...s,
            seoTitle: s.seoTitle || `${s.title} Fiyatları & Hizmeti | ${city} ${company}`.slice(0, 60),
            seoDescription: s.seoDescription || `${city} bölgesinde ${s.title.toLowerCase()} için profesyonel, hızlı ve garantili çözümler. Hemen arayın: ${cfg.phone}`.slice(0, 155),
            seoKeywords: s.seoKeywords || `${s.title}, ${s.title} fiyatları, ${city} ${s.title}, ${company}`
          }))
        }
      })
    });
  } else if (services.length > 0) {
    checks.push({
      id: "services-seo-good",
      category: "content",
      categoryLabel: "Sayfa & Hizmet Kapsamı",
      title: "Tüm Hizmet Sayfaları SEO Uyumlu",
      description: `${services.length} adet hizmetin tümü özgün SEO meta etiketlerine sahip.`,
      status: "success",
      impact: "high",
      explanation: "Arama motorları her bir hizmetinizi bağımsız birer iniş sayfası (landing page) olarak indeksleyebilir.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // 6. LOCAL SEARCH NAP SIGNALS (Name, Address, Phone, Map)
  // -------------------------------------------------------------
  const hasPhone = Boolean(config.phone && config.phone.trim().length > 5);
  const hasAddress = Boolean(config.address && config.address.trim().length > 5);
  const hasMap = Boolean(config.googleMapsEmbed && config.googleMapsEmbed.trim().length > 10);

  if (!hasPhone || !hasAddress) {
    checks.push({
      id: "local-nap-missing",
      category: "technical",
      categoryLabel: "Yerel SEO & İletişim",
      title: "Yerel SEO İletişim Bilgileri (Telefon veya Adres) Eksik",
      description: "Google Yerel Harita (Local Pack) sıralaması için tutarlı telefon ve açık adres zorunludur.",
      status: "critical",
      impact: "high",
      currentValue: `Telefon: ${config.phone || 'Yok'}, Adres: ${config.address || 'Yok'}`,
      suggestedValue: "Firma Bilgileri sekmesinden telefon ve açık adresinizi eksiksiz doldurun.",
      explanation: "Google işletmenizin fiziksel varlığını doğrulamak için NAP (Name, Address, Phone) tutarlılığına bakar.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  } else if (!hasMap) {
    checks.push({
      id: "local-map-missing",
      category: "technical",
      categoryLabel: "Yerel SEO & İletişim",
      title: "Google Maps Harita Konumu Eklenmemiş",
      description: "Sitenizde gömülü Google Maps haritası bulunmuyor. Harita eklemek yerel sıralamanızı güçlendirir.",
      status: "warning",
      impact: "medium",
      currentValue: "(Harita Gömülü Değil)",
      suggestedValue: `${city} merkez koordinatlı Google Haritalar embed iframe'i eklenebilir.`,
      explanation: "Harita embed içeren web siteleri Google Yerel Algoritmasında (Google My Business / Maps) daha yüksek alaka düzeyi puanı alır.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        googleMapsEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(`${cfg.companyName} ${cfg.city}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
      })
    });
  } else {
    checks.push({
      id: "local-nap-good",
      category: "technical",
      categoryLabel: "Yerel SEO & İletişim",
      title: "Yerel İşletme (NAP) ve Harita Verileri Tam",
      description: "Telefon, açık adres ve Google Harita entegrasyonu aktif.",
      status: "success",
      impact: "high",
      explanation: "Müşteriler arama sonuçlarından tek tıkla arayabilir ve harita üzerinden yol tarifi alabilir.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // 7. ROBOTS DIRECTIVE & SCHEMA.ORG
  // -------------------------------------------------------------
  const robots = config.seo?.robots || "index, follow";
  if (robots.includes("noindex")) {
    checks.push({
      id: "robots-noindex",
      category: "technical",
      categoryLabel: "Sosyal Paylaşım & Şema",
      title: "Kritik: Robots Direktifi 'noindex' İçeriyor!",
      description: "Siteniz arama motorlarına 'beni dizine ekleme' diyor. Google sıralamalarında çıkamazsınız.",
      status: "critical",
      impact: "high",
      currentValue: robots,
      suggestedValue: "index, follow",
      explanation: "Sitenizin Google'da listelenmesi için robots etiketinin 'index, follow' olması şarttır.",
      canAutoFix: true,
      applyFix: (cfg) => ({
        ...cfg,
        seo: {
          ...cfg.seo,
          robots: "index, follow"
        }
      })
    });
  } else {
    checks.push({
      id: "robots-good",
      category: "technical",
      categoryLabel: "Sosyal Paylaşım & Şema",
      title: "Robots Direktifi Google İndekslemeye Açık",
      description: "Siteniz 'index, follow' direktifiyle tüm arama motoru botlarına açık.",
      status: "success",
      impact: "high",
      explanation: "Googlebot sayfalarınızı rahatça tarayıp dizine ekleyebilir.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // 8. IMAGE ALT TEXTS AUDIT
  // -------------------------------------------------------------
  const imageAudit = auditImageAltTexts(config);
  if (imageAudit.totalImages > 0 && imageAudit.imagesMissingAlt > 0) {
    checks.push({
      id: "image-alt-missing",
      category: "content",
      categoryLabel: "İçerik & Görsel SEO",
      title: `Eksik Görsel Alt Metinleri (${imageAudit.imagesMissingAlt}/${imageAudit.totalImages} Görsel)`,
      description: `Sitedeki ${imageAudit.totalImages} görselden ${imageAudit.imagesMissingAlt} tanesinde alt (alt-text) etiketi eksik veya tanımsız.`,
      status: imageAudit.imagesMissingAlt > 3 ? "critical" : "warning",
      impact: "high",
      currentValue: `${imageAudit.imagesMissingAlt} eksik görsel`,
      suggestedValue: "Tüm görsellere anahtar kelime ve lokasyon içeren açıklayıcı alt metinler ekleyin.",
      explanation: "Google Görseller arama motorundan trafik çekmek ve görme engelli erişilebilirliği için tüm görsellerde açıklayıcı alt metin bulunmalıdır.",
      canAutoFix: true,
      applyFix: (cfg) => autoFixAllMissingAltTexts(cfg).updatedConfig
    });
  } else if (imageAudit.totalImages > 0) {
    checks.push({
      id: "image-alt-good",
      category: "content",
      categoryLabel: "İçerik & Görsel SEO",
      title: "Tüm Görsel Alt Metinleri Tam ve Optimize",
      description: `Sitedeki ${imageAudit.totalImages} adet görselin tamamında açıklayıcı alt metinler tanımlanmış.`,
      status: "success",
      impact: "medium",
      explanation: "Google Görsel aramalarda üst sıralara çıkmak için tüm görselleriniz uygun alt etiketlerine sahip.",
      canAutoFix: false,
      applyFix: (c) => c
    });
  }

  // -------------------------------------------------------------
  // SCORE CALCULATION
  // -------------------------------------------------------------
  const criticalCount = checks.filter(c => c.status === "critical").length;
  const warningCount = checks.filter(c => c.status === "warning").length;
  const passedCount = checks.filter(c => c.status === "success").length;
  const autoFixableCount = checks.filter(c => c.canAutoFix && c.status !== "success").length;

  // Weighted scoring (0 - 100)
  // Max score 100. Deduct 22 per critical, 8 per warning
  let rawScore = 100 - (criticalCount * 22) - (warningCount * 8);
  if (rawScore < 15) rawScore = 15;
  if (rawScore > 100) rawScore = 100;
  const score = Math.round(rawScore);

  let grade = "Mükemmel";
  let gradeColor = "text-emerald-500";
  let gradeBg = "bg-emerald-500/10";
  let gradeBorder = "border-emerald-500/20";
  let summaryText = "Sitenizin SEO altyapısı Google standartlarına oldukça uygundur. Arama sonuçlarında üst sıralara çıkmak için hazır durumdasınız.";

  if (score < 50) {
    grade = "Kritik / Zayıf";
    gradeColor = "text-rose-500";
    gradeBg = "bg-rose-500/10";
    gradeBorder = "border-rose-500/20";
    summaryText = "Sitenizde arama motorlarının dizine eklemesini ve üst sıralarda göstermesini engelleyen kritik eksikler tespit edildi. Lütfen önerilen düzeltmeleri uygulayın.";
  } else if (score < 80) {
    grade = "Geliştirilmeli";
    gradeColor = "text-amber-500";
    gradeBg = "bg-amber-500/10";
    gradeBorder = "border-amber-500/20";
    summaryText = "Temel ayarlar mevcut ancak yerel anahtar kelimeler ve meta etiketlerde yapılacak iyileştirmeler Google sıralamanızı belirgin şekilde yükseltecektir.";
  } else if (score < 93) {
    grade = "İyi Seviye";
    gradeColor = "text-teal-600";
    gradeBg = "bg-teal-500/10";
    gradeBorder = "border-teal-500/20";
    summaryText = "Siteniz güçlü bir SEO puanına sahip. Birkaç küçük optimizasyon ile Google'da 1. sayfaya çıkma şansınızı maksimize edebilirsiniz.";
  }

  // Sub-scores
  const metaChecks = checks.filter(c => c.category === "meta");
  const keywordChecks = checks.filter(c => c.category === "keywords");
  const contentChecks = checks.filter(c => c.category === "content");
  const techChecks = checks.filter(c => c.category === "technical");

  const calcSubScore = (list: SeoAuditCheck[]) => {
    if (list.length === 0) return 100;
    const passed = list.filter(c => c.status === "success").length;
    const warn = list.filter(c => c.status === "warning").length;
    return Math.round(((passed * 1 + warn * 0.5) / list.length) * 100);
  };

  const keywordOpportunities = generateKeywordOpportunities(config);

  return {
    score,
    grade,
    gradeColor,
    gradeBg,
    gradeBorder,
    summaryText,
    subScores: {
      meta: calcSubScore(metaChecks),
      keywords: calcSubScore(keywordChecks),
      content: calcSubScore(contentChecks),
      technical: calcSubScore(techChecks)
    },
    counts: {
      total: checks.length,
      passed: passedCount,
      warnings: warningCount,
      critical: criticalCount,
      autoFixable: autoFixableCount
    },
    checks,
    keywordOpportunities
  };
}

/**
 * Apply all fixable suggestions in one click
 */
export function applyAllSeoFixes(config: SiteConfig): SiteConfig {
  const report = runSeoHealthCheck(config);
  let current = config;

  report.checks.forEach(check => {
    if (check.canAutoFix && check.status !== "success") {
      try {
        current = check.applyFix(current);
      } catch (err) {
        console.error("Failed applying SEO fix:", check.id, err);
      }
    }
  });

  return current;
}
