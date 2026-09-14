import { SiteConfig, ProductItem, JsonLdSchemaConfig } from "../types";

export interface SchemaTypeOption {
  value: string;
  label: string;
  category: string;
  description: string;
  icon: string;
}

export const SCHEMA_BUSINESS_TYPES: SchemaTypeOption[] = [
  // Genel & Kurumsal
  { value: "LocalBusiness", label: "LocalBusiness (Genel Yerel İşletme)", category: "Genel", description: "Her türlü fiziksel veya bölgesel işletme için standart şema", icon: "Building2" },
  { value: "Organization", label: "Organization (Kurumsal Şirket)", category: "Genel", description: "Holdingler, şirketler ve genel organizasyonlar", icon: "Briefcase" },
  { value: "ProfessionalService", label: "ProfessionalService (Uzman & Danışmanlık)", category: "Hizmet", description: "Bilişim, danışmanlık, ajans ve uzmanlık ofisleri", icon: "Award" },

  // Otomotiv
  { value: "AutoRepair", label: "AutoRepair (Oto Tamir, Bakım & Çekici)", category: "Otomotiv", description: "Oto kurtarma, yol yardım, oto tamirhane ve servisler", icon: "Wrench" },
  { value: "AutomotiveBusiness", label: "AutomotiveBusiness (Otomotiv İşletmesi)", category: "Otomotiv", description: "Galeri, araç kiralama, yedek parça ve oto galeriler", icon: "Car" },

  // Sağlık & Medikal
  { value: "Dentist", label: "Dentist (Diş Kliniği & Hekimi)", category: "Sağlık", description: "Diş klinikleri, ortodonti ve diş hekimi muayenehaneleri", icon: "Smile" },
  { value: "Physician", label: "Physician (Doktor & Muayenehane)", category: "Sağlık", description: "Uzman hekim muayenehaneleri ve bağımsız doktorlar", icon: "Stethoscope" },
  { value: "MedicalClinic", label: "MedicalClinic (Tıp Merkezi & Klinik)", category: "Sağlık", description: "Özel klinikler, tıp merkezleri ve estetik cerrahi merkezleri", icon: "HeartPulse" },

  // Hukuk & Finans
  { value: "LegalService", label: "LegalService (Hukuk Bürosu & Danışmanlık)", category: "Hukuk & Finans", description: "Avukatlık ortaklıkları, arabuluculuk ve hukuk danışmanlığı", icon: "Scale" },
  { value: "Attorney", label: "Attorney (Avukat)", category: "Hukuk & Finans", description: "Bireysel avukatlar ve noterler", icon: "FileText" },
  { value: "AccountingService", label: "AccountingService (Mali Müşavir & Muhasebe)", category: "Hukuk & Finans", description: "SMMM, mali müşavirlik ve bağımsız denetim ofisleri", icon: "Calculator" },
  { value: "FinancialService", label: "FinancialService (Finansal Danışmanlık)", category: "Hukuk & Finans", description: "Finansal danışmanlık ve varlık yönetimi", icon: "TrendingUp" },

  // Emlak & İnşaat
  { value: "RealEstateAgent", label: "RealEstateAgent (Emlak Ofisi & Gayrimenkul)", category: "Emlak", description: "Gayrimenkul danışmanlıkları ve emlak ajansları", icon: "Home" },
  { value: "HomeAndConstructionBusiness", label: "HomeAndConstructionBusiness (İnşaat & Tadilat)", category: "İnşaat", description: "İnşaat firmaları, müteahhitler, mimarlık ve tadilat", icon: "Hammer" },
  { value: "Plumber", label: "Plumber (Su Tesisatçısı)", category: "Usta & Hizmet", description: "Sıhhi tesisat ve gider açma servisleri", icon: "Droplets" },
  { value: "Electrician", label: "Electrician (Elektrikçi & Elektrik Servisi)", category: "Usta & Hizmet", description: "Elektrik taahhüt, arıza ve tesisat hizmetleri", icon: "Zap" },
  { value: "RoofingContractor", label: "RoofingContractor (Çatı Ustası & İzolasyon)", category: "Usta & Hizmet", description: "Çatı aktarma, tamirat ve ısı/su izolasyon firmaları", icon: "Shield" },
  { value: "MovingCompany", label: "MovingCompany (Nakliyat & Evden Eve)", category: "Lojistik", description: "Şehirlerarası ve şehir içi evden eve nakliyat firmaları", icon: "Truck" },

  // Perakende & Ticaret
  { value: "Store", label: "Store (Mağaza & Perakende)", category: "Ticaret", description: "Fiziksel perakende dükkanları ve butikler", icon: "ShoppingBag" },
  { value: "ShoppingCenter", label: "ShoppingCenter (Alışveriş Merkezi / Toptancı)", category: "Ticaret", description: "Toptancılar, çarşılar ve ticaret merkezleri", icon: "Store" },

  // Yeme & İçme
  { value: "Restaurant", label: "Restaurant (Restoran & Lokanta)", category: "Gastronomi", description: "Restoranlar, ocakbaşı ve alakart yemek mekanları", icon: "Utensils" },
  { value: "CafeOrCoffeeShop", label: "CafeOrCoffeeShop (Kafe & Kahve Dükkanı)", category: "Gastronomi", description: "Kahveciler, pastaneler ve kafeler", icon: "Coffee" },

  // Güzellik & Bakım
  { value: "BeautySalon", label: "BeautySalon (Güzellik Merkezi & Kuaför)", category: "Kişisel Bakım", description: "Güzellik salonları, kuaförler ve spa merkezleri", icon: "Sparkles" },
  { value: "HairSalon", label: "HairSalon (Kuaför & Berber)", category: "Kişisel Bakım", description: "Kadın/erkek kuaförleri ve berber dükkanları", icon: "Scissors" },

  // Spor & Aktivite
  { value: "SportsActivityLocation", label: "SportsActivityLocation (Spor Salonu & Fitness)", category: "Spor", description: "Spor salonları, pilates stüdyoları ve spor kulüpleri", icon: "Activity" }
];

/**
 * Maps Turkish or English business sector strings to appropriate Schema.org type
 */
export function mapSectorToSchemaType(sector: string = ""): string {
  const s = sector.toLowerCase().trim();
  
  if (s.includes("kurtarma") || s.includes("çekici") || s.includes("tamir") || s.includes("servis") || s.includes("lastik") || s.includes("oto")) {
    return "AutoRepair";
  }
  if (s.includes("diş") || s.includes("dent") || s.includes("ortodonti")) {
    return "Dentist";
  }
  if (s.includes("doktor") || s.includes("klinik") || s.includes("tıp") || s.includes("sağlık") || s.includes("hekim")) {
    return "MedicalClinic";
  }
  if (s.includes("avukat") || s.includes("hukuk") || s.includes("dava") || s.includes("arabulucu") || s.includes("baro")) {
    return "LegalService";
  }
  if (s.includes("emlak") || s.includes("gayrimenkul") || s.includes("konut") || s.includes("arsa")) {
    return "RealEstateAgent";
  }
  if (s.includes("restoran") || s.includes("lokanta") || s.includes("döner") || s.includes("kebap") || s.includes("yemek")) {
    return "Restaurant";
  }
  if (s.includes("kafe") || s.includes("kahve") || s.includes("pastane") || s.includes("fırın")) {
    return "CafeOrCoffeeShop";
  }
  if (s.includes("mağaza") || s.includes("butik") || s.includes("giyim") || s.includes("ticaret") || s.includes("satış") || s.includes("market")) {
    return "Store";
  }
  if (s.includes("tesisat") || s.includes("su tesisat") || s.includes("boru") || s.includes("kombi")) {
    return "Plumber";
  }
  if (s.includes("elektrik") || s.includes("aydınlatma")) {
    return "Electrician";
  }
  if (s.includes("çatı") || s.includes("izolasyon") || s.includes("mantolama")) {
    return "RoofingContractor";
  }
  if (s.includes("nakliyat") || s.includes("evden eve") || s.includes("taşımacılık") || s.includes("lojistik")) {
    return "MovingCompany";
  }
  if (s.includes("inşaat") || s.includes("müteahhit") || s.includes("tadilat") || s.includes("dekorasyon") || s.includes("mimarlık")) {
    return "HomeAndConstructionBusiness";
  }
  if (s.includes("muhasebe") || s.includes("mali müşavir") || s.includes("smmm") || s.includes("vergi")) {
    return "AccountingService";
  }
  if (s.includes("kuaför") || s.includes("güzellik") || s.includes("berber") || s.includes("bakım") || s.includes("estetik") || s.includes("spa")) {
    return "BeautySalon";
  }
  if (s.includes("spor") || s.includes("fitness") || s.includes("pilates") || s.includes("gym")) {
    return "SportsActivityLocation";
  }
  if (s.includes("yazılım") || s.includes("bilişim") || s.includes("ajans") || s.includes("reklam") || s.includes("danışman") || s.includes("pazarlama")) {
    return "ProfessionalService";
  }

  return "LocalBusiness";
}

/**
 * Returns effective schema config with guaranteed defaults
 */
export function getEffectiveSchemaConfig(config: SiteConfig): Required<JsonLdSchemaConfig> {
  const existing = config.seo?.schemaConfig;
  const inferredType = mapSectorToSchemaType(config.sector);
  const selectedType = existing?.businessType || config.seo?.schemaType || inferredType;

  const testimonialsCount = config.testimonials?.items?.length || 0;
  const defaultReviewCount = testimonialsCount > 0 ? (testimonialsCount * 14 + 18) : 64;

  return {
    enabled: existing?.enabled ?? true,
    autoInjectLocalBusiness: existing?.autoInjectLocalBusiness ?? true,
    autoInjectProducts: existing?.autoInjectProducts ?? true,
    autoInjectFaq: existing?.autoInjectFaq ?? true,
    autoInjectBreadcrumbs: existing?.autoInjectBreadcrumbs ?? true,
    autoInjectWebSite: existing?.autoInjectWebSite ?? true,
    businessType: selectedType,
    priceRange: existing?.priceRange || "₺₺",
    currency: existing?.currency || "TRY",
    taxId: existing?.taxId || "",
    foundingDate: existing?.foundingDate || "",
    founder: existing?.founder || "",
    areaServed: existing?.areaServed || (config.city ? `${config.city}, Türkiye` : "Türkiye"),
    latitude: existing?.latitude || "",
    longitude: existing?.longitude || "",
    paymentAccepted: existing?.paymentAccepted || ["Nakit", "Kredi Kartı", "Banka Havalesi / EFT"],
    aggregateRatingValue: existing?.aggregateRatingValue || 4.9,
    aggregateReviewCount: existing?.aggregateReviewCount || defaultReviewCount,
    customJsonLd: existing?.customJsonLd || "",
    postalCode: existing?.postalCode || "",
    streetAddress: existing?.streetAddress || "",
    addressLocality: existing?.addressLocality || "",
    addressRegion: existing?.addressRegion || "",
    addressCountry: existing?.addressCountry || "TR",
    telephone: existing?.telephone || "",
    departmentPhone: existing?.departmentPhone || "",
    openingHoursRaw: existing?.openingHoursRaw || "",
    openingHoursSchedule: existing?.openingHoursSchedule || [],
    syncWithSiteConfig: existing?.syncWithSiteConfig ?? true
  };
}

/**
 * Resolves full public site URL
 */
export function resolveSiteBaseUrl(config: SiteConfig): string {
  if (config.cloudflare?.customDomain) {
    return `https://${config.cloudflare.customDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  }
  if (config.cloudflare?.deployedUrl) {
    return config.cloudflare.deployedUrl.replace(/\/$/, '');
  }
  const sub = config.cloudflare?.subdomain || 'sirket';
  return `https://${sub}.hizliweb.site`;
}

/**
 * Parse numeric price safely from string (e.g. "1.250 ₺" -> 1250, "450 TL" -> 450)
 */
export function parseNumericPrice(priceStr: string | number = ""): number {
  if (typeof priceStr === "number") return priceStr;
  const cleaned = String(priceStr).replace(/[^0-9,.]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed <= 0 ? 100 : parsed;
}

/**
 * Coordinates map for all 81 Turkish provinces and prominent commercial districts
 */
export const TURKISH_CITY_COORDINATES: Record<string, { lat: string; lng: string }> = {
  // Major Metros & Hubs
  "istanbul": { lat: "41.0082", lng: "28.9784" },
  "ankara": { lat: "39.9334", lng: "32.8597" },
  "izmir": { lat: "38.4237", lng: "27.1428" },
  "bursa": { lat: "40.1885", lng: "29.0610" },
  "antalya": { lat: "36.8969", lng: "30.7133" },
  "adana": { lat: "37.0000", lng: "35.3213" },
  "konya": { lat: "37.8746", lng: "32.4932" },
  "gaziantep": { lat: "37.0662", lng: "37.3833" },
  "kocaeli": { lat: "40.8533", lng: "29.8815" },
  "izmit": { lat: "40.7654", lng: "29.9408" },
  "gebze": { lat: "40.8028", lng: "29.4307" },
  "mersin": { lat: "36.8121", lng: "34.6415" },
  "diyarbakir": { lat: "37.9144", lng: "40.2306" },
  "kayseri": { lat: "38.7205", lng: "35.4826" },
  "eskisehir": { lat: "39.7667", lng: "30.5256" },
  "samsun": { lat: "41.2867", lng: "36.3300" },
  "denizli": { lat: "37.7765", lng: "29.0864" },
  "sanliurfa": { lat: "37.1674", lng: "38.7955" },
  "sakarya": { lat: "40.7731", lng: "30.3948" },
  "adapazari": { lat: "40.7833", lng: "30.4000" },
  "mugla": { lat: "37.2153", lng: "28.3636" },
  "bodrum": { lat: "37.0344", lng: "27.4305" },
  "fethiye": { lat: "36.6592", lng: "29.1263" },
  "marmaris": { lat: "36.8550", lng: "28.2742" },
  "tekirdag": { lat: "40.9781", lng: "27.5117" },
  "corlu": { lat: "41.1592", lng: "27.8003" },
  "trabzon": { lat: "41.0027", lng: "39.7168" },
  "canakkale": { lat: "40.1553", lng: "26.4142" },
  "balikesir": { lat: "39.6484", lng: "27.8826" },
  "aydin": { lat: "37.8481", lng: "27.8453" },
  "kusadasi": { lat: "37.8579", lng: "27.2610" },
  "manisa": { lat: "38.6191", lng: "27.4289" },
  "hatay": { lat: "36.2023", lng: "36.1606" },
  "antakya": { lat: "36.2023", lng: "36.1606" },
  "iskenderun": { lat: "36.5872", lng: "36.1735" },
  "malatya": { lat: "38.3552", lng: "38.3095" },
  "kahramanmaras": { lat: "37.5858", lng: "36.9371" },
  "erzurum": { lat: "39.9043", lng: "41.2678" },
  "van": { lat: "38.4891", lng: "43.4089" },
  "batman": { lat: "37.8812", lng: "41.1294" },
  "elazig": { lat: "38.6810", lng: "39.2264" },
  "sivas": { lat: "39.7477", lng: "37.0179" },
  "afyonkarahisar": { lat: "38.7507", lng: "30.5567" },
  "afyon": { lat: "38.7507", lng: "30.5567" },
  "edirne": { lat: "41.6772", lng: "26.5557" },
  "kutahya": { lat: "39.4167", lng: "29.9833" },
  "ordu": { lat: "40.9839", lng: "37.8764" },
  "rize": { lat: "41.0201", lng: "40.5234" },
  "giresun": { lat: "40.9128", lng: "38.3895" },
  "isparta": { lat: "37.7648", lng: "30.5566" },
  "bolu": { lat: "40.7350", lng: "31.6061" },
  "duzce": { lat: "40.8438", lng: "31.1565" },
  "zonguldak": { lat: "41.4564", lng: "31.7987" },
  "karabuk": { lat: "41.2061", lng: "32.6204" },
  "bartin": { lat: "41.6344", lng: "32.3375" },
  "kastamonu": { lat: "41.3887", lng: "33.7827" },
  "sinop": { lat: "42.0231", lng: "35.1531" },
  "amasya": { lat: "40.6534", lng: "35.8331" },
  "tokat": { lat: "40.3167", lng: "36.5500" },
  "corum": { lat: "40.5506", lng: "34.9556" },
  "yozgat": { lat: "39.8181", lng: "34.8147" },
  "aksaray": { lat: "38.3687", lng: "34.0370" },
  "nevsehir": { lat: "38.6244", lng: "34.7144" },
  "kapadokya": { lat: "38.6431", lng: "34.8289" },
  "nigde": { lat: "37.9667", lng: "34.6833" },
  "kirsehir": { lat: "39.1425", lng: "34.1709" },
  "kirikkale": { lat: "39.8468", lng: "33.5153" },
  "cankiri": { lat: "40.6013", lng: "33.6134" },
  "karaman": { lat: "37.1759", lng: "33.2287" },
  "osmaniye": { lat: "37.0742", lng: "36.2472" },
  "adıyaman": { lat: "37.7648", lng: "38.2786" },
  "adiyaman": { lat: "37.7648", lng: "38.2786" },
  "mardin": { lat: "37.3212", lng: "40.7245" },
  "sirnak": { lat: "37.5164", lng: "42.4594" },
  "siirt": { lat: "37.9333", lng: "41.9500" },
  "bitlis": { lat: "38.4000", lng: "42.1167" },
  "mus": { lat: "38.7432", lng: "41.5064" },
  "bingol": { lat: "38.8847", lng: "40.4983" },
  "tunceli": { lat: "39.1079", lng: "39.5401" },
  "erzincan": { lat: "39.7500", lng: "39.5000" },
  "gumushane": { lat: "40.4600", lng: "39.4814" },
  "bayburt": { lat: "40.2552", lng: "40.2249" },
  "artvin": { lat: "41.1828", lng: "41.8183" },
  "ardahan": { lat: "41.1105", lng: "42.7022" },
  "kars": { lat: "40.6013", lng: "43.0975" },
  "igdir": { lat: "39.9167", lng: "44.0333" },
  "agri": { lat: "39.7191", lng: "43.0503" },
  "hakkari": { lat: "37.5833", lng: "43.7333" },
  "yalova": { lat: "40.6500", lng: "29.2667" },
  "bilecik": { lat: "40.1425", lng: "29.9793" },
  "usuk": { lat: "38.6823", lng: "29.4082" },
  "usak": { lat: "38.6823", lng: "29.4082" },
  "burdur": { lat: "37.7203", lng: "30.2908" },
  "kirklareli": { lat: "41.7333", lng: "27.2167" },
  "luleburgaz": { lat: "41.4056", lng: "27.3592" }
};

export function lookupCityCoordinates(cityName: string = ""): { lat: string; lng: string } | null {
  const norm = cityName
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();

  if (!norm) return null;

  for (const [k, v] of Object.entries(TURKISH_CITY_COORDINATES)) {
    if (norm === k || norm.includes(k) || k.includes(norm)) {
      return v;
    }
  }
  return null;
}

/**
 * Normalizes Turkish & International phone numbers for Google Click-to-Call & Local SEO
 */
export function normalizeTurkishPhone(phone: string = ""): {
  raw: string;
  e164: string;
  formatted: string;
  isValid: boolean;
} {
  const raw = phone.trim();
  if (!raw) return { raw: "", e164: "", formatted: "", isValid: false };

  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("0090")) digits = digits.substring(2);
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "90" + digits.substring(1);
  } else if (!digits.startsWith("90") && digits.length === 10) {
    digits = "90" + digits;
  }

  let formatted = raw;
  if (digits.startsWith("90") && digits.length === 12) {
    const area = digits.substring(2, 5);
    const p1 = digits.substring(5, 8);
    const p2 = digits.substring(8, 10);
    const p3 = digits.substring(10, 12);
    formatted = `+90 (${area}) ${p1} ${p2} ${p3}`;
  }

  const e164 = digits.length >= 10 ? `+${digits}` : raw;

  return {
    raw,
    e164,
    formatted,
    isValid: digits.length >= 10
  };
}

export interface SchemaOpeningHoursSpec {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/**
 * Intelligently parses various Turkish/English working hour strings into Schema.org OpeningHoursSpecification
 */
export function parseWorkingHoursToSchemaOrg(workingHoursStr: string = ""): {
  specifications: SchemaOpeningHoursSpec[];
  textSummary: string;
  is24x7: boolean;
} {
  const s = workingHoursStr.toLowerCase().trim();
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  if (!s) {
    return {
      specifications: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: weekdays,
          opens: "09:00",
          closes: "18:00"
        }
      ],
      textSummary: "Pzt-Cum 09:00-18:00",
      is24x7: false
    };
  }

  // 1. 24/7 check
  if (s.includes("7/24") || s.includes("24 saat") || s.includes("24/7") || s.includes("kesintisiz")) {
    return {
      specifications: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: allDays,
          opens: "00:00",
          closes: "23:59"
        }
      ],
      textSummary: "7/24 Kesintisiz",
      is24x7: true
    };
  }

  const normalizeTime = (t: string) => {
    const clean = t.replace(".", ":").trim();
    const parts = clean.split(":");
    const h = parts[0].padStart(2, "0");
    const m = (parts[1] || "00").padStart(2, "0");
    return `${h}:${m}`;
  };

  const timeRangeRegex = /(\d{1,2}[:.]\d{2})\s*[-–—]\s*(\d{1,2}[:.]\d{2})/g;
  const timeMatches = [...workingHoursStr.matchAll(timeRangeRegex)];

  // Multi-day pattern: e.g. Weekdays + Saturday
  if (timeMatches.length >= 2 && (s.includes("cumartesi") || s.includes("hafta sonu"))) {
    const m1 = timeMatches[0];
    const m2 = timeMatches[1];
    const specs: SchemaOpeningHoursSpec[] = [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: weekdays,
        opens: normalizeTime(m1[1]),
        closes: normalizeTime(m1[2])
      }
    ];

    if (!s.includes("cumartesi kapalı")) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: normalizeTime(m2[1]),
        closes: normalizeTime(m2[2])
      });
    }

    if (s.includes("pazar açık") && timeMatches.length >= 3) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: normalizeTime(timeMatches[2][1]),
        closes: normalizeTime(timeMatches[2][2])
      });
    }

    return {
      specifications: specs,
      textSummary: workingHoursStr,
      is24x7: false
    };
  }

  if (timeMatches.length >= 1) {
    const primary = timeMatches[0];
    const opens = normalizeTime(primary[1]);
    const closes = normalizeTime(primary[2]);

    let targetDays = weekdays;
    if (s.includes("cumartesi") || s.includes("pzt-cmt") || s.includes("pazartesi - cumartesi") || s.includes("6 gün")) {
      targetDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    } else if (s.includes("her gün") || s.includes("pazar") || s.includes("7 gün") || s.includes("haftanın 7")) {
      targetDays = allDays;
    }

    return {
      specifications: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: targetDays,
          opens,
          closes
        }
      ],
      textSummary: workingHoursStr,
      is24x7: false
    };
  }

  return {
    specifications: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: weekdays,
        opens: "09:00",
        closes: "18:00"
      }
    ],
    textSummary: workingHoursStr || "Pzt-Cum 09:00-18:00",
    is24x7: false
  };
}

/**
 * Extracts clean postal components (street, district, postal code) from address & city
 */
export function parseAddressComponents(address: string = "", city: string = "") {
  const cleanAddr = (address || "").trim();
  const cleanCity = (city || "").trim() || "İstanbul";

  const postalCodeMatch = cleanAddr.match(/\b([0-8]\d{4})\b/);
  const postalCode = postalCodeMatch ? postalCodeMatch[1] : "34000";

  // Match prominent Turkish district names
  const districtMatch = cleanAddr.match(/\b(Kadıköy|Beşiktaş|Şişli|Bakırköy|Üsküdar|Beyoğlu|Ataşehir|Maltepe|Kartal|Pendik|Fatih|Sarıyer|Zeytinburnu|Çankaya|Keçiören|Yenimahalle|Mamak|Etimesgut|Konak|Bornova|Karşıyaka|Buca|Bayraklı|Nilüfer|Osmangazi|Yıldırım|Muratpaşa|Kepez|Konyaaltı|Alanya|Manavgat|Seyhan|Çukurova|Yüreğir|Selçuklu|Meram|Karatay|Şehitkamil|Şahinbey|İzmit|Gebze|Mezitli|Yenişehir|Bodrum|Fethiye|Marmaris|Çeşme|Kuşadası|Çorlu|İskenderun)\b/i);
  const district = districtMatch ? districtMatch[1] : "";

  return {
    streetAddress: cleanAddr || "Merkez Mah.",
    addressLocality: district ? `${district}, ${cleanCity}` : cleanCity,
    addressRegion: cleanCity,
    postalCode,
    addressCountry: "TR"
  };
}

/**
 * Generate Schema.org LocalBusiness / Organization structured data
 */
export function generateLocalBusinessSchema(config: SiteConfig): Record<string, any> {
  const schemaConf = getEffectiveSchemaConfig(config);
  const siteUrl = resolveSiteBaseUrl(config);
  const logoUrl = config.header?.logoImage || config.favicon || `${siteUrl}/logo.png`;
  const primaryImg = config.hero?.bgImage || config.seo?.ogImage || `${siteUrl}/banner.jpg`;

  // Social URLs for sameAs
  const sameAs: string[] = [];
  if (config.socialMedia?.instagram) sameAs.push(config.socialMedia.instagram);
  if (config.socialMedia?.facebook) sameAs.push(config.socialMedia.facebook);
  if (config.socialMedia?.linkedin) sameAs.push(config.socialMedia.linkedin);
  if (config.socialMedia?.twitter) sameAs.push(config.socialMedia.twitter);
  if (config.socialMedia?.youtube) sameAs.push(config.socialMedia.youtube);
  if (config.footer?.instagram && !sameAs.includes(config.footer.instagram)) sameAs.push(config.footer.instagram);
  if (config.footer?.facebook && !sameAs.includes(config.footer.facebook)) sameAs.push(config.footer.facebook);
  if (config.footer?.linkedin && !sameAs.includes(config.footer.linkedin)) sameAs.push(config.footer.linkedin);
  if (config.footer?.twitter && !sameAs.includes(config.footer.twitter)) sameAs.push(config.footer.twitter);

  // Address Parsing & Normalization: Automatically prioritize live site configuration
  const shouldSync = schemaConf.syncWithSiteConfig !== false;
  const effectiveAddress = (shouldSync && config.address) ? config.address : (schemaConf.streetAddress || config.address || "");
  const effectivePhone = (shouldSync && config.phone) ? config.phone : (schemaConf.telephone || config.phone || "");
  const effectiveCity = (shouldSync && config.city) ? config.city : (schemaConf.addressRegion || config.city || "");

  const addrComp = parseAddressComponents(effectiveAddress, effectiveCity);
  const normalizedPhone = normalizeTurkishPhone(effectivePhone);

  const businessSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": schemaConf.businessType || "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    "name": config.companyName || "Firma",
    "alternateName": config.slogan || undefined,
    "url": siteUrl,
    "logo": logoUrl,
    "image": primaryImg,
    "description": config.seo?.metaDescription || config.slogan || `${config.companyName} profesyonel ${config.sector} hizmetleri.`,
    "telephone": normalizedPhone.e164 || effectivePhone || undefined,
    "email": config.email || undefined,
    "priceRange": schemaConf.priceRange || "₺₺",
    "currenciesAccepted": schemaConf.currency || "TRY",
    "paymentAccepted": schemaConf.paymentAccepted?.join(", "),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": effectiveAddress || "Merkez",
      "addressLocality": schemaConf.addressLocality || addrComp.addressLocality,
      "addressRegion": schemaConf.addressRegion || addrComp.addressRegion,
      "postalCode": schemaConf.postalCode || addrComp.postalCode,
      "addressCountry": schemaConf.addressCountry || "TR"
    }
  };

  // Geo Coordinates (User-specified or auto-detected from city)
  let latVal = schemaConf.latitude;
  let lngVal = schemaConf.longitude;
  if (!latVal || !lngVal) {
    const cityCoords = lookupCityCoordinates(config.city);
    if (cityCoords) {
      latVal = cityCoords.lat;
      lngVal = cityCoords.lng;
    }
  }

  if (latVal && lngVal) {
    const lat = parseFloat(latVal);
    const lng = parseFloat(lngVal);
    if (!isNaN(lat) && !isNaN(lng)) {
      businessSchema.geo = {
        "@type": "GeoCoordinates",
        "latitude": lat,
        "longitude": lng
      };
    }
  }

  // Google Maps / HasMap
  if (config.googleMapsEmbed) {
    businessSchema.hasMap = config.googleMapsEmbed.startsWith("http") 
      ? config.googleMapsEmbed 
      : `https://maps.google.com/?q=${encodeURIComponent(`${config.companyName} ${config.address || ''} ${config.city || ''}`)}`;
  }

  // Opening Hours Specification (Day-by-day ISO 8601 automatically populated from config.workingHours)
  const effectiveWorkingHours = (shouldSync && config.workingHours) ? config.workingHours : (schemaConf.openingHoursRaw || config.workingHours || "");
  const hasCustomSchedule = schemaConf.openingHoursSchedule && schemaConf.openingHoursSchedule.length > 0;

  if (hasCustomSchedule && (!shouldSync || schemaConf.openingHoursRaw === config.workingHours)) {
    businessSchema.openingHoursSpecification = schemaConf.openingHoursSchedule!
      .filter((s) => !s.closed && s.opens && s.closes)
      .map((s) => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": s.dayOfWeek,
        "opens": s.opens,
        "closes": s.closes
      }));
  } else {
    const parsedHours = parseWorkingHoursToSchemaOrg(effectiveWorkingHours);
    if (parsedHours.specifications && parsedHours.specifications.length > 0) {
      businessSchema.openingHoursSpecification = parsedHours.specifications;
    }
  }

  // Legacy string openingHours for maximum backward compatibility
  if (effectiveWorkingHours) {
    businessSchema.openingHours = effectiveWorkingHours;
  }

  // Area Served
  if (schemaConf.areaServed) {
    businessSchema.areaServed = {
      "@type": "AdministrativeArea",
      "name": schemaConf.areaServed
    };
  }

  // Social Links
  if (sameAs.length > 0) {
    businessSchema.sameAs = sameAs;
  }

  // Aggregate Rating (Google Stars in SERP)
  if (schemaConf.aggregateRatingValue && schemaConf.aggregateReviewCount) {
    businessSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": schemaConf.aggregateRatingValue.toString(),
      "reviewCount": schemaConf.aggregateReviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // ContactPoint
  if (config.phone) {
    businessSchema.contactPoint = {
      "@type": "ContactPoint",
      "telephone": config.phone,
      "contactType": "customer service",
      "areaServed": "TR",
      "availableLanguage": ["Turkish"]
    };
  }

  // Optional Founder / FoundingDate
  if (schemaConf.foundingDate) {
    businessSchema.foundingDate = schemaConf.foundingDate;
  }
  if (schemaConf.founder) {
    businessSchema.founder = {
      "@type": "Person",
      "name": schemaConf.founder
    };
  }

  return businessSchema;
}

/**
 * Generate Schema.org Product structured data for a single product
 */
export function generateProductSchema(config: SiteConfig, product: ProductItem): Record<string, any> {
  const siteUrl = resolveSiteBaseUrl(config);
  const productSlug = product.slug || product.id;
  const productUrl = `${siteUrl}/urun-${productSlug}.html`;
  const schemaConf = getEffectiveSchemaConfig(config);

  const priceVal = parseNumericPrice(product.price);
  const currency = schemaConf.currency || "TRY";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    "name": product.title,
    "description": product.description || `${product.title} - ${config.companyName} güvencesiyle.`,
    "image": product.image ? (product.image.startsWith("http") ? product.image : `${siteUrl}/${product.image}`) : undefined,
    "sku": `SKU-${product.id.slice(0, 8).toUpperCase()}`,
    "category": product.category || undefined,
    "brand": {
      "@type": "Brand",
      "name": config.companyName
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "price": priceVal.toFixed(2),
      "priceCurrency": currency,
      "priceValidUntil": "2028-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": config.companyName
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": (4.8 + ((parseInt(product.id.slice(-2), 16) || 2) % 3) * 0.1).toFixed(1),
      "reviewCount": String(12 + ((parseInt(product.id.slice(-2), 16) || 5) % 20)),
      "bestRating": "5"
    }
  };
}

/**
 * Generate Schema.org ItemList for products (used on catalog & homepage)
 */
export function generateCatalogItemListSchema(config: SiteConfig): Record<string, any> | null {
  const products = config.products?.items || [];
  if (products.length === 0) return null;

  const siteUrl = resolveSiteBaseUrl(config);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}/katalog.html#itemlist`,
    "name": config.products?.title || `${config.companyName} Ürün Kataloğu`,
    "description": config.products?.subtitle || `${config.companyName} ürün kataloğu ve fiyatları.`,
    "numberOfItems": products.length,
    "itemListElement": products.map((item, index) => {
      const productSlug = item.slug || item.id;
      const productUrl = `${siteUrl}/urun-${productSlug}.html`;
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.title,
        "url": productUrl,
        "image": item.image
      };
    })
  };
}

/**
 * Generate Schema.org FAQPage structured data from website FAQs
 */
export function generateFaqPageSchema(config: SiteConfig): Record<string, any> | null {
  const faqList = (config.faqs?.items || config.faq?.items || []).filter(f => f.question && f.answer);
  if (faqList.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate WebSite Schema with SearchAction
 */
export function generateWebSiteSchema(config: SiteConfig): Record<string, any> {
  const siteUrl = resolveSiteBaseUrl(config);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "url": siteUrl,
    "name": config.companyName,
    "alternateName": config.slogan || undefined,
    "inLanguage": "tr-TR",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/?s={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate BreadcrumbList Schema for navigation
 */
export function generateBreadcrumbSchema(
  siteUrl: string, 
  items: { name: string; url: string }[]
): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${siteUrl}/${item.url.replace(/^\//, '')}`
    }))
  };
}

/**
 * Generate unified Schema.org @graph containing all active entities
 */
export function generateCompositeSchemaGraph(
  config: SiteConfig,
  pageType: "home" | "about" | "service" | "product" | "blog" | "contact" | "page" | "catalog" = "home",
  contextData?: {
    pageTitle?: string;
    pageDescription?: string;
    product?: ProductItem;
    breadcrumbItems?: { name: string; url: string }[];
  }
): Record<string, any> {
  const schemaConf = getEffectiveSchemaConfig(config);
  const siteUrl = resolveSiteBaseUrl(config);

  // If user has custom JSON-LD defined and valid, parse and merge
  if (schemaConf.customJsonLd && schemaConf.customJsonLd.trim()) {
    try {
      const parsed = JSON.parse(schemaConf.customJsonLd.trim());
      if (parsed["@context"] || parsed["@graph"]) {
        return parsed;
      }
    } catch {
      // invalid custom JSON-LD, fall back to automatic generator
    }
  }

  const graph: Record<string, any>[] = [];

  // 1. WebSite Schema (Homepage or all pages)
  if (schemaConf.autoInjectWebSite) {
    graph.push(generateWebSiteSchema(config));
  }

  // 2. LocalBusiness / Organization Schema
  if (schemaConf.autoInjectLocalBusiness) {
    graph.push(generateLocalBusinessSchema(config));
  }

  // 3. Product Schema (if on product detail page OR catalog/home)
  if (schemaConf.autoInjectProducts) {
    if (pageType === "product" && contextData?.product) {
      graph.push(generateProductSchema(config, contextData.product));
    } else if (config.products?.enabled !== false && (pageType === "home" || pageType === "catalog")) {
      const catalogSchema = generateCatalogItemListSchema(config);
      if (catalogSchema) graph.push(catalogSchema);
    }
  }

  // 4. FAQPage Schema (if website has FAQs and user enabled it)
  if (schemaConf.autoInjectFaq) {
    const faqSchema = generateFaqPageSchema(config);
    if (faqSchema && (pageType === "home" || pageType === "about" || pageType === "page")) {
      graph.push(faqSchema);
    }
  }

  // 5. BreadcrumbList Schema
  if (schemaConf.autoInjectBreadcrumbs && contextData?.breadcrumbItems && contextData.breadcrumbItems.length > 0) {
    graph.push(generateBreadcrumbSchema(siteUrl, contextData.breadcrumbItems));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

/**
 * Diagnostics & validation for Google Rich Results compliance
 */
export interface SchemaValidationIssue {
  type: "warning" | "error" | "info" | "success";
  field: string;
  message: string;
  schema: "LocalBusiness" | "Product" | "FAQPage" | "General";
}

export function validateSiteSchema(config: SiteConfig): {
  isValid: boolean;
  score: number;
  issues: SchemaValidationIssue[];
  summary: {
    hasLocalBusiness: boolean;
    businessType: string;
    hasProducts: boolean;
    productCount: number;
    hasFaqs: boolean;
    faqCount: number;
    hasPhone: boolean;
    hasAddress: boolean;
    hasHours: boolean;
    hasCoordinates: boolean;
    hasSocials: boolean;
  };
} {
  const conf = getEffectiveSchemaConfig(config);
  const issues: SchemaValidationIssue[] = [];
  let score = 100;

  // LocalBusiness Checks
  if (!config.companyName) {
    score -= 20;
    issues.push({
      type: "error",
      field: "companyName",
      message: "Şirket adı boş olamaz. Schema.org 'name' özelliği gereklidir.",
      schema: "LocalBusiness"
    });
  }

  if (!config.phone) {
    score -= 10;
    issues.push({
      type: "warning",
      field: "phone",
      message: "Telefon numarası eksik. Google Haritalar & Yerel SEO için 'telephone' önerilir.",
      schema: "LocalBusiness"
    });
  }

  if (!config.address || !config.city) {
    score -= 15;
    issues.push({
      type: "warning",
      field: "address",
      message: "Adres veya şehir eksik. 'PostalAddress' yerel aramalarda çıkması için elzemdir.",
      schema: "LocalBusiness"
    });
  }

  if (!config.workingHours) {
    score -= 5;
    issues.push({
      type: "info",
      field: "workingHours",
      message: "Çalışma saatleri tanımlanmamış. 'openingHours' ziyaretçilere Google'da açık/kapalı durumunu gösterir.",
      schema: "LocalBusiness"
    });
  }

  const hasCoords = Boolean(conf.latitude && conf.longitude);
  if (!hasCoords) {
    issues.push({
      type: "info",
      field: "coordinates",
      message: "Harita koordinatları girilmemiş. Girilirse 'GeoCoordinates' ile Google Haritalar'da tam konum eşleşir.",
      schema: "LocalBusiness"
    });
  }

  // Product Checks
  const products = config.products?.items || [];
  if (conf.autoInjectProducts && products.length > 0) {
    const productsMissingPrice = products.filter(p => !p.price || p.price === "0" || p.price === "");
    if (productsMissingPrice.length > 0) {
      score -= 5;
      issues.push({
        type: "warning",
        field: "products.price",
        message: `${productsMissingPrice.length} üründe fiyat bilgisi eksik. 'Offer' şemasında fiyat bulunması Google Alışveriş için önemlidir.`,
        schema: "Product"
      });
    } else {
      issues.push({
        type: "success",
        field: "products",
        message: `${products.length} ürün için tam Schema.org Product & ItemList şeması hazır.`,
        schema: "Product"
      });
    }
  }

  // FAQ Checks
  const faqs = config.faqs?.items || config.faq?.items || [];
  if (conf.autoInjectFaq && faqs.length > 0) {
    issues.push({
      type: "success",
      field: "faqs",
      message: `${faqs.length} soru & cevap Google FAQPage Zengin Sonuçlarına (SERP Accordion) hazır.`,
      schema: "FAQPage"
    });
  }

  const hasSocials = Boolean(
    config.socialMedia?.instagram || 
    config.socialMedia?.facebook || 
    config.socialMedia?.linkedin || 
    config.socialMedia?.twitter ||
    config.footer?.instagram ||
    config.footer?.facebook
  );

  return {
    isValid: score >= 60,
    score: Math.max(20, Math.min(100, score)),
    issues,
    summary: {
      hasLocalBusiness: conf.autoInjectLocalBusiness,
      businessType: conf.businessType || "LocalBusiness",
      hasProducts: conf.autoInjectProducts && products.length > 0,
      productCount: products.length,
      hasFaqs: conf.autoInjectFaq && faqs.length > 0,
      faqCount: faqs.length,
      hasPhone: Boolean(config.phone),
      hasAddress: Boolean(config.address && config.city),
      hasHours: Boolean(config.workingHours),
      hasCoordinates: hasCoords,
      hasSocials
    }
  };
}
