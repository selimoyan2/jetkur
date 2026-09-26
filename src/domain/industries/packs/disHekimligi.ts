/**
 * JetKur Canonical Industry Pack: Diş Hekimliği & Klinik (Sprint 05)
 *
 * Sektör: Diş Sağlığı, Poliklinik, Estetik Diş Hekimliği
 * Primary Intent: Randevu alma, tedavi bilgilendirmesi, hekim güveni
 */

import { IndustryPack } from "../types";

export const disHekimligiIndustryPack: IndustryPack = {
  id: "pack-dis-hekimligi-tr",
  slug: "dis-hekimligi",
  name: "Diş Hekimliği, İmplant & Estetik Gülüş Kliniği",
  category: "health_wellness",
  version: "1.0.0",
  status: "ACTIVE",
  description: "Modern diş klinikleri, implantoloji ve estetik gülüş tasarımı merkezleri için sektör başlangıç paketi",
  aliases: [
    "dis hekimi",
    "dis klinigi",
    "dis hekimligi",
    "implant",
    "dis poliklinigi",
    "ortodonti",
    "dis beyazlatma",
    "zirkonyum",
    "estetik dis",
    "diş hekimi",
    "diş kliniği",
    "diş polikliniği",
    "gülüş tasarımı",
  ],
  defaultServices: [
    {
      title: "Zirkonyum & E-Max Porselen Kaplama",
      slug: "zirkonyum-emax-kaplama",
      shortDescription: "Doğal dişe en yakın ışık geçirgenliği ve uzun ömürlü estetik gülüş kaplamaları.",
      icon: "Sparkles",
      features: ["Doğal diş rengi", "Diş eti uyumlu", "Yüksek dayanıklılık", "Dijital prova"],
    },
    {
      title: "Hızlı & Dikişsiz İmplant Tedavisi",
      slug: "implant-tedavisi",
      shortDescription: "Eksik dişlerinizi yüksek kaliteli titanyum implantlarla acısız ve kalıcı olarak tamamlayın.",
      icon: "ShieldPlus",
      features: ["Lokal anestezi", "Aynı gün geçici diş", "Ömür boyu parça garantisi", "3D tomografi planlama"],
    },
    {
      title: "Lazerle Diş Beyazlatma (Bleaching)",
      slug: "lazerle-dis-beyazlatma",
      shortDescription: "Klinik ortamında 45 dakikalık tek seansta 3-4 tona kadar daha beyaz ve parlak dişler.",
      icon: "Sun",
      features: ["Ağrısız işlem", "Mineye zarar vermez", "Anında gözle görülür sonuç", "Uzun süreli etki"],
    },
    {
      title: "Şeffaf Plak & Telsiz Ortodonti",
      slug: "seffaf-plak-ortodonti",
      shortDescription: "Dışarıdan fark edilmeyen, çıkarılabilir şeffaf plaklarla konforlu diş çapraşıklığı düzeltimi.",
      icon: "Layers",
      features: ["Görünmez estetik", "Yemekte çıkarılabilir", "Ağrısız ve yarasız", "Dijital tedavi simülasyonu"],
    },
  ],
  defaultFaqs: [
    {
      question: "İmplant tedavisi ağrılı bir işlem midir?",
      answer: "İşlem modern lokal anestezi altında uygulandığı için operasyon sırasında hiçbir ağrı hissetmezsiniz. İşlem sonrasındaki hafif sızılar ise basit hekim reçeteli ağrı kesicilerle kolayca geçer.",
      category: "İmplant",
    },
    {
      question: "Gülüş tasarımı kaç seansta tamamlanır?",
      answer: "Dijital ağız içi tarama, 3D modelleme ve prova aşamaları dahil olmak üzere ortalama 3 seansta (yaklaşık 7-10 iş gününde) yeni gülüşünüze kavuşursunuz.",
      category: "Estetik",
    },
    {
      question: "İlk muayene ve röntgen ücretli midir?",
      answer: "Kliniğimizde ilk detaylı ağız içi muayene ve panoramik röntgen analizi tamamen ücretsiz olarak hekimlerimizce gerçekleştirilmektedir.",
      category: "Muayene",
    },
    {
      question: "Şeffaf plak tedavisi ne kadar sürer?",
      answer: "Vakanın çapraşıklık durumuna bağlı olarak tedavi süreci genellikle 6 ile 14 ay arasında tamamlanmaktadır.",
      category: "Ortodonti",
    },
  ],
  contentDefaults: {
    heroBadges: ["Ücretsiz İlk Muayene", "Dijital Gülüş Tasarımı", "Ağrısız Anestezi"],
    heroHeadlines: [
      "Sağlıklı ve Özgüvenli Gülüşünüz İçin Yanınızdayız.",
      "Modern Diş Hekimliği ve İleri İmplant Tedavileri",
    ],
    heroSubtitles: [
      "En son dijital teknoloji, uzman hekim kadrosu ve konforlu klinik ortamıyla hayal ettiğiniz estetik gülüşü gerçeğe dönüştürüyoruz.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, alanında uzman hekim kadrosu ve modern klinik altyapısıyla {{city}} lokasyonunda hasta memnuniyeti ve sterilizasyon standartlarını en üst düzeyde tutarak hizmet vermektedir.",
    whyUsItems: [
      {
        title: "Ağrısız & Konforlu Tedavi",
        description: "Dijital anestezi ve ileri tekniklerle stressiz, konforlu klinik deneyimi.",
        icon: "HeartHandshake",
      },
      {
        title: "Dijital Gülüş Simülasyonu",
        description: "Tedaviye başlamadan önce yeni gülüşünüzü 3D ekranda önceden görün.",
        icon: "MonitorCheck",
      },
      {
        title: "Uluslararası Sterilizasyon",
        description: "Her hastada tek kullanımlık malzemeler ve hastane standartlarında otoklav hijyeni.",
        icon: "ShieldCheck",
      },
    ],
    defaultStats: [
      { label: "Tedavi Edilen Hasta", value: "15.000+" },
      { label: "Uzman Hekim", value: "8+" },
      { label: "Hasta Memnuniyeti", value: "%99.4" },
      { label: "Yıllık Tecrübe", value: "12+" },
    ],
    primaryCta: {
      text: "Online Randevu Oluştur",
      targetAction: "form",
    },
    secondaryCta: {
      text: "Hemen Bilgi Al: WhatsApp",
      targetAction: "whatsapp",
    },
  },
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "modern clean dental clinic interior professional dentist talking with smiling female patient warm bright atmosphere",
      fallbackUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "Modern Diş Kliniği ve Gülüş Tasarımı",
    },
    {
      key: "service-implant",
      searchPrompt: "close up model of dental implant restoration tooth crown aesthetic dentistry",
      fallbackUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Hassas İmplant ve Zirkonyum Tedavisi",
    },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} Diş Kliniği, İmplant & Gülüş Tasarımı",
    descriptionTemplate: "{{city}} diş kliniğimizde implant, zirkonyum kaplama, diş beyazlatma ve şeffaf plak tedavileri. Ücretsiz ilk muayene ve randevu için hemen iletişime geçin.",
    defaultKeywords: ["diş kliniği", "diş hekimi", "implant tedavisi", "zirkonyum kaplama", "gülüş tasarımı", "diş beyazlatma"],
    schemaOrgType: "Dentist",
  },
  recommendedSections: [
    { type: "hero", order: 0, enabled: true, recommendedVariant: "split-content-image" },
    { type: "services", order: 1, enabled: true, recommendedVariant: "grid-4" },
    { type: "whyUs", order: 2, enabled: true, recommendedVariant: "cards-3" },
    { type: "about", order: 3, enabled: true, recommendedVariant: "side-by-side" },
    { type: "testimonials", order: 4, enabled: true, recommendedVariant: "cards-grid" },
    { type: "faqs", order: 5, enabled: true, recommendedVariant: "accordion" },
    { type: "contact", order: 6, enabled: true, recommendedVariant: "split-map-form" },
  ],
  schemaHints: {
    businessType: "Dentist",
    priceRange: "₺₺₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Sa 09:00-19:00",
    areaServedType: "City",
  },
};
