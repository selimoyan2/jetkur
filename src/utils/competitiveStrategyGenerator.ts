import { 
  SiteConfig, 
  CompetitiveRadarAxisDef, 
  CompetitiveStrategyEntity, 
  CompetitiveStrategicAction 
} from "../types";

export const CORE_RADAR_AXES: CompetitiveRadarAxisDef[] = [
  {
    key: "domainAuthority",
    label: "Alan Adı Otoritesi (DA)",
    shortLabel: "Otorite (DA)",
    description: "Alan adının kök güven puanı, dofollow backlink kalitesi ve arama motorlarındaki genel domain gücü.",
    iconName: "ShieldCheck",
    unit: "/100",
    idealRange: "60 - 90+",
    fullMark: 100
  },
  {
    key: "keywordDensity",
    label: "Anahtar Kelime Yoğunluğu & Semantik Uyum",
    shortLabel: "Kelime Yoğunluğu",
    description: "Hedef sorguların sayfa içi doğal ve dengeli frekansı (%1.5-%2.5), LSI terimleri ve H1-H3 başlık hiyerarşisi.",
    iconName: "Target",
    unit: "/100",
    idealRange: "75 - 95",
    fullMark: 100
  },
  {
    key: "siteSpeed",
    label: "Site Hızı & Core Web Vitals",
    shortLabel: "Site Hızı (CWV)",
    description: "Google PageSpeed LCP, INP, CLS metrikleri, ilk bayt süresi (TTFB) ve Edge CDN küresel önbellek hızı.",
    iconName: "Zap",
    unit: "/100",
    idealRange: "90 - 100",
    fullMark: 100
  }
];

export const EXTENDED_RADAR_AXES: CompetitiveRadarAxisDef[] = [
  ...CORE_RADAR_AXES,
  {
    key: "backlinkProfile",
    label: "Backlink Kalitesi & Dijital PR",
    shortLabel: "Backlink Kalitesi",
    description: "Yetkili yerel ve sektörel sitelerden alınan güvenilir harici referans bağlantıları.",
    iconName: "Globe",
    unit: "/100",
    idealRange: "65 - 85+",
    fullMark: 100
  },
  {
    key: "contentDepth",
    label: "İçerik Kapsamı & Rehber Zenginliği",
    shortLabel: "İçerik Derinliği",
    description: "Sayfa başına düşen ortalama kelime sayısı, vaka analizleri ve kullanıcı niyetini eksiksiz karşılayan rehberler.",
    iconName: "FileText",
    unit: "/100",
    idealRange: "70 - 95",
    fullMark: 100
  },
  {
    key: "technicalSeo",
    label: "Teknik SEO & Şema Yapılandırması",
    shortLabel: "Teknik & Şema",
    description: "JSON-LD (LocalBusiness, FAQPage, Service), kanonik etiketler, mobil uyumluluk ve taranabilirlik puanı.",
    iconName: "Code2",
    unit: "/100",
    idealRange: "85 - 100",
    fullMark: 100
  }
];

/**
 * Computes realistic, sector-aware competitor data for the D3 radar chart
 * based on the user's current site configuration.
 */
export function buildCompetitiveStrategyData(config: SiteConfig): {
  entities: CompetitiveStrategyEntity[];
  coreAxes: CompetitiveRadarAxisDef[];
  extendedAxes: CompetitiveRadarAxisDef[];
  tacticalActions: CompetitiveStrategicAction[];
} {
  const company = config.companyName || "Bizim Firma";
  const sector = config.sector || "Evden Eve Nakliyat";
  const city = config.city || "İstanbul";
  const domain = config.cloudflare?.customDomain || `${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`;

  const cleanSector = sector.trim();
  const cleanCity = city.trim();

  // User baseline metrics derived from site configuration
  const blogCount = config.blog?.items?.length || 0;
  const serviceCount = config.services?.items?.length || 0;
  const hasFaq = (config.faqs?.items?.length || 0) > 0;
  const hasCustomDomain = Boolean(config.cloudflare?.customDomain);

  // User calculated scores
  const userDA = hasCustomDomain ? Math.min(85, 46 + (blogCount * 3)) : 38;
  const userKeywordDensity = Math.min(95, 68 + (serviceCount * 4) + (blogCount * 2));
  // Modern Vite + Tailwind + Cloudflare Edge gives superior site speed
  const userSpeed = 96; 
  const userBacklink = Math.min(90, 42 + (blogCount * 4));
  const userContentDepth = Math.min(92, 55 + (blogCount * 6) + (serviceCount * 3));
  const userTechnical = hasFaq ? 94 : 82;

  // Sector-tailored competitor naming
  const comp1Name = `Lider ${cleanSector} A.Ş.`;
  const comp1Domain = `eniyi${cleanSector.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  
  const comp2Name = `${cleanCity} Uzman ${cleanSector}`;
  const comp2Domain = `${cleanCity.toLowerCase().replace(/[^a-z0-9]/g, "")}${cleanSector.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`;

  const comp3Name = `Merkez ${cleanSector} Çözümleri`;
  const comp3Domain = `pro${cleanSector.toLowerCase().replace(/[^a-z0-9]/g, "")}.net`;

  const entities: CompetitiveStrategyEntity[] = [
    {
      id: "user-site",
      name: `${company} (Siteniz)`,
      domain: domain,
      isUser: true,
      color: "#06b6d4", // Cyan 500
      fillColor: "rgba(6, 182, 212, 0.25)",
      rank: 2,
      marketShare: "%24 Pazar Payı",
      estimatedMonthlyTraffic: "6.8K Ziyaretçi",
      metrics: {
        domainAuthority: userDA,
        keywordDensity: userKeywordDensity,
        siteSpeed: userSpeed,
        backlinkProfile: userBacklink,
        contentDepth: userContentDepth,
        technicalSeo: userTechnical
      },
      keyStrengths: [
        "Mükemmel Core Web Vitals ve anında yüklenen Edge CDN altyapısı (96/100 hız)",
        "Dinamik schema.org JSON-LD yerel işletme ve zengin snippet desteği",
        "Kullanıcı odaklı modern arayüz ve yüksek mobil dönüşüm oranı"
      ],
      vulnerabilities: [
        "1. sıradaki köklü rakibe kıyasla daha az sayıda harici dofollow backlink",
        "Derinlemesine 2000+ kelimelik teknik kılavuz sayfalarının henüz tamamlanmamış olması"
      ]
    },
    {
      id: "comp-1",
      name: comp1Name,
      domain: comp1Domain,
      isUser: false,
      color: "#f59e0b", // Amber 500
      fillColor: "rgba(245, 158, 11, 0.15)",
      rank: 1,
      marketShare: "%42 Pazar Payı",
      estimatedMonthlyTraffic: "18.4K Ziyaretçi",
      metrics: {
        domainAuthority: 79,
        keywordDensity: 86,
        siteSpeed: 64, // Slow speed - major strategic wedge!
        backlinkProfile: 84,
        contentDepth: 88,
        technicalSeo: 76
      },
      keyStrengths: [
        "10+ yıllık alan adı yaşı ve yüksek sayıda sektörel dofollow backlink",
        "120+ dizine eklenmiş alt sayfa ve yüksek aranma hacimli jenerik kelimelerde liderlik"
      ],
      vulnerabilities: [
        "Ağır CMS altyapısı ve yavaş mobil yüklenme süresi (LCP > 3.4 saniye)",
        "Eski tip içerik tasarımı ve yetersiz yerel semt bazlı dinamik güncellemeler"
      ]
    },
    {
      id: "comp-2",
      name: comp2Name,
      domain: comp2Domain,
      isUser: false,
      color: "#f43f5e", // Rose 500
      fillColor: "rgba(244, 63, 94, 0.15)",
      rank: 3,
      marketShare: "%21 Pazar Payı",
      estimatedMonthlyTraffic: "5.4K Ziyaretçi",
      metrics: {
        domainAuthority: 62,
        keywordDensity: 81,
        siteSpeed: 76,
        backlinkProfile: 59,
        contentDepth: 68,
        technicalSeo: 74
      },
      keyStrengths: [
        `${cleanCity} yerel harita ve semt bazlı anahtar kelimelerde güçlü organik varlık`,
        "Müşteri yorumları ve Google Haritalar profil entegrasyonu"
      ],
      vulnerabilities: [
        "Blog içeriklerinin yüzeysel olması (ortalama 550 kelime)",
        "Alan adı otoritesi (DA) orta seviyede ve yeni backlink kazanımı duraklamış durumda"
      ]
    },
    {
      id: "comp-3",
      name: comp3Name,
      domain: comp3Domain,
      isUser: false,
      color: "#8b5cf6", // Violet 500
      fillColor: "rgba(139, 92, 246, 0.15)",
      rank: 4,
      marketShare: "%13 Pazar Payı",
      estimatedMonthlyTraffic: "3.2K Ziyaretçi",
      metrics: {
        domainAuthority: 49,
        keywordDensity: 66,
        siteSpeed: 82,
        backlinkProfile: 44,
        contentDepth: 52,
        technicalSeo: 68
      },
      keyStrengths: [
        "Doğrudan arama ve WhatsApp iletişim odaklı kısa teklif sayfaları",
        "Sosyal medya reklamları üzerinden gelen dönüşüm hacmi"
      ],
      vulnerabilities: [
        "Düşük anahtar kelime yoğunluğu ve eksik semantik başlık yapısı",
        "FAQ, Hizmet ve Yazar şeması gibi temel teknik SEO etiketleri eksik"
      ]
    }
  ];

  // Tactical recommendations based on gaps
  const tacticalActions: CompetitiveStrategicAction[] = [
    {
      id: "act-speed-leverage",
      metricKey: "siteSpeed",
      metricLabel: "Site Hızı & Core Web Vitals",
      title: `1. Rakibin (${comp1Name}) Hız Zafiyetini SERP'te Koz Olarak Kullanın`,
      priority: "Kritik",
      impactScore: "+45% Mobil Dönüşüm & Sıralama Artışı",
      currentGap: userSpeed - 64, // +32 points ahead!
      strategySummary: `Sitenizin hızı 96/100 iken pazar lideri 64/100 ile açılıyor. Google'ın Page Experience ve INP algoritmasında bu devasa avantajı öne çıkararak ilk sıraya tırmanın.`,
      actionSteps: [
        `Google Search Console'da Core Web Vitals raporunun "İyi" (Yeşil) durumunu doğrulayın.`,
        `Meta başlık ve açıklamalara "15 Dk İçinde Fiyat Teklifi & Kesintisiz Hızlı Destek" ibaresini ekleyin.`,
        `Mobil sayfa girişine hızlı iletişim butonları (Tek tıkla Ara / WhatsApp) yerleştirerek hemen çıkma oranını %25'in altına çekin.`
      ],
      targetCompetitorName: comp1Name,
      targetTab: "performance-monitor",
      quickActionLabel: "Hız & Performans Panelini İncele"
    },
    {
      id: "act-keyword-density",
      metricKey: "keywordDensity",
      metricLabel: "Anahtar Kelime Yoğunluğu",
      title: `Semantik Kelime Yoğunluğunu %1.8 Seviyesine Optimize Edin`,
      priority: "Yüksek",
      impactScore: "+380 Aylık Hedefli Tıklama",
      currentGap: userKeywordDensity - 86, // -8 points trailing comp1
      strategySummary: `1. Rakip ${cleanSector} ile ilgili uzun kuyruklu (long-tail) aramalarda zengin içerik sunuyor. İçeriklerinizi spam yapmadan LSI varyasyonlarıyla zenginleştirin.`,
      actionSteps: [
        `H2 ve H3 başlıklarına "${cleanCity} ${cleanSector} fiyatları 2026", "güvenilir ${cleanSector.toLowerCase()}" varyasyonlarını ekleyin.`,
        `Anahtar kelime yoğunluğunu tüm gövde metninde %1.5 - %2.2 aralığında dengeli dağıtın.`,
        `AI Blog Motoru üzerinden eksik kalan semantik konular için 1200+ kelimelik vaka analizleri üretin.`
      ],
      targetCompetitorName: comp1Name,
      targetTab: "ai-content-planner",
      quickActionLabel: "AI İçerik Planlayıcıyı Aç"
    },
    {
      id: "act-domain-authority",
      metricKey: "domainAuthority",
      metricLabel: "Alan Adı Otoritesi (DA)",
      title: `Yerel Dijital PR ve Nitelikli Backlink ile DA Farkını Kapatın`,
      priority: "Yüksek",
      impactScore: "+14 DA Puan Artışı & Kalıcı İlk 3",
      currentGap: userDA - 79, // trailing
      strategySummary: `Pazar lideri 79 DA skoruyla liderliğini koruyor. Sitenizin otoritesini yerel firma dizinleri, sanayi/ticaret odası profilleri ve sektörel basın bültenleriyle yükseltin.`,
      actionSteps: [
        `Google Haritalar İşletme Profilinizi web sitesine canonical URL ile bağlayın.`,
        `${cleanCity} yerel rehberleri, sarı sayfalar ve sektörel portallara tutarlı NAP (İsim, Adres, Telefon) bilgisiyle kaydolun.`,
        `Sektörel bloglara konuk yazar olarak bilgilendirici rehberler sunup dofollow referans bağlantı kazanın.`
      ],
      targetCompetitorName: comp1Name,
      targetTab: "competitive-seo",
      quickActionLabel: "Rakip Analiz Tablosuna Git"
    }
  ];

  return {
    entities,
    coreAxes: CORE_RADAR_AXES,
    extendedAxes: EXTENDED_RADAR_AXES,
    tacticalActions
  };
}
