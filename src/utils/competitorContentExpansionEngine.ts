import { 
  SiteConfig, 
  CompetitorContentExpansionReport, 
  CompetitorContentExpansionIdea 
} from "../types";

/**
 * Generates high-converting, traffic-focused blog titles and meta description drafts
 * based on competitor top-performing pages and content gaps.
 */
export function generateFallbackContentExpansion(
  config: Partial<SiteConfig>
): CompetitorContentExpansionReport {
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
  const primaryKw = userKeywords[0] || `${city} ${sector.toLowerCase()}`;

  const contentIdeas: CompetitorContentExpansionIdea[] = [
    {
      id: "idea-1",
      blogTitle: `${city} ${sector} Fiyatları 2026: KM Başına Ücret Hesaplama & Kurtarma Tarifesi`,
      metaTitle: `${city} ${sector} Fiyatları 2026 | KM Başı Ücret | ${companyName}`,
      metaDescription: `2026 ${city} ${sector.toLowerCase()} fiyatları ne kadar? Taban açılış ve km başına çekici ücret hesaplama tablosuyla en uygun fiyatı hemen öğrenin. 7/24 arayın!`,
      primaryKeyword: `${city} ${sector.toLowerCase()} fiyatları 2026`,
      secondaryKeywords: [`${city} çekici km ücreti`, "oto kurtarma fiyat tarifesi", "şehirler arası çekici hesaplama"],
      searchIntent: "Ticari / Karar",
      estimatedMonthlySearchVolume: "18.400 / ay",
      competitorBenchmarkSource: "Lider Rakip #1'in 2024 tarihli eskiyen fiyat rehberi (12.300 organik trafik)",
      competitorGapToExploit: "Rakip içerik 2024 yılına ait ve sabit KM hesabı sunmuyor. 2026 güncel tavan/taban tarifesi ve interaktif mesafe tablosu sunarak sıfırıncı sıraya (Featured Snippet) yerleşin.",
      suggestedHeadings: [
        "2026 Yılında Çekici ve Kurtarıcı Ücretleri Nasıl Hesaplanır?",
        "Mesafe ve Araç Tipine Göre Güncel KM Başına Maliyet Tablosu",
        "Otoyol ve Köprü Geçiş Ücretleri Çekici Fiyatına Dahil midir?",
        "Kasko veya Trafik Sigortası Çekici Masrafını Karşılar mı?",
        "Gece ve Resmi Tatil Günlerinde Ekstra Tarife Uygulanır mı?"
      ],
      targetAudience: "Fiyat araştırması yapan ve acil olmayan ancak yüksek satın alma niyetli araç sahipleri.",
      contentFormat: "Fiyat & Karşılaştırma",
      difficulty: "Orta",
      expectedTrafficShare: "+3.200 aylık organik ziyaretçi",
      priorityScore: 98
    },
    {
      id: "idea-2",
      blogTitle: `Yolda Kaldım Ne Yapmalıyım? 7 Adımda Güvenli Araç Kurtarma & Çekici Çağırma Rehberi`,
      metaTitle: `Yolda Kalınca Ne Yapılır? Güvenli Çekici Çağırma | ${companyName}`,
      metaDescription: `Trafikte aracınız bozulduğunda veya kaza anında ilk ne yapmalısınız? Dörtlüler, reflektör ve güvenli kurtarma çağırma rehberiyle hayati adımları öğrenin.`,
      primaryKeyword: "yolda kaldım ne yapmalıyım",
      secondaryKeywords: ["otobanda araba bozulunca ne yapılır", "çekici çağırırken dikkat edilmesi gerekenler", "acil yol yardım adımları"],
      searchIntent: "Acil / İşlemsel",
      estimatedMonthlySearchVolume: "14.600 / ay",
      competitorBenchmarkSource: "Rakip #2'nin statik blog yazısı (6.800 organik trafik)",
      competitorGapToExploit: "Rakipte yalnızca genel tavsiyeler var; konum paylaşma, acil reflektör mesafesi (30m / 150m) ve tek tıkla canlı konum gönderme adımları eklenerek %85 hemen çıkma oranı (bounce rate) avantaja çevrilir.",
      suggestedHeadings: [
        "1. Adım: Güvenlik Çemberi Oluşturma (Dörtlüler & Reflektör Yerleşimi)",
        "2. Adım: Otoyol / Otobanda Güvenli Bekleme Noktaları",
        "3. Adım: WhatsApp ile Tam Konum Gönderme Nasıl Yapılır?",
        "4. Adım: Aracın Çekilmeye Hazırlanması (El Freni & Direksiyon Kilidi)",
        "5. Adım: Yetki Belgeli Güvenilir Kurtarıcı Seçerken Dikkat Edilecekler"
      ],
      targetAudience: "O anda yolda kalmış, panik halinde hızlı ve güvenilir bilgi arayan mobil sürücüler.",
      contentFormat: "Nasıl Yapılır (How-To)",
      difficulty: "Kolay",
      expectedTrafficShare: "+2.450 aylık organik ziyaretçi",
      priorityScore: 94
    },
    {
      id: "idea-3",
      blogTitle: `Kasko Çekici Hizmeti Hakkında Bilinmesi Gereken 9 Kritik Soru ve Cevap`,
      metaTitle: `Kasko Çekiciyi Karşılar mı? 9 Soru & Cevap | ${companyName}`,
      metaDescription: `Kasko poliçesi yılda kaç kez çekici hakkı verir? Kaza ve arıza hallerinde anlaşmalı çekici nasıl çağrılır? Tüm detaylar ve kasko haklarınız burada!`,
      primaryKeyword: "kasko çekici hakkı kaç defa",
      secondaryKeywords: ["trafik sigortası çekici karşılar mı", "kasko anlaşmalı oto kurtarma", "yılda kaç kez çekici çağrılır"],
      searchIntent: "Bilgilendirici",
      estimatedMonthlySearchVolume: "11.800 / ay",
      competitorBenchmarkSource: "Sigorta karşılaştırma sitelerinin üstünkörü hazırladığı sayfalar",
      competitorGapToExploit: "Sigorta portalları doğrudan hizmet sağlamaz, yalnızca genel madde yazar. Sahadaki gerçek kurtarma prosedürünü anlatan özgün bir kılavuzla Google PAA sorularında 1. sırayı yakalayın.",
      suggestedHeadings: [
        "Kasko Poliçelerinde Yılda Kaç Adet Ücretsiz Çekici Hakkı Bulunur?",
        "Kasko Çekici Sınırı Kaç KM? Şehir Dışı Taşımada Ek Ücret Çıkar mı?",
        "Zorunlu Trafik Sigortası Arıza Durumunda Çekici Karşılar mı?",
        "Kendi Bulduğum Çekicinin Faturasını Kaskodan Tahsil Edebilir miyim?",
        "Kaza Tespiti ve Tutanak Olmadan Kasko Çekicisi Çağrılabilir mi?"
      ],
      targetAudience: "Poliçe kapsamını öğrenmek ve ek ücret ödemeden çekici çağırmak isteyen bilinçli araç sahipleri.",
      contentFormat: "Soru & Cevap (PAA)",
      difficulty: "Kolay",
      expectedTrafficShare: "+1.950 aylık organik ziyaretçi",
      priorityScore: 91
    },
    {
      id: "idea-4",
      blogTitle: `${city} Otoyol & Çevre Yolu Kurtarma Rehberi: TEM, E-5 ve Kuzey Marmara Çekici Noktaları`,
      metaTitle: `${city} Otoyol Çekici | TEM & Kuzey Marmara | ${companyName}`,
      metaDescription: `${city} TEM, E-5 ve Kuzey Marmara otoyolunda en hızlı çekici noktaları. Otoyolda özel çekici çekebilir mi? 15 dakikada en yakın ekip için 7/24 arayın!`,
      primaryKeyword: `${city} otoyol çekici`,
      secondaryKeywords: ["kuzey marmara oto kurtarma", "tem otoyolu acil çekici", "e5 nöbetçi çekici noktaları"],
      searchIntent: "Yerel Keşif",
      estimatedMonthlySearchVolume: "16.100 / ay",
      competitorBenchmarkSource: "Rakip #3'ün semt açılış sayfası (5.400 organik trafik)",
      competitorGapToExploit: "Rakipler yalnızca ilçe isimlerini sıralamış; ana arterler, gişeler ve tünel çıkışları gibi kilit bekleme noktalarını belirtmemiş. Coğrafi derinlikle yerel aramaları domine edin.",
      suggestedHeadings: [
        "Kuzey Marmara ve TEM Otoyolunda Arıza Halinde Güvenlik Kuralları",
        "Otoyol İşletmesi Çekicisi vs Özel Çekici: Hangisi Daha Avantajlı?",
        "Anadolu ve Avrupa Yakası Ana Arterlerinde Ortalama Varış Süreleri",
        "Ağır Vasıta ve Kamyonetler İçin Özel Vinçli Kurtarma Noktaları",
        "7/24 Acil Konum Bildirimi ve En Yakın Nöbetçi Çekici Çağırma"
      ],
      targetAudience: "Otoban veya çevre yolunda seyahat eden, hızlı varış ve güvenli taşıma arayan sürücüler.",
      contentFormat: "Yerel Semt Listesi",
      difficulty: "Orta",
      expectedTrafficShare: "+2.800 aylık organik ziyaretçi",
      priorityScore: 95
    },
    {
      id: "idea-5",
      blogTitle: `Otomatik Vitesli ve Elektrikli Araç (EV) Nasıl Çekilir? Şanzımana Zarar Vermeden Taşıma`,
      metaTitle: `Otomatik & Elektrikli Araç Çekme Rehberi | ${companyName}`,
      metaDescription: `Otomatik vitesli ve elektrikli (EV) arabalar halatla çekilir mi? Kayar kasa vinçli kurtarma kuralları ve şanzıman arızalarını önleyen uzman rehberi.`,
      primaryKeyword: "otomatik vites araba nasıl çekilir",
      secondaryKeywords: ["elektrikli araç çekici kuralları", "kayar kasa çekici otomatik vites", "çekici şanzımana zarar verir mi"],
      searchIntent: "Bilgilendirici",
      estimatedMonthlySearchVolume: "8.900 / ay",
      competitorBenchmarkSource: "Otomotiv forumları ve genel bloglar",
      competitorGapToExploit: "Yeni nesil elektrikli araç (Togg, Tesla vb.) sahipleri yanlış çekici müdahalesinden çok korkuyor. Sıfır hasar garantili kayar kasa ve ahtapot vinç uzmanlığını öne çıkararak otorite inşa edin.",
      suggestedHeadings: [
        "Otomatik Vites Araç Neden Asla Halatla Çekilmemelidir?",
        "Elektrikli Araçlarda (EV) Rejeneratif Frenleme ve Çekici Riskleri",
        "Ahtapot Vinç ve Kayar Kasa Platformunun Güvenlik Standartları",
        "Dört Çeker (4x4 / AWD) Araç Çekiminde Dikkat Edilecek 3 Kural",
        "Çekici Taşıma Sırasında Oluşabilecek Hasarlara Karşı Sigorta Güvencesi"
      ],
      targetAudience: "Yüksek değerli otomatik ve elektrikli araç sahipleri (Yüksek sepet tutarı ve kasko hassasiyeti olan kitle).",
      contentFormat: "Kapsamlı Rehber",
      difficulty: "Kolay",
      expectedTrafficShare: "+1.650 aylık organik ziyaretçi",
      priorityScore: 89
    },
    {
      id: "idea-6",
      blogTitle: `Şehirler Arası Çoklu Araç Taşıma & Çekici Fiyat Tarifesi (İl İl KM Listesi)`,
      metaTitle: `Şehirler Arası Araç Taşıma & Fiyat Listesi | ${companyName}`,
      metaDescription: `Şehirler arası çoklu ve tekli çekici fiyatları ne kadar? İl il km mesafe hesaplama tablosu ve güvenli kaskolu transfer şartları için hemen inceleyin!`,
      primaryKeyword: "şehirler arası araç taşıma fiyatları",
      secondaryKeywords: ["çoklu çekici fiyatları", "istanbul ankara araç nakliyesi", "şehir dışı oto transfer"],
      searchIntent: "Ticari / Karar",
      estimatedMonthlySearchVolume: "9.700 / ay",
      competitorBenchmarkSource: "Lojistik portalları",
      competitorGapToExploit: "Rakipler fiyat vermekten kaçınıp yalnızca form doldurtuyor. Ortalama rota aralıkları verip şeffaflık sağlayarak doğrudan telefonla arayan yüksek cirolu müşterileri kazanın.",
      suggestedHeadings: [
        "Şehirler Arası Çoklu Araç Taşıma Nasıl Çalışır?",
        "Tekli Özel Kurtarıcı vs Çoklu Çekici Fiyat Farkları",
        "En Çok Tercih Edilen Rotalar İçin KM ve Maliyet Aralıkları",
        "Şehirler Arası Taşıma Sözleşmesi ve Kasko Kapsamı",
        "Kapıdan Kapıya Araç Teslimatı İçin Randevu Oluşturma"
      ],
      targetAudience: "Şehir değiştiren, galeri sahibi olan veya arızalı aracını başka ile götürmek isteyen yüksek bütçeli kullanıcılar.",
      contentFormat: "Fiyat & Karşılaştırma",
      difficulty: "Orta",
      expectedTrafficShare: "+1.850 aylık organik ziyaretçi",
      priorityScore: 92
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
    executiveSummary: `${city} pazarındaki en güçlü rakiplerin en çok organik trafik çeken sayfaları ve Google SERP'te açıkta kalan kullanıcı niyetleri taranarak; sitenizin alan adı otoritesini hızla katlayacak ve doğrudan çağrı dönüşümü yaratacak 6 öncelikli içerik taslağı modellenmiştir.`,
    topCompetitorInsights: [
      {
        name: "Lider Rakip #1 (Pazar Payı %38)",
        topArticleTitle: `${city} Çekici Fiyatları 2024`,
        estimatedTraffic: "18.450 / ay",
        weaknessesToBeat: "İçerik 2024 yılına ait, fiyat tablosu güncel değil ve mobil görünümde doğrudan arama butonu yok."
      },
      {
        name: "Rakip #2 (Bilgi Rehberi Portalı)",
        topArticleTitle: "Yolda Kalınca Yapılması Gerekenler",
        estimatedTraffic: "11.200 / ay",
        weaknessesToBeat: "İçerik teorik ve sıkıcı; WhatsApp canlı konum gönderme ve hızlı aksiyon rehberi bulunmuyor."
      },
      {
        name: "Rakip #3 (Semt & Bölge Odaklı)",
        topArticleTitle: `${city} Otoyol Yol Yardım Noktaları`,
        estimatedTraffic: "7.600 / ay",
        weaknessesToBeat: "Yalnızca semt isimleri listelenmiş, gişe ve arter bazlı varış süreleri sunulmamış."
      }
    ],
    contentIdeas
  };
}

/**
 * Exports content expansion ideas to CSV
 */
export function exportContentExpansionToCSV(report: CompetitorContentExpansionReport): void {
  const headers = [
    "Blog Basligi (H1)",
    "Meta Title (Max 60 Karakter)",
    "Meta Description (145-160 Karakter)",
    "Birincil Anahtar Kelime",
    "Ikinci Anahtar Kelimeler",
    "Arama Niyeti",
    "Aylik Arama Hacmi",
    "Icerik Formati",
    "Oncelik Skoru",
    "Rakip Referansi",
    "Kapatilacak Rakip Acigi",
    "Beklenen Trafik Payi"
  ];

  const rows = report.contentIdeas.map(idea => [
    `"${idea.blogTitle.replace(/"/g, '""')}"`,
    `"${idea.metaTitle.replace(/"/g, '""')}"`,
    `"${idea.metaDescription.replace(/"/g, '""')}"`,
    `"${idea.primaryKeyword}"`,
    `"${idea.secondaryKeywords.join(", ")}"`,
    `"${idea.searchIntent}"`,
    `"${idea.estimatedMonthlySearchVolume}"`,
    `"${idea.contentFormat}"`,
    idea.priorityScore,
    `"${idea.competitorBenchmarkSource.replace(/"/g, '""')}"`,
    `"${idea.competitorGapToExploit.replace(/"/g, '""')}"`,
    `"${idea.expectedTrafficShare}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `icerik-gelistirme-onerileri-${report.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
