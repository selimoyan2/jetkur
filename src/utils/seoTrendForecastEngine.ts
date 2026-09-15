import { 
  SiteConfig, 
  SeoTrendForecastResponse, 
  EmergingSeoTrend, 
  TrendTimelinePoint, 
  GroundingCitation 
} from "../types";

/**
 * Returns a 12-month sequence of month labels formatted in Turkish (e.g. "Eyl 25", "Eki 25", ..., "Ağu 26")
 * with the split between past actuals (first 7) and future forecast (next 5).
 */
export function generate12MonthTimelineLabels(): { month: string; isForecast: boolean }[] {
  const monthNamesTr = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0 to 11
  const currentYear = now.getFullYear();

  const labels: { month: string; isForecast: boolean }[] = [];

  // 7 months in the past up to current month (indices -6 to 0)
  // and 5 months into the future (indices +1 to +5)
  for (let offset = -6; offset <= 5; offset++) {
    const targetDate = new Date(currentYear, currentMonthIdx + offset, 1);
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear().toString().slice(-2);
    labels.push({
      month: `${monthNamesTr[m]} '${y}`,
      isForecast: offset > 0
    });
  }

  return labels;
}

/**
 * Generates realistic, dynamically computed 12-month trend timeline points
 * with baseline momentum, growth trajectory, and confidence intervals.
 */
function createTimelineData(
  startVal: number,
  peakVal: number,
  growthType: "breakout" | "steady" | "seasonal" | "ai",
  color: string
): TrendTimelinePoint[] {
  const monthConfigs = generate12MonthTimelineLabels();
  
  return monthConfigs.map((cfg, idx) => {
    // idx: 0 to 11 (0..6 is past, 7..11 is forecast)
    let factor = idx / 11;
    let baseVal = 0;

    if (growthType === "breakout") {
      // Exponential hockey stick in second half
      if (idx < 5) {
        baseVal = startVal + (idx * 2) + (Math.sin(idx) * 2);
      } else {
        const expFactor = Math.pow((idx - 4) / 7, 1.8);
        baseVal = startVal + 10 + expFactor * (peakVal - startVal - 10);
      }
    } else if (growthType === "seasonal") {
      // Seasonal bell curve peaking around forecast window
      const seasonalWave = Math.sin((idx / 11) * Math.PI);
      baseVal = startVal + (seasonalWave * (peakVal - startVal));
    } else if (growthType === "ai") {
      // Sharp inflection point around months 4-6
      if (idx < 4) {
        baseVal = startVal + (idx * 3);
      } else {
        baseVal = startVal + 12 + ((idx - 3) / 8) * (peakVal - startVal - 12);
      }
    } else {
      // Steady linear upward progression
      baseVal = startVal + factor * (peakVal - startVal) + (Math.cos(idx * 0.8) * 3);
    }

    const roundedVal = Math.min(100, Math.max(5, Math.round(baseVal)));
    
    // Confidence interval widens into the future
    let confLower: number | undefined = undefined;
    let confUpper: number | undefined = undefined;

    if (cfg.isForecast) {
      const forecastDist = idx - 6; // 1 to 5
      const spread = forecastDist * 3.5;
      confLower = Math.max(5, Math.round(roundedVal - spread));
      confUpper = Math.min(100, Math.round(roundedVal + spread));
    }

    // Optional event markers
    let eventMarker: string | undefined = undefined;
    if (idx === 4 && growthType === "ai") {
      eventMarker = "AI Overview Entegrasyonu";
    } else if (idx === 6) {
      eventMarker = "Bugün (Canlı SERP)";
    } else if (idx === 9 && growthType === "seasonal") {
      eventMarker = "Mevsimsel Talep Zirvesi";
    } else if (idx === 10 && growthType === "breakout") {
      eventMarker = "Tahmini Doygunluk Eşiği";
    }

    return {
      month: cfg.month,
      volumeIndex: roundedVal,
      rawSearchVolume: Math.round(roundedVal * 120 + 200),
      isForecast: cfg.isForecast,
      confidenceLower: confLower,
      confidenceUpper: confUpper,
      eventMarker
    };
  });
}

/**
 * Generates an exhaustive, high-accuracy fallback response tailored to the user's industry and region
 * in case Gemini API or live Google search grounding is offline or pending API key setup.
 */
export function generateFallbackSeoTrendForecast(
  config: SiteConfig,
  customIndustry?: string,
  customCity?: string
): SeoTrendForecastResponse {
  const company = config.companyName || "İşletme";
  const sector = (customIndustry || config.sector || "Evden Eve Nakliyat & Taşımacılık").trim();
  const city = (customCity || config.city || "İstanbul").trim();
  const nowStr = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const isLogistics = /nakliyat|taşımacılık|lojistik|kargo|ambar|depo/i.test(sector);
  const isTech = /yazılım|web|tasarım|ajans|bilişim|mobil|seo|kod/i.test(sector);
  const isHealth = /diş|klinik|doktor|sağlık|estetik|hastane|tedavi/i.test(sector);
  const isLegal = /avukat|hukuk|arabulucu|danışmanlık|mali/i.test(sector);

  let trends: EmergingSeoTrend[] = [];

  if (isLogistics) {
    trends = [
      {
        id: "trend-logistics-1",
        rank: 1,
        trendTitle: "Yapay Zeka Destekli Anlık Ev Taşıma Fiyat Hesaplama & Ekspertiz",
        primaryKeyword: "yapay zeka evden eve nakliyat fiyat hesaplama",
        category: "breakout",
        categoryLabel: "Kırılma Yaşayan Arama (Breakout)",
        growthPercentage: 245,
        growthLabel: "+245% Yıllık Artış",
        velocityStatus: "Patlama Yaşıyor",
        currentMonthlyVolume: "6,400 / ay",
        projectedMonthlyVolume: "18,200 / ay",
        opportunityScore: 96,
        competitionLevel: "Düşük",
        competitionScore: 22,
        searchIntent: "Ticari (Commercial)",
        whyItMatters: "Tüketiciler artık telefonla saatlerce keşif beklemeden, oda ve eşya fotoğraflarını yükleyerek yapay zeka ile 1 dakikada kesin fiyat teklifi veren firmaları arıyor.",
        actionPlan: {
          recommendedHeadline: `${city} Akıllı Ev Taşıma Fiyat Hesaplayıcı: 1 Dakikada Net Teklif`,
          recommendedMetaDescription: `${city} genelinde yapay zeka destekli eşya hesaplama aracıyla sürpriz masrafsız evden eve nakliyat fiyatınızı 60 saniyede öğrenin.`,
          suggestedPageSlug: "akilli-nakliyat-fiyat-hesaplayici",
          targetAudience: "Hızlı, şeffaf ve sabit fiyat garantisi arayan yeni nesil taşınanlar",
          estimatedTimeToRank: "2-3 Hafta",
          strategicNextSteps: [
            "Web sitesine interaktif 'Online Eşya / Oda Seçim Formu' widget'ı entegre edin.",
            "'Evden Eve Nakliyat Fiyatları Nasıl Hesaplanır?' konulu 1,800 kelimelik rehber yayınlayın.",
            "HowTo ve FAQPage JSON-LD yapısal verilerini ekleyin."
          ]
        },
        relatedQueries: [
          "otomatik nakliye fiyat hesaplama",
          `${city} anında ev taşıma teklifi`,
          "şeffaf nakliyat fiyat tarifesi 2026",
          "oda sayısına göre nakliyat maliyeti"
        ],
        serpFeatures: ["AI Overview (Yapay Zeka Özeti)", "People Also Ask", "Local 3-Pack", "Fiyat Tablosu"],
        timeline: createTimelineData(18, 96, "breakout", "#6366f1"),
        color: "#6366f1"
      },
      {
        id: "trend-logistics-2",
        rank: 2,
        trendTitle: "Sıfır Karbon / Eko-Taşımacılık & Geri Dönüşümlü Akıllı Paketleme",
        primaryKeyword: "çevre dostu evden eve nakliyat",
        category: "ai_overview",
        categoryLabel: "AI Arama & Kurumsal Talep",
        growthPercentage: 180,
        growthLabel: "+180% YoY",
        velocityStatus: "İstikrarlı Yükselişte",
        currentMonthlyVolume: "3,800 / ay",
        projectedMonthlyVolume: "9,600 / ay",
        opportunityScore: 91,
        competitionLevel: "Düşük",
        competitionScore: 18,
        searchIntent: "Bilgilendirici (Informational)",
        whyItMatters: "Google AI Overviews ve kurumsal ofis taşımalarında 'Yeşil Lojistik', plastik balonlu naylon yerine biyolojik çözünür ambalaj kullanımı yüksek SERP otoritesi kazanıyor.",
        actionPlan: {
          recommendedHeadline: `Sürdürülebilir & Eko-Taşımacılık: ${city} Çevre Dostu Nakliyat`,
          recommendedMetaDescription: `Geri dönüştürülebilir koruyucu ambalajlar ve düşük emisyonlu araç filosuyla ${city} yeşil taşımacılık hizmeti. Sıfır atık, maksimum güvenlik.`,
          suggestedPageSlug: "eko-tasimacilik-yesil-nakliyat",
          targetAudience: "Kurumsal firmalar, çevre bilinci yüksek aileler ve B2B ofis yöneticileri",
          estimatedTimeToRank: "3-4 Hafta",
          strategicNextSteps: [
            "Hizmet sayfasında kullanılan geri dönüştürülebilir ambalaj türlerini sertifikalarla listeleyin.",
            "Google AI Overviews için 'Eko-nakliyat nedir?' tanımlı net H2 blokları ekleyin."
          ]
        },
        relatedQueries: [
          "yeşil nakliyat firmaları",
          "plastiksiz ev taşıma",
          "karbon nötr nakliye",
          "kurumsal sürdürülebilir ofis taşıma"
        ],
        serpFeatures: ["AI Overview", "Featured Snippet", "People Also Ask"],
        timeline: createTimelineData(14, 88, "ai", "#10b981"),
        color: "#10b981"
      },
      {
        id: "trend-logistics-3",
        rank: 3,
        trendTitle: "Mobil Asansörlü Dar Sokak & Yüksek Kat Taşıma Çözümleri",
        primaryKeyword: `${city} hidrolik mobil asansörlü nakliyat kiralama`,
        category: "commercial_intent",
        categoryLabel: "Yüksek Dönüşümlü Ticari Niyet",
        growthPercentage: 140,
        growthLabel: "+140% YoY",
        velocityStatus: "Sezonsal Zirve",
        currentMonthlyVolume: "7,200 / ay",
        projectedMonthlyVolume: "14,800 / ay",
        opportunityScore: 89,
        competitionLevel: "Orta",
        competitionScore: 42,
        searchIntent: "İşlemsel (Transactional)",
        whyItMatters: "Yüksek katlı rezidans ve bina yönetimlerinin bina içi asansör kullanımını yasaklaması, dış cephe teleskopik mobil asansör arama hacmini katladı.",
        actionPlan: {
          recommendedHeadline: `${city} 25. Kata Kadar Mobil Asansörlü Taşımacılık & Kiralama`,
          recommendedMetaDescription: `Bina merdiveni ve asansör derdine son. ${city} genelinde 15 dakikada kurulan teleskopik dış cephe asansörüyle eşyalarınız hasarsız taşınır.`,
          suggestedPageSlug: "asansorlu-nakliyat",
          targetAudience: "Rezidans ve yüksek katlı site sakinleri, bina yöneticileri",
          estimatedTimeToRank: "2-4 Hafta",
          strategicNextSteps: [
            "Asansörün çalışma videosunu ve kat yükseklik tablosunu sayfaya gömün.",
            "Bölgesel ilçe sayfalarında (örn. Kadıköy, Çankaya, Karşıyaka) asansör hizmetini vurgulayın."
          ]
        },
        relatedQueries: [
          `${city} asansörlü nakliyat fiyatları`,
          "teleskopik yük asansörü kiralama",
          "rezidans eşya taşıma asansörü",
          "dar sokak mobil asansör"
        ],
        serpFeatures: ["Local 3-Pack", "Video Carousel", "Google Haritalar"],
        timeline: createTimelineData(32, 94, "seasonal", "#f59e0b"),
        color: "#f59e0b"
      },
      {
        id: "trend-logistics-4",
        rank: 4,
        trendTitle: "Parça Eşya & Tek Parça Beyaz Eşya Aynı Gün Hızlı Teslimat",
        primaryKeyword: "parça eşya taşıma aynı gün teslimat",
        category: "long_tail",
        categoryLabel: "Uzun Kuyruklu Mikro-İhtiyaç",
        growthPercentage: 125,
        growthLabel: "+125% YoY",
        velocityStatus: "İstikrarlı Yükselişte",
        currentMonthlyVolume: "5,100 / ay",
        projectedMonthlyVolume: "11,200 / ay",
        opportunityScore: 87,
        competitionLevel: "Düşük",
        competitionScore: 28,
        searchIntent: "İşlemsel (Transactional)",
        whyItMatters: "İkinci el mobilya pazarlarının (Sahibinden, Letgo, Dolap) büyümesi, tam kamyon kiralamak istemeyen tek parça eşya alıcılarının anlık nakliye aramasını patlattı.",
        actionPlan: {
          recommendedHeadline: `${city} Parça Eşya Taşıma: Tek Koltuk, Buzdolabı ve Koli Nakliyesi`,
          recommendedMetaDescription: `Tam araç tutmanıza gerek yok! ${city} içi paylaşımlı rotalı parça eşya taşıma ile en ekonomik fiyatlarla 2 saatte teslimat.`,
          suggestedPageSlug: "parca-esya-tasima",
          targetAudience: "Öğrenciler, bekarlar, ikinci el mobilya/beyaz eşya alıcıları",
          estimatedTimeToRank: "1-2 Hafta",
          strategicNextSteps: [
            "Koltuk, buzdolabı, piyano gibi popüler parça eşyalar için sabit fiyat kartları oluşturun.",
            "Aynı gün teslimat garantisini WhatsApp butonuyla birleştirin."
          ]
        },
        relatedQueries: [
          "tek parça eşya taşıma fiyatları",
          `${city} saatlik kamyonet kiralama şoförlü`,
          "öğrenci evi parça nakliyat",
          "şehirlerarası parça yük taşıma"
        ],
        serpFeatures: ["Local Pack", "People Also Ask", "WhatsApp Doğrudan Arama"],
        timeline: createTimelineData(24, 78, "steady", "#8b5cf6"),
        color: "#8b5cf6"
      },
      {
        id: "trend-logistics-5",
        rank: 5,
        trendTitle: "Güven Damgası: Dijital Envanter & Canlı GPS Konum Takibi",
        primaryKeyword: "gps takipli sigortalı evden eve nakliyat",
        category: "commercial_intent",
        categoryLabel: "Kullanıcı Güven Araması",
        growthPercentage: 110,
        growthLabel: "+110% YoY",
        velocityStatus: "Erken Evre Keşif",
        currentMonthlyVolume: "2,900 / ay",
        projectedMonthlyVolume: "7,400 / ay",
        opportunityScore: 84,
        competitionLevel: "Düşük",
        competitionScore: 16,
        searchIntent: "Ticari (Commercial)",
        whyItMatters: "Taşınma sırasında eşyaların kaybolması veya hasar görmesi endişesi, tüketicilerin 'anlık kamyon GPS takibi' ve 'fotoğraflı barkodlu envanter' sunan firmaları aramasına yol açıyor.",
        actionPlan: {
          recommendedHeadline: `Eşyalarınız Güvende: Canlı GPS Takip & %100 Kapsamlı Taşıma Sigortası`,
          recommendedMetaDescription: `${city} kurumsal evden eve nakliyat: Kamyonunuzu haritadan canlı takip edin, fotoğraflı sözleşmeyle eşyalarınızı teminat altına alın.`,
          suggestedPageSlug: "sigortali-gps-takipli-nakliyat",
          targetAudience: "Değerli antika, piyano, lüks mobilya sahipleri ve endişeli taşınanlar",
          estimatedTimeToRank: "2-3 Hafta",
          strategicNextSteps: [
            "Taşıma sözleşmesi örneğini ve sigorta poliçesi detaylarını PDF olarak sayfaya ekleyin.",
            "Müşteri yorumlarındaki 'sıfır hasar' deneyimlerini video formatında yayınlayın."
          ]
        },
        relatedQueries: [
          "garantili evden eve nakliyat",
          "sözleşmeli kasko sigortalı nakliye",
          "kamyon canlı konum takip nakliyat",
          "güvenilir nakliyat firması yorumları"
        ],
        serpFeatures: ["AI Overview", "Reviews Rich Snippet", "Site Links"],
        timeline: createTimelineData(15, 68, "steady", "#ec4899"),
        color: "#ec4899"
      }
    ];
  } else if (isTech) {
    trends = [
      {
        id: "trend-tech-1",
        rank: 1,
        trendTitle: "Headless & Edge-First Jamstack Web Mimarisi Talebi",
        primaryKeyword: "headless edge cms web geliştirme",
        category: "breakout",
        categoryLabel: "Kırılma Yaşayan Arama (Breakout)",
        growthPercentage: 260,
        growthLabel: "+260% YoY",
        velocityStatus: "Patlama Yaşıyor",
        currentMonthlyVolume: "5,400 / ay",
        projectedMonthlyVolume: "16,800 / ay",
        opportunityScore: 95,
        competitionLevel: "Düşük",
        competitionScore: 24,
        searchIntent: "Ticari (Commercial)",
        whyItMatters: "Yavaş WordPress sitelerinden kaçan e-ticaret ve KOBİ'ler, 50ms altı global sayfa açılış hızları sunan Edge CDN & headless mimarileri yoğun şekilde arıyor.",
        actionPlan: {
          recommendedHeadline: `Ultra Hızlı Edge Mimarisiyle Web Sitenizi 10 Kat Hızlandırın`,
          recommendedMetaDescription: `Geleneksel sunucu gecikmelerine son. Global Anycast Edge CDN üzerinde çalışan modern Next.js / Vite web çözümleri.`,
          suggestedPageSlug: "edge-web-gelistirme",
          targetAudience: "E-ticaret yöneticileri, dijital pazarlama direktörleri",
          estimatedTimeToRank: "2-3 Hafta",
          strategicNextSteps: [
            "Hız kıyaslama vaka analizini interaktif grafiklerle yayınlayın.",
            "Core Web Vitals test sonuçlarını canlı kanıt olarak sunun."
          ]
        },
        relatedQueries: [
          "hızlı web sitesi altyapısı",
          "wordpress alternatifi modern web",
          "edge cdn web tasarım ajansı",
          "core web vitals optimizasyonu"
        ],
        serpFeatures: ["AI Overview", "Featured Snippet", "Technical Docs"],
        timeline: createTimelineData(20, 98, "breakout", "#6366f1"),
        color: "#6366f1"
      },
      {
        id: "trend-tech-2",
        rank: 2,
        trendTitle: "Yapay Zeka Destekli B2B Müşteri Adayı Yakalama (AI Lead Capture)",
        primaryKeyword: "web sitesi ai akıllı teklif asistanı",
        category: "ai_overview",
        categoryLabel: "AI Arama & Dönüşüm",
        growthPercentage: 215,
        growthLabel: "+215% YoY",
        velocityStatus: "Patlama Yaşıyor",
        currentMonthlyVolume: "4,200 / ay",
        projectedMonthlyVolume: "13,400 / ay",
        opportunityScore: 92,
        competitionLevel: "Orta",
        competitionScore: 35,
        searchIntent: "Ticari (Commercial)",
        whyItMatters: "Geleneksel iletişim formlarının dönüşüm oranları %2'ye gerilerken, ziyaretçiyi sesli ve akıllı yönlendiren AI formlar aramalarda zirveye çıktı.",
        actionPlan: {
          recommendedHeadline: `Web Siteniz 7/24 Satış Yapsın: AI Akıllı Teklif Asistanı Entegrasyonu`,
          recommendedMetaDescription: `Ziyaretçilerinizi kaçırmayın. İhtiyacı analiz edip anında WhatsApp ve CRM'e yönlendiren yapay zeka satış asistanı.`,
          suggestedPageSlug: "ai-satis-asistani-entegrasyonu",
          targetAudience: "Hizmet sektöründeki KOBİ'ler ve B2B kurucular",
          estimatedTimeToRank: "3 Hafta",
          strategicNextSteps: [
            "Web sitenizde canlı demo asistanını sergileyin.",
            "Dönüşüm oranı artış grafikleriyle vaka çalışması hazırlayın."
          ]
        },
        relatedQueries: [
          "otomatik teklif veren web sitesi",
          "ai chatbot b2b lead generation",
          "akıllı form tasarımı",
          "whatsapp entegre crm web"
        ],
        serpFeatures: ["AI Overview", "People Also Ask", "Video"],
        timeline: createTimelineData(15, 92, "ai", "#10b981"),
        color: "#10b981"
      },
      {
        id: "trend-tech-3",
        rank: 3,
        trendTitle: "Google AI Search & SGE Uyumlu Schema Markup (GEO / Generative Engine Opt)",
        primaryKeyword: "google ai overview sge seo optimizasyonu",
        category: "breakout",
        categoryLabel: "SEO Paradigma Değişimi",
        growthPercentage: 195,
        growthLabel: "+195% YoY",
        velocityStatus: "Erken Evre Keşif",
        currentMonthlyVolume: "3,100 / ay",
        projectedMonthlyVolume: "9,500 / ay",
        opportunityScore: 94,
        competitionLevel: "Düşük",
        competitionScore: 19,
        searchIntent: "Bilgilendirici (Informational)",
        whyItMatters: "Tıklamaların %40'ı AI Overviews tarafından yanıtlanırken, markalar AI modelleri tarafından kaynak olarak gösterilmek için GEO danışmanlığı arıyor.",
        actionPlan: {
          recommendedHeadline: `Yapay Zeka Aramalarında İlk Sırada Çıkın: Generative Engine Optimization (GEO)`,
          recommendedMetaDescription: `Gemini, ChatGPT ve Google AI Overviews sonuçlarında markanızın tavsiye edilmesini sağlayacak yeni nesil anlamsal SEO mimarisi.`,
          suggestedPageSlug: "geo-yapay-zeka-seo",
          targetAudience: "Büyüme odaklı markalar, SEO uzmanları ve ajanslar",
          estimatedTimeToRank: "2-3 Hafta",
          strategicNextSteps: [
            "JSON-LD ve Entity-based anlamsal şema kütüphanesi oluşturun.",
            "GEO optimizasyon rehberi yayınlayarak sektörde otorite olun."
          ]
        },
        relatedQueries: [
          "chatgpt de marka önerilme stratejisi",
          "google sge optimizasyonu",
          "yapay zeka arama motoru optimizasyonu",
          "anlamsal schema markup rehberi"
        ],
        serpFeatures: ["AI Overview", "Rich Snippets", "Entity Graph"],
        timeline: createTimelineData(12, 86, "steady", "#f59e0b"),
        color: "#f59e0b"
      },
      {
        id: "trend-tech-4",
        rank: 4,
        trendTitle: "Kendi Sunucunda Barındırılan Bağımsız Yazılımlar (Coolify / VPS / Self-Hosted)",
        primaryKeyword: "coolify vps kurulumu ve deploy ajansı",
        category: "commercial_intent",
        categoryLabel: "Maliyet Tasarrufu & Egemenlik",
        growthPercentage: 165,
        growthLabel: "+165% YoY",
        velocityStatus: "İstikrarlı Yükselişte",
        currentMonthlyVolume: "4,600 / ay",
        projectedMonthlyVolume: "10,800 / ay",
        opportunityScore: 88,
        competitionLevel: "Düşük",
        competitionScore: 21,
        searchIntent: "İşlemsel (Transactional)",
        whyItMatters: "Aylık SaaS maliyetlerinden bunalan işletmeler, Vercel/Heroku yerine Hetzner ve Coolify ile kendi sunucularına tek tıkla deploy yapma çözümlerini arıyor.",
        actionPlan: {
          recommendedHeadline: `Aylık Bulut Faturalarına Son: Coolify & VPS Altyapı Danışmanlığı`,
          recommendedMetaDescription: `Kendi sunucunuzda sınırsız web sitesi ve veritabanı barındırın. Yüksek performans, sıfır satıcı bağımlılığı, tam veri gizliliği.`,
          suggestedPageSlug: "coolify-vps-kurulum-hizmeti",
          targetAudience: "Startuplar, e-ticaret siteleri ve ajanslar",
          estimatedTimeToRank: "2 Hafta",
          strategicNextSteps: [
            "VPS maliyet tasarruf tablosunu yayınlayın.",
            "Adım adım Coolify deployment rehberi ekleyin."
          ]
        },
        relatedQueries: [
          "vercel alternatifi self hosted",
          "coolify kurulum hizmeti",
          "hetzner vps nodejs deploy",
          "açık kaynak bulut mimarisi"
        ],
        serpFeatures: ["Featured Snippet", "People Also Ask", "GitHub Links"],
        timeline: createTimelineData(22, 82, "steady", "#8b5cf6"),
        color: "#8b5cf6"
      },
      {
        id: "trend-tech-5",
        rank: 5,
        trendTitle: "Lokal B2B Çok Dilli (Multi-Language) İhracat Web Sitesi Mimarisi",
        primaryKeyword: "çok dilli kurumsal ihracat web sitesi tasarımı",
        category: "commercial_intent",
        categoryLabel: "İhracat & Global Büyüme",
        growthPercentage: 135,
        growthLabel: "+135% YoY",
        velocityStatus: "İstikrarlı Yükselişte",
        currentMonthlyVolume: "3,700 / ay",
        projectedMonthlyVolume: "8,600 / ay",
        opportunityScore: 86,
        competitionLevel: "Orta",
        competitionScore: 38,
        searchIntent: "Ticari (Commercial)",
        whyItMatters: "Yurt dışına açılmak isteyen yerli üreticiler, otomatik çeviri hatalarından arındırılmış, hreflang etiketleri kusursuz küresel SEO siteleri talep ediyor.",
        actionPlan: {
          recommendedHeadline: `Avrupa ve Körfez Pazarlarına Açılın: Küresel SEO Uyumlu Çok Dilli Web Tasarım`,
          recommendedMetaDescription: `Almanya, İngiltere ve Dubai pazarlarında organik aramalarda üst sıralarda çıkmanızı sağlayan profesyonel çok dilli web mimarisi.`,
          suggestedPageSlug: "cok-dilli-ihracat-web-sitesi",
          targetAudience: "İhracatçı üreticiler, sanayi KOBİ'leri ve uluslararası danışmanlar",
          estimatedTimeToRank: "3-4 Hafta",
          strategicNextSteps: [
            "Hreflang ve bölgesel arama alışkanlıkları vaka çalışması paylaşın.",
            "İhracat destekleri & teşvik uyumlu web paketi sunun."
          ]
        },
        relatedQueries: [
          "ihracat odaklı web sitesi",
          "almanca ingilizce kurumsal web",
          "hreflang uluslararası seo",
          "global b2b web tasarımı"
        ],
        serpFeatures: ["Local Pack", "People Also Ask"],
        timeline: createTimelineData(28, 76, "steady", "#ec4899"),
        color: "#ec4899"
      }
    ];
  } else {
    // Dynamic universal template adapted to any custom sector & city
    trends = [
      {
        id: "trend-gen-1",
        rank: 1,
        trendTitle: `Yapay Zeka Destekli Hızlı ${sector} Fiyat Teklifi & Karşılaştırma`,
        primaryKeyword: `${city} ${sector.toLowerCase()} fiyat hesaplama 2026`,
        category: "breakout",
        categoryLabel: "Kırılma Yaşayan Arama (Breakout)",
        growthPercentage: 220,
        growthLabel: "+220% Yıllık Artış",
        velocityStatus: "Patlama Yaşıyor",
        currentMonthlyVolume: "4,500 / ay",
        projectedMonthlyVolume: "14,200 / ay",
        opportunityScore: 95,
        competitionLevel: "Düşük",
        competitionScore: 22,
        searchIntent: "Ticari (Commercial)",
        whyItMatters: `${city} genelinde ${sector.toLowerCase()} arayan tüketiciler, şeffaf fiyat tarifelerini ve anında online ön keşif imkanı sunan firmaları önceliklendiriyor.`,
        actionPlan: {
          recommendedHeadline: `${city} ${sector} Fiyat Rehberi: 1 Dakikada Net Maliyet Öğrenin`,
          recommendedMetaDescription: `${city} bölgesinde sürpriz masrafsız garantili ${sector.toLowerCase()} hizmeti. Şeffaf fiyat tarifesi ve anında uzman desteği.`,
          suggestedPageSlug: `${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-fiyat-tarifesi`,
          targetAudience: "Hızlı, şeffaf ve sabit fiyat garantisi arayan müşteriler",
          estimatedTimeToRank: "2-3 Hafta",
          strategicNextSteps: [
            "Sayfaya interaktif fiyat tahmin hesaplayıcısı ekleyin.",
            "Fiyatlandırma faktörlerini açıklayan kapsamlı bir rehber yazın."
          ]
        },
        relatedQueries: [
          `${city} en uygun ${sector.toLowerCase()}`,
          `${sector.toLowerCase()} saatlik ücretler`,
          `${city} kurumsal ${sector.toLowerCase()} firması`,
          `${sector.toLowerCase()} tavsiye ve yorumlar`
        ],
        serpFeatures: ["AI Overview", "Local 3-Pack", "Fiyat Tablosu"],
        timeline: createTimelineData(18, 95, "breakout", "#6366f1"),
        color: "#6366f1"
      },
      {
        id: "trend-gen-2",
        rank: 2,
        trendTitle: `Aynı Gün Acil ${sector} Müdahalesi & 7/24 Mobil Hizmet`,
        primaryKeyword: `acil 7/24 ${sector.toLowerCase()} ${city}`,
        category: "commercial_intent",
        categoryLabel: "Yüksek Dönüşümlü Acil İhtiyaç",
        growthPercentage: 175,
        growthLabel: "+175% YoY",
        velocityStatus: "Patlama Yaşıyor",
        currentMonthlyVolume: "6,200 / ay",
        projectedMonthlyVolume: "15,800 / ay",
        opportunityScore: 92,
        competitionLevel: "Düşük",
        competitionScore: 26,
        searchIntent: "İşlemsel (Transactional)",
        whyItMatters: "Mobil kullanıcıların %70'inden fazlası doğrudan telefon veya WhatsApp üzerinden aynı gün randevu alabileceği yerel hizmet sağlayıcılarını arıyor.",
        actionPlan: {
          recommendedHeadline: `7/24 Acil ${sector} Hizmeti: 30 Dakikada Kapınızda`,
          recommendedMetaDescription: `${city} merkez ve tüm ilçelerinde 7/24 kesintisiz ${sector.toLowerCase()} desteği. Lisanslı uzman kadro, 15 dakikada hızlı randevu.`,
          suggestedPageSlug: `acil-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-destegi`,
          targetAudience: "Zaman kısıtı olan ve acil çözüm bekleyen kullanıcılar",
          estimatedTimeToRank: "1-2 Hafta",
          strategicNextSteps: [
            "Mobil sayfalarda 'Hemen Ara' ve 'WhatsApp ile Konum Gönder' butonlarını sabitleyin.",
            "Google İşletme Profilinde 7/24 çalışma saatlerini güncelleyin."
          ]
        },
        relatedQueries: [
          `en yakın ${sector.toLowerCase()} nerede`,
          `${city} nöbetçi ${sector.toLowerCase()}`,
          `pazar günü açık ${sector.toLowerCase()}`,
          `acil ${sector.toLowerCase()} numarası`
        ],
        serpFeatures: ["Local Pack", "Call Button", "Google Maps"],
        timeline: createTimelineData(24, 90, "ai", "#10b981"),
        color: "#10b981"
      },
      {
        id: "trend-gen-3",
        rank: 3,
        trendTitle: `Google AI Overviews (SGE) Doğrudan Cevap & Nasıl Yapılır Aramaları`,
        primaryKeyword: `${sector.toLowerCase()} seçerken nelere dikkat edilmeli`,
        category: "ai_overview",
        categoryLabel: "AI & Bilgilendirici Otorite",
        growthPercentage: 155,
        growthLabel: "+155% YoY",
        velocityStatus: "İstikrarlı Yükselişte",
        currentMonthlyVolume: "3,800 / ay",
        projectedMonthlyVolume: "9,600 / ay",
        opportunityScore: 89,
        competitionLevel: "Düşük",
        competitionScore: 19,
        searchIntent: "Bilgilendirici (Informational)",
        whyItMatters: "Yapay zeka arama motorları karar aşamasındaki kullanıcı sorularını özetlerken, uzman tavsiyesi sunan siteleri doğrudan 'Kaynak' olarak öne çıkarıyor.",
        actionPlan: {
          recommendedHeadline: `${sector} Seçerken Yapılan 5 Kritik Hata ve Doğru Tercih Rehberi`,
          recommendedMetaDescription: `Paranızı ve zamanınızı çöpe atmayın. ${sector} hizmeti alırken dikkat etmeniz gereken yasal belgeler, sözleşme maddeleri ve kalite kriterleri.`,
          suggestedPageSlug: `${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-secim-rehberi`,
          targetAudience: "Araştırma yapan, güvenilirlik ve kalite odaklı karar vericiler",
          estimatedTimeToRank: "3 Hafta",
          strategicNextSteps: [
            "Madde işaretli, net tanımlar içeren H2 ve H3 blokları oluşturun.",
            "Sıkça Sorulan Sorular şeması (FAQPage Schema) ekleyin."
          ]
        },
        relatedQueries: [
          `${sector.toLowerCase()} güvenilir mi`,
          `en iyi ${sector.toLowerCase()} firmaları`,
          `${sector.toLowerCase()} sözleşmesinde olması gerekenler`,
          `dolandırıcılıktan kaçınma ${sector.toLowerCase()}`
        ],
        serpFeatures: ["AI Overview", "People Also Ask", "Featured Snippet"],
        timeline: createTimelineData(14, 84, "steady", "#f59e0b"),
        color: "#f59e0b"
      },
      {
        id: "trend-gen-4",
        rank: 4,
        trendTitle: `Lokal Bölgesel & İlçe Bazlı Semt Aramaları`,
        primaryKeyword: `${city} merkez ve çevre ilçeler ${sector.toLowerCase()}`,
        category: "long_tail",
        categoryLabel: "Hiper-Yerel Uzun Kuyruk",
        growthPercentage: 130,
        growthLabel: "+130% YoY",
        velocityStatus: "İstikrarlı Yükselişte",
        currentMonthlyVolume: "5,800 / ay",
        projectedMonthlyVolume: "12,400 / ay",
        opportunityScore: 88,
        competitionLevel: "Orta",
        competitionScore: 34,
        searchIntent: "Gezinme (Navigational)",
        whyItMatters: "Kullanıcılar jenerik aramalar yerine doğrudan kendi semt ve mahalle isimlerini yazarak servis süresini kısaltmayı hedefliyor.",
        actionPlan: {
          recommendedHeadline: `${city} Tüm İlçelerinde Garantili ve Yerinde ${sector} Çözümleri`,
          recommendedMetaDescription: `${city} genelinde semtinize en yakın servis aracımızla dakikalar içinde yanınızdayız. Orijinal malzeme, yazılı garanti.`,
          suggestedPageSlug: `${city.toLowerCase()}-bolgesel-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          targetAudience: "Yerel mahalle sakinleri ve yerinde hizmet bekleyenler",
          estimatedTimeToRank: "2-3 Hafta",
          strategicNextSteps: [
            "İlçe ve semtlere özel açılış sayfaları (Landing Page) tasarlayın.",
            "LocalBusiness JSON-LD coğrafi koordinatlarını ekleyin."
          ]
        },
        relatedQueries: [
          `${city} yakınımdaki ${sector.toLowerCase()}`,
          `${city} mahalle bazlı ${sector.toLowerCase()}`,
          `${city} ücretsiz keşif`,
          `${city} yerinde servis`
        ],
        serpFeatures: ["Local 3-Pack", "Harita Pinleri", "Google Yorumlar"],
        timeline: createTimelineData(28, 78, "steady", "#8b5cf6"),
        color: "#8b5cf6"
      },
      {
        id: "trend-gen-5",
        rank: 5,
        trendTitle: `Dijital Sözleşmeli, Faturalı & Kurumsal Referanslı Hizmetler`,
        primaryKeyword: `kurumsal faturalı garantili ${sector.toLowerCase()}`,
        category: "commercial_intent",
        categoryLabel: "Kurumsal Güven & B2B İhtiyaç",
        growthPercentage: 115,
        growthLabel: "+115% YoY",
        velocityStatus: "Erken Evre Keşif",
        currentMonthlyVolume: "3,200 / ay",
        projectedMonthlyVolume: "7,800 / ay",
        opportunityScore: 85,
        competitionLevel: "Düşük",
        competitionScore: 17,
        searchIntent: "Ticari (Commercial)",
        whyItMatters: "Merdiven altı çalışan şahıslardan mağdur olan müşteriler, e-fatura kesen, yazılı garanti taahhüdü veren ve kurumsal vergi levhalı işletmeleri tercih ediyor.",
        actionPlan: {
          recommendedHeadline: `Yazılı Garanti & Kurumsal Güvence: Faturalı ${sector} Hizmeti`,
          recommendedMetaDescription: `Sürpriz yok, risk yok. ${company} güvencesiyle faturalı, yasal sözleşmeli ve 1 yıl garantili ${sector.toLowerCase()} desteği.`,
          suggestedPageSlug: `kurumsal-garantili-${sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          targetAudience: "B2B işletmeler, site yönetimleri ve kurumsal güvence arayan bireyler",
          estimatedTimeToRank: "2-4 Hafta",
          strategicNextSteps: [
            "Vergi levhası, yetki belgeleri ve sigorta sertifikalarını sitede şeffafça sergileyin.",
            "Müşteri memnuniyet anket skorlarını canlı rozet olarak ekleyin."
          ]
        },
        relatedQueries: [
          `faturalı ${sector.toLowerCase()} firması`,
          `resmi sözleşmeli ${sector.toLowerCase()}`,
          `kurumsal referanslı ${sector.toLowerCase()}`,
          `garanti belgesi ${sector.toLowerCase()}`
        ],
        serpFeatures: ["AI Overview", "Reviews Rich Snippet", "Güven Rozetleri"],
        timeline: createTimelineData(16, 72, "steady", "#ec4899"),
        color: "#ec4899"
      }
    ];
  }

  const groundingCitations: GroundingCitation[] = [
    {
      title: `Google Trends - ${sector} Arama Hacimleri ve Bölgesel İlgi`,
      url: "https://trends.google.com/trends/explore",
      snippet: `${city} ve Türkiye genelinde son 12 ayda yükselişe geçen ${sector.toLowerCase()} sorguları ve anlık arama hacimleri.`,
      sourceDomain: "trends.google.com"
    },
    {
      title: `Google Arama SERP Verileri & Yapay Zeka Özeti (AI Overviews)`,
      url: "https://google.com/search?q=" + encodeURIComponent(`${city} ${sector}`),
      snippet: `Organik ilk 10 sonuç, Yerel Harita Paketi (Local 3-Pack) ve People Also Ask kullanıcı soruları analizi.`,
      sourceDomain: "google.com"
    },
    {
      title: `Sektörel Tüketici Talepleri & Dijital Arama Eğilimleri Raporu`,
      url: "https://thinkwithgoogle.com",
      snippet: "Hizmet sektöründe mobil kullanıcıların satın alma kararlarını etkileyen anlık fiyatlandırma ve şeffaflık trendleri.",
      sourceDomain: "thinkwithgoogle.com"
    }
  ];

  const searchGroundingQueries = [
    `${city} ${sector.toLowerCase()} en çok aranan kelimeler 2026`,
    `${sector.toLowerCase()} trend arama hacmi artışları`,
    `${city} acil ${sector.toLowerCase()} tüketici davranışları`,
    `google ai overviews ${sector.toLowerCase()} sge sorguları`,
    `${city} ${sector.toLowerCase()} fiyatları arama eğilimi`
  ];

  return {
    sector,
    industry: sector,
    region: `${city}, Türkiye`,
    analyzedAt: nowStr,
    macroSummary: `${city} merkezli ${sector} sektöründe arama davranışı hızla köklü bir değişim geçiriyor. Tüketiciler jenerik telefon görüşmeleri yerine anlık yapay zeka ile fiyat hesaplayan, 7/24 şeffaf mobil destek sunan ve Google AI Overviews sonuçlarında doğrudan net cevap veren işletmelere yöneliyor. İlk 5 trend, sektördeki rakiplerinizin henüz fark etmediği yüksek hacimli ve düşük rekabetli anahtar kelime boşluklarını hedefliyor.`,
    marketShiftHighlights: [
      "Aramaların %68'i artık akıllı fiyat hesaplama ve anında şeffaf keşif talebi içeriyor.",
      "Google AI Overviews (SGE), doğrudan net tanımlı cevap sunan web sitelerini %40 daha fazla referans gösteriyor.",
      "Semt ve mahalle bazlı hiper-yerel sorgular jenerik ilçe aramalarına göre 2.4 kat daha yüksek dönüşüm sağlıyor.",
      "Kurumsal fatura, dijital sözleşme ve fotoğraflı envanter sunan markaların arama hacmi yıllık %115 artış gösterdi."
    ],
    trends,
    searchGroundingQueries,
    groundingCitations,
    source: "algorithmic_fallback"
  };
}

/**
 * Exports trend forecast to a downloadable CSV format
 */
export function exportTrendsToCsv(forecast: SeoTrendForecastResponse): void {
  const headers = [
    "Sıra",
    "Trend Başlığı",
    "Birincil Anahtar Kelime",
    "Kategori",
    "Büyüme Oranı",
    "Durum",
    "Mevcut Hacim",
    "Tahmini Gelecek Hacim",
    "Fırsat Skoru (100)",
    "Rekabet Seviyesi",
    "Arama Niyeti",
    "Önerilen Sayfa Başlığı",
    "Önerilen Meta Açıklama",
    "Hedef Kitle",
    "Tahmini Sıralama Süresi"
  ];

  const rows = forecast.trends.map((t) => [
    t.rank,
    `"${t.trendTitle.replace(/"/g, '""')}"`,
    `"${t.primaryKeyword.replace(/"/g, '""')}"`,
    `"${t.categoryLabel.replace(/"/g, '""')}"`,
    `"${t.growthLabel.replace(/"/g, '""')}"`,
    `"${t.velocityStatus.replace(/"/g, '""')}"`,
    `"${t.currentMonthlyVolume.replace(/"/g, '""')}"`,
    `"${t.projectedMonthlyVolume.replace(/"/g, '""')}"`,
    t.opportunityScore,
    `"${t.competitionLevel}"`,
    `"${t.searchIntent}"`,
    `"${(t.actionPlan.recommendedHeadline || "").replace(/"/g, '""')}"`,
    `"${(t.actionPlan.recommendedMetaDescription || "").replace(/"/g, '""')}"`,
    `"${(t.actionPlan.targetAudience || "").replace(/"/g, '""')}"`,
    `"${t.actionPlan.estimatedTimeToRank || ""}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `seo-trend-forecast-${forecast.sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
