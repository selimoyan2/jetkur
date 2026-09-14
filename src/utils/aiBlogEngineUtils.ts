import { SiteConfig, BlogPostItem } from "../types";
import { slugifyBlog } from "./url";

export interface BlogEngineGenerationRequest {
  companyName: string;
  sector: string;
  city: string;
  services?: string[];
  topic: string;
  targetAudience: string;
  tone: "professional" | "friendly" | "authoritative" | "practical";
  articleType: "guide" | "comparison" | "tips_tricks" | "cost_pricing" | "case_study";
  length: "standard" | "deep" | "comprehensive";
  includeFaq: boolean;
  includeCallToAction: boolean;
  focusKeywords?: string;
  customNotes?: string;
}

export interface GeneratedBlogFaq {
  question: string;
  answer: string;
}

export interface GeneratedBlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // rich text HTML
  readTime: string;
  category: string;
  tags: string[];
  date: string;
  author: string;
  coverImage: string;
  imageAlt: string;
  
  // SEO Meta
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl?: string;
  schemaType: string;
  
  // FAQs & Structured Data
  faqItems: GeneratedBlogFaq[];
  jsonLdSchema: string;
  
  // SEO Audit & Metrics
  seoScore: number;
  wordCount: number;
  headingsCount: { h2: number; h3: number };
  seoAudits: {
    label: string;
    status: "good" | "warning" | "info";
    detail: string;
  }[];
}

export interface SmartTopicIdea {
  id: string;
  title: string;
  angle: "Rehber & Kılavuz" | "Maliyet & Fiyat" | "Hata & Çözüm" | "Karşılaştırma" | "Sıkça Sorulanlar";
  primaryKeyword: string;
  searchIntent: "Bilgilendirici" | "Ticari / Karar" | "Acil / Yerel";
  estimatedReadTime: string;
}

// Preset cover images matching various sectors
export const STOCK_ARTICLE_COVERS = [
  { label: "Kurumsal & Danışmanlık", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Analiz & Strateji", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" },
  { label: "Hizmet & Uygulama", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80" },
  { label: "Taşımacılık & Saha", url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Müşteri Memnuniyeti", url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80" },
  { label: "Teknoloji & Altyapı", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" },
  { label: "Tasarım & Planlama", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80" }
];

/**
 * Generate smart topic suggestions based on the website's sector, city, and company name
 */
export function generateSmartTopicIdeas(
  sector: string = "Hizmet",
  city: string = "İstanbul",
  companyName: string = "Kurumsal Firma",
  services: string[] = []
): SmartTopicIdea[] {
  const cleanSector = sector.trim() || "Hizmet";
  const cleanCity = city.trim() || "İstanbul";
  const firstService = services[0] || `${cleanSector} Uygulamaları`;

  return [
    {
      id: "topic-1",
      title: `${cleanSector} Hizmeti Alırken Nelere Dikkat Edilmeli? (${cleanCity} 2026 Kılavuzu)`,
      angle: "Rehber & Kılavuz",
      primaryKeyword: `${cleanCity} ${cleanSector.toLowerCase()} hizmeti`,
      searchIntent: "Ticari / Karar",
      estimatedReadTime: "6 dk"
    },
    {
      id: "topic-2",
      title: `2026 ${cleanSector} Fiyatları Nasıl Belirlenir? Sürpriz Maliyetlerden Kaçınma Rehberi`,
      angle: "Maliyet & Fiyat",
      primaryKeyword: `${cleanSector.toLowerCase()} fiyatları 2026`,
      searchIntent: "Bilgilendirici",
      estimatedReadTime: "7 dk"
    },
    {
      id: "topic-3",
      title: `${cleanSector} İhtiyaçlarında En Sık Yapılan 5 Hata ve Çözüm Yolları`,
      angle: "Hata & Çözüm",
      primaryKeyword: `${cleanSector.toLowerCase()} püf noktaları`,
      searchIntent: "Bilgilendirici",
      estimatedReadTime: "5 dk"
    },
    {
      id: "topic-4",
      title: `Doğru ${cleanSector} Firması Nasıl Seçilir? Kurumsal Güvenilirlik Kriterleri`,
      angle: "Karşılaştırma",
      primaryKeyword: `güvenilir ${cleanSector.toLowerCase()} firması`,
      searchIntent: "Ticari / Karar",
      estimatedReadTime: "6 dk"
    },
    {
      id: "topic-5",
      title: `${cleanCity} Bölgesinde Acil ${cleanSector} İhtiyacında Bilmeniz Gerekenler`,
      angle: "Rehber & Kılavuz",
      primaryKeyword: `${cleanCity} acil ${cleanSector.toLowerCase()}`,
      searchIntent: "Acil / Yerel",
      estimatedReadTime: "5 dk"
    },
    {
      id: "topic-6",
      title: `${cleanSector} Hakkında En Çok Merak Edilen 8 Soru ve Uzman Yanıtları`,
      angle: "Sıkça Sorulanlar",
      primaryKeyword: `${cleanSector.toLowerCase()} hakkında sorular`,
      searchIntent: "Bilgilendirici",
      estimatedReadTime: "8 dk"
    },
    {
      id: "topic-7",
      title: `Profesyonel ${firstService} ile Zamandan ve Bütçeden Nasıl Tasarruf Edersiniz?`,
      angle: "Rehber & Kılavuz",
      primaryKeyword: `profesyonel ${firstService.toLowerCase()}`,
      searchIntent: "Ticari / Karar",
      estimatedReadTime: "6 dk"
    }
  ];
}

/**
 * Calculate SEO metrics, word count and audit items for an article
 */
export function auditBlogArticleSeo(article: {
  title: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  primaryKeyword?: string;
  faqItems?: GeneratedBlogFaq[];
}): {
  seoScore: number;
  wordCount: number;
  headingsCount: { h2: number; h3: number };
  seoAudits: { label: string; status: "good" | "warning" | "info"; detail: string }[];
} {
  const textOnly = article.content.replace(/<[^>]*>/g, " ");
  const words = textOnly.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const h2Count = (article.content.match(/<h2/gi) || []).length;
  const h3Count = (article.content.match(/<h3/gi) || []).length;

  const audits: { label: string; status: "good" | "warning" | "info"; detail: string }[] = [];
  let score = 70;

  // Title Audit
  const titleLen = (article.seoTitle || article.title).length;
  if (titleLen >= 45 && titleLen <= 65) {
    score += 8;
    audits.push({
      label: "SEO Başlık Uzunluğu (SERP)",
      status: "good",
      detail: `${titleLen} karakter — Google arama sonuçlarında tam görüntülenir.`
    });
  } else if (titleLen > 65) {
    score += 4;
    audits.push({
      label: "SEO Başlığı Kırpılabilir",
      status: "warning",
      detail: `${titleLen} karakter — 60 karakterin üzerindeki başlıklar SERP'te '...' ile kesilebilir.`
    });
  } else {
    audits.push({
      label: "SEO Başlığı Çok Kısa",
      status: "warning",
      detail: `${titleLen} karakter — Tıklama oranını artırmak için 45-60 karakter önerilir.`
    });
  }

  // Meta Description Audit
  const descLen = (article.seoDescription || article.excerpt).length;
  if (descLen >= 120 && descLen <= 160) {
    score += 8;
    audits.push({
      label: "Meta Açıklama Optimizasyonu",
      status: "good",
      detail: `${descLen} karakter — Google mobilde ve masaüstünde mükemmel CTR sunar.`
    });
  } else {
    audits.push({
      label: "Meta Açıklama İyileştirmesi",
      status: "info",
      detail: `${descLen} karakter — İdeal uzunluk 130-160 karakter arasıdır.`
    });
  }

  // Headings Structure Audit
  if (h2Count >= 3) {
    score += 7;
    audits.push({
      label: "Hiyerarşik Başlık Düzeni (H2/H3)",
      status: "good",
      detail: `${h2Count} adet H2 ana başlık ve ${h3Count} adet H3 alt başlık tespit edildi.`
    });
  } else {
    audits.push({
      label: "Başlık Dağılımı Artırılabilir",
      status: "warning",
      detail: "Google taranabilirliğini artırmak için en az 3 adet H2 başlık kullanılması önerilir."
    });
  }

  // Word Count & In-Depth Content Audit
  if (wordCount >= 1000) {
    score += 10;
    audits.push({
      label: "Kapsamlı Uzun Metin (Pillar Article)",
      status: "good",
      detail: `${wordCount} kelime — Google Helpful Content & E-E-A-T için yüksek otorite seviyesi.`
    });
  } else if (wordCount >= 500) {
    score += 6;
    audits.push({
      label: "Standart Blog Uzunluğu",
      status: "good",
      detail: `${wordCount} kelime — Okuyucuyu sıkmayan ideal rehber formatı.`
    });
  } else {
    audits.push({
      label: "Kısa İçerik Uyarısı",
      status: "warning",
      detail: `${wordCount} kelime — Sıralama şansını artırmak için içeriğin zenginleştirilmesi tavsiye edilir.`
    });
  }

  // FAQ Schema Audit
  if (article.faqItems && article.faqItems.length > 0) {
    score += 5;
    audits.push({
      label: "FAQPage Schema.org Zengin Sonuç",
      status: "good",
      detail: `${article.faqItems.length} adet SSS sorusu hazırlandı. Google'da akordeon şeklinde çıkabilir.`
    });
  }

  // Primary Keyword in Title / Content
  if (article.primaryKeyword) {
    const kw = article.primaryKeyword.toLowerCase();
    const inTitle = article.title.toLowerCase().includes(kw);
    const inContent = textOnly.toLowerCase().includes(kw);

    if (inTitle && inContent) {
      score += 5;
      audits.push({
        label: "Odak Anahtar Kelime Uyumu",
        status: "good",
        detail: `'${article.primaryKeyword}' başlıkta ve metin gövdesinde doğal şekilde yer alıyor.`
      });
    }
  }

  const finalScore = Math.min(100, Math.max(55, score));
  return {
    seoScore: finalScore,
    wordCount,
    headingsCount: { h2: h2Count, h3: h3Count },
    seoAudits: audits
  };
}

/**
 * Generate complete JSON-LD Structured Data Schema for Article + FAQ
 */
export function generateBlogJsonLdSchema(article: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  author: string;
  coverImage?: string;
  companyName: string;
  domainUrl?: string;
  faqItems?: GeneratedBlogFaq[];
}): string {
  const baseUrl = article.domainUrl || "https://ornek-alanadi.com";
  const articleUrl = `${baseUrl}/blog/${article.slug}`;

  const schemaGraph: any[] = [
    {
      "@type": "BlogPosting",
      "@id": `${articleUrl}#article`,
      "headline": article.title,
      "description": article.excerpt,
      "url": articleUrl,
      "datePublished": article.date,
      "dateModified": article.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "author": {
        "@type": "Person",
        "name": article.author || article.companyName
      },
      "publisher": {
        "@type": "Organization",
        "name": article.companyName,
        "url": baseUrl
      },
      "image": article.coverImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  if (article.faqItems && article.faqItems.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      "@id": `${articleUrl}#faq`,
      "mainEntity": article.faqItems.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": schemaGraph
    },
    null,
    2
  );
}

/**
 * Fallback generator for realistic, high-quality, long-form Turkish blog articles
 * used when Gemini API is offline or when running locally.
 */
export function generateFallbackBlogArticle(req: BlogEngineGenerationRequest): GeneratedBlogArticle {
  const company = req.companyName || "Kurumsal Firmamız";
  const sector = req.sector || "Hizmet";
  const city = req.city || "İstanbul";
  const topic = req.topic || `${sector} Hizmeti Alırken Dikkat Edilmesi Gereken 5 Kural`;
  const primaryKw = req.focusKeywords || `${city} ${sector.toLowerCase()}`;

  const cleanSlug = slugifyBlog(topic, Date.now().toString().slice(-4));
  const today = new Date().toISOString().split("T")[0];

  const coverUrl = STOCK_ARTICLE_COVERS[Math.floor(Math.random() * STOCK_ARTICLE_COVERS.length)].url;

  // Build high-engagement, deep structured content
  const content = `
<p class="lead text-lg font-medium text-slate-700 mb-6">
  Günümüzde <strong>${sector}</strong> alanında doğru çözüme ve güvenilir bir uzmana ulaşmak, hem zaman hem de bütçe açısından en kritik kararların başında gelir. Özellikle <strong>${city}</strong> ve çevresinde artan talep doğrultusunda, kaliteli hizmet standartlarını doğru analiz etmek büyük önem taşımaktadır.
</p>

<h2>1. Neden Profesyonel ve Yetkin Bir ${sector} Tercih Edilmeli?</h2>
<p>
  Herhangi bir hizmet veya satın alma sürecinde ilk karşılaşılan yanılgı, yalnızca fiyata odaklanmaktır. Oysa <strong>${company}</strong> olarak yılların sahadaki tecrübesiyle gözlemlediğimiz üzere; yetersiz deneyim ve şeffaf olmayan süreçler, başlangıçta ekonomik gibi görünse de uzun vadede katlanarak büyüyen ek maliyetlere ve zaman kaybına yol açar.
</p>
<p>
  Kurumsal standartlarda çalışan uzman bir ekiple çalışmanın temel faydaları şunlardır:
</p>
<ul>
  <li><strong>Hızlı ve Planlı Müdahale:</strong> İhtiyaç anında zaman kaybetmeden organize olan operasyon kabiliyeti.</li>
  <li><strong>Sertifikalı ve Donanımlı Ekipman:</strong> En yeni teknolojik araçlarla sıfır risk prensibiyle uygulama.</li>
  <li><strong>Şeffaf Fiyatlandırma Politikası:</strong> İşlem öncesinde net belirlenen, gizli sürprizler barındırmayan sözleşmeli maliyet tablosu.</li>
  <li><strong>Resmi Faturalandırma ve Garanti Güvencesi:</strong> Yapılan her işlemin arkasında duran kurumsal muhatap.</li>
</ul>

<div class="my-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950">
  <div class="flex items-center gap-2 font-black text-amber-900 mb-1">
    <span>💡 Uzman Tavsiyesi:</span>
  </div>
  <p class="text-sm leading-relaxed mb-0">
    Hizmet almadan önce firmanın referanslarını, müşteri geri bildirimlerini ve ilgili oda/bakanlık kayıtlarını mutlaka sorgulayınız. Yetki belgesiz merdiven altı yapılar hem can hem mal güvenliğinizi tehlikeye atabilir.
  </p>
</div>

<h2>2. ${city} Bölgesinde Doğru Çözüm Ortağını Seçme Kriterleri</h2>
<p>
  Bölgesel dinamikler, coğrafi yakınlık ve yerel mevzuat bilgisi, ${sector} süreçlerinin hızını doğrudan belirler. <strong>${city}</strong> içinde lokasyona hakim bir ekiple çalışmak, acil durumlarda dakikalar içerisinde yanıt alabilmenizi sağlar.
</p>
<h3>Adım Adım Değerlendirme Listesi</h3>
<ol>
  <li><strong>Ön Görüşme ve İhtiyaç Analizi:</strong> İhtiyacınızı doğru dinleyen ve size özel çözüm geliştiren firmalarla ilerleyin.</li>
  <li><strong>Yazılı Teklif ve Taahhüt:</strong> Yapılacak işin süresini ve kapsamını yazılı olarak onaylayın.</li>
  <li><strong>7/24 Ulaşılabilirlik:</strong> Destek ve danışma hattına günün her saatinde ulaşabileceğinizden emin olun.</li>
</ol>

<h2>3. Sıkça Karşılaşılan Problemler ve Önleyici Çözümler</h2>
<p>
  Müşterilerimizin sıklıkla karşılaştığı ve erken tedbir alınmadığında mağduriyet yaratan unsurları özetledik:
</p>
<ul>
  <li><strong>İletişim Eksikliği:</strong> Süreç hakkında bilgilendirilmeyen müşterilerin yaşadığı endişeler, şeffaf WhatsApp ve çağrı desteğiyle ortadan kaldırılır.</li>
  <li><strong>Kalitesiz Malzeme veya İşçilik:</strong> Standartlara uygun olmayan parçalar kısa sürede tekrarlayan arızalara neden olur.</li>
</ul>

<h2>4. Sıkça Sorulan Sorular (SSS)</h2>
<p>
  <strong>${topic}</strong> konusunda kullanıcıların en çok yanıt aradığı sorular ve uzman görüşlerimiz:
</p>
<div class="space-y-4 my-4">
  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
    <h3 class="text-base font-bold text-slate-900 mb-1">Soru 1: ${sector} fiyatları ortalama ne kadardır?</h3>
    <p class="text-sm text-slate-700 mb-0">Fiyatlar talep edilen hizmetin büyüklüğüne, kullanılacak materyale ve lokasyona göre değişkenlik gösterir. Firmamız en uygun fiyat garantisiyle ücretsiz keşif ve ön fiyat teklifi sunmaktadır.</p>
  </div>
  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
    <h3 class="text-base font-bold text-slate-900 mb-1">Soru 2: Hizmet talebi oluşturduktan ne kadar süre sonra destek alabilirim?</h3>
    <p class="text-sm text-slate-700 mb-0">${city} genelinde mobil ekiplerimiz sayesinde çağrınızın ardından aynı gün ve en geç birkaç saat içerisinde randevu veya müdahale sağlanır.</p>
  </div>
  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
    <h3 class="text-base font-bold text-slate-900 mb-1">Soru 3: Yapılan işlemler garantili midir?</h3>
    <p class="text-sm text-slate-700 mb-0">Evet, ${company} güvencesiyle sunulan tüm hizmetlerimiz ve kullanılan orijinal ekipmanlar sözleşmeli işçilik garantisi altındadır.</p>
  </div>
</div>

<h2>5. Sonuç & Profesyonel Destek Çağrısı</h2>
<p>
  Özetlemek gerekirse; <strong>${topic}</strong> konusunda bilinçli adım atmak, gereksiz riskleri ortadan kaldırarak maksimum verim elde etmenizi sağlar. <strong>${company}</strong> olarak ${city} bölgesinde ${sector} alanındaki tüm taleplerinize uzman kadromuz ve müşteri odaklı vizyonumuzla 7/24 yanıt vermekten gurur duyuyoruz.
</p>
<div class="my-6 p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white text-center shadow-md">
  <h3 class="text-lg font-bold text-white mb-2">${company} ile Hemen İletişime Geçin</h3>
  <p class="text-sm text-slate-200 max-w-xl mx-auto mb-4">
    Detaylı bilgi, ücretsiz danışmanlık veya projenize özel avantajlı fiyat teklifi almak için bir tıkla bize ulaşabilirsiniz.
  </p>
  <span class="inline-block px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
    Hemen Teklif Al & 7/24 Ara
  </span>
</div>
`.trim();

  const excerpt = `${city} bölgesinde ${sector.toLowerCase()} hizmeti alırken dikkat edilmesi gereken kritik kurallar, maliyet tasarrufu ve ${company} uzman tavsiyeleri bu rehberde.`.slice(0, 160);

  const seoTitle = `${topic.slice(0, 48)} | ${company}`.slice(0, 60);
  const seoDescription = excerpt;
  const seoKeywords = `${primaryKw}, ${sector.toLowerCase()} rehberi, ${city} ${sector.toLowerCase()} fiyatları, kaliteli ${sector.toLowerCase()}, ${company}`;

  const faqItems: GeneratedBlogFaq[] = [
    {
      question: `${sector} fiyatları ortalama ne kadardır?`,
      answer: `Fiyatlar talep edilen hizmetin büyüklüğüne ve lokasyona göre değişkenlik gösterir. ${company} en uygun fiyat garantisiyle ücretsiz keşif ve ön fiyat teklifi sunmaktadır.`
    },
    {
      question: `Hizmet talebi oluşturduktan ne kadar süre sonra destek alabilirim?`,
      answer: `${city} genelinde mobil ekiplerimiz sayesinde çağrınızın ardından aynı gün ve en geç birkaç saat içerisinde randevu veya müdahale sağlanır.`
    },
    {
      question: `Yapılan işlemler garantili midir?`,
      answer: `Evet, ${company} güvencesiyle sunulan tüm hizmetlerimiz ve kullanılan ekipmanlar sözleşmeli işçilik garantisi altındadır.`
    }
  ];

  const jsonLdSchema = generateBlogJsonLdSchema({
    title: topic,
    excerpt,
    slug: cleanSlug,
    date: today,
    author: company,
    coverImage: coverUrl,
    companyName: company,
    faqItems
  });

  const audit = auditBlogArticleSeo({
    title: topic,
    content,
    excerpt,
    seoTitle,
    seoDescription,
    primaryKeyword: primaryKw,
    faqItems
  });

  return {
    id: `post-${Date.now()}`,
    title: topic,
    slug: cleanSlug,
    excerpt,
    content,
    readTime: `${Math.max(1, Math.ceil(audit.wordCount / 180))} dk okuma`,
    category: "Sektörel Rehber",
    tags: [sector.toLowerCase(), "rehber", city.toLowerCase(), "tavsiyeler"],
    date: today,
    author: company,
    coverImage: coverUrl,
    imageAlt: `${company} ${topic} kapak görseli`,
    seoTitle,
    seoDescription,
    seoKeywords,
    primaryKeyword: primaryKw,
    secondaryKeywords: [
      `${city} en iyi ${sector.toLowerCase()}`,
      `${sector.toLowerCase()} nasıl seçilir`,
      `${sector.toLowerCase()} maliyet analizi`
    ],
    schemaType: "BlogPosting",
    faqItems,
    jsonLdSchema,
    seoScore: audit.seoScore,
    wordCount: audit.wordCount,
    headingsCount: audit.headingsCount,
    seoAudits: audit.seoAudits
  };
}

/**
 * Format a generated blog article into a standard BlogPostItem ready to be saved into SiteConfig
 */
export function convertToBlogPostItem(article: GeneratedBlogArticle, config: SiteConfig): BlogPostItem {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    categories: [article.category],
    categoryIds: ["bcat-1"],
    excerpt: article.excerpt,
    content: article.content,
    readTime: article.readTime,
    date: article.date,
    author: article.author || config.companyName || "Editör",
    coverImage: article.coverImage,
    image: article.coverImage,
    imageAlt: article.imageAlt,
    altText: article.imageAlt,
    tags: article.tags,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    seoKeywords: article.seoKeywords,
    canonicalUrl: article.canonicalUrl,
    schemaType: article.schemaType,
    robots: "index, follow"
  };
}
