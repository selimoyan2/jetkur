/**
 * JetKur Canonical Industry Pack: Sıhhi Tesisat & Su Kaçağı (Sprint 05)
 *
 * Sektör: Sıhhi Tesisat, Tıkanıklık Açma, Su Kaçağı Tespiti
 * Primary Intent: 7/24 acil arama, termal kamera ile tespit, kırmadan onarım
 */

import { IndustryPack } from "../types";

export const sihhiTesisatIndustryPack: IndustryPack = {
  id: "pack-plumbing-tr",
  slug: "sihhi-tesisat",
  name: "Sıhhi Tesisat, Su Kaçağı & Tıkanıklık Açma",
  category: "home_services",
  version: "1.0.0",
  status: "ACTIVE",
  description: "Termal kameralı su kaçağı tespiti, robotla tıkanıklık açma ve 7/24 acil tesisat hizmeti veren işletmeler için sektör paketi",
  aliases: [
    "tesisatci",
    "tesisatçı",
    "sihhi tesisat",
    "sıhhi tesisat",
    "sihhi tesisatci",
    "sıhhi tesisatçı",
    "su tesisatcisi",
    "su tesisatçısı",
    "su kacagi",
    "su kaçağı",
    "tikaniklik acma",
    "tıkanıklık açma",
    "plumbing",
    "acil tesisat",
    "lavabo acma",
    "klozet tamiri",
  ],
  defaultServices: [
    {
      title: "Kırmadan Cihazla Su Kaçağı Tespiti",
      slug: "su-kacagi-tespiti",
      shortDescription: "Akustik dinleme ve termal kamera ile noktasal su kaçağı bulma.",
      icon: "Wrench",
      priceHint: "₺750'den başlayan fiyatlarla",
      features: ["Termal kamera", "Akustik dinleme", "Noktasal tespit", "Kırmadan onarım"],
    },
    {
      title: "Robotla Tıkanıklık Açma",
      slug: "tikaniklik-acma",
      shortDescription: "Gider boruları, lavabo ve klozet tıkanıklıklarını kırmadan açıyoruz.",
      icon: "Pipette",
      priceHint: "₺600'den başlayan fiyatlarla",
      features: ["Kameralı görüntüleme", "Robot helezon yay", "Boruya sıfır zarar", "1 yıl garanti"],
    },
    {
      title: "Kombi & Petek Temizliği",
      slug: "petek-temizligi",
      shortDescription: "Özel kimyasal ilaç ve çift yönlü yıkama makinesiyle %30 yakıt tasarrufu.",
      icon: "Flame",
      priceHint: "₺900'den başlayan fiyatlarla",
      features: ["Çift yönlü makine", "Koruyucu kimyasal", "Termal verim ölçümü", "Hızlı işlem"],
    },
    {
      title: "Musluk, Batarya & Rezervuar Onarımı",
      slug: "musluk-rezervuar-onarimi",
      shortDescription: "Gömme rezervuar, klozet iç takımı ve batarya montaj-tamir hizmeti.",
      icon: "Droplets",
      priceHint: "Sabit montaj bedeli",
      features: ["Tüm markalarla uyumlu", "Sızdırmazlık testi", "Orijinal conta", "Garantili montaj"],
    },
  ],
  defaultFaqs: [
    {
      question: "Su kaçağı tespiti yapılırken ev kırılır mı?",
      answer: "Hayır, kullandığımız son teknoloji termal kameralar ve akustik dinleme dedektörleri sayesinde sızıntının tam noktasını kırmadan, milimetrik olarak tespit ediyoruz.",
      category: "Teknoloji",
    },
    {
      question: "Acil durumlarda ne kadar sürede adrese ulaşıyorsunuz?",
      answer: "Hizmet bölgelerimizdeki nöbetçi ekiplerimizle ortalama 30-45 dakika içinde adresinize ulaşıyoruz.",
      category: "Hizmet Süresi",
    },
    {
      question: "Yaptığınız tesisat onarımları garantili midir?",
      answer: "Evet, servisimiz tarafından tamir edilen borular ve montajı yapılan malzemeler 1 yıl işçilik ve servis garantimiz altındadır.",
      category: "Garanti",
    },
  ],
  contentDefaults: {
    heroBadges: ["7/24 Acil Tesisat Hizmeti", "Kırmadan Cihazla Tespit", "1 Yıl İşçilik Garantisi"],
    heroHeadlines: [
      "Evinizde Su Kaçağı mı Var? Kırmadan Noktasal Tespit Ediyoruz.",
      "7/24 Kesintisiz Profesyonel Sıhhi Tesisat ve Onarım Hizmeti",
    ],
    heroSubtitles: [
      "Termal kamera ve akustik dinleme teknolojisiyle 30 dakikada adresinizdeyiz. Kırmadan, dökmeden garantili onarım.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, 15 yılı aşkın saha tecrübesi ve sertifikalı ustalarıyla {{city}} genelinde binlerce konut ve iş yerine güvenilir tesisat çözümleri sunmaktadır.",
    whyUsItems: [
      {
        title: "30 Dakikada Adreste",
        description: "Bölgenizdeki gezici mobil servis ekiplerimizle en kısa sürede kapınızdayız.",
        icon: "Clock",
      },
      {
        title: "Kırmadan Noktasal Çözüm",
        description: "İleri teknoloji termal kameralar sayesinde gereksiz kırma ve masraflara son.",
        icon: "ShieldCheck",
      },
      {
        title: "1 Yıl Yazılı Garanti",
        description: "Yaptığımız tüm tamirat ve malzeme montajlarında 1 yıl resmi garanti sunuyoruz.",
        icon: "Award",
      },
    ],
    defaultStats: [
      { label: "Yıllık Tecrübe", value: "15+" },
      { label: "Mutlu Müşteri", value: "8.500+" },
      { label: "Varış Süresi", value: "30 Dk" },
      { label: "İşçilik Garantisi", value: "1 Yıl" },
    ],
    primaryCta: {
      text: "Hemen Ara: 7/24 Acil Usta",
      targetAction: "phone",
    },
    secondaryCta: {
      text: "WhatsApp'tan Bilgi Al",
      targetAction: "whatsapp",
    },
  },
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "professional plumber using wrench fixing modern copper water pipe in bathroom clean photography",
      fallbackUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "Profesyonel su tesisatçısı boru montajı",
    },
    {
      key: "service-leak",
      searchPrompt: "technician using thermal imaging camera inspecting water leak inside residential wall",
      fallbackUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Termal kameralı su kaçağı tespiti",
    },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} 7/24 Acil Su Tesisatçısı & Kaçak Tespiti",
    descriptionTemplate: "{{city}} ve çevresinde kırmadan termal kameralı su kaçağı tespiti, tıkanıklık açma ve 7/24 acil tesisatçı hizmeti. Hemen arayın, 30 dakikada gelelim.",
    defaultKeywords: ["su tesisatçısı", "su kaçağı tespiti", "tıkanıklık açma", "acil tesisat", "petek temizliği", "sıhhi tesisat"],
    schemaOrgType: "Plumber",
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
    businessType: "Plumber",
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Su 00:00-23:59",
    areaServedType: "City",
  },
};
