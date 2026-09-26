import { 
  SeoContentRevisionResponse, 
  SeoContentRevisionProposal, 
  SeoContentPageAudit, 
  RegisteredSmeSeoProfile,
  SeoPageVariationItem,
  SeoRevisionStrategyKey
} from "../types";
import { JetkurClientSite } from "./platformSettingsStorage";

const SME_SEO_STORAGE_KEY = "jetkur_registered_sme_seo_profiles";

/**
 * Calculates estimated pixel width in Google Desktop SERP (Arial 18px ~ 10.5px average per character).
 */
export function calculateGooglePixelWidth(text: string): number {
  if (!text) return 0;
  let width = 0;
  for (const char of text) {
    if (/[il1.,'|:;!]/.test(char)) width += 4.5;
    else if (/[mwWM@#%&]/.test(char)) width += 14.5;
    else if (/[A-Z]/.test(char)) width += 11.5;
    else if (/[0-9]/.test(char)) width += 9.5;
    else if (char === " ") width += 5;
    else width += 8.8;
  }
  return Math.round(width);
}

/**
 * Default SEO profiles for initial registered SME sites.
 */
export const DEFAULT_REGISTERED_SME_SEO_PROFILES: Record<string, RegisteredSmeSeoProfile> = {
  "site-1": {
    siteId: "site-1",
    companyName: "Yıldız 7/24 Oto Kurtarma",
    sector: "Oto Çekici & Kurtarma",
    domain: "yildizotokurtarma.com.tr",
    city: "İstanbul",
    targetKeywords: ["istanbul oto çekici", "7/24 acil kurtarıcı", "en yakın oto kurtarma", "anadolu yakası çekici", "çekici fiyatları 2026"],
    pages: {
      home: {
        metaTitle: "Yıldız Oto Kurtarma | Çekici Hizmetleri",
        metaDescription: "Yıldız Oto Kurtarma olarak İstanbul'da oto çekici ve yol yardım hizmeti veriyoruz. Bizi her zaman arayabilirsiniz.",
        h1: "İstanbul'da Güvenilir Çekici Hizmeti",
        h2s: ["Hizmetlerimiz", "Hakkımızda", "Neden Bizi Seçmelisiniz?", "Müşteri Yorumları", "İletişim"]
      },
      services: {
        metaTitle: "Hizmetlerimiz - Yıldız Oto Kurtarma",
        metaDescription: "Sunduğumuz oto kurtarma ve çekici hizmetlerini bu sayfada bulabilirsiniz.",
        h1: "Oto Kurtarma ve Çekici Hizmetleri",
        h2s: ["Şehir İçi Çekici", "Ağır Vasıta Taşıma", "Akü Takviye"]
      },
      about: {
        metaTitle: "Hakkımızda - Yıldız Çekici",
        metaDescription: "Firmamız 10 yılı aşkın süredir çekici sektöründe hizmet vermektedir.",
        h1: "Yıldız Oto Kurtarma Hakkında",
        h2s: ["Tarihçemiz", "Misyon ve Vizyonumuz"]
      },
      contact: {
        metaTitle: "İletişim - Yıldız Oto Kurtarma",
        metaDescription: "Bize telefon ve WhatsApp üzerinden ulaşarak çekici çağırabilirsiniz.",
        h1: "Bizimle İletişime Geçin",
        h2s: ["Adres Bilgilerimiz", "Harita Konumu", "Teklif Formu"]
      }
    }
  },
  "site-2": {
    siteId: "site-2",
    companyName: "DentNova Diş Kliniği",
    sector: "Sağlık & Diş Hekimliği",
    domain: "dentnovaklinik.com",
    city: "İstanbul",
    targetKeywords: ["diş kliniği kadıköy", "implant tedavisi istanbul", "gülüş tasarımı", "zirkonyum diş kaplama", "nöbetçi diş hekimi"],
    pages: {
      home: {
        metaTitle: "DentNova Diş Kliniği - Diş Sağlığı Merkezi",
        metaDescription: "DentNova Diş Kliniği'nde tüm diş tedavileri yapılmaktadır. Randevu için web sitemizi ziyaret edin.",
        h1: "Sağlıklı Gülüşler İçin DentNova",
        h2s: ["Tedavilerimiz", "Hekim Kadromuz", "Klinik Olanakları", "Randevu Alın"]
      },
      services: {
        metaTitle: "Tedavilerimiz - DentNova Diş Kliniği",
        metaDescription: "İmplant, ortodonti ve zirkonyum kaplama gibi diş tedavilerimiz.",
        h1: "Diş Tedavi Hizmetlerimiz",
        h2s: ["İmplant", "Estetik Diş Hekimliği", "Kanal Tedavisi"]
      }
    }
  },
  "site-3": {
    siteId: "site-3",
    companyName: "Demir Hukuk & Danışmanlık",
    sector: "Hukuk Bürosu",
    domain: "demirhukuk.av.tr",
    city: "Ankara",
    targetKeywords: ["ankara ceza avukatı", "iş hukuku danışmanlığı", "şirketler hukuku ankara", "boşanma avukatı çankaya", "tazminat davası avukatı"],
    pages: {
      home: {
        metaTitle: "Demir Hukuk Bürosu | Ankara Avukat",
        metaDescription: "Demir Hukuk Bürosu Ankara'da müvekkillerine hukuki danışmanlık ve dava takibi sunmaktadır.",
        h1: "Demir Hukuk ve Danışmanlık",
        h2s: ["Çalışma Alanlarımız", "Avukatlarımız", "Makaleler", "Hukuki Danışmanlık"]
      }
    }
  },
  "site-4": {
    siteId: "site-4",
    companyName: "MisPak Halı Yıkama",
    sector: "Temizlik & Fabrika",
    domain: "mispakhaliyikama.com",
    city: "İzmir",
    targetKeywords: ["izmir halı yıkama", "profesyonel koltuk yıkama", "karşıyaka halı temizleme", "organik şampuanlı halı yıkama", "ücretsiz servis halı yıkama"],
    pages: {
      home: {
        metaTitle: "MisPak Halı Yıkama İzmir",
        metaDescription: "MisPak Halı Yıkama ile halılarınız tertemiz yıkanır. İzmir geneline ücretsiz servisimiz vardır.",
        h1: "İzmir'de Profesyonel Halı Yıkama",
        h2s: ["Yıkama Aşamaları", "Fiyat Listesi", "Neden MisPak?", "Sipariş Ver"]
      }
    }
  },
  "site-5": {
    siteId: "site-5",
    companyName: "Acil Çilingir & Kilit",
    sector: "Çilingir & Güvenlik",
    domain: "acilcilingir.jetkur.me",
    city: "Bursa",
    targetKeywords: ["bursa acil çilingir", "7/24 kapı açma bursa", "oto çilingir nilüfer", "kale kilit göbeği değişimi", "hasarsız kapı açma"],
    pages: {
      home: {
        metaTitle: "Acil Çilingir Bursa - Kilit Açma",
        metaDescription: "Bursa'da kapıda kaldıysanız acil çilingir servisimizi arayabilirsiniz. 15 dakikada kapınızdayız.",
        h1: "Bursa Nöbetçi Çilingir Hizmeti",
        h2s: ["Hizmet Bölgelerimiz", "Kilit Çeşitleri", "Hızlı Çilingir Çağır"]
      }
    }
  }
};

/**
 * Loads all saved registered SME SEO profiles from localStorage or initializes with defaults.
 */
export function getRegisteredSmeSeoProfiles(): Record<string, RegisteredSmeSeoProfile> {
  try {
    const raw = localStorage.getItem(SME_SEO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_REGISTERED_SME_SEO_PROFILES, ...parsed };
    }
  } catch (err) {
    console.warn("Could not load SME SEO profiles from storage, using defaults", err);
  }
  return DEFAULT_REGISTERED_SME_SEO_PROFILES;
}

/**
 * Saves updated SME SEO profiles to localStorage.
 */
export function saveRegisteredSmeSeoProfiles(profiles: Record<string, RegisteredSmeSeoProfile>): void {
  try {
    localStorage.setItem(SME_SEO_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Failed to save SME SEO profiles", err);
  }
}

/**
 * Retrieves or dynamically generates an SEO profile for a given SME client site.
 */
export function getOrCreateSmeSeoProfile(site: JetkurClientSite): RegisteredSmeSeoProfile {
  const allProfiles = getRegisteredSmeSeoProfiles();
  if (allProfiles[site.id]) {
    return allProfiles[site.id];
  }

  // Generate clean default profile if none exists
  const city = "İstanbul";
  const sector = site.sector || "Kurumsal Hizmetler";
  const name = site.companyName || "KOBİ İşletmesi";

  const newProfile: RegisteredSmeSeoProfile = {
    siteId: site.id,
    companyName: name,
    sector: sector,
    domain: site.domain || `${site.id}.jetkur.me`,
    city: city,
    targetKeywords: [
      `${city.toLowerCase()} ${sector.toLowerCase()}`,
      `en iyi ${sector.toLowerCase()}`,
      `7/24 ${sector.toLowerCase()}`,
      `${sector.toLowerCase()} fiyatları 2026`,
      `profesyonel ${sector.toLowerCase()} hizmeti`
    ],
    pages: {
      home: {
        metaTitle: `${name} | ${sector} Hizmetleri`,
        metaDescription: `${name}, ${city} ve çevresinde profesyonel ${sector.toLowerCase()} çözümleri sunmaktadır. Bilgi ve teklif için arayın.`,
        h1: `${city}'da Öncü ${sector} Çözümleri`,
        h2s: ["Hizmetlerimiz", "Hakkımızda", "Neden Biz?", "İletişim & Randevu"]
      },
      services: {
        metaTitle: `Hizmetlerimiz - ${name}`,
        metaDescription: `${name} tarafından sunulan kapsamlı ${sector.toLowerCase()} çözümleri ve fiyatlandırma seçenekleri.`,
        h1: `${sector} Hizmetlerimiz ve Çözümlerimiz`,
        h2s: ["Kurumsal Çözümler", "Bireysel Hizmetler", "Fiyat Tarifesi"]
      },
      about: {
        metaTitle: `Kurumsal & Hakkımızda - ${name}`,
        metaDescription: `${name} firmasının geçmişi, kalite sertifikaları ve profesyonel ekibi.`,
        h1: `${name} Hakkında & Kurumsal Değerlerimiz`,
        h2s: ["Biz Kimiz?", "Vizyon & Misyon", "Sertifikalarımız"]
      },
      contact: {
        metaTitle: `İletişim & Teklif Al - ${name}`,
        metaDescription: `${name} ile telefon, WhatsApp veya teklif formu üzerinden 7/24 iletişime geçin.`,
        h1: `Hemen İletişime Geçin & Hızlı Teklif Alın`,
        h2s: ["İletişim Kanalları", "Konum & Yol Tarifi", "Hızlı Mesaj Formu"]
      }
    }
  };

  allProfiles[site.id] = newProfile;
  saveRegisteredSmeSeoProfiles(allProfiles);
  return newProfile;
}

/**
 * Applies a revised proposal to the SME site and saves to storage.
 */
export function applyRevisionToSmeSite(
  siteId: string,
  pageKey: "home" | "services" | "about" | "contact",
  proposal: SeoContentRevisionProposal
): RegisteredSmeSeoProfile {
  const allProfiles = getRegisteredSmeSeoProfiles();
  const profile = allProfiles[siteId];

  if (profile) {
    if (!profile.pages[pageKey]) {
      profile.pages[pageKey] = {
        metaTitle: "",
        metaDescription: "",
        h1: "",
        h2s: []
      };
    }

    profile.pages[pageKey]!.metaTitle = proposal.revisedTitle;
    profile.pages[pageKey]!.metaDescription = proposal.revisedMetaDescription;
    profile.pages[pageKey]!.h1 = proposal.revisedH1;
    profile.pages[pageKey]!.h2s = proposal.revisedH2s;

    profile.appliedRevision = {
      strategyKey: proposal.strategyKey,
      title: proposal.revisedTitle,
      description: proposal.revisedMetaDescription,
      h1: proposal.revisedH1,
      h2s: proposal.revisedH2s,
      appliedAt: new Date().toISOString()
    };

    allProfiles[siteId] = profile;
    saveRegisteredSmeSeoProfiles(allProfiles);
    return profile;
  }
  throw new Error(`Profile for site ${siteId} not found`);
}

/**
 * High-quality deterministic fallback for SEO Content Revision Tool
 * produces realistic, high-CTR Turkish revisions for any SME niche.
 */
export function generateFallbackSeoContentRevision(params: {
  siteId: string;
  companyName: string;
  sector: string;
  city: string;
  domain: string;
  pageKey?: string;
  currentMetaTitle?: string;
  currentMetaDescription?: string;
  currentH1?: string;
  currentH2s?: string[];
  targetKeywords?: string[];
  preferredStrategy?: SeoRevisionStrategyKey;
}): SeoContentRevisionResponse {
  const {
    siteId,
    companyName,
    sector,
    city = "İstanbul",
    domain,
    pageKey = "home",
    currentMetaTitle = `${companyName} | Hizmetleri`,
    currentMetaDescription = `${companyName} firması olarak hizmet vermekteyiz. Detaylar için sitemizi inceleyin.`,
    currentH1 = `${companyName} Hoş Geldiniz`,
    currentH2s = ["Hizmetlerimiz", "Hakkımızda", "İletişim"],
    targetKeywords = [
      `${city.toLowerCase()} ${sector.toLowerCase()}`,
      `en yakın ${sector.toLowerCase()}`,
      `7/24 ${sector.toLowerCase()}`,
      `${sector.toLowerCase()} fiyatları 2026`
    ]
  } = params;

  const currentTLength = currentMetaTitle.length;
  const currentDLength = currentMetaDescription.length;
  const currentPixelWidth = calculateGooglePixelWidth(currentMetaTitle);

  // Diagnostic issues
  const titleIssues: string[] = [];
  const descriptionIssues: string[] = [];
  const headingIssues: string[] = [];
  const keywordGaps: string[] = [];

  if (currentTLength < 45) {
    titleIssues.push(`Mevcut başlık çok kısa (${currentTLength} karakter). Google SERP'te ortalama 55-60 karakter yer kaplama hakkı ziyan ediliyor.`);
  } else if (currentTLength > 63) {
    titleIssues.push(`Mevcut başlık ${currentTLength} karakter; Google arama sonuçlarında '...' ile kesilme (truncation) riski yüksek.`);
  }

  if (!currentMetaTitle.toLocaleLowerCase("tr").includes(city.toLocaleLowerCase("tr"))) {
    titleIssues.push(`Başlıkta hedef coğrafi bölge (${city}) geçmiyor; yerel (Local SEO) aramalarda %60+ sıralama kaybı.`);
  }

  if (currentDLength < 130) {
    descriptionIssues.push(`Meta açıklama sadece ${currentDLength} karakter (Google 155 karaktere kadar gösterir). İkna edici detaylar eksik.`);
  }

  const ctaWords = ["hemen arayın", "teklif alın", "ulaşın", "tıklayın", "keşfedin", "inceleyin", "randevu alın", "çağırın"];
  const hasCta = ctaWords.some(w => currentMetaDescription.toLocaleLowerCase("tr").includes(w));
  if (!hasCta) {
    descriptionIssues.push("Meta açıklamada kullanıcıyı doğrudan harekete geçirecek güçlü bir eylem çağrısı (Call-to-Action) bulunmuyor.");
  }

  if (currentH1.includes("Hoş Geldiniz") || currentH1.length < 15) {
    headingIssues.push(`H1 ana başlığı ('${currentH1}') çok jenerik ve arama motoru niyetini (search intent) yansıtmıyor.`);
  } else {
    headingIssues.push("H1 başlığı kullanıcı sorununa çözüm ve net bir güven vaadi içermiyor.");
  }

  if (!currentH2s || currentH2s.length < 3) {
    headingIssues.push("H2 alt başlıkları semantik LSI zenginliğinden yoksun; Google sayfa derinliğini tam puanlamaz.");
  }

  targetKeywords.forEach(kw => {
    if (!currentMetaDescription.toLocaleLowerCase("tr").includes(kw.toLocaleLowerCase("tr"))) {
      keywordGaps.push(kw);
    }
  });

  const currentScore = Math.max(38, Math.min(68, Math.round(
    (currentTLength >= 45 && currentTLength <= 62 ? 30 : 15) +
    (currentDLength >= 130 && currentDLength <= 160 ? 30 : 15) +
    (hasCta ? 20 : 5) +
    (currentH1.length > 20 && !currentH1.includes("Hoş Geldiniz") ? 20 : 5)
  )));

  const predictedScore = 96;

  // Generate 4 tailored proposals
  const proposals: SeoContentRevisionProposal[] = [
    {
      id: "prop-1",
      strategyKey: "high_ctr",
      strategyName: "Yüksek Tıklama Oranı (CTR Booster)",
      strategyBadge: "En Çok Tercih Edilen",
      targetAudience: "Arama sonucunda hızlı, net ve avantajlı hizmet arayan potansiyel müşteriler",
      revisedTitle: `${city} ${sector} | 15 Dk Hızlı Müdahale & Sabit Fiyat`,
      revisedTitleCharCount: `${city} ${sector} | 15 Dk Hızlı Müdahale & Sabit Fiyat`.length,
      revisedTitlePixelWidth: calculateGooglePixelWidth(`${city} ${sector} | 15 Dk Hızlı Müdahale & Sabit Fiyat`),
      revisedMetaDescription: `${city} genelinde lisanslı ${sector.toLowerCase()} hizmeti. Sürpriz ücret yok, 15 dakikada hızlı adrese varış garantisi. Hemen arayın veya WhatsApp'tan tek tıkla teklif alın!`,
      revisedMetaDescriptionCharCount: `${city} genelinde lisanslı ${sector.toLowerCase()} hizmeti. Sürpriz ücret yok, 15 dakikada hızlı adrese varış garantisi. Hemen arayın veya WhatsApp'tan tek tıkla teklif alın!`.length,
      revisedH1: `${city} Bölgesinde 15 Dakikada Güvenilir ${sector} Hizmeti`,
      revisedH2s: [
        `Neden ${city} Genelinde En Çok Tercih Edilen Ekibiz?`,
        `Şeffaf ve Sabit Fiyat Tarifemiz (Ekstra Ücret Yok)`,
        `7/24 Kesintisiz Çağrı & Canlı WhatsApp Konum Desteği`,
        `Müşteri Memnuniyeti & %100 Hizmet Güvencesi`
      ],
      targetKeywordsIncluded: [`${city.toLowerCase()} ${sector.toLowerCase()}`, "sabit fiyat", "hızlı müdahale", "7/24"],
      expectedCtrBoost: "+48% Tıklama Artışı",
      projectedRankingBoost: "Google SERP İlk 3 Sıra",
      callToAction: "Hemen Arayın & Anında Fiyat Alın",
      whyItWorks: "Başlıkta tam SERP piksel sınırı kullanılmış, aciliyet (15 dk) ve şeffaf fiyat kancası birleştirilerek arama sonuçlarında rakipleri doğrudan ekarte eder.",
      googleSnippet: {
        title: `${city} ${sector} | 15 Dk Hızlı Müdahale & Sabit Fiyat`,
        url: `https://${domain}/`,
        description: `${city} genelinde lisanslı ${sector.toLowerCase()} hizmeti. Sürpriz ücret yok, 15 dakikada hızlı adrese varış garantisi. Hemen arayın veya WhatsApp'tan tek tıkla teklif alın!`,
        displayDate: "Bugün güncellendi"
      }
    },
    {
      id: "prop-2",
      strategyKey: "authority_eeat",
      strategyName: "E-E-A-T & Kurumsal Otorite",
      strategyBadge: "Kurumsal Prestij",
      targetAudience: "Güvenlik, kasko poliçesi, kurumsal fatura ve uzmanlık arayan bilinçli müşteriler",
      revisedTitle: `Uzman ${city} ${sector} | %100 Garantili & Kurumsal Hizmet`,
      revisedTitleCharCount: `Uzman ${city} ${sector} | %100 Garantili & Kurumsal Hizmet`.length,
      revisedTitlePixelWidth: calculateGooglePixelWidth(`Uzman ${city} ${sector} | %100 Garantili & Kurumsal Hizmet`),
      revisedMetaDescription: `12+ yıllık saha tecrübesi, sertifikalı uzman kadro ve %100 güvenceli ${sector.toLowerCase()} çözümleri. Kurumsal faturalı ve sigortalı destek için şimdi inceleyin.`,
      revisedMetaDescriptionCharCount: `12+ yıllık saha tecrübesi, sertifikalı uzman kadro ve %100 güvenceli ${sector.toLowerCase()} çözümleri. Kurumsal faturalı ve sigortalı destek için şimdi inceleyin.`.length,
      revisedH1: `${companyName} ile Profesyonel ve Sertifikalı ${sector} Çözümleri`,
      revisedH2s: [
        `Resmi Belgeli & Kasko Güvenceli Operasyon Sürecimiz`,
        `12 Yıllık Sektörel Uzmanlık ve Referanslarımız`,
        `Kurumsal Sözleşmeli Hizmet & GİB Onaylı E-Fatura`,
        `Sıkça Sorulan Sorular ve Güvence Şartlarımız`
      ],
      targetKeywordsIncluded: [`profesyonel ${sector.toLowerCase()}`, "garantili", "kurumsal", city.toLowerCase()],
      expectedCtrBoost: "+36% Kaliteli Lead Artışı",
      projectedRankingBoost: "Yüksek Otorite & Bilgi Paneli Uyumu",
      callToAction: "Detaylı Bilgi & Kurumsal Teklif Alın",
      whyItWorks: "Google'ın E-E-A-T (Deneyim, Uzmanlık, Yetkinlik, Güvenilirlik) algoritmalarına tam oturur. Yüksek sepet tutarlı kurumsal müşterileri çeker.",
      googleSnippet: {
        title: `Uzman ${city} ${sector} | %100 Garantili & Kurumsal Hizmet`,
        url: `https://${domain}/kurumsal`,
        description: `12+ yıllık saha tecrübesi, sertifikalı uzman kadro ve %100 güvenceli ${sector.toLowerCase()} çözümleri. Kurumsal faturalı ve sigortalı destek için şimdi inceleyin.`,
        displayDate: "2026 Sertifikalı"
      }
    },
    {
      id: "prop-3",
      strategyKey: "local_urgent",
      strategyName: "Yerel SEO & 7/24 Acil Çağrı",
      strategyBadge: "Harita & Acil Arama",
      targetAudience: "Yolda kalan, acil problem yaşayan ve telefonla hemen bir ustaya ulaşmak isteyen kullanıcılar",
      revisedTitle: `7/24 En Yakın ${city} ${sector} | 10 Dk'da Kapınızda`,
      revisedTitleCharCount: `7/24 En Yakın ${city} ${sector} | 10 Dk'da Kapınızda`.length,
      revisedTitlePixelWidth: calculateGooglePixelWidth(`7/24 En Yakın ${city} ${sector} | 10 Dk'da Kapınızda`),
      revisedMetaDescription: `Acil ${sector.toLowerCase()} mi lazım? ${city}'da en yakın mobil nöbetçi ekibimiz 10 dakikada yanınızda. Gece gündüz 7/24 kesintisiz çağrı merkezi. Tek dokunuşla hemen arayın!`,
      revisedMetaDescriptionCharCount: `Acil ${sector.toLowerCase()} mi lazım? ${city}'da en yakın mobil nöbetçi ekibimiz 10 dakikada yanınızda. Gece gündüz 7/24 kesintisiz çağrı merkezi. Tek dokunuşla hemen arayın!`.length,
      revisedH1: `7/24 Acil ${city} ${sector} - En Yakın Mobil Ekip Yanınızda`,
      revisedH2s: [
        `${city} İlçe ve Mahallelerine Ortalama Varış Sürelerimiz`,
        `Gece Nöbetçi & Acil Durum Müdahale Hattı`,
        `Mobil Araç Donanımımız ve Hızlı Çözüm Aşamaları`,
        `Doğrudan Çağrı & WhatsApp Canlı Konum Paylaşımı`
      ],
      targetKeywordsIncluded: [`en yakın ${sector.toLowerCase()}`, `7/24 acil ${sector.toLowerCase()}`, city.toLowerCase()],
      expectedCtrBoost: "+54% Mobil Arama Dönüşümü",
      projectedRankingBoost: "Google Haritalar & Yerel 3-Pack Liderliği",
      callToAction: "Acil Çağrı Hattı: Tek Dokunuşla Bağlan",
      whyItWorks: "'En yakın' ve '7/24 acil' sorguları Google'da en yüksek dönüşüm getiren yerel aramalardır. Mobil SERP'te doğrudan telefon araması tetikler.",
      googleSnippet: {
        title: `7/24 En Yakın ${city} ${sector} | 10 Dk'da Kapınızda`,
        url: `https://${domain}/acil-hizmet`,
        description: `Acil ${sector.toLowerCase()} mi lazım? ${city}'da en yakın mobil nöbetçi ekibimiz 10 dakikada yanınızda. Gece gündüz 7/24 kesintisiz çağrı merkezi. Tek dokunuşla hemen arayın!`,
        displayDate: "Canlı Nöbetçi Ekip"
      }
    },
    {
      id: "prop-4",
      strategyKey: "value_pricing",
      strategyName: "Fiyat Şeffaflığı & Uygun Maliyet",
      strategyBadge: "Fiyat / Fayda Lideri",
      targetAudience: "Fiyat karşılaştırması yapan, bütçe dostu ve ekonomik teklif arayan kullanıcılar",
      revisedTitle: `2026 ${city} ${sector} Fiyatları | En Uygun Teklif & İndirim`,
      revisedTitleCharCount: `2026 ${city} ${sector} Fiyatları | En Uygun Teklif & İndirim`.length,
      revisedTitlePixelWidth: calculateGooglePixelWidth(`2026 ${city} ${sector} Fiyatları | En Uygun Teklif & İndirim`),
      revisedMetaDescription: `2026 güncel ${city} ${sector.toLowerCase()} fiyat tarifesi ve özel indirimler. Ek masraf yok, en uygun fiyat garantisi. Ücretsiz keşif ve fiyat teklifi için hemen tıklayın!`,
      revisedMetaDescriptionCharCount: `2026 güncel ${city} ${sector.toLowerCase()} fiyat tarifesi ve özel indirimler. Ek masraf yok, en uygun fiyat garantisi. Ücretsiz keşif ve fiyat teklifi için hemen tıklayın!`.length,
      revisedH1: `2026 Yılı Güncel ${city} ${sector} Fiyat Listesi & Maliyet Rehberi`,
      revisedH2s: [
        `Hizmet Kalemlerine Göre Şeffaf Fiyatlandırma Tablosu`,
        `Neden En Ekonomik ve Kaliteli Hizmeti Sunabiliyoruz?`,
        `Toplu ve Kurumsal Alımlarda Özel İskonto Avantajları`,
        `Anında Online Fiyat Hesaplama ve Teklif Formu`
      ],
      targetKeywordsIncluded: [`${sector.toLowerCase()} fiyatları 2026`, "en uygun teklif", "fiyat listesi", city.toLowerCase()],
      expectedCtrBoost: "+42% Tıklama Oranı",
      projectedRankingBoost: "Google Ticari Intent Aramalarında 1. Sayfa",
      callToAction: "Güncel Fiyat Listesini İnceleyin",
      whyItWorks: "Kullanıcılar satın almadan önce mutlaka 'fiyatları' ve '2026' sorgusu yapar. Yılı içeren güncel fiyat başlıkları rakiplerin generic metinlerini %40'tan fazla geçer.",
      googleSnippet: {
        title: `2026 ${city} ${sector} Fiyatları | En Uygun Teklif & İndirim`,
        url: `https://${domain}/fiyatlar`,
        description: `2026 güncel ${city} ${sector.toLowerCase()} fiyat tarifesi ve özel indirimler. Ek masraf yok, en uygun fiyat garantisi. Ücretsiz keşif ve fiyat teklifi için hemen tıklayın!`,
        displayDate: "2026 Fiyat Tarifesi"
      }
    }
  ];

  const pagesBreakdown: SeoPageVariationItem[] = [
    {
      pageKey: "home",
      pageTitle: "Ana Sayfa",
      currentTitle: currentMetaTitle,
      currentDesc: currentMetaDescription,
      currentH1: currentH1,
      suggestedTitle: `${city} ${sector} | 15 Dk Hızlı Müdahale & Sabit Fiyat`,
      suggestedDesc: `${city} genelinde lisanslı ${sector.toLowerCase()} hizmeti. Sürpriz ücret yok, 15 dakikada hızlı adrese varış garantisi. Hemen arayın veya WhatsApp'tan tek tıkla teklif alın!`,
      suggestedH1: `${city} Bölgesinde 15 Dakikada Güvenilir ${sector} Hizmeti`,
      suggestedH2s: ["Neden Bizi Seçmelisiniz?", "Şeffaf Fiyat Politikamız", "7/24 Kesintisiz Destek"]
    },
    {
      pageKey: "services",
      pageTitle: "Hizmetlerimiz",
      currentTitle: `Hizmetlerimiz - ${companyName}`,
      currentDesc: `${companyName} sunduğu kaliteli hizmetler.`,
      currentH1: `${sector} Hizmetleri`,
      suggestedTitle: `Profesyonel ${city} ${sector} Hizmetleri | Lisanslı ve Garantili`,
      suggestedDesc: `${city} genelinde sunduğumuz tüm ${sector.toLowerCase()} hizmet detayları, şeffaf fiyatlar ve 7/24 randevu seçenekleri. İnceleyin ve anında talep oluşturun.`,
      suggestedH1: `${city} Kapsamında Sunduğumuz Tüm ${sector} Çözümleri`,
      suggestedH2s: ["Şehir İçi Hızlı Hizmet", "Ağır ve Özel Proje Çözümleri", "Mobil Yerinde Destek"]
    },
    {
      pageKey: "about",
      pageTitle: "Kurumsal & Hakkımızda",
      currentTitle: `Hakkımızda - ${companyName}`,
      currentDesc: `${companyName} kurumsal bilgileri ve geçmişi.`,
      currentH1: `Hakkımızda`,
      suggestedTitle: `Kurumsal ${companyName} | 12+ Yıllık ${sector} Deneyimi`,
      suggestedDesc: `${companyName}, ${city} bölgesinde 12 yılı aşkın tecrübe, sertifikalı uzman ekip ve %100 müşteri memnuniyetiyle hizmet verir. Değerlerimizi ve vizyonumuzu keşfedin.`,
      suggestedH1: `12 Yıllık Tecrübe ve Güvenle ${city}'dayız`,
      suggestedH2s: ["Sektörel Yolculuğumuz", "Kalite ve Güven Standartlarımız", "Ekip ve Teçhizatımız"]
    },
    {
      pageKey: "contact",
      pageTitle: "İletişim & Teklif",
      currentTitle: `İletişim - ${companyName}`,
      currentDesc: `Bize telefon ve mail ile ulaşabilirsiniz.`,
      currentH1: `İletişim`,
      suggestedTitle: `${companyName} İletişim | 7/24 Canlı Destek & WhatsApp Teklif`,
      suggestedDesc: `${city} ${sector.toLowerCase()} için 7/24 kesintisiz iletişim hattı. Tek tıkla WhatsApp konum gönderin veya arayın, 15 dakikada en yakın ekibimiz yanınızda olsun!`,
      suggestedH1: `Bize 7/24 Ulaşın: Telefon, WhatsApp & Canlı Konum`,
      suggestedH2s: ["Hemen Ara veya Mesaj Gönder", "Merkez Ofis ve Saha Lokasyonlarımız", "Hızlı Teklif Formu"]
    }
  ];

  const geminiExecutiveSummary = `Yapılan semantik ve SERP analizi sonucunda; ${companyName} sitesinin mevcut meta etiketlerinin ve H1 başlıklarının Google SERP piksel sınırlarını tam doldurmadığı, arama niyetine yönelik psikolojik eylem çağrılarından (CTA) yoksun olduğu ve yerel coğrafi arama hacmini (${city}) yeterince sahiplenmediği tespit edilmiştir. Hazırlanan 4 farklı revizyon seçeneği, sayfanın SEO İçerik Kalite Skorunu ${currentScore}/100 seviyesinden ${predictedScore}/100 seviyesine çıkarmakta ve tahmini %48'e varan organik tıklama (CTR) artışı sağlamaktadır.`;

  return {
    siteId,
    companyName,
    sector,
    city,
    domain,
    selectedPage: pageKey,
    analyzedAt: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    audit: {
      currentScore,
      predictedScore,
      scoreDelta: predictedScore - currentScore,
      titleIssues,
      descriptionIssues,
      headingIssues,
      keywordGaps,
      ctrRiskLevel: currentScore < 50 ? "high" : "medium",
      currentMetrics: {
        titleLength: currentTLength,
        titlePixelWidth: currentPixelWidth,
        descLength: currentDLength,
        hasCtaInDesc: hasCta,
        hasLocationInTitle: currentMetaTitle.toLocaleLowerCase("tr").includes(city.toLocaleLowerCase("tr")),
        hasUrgencyInTitle: /15|dakika|acil|7\/24|hızlı|hemen/i.test(currentMetaTitle),
        h1MatchesKeyword: targetKeywords.some(kw => currentH1.toLocaleLowerCase("tr").includes(kw.toLocaleLowerCase("tr")))
      }
    },
    proposals,
    pagesBreakdown,
    geminiExecutiveSummary,
    keyTargetKeywords: targetKeywords,
    source: "algorithmic_fallback"
  };
}
