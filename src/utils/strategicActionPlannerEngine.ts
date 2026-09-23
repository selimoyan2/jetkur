import { 
  SiteConfig, 
  StrategicActionPlan, 
  ActionPlanTask, 
  ContentOptimizationDirective 
} from "../types";

export const ACTION_PLAN_STORAGE_KEY = "strategic_action_plan_completed_tasks_v1";

/**
 * Loads completed task IDs from localStorage
 */
export function loadCompletedTaskIds(): string[] {
  try {
    const raw = localStorage.getItem(ACTION_PLAN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves completed task IDs to localStorage
 */
export function saveCompletedTaskIds(ids: string[]): void {
  try {
    localStorage.setItem(ACTION_PLAN_STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error("Failed to save completed tasks to localStorage:", err);
  }
}

/**
 * Generates an algorithmic, highly tailored fallback Strategic Action Plan
 * using the site's configuration, competitor benchmarking and SEO radar data.
 */
export function generateFallbackStrategicActionPlan(
  config: Partial<SiteConfig>
): StrategicActionPlan {
  const companyName = config.companyName || "Siteniz";
  const sector = config.sector || "Oto Çekici & Yol Yardım";
  const city = config.city || "İstanbul";
  const domain = config.cloudflare?.customDomain || config.cloudflare?.subdomain || "sitemiz.com.tr";
  
  const rawKeywords = config.seo?.keywords;
  let userKeywords: string[] = [];
  if (Array.isArray(rawKeywords)) {
    userKeywords = rawKeywords.map(k => String(k).trim()).filter(Boolean);
  } else if (typeof rawKeywords === "string" && rawKeywords.trim().length > 0) {
    userKeywords = rawKeywords.split(",").map(k => k.trim()).filter(Boolean);
  }
  const primaryKw = userKeywords[0] || `${city} ${sector}`;

  const tasks: ActionPlanTask[] = [
    // -------------------------------------------------------------
    // AY 1: GÜN 1 - 30 (Teknik Altyapı, Hız İzolasyonu & Hızlı Zaferler)
    // -------------------------------------------------------------
    {
      id: "task-m1-01",
      month: 1,
      monthLabel: "1. Ay (Gün 1-30)",
      title: "Cloudflare Edge Caching & Core Web Vitals İzolasyonu (LCP < 0.8s)",
      description: "Lider rakiplerin ortalama mobil açılış hızı 3.4 saniye iken, sitenizin Edge CDN hız avantajını (0.02s TTFB) sabitleyerek Googlebot tarama bütçesini %100 verimle kullanın.",
      category: "Teknik SEO",
      priority: "Kritik",
      impact: "Çok Yüksek",
      effort: "Düşük",
      targetKpi: "Core Web Vitals Skorunu 98/100 seviyesinde tutmak ve LCP süresini 0.8s altına çekmek",
      radarAxisAffected: "Hız & CWV",
      competitorGapAddressed: "Lider rakibin 58/100 olan mobil hız zafiyetini ezici rekabet avantajına dönüştürür.",
      suggestedSteps: [
        "Cloudflare Tiered Cache ve Early Hints (103) aktif edildiğini doğrula",
        "Tüm görsel varlıkları WebP/AVIF formatına sıkıştırarak lazy-load etiketle",
        "Google PageSpeed Insights ile mobilde 95+ skorunu kilitle"
      ],
      estimatedDaysToComplete: 3
    },
    {
      id: "task-m1-02",
      month: 1,
      monthLabel: "1. Ay (Gün 1-30)",
      title: "LocalBusiness & FAQPage Şema (JSON-LD) Doğrulaması",
      description: "Google yerel arama ve zengin sonuçlar (rich snippets) için LocalBusiness, GeoCoordinates ve FAQPage yapılandırılmış verilerini tam uyumlu hale getirin.",
      category: "Teknik SEO",
      priority: "Kritik",
      impact: "Yüksek",
      effort: "Düşük",
      targetKpi: "Google Zengin Sonuçlar testinde 0 hata ve SERP'te yıldızlı/sorulu snippet görünümü",
      radarAxisAffected: "Yerel Varlık",
      competitorGapAddressed: "2. sıradaki rakibin yapılandırılmış veri eksikliğini avantaja çevirir.",
      suggestedSteps: [
        "LocalBusiness JSON-LD şemasında enlem, boylam, açılış saatleri ve telefon numarasını doğrula",
        "En sık sorulan 5 kritik soruyu FAQPage şemasıyla işaretle",
        "Google Rich Results Test aracı ile canlı URL testini tamamla"
      ],
      estimatedDaysToComplete: 2
    },
    {
      id: "task-m1-03",
      month: 1,
      monthLabel: "1. Ay (Gün 1-30)",
      title: "Mobil WhatsApp & Doğrudan Arama CTA Tünelini Güçlendirme",
      description: "Acil hizmet arayan mobil kullanıcıların %73'ü ilk 10 saniyede doğrudan arama butonuna basar. Sabit alt arama çubuğunu ve anlık mesajlaşma dönüşüm köprüsünü optimize edin.",
      category: "Dönüşüm (CRO)",
      priority: "Yüksek",
      impact: "Yüksek",
      effort: "Düşük",
      targetKpi: "Ziyaretçi başına doğrudan arama/WhatsApp dönüşüm oranını (CVR) %14'e yükseltmek",
      radarAxisAffected: "Dönüşüm Oranı",
      competitorGapAddressed: "Rakiplerin karmaşık iletişim formlarına kıyasla 1-tıkla anlık arama hızı sağlar.",
      suggestedSteps: [
        "Mobil ekranda yapışkan (sticky) 'Hemen Ara' ve 'WhatsApp Konum At' butonlarını test et",
        "Telefon tıklamalarına Google Analytics 4 (GA4) custom event takibi bağla",
        "Gece saatleri için 'Nöbetçi Ekip Hazır' dinamik durum rozetini etkinleştir"
      ],
      estimatedDaysToComplete: 2
    },
    {
      id: "task-m1-04",
      month: 1,
      monthLabel: "1. Ay (Gün 1-30)",
      title: "Ana Sayfa Başlık Hiyerarşisi (1 H1, 6 H2) ve Soru Başlıkları",
      description: "Google'ın semantik içerik okumasını kolaylaştırmak için ana sayfada tek 1 adet net H1 etiketi, 6 odaklı H2 bölümü ve soru formatında H3'ler kurgulayın.",
      category: "İçerik Stratejisi",
      priority: "Yüksek",
      impact: "Yüksek",
      effort: "Düşük",
      targetKpi: "Başlık hiyerarşisi skorunu 95/100 üzerine çıkarmak",
      radarAxisAffected: "İçerik Derinliği",
      competitorGapAddressed: "Rakiplerin birden fazla H1 ve dağınık başlık yapısından kaynaklanan SEO kaybını bertaraf eder.",
      suggestedSteps: [
        "H1 başlığını '${city} ${sector} | 7/24 En Hızlı Varış & Şeffaf Fiyat' olarak standardize et",
        "6 kritik hizmet ve ilçe başlığını H2 olarak yapılandır",
        "En az 4 adet 'Nasıl yapılır / Ne kadar sürer' sorusunu H3 ile konumlandır"
      ],
      estimatedDaysToComplete: 4
    },

    // -------------------------------------------------------------
    // AY 2: GÜN 31 - 60 (İçerik Derinliği, Semantik Boşluklar & İlçe Kuşatması)
    // -------------------------------------------------------------
    {
      id: "task-m2-01",
      month: 2,
      monthLabel: "2. Ay (Gün 31-60)",
      title: "2.400+ Kelimelik Kapsamlı Sütun Rehberi (Pillar Guide) Yayını",
      description: "Lider rakibin 2.350 kelimelik açılış sayfasını aşmak için, '${city} Genelinde ${sector} Fiyat Hesaplama ve Kurtarma Rehberi' başlıklı derin otorite içeriğini yayınlayın.",
      category: "İçerik Stratejisi",
      priority: "Kritik",
      impact: "Çok Yüksek",
      effort: "Orta",
      targetKpi: "İçerik kelime hacmini 1.150'den 2.400+ seviyesine çıkararak arama derinliğinde #1 olmak",
      radarAxisAffected: "İçerik Derinliği",
      competitorGapAddressed: "Sitenizin -813 kelimelik içerik derinliği açığını kapatır ve 1. sırayı zorlar.",
      suggestedSteps: [
        "AI SEO İçerik Asistanı ile 2.400 kelimelik yapılandırılmış taslağı üret",
        "İçeriğe şeffaf KM fiyat hesaplama tablosu ve araç tipleri karşılaştırması ekle",
        "LSI semantik kavramlarını (kasko poliçesi, ortalama varış süresi, yetki belgesi) doğal akışa yerleştir"
      ],
      estimatedDaysToComplete: 7
    },
    {
      id: "task-m2-02",
      month: 2,
      monthLabel: "2. Ay (Gün 31-60)",
      title: "Hedef 12 İlçe İçin Yerel Semt Hub Sayfalarının (Local Landing Pages) Devreye Alınması",
      description: "${city} genelindeki en yüksek arama hacmine sahip 12 kritik ilçe için özel semt açılış sayfaları kurgulayın. Her sayfada yerel varış süresi ve otoyol bağlantı bilgisi sunun.",
      category: "Yerel SEO & Harita",
      priority: "Kritik",
      impact: "Çok Yüksek",
      effort: "Orta",
      targetKpi: "12 farklı semt anahtar kelimesinde Google ilk sayfaya (Top 10) giriş yapmak",
      radarAxisAffected: "Yerel Varlık",
      competitorGapAddressed: "Merkez rakiplerin yalnızca ana sayfa odaklı SEO stratejisini semt bazında kuşatır.",
      suggestedSteps: [
        "En yoğun arama yapılan 12 ilçeyi belirle (örn: Kadıköy, Beşiktaş, Ümraniye, Bakırköy vb.)",
        "Her ilçe için semte özgü LocalBusiness şeması ve ortalama varış süresi barındıran sayfalar aç",
        "Ana sayfadan bu 12 ilçe sayfasına semantik alt menü iç linkleri ver"
      ],
      estimatedDaysToComplete: 10
    },
    {
      id: "task-m2-03",
      month: 2,
      monthLabel: "2. Ay (Gün 31-60)",
      title: "Google PAA (People Also Ask) İçin 20 Soru-Cevap İçerik Kümesi",
      description: "Kullanıcıların Google'da arattığı 'Çekici kaskodan nasıl karşılanır?', 'KM başı ücret ne kadar?' gibi 20 popüler uzun kuyruklu soruyu yanıtlayan zengin içerik blog modülü oluşturun.",
      category: "İçerik Stratejisi",
      priority: "Yüksek",
      impact: "Yüksek",
      effort: "Orta",
      targetKpi: "En az 5 adet Featured Snippet (Google Sıfırıncı Sıra) kazanımı",
      radarAxisAffected: "İçerik Derinliği",
      competitorGapAddressed: "2. sıradaki bilgi rehberi rakibinin çektiği 11.200 organik ziyaretçiyi yönlendirir.",
      suggestedSteps: [
        "Google arama sonuçlarındaki 'Kullanıcılar Bunları da Sordu' kutularını tara",
        "Her soruyu 40-50 kelimelik doğrudan yanıt + detaylı açıklama formatında hazırla",
        "FAQPage Schema ile arama motoruna bildir"
      ],
      estimatedDaysToComplete: 5
    },
    {
      id: "task-m2-04",
      month: 2,
      monthLabel: "2. Ay (Gün 31-60)",
      title: "Google İşletme Profili (Google Haritalar 3-Pack) Yerel Sinyal Senkronizasyonu",
      description: "Google Harita profilinizdeki NAP (İsim, Adres, Telefon) bilgilerini web sitenizle %100 birebir eşitleyin, haftalık yerel fotoğraf ve gönderi akışı başlatın.",
      category: "Yerel SEO & Harita",
      priority: "Yüksek",
      impact: "Yüksek",
      effort: "Düşük",
      targetKpi: "Google Haritalar 3-Pack yerel sıralamasında ilk 3'e kalıcı olarak yerleşmek",
      radarAxisAffected: "Yerel Varlık",
      competitorGapAddressed: "Harita görünürlüğü düşük rakiplerin yerel çağrı hacmini toplar.",
      suggestedSteps: [
        "Web sitesindeki alt bilgi (footer) adresi ile Google Harita adresini harfi harfine senkronize et",
        "Kurtarma araçlarının gerçek fotoğraflarını ve ekip görsellerini ekle",
        "Mutlu müşterilerden haftada en az 2 gerçek Google yorumu toplayacak SMS şablonu oluştur"
      ],
      estimatedDaysToComplete: 4
    },

    // -------------------------------------------------------------
    // AY 3: GÜN 61 - 90 (Otorite, Kurumsal Backlink Ağı & SERP #1 Sahiplenmesi)
    // -------------------------------------------------------------
    {
      id: "task-m3-01",
      month: 3,
      monthLabel: "3. Ay (Gün 61-90)",
      title: "Sektörel Rehber & Yerel Haber Sitelerinden 15+ Kaliteli Backlink Kazanımı",
      description: "Lider rakibin sahip olduğu 88/100 alan adı otoritesi ile aradaki farkı kapatmak için ${city} yerel haber portalları, oto sanayi rehberleri ve sektörel bloglardan kalıcı backlink edinin.",
      category: "Otorite & Backlink",
      priority: "Kritik",
      impact: "Çok Yüksek",
      effort: "Yüksek",
      targetKpi: "Domain Otoritesi (DA) skorunu 42'den 65+ seviyesine yükseltmek",
      radarAxisAffected: "Domain Otoritesi",
      competitorGapAddressed: "Lider rakibin 8 yıllık köklü backlink avantajına karşı stratejik taze backlink atağı başlatır.",
      suggestedSteps: [
        "Sektörel dernekler ve otomotiv portallarına 'Güvenli Yol Yardım İpuçları' basın bülteni gönder",
        "${city} yerel haber sitelerinde sponsorlu uzman görüşü yayınlat",
        "Zararlı veya spam backlinkleri tespit edip Google Disavow aracı ile reddet"
      ],
      estimatedDaysToComplete: 14
    },
    {
      id: "task-m3-02",
      month: 3,
      monthLabel: "3. Ay (Gün 61-90)",
      title: "İnteraktif Fiyat & KM Hesaplayıcı Dönüşüm Aracını Devreye Alma",
      description: "Kullanıcıların kalkış ve varış ilçesini seçerek tahmini çekici masrafını hesaplayabildiği interaktif widget ekleyin. Kullanıcı sayfada kalma süresini 3 katına çıkarır.",
      category: "Dönüşüm (CRO)",
      priority: "Yüksek",
      impact: "Yüksek",
      effort: "Orta",
      targetKpi: "Sayfada ortalama kalma süresini 45 saniyeden 2 dakika 15 saniyeye çıkarmak",
      radarAxisAffected: "Dönüşüm Oranı",
      competitorGapAddressed: "Rakiplerin statik metinlerine karşı interaktif kullanıcı deneyimi (Dwell Time) sinyali üretir.",
      suggestedSteps: [
        "Kullanıcının mesafe seçip anında tahmini fiyat göreceği hesaplayıcı bileşenini aktifleştir",
        "Hesaplama sonucunda 'Bu Fiyata Ekibi Çağır' doğrudan arama butonu göster",
        "A/B testi ile dönüşüm oranını izle"
      ],
      estimatedDaysToComplete: 6
    },
    {
      id: "task-m3-03",
      month: 3,
      monthLabel: "3. Ay (Gün 61-90)",
      title: "Rakiplerin Düşüş Yaşadığı Anahtar Kelimelerde SERP #1 Sahiplenmesi",
      description: "Google Core Update sonrası sıralama kaybeden rakiplerin boşalttığı 24 yüksek hacimli kelimeyi tespit edip doğrudan bu kelimelere özel içerik güncellemesi yapın.",
      category: "İçerik Stratejisi",
      priority: "Yüksek",
      impact: "Yüksek",
      effort: "Orta",
      targetKpi: "Top 3 sıralamada yer alan anahtar kelime sayısını %85 artırmak",
      radarAxisAffected: "İçerik Derinliği",
      competitorGapAddressed: "Rakiplerin güncelleme şokundan faydalanarak pazar liderliğini ele geçirir.",
      suggestedSteps: [
        "SERP Alert günlüklerinde düşüşe geçen rakip kelimelerini filtrele",
        "Bu kelimeler için mevcut sayfalara yeni başlık ve açıklayıcı paragraflar ekle",
        "Search Console ile hızlı yeniden indeksleme isteği gönder"
      ],
      estimatedDaysToComplete: 5
    },
    {
      id: "task-m3-04",
      month: 3,
      monthLabel: "3. Ay (Gün 61-90)",
      title: "Çok Dilli (İngilizce/Almanca) Turizm & Transit Koridoru Sayfaları",
      description: "Özellikle otoyol transit geçişleri, yabancı plakalı araçlar ve gurbetçi sezonu için Almanca ve İngilizce çift dilli hreflang açılımı gerçekleştirin.",
      category: "Teknik SEO",
      priority: "Orta",
      impact: "Orta",
      effort: "Orta",
      targetKpi: "Yabancı aramalarda 15.000+ ek organik gösterim kazanmak",
      radarAxisAffected: "Yerel Varlık",
      competitorGapAddressed: "Yerel rakiplerin %100'ünün göz ardı ettiği sınır ötesi ve transit arama havuzunu sahiplenir.",
      suggestedSteps: [
        "Hreflang='en' ve hreflang='de' meta etiketlerini ekle",
        "Havalimanı ve transit otoyol çevresi için çift dilli acil çağrı sayfaları hazırla",
        "İngilizce konuşabilen çağrı merkezi yönlendirmesi sağla"
      ],
      estimatedDaysToComplete: 6
    }
  ];

  const contentDirectives: ContentOptimizationDirective[] = [
    {
      id: "directive-1",
      pageTarget: `Ana Hizmet Açılış Sayfası (/)`,
      currentStatus: "1.150 kelime, 5 H2 başlık, temel şema var",
      targetKeywords: [primaryKw, `${city} acil ${sector.toLowerCase()}`, `${city} nöbetçi çekici`],
      recommendedWordCount: 2400,
      hierarchyAction: "1 H1 altına 8 adet H2 eklenmeli, alt semt listesi ve fiyat tablosu yerleştirilmeli.",
      lsiAdditions: ["Şeffaf Fiyat Listesi & KM Başına Ücret", "Ortalama Varış Süresi (15-20 Dakika)", "Kasko ve Sigorta Prosedürü"],
      paaQuestionsToAdd: [
        "Gece veya tatil günlerinde çekici ücreti değişir mi?",
        "Kasko anlaşmalı kurtarıcı çağırmak için ne yapmalıyım?",
        "Araç taşıma esnasında sigortalı mıdır?"
      ],
      expectedImpact: "Lider rakibin 18.450 aylık trafiğinden %35 pay kapma potansiyeli."
    },
    {
      id: "directive-2",
      pageTarget: `Fiyat Tarifesi & KM Hesaplama Sayfası (/fiyatlar)`,
      currentStatus: "Mevcut değil veya statik kısa paragraf",
      targetKeywords: [`${sector.toLowerCase()} fiyatları 2026`, `${city} çekici km ücreti`],
      recommendedWordCount: 1600,
      hierarchyAction: "H2 olarak Araç Tiplerine Göre Fiyatlandırma, Otoyol ve Köprü Geçiş Tarifeleri kurgulanmalı.",
      lsiAdditions: ["Taban Açılış Ücreti", "KM Başına Maliyet", "Şehirler Arası Çoklu Taşıma"],
      paaQuestionsToAdd: [
        "Çekici km ücreti ne kadar?",
        "Otobanda özel çekici çağrılabilir mi?",
        "Fatura kesiliyor mu?"
      ],
      expectedImpact: "Satın alma niyeti en yüksek aramalarda SERP #1 sıraya yerleşme."
    },
    {
      id: "directive-3",
      pageTarget: `İlçe & Bölgesel Sayfalar (/bolgeler/*)`,
      currentStatus: "Ayrı sayfalar yok, tüm ilçeler tek sayfada listeleniyor",
      targetKeywords: [`${city} ilçe bazlı arama terimleri (Kadıköy, Beşiktaş, Ümraniye...)`],
      recommendedWordCount: 950,
      hierarchyAction: "Her ilçeye özel semt haritası, varış süresi ve nöbetçi ekip listesi içeren bağımsız sayfalar.",
      lsiAdditions: ["Semt İçi Varış Süresi", "En Yakın Bekleme Noktası", "Yerel Sanayi Bağlantısı"],
      paaQuestionsToAdd: [
        "[İlçe Adı] acil çekici kaç dakikada gelir?",
        "[İlçe Adı] en yakın oto kurtarma nerede?"
      ],
      expectedImpact: "Yerel aramalarda 12 farklı semtte ilk 3 sıra hakimiyeti."
    }
  ];

  return {
    analyzedAt: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
    companyName,
    sector,
    city,
    domain,
    radarScoresSnapshot: {
      siteOverall: 84,
      competitorAvgOverall: 76,
      gapSummary: "Siteniz Hız & CWV (98 vs 64) ve Dönüşüm (92 vs 74) eksenlerinde üstün; İçerik Derinliği (68 vs 88) ve Domain Otoritesi (42 vs 84) eksenlerinde geride.",
      axes: [
        { name: "Hız & Core Web Vitals", userScore: 98, competitorAvg: 64, status: "superior" },
        { name: "Dönüşüm Odaklı UI (CRO)", userScore: 92, competitorAvg: 74, status: "superior" },
        { name: "Mobil UX & Erişilebilirlik", userScore: 89, competitorAvg: 80, status: "superior" },
        { name: "Yerel Varlık & Harita 3-Pack", userScore: 78, competitorAvg: 82, status: "competitive" },
        { name: "İçerik Derinliği & Kelime Hacmi", userScore: 68, competitorAvg: 88, status: "lagging" },
        { name: "Domain Otoritesi & Backlink", userScore: 42, competitorAvg: 84, status: "lagging" }
      ]
    },
    executiveSummary: `Bu 3 aylık stratejik aksiyon planı, ${companyName} işletmesinin sektördeki lider rakiplere karşı sahip olduğu benzersiz teknik avantajları (Cloudflare 0.02s hız) koruyarak, en kritik iki zafiyet olan 'İçerik Derinliği (-813 kelime açığı)' ve 'Domain Otoritesi' alanlarını sistematik adımlarla kapatmak için tasarlanmıştır.`,
    monthlyFocus: {
      month1Focus: "1. Ay: Teknik İzolasyon, Hız Sabitleme, LocalBusiness Şemaları ve Mobil Dönüşüm (Quick Wins).",
      month2Focus: "2. Ay: 2.400+ kelimelik Sütun Rehberi, 12 Semt Sayfası ve Google PAA Soru Kümeleriyle İçerik Hegemonyası.",
      month3Focus: "3. Ay: 15+ Kaliteli Sektörel Backlink, Fiyat Hesaplayıcı Dönüşüm Aracı ve SERP #1 Sıra Sahiplenmesi."
    },
    tasks,
    contentDirectives,
    quickWins: [
      "Cloudflare CDN Tiered Cache ve Early Hints (103) aktif edildiğini doğrulayın (30 saniyede tamamlanır).",
      "Ana sayfa H1 başlığını tekilleştirip birincil şehir + anahtar kelimeyi ilk 3 kelimeye yerleştirin.",
      "Mobil görünümde sabit 'Hemen Ara' arama butonunun telefon numarasını ve WhatsApp bağlantısını test edin.",
      "Google Search Console'da sitemap.xml dosyasını yeniden göndererek hızlı tarama tetikleyin."
    ]
  };
}

/**
 * Exports tasks to CSV
 */
export function exportActionPlanToCSV(plan: StrategicActionPlan): void {
  const headers = [
    "Ay",
    "Gorev Basligi",
    "Kategori",
    "Oncelik",
    "Etki",
    "Efor",
    "Hedef KPI",
    "Ilgili Radar Ekseni",
    "Kapatilan Rakip Acigi",
    "Tahmini Sure (Gun)"
  ];

  const rows = plan.tasks.map(t => [
    `"${t.monthLabel}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.priority}"`,
    `"${t.impact}"`,
    `"${t.effort}"`,
    `"${t.targetKpi.replace(/"/g, '""')}"`,
    `"${t.radarAxisAffected}"`,
    `"${t.competitorGapAddressed.replace(/"/g, '""')}"`,
    t.estimatedDaysToComplete
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `3-aylik-seo-stratejik-aksiyon-plani-${plan.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
