import { SiteConfig, MultiLanguageConfig, LanguageDefinition, SiteTranslations } from "../types";

export const DEFAULT_LANGUAGES: LanguageDefinition[] = [
  {
    code: "tr",
    name: "Türkçe",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    direction: "ltr",
    enabled: true,
    isDefault: true
  },
  {
    code: "en",
    name: "İngilizce",
    nativeName: "English",
    flag: "🇬🇧",
    direction: "ltr",
    enabled: true,
    isDefault: false
  },
  {
    code: "de",
    name: "Almanca",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    direction: "ltr",
    enabled: true,
    isDefault: false
  },
  {
    code: "ar",
    name: "Arapça",
    nativeName: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
    enabled: true,
    isDefault: false
  },
  {
    code: "fr",
    name: "Fransızca",
    nativeName: "Français",
    flag: "🇫🇷",
    direction: "ltr",
    enabled: false,
    isDefault: false
  },
  {
    code: "ru",
    name: "Rusça",
    nativeName: "Русский",
    flag: "🇷🇺",
    direction: "ltr",
    enabled: false,
    isDefault: false
  }
];

// Common UI translations across languages
export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    navHome: "Home",
    navAbout: "About Us",
    navServices: "Services",
    navCatalog: "Products",
    navGallery: "Gallery",
    navBlog: "Blog",
    navContact: "Contact",
    phoneBtn: "Call Now",
    whatsappBtn: "WhatsApp",
    quoteBtn: "Get Quote",
    readMore: "Read More",
    allRightsReserved: "All rights reserved.",
    workingHoursLabel: "Working Hours",
    addressLabel: "Address",
    phoneLabel: "Phone",
    emailLabel: "Email",
    viewDetails: "View Details",
    orderViaWhatsapp: "Order via WhatsApp",
    priceLabel: "Price",
    taxIncluded: "VAT Included",
    taxExcluded: "+ VAT",
    searchPlaceholder: "Search...",
    fastContact: "Fast Contact",
    frequentlyAsked: "Frequently Asked Questions",
    customerReviews: "Customer Reviews",
    ourServices: "Our Services",
    ourProducts: "Our Products",
    contactUs: "Contact Us"
  },
  de: {
    navHome: "Startseite",
    navAbout: "Über uns",
    navServices: "Dienstleistungen",
    navCatalog: "Produkte",
    navGallery: "Galerie",
    navBlog: "Blog",
    navContact: "Kontakt",
    phoneBtn: "Jetzt anrufen",
    whatsappBtn: "WhatsApp",
    quoteBtn: "Angebot anfordern",
    readMore: "Weiterlesen",
    allRightsReserved: "Alle Rechte vorbehalten.",
    workingHoursLabel: "Öffnungszeiten",
    addressLabel: "Adresse",
    phoneLabel: "Telefon",
    emailLabel: "E-Mail",
    viewDetails: "Details ansehen",
    orderViaWhatsapp: "Per WhatsApp bestellen",
    priceLabel: "Preis",
    taxIncluded: "inkl. MwSt.",
    taxExcluded: "zzgl. MwSt.",
    searchPlaceholder: "Suchen...",
    fastContact: "Schnellkontakt",
    frequentlyAsked: "Häufig gestellte Fragen",
    customerReviews: "Kundenbewertungen",
    ourServices: "Unsere Leistungen",
    ourProducts: "Unsere Produkte",
    contactUs: "Kontaktieren Sie uns"
  },
  ar: {
    navHome: "الرئيسية",
    navAbout: "من نحن",
    navServices: "خدماتنا",
    navCatalog: "منتجاتنا",
    navGallery: "معرض الصور",
    navBlog: "المدونة",
    navContact: "اتصل بنا",
    phoneBtn: "اتصل الآن",
    whatsappBtn: "واتساب",
    quoteBtn: "طلب عرض سعر",
    readMore: "اقرأ المزيد",
    allRightsReserved: "جميع الحقوق محفوظة.",
    workingHoursLabel: "ساعات العمل",
    addressLabel: "العنوان",
    phoneLabel: "الهاتف",
    emailLabel: "البريد الإلكتروني",
    viewDetails: "عرض التفاصيل",
    orderViaWhatsapp: "طلب عبر واتساب",
    priceLabel: "السعر",
    taxIncluded: "شامل ضريبة القيمة المضافة",
    taxExcluded: "+ الضريبة",
    searchPlaceholder: "بحث...",
    fastContact: "اتصال سريع",
    frequentlyAsked: "الأسئلة الشائعة",
    customerReviews: "آراء وتقييمات العملاء",
    ourServices: "خدماتنا المميزة",
    ourProducts: "منتجاتنا",
    contactUs: "تواصل معنا"
  }
};

/**
 * Generates initial rich translations for English, German, and Arabic based on existing site config
 */
export function generateInitialTranslations(config: SiteConfig): Record<string, SiteTranslations> {
  const company = config.companyName || "Our Company";
  const city = config.city || "Turkey";
  const sector = config.sector || "Professional Services";

  // EN Translations
  const enServices: Record<string, { title: string; desc: string }> = {};
  config.services?.items?.forEach((s) => {
    enServices[s.id] = {
      title: translateTextSample(s.title, "en", "service"),
      desc: translateTextSample(s.desc, "en", "desc")
    };
  });

  const enProducts: Record<string, { title: string; description: string; badge?: string }> = {};
  config.products?.items?.forEach((p) => {
    enProducts[p.id] = {
      title: translateTextSample(p.title, "en", "product"),
      description: translateTextSample(p.description, "en", "desc"),
      badge: p.badge ? translateTextSample(p.badge, "en", "badge") : undefined
    };
  });

  const enFaqs: Record<string, { q: string; a: string }> = {};
  (config.faqs?.items || config.faq?.items || []).forEach((f) => {
    enFaqs[f.id] = {
      q: translateTextSample(f.q || f.question || "", "en", "faqQ"),
      a: translateTextSample(f.a || f.answer || "", "en", "faqA")
    };
  });

  // DE Translations
  const deServices: Record<string, { title: string; desc: string }> = {};
  config.services?.items?.forEach((s) => {
    deServices[s.id] = {
      title: translateTextSample(s.title, "de", "service"),
      desc: translateTextSample(s.desc, "de", "desc")
    };
  });

  const deProducts: Record<string, { title: string; description: string; badge?: string }> = {};
  config.products?.items?.forEach((p) => {
    deProducts[p.id] = {
      title: translateTextSample(p.title, "de", "product"),
      description: translateTextSample(p.description, "de", "desc"),
      badge: p.badge ? translateTextSample(p.badge, "de", "badge") : undefined
    };
  });

  const deFaqs: Record<string, { q: string; a: string }> = {};
  (config.faqs?.items || config.faq?.items || []).forEach((f) => {
    deFaqs[f.id] = {
      q: translateTextSample(f.q || f.question || "", "de", "faqQ"),
      a: translateTextSample(f.a || f.answer || "", "de", "faqA")
    };
  });

  // AR Translations
  const arServices: Record<string, { title: string; desc: string }> = {};
  config.services?.items?.forEach((s) => {
    arServices[s.id] = {
      title: translateTextSample(s.title, "ar", "service"),
      desc: translateTextSample(s.desc, "ar", "desc")
    };
  });

  const arProducts: Record<string, { title: string; description: string; badge?: string }> = {};
  config.products?.items?.forEach((p) => {
    arProducts[p.id] = {
      title: translateTextSample(p.title, "ar", "product"),
      description: translateTextSample(p.description, "ar", "desc"),
      badge: p.badge ? translateTextSample(p.badge, "ar", "badge") : undefined
    };
  });

  const arFaqs: Record<string, { q: string; a: string }> = {};
  (config.faqs?.items || config.faq?.items || []).forEach((f) => {
    arFaqs[f.id] = {
      q: translateTextSample(f.q || f.question || "", "ar", "faqQ"),
      a: translateTextSample(f.a || f.answer || "", "ar", "faqA")
    };
  });

  return {
    en: {
      companyName: company,
      slogan: `${sector} Solutions in ${city} - Fast, Reliable & 24/7`,
      city: city,
      workingHours: "24/7 Seamless Service",
      aboutTitle: `About ${company}`,
      aboutContent: `${company} is a leading provider of ${sector.toLowerCase()} services based in ${city}. With years of industry expertise and dedicated certified technicians, we deliver premium solutions with 100% customer satisfaction.`,
      aboutBadge: "Corporate & Reliable",
      heroBadge: "24/7 Professional Support",
      heroTitle: `Leading ${sector} Solutions in ${city}`,
      heroSubtitle: "Top-tier quality, certified team, and immediate customer assistance. Contact us today for special offers.",
      heroCtaPrimary: "Get Instant Quote",
      heroCtaSecondary: "Contact Us",
      servicesTitle: "Our Professional Services",
      servicesSubtitle: "Tailored high-standard solutions designed for your needs.",
      servicesBadge: "Specialized Services",
      productsTitle: "Product Catalog & Pricing",
      productsSubtitle: "Explore our featured high-grade products at competitive rates.",
      productsBadge: "Products",
      galleryTitle: "Our Project Showcase",
      gallerySubtitle: "Photos and completed projects from our professional portfolio.",
      galleryBadge: "Portfolio",
      testimonialsTitle: "What Our Clients Say",
      testimonialsSubtitle: "Genuine feedback and ratings from verified customers.",
      testimonialsBadge: "Testimonials",
      faqsTitle: "Frequently Asked Questions",
      faqsSubtitle: "Answers to common questions about our pricing, scheduling, and warranty.",
      faqsBadge: "FAQ",
      contactTitle: "Get in Touch",
      contactSubtitle: "Have questions or need immediate assistance? We are available 24/7.",
      contactBadge: "Contact",
      footerRights: `© ${new Date().getFullYear()} ${company}. All rights reserved.`,
      navHome: "Home",
      navAbout: "About",
      navServices: "Services",
      navCatalog: "Products",
      navGallery: "Gallery",
      navBlog: "Blog",
      navContact: "Contact",
      phoneBtn: "Call Now",
      whatsappBtn: "WhatsApp",
      quoteBtn: "Get Quote",
      services: enServices,
      products: enProducts,
      faqs: enFaqs,
      ui: UI_TRANSLATIONS.en
    },
    de: {
      companyName: company,
      slogan: `Professionelle ${sector}-Lösungen in ${city} - Schnell & Zuverlässig`,
      city: city,
      workingHours: "24/7 Erreichbarkeit",
      aboutTitle: `Über ${company}`,
      aboutContent: `${company} ist Ihr führender Fachbetrieb für ${sector} in ${city}. Mit langjähriger Erfahrung und modernster Ausrüstung bieten wir höchste Qualitätsstandards und garantierte Kundenzufriedenheit.`,
      aboutBadge: "Zuverlässig & Erfahren",
      heroBadge: "24/7 Notdienst & Fachberatung",
      heroTitle: `Ihre Experten für ${sector} in ${city}`,
      heroSubtitle: "Höchste Präzision, faire Konditionen und schnelle Ausführung. Fordern Sie jetzt Ihr unverbindliches Angebot an.",
      heroCtaPrimary: "Angebot anfordern",
      heroCtaSecondary: "Kontaktieren",
      servicesTitle: "Unsere Dienstleistungen",
      servicesSubtitle: "Individuelle und zertifizierte Lösungen für private und gewerbliche Kunden.",
      servicesBadge: "Leistungen",
      productsTitle: "Produktkatalog & Preise",
      productsSubtitle: "Erstklassige Produkte zu transparenten Preisen.",
      productsBadge: "Produkte",
      galleryTitle: "Projektgalerie & Referenzen",
      gallerySubtitle: "Eindrücke aus unseren erfolgreich abgeschlossenen Aufträgen.",
      galleryBadge: "Galerie",
      testimonialsTitle: "Kundenstimmen & Bewertungen",
      testimonialsSubtitle: "Echtes Feedback von unseren zufriedenen Kunden.",
      testimonialsBadge: "Bewertungen",
      faqsTitle: "Häufig gestellte Fragen",
      faqsSubtitle: "Alles Wissenswerte zu Ablauf, Preisen und Garantie.",
      faqsBadge: "FAQ",
      contactTitle: "Kontakt aufnehmen",
      contactSubtitle: "Wir sind jederzeit für Sie erreichbar. Rufen Sie uns an oder schreiben Sie uns.",
      contactBadge: "Kontakt",
      footerRights: `© ${new Date().getFullYear()} ${company}. Alle Rechte vorbehalten.`,
      navHome: "Startseite",
      navAbout: "Über uns",
      navServices: "Leistungen",
      navCatalog: "Produkte",
      navGallery: "Galerie",
      navBlog: "Blog",
      navContact: "Kontakt",
      phoneBtn: "Jetzt anrufen",
      whatsappBtn: "WhatsApp",
      quoteBtn: "Angebot anfordern",
      services: deServices,
      products: deProducts,
      faqs: deFaqs,
      ui: UI_TRANSLATIONS.de
    },
    ar: {
      companyName: company,
      slogan: `حلول ${sector} المتكاملة في ${city} - سرعة وكفاءة على مدار 24 ساعة`,
      city: city,
      workingHours: "خدمة متواصلة 24/7",
      aboutTitle: `نبذة عن ${company}`,
      aboutContent: `تعتبر شركة ${company} الرائدة في مجال ${sector} في ${city}. نقدم خدمات وحلول بأعلى معايير الجودة العالمية والاحترافية، مدعومة بفريق متخصص لضمان رضا عملائنا التام.`,
      aboutBadge: "شركة معتمدة وموثوقة",
      heroBadge: "دعم فني وخدمة 24/7",
      heroTitle: `الرواد في خدمات ${sector} في ${city}`,
      heroSubtitle: "أعلى مستويات الجودة، أحدث التقنيات وأسرع استجابة. تواصل معنا اليوم للحصول على أفضل العروض والأسعار.",
      heroCtaPrimary: "طلب عرض سعر فوري",
      heroCtaSecondary: "تواصل معنا",
      servicesTitle: "خدماتنا الاحترافية",
      servicesSubtitle: "حلول شاملة مصممة خصيصاً لتلبية جميع احتياجاتكم بكفاءة.",
      servicesBadge: "خدماتنا",
      productsTitle: "كتالوج المنتجات والأسعار",
      productsSubtitle: "تصفح مجموعتنا المميزة من المنتجات ذات الجودة العالية.",
      productsBadge: "المنتجات",
      galleryTitle: "معرض الصور والأعمال",
      gallerySubtitle: "نماذج حية من مشاريعنا الناجحة وأعمالنا المتميزة.",
      galleryBadge: "المعرض",
      testimonialsTitle: "آراء وتقييمات العملاء",
      testimonialsSubtitle: "تجارب حقيقية يشاركها عملاؤنا الكرام معنا.",
      testimonialsBadge: "التقييمات",
      faqsTitle: "الأسئلة الشائعة",
      faqsSubtitle: "إجابات وافية على أكثر الأسئلة شيوعاً حول الخدمات والأسعار.",
      faqsBadge: "الأسئلة الشائعة",
      contactTitle: "معلومات الاتصال",
      contactSubtitle: "فريقنا جاهز للرد على استفساراتكم وخدمتكم في أي وقت.",
      contactBadge: "اتصل بنا",
      footerRights: `© ${new Date().getFullYear()} ${company}. جميع الحقوق محفوظة.`,
      navHome: "الرئيسية",
      navAbout: "من نحن",
      navServices: "خدماتنا",
      navCatalog: "المنتجات",
      navGallery: "المعرض",
      navBlog: "المدونة",
      navContact: "اتصل بنا",
      phoneBtn: "اتصل الآن",
      whatsappBtn: "واتساب",
      quoteBtn: "طلب عرض سعر",
      services: arServices,
      products: arProducts,
      faqs: arFaqs,
      ui: UI_TRANSLATIONS.ar
    }
  };
}

/**
 * Simple dictionary-assisted translator for fallback when AI is not invoked
 */
function translateTextSample(text: string, lang: string, type: "service" | "product" | "badge" | "desc" | "faqQ" | "faqA"): string {
  if (!text) return "";
  const lower = text.toLowerCase();

  if (lang === "en") {
    if (type === "badge") {
      if (lower.includes("yeni")) return "New";
      if (lower.includes("popüler") || lower.includes("populer")) return "Popular";
      if (lower.includes("fırsat") || lower.includes("indirim")) return "Special Offer";
      return "Featured";
    }
    if (type === "service") {
      if (lower.includes("kurtarma") || lower.includes("çekici")) return "Emergency Towing & Road Assistance";
      if (lower.includes("akü") || lower.includes("aku")) return "Battery Jump Start & Replacement";
      if (lower.includes("lastik")) return "On-Site Tire Repair & Assistance";
      if (lower.includes("oto") || lower.includes("tamir")) return "Automotive Repair & Diagnostics";
      if (lower.includes("temizlik")) return "Professional Cleaning Service";
      if (lower.includes("danışmanlık")) return "Consulting & Technical Inspection";
      return `${text} (Professional Service)`;
    }
    if (type === "desc") {
      return "High standard execution with modern equipment, experienced team, and full warranty.";
    }
    if (type === "faqQ") {
      if (lower.includes("fiyat") || lower.includes("ücret")) return "How are your service prices calculated?";
      if (lower.includes("süre") || lower.includes("zaman")) return "How fast can you deliver the service?";
      if (lower.includes("garanti")) return "Is your work guaranteed?";
      return text;
    }
    if (type === "faqA") {
      return "We offer transparent pricing, prompt response times, and full warranty on all our services.";
    }
    return text;
  }

  if (lang === "de") {
    if (type === "badge") {
      if (lower.includes("yeni")) return "Neu";
      if (lower.includes("popüler") || lower.includes("populer")) return "Beliebt";
      if (lower.includes("fırsat") || lower.includes("indirim")) return "Sonderangebot";
      return "Top-Tipp";
    }
    if (type === "service") {
      if (lower.includes("kurtarma") || lower.includes("çekici")) return "Abschleppdienst & Pannenhilfe";
      if (lower.includes("akü") || lower.includes("aku")) return "Batterieservice & Starthilfe";
      if (lower.includes("lastik")) return "Reifenservice vor Ort";
      if (lower.includes("oto") || lower.includes("tamir")) return "KFZ-Reparatur & Diagnose";
      if (lower.includes("temizlik")) return "Professionelle Reinigung";
      if (lower.includes("danışmanlık")) return "Fachberatung & Gutachten";
      return `${text} (Fachservice)`;
    }
    if (type === "desc") {
      return "Schnelle Durchführung mit modernsten Geräten, zertifiziertem Personal und voller Garantie.";
    }
    if (type === "faqQ") {
      if (lower.includes("fiyat") || lower.includes("ücret")) return "Wie setzen sich die Preise zusammen?";
      if (lower.includes("süre") || lower.includes("zaman")) return "Wie schnell kann der Service erbracht werden?";
      if (lower.includes("garanti")) return "Gibt es eine Garantie auf Ihre Leistungen?";
      return text;
    }
    if (type === "faqA") {
      return "Wir garantieren transparente Festpreise, schnelle Einsatzzeiten und geprüfte Qualität.";
    }
    return text;
  }

  if (lang === "ar") {
    if (type === "badge") {
      if (lower.includes("yeni")) return "جديد";
      if (lower.includes("popüler") || lower.includes("populer")) return "شائع";
      if (lower.includes("fırsat") || lower.includes("indirim")) return "عرض خاص";
      return "مميز";
    }
    if (type === "service") {
      if (lower.includes("kurtarma") || lower.includes("çekici")) return "خدمة سحب وإنقاذ السيارات";
      if (lower.includes("akü") || lower.includes("aku")) return "شحن وتبديل البطاريات";
      if (lower.includes("lastik")) return "إصلاح الإطارات في الموقع";
      if (lower.includes("oto") || lower.includes("tamir")) return "صيانة وتصليح السيارات";
      if (lower.includes("temizlik")) return "خدمات التنظيف الاحترافية";
      if (lower.includes("danışmanlık")) return "استشارات فنية ومعاينة";
      return `خدمة ${text}`;
    }
    if (type === "desc") {
      return "تنفيذ بأحدث المعدات وفريق فني خبير مع ضمان شامل لكافة الأعمال.";
    }
    if (type === "faqQ") {
      if (lower.includes("fiyat") || lower.includes("ücret")) return "كيف يتم تحديد أسعار الخدمات؟";
      if (lower.includes("süre") || lower.includes("zaman")) return "ما هي سرعة الاستجابة وتقديم الخدمة؟";
      if (lower.includes("garanti")) return "هل تقدمون ضماناً على الخدمات المقدمة؟";
      return text;
    }
    if (type === "faqA") {
      return "نقدم أسعاراً شفافة ومدروسة، سرعة استجابة فورية، وضماناً معتمداً على كافة أعمالنا.";
    }
    return text;
  }

  return text;
}

/**
 * Returns effective MultiLanguageConfig ensuring all required fields are safely populated
 */
export function getEffectiveLanguageConfig(config: SiteConfig): MultiLanguageConfig {
  const existing = config.languages;
  const initialTranslations = generateInitialTranslations(config);

  if (!existing) {
    return {
      enabled: true,
      defaultLanguage: "tr",
      activeLanguages: DEFAULT_LANGUAGES.map((l) => ({ ...l })),
      translations: initialTranslations,
      switcherPosition: "header-right",
      switcherStyle: "dropdown",
      autoDetectBrowserLanguage: true,
      enableRtlForArabic: true
    };
  }

  // Merge active languages with default definitions if missing
  const mergedLanguages = DEFAULT_LANGUAGES.map((defLang) => {
    const found = existing.activeLanguages?.find((l) => l.code === defLang.code);
    if (found) {
      return { ...defLang, ...found };
    }
    return { ...defLang };
  });

  // Ensure translations exist for en, de, ar
  const mergedTranslations = {
    ...initialTranslations,
    ...(existing.translations || {})
  };

  return {
    enabled: existing.enabled ?? true,
    defaultLanguage: existing.defaultLanguage || "tr",
    activeLanguages: mergedLanguages,
    translations: mergedTranslations,
    switcherPosition: existing.switcherPosition || "header-right",
    switcherStyle: existing.switcherStyle || "dropdown",
    autoDetectBrowserLanguage: existing.autoDetectBrowserLanguage ?? true,
    enableRtlForArabic: existing.enableRtlForArabic ?? true
  };
}
