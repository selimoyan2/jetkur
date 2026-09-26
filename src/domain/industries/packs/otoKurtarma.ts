/**
 * JetKur Canonical Industry Pack: Oto Kurtarma & Yol Yardım (Sprint 05)
 *
 * Sektör: Otomotiv, Çekici, Yol Yardım
 * Primary Intent: Hızlı arama, konum gönderme, acil servis
 */

import { IndustryPack } from "../types";

export const otoKurtarmaIndustryPack: IndustryPack = {
  id: "pack-oto-kurtarma-tr",
  slug: "oto-kurtarma",
  name: "Oto Kurtarma, Çekici & Yol Yardım",
  category: "automotive",
  version: "1.0.0",
  status: "ACTIVE",
  description: "7/24 oto kurtarıcı, çekici, akü takviye ve lastik yol yardımı sunan esnaf ve işletmeler için sektör başlangıç paketi",
  aliases: [
    "oto kurtarma",
    "oto cekici",
    "cekici",
    "yol yardim",
    "aku takviye",
    "oto kurtarici",
    "arac cekici",
    "acil cekici",
    "oto kurtarıcı",
    "çekici",
    "yol yardım",
    "akü takviye",
    "araç çekici",
    "en yakin cekici",
  ],
  defaultServices: [
    {
      title: "Oto Çekici & Araç Kurtarıcı",
      slug: "oto-cekici-kurtarici",
      shortDescription: "Kaza ve arıza anında hızlı, kaskolu ve hasarsız araç çekici transferi.",
      icon: "Truck",
      priceHint: "Mesafe ve araca göre şeffaf fiyat",
      features: ["Kaskolu taşıma", "Hasarsız yükleme", "7/24 nöbetçi araç", "Şehir içi ve dışı"],
    },
    {
      title: "Akü Takviye & Yerinde Değişim",
      slug: "aku-takviye-degisim",
      shortDescription: "Yerinde akü ölçümü, profesyonel takviye kablosu ile çalıştırma ve garantili akü satışı.",
      icon: "BatteryCharging",
      priceHint: "Ekonomik servis bedeli",
      features: ["Hızlı akü ölçümü", "12V/24V uyumlu", "Orijinal sıfır akü", "Yerinde montaj"],
    },
    {
      title: "Mobil Lastik Yol Yardımı",
      slug: "lastik-yol-yardimi",
      shortDescription: "Patlak lastik tamiri, yerinde stepne değişimi ve hava basınç takviyesi.",
      icon: "Disc",
      priceHint: "Sabit servis ücreti",
      features: ["Stepne değişimi", "Fitil tamiri", "Bijon sökme", "Yol emniyet tedbiri"],
    },
    {
      title: "Şehirlerarası Çoklu & Tekli Araç Taşıma",
      slug: "sehirlerarasi-arac-tasima",
      shortDescription: "Türkiye genelinde sigortalı, çoklu veya özel tekli kapalı araç transferi.",
      icon: "Navigation",
      priceHint: "Özel km tarifesi",
      features: ["81 ile teslimat", "Tam kasko teminatı", "Canlı konum takibi", "Zamanında teslim"],
    },
  ],
  defaultFaqs: [
    {
      question: "Çekici ücreti nasıl hesaplanır?",
      answer: "Çekici ücretleri taşınacak aracın cinsi, bulunduğu lokasyon ve ulaştırılacağı mesafe baz alınarak en şeffaf şekilde işlem öncesinde tarafınıza bildirilir.",
      category: "Fiyatlandırma",
    },
    {
      question: "Aracım çekilirken sigortalı mı?",
      answer: "Evet, tüm yükleme, taşıma ve indirme işlemlerimiz anlaşmalı taşıyıcı kasko sigortamız kapsamında %100 güvence altındadır.",
      category: "Güvence",
    },
    {
      question: "Ne kadar sürede yanıma gelirsiniz?",
      answer: "Bölgenizdeki gezici kurtarıcı filomuz sayesinde trafik yoğunluğuna bağlı olarak ortalama 15-25 dakika içerisinde konumunuza ulaşıyoruz.",
      category: "Ulaşım Süresi",
    },
    {
      question: "Gece veya resmi tatillerde hizmet veriyor musunuz?",
      answer: "Evet, servisimiz haftanın 7 günü, resmi tatiller ve bayramlar dahil 24 saat kesintisiz olarak nöbetçi ekiplerimizle hizmet vermektedir.",
      category: "Çalışma Saatleri",
    },
  ],
  contentDefaults: {
    heroBadges: ["7/24 Acil Yol Yardım", "En Yakın Çekici 15 Dk", "%100 Kaskolu Taşıma"],
    heroHeadlines: [
      "Yolda mı Kaldınız? 15 Dakikada Yanınızdayız.",
      "7/24 Güvenilir, Hızlı ve Kaskolu Oto Çekici Hizmeti",
    ],
    heroSubtitles: [
      "Kaza veya arıza durumunda en yakın profesyonel kurtarıcımız dakikalar içinde adresinizde. Şeffaf fiyat, hasarsız taşıma garantisi.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, 10 yılı aşkın tecrübesi ve modern araç filosuyla {{city}} ve çevresinde yolda kalan sürücülere 7 gün 24 saat güvenilir, sigortalı oto kurtarma desteği sağlamaktadır.",
    whyUsItems: [
      {
        title: "15 Dakikada Konumda",
        description: "Şehrin stratejik noktalarındaki nöbetçi araçlarımızla en kısa sürede yanınızdayız.",
        icon: "Clock",
      },
      {
        title: "Tam Kaskolu Güvence",
        description: "Aracınız vinç veya kayar kasa ile taşınırken tüm risklere karşı sigortalıdır.",
        icon: "ShieldCheck",
      },
      {
        title: "Sürprizsiz Sabit Fiyat",
        description: "Telefonda konuştuğumuz net fiyat dışında hiçbir ek ücret talep etmiyoruz.",
        icon: "Award",
      },
    ],
    defaultStats: [
      { label: "Varış Süresi", value: "15 Dk" },
      { label: "Yıllık Tecrübe", value: "10+" },
      { label: "Kurtarılan Araç", value: "12.000+" },
      { label: "Müşteri Memnuniyeti", value: "%100" },
    ],
    primaryCta: {
      text: "Hemen Çekici Çağır",
      targetAction: "phone",
    },
    secondaryCta: {
      text: "WhatsApp'tan Konum Gönder",
      targetAction: "whatsapp",
    },
  },
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "modern yellow flatbed tow truck transporting car on highway emergency roadside assistance clean dynamic photography",
      fallbackUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "7/24 Acil Oto Çekici Hizmeti",
    },
    {
      key: "service-recovery",
      searchPrompt: "tow truck operator securing car wheel with heavy duty straps professional roadside assistance",
      fallbackUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Güvenli araç yükleme ve çekici desteği",
    },
    {
      key: "service-battery",
      searchPrompt: "automotive technician using jumper cables to start a car battery on the road",
      fallbackUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Yerinde akü takviye ve kontrol",
    },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} 7/24 Acil Oto Çekici & Yol Yardım",
    descriptionTemplate: "{{city}} ve çevresinde 15 dakikada en yakın oto çekici ve kurtarıcı hizmeti. Kaskolu, güvenilir ve sabit fiyat garantili yol yardım için hemen arayın.",
    defaultKeywords: ["oto çekici", "oto kurtarma", "yol yardım", "en yakın çekici", "akü takviye", "oto kurtarıcı"],
    schemaOrgType: "AutoRepair",
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
    businessType: "AutoRepair",
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Su 00:00-23:59",
    areaServedType: "City",
  },
};
