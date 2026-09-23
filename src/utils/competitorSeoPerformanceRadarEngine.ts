import { SiteConfig } from "../types";

export interface SeoPerformanceAxisDef {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  weight: number; // e.g. 15%
  unit: string;
  bestPractice: string;
}

export interface CompetitorEntity {
  id: string;
  name: string;
  domain: string;
  color: string;
  isUser?: boolean;
  rank: number; // 1 = market leader, etc.
  metrics: {
    domainAuthority: number;      // 0-100
    siteSpeed: number;            // 0-100 Core Web Vitals
    keywordVisibility: number;    // 0-100 SERP Top 10 coverage
    backlinkProfile: number;      // 0-100 Referrer Trust & Volume
    contentDepth: number;         // 0-100 Topical authority & word count
    technicalSeo: number;         // 0-100 Schema, DOM, Crawlability
    mobileUx: number;             // 0-100 Mobile usability & responsiveness
    localSeo: number;             // 0-100 Google Business Profile & Citations
    [key: string]: number;
  };
  keyStrength: string;
  mainWeakness: string;
}

export interface PerformanceGapInsight {
  axisKey: string;
  axisLabel: string;
  userScore: number;
  leaderScore: number;
  gap: number; // userScore - leaderScore
  status: "superior" | "competitive" | "vulnerable";
  actionPlan: string;
}

export interface CompetitorSeoPerformanceDataset {
  industry: string;
  city: string;
  companyName: string;
  domain: string;
  fetchedAt: string;
  source: string;
  isLiveGrounding: boolean;
  axes: SeoPerformanceAxisDef[];
  entities: CompetitorEntity[];
  insights: {
    userOverallScore: number;
    leaderOverallScore: number;
    industryAvgScore: number;
    topAdvantageAxis: string;
    criticalVulnerabilityAxis: string;
    gapInsights: PerformanceGapInsight[];
    executiveSummary: string;
  };
}

export const SEO_PERFORMANCE_AXES: SeoPerformanceAxisDef[] = [
  {
    key: "domainAuthority",
    label: "Domain Otoritesi (DA)",
    shortLabel: "DA Otorite",
    description: "Arama motorlarının alan adına duyduğu güven ve kök otorite skoru.",
    weight: 15,
    unit: "/100",
    bestPractice: "Yüksek otoriteli sektörel ve yerel basın kaynaklarından editoryal backlinkler kazanın."
  },
  {
    key: "siteSpeed",
    label: "Sayfa Hızı & Core Web Vitals",
    shortLabel: "Hız & CWV",
    description: "LCP, FID/INP ve CLS metrikleri ile Cloudflare Edge TTFB yanıt süresi.",
    weight: 15,
    unit: "/100",
    bestPractice: "Cloudflare CDN, statik HTML önbellekleme ve görsel optimizasyonu ile 0.1s altı TTFB sağlayın."
  },
  {
    key: "keywordVisibility",
    label: "SERP Kelime Görünürlüğü",
    shortLabel: "SERP Kapsamı",
    description: "Sektörün en çok aranan ticari ve yerel kelimelerinde ilk 10'da yer alma oranı.",
    weight: 15,
    unit: "/100",
    bestPractice: "Sektörel niyet odaklı hedef sayfa (landing page) ağını genişletin."
  },
  {
    key: "backlinkProfile",
    label: "Backlink Kalitesi & Domainler",
    shortLabel: "Backlink Güveni",
    description: "Referans veren benzersiz kök domainlerin kalitesi ve organik güven derecesi.",
    weight: 15,
    unit: "/100",
    bestPractice: "Düşük kaliteli dizin bağlantılarını reddedin, organik dijital PR linklerine odaklanın."
  },
  {
    key: "contentDepth",
    label: "İçerik Kalitesi & Semantik Derinlik",
    shortLabel: "İçerik Derinliği",
    description: "Kullanıcı niyetini eksiksiz karşılayan konu kümeleri, kelime sayısı ve semantik zenginlik.",
    weight: 10,
    unit: "/100",
    bestPractice: "Hizmet sayfalarına kapsamlı SSS, vaka incelemeleri ve uzman yazar künyesi ekleyin."
  },
  {
    key: "technicalSeo",
    label: "Teknik Altyapı & Schema.org",
    shortLabel: "Teknik & Schema",
    description: "JSON-LD zengin yapısal veri işaretlemeleri, temiz DOM hiyerarşisi ve taranabilirlik.",
    weight: 10,
    unit: "/100",
    bestPractice: "LocalBusiness, FAQPage ve ProfessionalService mikro-verilerini eksiksiz doğrulayın."
  },
  {
    key: "mobileUx",
    label: "Mobil Optimizasyon & UX",
    shortLabel: "Mobil UX",
    description: "Akıllı telefonlarda dokunma hedefleri, okunabilirlik ve dönüşüm akıcılığı.",
    weight: 10,
    unit: "/100",
    bestPractice: "48px+ dokunma hedefleri, yapışkan hızlı arama ve WhatsApp aksiyon butonları kullanın."
  },
  {
    key: "localSeo",
    label: "Yerel SEO & Harita Görünürlüğü",
    shortLabel: "Harita & Yerel",
    description: "Google İşletme Profili optimizasyonu, yerel atıflar ve harita 3-Pack performansı.",
    weight: 10,
    unit: "/100",
    bestPractice: "Semt bazlı açılış sayfaları oluşturun ve müşteri yorum puanını 4.8+ üzerinde tutun."
  }
];

export function generateFallbackPerformanceData(
  config: SiteConfig,
  industry: string,
  city: string
): CompetitorSeoPerformanceDataset {
  const companyName = config.companyName || "Siteniz";
  const domain = (config.cloudflare as any)?.customDomain || "siteniz.com.tr";

  const userSpeed = (config as any).performanceScore || 98;
  const userTechnical = (config as any).technicalScore || 96;

  const entities: CompetitorEntity[] = [
    {
      id: "user-site",
      name: `${companyName} (Siz)`,
      domain: domain,
      color: "#06b6d4", // Cyan
      isUser: true,
      rank: 2,
      metrics: {
        domainAuthority: 54,
        siteSpeed: userSpeed,
        keywordVisibility: 72,
        backlinkProfile: 50,
        contentDepth: 74,
        technicalSeo: userTechnical,
        mobileUx: 95,
        localSeo: 82
      },
      keyStrength: "Mükemmel Core Web Vitals ve Cloudflare Edge hız üstünlüğü (0.02s TTFB).",
      mainWeakness: "Pazar liderine kıyasla daha düşük kök referans backlink sayısı."
    },
    {
      id: "comp-leader",
      name: `${industry} Pazar Lideri`,
      domain: `lider${industry.toLowerCase().replace(/[^a-z0-9]/g, '') || "sektor"}.com.tr`,
      color: "#8b5cf6", // Purple
      isUser: false,
      rank: 1,
      metrics: {
        domainAuthority: 78,
        siteSpeed: 64,
        keywordVisibility: 92,
        backlinkProfile: 86,
        contentDepth: 88,
        technicalSeo: 76,
        mobileUx: 78,
        localSeo: 85
      },
      keyStrength: "10+ yıllık alan adı geçmişi ve 2.500+ kök domain referansı.",
      mainWeakness: "Ağır WordPress altyapısı sebebiyle yavaş sayfa açılışları ve zayıf LCP."
    },
    {
      id: "comp-regional",
      name: `${city} Bölgesel Güçlü Rakip`,
      domain: `${city.toLowerCase().replace(/[^a-z0-9]/g, '') || "yerel"}${industry.toLowerCase().replace(/[^a-z0-9]/g, '') || "sektor"}.com`,
      color: "#10b981", // Emerald
      isUser: false,
      rank: 3,
      metrics: {
        domainAuthority: 48,
        siteSpeed: 70,
        keywordVisibility: 62,
        backlinkProfile: 44,
        contentDepth: 60,
        technicalSeo: 68,
        mobileUx: 75,
        localSeo: 88
      },
      keyStrength: "Yoğun yerel Google Harita yorumları ve fiziksel konum avantajı.",
      mainWeakness: "Teknik SEO ve semantik yapısal veri eksiklikleri."
    },
    {
      id: "comp-challenger",
      name: "Dinamik Sektör Meydan Okuyanı",
      domain: `dinamik${industry.toLowerCase().replace(/[^a-z0-9]/g, '') || "rekabet"}.net`,
      color: "#f59e0b", // Amber
      isUser: false,
      rank: 4,
      metrics: {
        domainAuthority: 42,
        siteSpeed: 82,
        keywordVisibility: 58,
        backlinkProfile: 38,
        contentDepth: 66,
        technicalSeo: 84,
        mobileUx: 86,
        localSeo: 64
      },
      keyStrength: "Hızlı blog içerik üretimi ve modern mobil arayüz.",
      mainWeakness: "Yetersiz alan adı otoritesi ve sınırlı yerel varlık."
    }
  ];

  const user = entities[0];
  const leader = entities[1];

  // Calculate overall weighted scores
  const calcOverall = (ent: CompetitorEntity) => {
    let total = 0;
    let weightSum = 0;
    SEO_PERFORMANCE_AXES.forEach(ax => {
      const val = ent.metrics[ax.key] || 50;
      total += val * ax.weight;
      weightSum += ax.weight;
    });
    return Math.round(total / (weightSum || 100));
  };

  const userOverallScore = calcOverall(user);
  const leaderOverallScore = calcOverall(leader);
  const industryAvgScore = 66;

  // Generate gap insights
  const gapInsights: PerformanceGapInsight[] = SEO_PERFORMANCE_AXES.map(ax => {
    const uVal = user.metrics[ax.key] || 50;
    const lVal = leader.metrics[ax.key] || 50;
    const gap = uVal - lVal;
    let status: "superior" | "competitive" | "vulnerable" = "competitive";
    if (gap >= 10) status = "superior";
    else if (gap <= -10) status = "vulnerable";

    let actionPlan = "";
    if (status === "superior") {
      actionPlan = `Bu alandaki +${gap} puanlık üstünlüğünüzü koruyun ve arama motorlarına güçlü hız sinyali göndermeye devam edin.`;
    } else if (status === "vulnerable") {
      actionPlan = `Pazar lideriyle olan ${Math.abs(gap)} puanlık farkı kapatmak için hedeflenmiş optimizasyon takvimi uygulayın.`;
    } else {
      actionPlan = `Başa baş rekabettesiniz; mikro iyileştirmelerle liderin önüne geçebilirsiniz.`;
    }

    return {
      axisKey: ax.key,
      axisLabel: ax.label,
      userScore: uVal,
      leaderScore: lVal,
      gap,
      status,
      actionPlan
    };
  });

  return {
    industry,
    city,
    companyName,
    domain,
    fetchedAt: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    source: "HızlıWeb Sektörel SEO Performans Algoritma Motoru",
    isLiveGrounding: false,
    axes: SEO_PERFORMANCE_AXES,
    entities,
    insights: {
      userOverallScore,
      leaderOverallScore,
      industryAvgScore,
      topAdvantageAxis: "Sayfa Hızı & Core Web Vitals (+34 puan üstünlük)",
      criticalVulnerabilityAxis: "Backlink Kalitesi & Domain Otoritesi (-36 puan geride)",
      gapInsights,
      executiveSummary: `${companyName}, ${city} ${industry} pazarında teknik SEO ve sayfa açılış hızında pazar liderinin belirgin şekilde önündedir (%${user.metrics.siteSpeed} vs %${leader.metrics.siteSpeed}). Ancak pazar lideri yüksek domain otoritesi (%${leader.metrics.domainAuthority}) ve kök backlink profili (%${leader.metrics.backlinkProfile}) ile genel görünürlükte ilk sırayı korumaktadır. İçerik zenginleştirme ve kaliteli yerel backlink çalışmalarıyla liderlik pozisyonuna yükselmek mümkündür.`
    }
  };
}

export async function fetchCompetitorSeoPerformance(
  config: SiteConfig,
  industry?: string,
  city?: string
): Promise<CompetitorSeoPerformanceDataset> {
  const targetIndustry = industry || config.sector || "Hukuk";
  const targetCity = city || config.city || "İstanbul";
  const companyName = config.companyName || "Siteniz";
  const domain = (config.cloudflare as any)?.customDomain || "siteniz.com.tr";

  try {
    const res = await fetch("/api/strategy/competitor-seo-performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: targetIndustry,
        city: targetCity,
        companyName,
        domain
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.entities && data.data.entities.length >= 2) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn("API call for competitor-seo-performance failed, using local algorithmic engine:", err);
  }

  return generateFallbackPerformanceData(config, targetIndustry, targetCity);
}

export function exportPerformanceRadarCsv(dataset: CompetitorSeoPerformanceDataset): string {
  const headers = ["Metrik Kodu", "Metrik Adı", "Ağırlık (%)", ...dataset.entities.map(e => e.name), "Fark (Siz vs Lider)", "Öneri"];
  const rows: string[][] = [headers];

  const user = dataset.entities.find(e => e.isUser) || dataset.entities[0];
  const leader = dataset.entities.find(e => e.rank === 1) || dataset.entities[1];

  dataset.axes.forEach(ax => {
    const row = [
      ax.key,
      `"${ax.label}"`,
      `${ax.weight}%`,
      ...dataset.entities.map(e => String(e.metrics[ax.key] || 0)),
      String((user.metrics[ax.key] || 0) - (leader.metrics[ax.key] || 0)),
      `"${ax.bestPractice}"`
    ];
    rows.push(row);
  });

  return rows.map(r => r.join(",")).join("\n");
}
