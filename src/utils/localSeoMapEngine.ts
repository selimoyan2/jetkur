import { SiteConfig, LocalCompetitorPin, LocalDistrictSearchVolume, LocalSeoMapSummary } from "../types";
import { lookupCityCoordinates } from "./schemaOrgGenerator";

/**
 * Known districts per major Turkish cities for realistic local SEO geospatial projection
 */
const CITY_DISTRICTS: Record<
  string,
  { name: string; dLat: number; dLng: number; weight: number }[]
> = {
  istanbul: [
    { name: "Kadıköy", dLat: -0.015, dLng: 0.045, weight: 1.25 },
    { name: "Üsküdar", dLat: 0.018, dLng: 0.035, weight: 0.95 },
    { name: "Beşiktaş", dLat: 0.035, dLng: 0.005, weight: 1.15 },
    { name: "Şişli", dLat: 0.052, dLng: -0.015, weight: 1.1 },
    { name: "Ataşehir", dLat: -0.012, dLng: 0.115, weight: 0.9 },
    { name: "Bakırköy", dLat: -0.025, dLng: -0.115, weight: 0.85 },
    { name: "Maltepe", dLat: -0.085, dLng: 0.135, weight: 0.8 },
    { name: "Ümraniye", dLat: 0.025, dLng: 0.118, weight: 0.88 }
  ],
  ankara: [
    { name: "Çankaya", dLat: -0.025, dLng: -0.015, weight: 1.3 },
    { name: "Yenimahalle", dLat: 0.045, dLng: -0.042, weight: 1.05 },
    { name: "Keçiören", dLat: 0.065, dLng: 0.025, weight: 1.1 },
    { name: "Mamak", dLat: -0.015, dLng: 0.065, weight: 0.85 },
    { name: "Etimesgut", dLat: 0.035, dLng: -0.125, weight: 0.9 },
    { name: "Sincan", dLat: 0.055, dLng: -0.185, weight: 0.75 }
  ],
  izmir: [
    { name: "Konak", dLat: 0.005, dLng: 0.015, weight: 1.2 },
    { name: "Karşıyaka", dLat: 0.055, dLng: 0.025, weight: 1.15 },
    { name: "Bornova", dLat: 0.045, dLng: 0.095, weight: 1.1 },
    { name: "Bayraklı", dLat: 0.050, dLng: 0.055, weight: 0.95 },
    { name: "Buca", dLat: -0.045, dLng: 0.035, weight: 0.85 },
    { name: "Çiğli", dLat: 0.085, dLng: -0.025, weight: 0.75 }
  ],
  bursa: [
    { name: "Nilüfer", dLat: -0.015, dLng: -0.055, weight: 1.25 },
    { name: "Osmangazi", dLat: 0.015, dLng: 0.015, weight: 1.2 },
    { name: "Yıldırım", dLat: 0.005, dLng: 0.065, weight: 0.95 },
    { name: "Mudanya", dLat: 0.165, dLng: -0.035, weight: 0.8 }
  ],
  antalya: [
    { name: "Muratpaşa", dLat: 0.005, dLng: 0.015, weight: 1.25 },
    { name: "Konyaaltı", dLat: -0.015, dLng: -0.055, weight: 1.15 },
    { name: "Kepez", dLat: 0.045, dLng: -0.015, weight: 1.0 },
    { name: "Alanya", dLat: -0.145, dLng: 0.355, weight: 0.95 }
  ]
};

/**
 * Generates rich, realistic Local SEO Local Pack rankings, geospatial pins, and district search volumes
 */
export function generateLocalSeoMapData(
  config: SiteConfig,
  customPins: LocalCompetitorPin[] = []
): {
  center: { lat: number; lng: number; cityName: string };
  pins: LocalCompetitorPin[];
  userPin: LocalCompetitorPin;
  leaderPin: LocalCompetitorPin;
  districts: LocalDistrictSearchVolume[];
  summary: LocalSeoMapSummary;
} {
  const cityName = config.city?.trim() || "İstanbul";
  const cityKey = cityName.toLowerCase().replace(/[^a-z]/g, "");
  const coords = lookupCityCoordinates(cityName) || { lat: "41.0082", lng: "28.9784" };
  const baseLat = parseFloat(coords.lat);
  const baseLng = parseFloat(coords.lng);

  const company = config.companyName || "Bizim Firma";
  const sector = config.sector || "Oto Çekici & Kurtarıcı";
  const phone = config.phone || "0532 000 00 00";
  const address = config.address || `${cityName} Merkez`;

  // Get matching district presets or fallback
  const districtDefs = CITY_DISTRICTS[cityKey] || [
    { name: `${cityName} Merkez`, dLat: 0.0, dLng: 0.0, weight: 1.2 },
    { name: `${cityName} Kuzey`, dLat: 0.035, dLng: 0.015, weight: 1.0 },
    { name: `${cityName} Güney`, dLat: -0.035, dLng: -0.015, weight: 0.9 },
    { name: `${cityName} Doğu`, dLat: 0.015, dLng: 0.045, weight: 0.85 },
    { name: `${cityName} Batı`, dLat: -0.015, dLng: -0.045, weight: 0.8 }
  ];

  const primaryDistrict = districtDefs[0].name;

  // Base monthly searches for sector
  const baseSectorVolume = 4800;

  // User Pin (Local Pack Rank #2 or #1 in primary district)
  const userPin: LocalCompetitorPin = {
    id: "user-local-pin",
    name: `${company} (Siteniz)`,
    isUser: true,
    latitude: baseLat,
    longitude: baseLng,
    district: primaryDistrict,
    city: cityName,
    address: address,
    phone: phone,
    rating: 4.9,
    reviewCount: 138,
    localPackRank: 2,
    inTop3LocalPack: true,
    localSearchVolume: Math.round(baseSectorVolume * districtDefs[0].weight * 0.38),
    primaryLocalKeyword: `${primaryDistrict} ${sector.toLowerCase()}`,
    gmbVerified: true,
    hasCitations: true,
    citationScore: 92,
    geoRadiusKm: 18,
    topLocalAdvantage: "7/24 Kesintisiz çalışma saati, 4.9 yıldız müşteri memnuniyeti ve 1.1s hızlı mobil harita butonları.",
    gmbGaps: ["Google Haritalar haftalık gönderi (post) sıklığı artırılabilir", "Müşteri fotoğraf yüklemeleri teşvik edilmeli"]
  };

  // Competitor 1: Local Pack Leader #1
  const comp1: LocalCompetitorPin = {
    id: "comp-local-1",
    name: `Lider ${sector} Hizmetleri`,
    isUser: false,
    latitude: baseLat + 0.018,
    longitude: baseLng + 0.022,
    district: districtDefs[1]?.name || `${cityName} Doğu`,
    city: cityName,
    address: `${districtDefs[1]?.name || cityName} Sanayi Cad. No:14`,
    phone: "0850 333 44 55",
    rating: 4.7,
    reviewCount: 310,
    localPackRank: 1,
    inTop3LocalPack: true,
    localSearchVolume: Math.round(baseSectorVolume * (districtDefs[1]?.weight || 1) * 0.44),
    primaryLocalKeyword: `${districtDefs[1]?.name || cityName} ${sector.toLowerCase()}`,
    gmbVerified: true,
    hasCitations: true,
    citationScore: 96,
    geoRadiusKm: 22,
    topLocalAdvantage: "300+ doğrulanmış Google harita incelemesi ve 6 yıllık oturmuş işletme profili.",
    gmbGaps: ["Yavaş web sitesi nedeniyle haritadan web sitesine tıklama dönüşüm kaybı", "Soru-cevap alanı yanıtsız"]
  };

  // Competitor 2: Local Pack #3
  const comp2: LocalCompetitorPin = {
    id: "comp-local-2",
    name: `Uzman ${sector} Ltd.`,
    isUser: false,
    latitude: baseLat - 0.022,
    longitude: baseLng - 0.018,
    district: districtDefs[2]?.name || `${cityName} Güney`,
    city: cityName,
    address: `${districtDefs[2]?.name || cityName} Çarşı Yolu No:8`,
    phone: "0216 444 12 34",
    rating: 4.5,
    reviewCount: 88,
    localPackRank: 3,
    inTop3LocalPack: true,
    localSearchVolume: Math.round(baseSectorVolume * (districtDefs[2]?.weight || 0.9) * 0.22),
    primaryLocalKeyword: `${districtDefs[2]?.name || cityName} en yakın ${sector.toLowerCase()}`,
    gmbVerified: true,
    hasCitations: false,
    citationScore: 68,
    geoRadiusKm: 12,
    topLocalAdvantage: "Konum merkezine yakınlığı sayesinde semt içi anlık aramalarda ilk 3'e tutunuyor.",
    gmbGaps: ["Geri bildirim oranı düşük (88 yorum)", "Eksik işletme açıklaması ve eksik hizmet listesi"]
  };

  // Competitor 3: Outside Local Pack #4
  const comp3: LocalCompetitorPin = {
    id: "comp-local-3",
    name: `Hızlı ${sector} Servisi`,
    isUser: false,
    latitude: baseLat + 0.035,
    longitude: baseLng - 0.032,
    district: districtDefs[3]?.name || `${cityName} Batı`,
    city: cityName,
    address: `${districtDefs[3]?.name || cityName} Bulvar No:25`,
    phone: "0535 999 88 77",
    rating: 4.1,
    reviewCount: 42,
    localPackRank: 4,
    inTop3LocalPack: false,
    localSearchVolume: Math.round(baseSectorVolume * (districtDefs[3]?.weight || 0.8) * 0.14),
    primaryLocalKeyword: `7/24 ${sector.toLowerCase()} ${districtDefs[3]?.name || cityName}`,
    gmbVerified: false,
    hasCitations: false,
    citationScore: 45,
    geoRadiusKm: 8,
    topLocalAdvantage: "Düşük fiyatlı teklifler ve yoğun telefonla arama aksiyonu.",
    gmbGaps: ["Doğrulanmamış işletme profili riski", "Yetkisiz veya düzensiz çalışma saatleri", "Düşük puan (4.1)"]
  };

  // Competitor 4: Outside Local Pack #5
  const comp4: LocalCompetitorPin = {
    id: "comp-local-4",
    name: `Mega ${sector} Noktası`,
    isUser: false,
    latitude: baseLat - 0.038,
    longitude: baseLng + 0.042,
    district: districtDefs[4]?.name || `${cityName} Doğu`,
    city: cityName,
    address: `${districtDefs[4]?.name || cityName} Çevre Yolu`,
    phone: "0542 111 22 33",
    rating: 3.9,
    reviewCount: 29,
    localPackRank: 5,
    inTop3LocalPack: false,
    localSearchVolume: Math.round(baseSectorVolume * (districtDefs[4]?.weight || 0.8) * 0.08),
    primaryLocalKeyword: `${districtDefs[4]?.name || cityName} acil ${sector.toLowerCase()}`,
    gmbVerified: true,
    hasCitations: false,
    citationScore: 52,
    geoRadiusKm: 9,
    topLocalAdvantage: "Ana çevre yolu bağlantısında olması.",
    gmbGaps: ["Yüksek oranda olumsuz müşteri şikayeti", "Web sitesi bulunmuyor veya çalışmıyor"]
  };

  const allPins = [userPin, comp1, comp2, comp3, comp4, ...customPins];

  // District Search Volume & Opportunities
  const districts: LocalDistrictSearchVolume[] = districtDefs.map((d, idx) => {
    const monthlyVolume = Math.round(baseSectorVolume * d.weight * 0.42);
    const userRankInDistrict = idx === 0 ? 1 : idx === 1 ? 2 : idx === 2 ? 3 : 4;
    const oppScore = userRankInDistrict <= 2 ? 88 : idx === 2 ? 74 : 62;

    return {
      districtName: d.name,
      monthlySearchVolume: monthlyVolume,
      competitorDensity: idx <= 1 ? "Yüksek" : idx <= 3 ? "Orta" : "Düşük",
      userLocalPackRank: userRankInDistrict,
      opportunityScore: oppScore,
      primaryKeyword: `${d.name} ${sector.toLowerCase()}`,
      topCompetitorName: idx === 0 ? userPin.name : comp1.name
    };
  });

  const totalLocalMonthlyVolume = districts.reduce((acc, d) => acc + d.monthlySearchVolume, 0);
  const inTop3Districts = districts.filter((d) => d.userLocalPackRank <= 3).length;
  const top3PackCoveragePercent = Math.round((inTop3Districts / districts.length) * 100);

  const summary: LocalSeoMapSummary = {
    city: cityName,
    sector: sector,
    userRank: 2,
    totalLocalMonthlyVolume: totalLocalMonthlyVolume,
    top3PackCoveragePercent: top3PackCoveragePercent,
    bestPerformingDistrict: districtDefs[0].name,
    highestOpportunityDistrict: districtDefs[2]?.name || districtDefs[1]?.name || `${cityName} Bölgesi`,
    gmbAuditScore: 92,
    reviewGapVsLeader: comp1.reviewCount - userPin.reviewCount,
    tacticalAction: `${districtDefs[2]?.name || "Komşu semt"} bölgesinde Local 3-Pack'te 3. sıradasınız. Hedefli 15 yeni Google harita yorumu ve yerel açılış sayfası şeması ile bu bölgede pazar liderliğini doğrudan ele geçirebilirsiniz.`
  };

  return {
    center: { lat: baseLat, lng: baseLng, cityName },
    pins: allPins,
    userPin,
    leaderPin: comp1,
    districts,
    summary
  };
}

/**
 * Exports Local SEO Pack audit and rankings to CSV format
 */
export function exportLocalSeoMapCsv(pins: LocalCompetitorPin[]): string {
  const headers = [
    "Sıralama",
    "İşletme Adı",
    "Durum",
    "Google 3-Pack İçi mi?",
    "Puan",
    "Yorum Sayısı",
    "Semt",
    "Şehir",
    "Telefon",
    "Yerel Arama Hacmi (Aylık)",
    "Anahtar Kelime",
    "Harita Doğrulama (GMB)",
    "Dizin / Citation Skoru",
    "Hizmet Yarıçapı (km)",
    "Yerel Güçlü Yönü"
  ];

  const rows = pins.map((p) => [
    p.localPackRank,
    `"${p.name.replace(/"/g, '""')}"`,
    p.isUser ? "Siteniz" : "Rakip",
    p.inTop3LocalPack ? "EVET (Top 3 Pack)" : "HAYIR (>3)",
    p.rating,
    p.reviewCount,
    `"${p.district}"`,
    `"${p.city}"`,
    `"${p.phone}"`,
    p.localSearchVolume,
    `"${p.primaryLocalKeyword}"`,
    p.gmbVerified ? "Doğrulanmış" : "Doğrulanmamış",
    p.citationScore,
    `${p.geoRadiusKm} km`,
    `"${p.topLocalAdvantage.replace(/"/g, '""')}"`
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
