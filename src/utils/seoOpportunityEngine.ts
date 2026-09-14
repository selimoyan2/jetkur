import { SiteConfig, CustomerPanelTab, FaqItem, TestimonialItem } from "../types";

export type SeoOpportunityCategory = "meta-tags" | "content-gaps" | "keywords";
export type SeoOpportunitySeverity = "critical" | "warning" | "opportunity";

export interface SeoOpportunityAlert {
  id: string;
  category: SeoOpportunityCategory;
  categoryLabel: string;
  severity: SeoOpportunitySeverity;
  title: string;
  description: string;
  aiReasoning: string;
  estimatedImpact: string; // e.g. "+12 SEO Puanı", "+%35 SERP Tıklanması (CTR)", "+450 Aylık Ziyaretçi"
  impactBadgeColor?: string;
  currentSnippet?: string;
  proposedSnippet?: string;
  actionLabel: string; // e.g. "Hemen Uygula (1-Tık)"
  secondaryActionLabel?: string; // e.g. "İncele"
  targetTab?: CustomerPanelTab;
  canAutoFix: boolean;
  applyFix: (config: SiteConfig) => { updatedConfig: SiteConfig; toast: string };
  tags?: string[];
}

/**
 * Returns surrounding districts/regions for major Turkish cities to power local SEO content gap fixes
 */
function getSurroundingDistricts(city: string): string[] {
  const normCity = (city || "").toLowerCase().trim();
  if (normCity.includes("istanbul") || normCity.includes("i̇stanbul")) {
    return ["Kadıköy", "Beşiktaş", "Ümraniye", "Şişli", "Bakırköy", "Ataşehir"];
  }
  if (normCity.includes("ankara")) {
    return ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan"];
  }
  if (normCity.includes("izmir") || normCity.includes("i̇zmir")) {
    return ["Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı", "Çiğli"];
  }
  if (normCity.includes("bursa")) {
    return ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gürsu"];
  }
  if (normCity.includes("antalya")) {
    return ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat"];
  }
  return [`Merkez`, `${city} Çevresi`, `Tüm İlçeler`, `Hızlı Servis Bölgesi`];
}

/**
 * Generates tailored FAQ items based on sector and city for content gap detection
 */
function getRecommendedFaqsForSector(sector: string, city: string, company: string): FaqItem[] {
  const q1 = `${city} genelinde ${sector.toLowerCase()} hizmetiniz ne kadar sürede ulaşır?`;
  const a1 = `${company} olarak ${city} merkez ve tüm çevre ilçelerde acil çağrı ve randevulu hizmet sağlamaktayız. Talebiniz iletildikten sonra uzman ekibimiz ortalama 20-30 dakika içerisinde adresinizde olmaktadır.`;

  const q2 = `${sector} fiyatları ve ücret tarifesi nasıl belirlenmektedir?`;
  const a2 = `Fiyatlarımız yapılacak işlemin niteliği, kullanılacak ekipman ve mesafeye göre şeffaf bir şekilde hesaplanır. İşlem öncesi kesin fiyat teklifi sunulur, sürpriz veya gizli ek ücret talep edilmez.`;

  const q3 = `Hizmetleriniz garantili mi ve resmi fatura kesiliyor mu?`;
  const a3 = `Evet, gerçekleştirilen tüm ${sector.toLowerCase()} uygulamalarımız kurumsal güvence ve müşteri memnuniyeti garantisi altındadır. İşlem sonrasında kurumsal e-fatura veya fiş düzenlenmektedir.`;

  return [
    {
      id: `faq-ai-${Date.now()}-1`,
      q: q1,
      a: a1,
      question: q1,
      answer: a1
    },
    {
      id: `faq-ai-${Date.now()}-2`,
      q: q2,
      a: a2,
      question: q2,
      answer: a2
    },
    {
      id: `faq-ai-${Date.now()}-3`,
      q: q3,
      a: a3,
      question: q3,
      answer: a3
    }
  ];
}

/**
 * Generates realistic customer reviews for content gap social proof
 */
function getRecommendedTestimonialsForSector(sector: string, city: string): TestimonialItem[] {
  return [
    {
      id: `test-ai-${Date.now()}-1`,
      name: "Murat Yılmaz",
      role: `${city} Sakini / Bireysel Müşteri`,
      comment: `${city} genelinde aldığım en profesyonel ve hızlı ${sector.toLowerCase()} hizmetiydi. Dakikalar içinde geldiler, tertemiz çalıştılar. Gözünüz kapalı güvenebilirsiniz!`,
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: `test-ai-${Date.now()}-2`,
      name: "Selin Öztürk",
      role: "İşletme Yöneticisi",
      comment: `Fiyat teklifi şeffaftı, hiçbir ekstra masraf çıkarmadılar. Personelin kibarlığı ve kurumsal yaklaşımı harikaydı. Google yorumlarına bakarak aradım, kesinlikle 5 yıldızı hak ediyorlar.`,
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: `test-ai-${Date.now()}-3`,
      name: "Ahmet Demir",
      role: "Esnaf / Firma Sahibi",
      comment: `Pazar günü acil ihtiyacımız olduğunda hemen ulaştılar ve sorunu profesyonelce çözdüler. ${city} bölgesinde 1 numara!`,
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ];
}

/**
 * Diagnostic AI Engine: Identifies actionable SEO opportunities across:
 * 1. Meta Tags (Title, Description, OG Image, Canonical)
 * 2. Content Gaps (FAQ Accordion, Testimonials/Social Proof, Service Depth, Local District Coverage)
 * 3. Keyword Optimizations (Commercial Search Intent, Hero Heading Alignment, Long-Tail Service Keywords)
 */
export function detectSeoOpportunities(config: SiteConfig): SeoOpportunityAlert[] {
  const alerts: SeoOpportunityAlert[] = [];

  const city = (config.city || "İstanbul").trim();
  const sector = (config.sector || "Hizmet").trim();
  const company = (config.companyName || "Firma").trim();
  const phone = (config.phone || "0850 300 00 00").trim();
  
  const currentTitle = (config.seo?.metaTitle || "").trim();
  const currentDesc = (config.seo?.metaDescription || "").trim();
  const currentKeywords = (config.seo?.keywords || "").trim();
  const currentOgImage = (config.seo?.ogImage || "").trim();
  const currentCanonical = (config.seo?.canonicalUrl || "").trim();

  // =========================================================================
  // 1. META TAGS OPPORTUNITIES
  // =========================================================================

  // 1.1 Meta Title: Length, Location & Power Keyword Optimization
  const idealTitle = `${company} | ${city} ${sector} & 7/24 Profesyonel Hizmet`.slice(0, 58);
  const titleNeedsImprovement = 
    !currentTitle || 
    currentTitle.length < 35 || 
    !currentTitle.toLowerCase().includes(city.toLowerCase()) || 
    !currentTitle.toLowerCase().includes(sector.toLowerCase());

  if (titleNeedsImprovement) {
    const isMissing = !currentTitle;
    const isTooShort = currentTitle.length > 0 && currentTitle.length < 35;
    const isMissingCity = !isMissing && !currentTitle.toLowerCase().includes(city.toLowerCase());

    alerts.push({
      id: "meta-title-optimizer",
      category: "meta-tags",
      categoryLabel: "Meta Etiketleri",
      severity: isMissing ? "critical" : "warning",
      title: isMissing 
        ? "Kritik: Google Meta Başlığı Tanımsız" 
        : isTooShort 
        ? "Meta Başlığı Çok Kısa (<35 karakter)" 
        : "Meta Başlığında Şehir / Sektör Eksik",
      description: `Google arama motoru sıralamalarının %65'i sayfa başlığındaki anahtar kelimelere dayanır. Mevcut başlığınız (${currentTitle.length || 0} karakter) yerel aramalarda geri planda kalmanıza yol açıyor.`,
      aiReasoning: `Google'ın ideal başlık standardı 45-60 karakterdir. Firmanızın adı, faaliyet gösterdiğiniz '${city}' ili ve '${sector}' terimi başlığın ilk 40 karakterinde yer almalıdır.`,
      estimatedImpact: "+14 SEO Puanı • +%38 SERP Tıklanması",
      impactBadgeColor: "emerald",
      currentSnippet: currentTitle || "(Henüz belirlenmemiş)",
      proposedSnippet: idealTitle,
      actionLabel: "Hemen Uygula (1-Tık)",
      secondaryActionLabel: "Meta Editörünü Aç",
      targetTab: "page-seo",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updated = {
          ...cfg,
          seo: {
            ...cfg.seo,
            metaTitle: idealTitle
          }
        };
        return {
          updatedConfig: updated,
          toast: `🎯 Meta Başlığı başarıyla optimize edildi: "${idealTitle}" (+14 Puan)`
        };
      },
      tags: ["Meta Title", "CTR Artışı", "Yerel Arama"]
    });
  }

  // 1.2 Meta Description: Length & High-Converting CTA
  const idealDescription = `${city} bölgesinde lider ${sector.toLowerCase()} hizmeti! Uzman kadro, şeffaf fiyat garantisi ve 7/24 acil destek. Ücretsiz bilgi & randevu için hemen arayın: ${phone}`.slice(0, 155);
  const descNeedsImprovement = 
    !currentDesc || 
    currentDesc.length < 90 || 
    !currentDesc.toLowerCase().includes("ara") && !currentDesc.toLowerCase().includes("teklif") && !currentDesc.toLowerCase().includes("bilgi");

  if (descNeedsImprovement) {
    const isMissing = !currentDesc;
    alerts.push({
      id: "meta-desc-optimizer",
      category: "meta-tags",
      categoryLabel: "Meta Etiketleri",
      severity: isMissing ? "critical" : "warning",
      title: isMissing 
        ? "Meta Açıklaması (Description) Eksik" 
        : "Meta Açıklaması Yetersiz & Eyleme Çağrı Yok",
      description: `Google arama sonuçlarında başlığın altında görünen açıklama metniniz ya eksik ya da kullanıcıyı tıklamaya teşvik eden eylem çağrısı (CTA) içermiyor.`,
      aiReasoning: `120-155 karakterlik, acil çağrı ve şeffaf fiyat vaadi içeren açıklamalar organik tıklama oranını (CTR) %30'un üzerinde artırır.`,
      estimatedImpact: "+10 SEO Puanı • +%28 CTR Artışı",
      impactBadgeColor: "emerald",
      currentSnippet: currentDesc || "(Henüz açıklama girilmemiş)",
      proposedSnippet: idealDescription,
      actionLabel: "Hemen Uygula (1-Tık)",
      secondaryActionLabel: "SEO Ayarlarını Aç",
      targetTab: "seo",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updated = {
          ...cfg,
          seo: {
            ...cfg.seo,
            metaDescription: idealDescription
          }
        };
        return {
          updatedConfig: updated,
          toast: `🚀 Meta Açıklaması yüksek dönüşümlü AI şablonuyla güncellendi! (+10 Puan)`
        };
      },
      tags: ["Meta Description", "CTR", "Eyleme Çağrı"]
    });
  }

  // 1.3 OpenGraph Social Sharing Card (WhatsApp, LinkedIn, Twitter Preview)
  const availableHeroImage = config.hero?.bgImage || config.about?.image || (config.gallery?.items && config.gallery.items[0]?.imageUrl) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80";
  if (!currentOgImage) {
    alerts.push({
      id: "meta-og-image-fix",
      category: "meta-tags",
      categoryLabel: "Meta Etiketleri",
      severity: "opportunity",
      title: "Sosyal Paylaşım Görseli (OpenGraph) Eksik",
      description: "Sitenizin linki WhatsApp, Instagram veya Facebook'ta paylaşıldığında görsel önizleme çıkmıyor ve sade link olarak görünüyor.",
      aiReasoning: "OpenGraph 'og:image' etiketi tanımlandığında sosyal mesajlaşma uygulamalarında zengin önizleme kartı açılır. Bu da linke tıklanma oranını 4 katına çıkarır.",
      estimatedImpact: "+%45 Sosyal Tıklanma • Zengin Önizleme Kartı",
      impactBadgeColor: "indigo",
      currentSnippet: "(OpenGraph görseli atanmamış)",
      proposedSnippet: availableHeroImage,
      actionLabel: "Otomatik Bağla (1-Tık)",
      secondaryActionLabel: "Medya Kütüphanesini Aç",
      targetTab: "asset-manager",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updated = {
          ...cfg,
          seo: {
            ...cfg.seo,
            ogImage: availableHeroImage
          }
        };
        return {
          updatedConfig: updated,
          toast: `🖼️ OpenGraph sosyal paylaşım görseli başarıyla tanımlandı!`
        };
      },
      tags: ["OpenGraph", "WhatsApp Preview", "Viral Paylaşım"]
    });
  }

  // 1.4 Canonical URL & Duplication Prevention
  const primaryDomain = config.cloudflare?.customDomain || (config.cloudflare?.subdomain ? `${config.cloudflare.subdomain}.hizliweb.site` : "");
  if (!currentCanonical && primaryDomain) {
    const idealCanonical = `https://${primaryDomain}`;
    alerts.push({
      id: "meta-canonical-tag",
      category: "meta-tags",
      categoryLabel: "Meta Etiketleri",
      severity: "opportunity",
      title: "Kanonik URL (rel=canonical) Bağlantısı Eksik",
      description: "Arama motorlarının 'www' veya 'http/https' varyasyonlarını kopya içerik olarak algılamasını önleyen kanonik etiket henüz atanmamış.",
      aiReasoning: "Tek bir resmi URL belirlemek Google botlarının tarama bütçesini (crawl budget) korur ve backlink gücünü tek bir adreste toplar.",
      estimatedImpact: "+5 Güven Skoru • Kopya İçerik Koruması",
      impactBadgeColor: "blue",
      currentSnippet: "(Kanonik URL tanımsız)",
      proposedSnippet: idealCanonical,
      actionLabel: "Kanonik URL'yi Kilitle",
      secondaryActionLabel: "Domain Ayarları",
      targetTab: "connect-custom-domain",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updated = {
          ...cfg,
          seo: {
            ...cfg.seo,
            canonicalUrl: idealCanonical
          }
        };
        return {
          updatedConfig: updated,
          toast: `🔗 Kanonik URL kilitlendi: ${idealCanonical}`
        };
      },
      tags: ["Canonical", "Google Bot", "Crawl Budget"]
    });
  }

  // =========================================================================
  // 2. CONTENT GAPS OPPORTUNITIES
  // =========================================================================

  // 2.1 Content Gap: FAQ Accordion & FAQPage Schema Rich Snippet
  const faqList = config.faqs?.items || config.faq?.items || [];
  const isFaqActive = config.faqs?.enabled ?? config.faq?.enabled;
  if (!isFaqActive || faqList.length < 3) {
    const recommendedFaqs = getRecommendedFaqsForSector(sector, city, company);
    alerts.push({
      id: "content-gap-faq-accordion",
      category: "content-gaps",
      categoryLabel: "İçerik Boşluğu",
      severity: "critical",
      title: "İçerik Boşluğu: SSS (FAQ) Bölümü Eksik",
      description: "Sitenizde ziyaretçilerin en çok merak ettiği fiyat, süre ve garanti sorularını yanıtlayan akordeon SSS bloğu bulunmuyor.",
      aiReasoning: "Google 'People Also Ask' ve 'FAQPage Structured Data' özelliklerini sadece zengin SSS içeriğine sahip sitelere verir. SERP'te 2 kat daha fazla yer kaplamanızı sağlar.",
      estimatedImpact: "+15 SEO Puanı • Google Arama Akordeonu (Rich Snippet)",
      impactBadgeColor: "amber",
      currentSnippet: isFaqActive ? `${faqList.length} soru mevcut (Yetersiz)` : "SSS Bölümü Kapalı / Boş",
      proposedSnippet: `3 adet sektörel SSS eklenecek: 1) ${recommendedFaqs[0].question.slice(0, 45)}... 2) Fiyat politikası 3) Garanti ve faturalandırma`,
      actionLabel: "SSS Ekle ve Çöz (1-Tık)",
      secondaryActionLabel: "SSS Yönetimini Aç",
      targetTab: "faqs",
      canAutoFix: true,
      applyFix: (cfg) => {
        const existingItems = cfg.faqs?.items || [];
        const mergedItems = existingItems.length > 0 
          ? [...existingItems, ...recommendedFaqs.filter(rf => !existingItems.some(e => e.question === rf.question))]
          : recommendedFaqs;

        const updated: SiteConfig = {
          ...cfg,
          faqs: {
            enabled: true,
            badge: "Sıkça Sorulan Sorular",
            title: "Merak Edilen Sorular & Cevaplar",
            subtitle: `${city} ${sector.toLowerCase()} hizmetlerimiz hakkında tüm detaylar`,
            items: mergedItems,
            layout: "two-columns",
            accordionStyle: "modern",
            allowMultipleOpen: false,
            showSearch: true
          }
        };
        return {
          updatedConfig: updated,
          toast: `✨ 3 adet zengin Sıkça Sorulan Soru (FAQPage) başarıyla eklendi! (+15 Puan)`
        };
      },
      tags: ["FAQPage", "Rich Snippet", "People Also Ask"]
    });
  }

  // 2.2 Content Gap: Social Proof & Client Testimonials
  const testimonialsList = config.testimonials?.items || [];
  const isTestimonialsActive = config.testimonials?.enabled;
  if (!isTestimonialsActive || testimonialsList.length < 2) {
    const recommendedReviews = getRecommendedTestimonialsForSector(sector, city);
    alerts.push({
      id: "content-gap-testimonials-proof",
      category: "content-gaps",
      categoryLabel: "İçerik Boşluğu",
      severity: "warning",
      title: "Sosyal Kanıt Boşluğu: Müşteri Yorumları Eksik",
      description: "Potansiyel müşterilerin %88'i bir hizmeti satın almadan önce yorumları okur. Sitenizde henüz müşteri geri bildirimi veya yıldız puanı yok.",
      aiReasoning: "Google LocalBusiness değerlendirmeleri ve Schema.org review puanları arama sonuçlarında 5 yıldız rozeti gösterilmesini tetikler ve dönüşüm oranını ikiye katlar.",
      estimatedImpact: "+12 Güven Skoru • 5 Yıldızlı Google Arama Görünümü",
      impactBadgeColor: "amber",
      currentSnippet: isTestimonialsActive ? `${testimonialsList.length} yorum var` : "Yorumlar Bölümü Kapalı",
      proposedSnippet: `3 adet 5 yıldızlı müşteri referansı (${recommendedReviews.map(r => r.name).join(", ")}) eklenecek.`,
      actionLabel: "Yorumları Aktifleştir (1-Tık)",
      secondaryActionLabel: "Yorum Modülünü Aç",
      targetTab: "testimonials",
      canAutoFix: true,
      applyFix: (cfg) => {
        const existing = cfg.testimonials?.items || [];
        const merged = existing.length > 0 ? [...existing, ...recommendedReviews] : recommendedReviews;
        const updated: SiteConfig = {
          ...cfg,
          testimonials: {
            enabled: true,
            badge: "Müşteri Yorumları",
            title: "Bizi Tercih Edenlerin Deneyimleri",
            subtitle: `${city} genelinde yüzlerce mutlu müşterimizin tarafsız değerlendirmeleri`,
            items: merged,
            showRatingStats: true,
            googleRatingBadge: true
          }
        };
        return {
          updatedConfig: updated,
          toast: `⭐ 5 Yıldızlı Müşteri Yorumları ve Google Rozeti aktifleştirildi! (+12 Güven)`
        };
      },
      tags: ["Sosyal Kanıt", "Google Review", "Dönüşüm Artışı"]
    });
  }

  // 2.3 Content Gap: Local Surrounding Districts Coverage
  const surroundingDistricts = getSurroundingDistricts(city);
  const currentBullets = config.about?.bullets || [];
  const hasDistrictCoverage = currentBullets.some(b => 
    surroundingDistricts.some(d => b.toLowerCase().includes(d.toLowerCase()))
  );

  if (!hasDistrictCoverage && surroundingDistricts.length > 0) {
    const districtBullet = `${city} ve Çevre İlçeler (${surroundingDistricts.slice(0, 4).join(", ")} vb.) Hızlı Mobil Servis Ağı`;
    alerts.push({
      id: "content-gap-local-districts",
      category: "content-gaps",
      categoryLabel: "İçerik Boşluğu",
      severity: "opportunity",
      title: `Bölgesel Kapsama Boşluğu: '${city}' İlçeleri Listelenmemiş`,
      description: `Sitenizde '${city}' merkezine bağlı çevre ilçelerin (${surroundingDistricts.slice(0, 4).join(", ")}) adı geçmiyor. İlçe bazlı aramalarda rakiplerinizin gerisinde kalabilirsiniz.`,
      aiReasoning: `Kullanıcıların %70'i sadece il adını değil, ilçe adını da arama kutusuna yazar (Örn: '${surroundingDistricts[0]} ${sector.toLowerCase()}'). İlçe isimlerini listelemek yerel mikro trafiği çeker.`,
      estimatedImpact: "+8 Yerel Arama Skoru • Çevre İlçe Sıralamaları",
      impactBadgeColor: "emerald",
      currentSnippet: "Hakkımızda maddelerinde ilçe kapsaması bulunmuyor.",
      proposedSnippet: `Ek madde: "${districtBullet}"`,
      actionLabel: "İlçeleri Ekle (1-Tık)",
      secondaryActionLabel: "Hakkımızda Düzenle",
      targetTab: "general",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updatedBullets = [...(cfg.about?.bullets || []), districtBullet];
        const updated: SiteConfig = {
          ...cfg,
          about: {
            ...cfg.about,
            bullets: updatedBullets
          }
        };
        return {
          updatedConfig: updated,
          toast: `📍 ${city} çevre ilçeleri hizmet kapsamınıza eklendi!`
        };
      },
      tags: ["Yerel SEO", "İlçe Aramaları", "Bölgesel Otorite"]
    });
  }

  // 2.4 Content Gap: Service Descriptions Depth
  const shortServices = (config.services?.items || []).filter(s => (s.desc || "").length < 60);
  if (shortServices.length > 0) {
    const targetService = shortServices[0];
    const enrichedDesc = `${targetService.desc ? targetService.desc + '. ' : ''}${city} bölgesinde sertifikalı uzmanlarımızla en güncel ekipmanlar kullanarak kaliteli, hızlı ve garantili çözümler sunuyoruz.`;
    alerts.push({
      id: `content-gap-service-depth-${targetService.id}`,
      category: "content-gaps",
      categoryLabel: "İçerik Boşluğu",
      severity: "opportunity",
      title: `Hizmet Açıklaması Yetersiz: '${targetService.title}'`,
      description: `'${targetService.title}' hizmetinizin açıklaması çok kısa (${(targetService.desc || '').length} karakter). Arama motorları yetersiz içerikli sayfaları 'Thin Content' sayabilir.`,
      aiReasoning: "Hizmet detaylarının profesyonel standartlara uygun olarak genişletilmesi, uzun kuyruklu anahtar kelimelerde (long-tail keywords) doğrudan sıralama kazanmanızı sağlar.",
      estimatedImpact: "+6 Sayfa Kalite Skoru • Uzun Kuyruklu Trafik",
      impactBadgeColor: "blue",
      currentSnippet: targetService.desc || "(Açıklama boş)",
      proposedSnippet: enrichedDesc,
      actionLabel: "Açıklamayı Genişlet (1-Tık)",
      secondaryActionLabel: "Hizmetleri Aç",
      targetTab: "services",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updatedItems = (cfg.services?.items || []).map(item => {
          if (item.id === targetService.id) {
            return {
              ...item,
              desc: enrichedDesc
            };
          }
          return item;
        });
        const updated: SiteConfig = {
          ...cfg,
          services: {
            ...cfg.services,
            items: updatedItems
          }
        };
        return {
          updatedConfig: updated,
          toast: `📝 '${targetService.title}' açıklaması zengin içerikle güncellendi!`
        };
      },
      tags: ["Thin Content Önleme", "Hizmet Kalitesi", "Long-Tail"]
    });
  }

  // =========================================================================
  // 3. KEYWORD OPTIMIZATIONS OPPORTUNITIES
  // =========================================================================

  // 3.1 Commercial & High-Intent Missing Keywords
  const mustHaveCommercialKeywords = [
    `${sector.toLowerCase()} fiyatları`,
    `${city.toLowerCase()} ${sector.toLowerCase()} ücreti`,
    `en yakın ${sector.toLowerCase()} ${city.toLowerCase()}`,
    `acil ${sector.toLowerCase()} 7/24`
  ];

  const missingKeywords = mustHaveCommercialKeywords.filter(kw => 
    !currentKeywords.toLowerCase().includes(kw)
  );

  if (missingKeywords.length > 0) {
    const keywordsToAdd = missingKeywords.join(", ");
    alerts.push({
      id: "keyword-commercial-intent-gap",
      category: "keywords",
      categoryLabel: "Anahtar Kelime",
      severity: "critical",
      title: `${missingKeywords.length} Yüksek Hacimli Ticari Anahtar Kelime Eksik`,
      description: `Kullanıcıların satın almaya ve aramaya en hazır olduğu "${missingKeywords.slice(0, 2).join('", "')}" gibi kritik aramalar meta anahtar kelimelerinizde yer almıyor.`,
      aiReasoning: "Fiyat, ücret ve acil ihtiyaç içeren aramalar en yüksek dönüşüm oranına (CVR) sahip anahtar kelimelerdir. Bunları hedeflemek doğrudan telefon çağrılarını artırır.",
      estimatedImpact: "+16 SEO Puanı • +%42 Satış Odaklı Çağrı",
      impactBadgeColor: "rose",
      currentSnippet: currentKeywords || "(Henüz anahtar kelime eklenmemiş)",
      proposedSnippet: `Eklenecek kelimeler: ${keywordsToAdd}`,
      actionLabel: "Kelimeleri Ekle (1-Tık)",
      secondaryActionLabel: "Kelime Yöneticisini Aç",
      targetTab: "seo",
      canAutoFix: true,
      applyFix: (cfg) => {
        const existingKws = cfg.seo?.keywords ? cfg.seo.keywords.split(",").map(k => k.trim()) : [];
        const combined = Array.from(new Set([...existingKws, ...missingKeywords])).filter(Boolean).join(", ");
        const updated: SiteConfig = {
          ...cfg,
          seo: {
            ...cfg.seo,
            keywords: combined
          }
        };
        return {
          updatedConfig: updated,
          toast: `🎯 ${missingKeywords.length} adet yüksek niyetli ticari anahtar kelime eklendi! (+16 Puan)`
        };
      },
      tags: ["Ticari Niyet", "Fiyat Aramaları", "Yüksek Dönüşüm"]
    });
  }

  // 3.2 Hero Heading & Subtitle Keyword Alignment
  const heroTitle = config.hero?.title || "";
  const heroSubtitle = config.hero?.subtitle || "";
  const heroBadge = config.hero?.badge || "";
  const heroHasCitySector = 
    heroTitle.toLowerCase().includes(city.toLowerCase()) || 
    heroSubtitle.toLowerCase().includes(city.toLowerCase()) || 
    heroBadge.toLowerCase().includes(city.toLowerCase());

  if (!heroHasCitySector) {
    const recommendedBadge = `📍 ${city} • Profesyonel ${sector} Çözümleri`;
    alerts.push({
      id: "keyword-hero-topical-alignment",
      category: "keywords",
      categoryLabel: "Anahtar Kelime",
      severity: "warning",
      title: "Ana Sayfa Hero Alanında Şehir/Sektör Vurgusu Eksik",
      description: `Web sitenizin en üst karşılama rozetinde '${city}' ve '${sector}' ibaresi yer almıyor. Google, H1 ve sayfa başı metinlerine en yüksek ağırlığı verir.`,
      aiReasoning: "Ziyaretçi sayfayı açtığında ilk 3 saniyede doğru şehirde olduğunu görmelidir. Bu hem siteden hemen çıkma oranını (Bounce Rate) düşürür hem de arama alaka düzeyini zirveye taşır.",
      estimatedImpact: "+10 Sayfa İçi SEO Skoru • -%18 Hemen Çıkma Oranı",
      impactBadgeColor: "amber",
      currentSnippet: `Mevcut Rozet: "${heroBadge || '(Boş)'}"`,
      proposedSnippet: `Önerilen Rozet: "${recommendedBadge}"`,
      actionLabel: "Hero Rozetini Güncelle (1-Tık)",
      secondaryActionLabel: "Hero Tasarımını Aç",
      targetTab: "homepage-builder",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updated: SiteConfig = {
          ...cfg,
          hero: {
            ...cfg.hero,
            badge: recommendedBadge
          }
        };
        return {
          updatedConfig: updated,
          toast: `⚡ Hero rozeti yerel anahtar kelimeyle güncellendi: "${recommendedBadge}"`
        };
      },
      tags: ["Hero Bölümü", "Sayfa İçi SEO", "Bounce Rate Azaltma"]
    });
  }

  // 3.3 Structured Data Schema (JSON-LD LocalBusiness)
  const hasSchema = Boolean(config.seo?.schemaType || config.seo?.schemaConfig?.enabled);
  if (!hasSchema) {
    alerts.push({
      id: "keyword-schema-localbusiness",
      category: "keywords",
      categoryLabel: "Anahtar Kelime",
      severity: "opportunity",
      title: "Schema.org (LocalBusiness) Yapılandırılmış Verisi Eksik",
      description: "Google Haritalar ve Arama robotlarının firmanızı resmi bir yerel işletme olarak tanımasını sağlayan JSON-LD şeması henüz aktif değil.",
      aiReasoning: "LocalBusiness şeması firmanın telefon, çalışma saatleri, adres koordinatları ve hizmetlerini doğrudan arama motoru dizinine kaydeder.",
      estimatedImpact: "+12 Yapısal Veri Skoru • Google Haritalar Entegrasyonu",
      impactBadgeColor: "indigo",
      currentSnippet: "Schema JSON-LD aktif değil",
      proposedSnippet: `LocalBusiness Şeması: ${company} (${city}) - Tel: ${phone}`,
      actionLabel: "Şemayı Aktifleştir (1-Tık)",
      secondaryActionLabel: "Şema Oluşturucuyu Aç",
      targetTab: "schema-generator",
      canAutoFix: true,
      applyFix: (cfg) => {
        const updated: SiteConfig = {
          ...cfg,
          seo: {
            ...cfg.seo,
            schemaType: "LocalBusiness",
            schemaConfig: {
              enabled: true,
              autoInjectLocalBusiness: true,
              autoInjectProducts: true,
              autoInjectFaq: true,
              autoInjectBreadcrumbs: true,
              autoInjectWebSite: true,
              businessType: "LocalBusiness",
              areaServed: city
            }
          }
        };
        return {
          updatedConfig: updated,
          toast: `🏛️ Schema.org LocalBusiness mikro formatı başarıyla etkinleştirildi! (+12 Puan)`
        };
      },
      tags: ["JSON-LD", "LocalBusiness", "Google Maps"]
    });
  }

  return alerts;
}

/**
 * Applies all fixable opportunities in one batch
 */
export function batchApplyAllOpportunities(
  config: SiteConfig, 
  opportunities: SeoOpportunityAlert[]
): { updatedConfig: SiteConfig; appliedCount: number; toast: string } {
  let currentConfig = { ...config };
  let count = 0;

  for (const opp of opportunities) {
    if (opp.canAutoFix && opp.applyFix) {
      try {
        const res = opp.applyFix(currentConfig);
        currentConfig = res.updatedConfig;
        count++;
      } catch (err) {
        console.error("Error applying opportunity fix:", err);
      }
    }
  }

  return {
    updatedConfig: currentConfig,
    appliedCount: count,
    toast: `🎉 Harika! ${count} adet SEO Fırsatı tek tıkla uygulandı. Sitenizin sıralama gücü zirveye taşındı!`
  };
}
