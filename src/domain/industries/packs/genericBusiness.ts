/**
 * JetKur Canonical Industry Pack: Genel İşletme & Kurumsal Hizmetler (Sprint 11)
 *
 * Sektör: Belirli bir sektöre girmeyen veya özel kurumsal işletmeler için
 * güvenli, tarafsız ve profesyonel başlangıç paketi.
 *
 * Invariant: Düzenlemeye tabi mesleki (hukuk, tıp vb.) iddialar içermez.
 */

import { IndustryPack } from "../types";

export const genericBusinessIndustryPack: IndustryPack = {
  id: "pack-generic-business-tr",
  slug: "genel-isletme",
  name: "Genel İşletme & Kurumsal Hizmetler",
  category: "home_services",
  version: "1.0.0",
  status: "ACTIVE",
  description: "Tüm sektörler ve özel kurumsal işletmeler için uyarlanabilir genel başlangıç paketi",
  aliases: [
    "genel",
    "genel isletme",
    "genel işletme",
    "kurumsal",
    "kurumsal hizmetler",
    "diger",
    "diğer",
    "danismanlik",
    "danışmanlık",
    "other",
    "generic",
    "business",
  ],
  defaultServices: [
    {
      title: "Danışmanlık & Hizmet Talebi",
      slug: "danismanlik-ve-hizmet",
      shortDescription: "İhtiyacınıza yönelik profesyonel inceleme, danışmanlık ve kurumsal teklif.",
      icon: "Briefcase",
      priceHint: "Özel teklif için arayınız",
      features: ["Hızlı geri dönüş", "Detaylı fizibilite", "Şeffaf fiyatlandırma", "Müşteri odaklı yaklaşım"],
    },
    {
      title: "Kurumsal Çözümler",
      slug: "kurumsal-cozumler",
      shortDescription: "Bireysel ve kurumsal müşteriler için garantili, planlı ve zamanında teslimat.",
      icon: "ShieldCheck",
      priceHint: "Garantili hizmet",
      features: ["Deneyimli kadro", "Modern ekipman", "Sözleşmeli garanti", "Periyodik destek"],
    },
    {
      title: "Müşteri Destek & Servis",
      slug: "musteri-destek-servis",
      shortDescription: "İşlem öncesi ve sonrası kesintisiz iletişim, hızlı destek ve bilgilendirme.",
      icon: "Headphones",
      priceHint: "7/24 iletişim",
      features: ["Hızlı iletişim", "Memnuniyet garantisi", "Yerinde inceleme", "Özel temsilci"],
    },
  ],
  defaultFaqs: [
    {
      question: "Hizmet talebimi nasıl iletebilirim?",
      answer: "Telefon numaramızdan veya WhatsApp hattımızdan bize 7/24 ulaşabilir, ihtiyacınıza en uygun hizmet için hemen bilgi alabilirsiniz.",
      category: "İletişim & Randevu",
    },
    {
      question: "Fiyatlandırma nasıl belirlenmektedir?",
      answer: "Hizmet kapsamı ve talepleriniz incelendikten sonra, sürpriz maliyetler olmadan şeffaf ve net bir teklif sunulmaktadır.",
      category: "Fiyatlandırma",
    },
    {
      question: "Hizmetleriniz garantili midir?",
      answer: "Evet, sunduğumuz tüm hizmetlerde kalite standartlarına tam uyum ve müşteri memnuniyeti garantisi esastır.",
      category: "Güvence",
    },
  ],
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "Professional modern business office workspace with natural daylight",
      fallbackUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "Kurumsal ofis ve profesyonel hizmet çalışma ortamı",
    },
    {
      key: "service-consulting",
      searchPrompt: "Business team discussing solutions in a modern office room",
      fallbackUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Danışmanlık ve profesyonel hizmet sunumu",
    },
  ],
  contentDefaults: {
    heroBadges: ["Güvenilir ve Kurumsal Çözümler"],
    heroHeadlines: [
      "{{businessName}} - Kaliteli ve Profesyonel Hizmet",
      "{{city}} Bölgesinde Güvenle Tercih Edeceğiniz İş Ortağınız",
    ],
    heroSubtitles: [
      "Alanında uzman ekibimizle, ihtiyacınıza en uygun çözümleri hızlı ve garantili şekilde sunuyoruz.",
      "Yüksek kalite anlayışı, zamanında teslimat ve müşteri memnuniyeti önceliğimizdir.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, {{city}} ve çevresinde profesyonel standartlarda hizmet sunmaktadır. Müşteri memnuniyetini merkezine alan çalışma anlayışımızla güvenilir çözümler üretiyoruz.",
    whyUsItems: [
      {
        title: "Uzman ve Deneyimli Kadro",
        description: "Alanında yetkin ve tecrübeli uzmanlarımızla kusursuz hizmet sağlıyoruz.",
        icon: "ShieldCheck",
      },
      {
        title: "Şeffaf & Adil Fiyatlandırma",
        description: "İşlem öncesi net bilgilendirme ile sürpriz ek masraflara yer bırakmıyoruz.",
        icon: "BadgeCheck",
      },
      {
        title: "Memnuniyet Garantisi",
        description: "Hizmet tesliminden sonra da yanınızda olarak memnuniyetinizi garanti altına alıyoruz.",
        icon: "Award",
      },
    ],
    defaultStats: [
      { label: "Yıllık Tecrübe", value: "10+" },
      { label: "Mutlu Müşteri", value: "1.000+" },
      { label: "Memnuniyet Oranı", value: "%99" },
    ],
    primaryCta: {
      text: "Hemen İletişime Geçin",
      targetAction: "phone",
    },
    secondaryCta: {
      text: "WhatsApp Destek Hattı",
      targetAction: "whatsapp",
    },
  },
  recommendedSections: [
    { type: "header", enabled: true, order: 0, recommendedVariant: "standard" },
    { type: "hero", enabled: true, order: 1, recommendedVariant: "default" },
    { type: "services", enabled: true, order: 2, recommendedVariant: "default" },
    { type: "about", enabled: true, order: 3, recommendedVariant: "default" },
    { type: "whyUs", enabled: true, order: 4, recommendedVariant: "default" },
    { type: "faq", enabled: true, order: 5, recommendedVariant: "accordion" },
    { type: "contact", enabled: true, order: 6, recommendedVariant: "default" },
    { type: "footer", enabled: true, order: 99, recommendedVariant: "simple-centered" },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} Kaliteli ve Güvenilir Kurumsal Hizmetler",
    descriptionTemplate: "{{companyName}}, {{city}} ve çevresinde profesyonel standartlarda garantili hizmet ve müşteri odaklı çözümler sunmaktadır. Hemen arayın veya teklif alın.",
    defaultKeywords: ["kurumsal hizmetler", "profesyonel çözümler", "güvenilir işletme", "kaliteli hizmet"],
    schemaOrgType: "LocalBusiness",
  },
  schemaHints: {
    businessType: "LocalBusiness",
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Sa 08:30-19:30",
    areaServedType: "City",
  },
};
