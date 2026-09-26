/**
 * JetKur Canonical Industry Pack: Halı & Koltuk Yıkama (Sprint 05)
 *
 * Sektör: Temizlik, Halı Yıkama, Koltuk Temizliği
 * Primary Intent: Servis çağırma, WhatsApp siparişi, m² fiyatı
 */

import { IndustryPack } from "../types";

export const haliYikamaIndustryPack: IndustryPack = {
  id: "pack-hali-yikama-tr",
  slug: "hali-yikama",
  name: "Endüstriyel & Hijyenik Halı Yıkama",
  category: "cleaning_hygiene",
  version: "1.0.0",
  status: "ACTIVE",
  description: "Otomatik halı, koltuk, yorgan ve perde yıkama tesisleri için müşteri kazandıran sektör paketi",
  aliases: [
    "hali yikama",
    "koltuk yikama",
    "perde yikama",
    "yorgan yikama",
    "hali temizleme",
    "oto koltuk yikama",
    "yerinde koltuk yikama",
    "halı yıkama",
    "koltuk yıkama",
    "perde yıkama",
  ],
  defaultServices: [
    {
      title: "Otomatik Bantlı Halı Yıkama",
      slug: "otomatik-hali-yikama",
      shortDescription: "El dokuma, yün, ipek ve shaggy halılarınız için 12 fırçalı tam otomatik hijyenik yıkama.",
      icon: "Sparkles",
      priceHint: "m² 45 ₺'den Başlayan",
      features: ["12 fırçalı derin yıkama", "Bitkisel şampuan", "Kapalı oda kurutma", "Antibakteriyel ambalaj"],
    },
    {
      title: "Yerinde Koltuk & Yatak Yıkama",
      slug: "yerinde-koltuk-yikama",
      shortDescription: "Vakumlu sıcak su püskürtmeli Alman makinelerle evinizde derinlemesine kumaş dezenfeksiyonu.",
      icon: "Armchair",
      priceHint: "Takım 650 ₺",
      features: ["Mite & akar temizliği", "Kumaş rengine özel kimyasal", "Hızlı kuruma (3 saat)", "Leke çıkarma garantisi"],
    },
    {
      title: "Stor & Zebra Perde Temizliği",
      slug: "stor-zebra-perde-temizligi",
      shortDescription: "Mekanizmalarına zarar vermeden adresten sökme, ultrasonik temizlik ve yerine montaj.",
      icon: "Layers",
      priceHint: "m² 50 ₺",
      features: ["Ücretsiz sökme-takma", "Mekanizma kontrolü", "Kırışıksız teslimat", "Zararsız leke çıkarma"],
    },
    {
      title: "Yorgan & Battaniye Yıkama",
      slug: "yorgan-battaniye-yikama",
      shortDescription: "Endüstriyel hijyenik tamburlu kazanlarda tek tek, antialerjik yumuşatıcı ile yıkama.",
      icon: "Shirt",
      priceHint: "Adet 150 ₺",
      features: ["Tek tek yıkama", "Termal kurutma", "Kötü koku önleyici", "Özel vakumlu poşetleme"],
    },
  ],
  defaultFaqs: [
    {
      question: "Halılar kaç iş gününde teslim edilir?",
      answer: "Halılarınız adresinizden alındıktan sonra yıkama, sıkma ve kapalı kurutma odalarımızda kurutulup parfümlenerek ortalama 3 ile 4 iş günü içerisinde teslim edilir.",
      category: "Teslimat",
    },
    {
      question: "Adresten alım ve teslimatta servis ücreti var mı?",
      answer: "Hayır, belirli m² limitinin üzerindeki tüm siparişlerinizde ücretsiz adresten alım ve teslimat servisimiz bulunmaktadır.",
      category: "Servis",
    },
    {
      question: "Halılar yıkanırken renkleri birbirine karışır mı?",
      answer: "Hayır, renk verme riski taşıyan el dokuma veya kök boyalı halılar özel renk sabitleyici solüsyonlar kullanılarak tek tek ayrı yıkama alanında işleme alınır.",
      category: "Hassas Yıkama",
    },
    {
      question: "Koltuk yıkandıktan ne kadar sonra kurur?",
      answer: "Yüksek emiş güçlü vakum motorlarımız kumaştaki suyun %95'ini çektiği için koltuklarınız mevsim koşullarına göre 3 ile 5 saat içinde tamamen kullanıma hazır hale gelir.",
      category: "Koltuk Temizliği",
    },
  ],
  contentDefaults: {
    heroBadges: ["Ücretsiz Adrese Servis", "Doğal Bitkisel Şampuan", "3-4 Günde Hızlı Teslim"],
    heroHeadlines: [
      "Tertemiz, Hijyenik ve Mis Kokulu Halılar.",
      "12 Fırçalı Otomatik Halı ve Koltuk Yıkama Hizmeti",
    ],
    heroSubtitles: [
      "Kapalı kurutma odalarımızda tozsuz ortamda kurutulan halılarınız adresinizden ücretsiz alınıp ambalajlı olarak kapınıza teslim edilir.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, endüstriyel tesisinde son teknoloji yıkama makineleri ve insan sağlığına zararsız temizlik ürünleriyle {{city}} genelinde hijyen standartlarını yükseltmektedir.",
    whyUsItems: [
      {
        title: "Ücretsiz Kapıdan Kapıya",
        description: "Zahmetsizce adresinizden alıyor, tertemiz paketleyip geri getiriyoruz.",
        icon: "Truck",
      },
      {
        title: "Tozsuz Kapalı Kurutma",
        description: "Egzoz dumanı ve sokak tozuna maruz kalmadan UV korumalı odalarda kurutma.",
        icon: "Sun",
      },
      {
        title: "Garantili Leke Çıkarma",
        description: "Çıkmayan zorlu lekelerde ücretsiz 2. kez yıkama güvencesi sunuyoruz.",
        icon: "CheckCircle",
      },
    ],
    defaultStats: [
      { label: "Yıllık m² Yıkama", value: "85.000+" },
      { label: "Mutlu Ev Hanımı", value: "14.000+" },
      { label: "Teslim Süresi", value: "3-4 Gün" },
      { label: "Memnuniyet Oranı", value: "%99.6" },
    ],
    primaryCta: {
      text: "Hemen Servis Çağır",
      targetAction: "phone",
    },
    secondaryCta: {
      text: "WhatsApp'tan Sipariş Ver",
      targetAction: "whatsapp",
    },
  },
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "automatic industrial carpet cleaning washing machine brushes clean foaming fresh rugs bright factory floor",
      fallbackUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "Otomatik Halı Yıkama Tesisi",
    },
    {
      key: "service-sofa",
      searchPrompt: "professional technician cleaning grey fabric sofa with upholstery vacuum steam cleaner",
      fallbackUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Yerinde Koltuk Yıkama",
    },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} Halı Yıkama & Koltuk Temizleme Servisi",
    descriptionTemplate: "{{city}} en iyi halı yıkama fabrikası. Ücretsiz servis, antibakteriyel bitkisel şampuanlar ve 4 günde teslimat. Hemen arayın, kapınızdan alalım.",
    defaultKeywords: ["halı yıkama", "koltuk yıkama", "en iyi halı yıkama", "perde yıkama", "yerinde koltuk temizliği", "halı yıkama fiyatları"],
    schemaOrgType: "CleaningService",
  },
  recommendedSections: [
    { type: "hero", order: 0, enabled: true, recommendedVariant: "urgent-callout" },
    { type: "services", order: 1, enabled: true, recommendedVariant: "grid-4" },
    { type: "whyUs", order: 2, enabled: true, recommendedVariant: "cards-3" },
    { type: "about", order: 3, enabled: true, recommendedVariant: "side-by-side" },
    { type: "testimonials", order: 4, enabled: true, recommendedVariant: "cards-grid" },
    { type: "faqs", order: 5, enabled: true, recommendedVariant: "accordion" },
    { type: "contact", order: 6, enabled: true, recommendedVariant: "split-map-form" },
  ],
  schemaHints: {
    businessType: "CleaningService",
    priceRange: "₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Sa 08:30-19:30",
    areaServedType: "City",
  },
};
