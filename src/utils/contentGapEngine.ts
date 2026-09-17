import { SiteConfig, BlogPostItem } from "../types";

export interface ContentGapCompetitor {
  id: string;
  name: string;
  domain: string;
  url: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  marketShare: string;
  domainAuthority: number;
  isSelected: boolean;
  isCustom?: boolean;
}

export type GapStatus = "critical" | "weak" | "opportunity" | "winning";

export interface ContentGapKeyword {
  id: string;
  keyword: string;
  cluster: string;
  clusterColor: string;
  monthlyVolume: number;
  difficulty: number; // 0 - 100
  difficultyLevel: "Kolay" | "Orta" | "Zor";
  searchIntent: "Ticari" | "Acil / Yerel" | "Bilgi" | "Fiyat";
  cpc: string;
  userRank: number | null; // null if completely missing
  status: GapStatus;
  competitorRanks: Record<string, number | null>; // competitorId -> rank
  bestCompetitorRank: number;
  bestCompetitorId: string;
  estimatedTrafficLoss: number; // monthly visitors missed
  potentialTrafficGain: number; // monthly visitors if ranking #1-3
  suggestedContentType: "Açılış Sayfası (Landing Page)" | "Kapsamlı Blog Rehberi" | "Fiyat Tablosu & SSS" | "İlçe Lokasyon Sayfası";
  suggestedTitle: string;
  suggestedSlug: string;
  suggestedWordCount: number;
  keySubheadings: string[];
  lsiKeywords: string[];
}

export interface TopicalClusterGapSummary {
  cluster: string;
  totalKeywords: number;
  userRankedCount: number;
  userCoveragePercent: number;
  competitorAverageCoveragePercent: number;
  missingCount: number;
  weakCount: number;
  opportunityCount: number;
  totalVolume: number;
  color: string;
}

export interface ContentGapAnalysisReport {
  analyzedAt: string;
  sector: string;
  city: string;
  userDomain: string;
  competitors: ContentGapCompetitor[];
  keywords: ContentGapKeyword[];
  clusterSummaries: TopicalClusterGapSummary[];
  overallStats: {
    totalKeywordsAnalyzed: number;
    missingKeywordsCount: number;
    weakKeywordsCount: number;
    opportunityKeywordsCount: number;
    winningKeywordsCount: number;
    overallCoverageScore: number; // 0-100%
    gapScore: number; // 0-100% (lower gap is better)
    totalMissedMonthlyTraffic: number;
    totalPotentialGain: number;
    estimatedMonthlyRevenueLoss: string;
  };
}

// ----------------------------------------------------------------------------
// SECTOR SPECIFIC TEMPLATES & SEED DATA
// ----------------------------------------------------------------------------
interface SectorKeywordTemplate {
  keyword: string;
  cluster: string;
  clusterColor: string;
  volume: number;
  difficulty: number;
  intent: "Ticari" | "Acil / Yerel" | "Bilgi" | "Fiyat";
  cpc: string;
  suggestedContentType: "Açılış Sayfası (Landing Page)" | "Kapsamlı Blog Rehberi" | "Fiyat Tablosu & SSS" | "İlçe Lokasyon Sayfası";
  titleTemplate: string;
  subheadings: string[];
  lsi: string[];
}

const SECTOR_KEYWORD_PATTERNS: Record<string, SectorKeywordTemplate[]> = {
  "Oto Çekici & Kurtarıcı": [
    {
      keyword: "{city} en yakın oto çekici telefon numarası",
      cluster: "Acil & Yerel Hizmetler",
      clusterColor: "#ef4444",
      volume: 8400,
      difficulty: 32,
      intent: "Acil / Yerel",
      cpc: "48.50 ₺",
      suggestedContentType: "Açılış Sayfası (Landing Page)",
      titleTemplate: "{city} 7/24 En Yakın Oto Çekici ve Yol Yardım Numarası",
      subheadings: ["15 Dakikada Adresinize Ulaşan Acil Çekici", "7/24 Kesintisiz Çağrı Merkezi ve Konum Paylaşımı", "Otoyol ve Köprü Kurtarma Hizmetleri", "Sabit Fiyat Güvencesi ve Kredi Kartı ile Ödeme"],
      lsi: ["acil çekici numarası", "yol yardım telefon", "en yakın çekici konumu", "7/24 çekici"]
    },
    {
      keyword: "{city} oto çekici kilometre fiyatları 2026",
      cluster: "Fiyat & Maliyet Tablosu",
      clusterColor: "#f59e0b",
      volume: 5900,
      difficulty: 28,
      intent: "Fiyat",
      cpc: "34.20 ₺",
      suggestedContentType: "Fiyat Tablosu & SSS",
      titleTemplate: "2026 {city} Oto Çekici Km Fiyatları ve Hesaplama Tarifesi",
      subheadings: ["Şehir İçi Taban Açılış Ücreti Ne Kadar?", "Km Başına Çekici Ücreti Nasıl Hesaplanır?", "Gece Tarifesi ve Köprü Geçiş Ücretleri", "Gizli Maliyet Olmadan Sabit Fiyat Tarifesi"],
      lsi: ["çekici km fiyatı", "kurtarıcı tarifesi 2026", "çekici ne kadar tutar", "uygun fiyatlı çekici"]
    },
    {
      keyword: "kaza anında çekici çağırma rehberi ve kasko prosedürü",
      cluster: "Kılavuz & Nasıl Yapılır",
      clusterColor: "#3b82f6",
      volume: 4200,
      difficulty: 24,
      intent: "Bilgi",
      cpc: "18.00 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "Trafik Kazası Sonrası Çekici Çağırma ve Kasko Hakları Rehberi",
      subheadings: ["Kaza Tespit Tutanağı Tutulurken Dikkat Edilecekler", "Kasko Ücretsiz Çekici Hakkı Nasıl Kullanılır?", "Özel Çekici Faturaları Sigortadan Nasıl Tahsil Edilir?", "Araç Güvenli Servise Çekilirken Alınacak Önlemler"],
      lsi: ["kaza tutanağı", "sigorta çekici karşılama", "kasko yol yardım", "araç kurtarma adımları"]
    },
    {
      keyword: "{city} Kadıköy 7/24 oto kurtarıcı",
      cluster: "İlçe & Bölge Lokasyonları",
      clusterColor: "#8b5cf6",
      volume: 3800,
      difficulty: 35,
      intent: "Acil / Yerel",
      cpc: "42.00 ₺",
      suggestedContentType: "İlçe Lokasyon Sayfası",
      titleTemplate: "Kadıköy Oto Çekici - {city} Anadolu Yakası Hızlı Kurtarıcı",
      subheadings: ["Bağdat Caddesi, Fikirtepe ve E-5 Acil Müdahale", "Motosiklet ve Alçak Taban Spor Araç Çekicisi", "Kapalı Otoparktan Araç Çıkarma Hizmeti", "Kadıköy Bölge Müşteri Yorumları ve Fiyatları"],
      lsi: ["kadıköy çekici", "anadolu yakası yol yardım", "moda çekici", "göztepe oto kurtarma"]
    },
    {
      keyword: "akü takviye ve yerinde lastik tamiri yol yardım",
      cluster: "Acil & Yerel Hizmetler",
      clusterColor: "#ef4444",
      volume: 4900,
      difficulty: 29,
      intent: "Ticari",
      cpc: "28.50 ₺",
      suggestedContentType: "Açılış Sayfası (Landing Page)",
      titleTemplate: "{city} Yerinde Akü Takviyesi ve Seyyar Lastik Tamiri Hizmeti",
      subheadings: ["Yolda Kalan Araçlar İçin Mobil Akü Desteği", "Seyyar Lastik Değişimi ve Hava Basma", "Yanlış Yakıt Boşaltma Çözümleri", "15 Dakikada Mobil Servis Aracı"],
      lsi: ["akü bitti ne yapmalıyım", "yerinde akü takviye", "nöbetçi lastikçi", "mobil yol yardım"]
    },
    {
      keyword: "ağır vasıta ve kamyonet çekici hizmeti",
      cluster: "Acil & Yerel Hizmetler",
      clusterColor: "#ef4444",
      volume: 3100,
      difficulty: 42,
      intent: "Ticari",
      cpc: "55.00 ₺",
      suggestedContentType: "Açılış Sayfası (Landing Page)",
      titleTemplate: "{city} Ağır Vasıta, Minibüs ve Kamyonet Çekici Hizmeti",
      subheadings: ["Ticari Araç ve Kamyonet Kurtarma Donanımı", "Ahtapot Vinçli Özel Taşıma", "Şehirlerarası Ticari Filo Taşımacılığı", "Kaskolu ve Sigortalı Araç Nakli"],
      lsi: ["ağır vasıta kurtarma", "kamyon çekici", "ahtapot çekici", "ticari araç kurtarıcı"]
    },
    {
      keyword: "otoparkta kalan araç nasıl çekilir kapalı otopark vinci",
      cluster: "Kılavuz & Nasıl Yapılır",
      clusterColor: "#3b82f6",
      volume: 2400,
      difficulty: 19,
      intent: "Bilgi",
      cpc: "14.50 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "Kapalı Otoparkta Kalan veya Kilitlenen Araç Nasıl Çıkarılır?",
      subheadings: ["Düşük Tavanlı Kapalı Otoparklara Uygun Çekiciler", "Tekerlekleri Kilitlenen Otomatik Vites Araç Kurtarma", "Özel Kayar Kasa ve Dolly Tekerlek Sistemleri", "Otopark Yönetimi ile Koordinasyon ve Güvenlik"],
      lsi: ["kapalı otopark çekici", "otomatik vites kilitlendi", "dolly tekerlek aparatı", "alçak tavan kurtarma"]
    },
    {
      keyword: "şehirler arası çoklu araç taşıma fiyatları",
      cluster: "Fiyat & Maliyet Tablosu",
      clusterColor: "#f59e0b",
      volume: 3600,
      difficulty: 38,
      intent: "Fiyat",
      cpc: "38.00 ₺",
      suggestedContentType: "Fiyat Tablosu & SSS",
      titleTemplate: "Şehirler Arası Çoklu ve Tekli Araç Taşıma Fiyat Listesi 2026",
      subheadings: ["İl İl Şehirlerarası Çekici Kilometre Maliyetleri", "Çoklu Çekici (Tır) İle Ekonomik Sevk Avantajı", "Sıfır ve İkinci El Araç Transfer Güvencesi", "Kasko ve CMR Sigortası Kapsamı"],
      lsi: ["şehirler arası araç taşıma", "çoklu oto taşıyıcı", "şehir dışı çekici fiyatı", "araç nakliyesi"]
    },
    {
      keyword: "oto çekici çağırırken dolandırıcılığa karşı 5 kural",
      cluster: "Karşılaştırma & Güven",
      clusterColor: "#10b981",
      volume: 1850,
      difficulty: 16,
      intent: "Bilgi",
      cpc: "11.20 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "Yol Yardımda Fahiş Fiyat ve Çekici Dolandırıcılığına Karşı 5 Kural",
      subheadings: ["Telefonda Net ve Nihai Fiyat Onayı İsteyin", "Vergi Levhalı ve Taşıma Kaskolu İşletmeleri Seçin", "Yetkisiz Korsan Çekicilerin Riskleri Nelerdir?", "Faturalı ve Resmi İşlem Önemi"],
      lsi: ["korsan çekici şikayet", "çekici güvenilirlik", "yol yardım dolandırıcılığı", "resmi kurtarıcı"]
    },
    {
      keyword: "{city} Ümraniye ve Dudullu oto kurtarıcı",
      cluster: "İlçe & Bölge Lokasyonları",
      clusterColor: "#8b5cf6",
      volume: 2900,
      difficulty: 26,
      intent: "Acil / Yerel",
      cpc: "32.00 ₺",
      suggestedContentType: "İlçe Lokasyon Sayfası",
      titleTemplate: "Ümraniye & Dudullu 7/24 Oto Çekici Hizmeti - {city}",
      subheadings: ["Şile Otoyolu ve TEM Bağlantı Noktaları", "Sanayi Sitesi ve Çevresi Acil Yol Yardım", "Sabit Fiyat ve Hızlı Varış Taahhüdü", "Bölge Çağrı Merkezi"],
      lsi: ["ümraniye çekici", "dudullu oto kurtarıcı", "şile yolu yol yardım", "tepeüstü çekici"]
    }
  ],
  "Halı & Koltuk Yıkama": [
    {
      keyword: "{city} yerinde koltuk yıkama fiyatları 2026",
      cluster: "Fiyat & Maliyet Tablosu",
      clusterColor: "#f59e0b",
      volume: 7200,
      difficulty: 27,
      intent: "Fiyat",
      cpc: "22.50 ₺",
      suggestedContentType: "Fiyat Tablosu & SSS",
      titleTemplate: "2026 {city} Yerinde Koltuk ve Yatak Yıkama Fiyat Tarifesi",
      subheadings: ["L Koltuk, Berjer ve Minder Fiyatlandırması", "Buharlı ve Antibakteriyel Yıkama Farkı", "Leke Çıkarma Garantisi Kapsamı", "Ücretsiz Servis ve Randevu Koşulları"],
      lsi: ["koltuk yıkama ne kadar", "evde koltuk temizleme fiyatı", "buharlı koltuk yıkama", "leke garantili temizlik"]
    },
    {
      keyword: "antibakteriyel halı yıkama aşamaları ve toz alma",
      cluster: "Kılavuz & Nasıl Yapılır",
      clusterColor: "#3b82f6",
      volume: 3800,
      difficulty: 21,
      intent: "Bilgi",
      cpc: "14.20 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "Fabrikada Profesyonel Antibakteriyel Halı Yıkama Aşamaları",
      subheadings: ["Otomatik Çırpma ve Derin Toz Alma İşlemi", "Doğal Bitkisel Şampuanlarla Çift Yönlü Fırçalama", "Kapalı Kurutma Odalarında %100 Hijyen", "Nem ve Koku Önleyici Hav Alma ve Paketleme"],
      lsi: ["halı yıkama adımları", "toz alma makinesi", "kapalı kurutma odası", "bitkisel halı şampuanı"]
    },
    {
      keyword: "{city} ipek ve yün el dokuma halı yıkama uzmanı",
      cluster: "Acil & Yerel Hizmetler",
      clusterColor: "#ef4444",
      volume: 4100,
      difficulty: 33,
      intent: "Ticari",
      cpc: "31.00 ₺",
      suggestedContentType: "Açılış Sayfası (Landing Page)",
      titleTemplate: "{city} El Dokuma, İpek ve Nepal Halı Yıkama Uzmanlığı",
      subheadings: ["Kök Boyalı Halılarda Renk Karışmasını Önleme", "Hassas Lifler İçin Özel PH Nötr Temizlik", "Bozulmayan Saçak Onarımı ve Overlok", "Sigortalı ve Garantili Teslimat"],
      lsi: ["el dokuma halı nasıl yıkanır", "ipek halı temizliği", "renk vermeyen yıkama", "antika halı bakımı"]
    },
    {
      keyword: "{city} ücretsiz servis halı yıkama bölgeleri",
      cluster: "İlçe & Bölge Lokasyonları",
      clusterColor: "#8b5cf6",
      volume: 5100,
      difficulty: 30,
      intent: "Acil / Yerel",
      cpc: "26.00 ₺",
      suggestedContentType: "İlçe Lokasyon Sayfası",
      titleTemplate: "{city} Tüm İlçelere Ücretsiz Servis Halı ve Koltuk Yıkama",
      subheadings: ["Adresten Alım ve 48 Saatte Adrese Teslim", "Servis Günleri ve Saat Aralıkları", "Minimum Sipariş Tutarı Olmadan Şeffaf Hizmet", "Online Takip ve SMS Bilgilendirmesi"],
      lsi: ["ücretsiz servis halı yıkama", "kapıdan halı alma", "48 saatte teslim", "hızlı servis temizlik"]
    },
    {
      keyword: "koltuktaki kahve ve çay lekesi nasıl çıkar",
      cluster: "Kılavuz & Nasıl Yapılır",
      clusterColor: "#3b82f6",
      volume: 6400,
      difficulty: 18,
      intent: "Bilgi",
      cpc: "12.00 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "Koltuktaki İnatçı Çay, Kahve ve Yağ Lekesini Çıkarma Rehberi",
      subheadings: ["Lekeye İlk 5 Dakikada Müdahale Püf Noktaları", "Kumaşa Zarar Vermeyen Doğal Karışımlar", "Neden Kimyasal Çamaşır Suyu Kullanılmamalı?", "Profesyonel Vakumlu Yıkamanın Gücü"],
      lsi: ["koltuk lekesi çıkarma", "çay lekesi koltuk", "kahve lekesi karbonat", "profesyonel leke çıkarıcı"]
    },
    {
      keyword: "halı yıkama fabrikası seçerken sorulacak 6 soru",
      cluster: "Karşılaştırma & Güven",
      clusterColor: "#10b981",
      volume: 2100,
      difficulty: 15,
      intent: "Bilgi",
      cpc: "11.00 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "Oto Yıkamacı ile Profesyonel Halı Yıkama Fabrikası Arasındaki Farklar",
      subheadings: ["Sokakta Yıkama Yapılan Yerlerin Zararları", "Endüstriyel Kurutma Odası Neden Şart?", "Sigortalı Hizmet ve Değişim Garantisi", "Müşteri Memnuniyet Yorumları"],
      lsi: ["oto yıkamada halı", "halı fabrikası farkı", "kurutma odası önemi", "güvenilir yıkama"]
    }
  ],
  "Diyetisyen & Beslenme Kliniği": [
    {
      keyword: "{city} online diyetisyen seans fiyatları 2026",
      cluster: "Fiyat & Maliyet Tablosu",
      clusterColor: "#f59e0b",
      volume: 6200,
      difficulty: 29,
      intent: "Fiyat",
      cpc: "28.00 ₺",
      suggestedContentType: "Fiyat Tablosu & SSS",
      titleTemplate: "2026 {city} Online Diyetisyen Paket Ücretleri ve Seans Programı",
      subheadings: ["Aylık Bireysel Online Diyet Paketleri Neleri Kapsar?", "Haftalık Görüşme ve 7/24 WhatsApp Desteği", "Kan Tahlili Değerlendirmesi ve Kişisel Menü", "Öğrenci ve Çift Diyet İndirimleri"],
      lsi: ["online diyet fiyat", "diyetisyen ücretleri 2026", "aylık diyet seansı", "whatsapp destekli diyet"]
    },
    {
      keyword: "insülin direnci ve pcos beslenme rehberi",
      cluster: "Kılavuz & Nasıl Yapılır",
      clusterColor: "#3b82f6",
      volume: 8100,
      difficulty: 34,
      intent: "Bilgi",
      cpc: "19.50 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "İnsülin Direnci ve PCOS'ta Kilo Verme & Beslenme Tedavisi",
      subheadings: ["İnsülin Direncini Kırmaya Yardımcı Besinler", "Glisemik İndeks Tablosu ve Akıllı Karbonhidrat Seçimi", "PCOS'ta Hormon Dengesini Sağlayan Diyet İpuçları", "Örnek 7 Günlük İnsülin Direnci Menüsü"],
      lsi: ["insülin direnci diyeti", "pcos beslenme", "glisemik indeks listesi", "tatlı krizini önleme"]
    },
    {
      keyword: "{city} yüz yüze diyetisyen randevusu ve vücut analizi",
      cluster: "Acil & Yerel Hizmetler",
      clusterColor: "#ef4444",
      volume: 4300,
      difficulty: 38,
      intent: "Acil / Yerel",
      cpc: "35.00 ₺",
      suggestedContentType: "Açılış Sayfası (Landing Page)",
      titleTemplate: "{city} Klinik İçi Tanita Profesyonel Vücut Analizi ve Diyet Seansı",
      subheadings: ["Segmental Kas ve Yağ Analizi Raporlama", "Bölgesel İncelme ve Metabolizma Hızı Ölçümü", "Kişiye Özel Yaşam Tarzı Beslenme Planı", "Kliniğimizin Adresi ve Randevu Takvimi"],
      lsi: ["vücut analizi diyetisyen", "tanita ölçüm", "klinik diyet randevu", "kas yağ oranı hesaplama"]
    },
    {
      keyword: "sporcu beslenmesi ve kas kütlesi artırma programı",
      cluster: "Kılavuz & Nasıl Yapılır",
      clusterColor: "#3b82f6",
      volume: 5400,
      difficulty: 26,
      intent: "Ticari",
      cpc: "24.00 ₺",
      suggestedContentType: "Kapsamlı Blog Rehberi",
      titleTemplate: "Kas Kütlesi Artırma ve Performans Odaklı Sporcu Beslenmesi",
      subheadings: ["Antrenman Öncesi ve Sonrası Makro Dağılımı", "Kilo Başına Günlük Protein İhtiyacı Hesaplama", "Kreatin, Whey ve Takviye Kullanım Zamanlaması", "Clean Bulk Dönemi İçin Örnek Beslenme Listesi"],
      lsi: ["sporcu diyeti", "kas kazanma beslenme", "protein ihtiyacı", "clean bulk menüsü"]
    }
  ]
};

// Generic fallback for any customized or unlisted sector
const GENERIC_SECTOR_PATTERNS: SectorKeywordTemplate[] = [
  {
    keyword: "{city} en iyi {sector} tavsiye ve kullanıcı yorumları",
    cluster: "Karşılaştırma & Güven",
    clusterColor: "#10b981",
    volume: 5400,
    difficulty: 31,
    intent: "Ticari",
    cpc: "26.00 ₺",
    suggestedContentType: "Açılış Sayfası (Landing Page)",
    titleTemplate: "{city} En İyi {sector} - 2026 Müşteri Memnuniyeti ve Tavsiyeler",
    subheadings: ["Neden Bizi Tercih Etmelisiniz?", "Müşteri Değerlendirmeleri ve Başarı Hikayeleri", "Garantili ve Sözleşmeli Hizmet İlkesi", "Hemen Teklif Alın"],
    lsi: ["en iyi {sector}", "güvenilir {sector}", "{sector} tavsiye", "memnuniyet garantisi"]
  },
  {
    keyword: "{city} {sector} fiyatları ve ücret tarifesi 2026",
    cluster: "Fiyat & Maliyet Tablosu",
    clusterColor: "#f59e0b",
    volume: 4800,
    difficulty: 27,
    intent: "Fiyat",
    cpc: "29.50 ₺",
    suggestedContentType: "Fiyat Tablosu & SSS",
    titleTemplate: "2026 {city} {sector} Fiyat Listesi ve Maliyet Hesaplama",
    subheadings: ["Hizmet Paketleri ve Net Ücretler", "Fiyatı Etkileyen Temel Kriterler", "Taksit ve Ödeme Seçenekleri", "Ücretsiz Ön İnceleme ve Keşif Fırsatı"],
    lsi: ["{sector} fiyatı", "{sector} ne kadar", "ücret tarifesi 2026", "ekonomik {sector}"]
  },
  {
    keyword: "{city} 7/24 acil {sector} iletişim ve hızlı servis",
    cluster: "Acil & Yerel Hizmetler",
    clusterColor: "#ef4444",
    volume: 6100,
    difficulty: 34,
    intent: "Acil / Yerel",
    cpc: "38.00 ₺",
    suggestedContentType: "Açılış Sayfası (Landing Page)",
    titleTemplate: "{city} 7/24 Acil {sector} - Anında İletişim ve Yerinde Destek",
    subheadings: ["15-30 Dakikada Hızlı Müdahale", "Gece ve Hafta Sonu Kesintisiz Hizmet", "Mobil Ekiplerimiz ve Konum Takibi", "Doğrudan Telefon ve WhatsApp Desteği"],
    lsi: ["acil {sector}", "7/24 {sector}", "en yakın {sector}", "{sector} telefon"]
  },
  {
    keyword: "{sector} seçerken nelere dikkat edilmeli kapsamlı rehber",
    cluster: "Kılavuz & Nasıl Yapılır",
    clusterColor: "#3b82f6",
    volume: 3200,
    difficulty: 22,
    intent: "Bilgi",
    cpc: "16.00 ₺",
    suggestedContentType: "Kapsamlı Blog Rehberi",
    titleTemplate: "Doğru {sector} Seçimi İçin Bilinmesi Gereken 7 Kritik Nokta",
    subheadings: ["Sertifika ve Yetki Belgelerinin Kontrolü", "Sözleşmesiz ve Faturasız İşlemlerin Tehlikeleri", "Referans Kontrolü Nasıl Yapılır?", "Satış Sonrası Destek Garantisi"],
    lsi: ["{sector} seçimi", "güvenilir firma", "dikkat edilmesi gerekenler", "hizmet standartları"]
  },
  {
    keyword: "{city} merkez ve tüm ilçelerde {sector} hizmeti",
    cluster: "İlçe & Bölge Lokasyonları",
    clusterColor: "#8b5cf6",
    volume: 3900,
    difficulty: 25,
    intent: "Acil / Yerel",
    cpc: "24.00 ₺",
    suggestedContentType: "İlçe Lokasyon Sayfası",
    titleTemplate: "{city} Tüm İlçelere Aynı Gün Servis {sector}",
    subheadings: ["İlçe İlçe Hizmet Ağımız", "Ekstra Yol Ücreti Olmadan Adrese Ulaşım", "Geniş Ekip ve Profesyonel Ekipman", "Bölgeniz İçin Randevu Alın"],
    lsi: ["{city} {sector}", "ilçe servis ağı", "adrese servis", "aynı gün teslimat"]
  },
  {
    keyword: "kaliteli {sector} ile amatör hizmet arasındaki 5 fark",
    cluster: "Karşılaştırma & Güven",
    clusterColor: "#10b981",
    volume: 2400,
    difficulty: 19,
    intent: "Bilgi",
    cpc: "13.50 ₺",
    suggestedContentType: "Kapsamlı Blog Rehberi",
    titleTemplate: "Profesyonel {sector} ile Merdiven Altı Hizmet Arasındaki 5 Temel Fark",
    subheadings: ["Teknolojik Donanım ve Modern Altyapı", "Eğitimli ve Sertifikalı Personel", "Şeffaf Fiyatlandırma ve Sözleşme", "Müşteri Memnuniyet Oranları"],
    lsi: ["profesyonel vs amatör", "kalite farkı", "hizmet güvencesi", "uzman kadro"]
  }
];

// ----------------------------------------------------------------------------
// ENGINE: GENERATE REALISTIC COMPETITORS
// ----------------------------------------------------------------------------
export function generateCompetitorsForSector(
  sector: string,
  city: string,
  _companyName: string
): ContentGapCompetitor[] {
  const cleanSector = sector.trim();
  const cleanCity = city.trim();
  const sectorSlug = cleanSector.toLowerCase().replace(/[^a-z0-9]/g, "");
  const citySlug = cleanCity.toLowerCase().replace(/[^a-z0-9]/g, "");

  return [
    {
      id: "comp-1",
      name: `Lider ${cleanSector} A.Ş.`,
      domain: `eniyi${sectorSlug || "hizmet"}.com`,
      url: `https://eniyi${sectorSlug || "hizmet"}.com`,
      color: "#f59e0b", // Amber
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      borderColor: "border-amber-500",
      marketShare: "%42 Pazar Payı",
      domainAuthority: 78,
      isSelected: true
    },
    {
      id: "comp-2",
      name: `${cleanCity} Uzman ${cleanSector}`,
      domain: `${citySlug || "yerel"}${sectorSlug || "servis"}.com.tr`,
      url: `https://${citySlug || "yerel"}${sectorSlug || "servis"}.com.tr`,
      color: "#f43f5e", // Rose
      badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      borderColor: "border-rose-500",
      marketShare: "%28 Pazar Payı",
      domainAuthority: 64,
      isSelected: true
    },
    {
      id: "comp-3",
      name: `Merkez ${cleanSector} Çözümleri`,
      domain: `pro${sectorSlug || "hizmet"}.net`,
      url: `https://pro${sectorSlug || "hizmet"}.net`,
      color: "#8b5cf6", // Purple
      badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      borderColor: "border-purple-500",
      marketShare: "%16 Pazar Payı",
      domainAuthority: 55,
      isSelected: true
    }
  ];
}

// ----------------------------------------------------------------------------
// ENGINE: BUILD FULL CONTENT GAP REPORT
// ----------------------------------------------------------------------------
export function buildContentGapReport(
  config: SiteConfig,
  competitors: ContentGapCompetitor[]
): ContentGapAnalysisReport {
  const sector = config.sector || "Oto Çekici & Kurtarıcı";
  const city = config.city || "İstanbul";
  const companyName = config.companyName || "Siteniz";
  const userDomain = config.cloudflare?.customDomain || (config.cloudflare?.subdomain ? `${config.cloudflare?.subdomain}.hizliweb.site` : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`);

  const activeCompetitors = competitors.filter(c => c.isSelected);
  // If user disabled all competitors, fallback to at least one
  const evalCompetitors = activeCompetitors.length > 0 ? activeCompetitors : [competitors[0]];

  // User existing assets
  const existingKeywordsText = (config.seo?.keywords || "").toLowerCase();
  const existingBlogTitles = (config.blog?.items || []).map(b => b.title.toLowerCase());
  const existingServices = (config.services?.items || []).map(s => s.title.toLowerCase());

  // Determine which template pattern to use
  const rawTemplates = SECTOR_KEYWORD_PATTERNS[sector] || GENERIC_SECTOR_PATTERNS;

  const keywords: ContentGapKeyword[] = rawTemplates.map((tpl, idx) => {
    // Fill dynamic placeholders
    const kwText = tpl.keyword
      .replace(/{city}/g, city)
      .replace(/{sector}/g, sector);

    const titleText = tpl.titleTemplate
      .replace(/{city}/g, city)
      .replace(/{sector}/g, sector);

    const cleanKw = kwText.toLowerCase();

    // Check if user has this keyword or content
    const inSeo = existingKeywordsText.includes(cleanKw) || existingKeywordsText.includes(tpl.keyword.split(" ")[0]);
    const inBlog = existingBlogTitles.some(t => t.includes(cleanKw) || cleanKw.includes(t));
    const inService = existingServices.some(s => s.includes(cleanKw) || cleanKw.includes(s));

    // Determine User Ranking
    let userRank: number | null = null;
    let status: GapStatus = "critical";

    if (inBlog || inService) {
      // User has page/content
      userRank = Math.floor(2 + ((idx * 3) % 8)); // Top 2-9
      status = userRank <= 3 ? "winning" : "weak";
    } else if (inSeo) {
      // User has in meta keywords only but no dedicated page -> ranked weak
      userRank = Math.floor(14 + ((idx * 5) % 18)); // Rank 14-31
      status = "weak";
    } else {
      // Missing completely!
      userRank = null;
      if (tpl.difficulty < 30) {
        status = "opportunity"; // Low KD opportunity
      } else {
        status = "critical";
      }
    }

    // Determine Competitor Rankings
    const competitorRanks: Record<string, number | null> = {};
    let bestCompRank = 99;
    let bestCompId = evalCompetitors[0].id;

    evalCompetitors.forEach((comp, cIdx) => {
      // Deterministic ranking simulation based on competitor DA & index
      let compRank: number | null = null;
      if (cIdx === 0) {
        // Market leader: ranks #1 - #4 on almost all keywords
        compRank = Math.max(1, ((idx * 2 + 1) % 4) + 1);
      } else if (cIdx === 1) {
        // Local specialist: ranks very strong on local & emergency keywords
        if (tpl.cluster.includes("Yerel") || tpl.cluster.includes("Acil")) {
          compRank = Math.max(1, ((idx + 2) % 3) + 1);
        } else {
          compRank = Math.max(3, ((idx * 3 + 2) % 8) + 3);
        }
      } else {
        // Challenger
        compRank = Math.max(2, ((idx * 4 + 3) % 9) + 2);
      }

      competitorRanks[comp.id] = compRank;

      if (compRank && compRank < bestCompRank) {
        bestCompRank = compRank;
        bestCompId = comp.id;
      }
    });

    // Recalculate status based on active competitors
    if (userRank === null) {
      if (bestCompRank <= 3 && tpl.volume >= 4000) {
        status = "critical";
      } else if (tpl.difficulty < 30 && tpl.volume >= 2500) {
        status = "opportunity";
      } else {
        status = "critical";
      }
    } else if (userRank > 10 && bestCompRank <= 5) {
      status = "weak";
    } else if (userRank <= 3) {
      status = "winning";
    }

    // Traffic estimates
    const monthlyVol = tpl.volume;
    // Expected CTR for Top 3 is ~32% of total search volume
    const potentialGain = Math.round(monthlyVol * 0.28);
    // If user rank is null or > 10, all potential traffic is currently lost
    const estimatedLoss = userRank === null || userRank > 10 ? potentialGain : Math.round(potentialGain * 0.4);

    const slug = titleText
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return {
      id: `gap-kw-${idx + 1}`,
      keyword: kwText,
      cluster: tpl.cluster,
      clusterColor: tpl.clusterColor,
      monthlyVolume: monthlyVol,
      difficulty: tpl.difficulty,
      difficultyLevel: tpl.difficulty < 25 ? "Kolay" : tpl.difficulty < 40 ? "Orta" : "Zor",
      searchIntent: tpl.intent,
      cpc: tpl.cpc,
      userRank,
      status,
      competitorRanks,
      bestCompetitorRank: bestCompRank === 99 ? 1 : bestCompRank,
      bestCompetitorId: bestCompId,
      estimatedTrafficLoss: estimatedLoss,
      potentialTrafficGain: potentialGain,
      suggestedContentType: tpl.suggestedContentType,
      suggestedTitle: titleText,
      suggestedSlug: slug,
      suggestedWordCount: tpl.suggestedContentType === "Kapsamlı Blog Rehberi" ? 1600 : tpl.suggestedContentType === "Fiyat Tablosu & SSS" ? 1100 : 950,
      keySubheadings: tpl.subheadings.map(s => s.replace(/{city}/g, city).replace(/{sector}/g, sector)),
      lsiKeywords: tpl.lsi.map(l => l.replace(/{city}/g, city).replace(/{sector}/g, sector))
    };
  });

  // Calculate cluster summaries
  const clusterMap: Record<string, TopicalClusterGapSummary> = {};

  keywords.forEach(kw => {
    if (!clusterMap[kw.cluster]) {
      clusterMap[kw.cluster] = {
        cluster: kw.cluster,
        totalKeywords: 0,
        userRankedCount: 0,
        userCoveragePercent: 0,
        competitorAverageCoveragePercent: 0,
        missingCount: 0,
        weakCount: 0,
        opportunityCount: 0,
        totalVolume: 0,
        color: kw.clusterColor
      };
    }

    const c = clusterMap[kw.cluster];
    c.totalKeywords += 1;
    c.totalVolume += kw.monthlyVolume;

    if (kw.userRank !== null && kw.userRank <= 10) {
      c.userRankedCount += 1;
    }
    if (kw.status === "critical") c.missingCount += 1;
    if (kw.status === "weak") c.weakCount += 1;
    if (kw.status === "opportunity") c.opportunityCount += 1;
  });

  const clusterSummaries = Object.values(clusterMap).map(c => {
    c.userCoveragePercent = Math.round((c.userRankedCount / Math.max(1, c.totalKeywords)) * 100);
    // Competitors usually cover 75-90% of cluster
    c.competitorAverageCoveragePercent = Math.min(95, 78 + (c.missingCount * 3));
    return c;
  });

  // Overall Statistics
  const totalKeywordsAnalyzed = keywords.length;
  const missingKeywordsCount = keywords.filter(k => k.status === "critical").length;
  const weakKeywordsCount = keywords.filter(k => k.status === "weak").length;
  const opportunityKeywordsCount = keywords.filter(k => k.status === "opportunity").length;
  const winningKeywordsCount = keywords.filter(k => k.status === "winning").length;

  const rankedCount = keywords.filter(k => k.userRank !== null && k.userRank <= 10).length;
  const overallCoverageScore = Math.round((rankedCount / Math.max(1, totalKeywordsAnalyzed)) * 100);
  const gapScore = 100 - overallCoverageScore;

  const totalMissedMonthlyTraffic = keywords
    .filter(k => k.status === "critical" || k.status === "weak" || k.status === "opportunity")
    .reduce((sum, k) => sum + k.estimatedTrafficLoss, 0);

  const totalPotentialGain = keywords
    .reduce((sum, k) => sum + k.potentialTrafficGain, 0);

  // Approximate revenue value: ~3% conversion rate, avg order value ~750 TL
  const approxValue = Math.round(totalMissedMonthlyTraffic * 0.025 * 750);
  const formattedRevenueLoss = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(approxValue);

  return {
    analyzedAt: new Date().toISOString(),
    sector,
    city,
    userDomain,
    competitors,
    keywords,
    clusterSummaries,
    overallStats: {
      totalKeywordsAnalyzed,
      missingKeywordsCount,
      weakKeywordsCount,
      opportunityKeywordsCount,
      winningKeywordsCount,
      overallCoverageScore,
      gapScore,
      totalMissedMonthlyTraffic,
      totalPotentialGain,
      estimatedMonthlyRevenueLoss: formattedRevenueLoss
    }
  };
}

// ----------------------------------------------------------------------------
// HELPER: CREATE READY BLOG POST DRAFT FROM GAP KEYWORD
// ----------------------------------------------------------------------------
export function generateBlogPostFromGap(kw: ContentGapKeyword, authorName: string = "SEO Editörü"): BlogPostItem {
  const dateStr = new Date().toISOString().slice(0, 10);
  const headingsHtml = kw.keySubheadings.map(h => `
    <h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">${h}</h3>
    <p class="text-slate-700 leading-relaxed mb-4">
      ${kw.keyword} konusunda uzman ekibimiz ile sunduğumuz standartlar çerçevesinde, kullanıcılarımızın en sık karşılaştığı sorunları ve çözüm adımlarını detaylandırıyoruz. Şeffaf fiyatlandırma, 7/24 operasyonel hız ve profesyonel ekipman garantisiyle her zaman yanınızdayız.
    </p>
  `).join("");

  const lsiListHtml = kw.lsiKeywords.map(l => `<span class="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg mr-2 mb-2">#${l}</span>`).join("");

  const contentHtml = `
    <p class="text-lg font-medium text-slate-800 leading-relaxed mb-6">
      ${kw.suggestedTitle} başlıklı bu kapsamlı rehberimizde; arama motorlarında rakiplerin en çok ziyaretçi aldığı ve kullanıcıların acil yanıt beklediği tüm kritik detayları bir araya getirdik.
    </p>
    ${headingsHtml}
    <div class="my-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
      <h4 class="text-base font-bold text-blue-950 mb-2">Uzman İpucu & Hızlı Teklif:</h4>
      <p class="text-sm text-blue-800 leading-relaxed">
        Beklemeden anında fiyat almak ve uzman ekibimizle iletişime geçmek için 7/24 çağrı hattımızı arayabilir veya doğrudan WhatsApp üzerinden konum paylaşabilirsiniz.
      </p>
    </div>
    <div class="mt-8 pt-6 border-t border-slate-200">
      <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">İlgili Arama Terimleri:</div>
      <div class="flex flex-wrap">${lsiListHtml}</div>
    </div>
  `;

  return {
    id: `blog-gap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: kw.suggestedTitle,
    slug: kw.suggestedSlug,
    category: kw.cluster,
    categories: [kw.cluster, "SEO Rehberleri"],
    excerpt: `${kw.suggestedTitle} - Aylık ${kw.monthlyVolume.toLocaleString("tr-TR")} arama hacmine sahip kritik içerik rehberi ve hizmet standartları.`,
    content: contentHtml,
    readTime: `${Math.ceil(kw.suggestedWordCount / 200)} dk okuma`,
    date: dateStr,
    author: authorName,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    imageAlt: kw.suggestedTitle,
    altText: kw.suggestedTitle,
    tags: [kw.keyword, kw.cluster, "SEO Rehberleri", ...kw.lsiKeywords.slice(0, 3)]
  };
}

// ----------------------------------------------------------------------------
// EXPORT FORMATTERS: CSV & JSON
// ----------------------------------------------------------------------------
export function exportContentGapToCSV(report: ContentGapAnalysisReport): string {
  const compNames = report.competitors.map(c => `"${c.name} (${c.domain})" Sıralaması`).join(",");
  const header = `"Anahtar Kelime","İçerik Kümesi","Arama Niyeti","Aylık Hacim","Zorluk (KD)","Sitenizin Sıralaması",${compNames},"Durum","Trafik Kaybı","Önerilen İçerik Başlığı","URL Slug"`;

  const rows = report.keywords.map(kw => {
    const compRanks = report.competitors.map(c => {
      const r = kw.competitorRanks[c.id];
      return r ? `"#${r}"` : `"Yok"`;
    }).join(",");

    const userR = kw.userRank ? `"#${kw.userRank}"` : `"Eksik (Sıralama Yok)"`;
    const statusText = kw.status === "critical" ? "Kritik Eksik" : kw.status === "weak" ? "Zayıf Kapsam" : kw.status === "opportunity" ? "Fırsat" : "Kazanılmış";

    return `"${kw.keyword}","${kw.cluster}","${kw.searchIntent}",${kw.monthlyVolume},${kw.difficulty},${userR},${compRanks},"${statusText}",${kw.estimatedTrafficLoss},"${kw.suggestedTitle}","${kw.suggestedSlug}"`;
  });

  return [header, ...rows].join("\n");
}
