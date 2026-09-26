/**
 * JetKur Canonical Industry Pack: Kombi & Klima Servisi (Sprint 05)
 *
 * Sektör: İklimlendirme, Kombi Bakımı, Klima Montajı
 * Primary Intent: Servis kaydı açma, arıza tamiri, acil usta çağırma
 */

import { IndustryPack } from "../types";

export const kombiKlimaServisiIndustryPack: IndustryPack = {
  id: "pack-kombi-klima-tr",
  slug: "kombi-klima-servisi",
  name: "Yetkili Kombi & Klima Servisi, Petek Temizliği",
  category: "technical_repairs",
  version: "1.0.0",
  status: "ACTIVE",
  description: "Kombi arıza onarımı, yıllık periyodik bakım, petek temizliği ve klima montajı yapan teknik servisler için sektör paketi",
  aliases: [
    "kombi servisi",
    "klima servisi",
    "kombi tamiri",
    "kombi bakimi",
    "petek temizligi",
    "klima montaji",
    "kombi kart tamiri",
    "klima gaz dolumu",
    "kombi ustasi",
    "iklimlendirme servisi",
    "kombi bakımı",
    "petek temizliği",
    "klima montajı",
  ],
  defaultServices: [
    {
      title: "Kombi Arıza Tamiri & Elektronik Kart Onarımı",
      slug: "kombi-ariza-tamiri",
      shortDescription: "Ateşleme, su basınç düşmesi, pompa arızaları ve elektronik kart yanmalarında orijinal parça ile çözüm.",
      icon: "Flame",
      features: ["Orijinal yedek parça", "1 yıl yazılı garanti", "Aynı gün adreste servis", "Kart test cihazı"],
    },
    {
      title: "Yıllık Periyodik Kombi Bakımı",
      slug: "periyodik-kombi-bakimi",
      shortDescription: "Brülör temizliği, genleşme tankı hava kontrolü, filtre temizliği ile %30 doğalgaz tasarrufu.",
      icon: "Gauge",
      features: ["Gaz kaçak kontrolü", "Yanma odası temizliği", "Baca çekiş testi", "Tasarruf ayarı"],
    },
    {
      title: "Makineli İlaçlı Petek Temizliği",
      slug: "makineli-petek-temizligi",
      shortDescription: "Çift yönlü özel yıkama makinesi ve koruyucu kimyasal solüsyonla ısınmayan peteklere kesin son.",
      icon: "ShieldCheck",
      features: ["Kombiden sökmeden", "Çift yönlü yıkama", "Tesisat koruyucu ilaç", "Eşit ısı dağılımı"],
    },
    {
      title: "Klima Montajı, Bakım & Gaz Dolumu",
      slug: "klima-montaj-gaz-dolumu",
      shortDescription: "İnverter klima montajı, de-montaj, R410/R32 gaz basımı ve antibakteriyel filtre dezenfeksiyonu.",
      icon: "Fan",
      features: ["Vakumlu montaj", "Gaz kaçak testi", "Bakteri önleyici sprey", "Verimli soğutma/ısıtma"],
    },
  ],
  defaultFaqs: [
    {
      question: "Değiştirilen yedek parçaların garantisi var mı?",
      answer: "Evet, servisimiz tarafından takılan tüm sıfır orijinal yedek parçalar ve işçiliğimiz 1 yıl resmi garanti belgemiz altındadır.",
      category: "Garanti",
    },
    {
      question: "Arıza tespit ücreti alıyor musunuz?",
      answer: "Cihazınızın arızası yerinde teknisyenimizce tespit edilir; tarafınıza bildirilen fiyat onaylandığında tespit bedeli toplam tutardan düşülür.",
      category: "Ücretlendirme",
    },
    {
      question: "Petek temizliği evimi kirletir mi?",
      answer: "Hayır, yıkama makinesi yalnızca banyo havlupanından sisteme bağlandığı için evinizin hiçbir odasında kırma veya kirlenme yaşanmaz.",
      category: "Petek Temizliği",
    },
    {
      question: "Kombi bakımı ne sıklıkla yapılmalıdır?",
      answer: "Güvenliğiniz ve yüksek doğalgaz faturalarından korunmak amacıyla kış sezonu başlamadan önce yılda bir kez yapılması tavsiye edilir.",
      category: "Periyodik Bakım",
    },
  ],
  contentDefaults: {
    heroBadges: ["1 Yıl Parça Garantisi", "Aynı Gün Mobil Servis", "Orijinal Yedek Parça"],
    heroHeadlines: [
      "Kombiniz Arıza mı Yaptı? Aynı Gün Çözüyoruz.",
      "Garantili Kombi Bakımı, Arıza Tamiri ve Petek Temizliği",
    ],
    heroSubtitles: [
      "Yetkili belgeli teknisyenlerimizle evinizi ısıtıyoruz. Orijinal parça garantisi ve %30'a varan doğalgaz tasarrufu.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, 15 yılı aşkın teknik servis deneyimi ve sertifikalı ustalarıyla {{city}} genelinde tüm marka kombi ve klimalar için garantili bakım-onarım hizmeti sağlamaktadır.",
    whyUsItems: [
      {
        title: "1 Yıl Resmi Garanti",
        description: "Değişen tüm parçalarda kaşeli servis garanti formu sunuyoruz.",
        icon: "Award",
      },
      {
        title: "Hızlı Mobil Servis",
        description: "Soğukta kalmamanız için çağrınızdan itibaren saatler içinde kapınızdayız.",
        icon: "Clock",
      },
      {
        title: "Şeffaf Fiyat Onayı",
        description: "İşlem yapmadan önce yapılacakları ve net masrafı onayınıza sunuyoruz.",
        icon: "ShieldCheck",
      },
    ],
    defaultStats: [
      { label: "Tamir Edilen Kombi", value: "24.000+" },
      { label: "Yıllık Tecrübe", value: "15+" },
      { label: "Usta Kadrosu", value: "10+" },
      { label: "Müşteri Memnuniyeti", value: "%99.2" },
    ],
    primaryCta: {
      text: "Servis Kaydı Oluştur",
      targetAction: "form",
    },
    secondaryCta: {
      text: "Acil Usta Çağır: Hemen Ara",
      targetAction: "phone",
    },
  },
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "hvac service technician checking modern wall mounted boiler diagnostics with tools in clean domestic kitchen",
      fallbackUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "Yetkili Kombi ve Klima Servisi",
    },
    {
      key: "service-radiator",
      searchPrompt: "plumber cleaning domestic heating radiator with modern flushing machine pipe connection",
      fallbackUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Makineli Petek Temizliği",
    },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} Kombi & Klima Servisi, Petek Temizliği",
    descriptionTemplate: "{{city}} kombi tamiri, yıllık kombi bakımı ve ilaçlı petek temizliği servisi. 1 yıl parça garantisi ve aynı gün servis için hemen arayın.",
    defaultKeywords: ["kombi servisi", "kombi tamiri", "kombi bakımı", "petek temizliği", "klima montajı", "klima gaz dolumu"],
    schemaOrgType: "HVACBusiness",
  },
  recommendedSections: [
    { type: "hero", order: 0, enabled: true, recommendedVariant: "urgent-callout" },
    { type: "services", order: 1, enabled: true, recommendedVariant: "grid-4" },
    { type: "whyUs", order: 2, enabled: true, recommendedVariant: "cards-3" },
    { type: "about", order: 3, enabled: true, recommendedVariant: "side-by-side" },
    { type: "testimonials", order: 4, enabled: true, recommendedVariant: "cards-grid" },
    { type: "faqs", order: 5, enabled: true, recommendedVariant: "accordion" },
    { type: "contact", order: 6, enabled: true, recommendedVariant: "emergency-contact-strip" },
  ],
  schemaHints: {
    businessType: "HVACBusiness",
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Su 08:00-22:00",
    areaServedType: "City",
  },
};
