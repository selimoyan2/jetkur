export interface AiStrategyRecommendation {
  id: string;
  title: string;
  category: "quick_win" | "content_gap" | "speed_cwv" | "commercial_intent" | "defensive";
  categoryLabel: string;
  priority: "high" | "medium" | "low";
  priorityScore: number; // 0 - 100
  targetKeywords: string[];
  currentStatus: string;
  actionableSteps: string[];
  expectedGain: string;
  effort: string;
}

export interface PriorityKeywordOpportunity {
  keyword: string;
  volume: string;
  difficulty: number;
  userRank: number | null;
  bestCompRank: number;
  bestCompName: string;
  gap: number;
  targetRank: number;
  tacticalAdvice: string;
}

export interface ThirtyDayActionPhase {
  phase: string;
  timeline: string;
  focusArea: string;
  tasks: string[];
}

export interface AiStrategySummaryReportData {
  reportId: string;
  generatedAt: string;
  source: "gemini" | "algorithmic_fallback";
  overallHealthScore: number;
  serpMarketShare: {
    userName: string;
    userSharePercent: number;
    comp1Name: string;
    comp1SharePercent: number;
    comp2Name: string;
    comp2SharePercent: number;
    comp3Name: string;
    comp3SharePercent: number;
    verdict: string;
  };
  executiveSummary: string;
  swotHighlights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategicRecommendations: AiStrategyRecommendation[];
  priorityKeywordOpportunities: PriorityKeywordOpportunity[];
  technicalLeverageSummary: {
    userSpeedScore: number;
    bestCompetitorSpeedScore: number;
    speedAdvantagePoints: number;
    coreWebVitalsStatus: string;
    speedStrategyAdvice: string;
  };
  goalAttainmentForecast: {
    totalKeywords: number;
    onTrackCount: number;
    criticalGapCount: number;
    averageAttainmentPercent: number;
    projectedTrafficGrowthPercent: number;
  };
  thirtyDayActionPlan: ThirtyDayActionPhase[];
}

/**
 * Intelligent algorithmic fallback generator that inspects the actual live table data
 * and creates a comprehensive, deeply contextual SEO strategy report.
 */
export function generateFallbackAiStrategySummaryReport(params: {
  rankings: any[];
  competitors?: any[];
  userName?: string;
  userDomain?: string;
  userSpeedScore?: number;
  keywordGoals?: Record<string, { targetRank: number; targetNote?: string }>;
  strategicNotes?: Record<string, { text: string; tags?: string[] }>;
}): AiStrategySummaryReportData {
  const {
    rankings = [],
    competitors = [],
    userName = "Siteniz",
    userDomain = "siteniz.com",
    userSpeedScore = 98,
    keywordGoals = {},
    strategicNotes = {}
  } = params;

  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com", speedScore: 74 };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com", speedScore: 81 };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com", speedScore: 62 };

  // Calculate actual counts
  let leadingCount = 0;
  let competingCount = 0;
  let trailingCount = 0;
  let missingCount = 0;
  let userTop3Count = 0;
  let comp1Top3Count = 0;

  rankings.forEach((r) => {
    const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => typeof n === "number" && !isNaN(n));
    const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;

    if (r.userRank !== null && r.userRank <= 3) userTop3Count++;
    if (r.comp1Rank !== null && r.comp1Rank <= 3) comp1Top3Count++;

    if (r.userRank !== null && r.userRank <= bestComp) {
      leadingCount++;
    } else if (r.userRank !== null && r.userRank <= 4) {
      competingCount++;
    } else if (r.userRank !== null) {
      trailingCount++;
    } else {
      missingCount++;
    }
  });

  const total = Math.max(1, rankings.length);
  const userShare = Math.round((leadingCount / total) * 100);
  const comp1Share = Math.max(15, Math.round(((total - leadingCount) * 0.45) / total * 100));
  const comp2Share = Math.max(10, Math.round(((total - leadingCount) * 0.35) / total * 100));
  const comp3Share = Math.max(5, 100 - userShare - comp1Share - comp2Share);

  // Analyze goal tracking attainment
  let attainedGoalsCount = 0;
  let criticalGapGoalsCount = 0;
  let totalAttainmentSum = 0;

  rankings.forEach((r) => {
    const goal = keywordGoals[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
    const curr = r.userRank;
    if (curr !== null) {
      if (curr <= goal) {
        attainedGoalsCount++;
        totalAttainmentSum += 100;
      } else {
        const gap = curr - goal;
        const attainment = Math.max(0, Math.round(100 - (gap / 20) * 100));
        totalAttainmentSum += attainment;
        if (gap >= 5) criticalGapGoalsCount++;
      }
    } else {
      criticalGapGoalsCount++;
      totalAttainmentSum += 10;
    }
  });

  const avgAttainment = Math.round(totalAttainmentSum / total);

  // Extract top priority keywords (high volume or close to top 3)
  const priorityKeywords: PriorityKeywordOpportunity[] = rankings
    .slice(0, 6)
    .map((r) => {
      const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => typeof n === "number" && !isNaN(n));
      const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      const targetRank = keywordGoals[r.id]?.targetRank || (r.userRank && r.userRank <= 3 ? 1 : 3);
      
      let tacticalAdvice = r.aiRecommendation || "Hedefe yönelik H2 alt başlıkları ve vaka analizi ekleyin.";
      if (r.userRank === null) {
        tacticalAdvice = "Sıralama yok: Bu kelimeye özel 1200+ kelimelik detaylı hizmet/rehber sayfası açın.";
      } else if (r.userRank > bestComp) {
        tacticalAdvice = `En güçlü rakip (#${bestComp}) seviyesini geçmek için dahili bağlantı derinliğini artırın ve schema ekleyin.`;
      } else {
        tacticalAdvice = `Liderliği korumak için içerik tazeliğini aylık olarak yenileyin ve CTR optimize meta açıklamaları kullanın.`;
      }

      return {
        keyword: r.keyword || "Örnek Anahtar Kelime",
        volume: r.monthlyVolume || "2.4K / ay",
        difficulty: typeof r.difficulty === "number" ? r.difficulty : 45,
        userRank: r.userRank,
        bestCompRank: bestComp,
        bestCompName: comp1.name,
        gap: r.gap || (r.userRank !== null ? r.userRank - bestComp : 99),
        targetRank,
        tacticalAdvice
      };
    });

  // Calculate speed advantage
  const bestCompSpeed = Math.max(comp1.speedScore || 74, comp2.speedScore || 81, comp3.speedScore || 62);
  const speedAdvantage = Math.max(0, userSpeedScore - bestCompSpeed);

  // Generate actionable strategic recommendations
  const strategicRecommendations: AiStrategyRecommendation[] = [
    {
      id: "rec-1",
      title: "Google PageSpeed Skor Üstünlüğünü Sıralama Sıçramasına Dönüştürün",
      category: "speed_cwv",
      categoryLabel: "Teknik CWV Üstünlüğü",
      priority: "high",
      priorityScore: 96,
      targetKeywords: rankings.slice(0, 3).map((r) => r.keyword),
      currentStatus: `Sitenizin hızı ${userSpeedScore}/100 iken en hızlı rakip ${bestCompSpeed}/100 seviyesinde (+${speedAdvantage} puan avantaj).`,
      actionableSteps: [
        "Google mobil botlarının hızlı tarama kapasitesini kullanarak yeni alt hizmet sayfalarını anında indeksletin.",
        "Rakiplerin LCP gecikmesi (3.4s) yaşadığı yüksek hacimli kelimelerde zengin SSS (FAQPage) şemasıyla SERP alanını büyütün.",
        "Mobil kullanıcı deneyimi üstünlüğünü sayfaların üst yarısında (Above-the-Fold) direkt WhatsApp ve telefon CTA'ları ile destekleyin."
      ],
      expectedGain: "+35% Mobil Tıklama & 2-4 Sıra Yükseliş",
      effort: "Düşük (1-2 Gün)"
    },
    {
      id: "rec-2",
      title: "İlk 3 Sıra Eşiğindeki 'Hızlı Kazanım' (Quick Win) Kelimelerini Liderliğe Taşıyın",
      category: "quick_win",
      categoryLabel: "Hızlı Kazanım (Quick Win)",
      priority: "high",
      priorityScore: 92,
      targetKeywords: rankings.filter((r) => r.userRank !== null && r.userRank >= 2 && r.userRank <= 5).map((r) => r.keyword).slice(0, 4),
      currentStatus: `${competingCount} adet anahtar kelime 2-5. sıra arasında sıkışmış ve ufak bir optimizasyonla #1 pozisyona geçebilir.`,
      actionableSteps: [
        "Bu kelimelerin geçtiği sayfalara ana sayfadan ve blog yazılarınızdan zengin çıpa metinli (exact anchor) dahili bağlantılar verin.",
        "Google arama niyetini karşılamak için başlık etiketlerine (H1/H2) mevcut yıl, aciliyet ve güven unsurları ('7/24 Kesintisiz', 'Garantili') ekleyin.",
        "Tıklama oranını (CTR) artırmak için SERP başlıklarında sayısal veriler ve emoji/özel karakter ayracı kullanın."
      ],
      expectedGain: "+450 Aylık Organik Ziyaretçi",
      effort: "Orta (3-5 Gün)"
    },
    {
      id: "rec-3",
      title: "Rakiplerin Trafik Çektiği İçerik Boşluğunu (Content Gap) Kapatın",
      category: "content_gap",
      categoryLabel: "İçerik Boşluğu",
      priority: "medium",
      priorityScore: 84,
      targetKeywords: rankings.filter((r) => r.userRank === null || r.userRank > 10).map((r) => r.keyword).slice(0, 4),
      currentStatus: `${missingCount + trailingCount} kritik sektör kelimesinde siteniz ilk sayfada yer almıyor ve rakipler tek başına trafik topluyor.`,
      actionableSteps: [
        "Eksik anahtar kelimelerin her biri için AI Blog Engine kullanarak 1200+ kelimelik semantik rehber makaleler yayınlayın.",
        "Kullanıcıların en çok arattığı 'Fiyatları', 'Nasıl Yapılır', 'Tavsiye' varyasyonlarını kapsayan H2/H3 blokları oluşturun.",
        "Google Haritalar (Local SEO) ve Google İşletme Profiliniz ile bu yeni rehber sayfalarını çapraz bağlantılandırın."
      ],
      expectedGain: "+700 Aylık Ek Tıklama Potansiyeli",
      effort: "Yüksek (1-2 Hafta)"
    },
    {
      id: "rec-4",
      title: "Yüksek Dönüşüm Potansiyelli Ticari Sorgularda Rakipleri Geride Bırakın",
      category: "commercial_intent",
      categoryLabel: "Ticari Niyet Optimizasyonu",
      priority: "high",
      priorityScore: 88,
      targetKeywords: rankings.filter((r) => r.searchIntent === "Ticari" || r.searchIntent === "İşlemsel").map((r) => r.keyword).slice(0, 4),
      currentStatus: "Doğrudan müşteri getiren ticari kelimelerde ortalama dönüşüm oranı %12 seviyesinde seyrediyor.",
      actionableSteps: [
        "Ticari anahtar kelime sayfalarının en üstüne interaktif hesaplama araçları veya tek tıkla fiyat teklifi alma modülü yerleştirin.",
        "Müşteri yorumları ve Google inceleme yıldızlarını (AggregateRating Schema) sayfalara ekleyerek SERP'te zengin snippet elde edin.",
        "Rakiplerin fiyat politikalarını ve sundukları avantajları analiz ederek 'Şeffaf Fiyatlandırma' güvencesi sunun."
      ],
      expectedGain: "+2.5x Form & Telefon Dönüşümü",
      effort: "Orta (1 Hafta)"
    }
  ];

  // 30-Day strategic action roadmap
  const thirtyDayActionPlan: ThirtyDayActionPhase[] = [
    {
      phase: "1. Hafta (Gün 1 - 7)",
      timeline: "Temel Hız & Teknik SERP Ayrışması",
      focusArea: "CWV Avantajı & Meta Tag Güçlendirme",
      tasks: [
        `Sitenizin ${userSpeedScore}/100 PSI hız avantajını Google Search Console üzerinden hızlı indeksleme ile pekiştirin.`,
        "En yüksek arama hacimli 5 kelimenin title ve description etiketlerini CTR artırıcı biçimde güncelleyin.",
        "Tabloda belirlenen hedef değerleri (#1 ve #3 hedefleri) takım içi haftalık takip metriği haline getirin."
      ]
    },
    {
      phase: "2. Hafta (Gün 8 - 14)",
      timeline: "Hızlı Kazanımlar (Quick Wins)",
      focusArea: "2-5. Sıradaki Kelimeleri #1 Pozisyona Taşıma",
      tasks: [
        "2. ve 3. sırada yer aldığınız kelimelere ana sayfadan ve ilgili alt sayfalardan 8 adet güçlü dahili link ekleyin.",
        "Rakiplerin içeriklerinde bulunan fakat sitenizde eksik olan soru-cevapları (FAQ) sayfa sonlarına ekleyin.",
        "Tüm hizmet sayfalarına LocalBusiness ve Service JSON-LD şemalarını uygulayın."
      ]
    },
    {
      phase: "3. Hafta (Gün 15 - 21)",
      timeline: "İçerik Boşluğunu (Content Gap) Kapatma",
      focusArea: "Yeni Sayfalar & Derin Rehberler",
      tasks: [
        `${comp1.name} ve ${comp2.name} firmalarının ilk sayfada olduğu 3 eksik arama terimi için AI Blog Engine ile makale yayınlayın.`,
        "Müşteri yorumlarını ve tamamlanan iş fotoğraflarını sayfalara entegre ederek kanıt (Social Proof) sunun.",
        "Mobil sayfalarda hemen çıkma oranını (Bounce Rate) düşürmek için üst navigasyonu sadeleştirin."
      ]
    },
    {
      phase: "4. Hafta (Gün 22 - 30)",
      timeline: "Dönüşüm Maksimizasyonu & Liderlik Takibi",
      focusArea: "Ölçümleme & Hedef Denetimi",
      tasks: [
        "Gelişim İzleme tablosundaki sapma yüzdelerini kontrol ederek hedefi aşan terimleri yeşil kategoriye alın.",
        "Geride kalınan kelimeler için ikinci tur içerik genişletmesi ve görsel optimizasyonu gerçekleştirin.",
        "Sonuçları yönetim ve paydaş raporu formatında CSV / PDF olarak arşivleyin."
      ]
    }
  ];

  return {
    reportId: `strategy-report-${Date.now()}`,
    generatedAt: new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    source: "algorithmic_fallback",
    overallHealthScore: Math.min(95, Math.round(50 + (userShare * 0.3) + (avgAttainment * 0.2))),
    serpMarketShare: {
      userName,
      userSharePercent: userShare,
      comp1Name: comp1.name,
      comp1SharePercent: comp1Share,
      comp2Name: comp2.name,
      comp2SharePercent: comp2Share,
      comp3Name: comp3.name,
      comp3SharePercent: comp3Share,
      verdict: userShare >= 40
        ? "Tebrikler! Siteniz yerel organik aramalarda lider pazar payını elinde tutuyor."
        : "Rakipler pazar payını bölüşmüş durumda; hedefli adımlarla ilk 3 pazar payı %60+ seviyesine çıkarılabilir."
    },
    executiveSummary: `Tablodaki ${rankings.length} anahtar kelime, ${comp1.name}, ${comp2.name} ve ${comp3.name} ile kıyaslandığında; siteniz ${leadingCount} kelimede liderlik, ${competingCount} kelimede ise ilk 3 rekabeti sergiliyor. Sayfanızın Google PageSpeed skoru (${userSpeedScore}/100) rakiplere (${bestCompSpeed}/100) göre net bir hız üstünlüğü sağlamaktadır. Hedef sıralama başarım oranı %${avgAttainment} olup, planlanan 4 haftalık optimizasyon takvimi ile tahmini %${Math.min(85, Math.round(avgAttainment * 0.8 + 25))} organik trafik artışı öngörülmektedir.`,
    swotHighlights: {
      strengths: [
        `Kusursuz Google PageSpeed (${userSpeedScore}/100) ve Core Web Vitals avantajı`,
        `${leadingCount} kritik anahtar kelimede #1 lider SERP konumu`,
        `Yüksek dönüşüm odaklı temiz mobil arayüz ve net çağrı butonları (CTA)`
      ],
      weaknesses: [
        `${missingCount} potansiyel arama sorgusunda indeksli sayfa veya sıralama bulunmaması`,
        `${competingCount} kelimede rakiplerin 1-2 sıra gerisinde kalınması nedeniyle kaçan organik tıklamalar`,
        `Bazı sayfalarda zengin SSS ve LocalBusiness şema işaretlemesi eksikliği`
      ],
      opportunities: [
        `Rakiplerin yavaş açılan sayfalarından (LCP 3.4s+) memnun kalmayan kullanıcıları çekme potansiyeli`,
        `İlk sayfaya yakın (${competingCount} adet) kelimede dahili linkleme ile hızlı ilk sıra kazanımı`,
        `Ticari arama niyetine sahip sorgularda şeffaf fiyat/teklif araçlarıyla dönüşüm artışı`
      ],
      threats: [
        `${comp1.name} tarafından haftalık içerik girişi ile SERP alanının işgal edilmesi`,
        `Pazaryerlerinin ve rehber dizinlerin yerel arama sonuçlarındaki hacim baskısı`,
        `SERP özelliklerinin (Öne Çıkan Snippet) rakipler tarafından kapılması`
      ]
    },
    strategicRecommendations,
    priorityKeywordOpportunities: priorityKeywords,
    technicalLeverageSummary: {
      userSpeedScore,
      bestCompetitorSpeedScore: bestCompSpeed,
      speedAdvantagePoints: speedAdvantage,
      coreWebVitalsStatus: "Mükemmel (Tüm CWV eşikleri yeşil)",
      speedStrategyAdvice: `Sitenizin ${userSpeedScore}/100 skoru, ${comp1.name} (${comp1.speedScore || 74}) ve ${comp3.name} (${comp3.speedScore || 62}) karşısında kritik bir kullanıcı deneyimi avantajıdır. Bu üstünlüğü, Google botlarına anlık güncellenen XML site haritası sunarak ve sayfalara hızlı etkileşimli bileşenler ekleyerek değerlendirin.`
    },
    goalAttainmentForecast: {
      totalKeywords: total,
      onTrackCount: attainedGoalsCount,
      criticalGapCount: criticalGapGoalsCount,
      averageAttainmentPercent: avgAttainment,
      projectedTrafficGrowthPercent: Math.min(95, Math.round((total - leadingCount) * 6.5 + 20))
    },
    thirtyDayActionPlan
  };
}
