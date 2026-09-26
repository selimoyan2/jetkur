/**
 * JetKur Canonical Data Architecture - Fixtures & Verification
 *
 * Provides comprehensive, strictly typed mock fixtures for:
 * 1. A complete canonical Turkish SME site: "Usta Tesisat Kadıköy"
 * 2. An official JetKur Industry Pack: "pack-plumbing-tr"
 *
 * Verifies that the canonical types compile cleanly under strict TypeScript.
 */

import { CanonicalSite } from "./site";
import { IndustryPack } from "./industryPack";

export const samplePlumbingIndustryPack: IndustryPack = {
  id: "pack-plumbing-tr",
  slug: "plumbing",
  name: "Sıhhi Tesisat, Su Kaçağı & Kombi Servisi",
  category: "home_services",
  aliases: ["tesisatçı", "su tesisatı", "kameralı su kaçağı", "tıkanıklık açma", "petek temizliği"],
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
  ],
  defaultFaqs: [
    {
      question: "Su kaçağı tespiti yapılırken ev kırılır mı?",
      answer:
        "Hayır, kullandığımız son teknoloji termal kameralar ve akustik dinleme dedektörleri sayesinde sızıntının tam noktasını kırmadan, milimetrik olarak tespit ediyoruz.",
      category: "Teknoloji",
    },
    {
      question: "Acil durumlarda ne kadar sürede adrese ulaşıyorsunuz?",
      answer: "Hizmet bölgelerimizdeki nöbetçi ekiplerimizle ortalama 30-45 dakika içinde adresinize ulaşıyoruz.",
      category: "Hizmet Süresi",
    },
  ],
  contentDefaults: {
    heroBadges: ["7/24 Acil Tesisat Hizmeti", "Kadıköy & Anadolu Yakası", "1 Yıl İşçilik Garantisi"],
    heroHeadlines: [
      "Evinizde Su Kaçağı mı Var? Kırmadan Noktasal Tespit Ediyoruz.",
      "7/24 Kesintisiz Profesyonel Sıhhi Tesisat ve Onarım Hizmeti",
    ],
    heroSubtitles: [
      "Termal kamera ve akustik dinleme teknolojisiyle 30 dakikada adresinizdeyiz. Kırmadan, dökmeden garantili onarım.",
    ],
    aboutStoryTemplate:
      "15 yılı aşkın saha tecrübemiz ve sertifikalı ustalarımızla İstanbul genelinde binlerce konut ve iş yerine güvenilir tesisat çözümleri sunuyoruz.",
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
      text: "Hemen Ara: 0532 000 00 00",
      targetAction: "phone",
    },
    secondaryCta: {
      text: "WhatsApp'tan Fiyat Al",
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
  ],
  seoDefaults: {
    titleTemplate: "{{companyName}} | {{city}} 7/24 Acil Su Tesisatçısı & Kaçak Tespiti",
    descriptionTemplate:
      "{{city}} ve çevresinde kırmadan termal kameralı su kaçağı tespiti, tıkanıklık açma ve 7/24 acil tesisatçı hizmeti. Hemen arayın, 30 dakikada gelelim.",
    defaultKeywords: ["su tesisatçısı", "su kaçağı tespiti", "tıkanıklık açma", "acil tesisat", "petek temizliği"],
    schemaOrgType: "Plumber",
  },
  recommendedSections: [
    { type: "hero", order: 0, enabled: true, recommendedVariant: "split-content-image" },
    { type: "services", order: 1, enabled: true, recommendedVariant: "grid-3" },
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

export const sampleCanonicalSite: CanonicalSite = {
  id: "site-usta-tesisat-001",
  schemaVersion: "1.0.0",
  status: "active",
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-24T18:30:00.000Z",

  // 1. BUSINESS PROFILE
  businessProfile: {
    identity: {
      companyName: "Usta Tesisat Kadıköy",
      brandName: "Usta Tesisat",
      sector: "plumbing",
      industryPackId: "pack-plumbing-tr",
      slogan: "Kadıköy ve Anadolu Yakası 7/24 Kesintisiz Profesyonel Tesisat Hizmeti",
      shortDescription: "Termal kameralı su kaçağı tespiti, gider tıkanıklığı açma ve sıhhi tesisat tamiratı.",
      story:
        "2010 yılında Kadıköy'de kurulan Usta Tesisat, teknolojik cihazlarla kırmadan dökmeden tesisat tamiri prensibiyle hizmet vermektedir.",
      foundingYear: 2010,
      taxId: "1234567890",
    },
    contact: {
      phone: "+90 532 555 01 23",
      phoneSecondary: "+90 216 444 01 23",
      whatsapp: "+905325550123",
      email: "iletisim@ustatesisat.com.tr",
      supportEmail: "servis@ustatesisat.com.tr",
    },
    location: {
      address: "Caferağa Mah. Moda Cad. No: 42/B",
      city: "İstanbul",
      district: "Kadıköy",
      postalCode: "34710",
      country: "Türkiye",
      serviceAreas: ["Kadıköy", "Ataşehir", "Üsküdar", "Maltepe", "Göztepe", "Bostancı"],
      geoCoordinates: {
        latitude: 40.9876,
        longitude: 29.0289,
      },
      googleMapsEmbedUrl: "https://maps.google.com/?q=Moda+Kadikoy",
    },
    branding: {
      logoUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&h=60&q=80",
      logoAlt: "Usta Tesisat Logosu",
      brandColors: {
        primary: "#1e40af",
        secondary: "#0284c7",
        accent: "#f59e0b",
      },
    },
    workingHours: {
      raw: "7 Gün 24 Saat Açık (Acil Nöbetçi Ekip)",
      is24x7Emergency: true,
      schedule: [
        {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          open: "00:00",
          close: "23:59",
        },
      ],
    },
    services: [
      {
        id: "srv-1",
        title: "Kameralı Su Kaçağı Tespiti",
        slug: "su-kacagi-tespiti",
        shortDescription: "Termal kamera ile noktasal tespit, kırmadan garantili onarım.",
        priceHint: "₺750 Başlangıç",
        features: ["Termal Kamera", "Noktasal Tespit", "1 Yıl Garanti"],
        icon: "Camera",
        featured: true,
      },
      {
        id: "srv-2",
        title: "Robotla Gider Tıkanıklığı Açma",
        slug: "tikaniklik-acma",
        shortDescription: "Pimaş ve lavabo borularını robot helezon cihazla hasarsız temizliyoruz.",
        priceHint: "₺600 Başlangıç",
        features: ["Robot Helezon", "Boru Temizliği", "Hızlı Müdahale"],
        icon: "Wrench",
        featured: true,
      },
    ],
    metrics: {
      yearsOfExperience: 16,
      completedJobsCount: 12400,
      satisfiedClientsCount: 11800,
      teamSize: 8,
    },
    social: {
      instagram: "https://instagram.com/ustatesisat",
      facebook: "https://facebook.com/ustatesisat",
      twitter: "https://x.com/ustatesisat",
    },
  },

  // 2. INDUSTRY PACK REFERENCE
  industryPackId: "pack-plumbing-tr",

  // 3. DESIGN TEMPLATE
  designTemplate: {
    templateId: "tpl-apex-industrial",
    templateSlug: "apex-industrial",
    customTokens: {
      palette: {
        primary: "#1e3a8a",
        primaryDark: "#172554",
        secondary: "#0284c7",
        accent: "#f59e0b",
        text: "#0f172a",
        textMuted: "#64748b",
        background: "#ffffff",
        surface: "#f8fafc",
        border: "#e2e8f0",
      },
    },
  },

  // 4. SECTION CONFIGURATION
  sectionConfiguration: {
    sections: [
      { id: "sec-hero", type: "hero", order: 0, enabled: true, variant: "split-content-image" },
      { id: "sec-services", type: "services", order: 1, enabled: true, variant: "grid-cards", options: { columns: 3 } },
      { id: "sec-why-us", type: "whyUs", order: 2, enabled: true, variant: "feature-grid" },
      { id: "sec-about", type: "about", order: 3, enabled: true, variant: "story-side" },
      { id: "sec-testimonials", type: "testimonials", order: 4, enabled: true, variant: "card-carousel" },
      { id: "sec-faqs", type: "faqs", order: 5, enabled: true, variant: "accordion-modern" },
      { id: "sec-contact", type: "contact", order: 6, enabled: true, variant: "split-form-map", options: { showMap: true, showForm: true } },
    ],
    header: {
      sticky: true,
      showPhoneButton: true,
      showWhatsAppButton: true,
      showCtaButton: true,
      ctaText: "Hemen Ara",
      ctaTarget: "tel:+905325550123",
      navLinks: [
        { id: "nav-1", label: "Hizmetlerimiz", target: "#services", visible: true, order: 0 },
        { id: "nav-2", label: "Neden Biz", target: "#whyUs", visible: true, order: 1 },
        { id: "nav-3", label: "Hakkımızda", target: "#about", visible: true, order: 2 },
        { id: "nav-4", label: "S.S.S.", target: "#faqs", visible: true, order: 3 },
        { id: "nav-5", label: "İletişim", target: "#contact", visible: true, order: 4 },
      ],
    },
    footer: {
      showWorkingHours: true,
      showSocialIcons: true,
      showQuickLinks: true,
      showCopyright: true,
      customDisclaimer: "Kadıköy ve çevresinde yetkili sıhhi tesisat ustalarıyla hizmet verilmektedir.",
    },
  },

  // 5. SITE CONTENT
  content: {
    hero: {
      badge: "Kadıköy 7/24 Nöbetçi Tesisat",
      title: "Kırmadan Cihazla Su Kaçağı Bulma & 7/24 Acil Tesisatçı",
      subtitle: "30 dakikada adresinizdeyiz. Termal kamera ve akustik dinleme teknolojisiyle garantili onarım.",
      ctaPrimaryText: "Hemen Ara: 0532 555 01 23",
      ctaPrimaryLink: "tel:+905325550123",
      ctaSecondaryText: "WhatsApp'tan Ulaşın",
      ctaSecondaryLink: "https://wa.me/905325550123",
      bgImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
      stats: [
        { label: "Varış Süresi", value: "30 Dk" },
        { label: "Tecrübe", value: "16 Yıl" },
        { label: "Müşteri Memnuniyeti", value: "%99" },
      ],
    },
    about: {
      badge: "Kurumsal Profil",
      title: "16 Yıldır Kadıköy'ün Güvenilir Tesisat Ustası",
      contentHtml:
        "<p>Usta Tesisat olarak modern tespit cihazlarımızla hem bütçenizi hem de evinizi koruyoruz.</p>",
      yearsExperience: "16",
      completedProjects: "12400+",
      bulletPoints: ["Yetki belgeli ustalar", "Kırmadan tespit teknolojisi", "Şeffaf fiyatlandırma", "1 yıl işçilik garantisi"],
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    },
    whyUs: {
      badge: "Ayrıcalıklarımız",
      title: "Neden Usta Tesisat'ı Seçmelisiniz?",
      subtitle: "Geleneksel kırma dökme devrini kapattık. Teknolojik ve garantili çözümler sunuyoruz.",
      items: [
        { id: "wu-1", title: "30 Dk Acil Servis", description: "Bölgenizdeki nöbetçi ekibimiz hemen yola çıkar.", icon: "Clock" },
        { id: "wu-2", title: "Cihazla Noktasal Bulma", description: "Gereksiz kırma masraflarından sizi kurtarıyoruz.", icon: "Shield" },
        { id: "wu-3", title: "Yazılı Garanti", description: "Yapılan her müdahale 1 yıl garanti kapsamındadır.", icon: "Award" },
      ],
    },
    contact: {
      badge: "İletişim",
      title: "Bizimle Hemen İletişime Geçin",
      subtitle: "7/24 çağrı merkezimiz veya WhatsApp hattımız üzerinden anında ulaşabilirsiniz.",
    },
    gallery: [],
    testimonials: [
      {
        id: "t-1",
        name: "Ahmet Yılmaz",
        role: "Moda Sakini",
        comment: "Gece yarısı alt kata su sızıyordu, 25 dakikada geldiler ve tek fayans kırarak kaçağı tamir ettiler. Harika esnaflık!",
        rating: 5,
        verified: true,
      },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "Cihazla tespit ücreti ne kadar?",
        answer: "Kadıköy ve çevresi için başlangıç tespit ücretimiz 750 TL'dir. Onarım onaylandığında özel indirim uygulanır.",
      },
    ],
    pricingPlans: [],
    customPages: [],
    blogPosts: [],
    catalogProducts: [],
  },

  // 6. SITE SETTINGS
  settings: {
    structureMode: "single-page",
    domain: {
      hostname: "ustatesisat.com.tr",
      isCustom: true,
      status: "active",
      sslActive: true,
    },
    deployment: {
      provider: "cloudflare_pages",
      status: "deployed",
      productionUrl: "https://ustatesisat.com.tr",
      lastDeployedAt: "2026-03-24T18:30:00.000Z",
    },
    seo: {
      metaTitle: "Kadıköy Su Tesisatçısı | Usta Tesisat 7/24 Su Kaçağı & Tıkanıklık",
      metaDescription:
        "Kadıköy ve Anadolu Yakası 7/24 acil su tesisatçısı. Kırmadan termal kameralı su kaçağı tespiti, robotla tıkanıklık açma. 30 dakikada adreste!",
      keywords: "kadıköy tesisatçı, su kaçağı tespiti, tıkanıklık açma, acil su tesisatı, moda tesisatçı",
      author: "Usta Tesisat Kadıköy",
      robots: "index, follow",
      canonicalUrl: "https://ustatesisat.com.tr",
      schemaConfig: {
        enabled: true,
        businessType: "Plumber",
        autoInjectLocalBusiness: true,
        autoInjectProducts: true,
        autoInjectFaq: true,
        autoInjectBreadcrumbs: true,
        priceRange: "₺₺",
        currency: "TRY",
      },
    },
    analytics: {},
    whatsappWidget: {
      enabled: true,
      phoneNumber: "+905325550123",
      defaultMessage: "Merhaba, Kadıköy Usta Tesisat'tan acil servis talep etmek istiyorum.",
      position: "bottom-right",
      showOnlineBadge: true,
      agentName: "Nöbetçi Usta",
    },
    leads: {
      enableInstantEmailNotification: true,
      notificationEmail: "servis@ustatesisat.com.tr",
    },
    performance: {
      enableEdgeCache: true,
      lazyLoadImages: true,
      minifyStaticHtml: true,
      criticalCssInline: true,
    },
    locale: {
      defaultLocale: "tr",
      supportedLocales: ["tr"],
    },
  },
};
