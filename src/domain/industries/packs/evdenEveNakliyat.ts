/**
 * JetKur Canonical Industry Pack: Evden Eve Nakliyat (Sprint 05)
 *
 * Sektör: Taşımacılık, Lojistik, Nakliyat & Depolama
 * Primary Intent: Fiyat teklifi alma, asansörlü taşıma, eşya sigortası
 */

import { IndustryPack } from "../types";

export const evdenEveNakliyatIndustryPack: IndustryPack = {
  id: "pack-evden-eve-nakliyat-tr",
  slug: "evden-eve-nakliyat",
  name: "Asansörlü & Sigortalı Evden Eve Nakliyat",
  category: "transport_logistics",
  version: "1.0.0",
  status: "ACTIVE",
  description: "Evden eve nakliye, ofis taşıma, asansörlü taşımacılık ve eşya depolama şirketleri için sektör başlangıç paketi",
  aliases: [
    "nakliyat",
    "evden eve nakliyat",
    "asansorlu nakliyat",
    "sehirlerarasi nakliyat",
    "ofis tasima",
    "esya depolama",
    "ev tasima",
    "nakliye",
    "evden eve",
    "evden eve nakliye",
  ],
  defaultServices: [
    {
      title: "Şehir İçi Sigortalı Ev Taşıma",
      slug: "sehir-ici-ev-tasima",
      shortDescription: "Aynı gün içinde profesyonel ambalajlama ve montaj dahil anahtar teslim daire taşımacılığı.",
      icon: "Home",
      features: ["Balonlu naylon ambalaj", "Uzman marangoz desteği", "Askılı tekstil kolileri", "Aynı gün teslim"],
    },
    {
      title: "Şehirlerarası Tarifeli Nakliyat",
      slug: "sehirlerarasi-nakliyat",
      shortDescription: "Kapalı çelik kasa araçlarla Türkiye'nin 81 iline sigortalı ve sözleşmeli ev nakliyesi.",
      icon: "Truck",
      features: ["81 il güzergahı", "Emtia nakliyat sigortası", "GPS araç takibi", "Zamanında teslimat garantisi"],
    },
    {
      title: "Modüler Asansörlü Eşya Taşımacılığı",
      slug: "asansorlu-tasima",
      shortDescription: "Dar merdiven boşluklarına gerek kalmadan 15. kata kadar dış cepheden güvenli aktarım.",
      icon: "ChevronsUp",
      features: ["15. kata erişim", "Sıfır bina hasarı", "Yarı yarıya hızlı taşıma", "Büyük mobilyalara uygun"],
    },
    {
      title: "Kurumsal Ofis & Büro Nakliyesi",
      slug: "ofis-buro-nakliyesi",
      shortDescription: "Şirket arşivi, elektronik cihazlar ve çalışma masalarının numaralandırılarak taşınması.",
      icon: "Building2",
      features: ["Numaralı kutulama", "Server & PC güvenliği", "Hafta sonu taşıma", "İş kaybını önleme"],
    },
  ],
  defaultFaqs: [
    {
      question: "Evden eve nakliyat fiyatı nasıl belirlenir?",
      answer: "Fiyatlandırma; evdeki oda sayısı (2+1, 3+1), kat durumu, bina asansörü veya modüler dış asansör ihtiyacı ve taşınacak mesafe dikkate alınarak şeffaf biçimde belirlenir.",
      category: "Fiyat",
    },
    {
      question: "Mobilyaları siz mi söküp monte ediyorsunuz?",
      answer: "Evet, ekibimizdeki sertifikalı mobilya ustası gardırop, yatak başlığı, masa ve üniteleri özenle de-monte eder ve yeni evinizde dilediğiniz odaya eksiksiz kurar.",
      category: "Marangoz",
    },
    {
      question: "Eşyalar taşıma sırasında sigortalı mı?",
      answer: "Evet, tüm taşıma operasyonlarımız kurumsal nakliyat sigortası güvencesindedir. Beklenmedik hasar veya kaza durumlarında zararınız eksiksiz karşılanır.",
      category: "Sigorta",
    },
    {
      question: "Taşınma günü kolilemeyi kim yapıyor?",
      answer: "Dilerseniz anahtar teslim paketimizde mutfak cam eşyaları, giysiler ve tüm kırılacaklar dahil her şeyi özel ambalaj malzemeleriyle ekibimiz paketler.",
      category: "Paketleme",
    },
  ],
  contentDefaults: {
    heroBadges: ["Sigortalı & Sözleşmeli", "Kendi Marangoz Kadromuz", "15. Kata Kadar Asansör"],
    heroHeadlines: [
      "Yeni Yuvanıza Güvenle, Çizilmeden Taşının.",
      "Profesyonel ve Asansörlü Evden Eve Nakliyat",
    ],
    heroSubtitles: [
      "Eşyalarınız balonlu naylonlarla tek tek paketlenir, uzman marangozumuzca kurulur. Stresten uzak, güvenli nakliyat deneyimi.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, 15 yılı aşkın süredir modern araç filosu ve güler yüzlü profesyonel ekibiyle {{city}} genelinde binlerce aileyi yeni yuvalarına güvenle taşımıştır.",
    whyUsItems: [
      {
        title: "Kapsamlı Eşya Sigortası",
        description: "Yola çıkmadan önce yapılan poliçeyle eşyalarınız %100 güvence altında.",
        icon: "ShieldCheck",
      },
      {
        title: "Usta Marangozluk Hizmeti",
        description: "Dolap ve mobilyalarınız uzman marangozumuz tarafından kurulur.",
        icon: "Wrench",
      },
      {
        title: "Dış Cephe Asansörü",
        description: "Yüksek katlara merdivenleri aşındırmadan balkondan kolayca taşıma.",
        icon: "ChevronsUp",
      },
    ],
    defaultStats: [
      { label: "Taşınan Ev", value: "9.200+" },
      { label: "Yıllık Tecrübe", value: "15+" },
      { label: "Memnuniyet", value: "%99" },
      { label: "Özmal Araç Filosu", value: "12+" },
    ],
    primaryCta: {
      text: "Ücretsiz Fiyat Teklifi Al",
      targetAction: "form",
    },
    secondaryCta: {
      text: "Ekspertiz Hattını Ara",
      targetAction: "phone",
    },
  },
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "professional movers carrying wrapped furniture into moving truck outside modern residential apartment sunny day",
      fallbackUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "Evden Eve Asansörlü Nakliyat",
    },
    {
      key: "service-packing",
      searchPrompt: "moving company workers wrapping wooden cabinet with bubble wrap and tape carefully",
      fallbackUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Hassas ambalajlama ve paketleme",
    },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} Asansörlü Evden Eve Nakliyat",
    descriptionTemplate: "{{city}} evden eve nakliyat firması. Sigortalı, marangozlu ve asansörlü profesyonel ev taşıma hizmeti. En uygun nakliye fiyatı için hemen ücretsiz teklif alın.",
    defaultKeywords: ["evden eve nakliyat", "ev taşıma", "asansörlü nakliyat", "şehirlerarası nakliyat", "nakliye firması", "ofis taşıma"],
    schemaOrgType: "MovingCompany",
  },
  recommendedSections: [
    { type: "hero", order: 0, enabled: true, recommendedVariant: "urgent-callout" },
    { type: "services", order: 1, enabled: true, recommendedVariant: "grid-4" },
    { type: "whyUs", order: 2, enabled: true, recommendedVariant: "cards-3" },
    { type: "about", order: 3, enabled: true, recommendedVariant: "side-by-side" },
    { type: "testimonials", order: 4, enabled: true, recommendedVariant: "cards-grid" },
    { type: "faqs", order: 5, enabled: true, recommendedVariant: "accordion" },
    { type: "contact", order: 6, enabled: true, recommendedVariant: "formal-consultation-form" },
  ],
  schemaHints: {
    businessType: "MovingCompany",
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Su 08:00-20:00",
    areaServedType: "City",
  },
};
