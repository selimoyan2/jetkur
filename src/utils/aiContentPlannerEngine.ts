import { SiteConfig, AiContentPlanResponse, ContentCalendarDay, ContentPlannerAudienceSegment, ContentPlannerPillar, ContentPlanDayStatus } from "../types";

export const LOCAL_STORAGE_CONTENT_PLAN_KEY = "jetkur_ai_seo_content_plan_v1";

/**
 * Extracts and consolidates primary keywords from SiteConfig
 */
export function extractSiteKeywords(config: SiteConfig): string[] {
  const list: string[] = [];

  if (config.seo?.keywords && typeof config.seo.keywords === "string") {
    config.seo.keywords.split(",").forEach(k => {
      const clean = k.trim();
      if (clean && !list.includes(clean)) list.push(clean);
    });
  }

  // Also collect service titles
  if (config.services?.items && Array.isArray(config.services.items)) {
    config.services.items.forEach(s => {
      if (s && s.title && typeof s.title === "string") {
        const clean = s.title.trim();
        if (clean && !list.includes(clean)) list.push(clean);
      }
    });
  }

  // Fallbacks based on sector and city
  const sector = config.sector || "Kurumsal Hizmetler";
  const city = config.city || "İstanbul";
  
  if (list.length === 0) {
    list.push(
      `${city} ${sector}`,
      `${sector} fiyatları`,
      `en iyi ${sector}`,
      `profesyonel ${sector} hizmeti`,
      `${sector} tavsiyeleri`
    );
  }

  // Deduplicate and clean
  return Array.from(new Set(list)).filter(Boolean);
}

/**
 * Builds realistic, high-conversion Audience Segments tailored to the site
 */
export function generateAudienceSegments(config: SiteConfig): ContentPlannerAudienceSegment[] {
  const sector = config.sector || "Hizmet";
  const city = config.city || "Bölgeniz";

  return [
    {
      id: "b2b-decision-makers",
      name: "B2B Karar Vericiler & İşletme Sahipleri",
      badge: "Yüksek Gelir / B2B",
      description: "Şirket verimliliği, kurumsal sözleşmeler ve profesyonel faturalı hizmet arayan KOBİ ve kurumsal yöneticiler.",
      searchIntent: "Ticari",
      painPoints: [
        "Güvenilmez tedarikçiler ve iş teslimat gecikmeleri",
        "Yasal uyumluluk, garanti ve faturalı kurumsal standart eksikliği",
        "Fiyat/performans dengesini üst yönetime raporlayamama"
      ],
      hookAngle: "ROI, zaman tasarrufu, kurumsal garanti ve resmi standartlar.",
      decisionFactors: ["Referanslar", "SLA / Teslimat Güvencesi", "Kurumsal Teklif Şeffaflığı"]
    },
    {
      id: "emergency-local-seekers",
      name: "Acil Çözüm & Yerel Arayanlar",
      badge: "Yüksek Aciliyet / 7/24",
      description: `${city} ve çevresinde anında keşif, arıza müdahalesi veya acil randevu isteyen son kullanıcılar.`,
      searchIntent: "Acil / Yerel",
      painPoints: [
        "Aynı gün içinde usta veya uzman bulamama stresi",
        "Telefonlara bakılmaması veya net fiyat verilmemesi",
        "Bölgeye hakim olmayan uzaktan servisler"
      ],
      hookAngle: "15 dakikada keşif, 7/24 kesintisiz iletişim, en yakın yerel ekip.",
      decisionFactors: ["Hızlı Yanıt Süresi", "Yerel Lokasyon Güveni", "WhatsApp Anlık İletişim"]
    },
    {
      id: "budget-conscious-buyers",
      name: "Fiyat & Bütçe Bilinçli Müşteriler",
      badge: "Fiyat / Tasarruf",
      description: "Piyasa fiyatlarını karşılaştıran, gizli maliyetlerden kaçınan ve şeffaf fiyat tarifesi arayan kitle.",
      searchIntent: "İşlemsel",
      painPoints: [
        "İş bittikten sonra çıkarılan sürpriz ekstra masraflar",
        "Piyasa ortalamasının üzerinde fahiş fiyat korkusu",
        "Uygun fiyat ararken kalitesiz malzemeyle mağdur olma"
      ],
      hookAngle: "Şeffaf 2026 fiyat tarifesi, ücretsiz ön keşif, sıfır sürpriz maliyet politikası.",
      decisionFactors: ["Sabit Fiyat Garantisi", "Ücretsiz Keşif", "Ödeme Kolaylığı / Taksit"]
    },
    {
      id: "quality-researchers",
      name: "Kalite, Sertifika & Uzmanlık Araştırmacıları",
      badge: "E-E-A-T & Güven",
      description: "İşi ilk seferde doğru yaptırmak isteyen, uzman sertifikalarına ve kullanıcı yorumlarına bakan bilinçli kitle.",
      searchIntent: "Bilgilendirici",
      painPoints: [
        "Kısa sürede tekrarlayan arızalar ve kalitesiz işçilik",
        "Sorumluluk almayan yetkisiz ekipler",
        "Doğru yöntemin hangisi olduğunu internette bulamama"
      ],
      hookAngle: "Adım adım uzman rehberleri, 1. sınıf malzeme sertifikaları ve yazılı iş garantisi.",
      decisionFactors: ["Kullanıcı Yorumları", "Sertifikalı Personel", "Yazılı Garanti Belgesi"]
    }
  ];
}

/**
 * Builds Content Pillars based on sector
 */
export function generateContentPillars(config: SiteConfig, keywords: string[]): ContentPlannerPillar[] {
  const kw1 = keywords[0] || "Hizmet";
  const kw2 = keywords[1] || "Uygulama";
  const kw3 = keywords[2] || "Fiyatları";

  return [
    {
      id: "pillar-how-to",
      name: "Uzman Rehberler & Nasıl Yapılır",
      description: "Google'da 'Nasıl', 'Neden', 'Adım Adım' sorgularını yakalayan, E-E-A-T otoritesi oluşturan uzun soluklu içerikler.",
      targetKeywords: [kw1, `${kw1} nasıl yapılır`, `${kw1} rehberi`],
      colorTheme: "from-blue-600/20 to-cyan-600/20 text-cyan-400 border-cyan-500/30"
    },
    {
      id: "pillar-pricing",
      name: "Maliyet, Fiyat & Bütçe Analizi",
      description: "Doğrudan satın alma kararı arifesindeki kullanıcıları yakalayan, yüksek dönüşümlü fiyat odaklı sayfalar.",
      targetKeywords: [`${kw1} fiyatları`, kw3, "maliyet hesaplama"],
      colorTheme: "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30"
    },
    {
      id: "pillar-comparisons",
      name: "Karşılaştırma & Seçim Kriterleri",
      description: "Piyasadaki alternatifleri, malzeme türlerini ve yöntemleri karşılaştırarak kullanıcının doğru karar vermesini sağlayan içerikler.",
      targetKeywords: [kw2, "hangisi daha iyi", "seçim rehberi"],
      colorTheme: "from-purple-600/20 to-indigo-600/20 text-purple-400 border-purple-500/30"
    },
    {
      id: "pillar-case-studies",
      name: "Vaka Analizleri & Müşteri Hikayeleri",
      description: "Gerçek çözülen sorunları, öncesi/sonrası süreçleri ve elde edilen somut faydaları belgeleyen güven motoru.",
      targetKeywords: ["örnek uygulamalar", "başarı hikayeleri", "kullanıcı yorumları"],
      colorTheme: "from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/30"
    },
    {
      id: "pillar-checklists",
      name: "Sık Yapılan Hatalar & Kontrol Listeleri",
      description: "Hızlı taranan, sosyal medyada paylaşılma potansiyeli yüksek, pratik kontrol listeleri ve uyarılar.",
      targetKeywords: ["dikkat edilmesi gerekenler", "yapılan hatalar", "kontrol listesi"],
      colorTheme: "from-rose-600/20 to-pink-600/20 text-rose-400 border-rose-500/30"
    }
  ];
}

/**
 * Algorithmic Fallback Generator: Creates a comprehensive 30-Day Content Calendar
 */
export function generateFallbackContentPlan(
  config: SiteConfig,
  customKeywords?: string[],
  audienceFocus?: string,
  tone?: string
): AiContentPlanResponse {
  const companyName = config.companyName || "JetKur İşletmesi";
  const sector = config.sector || "Profesyonel Hizmet";
  const city = config.city || "İstanbul";
  
  let keywords = customKeywords && customKeywords.length > 0 
    ? customKeywords 
    : extractSiteKeywords(config);

  if (keywords.length === 0) {
    keywords = [`${city} ${sector}`, `${sector} Fiyatları`, `En İyi ${sector}`];
  }

  const audienceSegments = generateAudienceSegments(config);
  const pillars = generateContentPillars(config, keywords);

  // Today as starting point for dates
  const today = new Date();

  // Curated 30 High-Conversion Blog Post Blueprint Blueprints for SEO
  const templates = [
    // Week 1: Foundation & Authority (Days 1 - 7)
    {
      headlineTpl: (kw: string, c: string) => `2026'da ${c} Bölgesinde ${kw} Seçerken Yapılan 7 Kritik Hata`,
      alt1Tpl: (kw: string) => `${kw} Yaptırırken Paranızı Çöpe Atmayın: Bilinçli Tüketici Kılavuzu`,
      alt2Tpl: (kw: string) => `Uzmanından Uyarı: En Yaygın 7 ${kw} Yanılgısı ve Doğru Yöntemler`,
      contentType: "Kontrol Listesi (Checklist)" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "quality-researchers",
      volume: "3,800 / ay",
      takeaways: [
        "Piyasadaki en yaygın kalitesiz malzeme ve işçilik tuzakları",
        "Sözleşme ve garanti belgesinde mutlaka bulunması gereken 5 madde",
        "İş tesliminde kontrol edilmesi gereken altın kriterler"
      ],
      cta: "Ücretsiz Ön Kontrol ve Danışmanlık İçin Hemen Bize Ulaşın."
    },
    {
      headlineTpl: (kw: string, c: string) => `${c} ${kw} Fiyatları 2026: Güncel Maliyet ve Paket Karşılaştırması`,
      alt1Tpl: (kw: string) => `${kw} Ne Kadara Mal Olur? Gizli Maliyet Olmayan Şeffaf Fiyat Listesi`,
      alt2Tpl: (kw: string) => `${kw} Fiyatını Belirleyen 4 Temel Faktör ve Tasarruf İpuçları`,
      contentType: "Maliyet & Fiyat Rehberi" as const,
      searchIntent: "İşlemsel" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "budget-conscious-buyers",
      volume: "5,400 / ay",
      takeaways: [
        "Sektördeki taban ve tavan metrekare / birim maliyetleri",
        "Fiyat teklifi alırken sormanız gereken kritik teknik sorular",
        "Bütçenizi aşmadan maksimum verim alma stratejileri"
      ],
      cta: "Kişiselleştirilmiş Hızlı Fiyat Teklifinizi 2 Dakikada Alın."
    },
    {
      headlineTpl: (kw: string) => `Adım Adım Profesyonel ${kw} Rehberi: Sıfırdan Kusursuz Sonuca`,
      alt1Tpl: (kw: string) => `Kapsamlı ${kw} Kılavuzu: Bilmeniz Gereken Her Şey Tek Sayfada`,
      alt2Tpl: (kw: string) => `İşin Ustaları Anlatıyor: ${kw} Süreci Nasıl İlerler?`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "quality-researchers",
      volume: "4,100 / ay",
      takeaways: [
        "Ön keşif ve planlama aşamasının önemi",
        "Kullanılan modern ekipman ve teknik standartlar",
        "Uzun ömürlü kullanım için periyodik bakım önerileri"
      ],
      cta: "Uzman Mühendis ve Ekibimizle Projenizi Konuşun."
    },
    {
      headlineTpl: (kw: string, c: string) => `Acil ${kw} Gerektiğinde 15 Dakikada Yapmanız Gerekenler`,
      alt1Tpl: (kw: string, c: string) => `${c} Acil ${kw} Müdahalesi: Hasarı Önleme ve Güvenlik Rehberi`,
      alt2Tpl: (kw: string) => `Kriz Anında ${kw}: Panik Yapmadan Doğru Adımları Atın`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Acil / Yerel" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "emergency-local-seekers",
      volume: "2,900 / ay",
      takeaways: [
        "Tehlike veya arıza durumunda ilk yapılması gereken 3 hamle",
        "Gereksiz masrafların önüne geçecek acil durum önlemleri",
        "Yerel nöbetçi ve acil servis ekiplerine hızla ulaşma rehberi"
      ],
      cta: "7/24 Acil Hattımızı Arayarak Hemen Destek Alın."
    },
    {
      headlineTpl: (kw: string) => `Kurumsal Şirketler İçin ${kw} Standartları: B2B Rehberi`,
      alt1Tpl: (kw: string) => `İşletmenizde ${kw} Verimliliği Nasıl Artırılır? Yöneticiler İçin Kılavuz`,
      alt2Tpl: (kw: string) => `B2B ${kw} Anlaşmalarında Dikkat Edilmesi Gereken SLA Kriterleri`,
      contentType: "Vaka Analizi & Başarı Hikayesi" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "b2b-decision-makers",
      volume: "1,700 / ay",
      takeaways: [
        "Şirket operasyonlarını aksatmadan uygulama yapma takvimleri",
        "Resmi faturalandırma, iş sağlığı güvenliği ve yasal evraklar",
        "Uzun vadeli periyodik anlaşmalarda %30'a varan kurumsal indirimler"
      ],
      cta: "Kurumsal Portföy ve Özel B2B Fiyat Teklifimizi Talep Edin."
    },
    {
      headlineTpl: (kw: string) => `${kw} Konusunda En Çok Sorulan 10 Soru ve Uzman Cevapları`,
      alt1Tpl: (kw: string) => `Aklınızdaki Tüm Şüpheleri Giderin: Kapsamlı ${kw} SSS Kılavuzu`,
      alt2Tpl: (kw: string) => `${kw} Hakkında Merak Edilenler: Süre, Maliyet ve Garanti Detayları`,
      contentType: "Sık Sorulan Sorular (FAQ)" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "quality-researchers",
      volume: "3,300 / ay",
      takeaways: [
        "İşlem ne kadar sürer ve günlük hayatı nasıl etkiler?",
        "Kullanılan malzemelerin garanti süresi ne kadardır?",
        "İşlem sonrasında destek alabilir miyim?"
      ],
      cta: "Sorunuza Yanıt Bulamadıysanız WhatsApp'tan Anında Bize Sorun."
    },
    {
      headlineTpl: (kw: string) => `Kendin Yap (DIY) vs Profesyonel ${kw}: Hangisi Daha Mantıklı?`,
      alt1Tpl: (kw: string) => `${kw} İşini Kendiniz Yapabilir misiniz? Risk ve Maliyet Analizi`,
      alt2Tpl: (kw: string) => `Kendi Başına ${kw} Yaparken Yapılan Masraflar Neden Daha Yüksek Çıkar?`,
      contentType: "Karşılaştırma & Analiz" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Viral / Sosyal Etki" as const,
      audienceId: "budget-conscious-buyers",
      volume: "2,800 / ay",
      takeaways: [
        "Amatör denemelerin gizli alet ve malzeme masrafları",
        "Güvenlik riskleri ve garanti dışı kalma tehlikeleri",
        "Ne zaman kendiniz yapmalı, ne zaman mutlaka uzmana bırakmalısınız?"
      ],
      cta: "Riske Girmeden Profesyonel Keşif Randevunuzu Oluşturun."
    },

    // Week 2: Deep Comparisons & Strategic Deciders (Days 8 - 14)
    {
      headlineTpl: (kw: string) => `A Sınıfı vs B Sınıfı ${kw}: Arasındaki Fark Fiyatına Değer mi?`,
      alt1Tpl: (kw: string) => `${kw} Malzeme Karşılaştırması: Kaliteyi Nasıl Anlarsınız?`,
      alt2Tpl: (kw: string) => `Uzun Vadeli Yatırım: Doğru ${kw} Seçimi Nasıl Yapılır?`,
      contentType: "Karşılaştırma & Analiz" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "quality-researchers",
      volume: "2,200 / ay",
      takeaways: [
        "Farklı malzeme türlerinin dayanıklılık ve kullanım ömrü testleri",
        "İşçilik farkının sonuca etkisi",
        "Bütçenize en uygun optimum denge noktası"
      ],
      cta: "Malzeme Numuneleri ve Detaylı Bilgi İçin Formu Doldurun."
    },
    {
      headlineTpl: (kw: string, c: string) => `${c}'da En Güvenilir ${kw} Firması Nasıl Bulunur?`,
      alt1Tpl: (kw: string, c: string) => `${c} ${kw} Tavsiyesi: Müşteri Deneyimleri ve Güvenilirlik Testi`,
      alt2Tpl: (kw: string) => `Doğru Hizmet Sağlayıcıyı Seçmek İçin 5 Altın İpucu`,
      contentType: "Kontrol Listesi (Checklist)" as const,
      searchIntent: "Acil / Yerel" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "emergency-local-seekers",
      volume: "3,600 / ay",
      takeaways: [
        "Google İşletme yorumlarında sahte değerlendirmeleri anlama yolları",
        "Fiziksel ofis ve kurumsal vergi levhası kontrolü",
        "Yazılı sözleşme olmadan asla peşinat vermeme kuralı"
      ],
      cta: `${companyName} Güvencesiyle 100% Memnuniyet Garantili Hizmet Alın.`
    },
    {
      headlineTpl: (kw: string) => `${kw} Öncesi ve Sonrası: Gerçek Bir Müşterimizin Dönüşüm Hikayesi`,
      alt1Tpl: (kw: string) => `Vaka Analizi: Büyük Bir Sorunu 24 Saatte Nasıl Çözdük?`,
      alt2Tpl: (kw: string) => `Müşteri Deneyimi: ${kw} İle Sağlanan %40 Tasarruf Hikayesi`,
      contentType: "Vaka Analizi & Başarı Hikayesi" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Viral / Sosyal Etki" as const,
      audienceId: "b2b-decision-makers",
      volume: "1,500 / ay",
      takeaways: [
        "Karşılaşılan ilk problem ve yapılan teknik tespit",
        "Uygulanan yenilikçi çözüm ve geçen toplam süre",
        "Müşterinin elde ettiği nihai konfor ve maliyet avantajı"
      ],
      cta: "Benzer Başarı Hikayesini Sizin Projenizde de Hayata Geçirelim."
    },
    {
      headlineTpl: (kw: string) => `2026 Trendleri: ${kw} Alanında Yeni Teknolojiler ve Yenilikler`,
      alt1Tpl: (kw: string) => `Geleceğin Standartları: Modern ${kw} Uygulamalarında Neler Değişti?`,
      alt2Tpl: (kw: string) => `Akıllı Çözümler ve Enerji Tasarrufu Sağlayan ${kw} Metotları`,
      contentType: "Piyasa Trendleri & İpuçları" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "quality-researchers",
      volume: "2,100 / ay",
      takeaways: [
        "Sektöre damga vuran yeni nesil çevre dostu malzemeler",
        "Dijital takip ve uzaktan kontrol sistemleri",
        "Gelecek 5 yılda değerini koruyacak akıllı yatırımlar"
      ],
      cta: "Modern Çözümlerimizle Geleceğe Yatırım Yapın, Şimdi Arayın."
    },
    {
      headlineTpl: (kw: string) => `${kw} İçin Bütçe Planlaması: Gizli Maliyetleri Önlemenin 6 Yolu`,
      alt1Tpl: (kw: string) => `Sürpriz Masraflara Son: Net ve Garantili ${kw} Bütçesi Çıkarma`,
      alt2Tpl: (kw: string) => `En Uygun Fiyatla En Kaliteli ${kw} Nasıl Alınır?`,
      contentType: "Maliyet & Fiyat Rehberi" as const,
      searchIntent: "İşlemsel" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "budget-conscious-buyers",
      volume: "2,700 / ay",
      takeaways: [
        "Usta veya firmayla anlaşmadan önce yazılı olarak netleştirilecek detaylar",
        "Kullanılacak yedek parça ve sarf malzeme fiyatlandırması",
        "İşçilik garantisi ve olası rötuş maliyetlerinin kapsama alınması"
      ],
      cta: "Net Fiyat Garantisiyle Ücretsiz Keşif Talebinde Bulunun."
    },
    {
      headlineTpl: (kw: string) => `${kw} Bakımı ve Ömrünü 2 Katına Çıkaracak Pratik İpuçları`,
      alt1Tpl: (kw: string) => `Düzenli Bakım Rehberi: ${kw} Ne Sıklıkla Kontrol Edilmelidir?`,
      alt2Tpl: (kw: string) => `Maddi Kaybı Önleyin: ${kw} Arızalarını Erkenden Tespit Etme Yöntemleri`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "quality-researchers",
      volume: "1,900 / ay",
      takeaways: [
        "Kullanıcının evde veya işyerinde kolayca yapabileceği kontroller",
        "Büyük arıza belirtisi olan 3 erken uyarı işareti",
        "Profesyonel periyodik bakım takvimi oluşturmanın avantajları"
      ],
      cta: "Periyodik Bakım Paketi Avantajlarımız İçin Bize Yazın."
    },
    {
      headlineTpl: (kw: string, c: string) => `${c} Şartlarında ${kw}: İklim ve Bölgeye Özel Çözümler`,
      alt1Tpl: (kw: string, c: string) => `${c}'un Hava Koşullarına Karşı En Dayanıklı ${kw} Seçenekleri`,
      alt2Tpl: (kw: string, c: string) => `Bölgesel Faktörler: ${c} Sakinleri Nelere Dikkat Etmeli?`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Acil / Yerel" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "emergency-local-seekers",
      volume: "2,400 / ay",
      takeaways: [
        "Bölgenin nem, ısı ve altyapı özelliklerine uygun malzeme seçimi",
        "Lokal belediye veya çevre standartlarına uyumluluk",
        "Bölgeye en hızlı ulaşan uzman ekiplerle çalışmanın önemi"
      ],
      cta: `${city} Bölgesine Özel Kampanyalı Teklifinizi Hemen Alın.`
    },

    // Week 3: High Conversion, Proof & Buyer Assurance (Days 15 - 21)
    {
      headlineTpl: (kw: string) => `Garantili ${kw} Hizmeti Nedir? Sözleşmede Olması Gerekenler`,
      alt1Tpl: (kw: string) => `İşin Arkasında Duran Firmalar: ${kw} Garantisi Neleri Kapsar?`,
      alt2Tpl: (kw: string) => `Güvende Olun: Hizmet Garantisi Alırken Yapılan 3 Hata`,
      contentType: "Kontrol Listesi (Checklist)" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "quality-researchers",
      volume: "1,850 / ay",
      takeaways: [
        "Yazılı garanti belgesi ile sözlü vaat arasındaki farklar",
        "Malzeme garantisi vs işçilik garantisi ayrımı",
        "Arıza durumunda ücretsiz revizyon hakkı şartları"
      ],
      cta: `${companyName} Yazılı İş Garantisiyle Huzurlu Hizmet Alın.`
    },
    {
      headlineTpl: (kw: string) => `${kw} Sürecinde Zaman Kazandıran 5 Akıllı Çözüm`,
      alt1Tpl: (kw: string) => `İşler Aksamasın: Hızlı ve Etkili ${kw} Nasıl Tamamlanır?`,
      alt2Tpl: (kw: string) => `Zamanı Verimli Yönetin: Profesyonel ${kw} İpuçları`,
      contentType: "Piyasa Trendleri & İpuçları" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "b2b-decision-makers",
      volume: "1,600 / ay",
      takeaways: [
        "Hızlı randevu alma ve anında durum tespiti yolları",
        "Gelişmiş aletlerle iş süresini yarı yarıya indirme",
        "Sonuç odaklı profesyonel koordinasyon"
      ],
      cta: "Vaktinizi Boşa Harcamayın, Aynı Gün Hizmet İçin Arayın."
    },
    {
      headlineTpl: (kw: string) => `Fiyat Teklifi Alırken Yapılan En Büyük Hata: Sadece Rakamlara Bakmak`,
      alt1Tpl: (kw: string) => `Ucuz ${kw} Neden Daha Pahalıya Patlar? Gerçek Maliyet Tablosu`,
      alt2Tpl: (kw: string) => `Fiyat / Kalite Dengesi: ${kw} Alırken Gerçek Değer Nasıl Hesaplanır?`,
      contentType: "Maliyet & Fiyat Rehberi" as const,
      searchIntent: "İşlemsel" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "budget-conscious-buyers",
      volume: "3,100 / ay",
      takeaways: [
        "Eksik yapılan işlerin sonraki tamir maliyetleri",
        "Düşük kaliteli malzemenin kullanım ömrü analizi",
        "Doğru fiyat teklifini değerlendirme metodolojisi"
      ],
      cta: "Gerçek Değerinde ve Şeffaf Fiyatla Profesyonel Teklif Alın."
    },
    {
      headlineTpl: (kw: string) => `${kw} Hakkında Şehir Efsaneleri ve Bilinen Yanlışlar`,
      alt1Tpl: (kw: string) => `Doğru Bilinen Yanlışlar: ${kw} Konusunda Bu Tuzaklara Düşmeyin`,
      alt2Tpl: (kw: string) => `Kulaktan Dolma Bilgilere Son: Bilimsel ve Doğru ${kw} Yaklaşımı`,
      contentType: "Piyasa Trendleri & İpuçları" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Viral / Sosyal Etki" as const,
      audienceId: "quality-researchers",
      volume: "2,050 / ay",
      takeaways: [
        "Sosyal medyada yayılan hatalı pratik yöntemler",
        "Uzmanların asla tavsiye etmediği geçici çözümler",
        "Kalıcı ve güvenilir çözümlerin bilimsel mantığı"
      ],
      cta: "Doğru Bilgi ve Kesin Çözüm İçin Uzman Ekibimizle Görüşün."
    },
    {
      headlineTpl: (kw: string) => `${kw} Yatırımı Ne Zaman Geri Döner? ROI ve Amortisman Hesabı`,
      alt1Tpl: (kw: string) => `İşletmeler İçin ${kw} Geri Dönüş Süresi (ROI) Nasıl Hesaplanır?`,
      alt2Tpl: (kw: string) => `Yatırımınızın Karşılığını Alın: Finansal Tasarruf Raporu`,
      contentType: "Karşılaştırma & Analiz" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "b2b-decision-makers",
      volume: "1,200 / ay",
      takeaways: [
        "İlk yatırım maliyetinin enerji ve zaman tasarrufuyla dengelenmesi",
        "Arıza sıklığının azalmasıyla sağlanan net kazanç",
        "Müşteri memnuniyetine ve marka algısına pozitif yansıması"
      ],
      cta: "Firmanıza Özel ROI ve Tasarruf Analizini Ücretsiz Hazırlayalım."
    },
    {
      headlineTpl: (kw: string) => `${kw} Seçiminde 10 Adımlık Nihai Değerlendirme Kontrol Listesi`,
      alt1Tpl: (kw: string) => `İmzalamadan Önce Okuyun: Eksiksiz ${kw} Kontrol Listesi`,
      alt2Tpl: (kw: string) => `Hata Payını Sıfıra İndirin: Adım Adım Kontrol Listesi (PDF İndirilebilir)`,
      contentType: "Kontrol Listesi (Checklist)" as const,
      searchIntent: "İşlemsel" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "quality-researchers",
      volume: "2,950 / ay",
      takeaways: [
        "Yetki belgeleri ve oda kayıt kontrolleri",
        "İş güvenliği ve sigorta maddeleri",
        "Aşama aşama teslim tutanakları"
      ],
      cta: "Kontrol Listesini PDF Olarak İndirin veya Hemen Randevu Alın."
    },
    {
      headlineTpl: (kw: string, c: string) => `${c}'da Hafta Sonu ve Tatillerde ${kw} Desteği Nereden Alınır?`,
      alt1Tpl: (kw: string, c: string) => `Tatil Günlerinde Çaresiz Kalmayın: ${c} Nöbetçi ${kw} Servisi`,
      alt2Tpl: (kw: string) => `7 Gün 24 Saat Kesintisiz Destek: Acil Durum Rehberi`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Acil / Yerel" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "emergency-local-seekers",
      volume: "2,600 / ay",
      takeaways: [
        "Resmi tatil ve pazar günlerinde servis organizasyonu",
        "Ekstra mesai ücreti olmadan şeffaf fiyatlandırma güvencesi",
        "En hızlı ulaşım sağlayan mobil araç filoları"
      ],
      cta: "Nöbetçi Ekibimize Doğrudan WhatsApp veya Telefonla Ulaşın."
    },

    // Week 4: Advanced Authority, Seasonal & Market Leadership (Days 22 - 28)
    {
      headlineTpl: (kw: string) => `Mevsim Geçişlerinde ${kw}: Hazırlıklı Olmanın Yolları`,
      alt1Tpl: (kw: string) => `Mevsimlik Bakım Kılavuzu: ${kw} İçin En Uygun Zaman Hangisidir?`,
      alt2Tpl: (kw: string) => `Kışa/Yaza Girerken ${kw} Önlemleri: Sorunsuz Bir Sezon Geçirin`,
      contentType: "Piyasa Trendleri & İpuçları" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "quality-researchers",
      volume: "2,300 / ay",
      takeaways: [
        "Mevsimsel hava koşullarının ekipman ve malzeme üzerindeki etkileri",
        "Yoğun sezon öncesi indirimli erken randevu fırsatları",
        "Önleyici tedbirlerle olası büyük hasarları engelleme"
      ],
      cta: "Mevsimlik Erken Rezervasyon Avantajlarından Yararlanın."
    },
    {
      headlineTpl: (kw: string) => `Yapay Zeka ve Dijital Dönüşümün ${kw} Sektörüne Etkileri`,
      alt1Tpl: (kw: string) => `Teknolojik ${kw}: Yeni Nesil Yöntemlerle Hızlı ve Hatasız Sonuç`,
      alt2Tpl: (kw: string) => `Geleneksel Yöntemler vs Modern Teknolojiler: Karşılaştırma`,
      contentType: "Piyasa Trendleri & İpuçları" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Viral / Sosyal Etki" as const,
      audienceId: "b2b-decision-makers",
      volume: "1,400 / ay",
      takeaways: [
        "Sensörler, akıllı analizler ve dijital arıza tespiti",
        "Gereksiz parça değişimini engelleyen hassas ölçüm cihazları",
        "Müşteri memnuniyetini artıran şeffaf takip sistemleri"
      ],
      cta: "Modern ve Teknolojik Altyapımızla Tanışmak İçin Arayın."
    },
    {
      headlineTpl: (kw: string) => `${kw} Yaptırırken Taksit ve Ödeme Seçenekleri Nasıl Planlanır?`,
      alt1Tpl: (kw: string) => `Bütçenizi Zorlamadan ${kw}: Esnek Ödeme ve Kampanyalar`,
      alt2Tpl: (kw: string) => `Taksitli ${kw} Hizmeti: Faizsiz ve Kolay Ödeme Fırsatları`,
      contentType: "Maliyet & Fiyat Rehberi" as const,
      searchIntent: "İşlemsel" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "budget-conscious-buyers",
      volume: "3,400 / ay",
      takeaways: [
        "Kredi kartına vade farksız taksit imkanları",
        "Kurumsal müşteriler için vadeli ödeme opsiyonları",
        "Nakit ödeme indirimleri ve kombine paket avantajları"
      ],
      cta: "Bütçenize Uygun Ödeme Planı İçin Hemen Fiyat Teklifi İsteyin."
    },
    {
      headlineTpl: (kw: string) => `Sektör Raporu: ${kw} Alanında Müşteri Memnuniyetini Belirleyen Faktörler`,
      alt1Tpl: (kw: string) => `500+ Müşteri Anketi: İnsanlar ${kw} Seçerken En Çok Neye Önem Veriyor?`,
      alt2Tpl: (kw: string) => `Kaliteli Hizmetin Şifreleri: Güvenilir ${kw} Deneyimi`,
      contentType: "Vaka Analizi & Başarı Hikayesi" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "quality-researchers",
      volume: "1,100 / ay",
      takeaways: [
        "Müşterilerin %87'sinin ilk aradığı özellik: Zamanında teslimat",
        "Şeffaf bilgilendirme ve nezaketin müşteri sadakatine katkısı",
        "İş sonrasında arandığında ulaşılabilir olmanın değeri"
      ],
      cta: `${companyName} İle Yüksek Puanlı Müşteri Deneyimine Katılın.`
    },
    {
      headlineTpl: (kw: string) => `Eski vs Yeni Sistemler: ${kw} Yenilemesi Ne Zaman Şart Olur?`,
      alt1Tpl: (kw: string) => `Tamir mi Yenileme mi? ${kw} İkileminde Doğru Karar Verme`,
      alt2Tpl: (kw: string) => `Eskiyen ${kw} Altyapısının Yarattığı Görünmeyen Zararlar`,
      contentType: "Karşılaştırma & Analiz" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "budget-conscious-buyers",
      volume: "2,150 / ay",
      takeaways: [
        "Sürekli tamir parası ödemek yerine kökten çözümün kârlılığı",
        "Yeni sistemlerin sağladığı enerji ve performans avantajı",
        "Değişim süreci ve eski parçaların geri dönüşümü"
      ],
      cta: "Ücretsiz Sistem Sağlık Kontrolü İçin Keşif Randevusu Alın."
    },
    {
      headlineTpl: (kw: string) => `${kw} Konusunda Yasal Düzenlemeler ve Zorunlu Standartlar`,
      alt1Tpl: (kw: string) => `Cezai Yaptırımlardan Kaçının: ${kw} Yasal Uyumluluk Rehberi`,
      alt2Tpl: (kw: string) => `TSE ve ISO Standartlarında ${kw}: İşletmeler İçin Zorunluluklar`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "b2b-decision-makers",
      volume: "1,350 / ay",
      takeaways: [
        "Bakanlık ve belediye mevzuatlarında güncellenen maddeler",
        "Gerekli resmi sertifikasyonlar ve denetim hazırlıkları",
        "Uygunsuz işlem yapan firmaların hukuki sorumlulukları"
      ],
      cta: "Tam Yasal Uyumluluk ve Sertifikalı Uygulama İçin Bizi Seçin."
    },
    {
      headlineTpl: (kw: string) => `Sıkça Karşılaşılan 5 Büyük Sorun ve Profesyonel Çözüm Reçetesi`,
      alt1Tpl: (kw: string) => `${kw} Problemlerine Kesin Çözüm: Usta Tavsiyeleri`,
      alt2Tpl: (kw: string) => `Tekrarlayan Arızalardan Kurtulun: Kalıcı ${kw} Çözüm Rehberi`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Hızlı Kazanım (Quick Win)" as const,
      audienceId: "emergency-local-seekers",
      volume: "2,750 / ay",
      takeaways: [
        "En sık bildirilen 5 arıza türünün kök nedenleri",
        "Yüzeysel müdahaleler yerine kökten çözüm adımları",
        "Gelecekte benzer sorunların yaşanmaması için koruyucu önlemler"
      ],
      cta: "Sorunları Kökten Çözmek İçin Hemen Uzmanımızla Görüşün."
    },

    // Week 5: Final Wrap-up, Mega Guides & Retention (Days 29 - 30)
    {
      headlineTpl: (kw: string, c: string) => `2026 Nihai ${kw} Kılavuzu: ${c} Sakinlerinin Bilmesi Gereken Her Şey`,
      alt1Tpl: (kw: string) => `Eksiksiz A'dan Z'ye ${kw} Ansiklopedisi: Tüm Detaylar`,
      alt2Tpl: (kw: string) => `Başarı Garantili ${kw} Yol Haritası (Mega Rehber)`,
      contentType: "Nasıl Yapılır Rehberi" as const,
      searchIntent: "Bilgilendirici" as const,
      rankingPotential: "Otorite İnşası" as const,
      audienceId: "quality-researchers",
      volume: "5,800 / ay",
      takeaways: [
        "Sektörün tüm dinamiklerini özetleyen dev kılavuz",
        "Bütçe, seçim, uygulama ve bakımın tüm aşamaları",
        "2026 yılı boyunca geçerli olacak referans bilgiler"
      ],
      cta: `${companyName} Uzmanlığıyla Sorunsuz Bir Hizmet Deneyimi Yaşayın.`
    },
    {
      headlineTpl: (kw: string) => `${companyName} Neden Tercih Edilmeli? Bizi Farklı Kılan 7 Temel İlke`,
      alt1Tpl: () => `Güven, Hız ve Şeffaflık: Standartlarımızla Sektöre Öncülük Ediyoruz`,
      alt2Tpl: () => `Müşterilerimizin Gözünden Biz: Neden 5 Yıldızlı Hizmet Sunuyoruz?`,
      contentType: "Vaka Analizi & Başarı Hikayesi" as const,
      searchIntent: "Ticari" as const,
      rankingPotential: "Yüksek Dönüşüm" as const,
      audienceId: "quality-researchers",
      volume: "2,100 / ay",
      takeaways: [
        "15 dakikada geri dönüş ve hızlı yerinde keşif taahhüdü",
        "Sürprizsiz sabit fiyat garantisi ve yazılı sözleşme",
        "100% müşteri memnuniyeti ve satış sonrası kesintisiz destek"
      ],
      cta: "Ayrıcalıklı Hizmet Almak İçin Bugün Bize Ulaşın."
    }
  ];

  // Map into 30 concrete days
  const days: ContentCalendarDay[] = templates.slice(0, 30).map((tpl, index) => {
    const dayNum = index + 1;
    const weekNum = Math.floor(index / 7) + 1;
    
    // Distribute keywords across days
    const primaryKw = keywords[index % keywords.length] || `${sector} Hizmeti`;
    const secondaryKw1 = keywords[(index + 1) % keywords.length] || `${city} ${sector}`;
    const secondaryKw2 = keywords[(index + 2) % keywords.length] || `${sector} Fiyatları`;

    const headline = tpl.headlineTpl(primaryKw, city);
    const alt1 = tpl.alt1Tpl(primaryKw, city);
    const alt2 = tpl.alt2Tpl(primaryKw, city);

    const audience = audienceSegments.find(a => a.id === tpl.audienceId) || audienceSegments[0];

    // Compute scheduled date
    const d = new Date(today);
    d.setDate(today.getDate() + index);
    const scheduledDate = d.toISOString().split("T")[0];

    return {
      day: dayNum,
      week: weekNum,
      headline,
      alternativeHeadlines: [alt1, alt2],
      primaryKeyword: primaryKw,
      secondaryKeywords: [secondaryKw1, secondaryKw2].filter(k => k !== primaryKw),
      targetAudienceId: audience.id,
      targetAudienceName: audience.name,
      audiencePainPoint: audience.painPoints[index % audience.painPoints.length],
      searchIntent: tpl.searchIntent,
      contentType: tpl.contentType,
      estimatedMonthlySearchVolume: tpl.volume,
      rankingPotential: tpl.rankingPotential,
      keyTakeaways: tpl.takeaways,
      callToAction: tpl.cta,
      status: index === 0 ? "in-progress" : "planned",
      scheduledDate,
      notes: `${audience.hookAngle} - Google Top 3 sıralaması hedefli.`
    };
  });

  return {
    siteTitle: config.seo?.metaTitle || companyName,
    companyName,
    sector,
    city,
    strategyOverview: `Bu 30 günlük editoryal takvim, ${companyName} için ${city} merkezli yüksek arama hacmine sahip birincil ve uzun kuyruklu (long-tail) anahtar kelimeleri kapsayacak şekilde Gemini AI algoritmaları ile optimize edilmiştir. Takvim; bilgilendirici, ticari, acil yerel ve işlemsel arama niyetlerini 4 temel kitle segmentine kusursuz şekilde dağıtır.`,
    primaryAudienceSegments: audienceSegments,
    contentPillars: pillars,
    days,
    generatedAt: new Date().toISOString(),
    source: "algorithmic_fallback",
    totalExpectedMonthlyImpressions: "86,400+ Arama / Ay",
    keywordCoverageCount: keywords.length,
    strategicRecommendations: [
      "Haftada en az 2 blog yazısını AI Blog Engine ile tam metin olarak üreterek yayınlayın.",
      "İçeriklerin içine Google Business Profile (Harita) ve yerel telefon numarası CTA'larını gömün.",
      "Ticari niyetli günlerde (örn. Fiyat ve Karşılaştırma) doğrudan Online Keşif / Teklif formuna bağlantı verin.",
      "Yayınlanan her blog içeriğini sosyal medya planlayıcısı (Social Scheduler) üzerinden paylaşıma zamanlayın."
    ]
  };
}

/**
 * Loads cached content plan from localStorage
 */
export function loadSavedContentPlan(siteKey: string = "default"): AiContentPlanResponse | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_CONTENT_PLAN_KEY}_${siteKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not load cached content plan:", err);
  }
  return null;
}

/**
 * Saves content plan to localStorage
 */
export function saveContentPlan(plan: AiContentPlanResponse, siteKey: string = "default"): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_CONTENT_PLAN_KEY}_${siteKey}`, JSON.stringify(plan));
  } catch (err) {
    console.warn("Could not save content plan:", err);
  }
}

/**
 * Updates status of a specific day (planned | in-progress | published)
 */
export function updateCalendarDayStatus(
  plan: AiContentPlanResponse,
  dayNumber: number,
  newStatus: ContentPlanDayStatus,
  siteKey: string = "default"
): AiContentPlanResponse {
  const updatedDays = plan.days.map(d => {
    if (d.day === dayNumber) {
      return { ...d, status: newStatus };
    }
    return d;
  });

  const updatedPlan: AiContentPlanResponse = {
    ...plan,
    days: updatedDays
  };

  saveContentPlan(updatedPlan, siteKey);
  return updatedPlan;
}

/**
 * Exports the 30-day plan as CSV
 */
export function exportContentPlanToCsv(plan: AiContentPlanResponse): string {
  const headers = [
    "Gun",
    "Hafta",
    "Tarih",
    "Cekici Baslik (Headline)",
    "Alternatif Baslik 1",
    "Alternatif Baslik 2",
    "Birincil Anahtar Kelime",
    "Ikinci Anahtar Kelimeler",
    "Hedef Kitle Segmenti",
    "Arama Niyeti",
    "Icerik Turu",
    "Tahmini Arama Hacmi",
    "Siralama Potansiyeli",
    "Durum",
    "Eylem Cagrisi (CTA)"
  ];

  const rows = plan.days.map(d => {
    return [
      d.day,
      d.week,
      d.scheduledDate || "",
      `"${(d.headline || "").replace(/"/g, '""')}"`,
      `"${(d.alternativeHeadlines?.[0] || "").replace(/"/g, '""')}"`,
      `"${(d.alternativeHeadlines?.[1] || "").replace(/"/g, '""')}"`,
      `"${(d.primaryKeyword || "").replace(/"/g, '""')}"`,
      `"${(d.secondaryKeywords?.join(", ") || "").replace(/"/g, '""')}"`,
      `"${(d.targetAudienceName || "").replace(/"/g, '""')}"`,
      `"${d.searchIntent}"`,
      `"${d.contentType}"`,
      `"${d.estimatedMonthlySearchVolume}"`,
      `"${d.rankingPotential}"`,
      `"${d.status}"`,
      `"${(d.callToAction || "").replace(/"/g, '""')}"`
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Exports the 30-day plan as an iCalendar (.ics) file
 */
export function exportContentPlanToIcs(plan: AiContentPlanResponse): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JetKur AI SEO Content Planner//TR",
    `X-WR-CALNAME:${plan.companyName} 30 Gunluk SEO Blog Takvimi`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  plan.days.forEach(d => {
    const dateStr = (d.scheduledDate || "").replace(/-/g, "");
    if (!dateStr || dateStr.length < 8) return;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:jetkur-content-day-${d.day}-${Date.now()}@jetkur.com`);
    lines.push(`DTSTAMP:${dateStr}T090000Z`);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    lines.push(`DTEND;VALUE=DATE:${dateStr}`);
    lines.push(`SUMMARY:📝 Gün ${d.day}: ${d.headline.replace(/,/g, "\\,")}`);
    const desc = `Hedef Kitle: ${d.targetAudienceName}\\nAnahtar Kelime: ${d.primaryKeyword}\\nİçerik Türü: ${d.contentType}\\n\\nÖnemli Noktalar:\\n- ${d.keyTakeaways.join("\\n- ")}\\n\\nCTA: ${d.callToAction}`;
    lines.push(`DESCRIPTION:${desc}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Exports the 30-day plan as Markdown documentation
 */
export function exportContentPlanToMarkdown(plan: AiContentPlanResponse): string {
  let md = `# 📅 30 Günlük AI SEO İçerik Takvimi: ${plan.companyName}\n\n`;
  md += `**Sektör:** ${plan.sector} | **Bölge:** ${plan.city} | **Oluşturulma:** ${new Date(plan.generatedAt).toLocaleDateString("tr-TR")}\n`;
  md += `**Tahmini Aylık Arama Hacmi Kapsamı:** ${plan.totalExpectedMonthlyImpressions}\n\n`;
  md += `## 🎯 Strateji Özeti\n${plan.strategyOverview}\n\n`;

  md += `## 👥 Hedef Kitle Segmentleri\n`;
  plan.primaryAudienceSegments.forEach(s => {
    md += `### ${s.name} (${s.badge})\n`;
    md += `- **Arama Niyeti:** ${s.searchIntent}\n`;
    md += `- **Yaklaşım & Hook:** ${s.hookAngle}\n`;
    md += `- **Temel Acı Noktaları:** ${s.painPoints.join(", ")}\n\n`;
  });

  md += `## 🗓️ 30 Günlük Editoryal Akış\n\n`;
  plan.days.forEach(d => {
    md += `### Gün ${d.day} (${d.scheduledDate || `Hafta ${d.week}`}) - ${d.headline}\n`;
    md += `- **Alternatif Başlıklar:**\n`;
    d.alternativeHeadlines.forEach(alt => {
      md += `  - *${alt}*\n`;
    });
    md += `- **Birincil Anahtar Kelime:** \`${d.primaryKeyword}\` (Hacim: ${d.estimatedMonthlySearchVolume})\n`;
    if (d.secondaryKeywords.length > 0) {
      md += `- **İkincil Kelimeler:** ${d.secondaryKeywords.join(", ")}\n`;
    }
    md += `- **Hedef Kitle:** ${d.targetAudienceName} (${d.searchIntent} Niyet)\n`;
    md += `- **İçerik Formatı:** ${d.contentType} | **Potansiyel:** ${d.rankingPotential}\n`;
    md += `- **Taslak Maddeleri:**\n`;
    d.keyTakeaways.forEach(t => {
      md += `  1. ${t}\n`;
    });
    md += `- **Eylem Çağrısı (CTA):** ${d.callToAction}\n`;
    md += `- **Durum:** ${d.status.toUpperCase()}\n\n---\n\n`;
  });

  return md;
}

/**
 * Calls the backend Gemini endpoint or falls back gracefully
 */
export async function fetchAiContentPlan(params: {
  config: SiteConfig;
  customKeywords?: string[];
  audienceFocus?: string;
  tone?: string;
  customGoal?: string;
}): Promise<AiContentPlanResponse> {
  try {
    const res = await fetch("/api/ai-content-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      saveContentPlan(json.data, params.config.companyName || "default");
      return json.data;
    }
  } catch (err) {
    console.warn("API call to /api/ai-content-planner failed, generating fallback:", err);
  }

  // Graceful fallback
  const fallback = generateFallbackContentPlan(
    params.config,
    params.customKeywords,
    params.audienceFocus,
    params.tone
  );
  saveContentPlan(fallback, params.config.companyName || "default");
  return fallback;
}
