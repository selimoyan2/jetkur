/**
 * JetKur Canonical Industry Pack: Hukuk & Avukatlık Bürosu (Sprint 05)
 *
 * Sektör: Hukuk, Avukatlık Bürosu, Hukuki Danışmanlık
 * Primary Intent: Danışmanlık talebi, uzmanlık alanları, kurumsal itibar
 */

import { IndustryPack } from "../types";

export const hukukAvukatIndustryPack: IndustryPack = {
  id: "pack-hukuk-avukat-tr",
  slug: "hukuk-avukat",
  name: "Hukuk & Avukatlık Danışmanlık Bürosu",
  category: "legal_finance",
  version: "1.0.0",
  status: "ACTIVE",
  description: "Avukatlar, hukuk büroları ve arabuluculuk merkezleri için profesyonel sektör başlangıç paketi",
  aliases: [
    "avukat",
    "hukuk burosu",
    "hukuk danismanligi",
    "avukatlik",
    "arabulucu",
    "ceza avukati",
    "bosanma avukati",
    "is hukuku avukati",
    "hukuk",
    "avukatlık bürosu",
    "hukuk danışmanlığı",
  ],
  defaultServices: [
    {
      title: "Ticaret & Şirketler Hukuku",
      slug: "ticaret-sirketler-hukuku",
      shortDescription: "Şirket kuruluşu, hisse devirleri, ticari sözleşmeler ve kurumsal alacak takibi.",
      icon: "Briefcase",
      features: ["Sözleşme hazırlama", "Genel kurul süreçleri", "Ticari dava takibi", "Uyum danışmanlığı"],
    },
    {
      title: "Gayrimenkul & İmar Hukuku",
      slug: "gayrimenkul-imar-hukuku",
      shortDescription: "Tapu iptal ve tescil davaları, kira uyuşmazlıkları, tahliye davaları ve kamulaştırma.",
      icon: "Building",
      features: ["Kira tespit davaları", "Tahliye takibi", "Kat mülkiyeti davaları", "İmar uyuşmazlıkları"],
    },
    {
      title: "İş & Sosyal Güvenlik Hukuku",
      slug: "is-sosyal-guvenlik-hukuku",
      shortDescription: "Kıdem ve ihbar tazminatı, işe iade davaları, hizmet tespiti ve iş kazası tazminatları.",
      icon: "Scale",
      features: ["İşe iade süreçleri", "Tazminat hesaplaması", "Mobbing davaları", "Arabuluculuk görüşmeleri"],
    },
    {
      title: "Ceza & Ağır Ceza Hukuku",
      slug: "ceza-agir-ceza-hukuku",
      shortDescription: "Soruşturma, gözaltı, sorgu ve kovuşturma evrelerinde etkin hukuki savunma.",
      icon: "ShieldAlert",
      features: ["Karakol & savcılık ifadesi", "Ağır ceza savunması", "İtiraz ve temyiz", "Tutukluluğa itiraz"],
    },
  ],
  defaultFaqs: [
    {
      question: "Danışmanlık randevusu nasıl oluşturulur?",
      answer: "Telefon numaramız veya web sitemizdeki iletişim formu üzerinden dava dosyanızın konusunu belirterek ofisimizden randevu alabilirsiniz.",
      category: "Randevu",
    },
    {
      question: "Online / görüntülü danışmanlık veriyor musunuz?",
      answer: "Evet, şehir dışındaki veya yurt dışındaki müvekkillerimiz için Zoom, Google Meet veya Microsoft Teams üzerinden güvenli görüntülü danışmanlık sağlamaktayız.",
      category: "Online Görüşme",
    },
    {
      question: "Dava masrafları ve avukatlık ücreti nasıl belirlenir?",
      answer: "Avukatlık ücretleri Türkiye Barolar Birliği Asgari Ücret Tarifesi esas alınarak davanın niteliği, kapsamı ve tahmini süresine göre karşılıklı sözleşmeyle belirlenir.",
      category: "Ücretlendirme",
    },
    {
      question: "Gizlilik ve meslek sırrı nasıl korunur?",
      answer: "Avukatlık Kanunu ve meslek ilkeleri gereğince müvekkillerimizle paylaşılan tüm bilgi, belge ve görüşmeler mutlak mesleki gizlilik altındadır.",
      category: "Gizlilik",
    },
  ],
  contentDefaults: {
    heroBadges: ["Yetkin Hukuki Savunma", "Gizlilik & Şeffaflık", "Hızlı Sonuç Odaklı"],
    heroHeadlines: [
      "Haklarınızı Kararlılık ve Güvenle Savunuyoruz.",
      "Bireysel ve Kurumsal Çözümler İçin Hukuki Danışmanlık",
    ],
    heroSubtitles: [
      "Karmaşık hukuki süreçlerde tecrübeli avukat kadromuzla yanınızdayız. Adil, hızlı ve müvekkil odaklı dava ve danışmanlık hizmeti.",
    ],
    aboutStoryTemplate:
      "{{businessName}}, kuruluşundan bu yana {{city}} ve tüm Türkiye'de hukukun üstünlüğü, şeffaflık ve etik değerler doğrultusunda müvekkillerine kapsamlı hukuki danışmanlık sunmaktadır.",
    whyUsItems: [
      {
        title: "Kapsamlı Dava Tecrübesi",
        description: "Yüzlerce başarılı dava ve uyuşmazlık çözümüyle derin sektörel uzmanlık.",
        icon: "Scale",
      },
      {
        title: "Şeffaf Bilgilendirme",
        description: "Davanızın her aşamasında düzenli raporlama ve anlık süreç takibi.",
        icon: "FileText",
      },
      {
        title: "Tam Mesleki Gizlilik",
        description: "Tüm dosya ve verileriniz Avukatlık Kanunu sır saklama yükümlülüğü altındadır.",
        icon: "Lock",
      },
    ],
    defaultStats: [
      { label: "Kazanılan Dava", value: "%94" },
      { label: "Yıllık Tecrübe", value: "15+" },
      { label: "Müvekkil Sayısı", value: "2.400+" },
      { label: "Hukuk Alanı", value: "12+" },
    ],
    primaryCta: {
      text: "Danışmanlık Randevusu Al",
      targetAction: "form",
    },
    secondaryCta: {
      text: "Ofisimizle İletişime Geçin",
      targetAction: "phone",
    },
  },
  imageIntents: [
    {
      key: "hero-bg",
      searchPrompt: "elegant modern law firm office interior dark wood desk wooden gavel books leather chair professional lighting",
      fallbackUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      suggestedAlt: "Hukuk ve Avukatlık Danışmanlık Bürosu",
    },
    {
      key: "service-contract",
      searchPrompt: "lawyer reviewing legal contract document with client in corporate meeting room",
      fallbackUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: "Sözleşme ve Hukuki Danışmanlık",
    },
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} Avukatlık & Hukuki Danışmanlık Bürosu",
    descriptionTemplate: "{{city}} hukuk büromuzda ceza, iş, gayrimenkul ve ticaret hukuku davalarında yetkin avukatlık hizmeti. Randevu ve danışmanlık için bize ulaşın.",
    defaultKeywords: ["avukat", "hukuk bürosu", "avukatlık danışmanlık", "ceza avukatı", "iş hukuku avukatı", "dava takibi"],
    schemaOrgType: "LegalService",
  },
  recommendedSections: [
    { type: "hero", order: 0, enabled: true, recommendedVariant: "centered-prestige" },
    { type: "services", order: 1, enabled: true, recommendedVariant: "grid-4" },
    { type: "whyUs", order: 2, enabled: true, recommendedVariant: "cards-3" },
    { type: "about", order: 3, enabled: true, recommendedVariant: "side-by-side" },
    { type: "testimonials", order: 4, enabled: true, recommendedVariant: "quotes-minimal" },
    { type: "faqs", order: 5, enabled: true, recommendedVariant: "accordion" },
    { type: "contact", order: 6, enabled: true, recommendedVariant: "formal-consultation-form" },
  ],
  schemaHints: {
    businessType: "LegalService",
    priceRange: "₺₺₺",
    currenciesAccepted: "TRY",
    openingHoursDefault: "Mo-Fr 09:00-18:00",
    areaServedType: "City",
  },
};
