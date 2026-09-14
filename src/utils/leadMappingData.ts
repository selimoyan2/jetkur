import {
  FormLead,
  SiteConfig,
  JourneyStageMeta,
  JourneyNode,
  JourneyLink,
  TopJourneyPath,
  ChannelEffectiveness,
  IndividualLeadJourney,
  JourneyStageKey,
  JourneyDropOffPoint,
  FunnelStageWithDropOff
} from "../types";

export const JOURNEY_STAGES: JourneyStageMeta[] = [
  {
    key: "touchpoint",
    title: "1. Reklam & İlk Temas",
    subtitle: "Google Ads, Meta, SEO & Sosyal Medya",
    order: 1,
    color: "#3b82f6" // blue
  },
  {
    key: "landing",
    title: "2. Karşılama Sayfası",
    subtitle: "Ziyaretçinin ilk girdiği sayfa / hero",
    order: 2,
    color: "#06b6d4" // cyan
  },
  {
    key: "engagement",
    title: "3. Etkileşim & Güven",
    subtitle: "Fiyat hesaplama, galeri, yorum & SSS",
    order: 3,
    color: "#8b5cf6" // purple
  },
  {
    key: "intent",
    title: "4. Teklif Formu & İletişim Niyeti",
    subtitle: "Form başlatma veya WhatsApp tıklaması",
    order: 4,
    color: "#f59e0b" // amber
  },
  {
    key: "conversion",
    title: "5. Nihai Dönüşüm & Satış",
    subtitle: "Onaylanan form başvurusu & ciro",
    order: 5,
    color: "#10b981" // emerald
  }
];

export const CHANNEL_COLORS: Record<string, string> = {
  ads: "#3b82f6", // Google Ads (Blue)
  organic: "#10b981", // Organic SEO (Emerald)
  social: "#8b5cf6", // Social Media / Meta (Violet)
  direct: "#f59e0b", // Direct / Brand (Amber)
  referral: "#06b6d4" // Referral / Partner (Cyan)
};

export const CHANNEL_NAMES: Record<string, string> = {
  ads: "Google Reklamları (Ads)",
  organic: "Organik Arama (SEO)",
  social: "Sosyal Medya & WhatsApp",
  direct: "Doğrudan Erişim (Direkt)",
  referral: "Tavsiye & İş Ortaklığı"
};

/**
 * Generates structured Journey Nodes for the D3 Journey Map
 */
export function getJourneyNodes(): JourneyNode[] {
  return [
    // --- STAGE 1: TOUCHPOINT / AD CLICK ---
    {
      id: "tp-google-search-ads",
      stage: "touchpoint",
      name: "Google Arama Reklamları (Ads)",
      shortName: "Google Search Ads",
      channel: "ads",
      visitors: 680,
      conversions: 218,
      conversionRate: 32.1,
      dropOffRate: 24.2,
      avgDealValue: 3450,
      iconName: "Search",
      color: "#3b82f6",
      badge: "🏆 En Yüksek Hacim & Ciro",
      isTopChannel: true
    },
    {
      id: "tp-google-local-ads",
      stage: "touchpoint",
      name: "Google Harita & Yerel Sponsor (LSA)",
      shortName: "Google Harita Reklamı",
      channel: "ads",
      visitors: 320,
      conversions: 114,
      conversionRate: 35.6,
      dropOffRate: 18.5,
      avgDealValue: 2800,
      iconName: "MapPin",
      color: "#2563eb",
      badge: "⚡ En Yüksek Dönüşüm Oranı (%35.6)",
      isTopChannel: true
    },
    {
      id: "tp-organic-seo",
      stage: "touchpoint",
      name: "Organik Arama (Google SEO & Maps)",
      shortName: "Organik SEO",
      channel: "organic",
      visitors: 540,
      conversions: 156,
      conversionRate: 28.9,
      dropOffRate: 31.0,
      avgDealValue: 3100,
      iconName: "Globe",
      color: "#10b981",
      badge: "💎 Sıfır Reklam Maliyeti",
      isTopChannel: true
    },
    {
      id: "tp-meta-ads",
      stage: "touchpoint",
      name: "Meta / Instagram Hikaye Reklamı",
      shortName: "Instagram & FB Ads",
      channel: "social",
      visitors: 410,
      conversions: 86,
      conversionRate: 21.0,
      dropOffRate: 46.2,
      avgDealValue: 1950,
      iconName: "Share2",
      color: "#8b5cf6",
      badge: "📱 Mobil Yoğunluk"
    },
    {
      id: "tp-direct-referral",
      stage: "touchpoint",
      name: "Doğrudan Erişim & Referans",
      shortName: "Doğrudan / Tavsiye",
      channel: "direct",
      visitors: 220,
      conversions: 68,
      conversionRate: 30.9,
      dropOffRate: 22.1,
      avgDealValue: 4200,
      iconName: "Award",
      color: "#f59e0b",
      badge: "🤝 Yüksek Müşteri Sadakati"
    },

    // --- STAGE 2: LANDING PAGE ---
    {
      id: "lp-emergency-towing",
      stage: "landing",
      name: "Acil Oto Çekici Hizmet Sayfası",
      shortName: "Çekici Açılış Sayfası",
      visitors: 850,
      conversions: 298,
      conversionRate: 35.1,
      dropOffRate: 22.0,
      avgDealValue: 3200,
      iconName: "Truck",
      color: "#0284c7",
      badge: "🔥 En Popüler Karşılama"
    },
    {
      id: "lp-home-hero-b",
      stage: "landing",
      name: "Ana Sayfa Hero (Hızlı Fiyat - Varyant B)",
      shortName: "Ana Sayfa (Varyant B)",
      visitors: 590,
      conversions: 192,
      conversionRate: 32.5,
      dropOffRate: 26.4,
      avgDealValue: 2900,
      iconName: "Zap",
      color: "#0ea5e9",
      badge: "⚡ Yüksek Tıklama Hızı"
    },
    {
      id: "lp-battery-service",
      stage: "landing",
      name: "Akü Takviye & Mobil Servis Sayfası",
      shortName: "Akü Servis Sayfası",
      visitors: 380,
      conversions: 94,
      conversionRate: 24.7,
      dropOffRate: 38.5,
      avgDealValue: 1450,
      iconName: "BatteryCharging",
      color: "#06b6d4"
    },
    {
      id: "lp-pricing-calculator",
      stage: "landing",
      name: "Fiyat Tarifesi & Canlı Mesafe Hesaplayıcı",
      shortName: "Fiyat & Hesaplayıcı",
      visitors: 350,
      conversions: 138,
      conversionRate: 39.4,
      dropOffRate: 15.2,
      avgDealValue: 4600,
      iconName: "Calculator",
      color: "#14b8a6",
      badge: "💎 En Yüksek Satın Alma Niyeti (%39.4)"
    },

    // --- STAGE 3: ENGAGEMENT & TRUST SIGNALS ---
    {
      id: "eng-price-calculate",
      stage: "engagement",
      name: "Mesafe / Fiyat Simülatörü Kullanıldı",
      shortName: "Fiyat Simülatörü",
      visitors: 620,
      conversions: 264,
      conversionRate: 42.6,
      dropOffRate: 12.0,
      avgDealValue: 3950,
      iconName: "DollarSign",
      color: "#7c3aed",
      badge: "⭐ Kritik Karar Aşaması (%42.6 Dönüşüm)"
    },
    {
      id: "eng-reviews-badges",
      stage: "engagement",
      name: "Müşteri Yorumları & Taşıma Kaskosu İncelendi",
      shortName: "Yorum & Güvenceler",
      visitors: 510,
      conversions: 178,
      conversionRate: 34.9,
      dropOffRate: 19.8,
      avgDealValue: 3400,
      iconName: "ShieldCheck",
      color: "#8b5cf6"
    },
    {
      id: "eng-gallery-fleet",
      stage: "engagement",
      name: "Araç Filosu & Kurtarma Galerisi Görüntülendi",
      shortName: "Filo Galerisi",
      visitors: 430,
      conversions: 112,
      conversionRate: 26.0,
      dropOffRate: 32.4,
      avgDealValue: 2750,
      iconName: "Camera",
      color: "#a855f7"
    },
    {
      id: "eng-direct-skip",
      stage: "engagement",
      name: "Doğrudan Teklif Formuna Atlama (Acil İhtiyaç)",
      shortName: "Doğrudan Forma Geçiş",
      visitors: 610,
      conversions: 248,
      conversionRate: 40.7,
      dropOffRate: 14.5,
      avgDealValue: 3100,
      iconName: "ArrowRightCircle",
      color: "#9333ea",
      badge: "🚨 Acil Müşteri Yolu"
    },

    // --- STAGE 4: INTENT & FORM INTERACTION ---
    {
      id: "int-quick-form",
      stage: "intent",
      name: "Hızlı Teklif Formu Doldurulmaya Başlandı",
      shortName: "Hızlı Form Başlangıcı",
      visitors: 640,
      conversions: 312,
      conversionRate: 48.8,
      dropOffRate: 14.2,
      avgDealValue: 3250,
      iconName: "FileText",
      color: "#d97706",
      badge: "🚀 En Hızlı Form Tamamlama"
    },
    {
      id: "int-corporate-form",
      stage: "intent",
      name: "Detaylı Kurumsal / Nakil Formu",
      shortName: "Kurumsal Form",
      visitors: 280,
      conversions: 164,
      conversionRate: 58.6,
      dropOffRate: 9.8,
      avgDealValue: 5800,
      iconName: "Building2",
      color: "#b45309",
      badge: "💼 En Yüksek Ortalama Sipariş (5.800 ₺)"
    },
    {
      id: "int-whatsapp-click",
      stage: "intent",
      name: "WhatsApp Doğrudan Destek Tıklandı",
      shortName: "WhatsApp Sohbet Başlat",
      visitors: 490,
      conversions: 166,
      conversionRate: 33.9,
      dropOffRate: 24.5,
      avgDealValue: 2100,
      iconName: "MessageCircle",
      color: "#f59e0b"
    },

    // --- STAGE 5: FINAL CONVERSION OUTCOME ---
    {
      id: "conv-completed-vip-lead",
      stage: "conversion",
      name: "Kazanılan VIP & Yüksek Değerli Talep",
      shortName: "VIP Form Talebi",
      visitors: 248,
      conversions: 248,
      conversionRate: 100.0,
      dropOffRate: 0,
      avgDealValue: 5400,
      iconName: "Crown",
      color: "#059669",
      badge: "👑 Toplam: 1.339.200 ₺",
      isTopChannel: true
    },
    {
      id: "conv-completed-standard-lead",
      stage: "conversion",
      name: "Standart Teklif Formu Başvurusu",
      shortName: "Standart Form",
      visitors: 294,
      conversions: 294,
      conversionRate: 100.0,
      dropOffRate: 0,
      avgDealValue: 2400,
      iconName: "CheckCircle2",
      color: "#10b981",
      badge: "✅ 294 Başarılı Kayıt"
    },
    {
      id: "conv-whatsapp-order",
      stage: "conversion",
      name: "WhatsApp Siparişi / Anında Çağrı Onayı",
      shortName: "WhatsApp Siparişi",
      visitors: 100,
      conversions: 100,
      conversionRate: 100.0,
      dropOffRate: 0,
      avgDealValue: 1850,
      iconName: "PhoneCall",
      color: "#34d399",
      badge: "⚡ 100 Hızlı Anlaşma"
    },
    {
      id: "conv-dropped-funnel",
      stage: "conversion",
      name: "Form Aşamasında Terk Edilenler (Drop-off)",
      shortName: "Terk Edilen Ziyaret",
      visitors: 528,
      conversions: 0,
      conversionRate: 0.0,
      dropOffRate: 100.0,
      avgDealValue: 0,
      iconName: "AlertTriangle",
      color: "#94a3b8",
      badge: "İyileştirme Fırsatı"
    }
  ];
}

/**
 * Generates flow links connecting stages with volume and conversion data
 */
export function getJourneyLinks(): JourneyLink[] {
  return [
    // STAGE 1 -> STAGE 2
    {
      id: "l-gads-to-emergency",
      source: "tp-google-search-ads",
      target: "lp-emergency-towing",
      visitors: 420,
      conversions: 158,
      conversionRate: 37.6,
      value: 42,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-gads-to-herob",
      source: "tp-google-search-ads",
      target: "lp-home-hero-b",
      visitors: 160,
      conversions: 44,
      conversionRate: 27.5,
      value: 16,
      channel: "ads"
    },
    {
      id: "l-gads-to-calc",
      source: "tp-google-search-ads",
      target: "lp-pricing-calculator",
      visitors: 100,
      conversions: 46,
      conversionRate: 46.0,
      value: 10,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-glocal-to-emergency",
      source: "tp-google-local-ads",
      target: "lp-emergency-towing",
      visitors: 240,
      conversions: 92,
      conversionRate: 38.3,
      value: 24,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-glocal-to-herob",
      source: "tp-google-local-ads",
      target: "lp-home-hero-b",
      visitors: 80,
      conversions: 22,
      conversionRate: 27.5,
      value: 8,
      channel: "ads"
    },
    {
      id: "l-seo-to-emergency",
      source: "tp-organic-seo",
      target: "lp-emergency-towing",
      visitors: 190,
      conversions: 58,
      conversionRate: 30.5,
      value: 19,
      channel: "organic"
    },
    {
      id: "l-seo-to-herob",
      source: "tp-organic-seo",
      target: "lp-home-hero-b",
      visitors: 220,
      conversions: 64,
      conversionRate: 29.1,
      value: 22,
      channel: "organic"
    },
    {
      id: "l-seo-to-battery",
      source: "tp-organic-seo",
      target: "lp-battery-service",
      visitors: 130,
      conversions: 34,
      conversionRate: 26.2,
      value: 13,
      channel: "organic"
    },
    {
      id: "l-meta-to-battery",
      source: "tp-meta-ads",
      target: "lp-battery-service",
      visitors: 210,
      conversions: 48,
      conversionRate: 22.8,
      value: 21,
      channel: "social"
    },
    {
      id: "l-meta-to-herob",
      source: "tp-meta-ads",
      target: "lp-home-hero-b",
      visitors: 130,
      conversions: 38,
      conversionRate: 29.2,
      value: 13,
      channel: "social"
    },
    {
      id: "l-meta-to-calc",
      source: "tp-meta-ads",
      target: "lp-pricing-calculator",
      visitors: 70,
      conversions: 18,
      conversionRate: 25.7,
      value: 7,
      channel: "social"
    },
    {
      id: "l-direct-to-calc",
      source: "tp-direct-referral",
      target: "lp-pricing-calculator",
      visitors: 110,
      conversions: 42,
      conversionRate: 38.2,
      value: 11,
      channel: "direct",
      isHighConverting: true
    },
    {
      id: "l-direct-to-emergency",
      source: "tp-direct-referral",
      target: "lp-emergency-towing",
      visitors: 110,
      conversions: 26,
      conversionRate: 23.6,
      value: 11,
      channel: "direct"
    },

    // STAGE 2 -> STAGE 3
    {
      id: "l-emrg-to-skip",
      source: "lp-emergency-towing",
      target: "eng-direct-skip",
      visitors: 380,
      conversions: 172,
      conversionRate: 45.3,
      value: 38,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-emrg-to-price",
      source: "lp-emergency-towing",
      target: "eng-price-calculate",
      visitors: 270,
      conversions: 120,
      conversionRate: 44.4,
      value: 27,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-emrg-to-reviews",
      source: "lp-emergency-towing",
      target: "eng-reviews-badges",
      visitors: 200,
      conversions: 62,
      conversionRate: 31.0,
      value: 20,
      channel: "ads"
    },
    {
      id: "l-herob-to-price",
      source: "lp-home-hero-b",
      target: "eng-price-calculate",
      visitors: 240,
      conversions: 104,
      conversionRate: 43.3,
      value: 24,
      channel: "organic",
      isHighConverting: true
    },
    {
      id: "l-herob-to-skip",
      source: "lp-home-hero-b",
      target: "eng-direct-skip",
      visitors: 230,
      conversions: 76,
      conversionRate: 33.0,
      value: 23,
      channel: "social"
    },
    {
      id: "l-herob-to-gallery",
      source: "lp-home-hero-b",
      target: "eng-gallery-fleet",
      visitors: 120,
      conversions: 28,
      conversionRate: 23.3,
      value: 12,
      channel: "organic"
    },
    {
      id: "l-calc-to-price",
      source: "lp-pricing-calculator",
      target: "eng-price-calculate",
      visitors: 310,
      conversions: 168,
      conversionRate: 54.2,
      value: 31,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-calc-to-reviews",
      source: "lp-pricing-calculator",
      target: "eng-reviews-badges",
      visitors: 40,
      conversions: 14,
      conversionRate: 35.0,
      value: 4,
      channel: "direct"
    },
    {
      id: "l-battery-to-gallery",
      source: "lp-battery-service",
      target: "eng-gallery-fleet",
      visitors: 190,
      conversions: 42,
      conversionRate: 22.1,
      value: 19,
      channel: "social"
    },
    {
      id: "l-battery-to-reviews",
      source: "lp-battery-service",
      target: "eng-reviews-badges",
      visitors: 190,
      conversions: 52,
      conversionRate: 27.4,
      value: 19,
      channel: "organic"
    },

    // STAGE 3 -> STAGE 4
    {
      id: "l-price-to-quick",
      source: "eng-price-calculate",
      target: "int-quick-form",
      visitors: 340,
      conversions: 184,
      conversionRate: 54.1,
      value: 34,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-price-to-corp",
      source: "eng-price-calculate",
      target: "int-corporate-form",
      visitors: 180,
      conversions: 116,
      conversionRate: 64.4,
      value: 18,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-price-to-wa",
      source: "eng-price-calculate",
      target: "int-whatsapp-click",
      visitors: 100,
      conversions: 42,
      conversionRate: 42.0,
      value: 10,
      channel: "social"
    },
    {
      id: "l-skip-to-quick",
      source: "eng-direct-skip",
      target: "int-quick-form",
      visitors: 300,
      conversions: 128,
      conversionRate: 42.7,
      value: 30,
      channel: "ads"
    },
    {
      id: "l-skip-to-wa",
      source: "eng-direct-skip",
      target: "int-whatsapp-click",
      visitors: 310,
      conversions: 124,
      conversionRate: 40.0,
      value: 31,
      channel: "social"
    },
    {
      id: "l-rev-to-corp",
      source: "eng-reviews-badges",
      target: "int-corporate-form",
      visitors: 100,
      conversions: 48,
      conversionRate: 48.0,
      value: 10,
      channel: "organic",
      isHighConverting: true
    },
    {
      id: "l-rev-to-quick",
      source: "eng-reviews-badges",
      target: "int-quick-form",
      visitors: 260,
      conversions: 94,
      conversionRate: 36.2,
      value: 26,
      channel: "organic"
    },
    {
      id: "l-gal-to-wa",
      source: "eng-gallery-fleet",
      target: "int-whatsapp-click",
      visitors: 220,
      conversions: 46,
      conversionRate: 20.9,
      value: 22,
      channel: "social"
    },
    {
      id: "l-gal-to-quick",
      source: "eng-gallery-fleet",
      target: "int-quick-form",
      visitors: 210,
      conversions: 52,
      conversionRate: 24.8,
      value: 21,
      channel: "social"
    },

    // STAGE 4 -> STAGE 5
    {
      id: "l-quick-to-vip",
      source: "int-quick-form",
      target: "conv-completed-vip-lead",
      visitors: 128,
      conversions: 128,
      conversionRate: 100.0,
      value: 13,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-quick-to-std",
      source: "int-quick-form",
      target: "conv-completed-standard-lead",
      visitors: 184,
      conversions: 184,
      conversionRate: 100.0,
      value: 18,
      channel: "organic"
    },
    {
      id: "l-quick-to-drop",
      source: "int-quick-form",
      target: "conv-dropped-funnel",
      visitors: 96,
      conversions: 0,
      conversionRate: 0.0,
      value: 10,
      channel: "social"
    },
    {
      id: "l-corp-to-vip",
      source: "int-corporate-form",
      target: "conv-completed-vip-lead",
      visitors: 120,
      conversions: 120,
      conversionRate: 100.0,
      value: 12,
      channel: "ads",
      isHighConverting: true
    },
    {
      id: "l-corp-to-std",
      source: "int-corporate-form",
      target: "conv-completed-standard-lead",
      visitors: 44,
      conversions: 44,
      conversionRate: 100.0,
      value: 5,
      channel: "organic"
    },
    {
      id: "l-corp-to-drop",
      source: "int-corporate-form",
      target: "conv-dropped-funnel",
      visitors: 28,
      conversions: 0,
      conversionRate: 0.0,
      value: 3,
      channel: "direct"
    },
    {
      id: "l-wa-to-order",
      source: "int-whatsapp-click",
      target: "conv-whatsapp-order",
      visitors: 100,
      conversions: 100,
      conversionRate: 100.0,
      value: 10,
      channel: "social"
    },
    {
      id: "l-wa-to-drop",
      source: "int-whatsapp-click",
      target: "conv-dropped-funnel",
      visitors: 140,
      conversions: 0,
      conversionRate: 0.0,
      value: 14,
      channel: "social"
    }
  ];
}

/**
 * Returns Top Performing Journey Paths (highlighting highest converting ad channels to final form submission)
 */
export function getTopJourneyPaths(): TopJourneyPath[] {
  return [
    {
      id: "path-1",
      name: "Google Search Ads ➔ Acil Çekici Sayfası ➔ Fiyat Hesaplama ➔ Hızlı Teklif Formu",
      channel: "ads",
      channelLabel: "Google Reklamları (Ads)",
      steps: [
        { stage: "touchpoint", name: "Google Arama Reklamı: 'Acil Çekici En Yakın'" },
        { stage: "landing", name: "Acil Çekici Hizmet Sayfası" },
        { stage: "engagement", name: "Fiyat Tarifesi & Mesafe Hesaplandı" },
        { stage: "intent", name: "Hızlı Teklif Formu Dolduruldu" },
        { stage: "conversion", name: "Onaylı VIP Müşteri Talebi" }
      ],
      visitors: 340,
      conversions: 128,
      conversionRate: 37.6,
      totalRevenue: 524000,
      avgDuration: "3.8 dk",
      efficiencyScore: 98,
      isWinner: true,
      highlightColor: "#3b82f6"
    },
    {
      id: "path-2",
      name: "Google Harita Reklamı (LSA) ➔ Fiyat Hesaplayıcı ➔ Doğrudan Kurumsal Form",
      channel: "ads",
      channelLabel: "Google Harita Reklamları",
      steps: [
        { stage: "touchpoint", name: "Google Haritalar Sponsorlu Sonuç" },
        { stage: "landing", name: "Fiyat & Mesafe Hesaplama Sayfası" },
        { stage: "engagement", name: "Fiyat Simülasyonu & Taşıma Kaskosu İncelendi" },
        { stage: "intent", name: "Detaylı Kurumsal Nakil Formu" },
        { stage: "conversion", name: "VIP Sözleşmeli Kurumsal Taşıma" }
      ],
      visitors: 190,
      conversions: 68,
      conversionRate: 35.8,
      totalRevenue: 394400,
      avgDuration: "4.5 dk",
      efficiencyScore: 94,
      isWinner: false,
      highlightColor: "#2563eb"
    },
    {
      id: "path-3",
      name: "Organik SEO ➔ Ana Sayfa Hero B ➔ Müşteri Yorumları ➔ Hızlı Form",
      channel: "organic",
      channelLabel: "Organik Arama (SEO)",
      steps: [
        { stage: "touchpoint", name: "Organik Google Arama (#1 Sıra)" },
        { stage: "landing", name: "Ana Sayfa Karşılama (Varyant B)" },
        { stage: "engagement", name: "Doğrulanmış Müşteri Yorumları & Sertifikalar" },
        { stage: "intent", name: "Hızlı Teklif Formu" },
        { stage: "conversion", name: "Standart Form Başvurusu (Kazanıldı)" }
      ],
      visitors: 220,
      conversions: 64,
      conversionRate: 29.1,
      totalRevenue: 198400,
      avgDuration: "6.2 dk",
      efficiencyScore: 89,
      isWinner: false,
      highlightColor: "#10b981"
    },
    {
      id: "path-4",
      name: "Doğrudan Ziyaret ➔ Fiyat Hesaplayıcı ➔ Hızlı Form ➔ Tamamlanan Satış",
      channel: "direct",
      channelLabel: "Doğrudan Erişim (Marka)",
      steps: [
        { stage: "touchpoint", name: "Doğrudan URL Girişi / Kayıtlı Yer İmi" },
        { stage: "landing", name: "Fiyat Tarifesi & Hesaplayıcı" },
        { stage: "engagement", name: "Fiyat Simülasyonu Tamamlandı" },
        { stage: "intent", name: "Hızlı Teklif Formu" },
        { stage: "conversion", name: "Sözleşmeli Taşıma Randevusu" }
      ],
      visitors: 110,
      conversions: 42,
      conversionRate: 38.2,
      totalRevenue: 176400,
      avgDuration: "2.4 dk",
      efficiencyScore: 92,
      isWinner: false,
      highlightColor: "#f59e0b"
    },
    {
      id: "path-5",
      name: "Instagram Hikaye Reklamı ➔ Mobil Akü Sayfası ➔ WhatsApp Canlı Destek",
      channel: "social",
      channelLabel: "Sosyal Medya (Meta Ads)",
      steps: [
        { stage: "touchpoint", name: "Instagram Hikaye Sponsorlu Video" },
        { stage: "landing", name: "Yerinde Akü Takviye Sayfası" },
        { stage: "engagement", name: "Kurtarma Galerisi & Konum Teyidi" },
        { stage: "intent", name: "WhatsApp Canlı Destek Butonu" },
        { stage: "conversion", name: "WhatsApp Anlık Çağrı & Servis Başlatma" }
      ],
      visitors: 210,
      conversions: 48,
      conversionRate: 22.8,
      totalRevenue: 93600,
      avgDuration: "3.1 dk",
      efficiencyScore: 78,
      isWinner: false,
      highlightColor: "#8b5cf6"
    }
  ];
}

/**
 * Returns Channel Effectiveness Ranking & Conversion Metrics
 */
export function getChannelEffectivenessList(leads: FormLead[] = []): ChannelEffectiveness[] {
  return [
    {
      channel: "ads",
      label: "Google Reklamları (Google Search & LSA Ads)",
      shortLabel: "Google Ads",
      description: "Arama motoru ve yerel sponsorlu kampanyalardan gelen ücretli trafik",
      color: "#3b82f6",
      visitors: 1000,
      conversions: 332,
      conversionRate: 33.2,
      dropOffRate: 22.4,
      avgDealValue: 3240,
      totalRevenue: 1075680,
      avgDuration: "4.1 dk",
      roiEstimate: 512, // %512 ROI
      topLandingPage: "Acil Oto Çekici Hizmet Sayfası (%37.6 Dönüşüm)",
      badge: "🏆 En Yüksek ROI & Hacim (%512)",
      badgeType: "gold",
      isWinner: true
    },
    {
      channel: "organic",
      label: "Organik Arama (Google SEO & Yerel Harita)",
      shortLabel: "Organik SEO",
      description: "Google aramalarından sıfır reklam maliyetiyle gelen doğal ziyaretçiler",
      color: "#10b981",
      visitors: 540,
      conversions: 156,
      conversionRate: 28.9,
      dropOffRate: 31.0,
      avgDealValue: 3100,
      totalRevenue: 483600,
      avgDuration: "6.2 dk",
      roiEstimate: 850, // Ultra high ROI (organic)
      topLandingPage: "Ana Sayfa Hero B (%29.1 Dönüşüm)",
      badge: "💎 En Düşük Müşteri Edinme Maliyeti (CPA)",
      badgeType: "silver",
      isWinner: false
    },
    {
      channel: "direct",
      label: "Doğrudan Erişim (Marka Bilinirliği & Kartvizit)",
      shortLabel: "Doğrudan Giriş",
      description: "Site adresini doğrudan yazan, kayıtlı ve sadık kurumsal müşteriler",
      color: "#f59e0b",
      visitors: 220,
      conversions: 68,
      conversionRate: 30.9,
      dropOffRate: 22.1,
      avgDealValue: 4200,
      totalRevenue: 285600,
      avgDuration: "2.4 dk",
      roiEstimate: 720,
      topLandingPage: "Fiyat Tarifesi & Canlı Hesaplayıcı",
      badge: "⚡ En Hızlı Karar Süresi (2.4 dk)",
      badgeType: "bronze",
      isWinner: false
    },
    {
      channel: "social",
      label: "Sosyal Medya & WhatsApp (Instagram / Facebook)",
      shortLabel: "Sosyal Medya",
      description: "Instagram reels ve hikaye sponsorlu reklamlarından gelen mobil kullanıcılar",
      color: "#8b5cf6",
      visitors: 410,
      conversions: 86,
      conversionRate: 21.0,
      dropOffRate: 46.2,
      avgDealValue: 1950,
      totalRevenue: 167700,
      avgDuration: "3.1 dk",
      roiEstimate: 290,
      topLandingPage: "Yerinde Akü Takviye & Mobil Servis",
      badge: "📱 Mobil WhatsApp Yüksekliği",
      badgeType: "standard",
      isWinner: false
    },
    {
      channel: "referral",
      label: "Tavsiye & İş Ortaklığı (Partner / Rehber Siteler)",
      shortLabel: "Referans",
      description: "Anlaşmalı oto servisleri, sigorta acenteleri ve rehberlerden yönlendirilenler",
      color: "#06b6d4",
      visitors: 180,
      conversions: 44,
      conversionRate: 24.4,
      dropOffRate: 33.0,
      avgDealValue: 3600,
      totalRevenue: 158400,
      avgDuration: "5.0 dk",
      roiEstimate: 360,
      topLandingPage: "Acil Çekici Hizmet Sayfası",
      badge: "🤝 Güvenilir Partner Trafiği",
      badgeType: "standard",
      isWinner: false
    }
  ];
}

/**
 * Builds realistic Individual Lead Journey Timelines connected to real CRM leads
 */
export function getIndividualLeadJourneys(leads: FormLead[]): IndividualLeadJourney[] {
  if (!leads || leads.length === 0) {
    return [];
  }

  return leads.map((lead, idx) => {
    const channel = lead.acquisitionChannel || (idx % 2 === 0 ? "ads" : idx % 3 === 0 ? "organic" : "social");
    const dealVal = lead.dealValue || (channel === "ads" ? 4500 : channel === "organic" ? 2800 : 1250);

    // Build realistic step sequence for each lead
    const isAds = channel === "ads";
    const isOrganic = channel === "organic";
    const isSocial = channel === "social";

    const steps = [
      {
        stage: "touchpoint" as JourneyStageKey,
        title: isAds
          ? "Google Ads Reklam Tıklaması (Arama Kampanyası)"
          : isOrganic
          ? "Organik Google Arama Sonucu (1. Sıra)"
          : isSocial
          ? "Instagram Hikaye Sponsorlu Gönderi"
          : "Doğrudan Web Sitesi Girişi",
        timestamp: "00:00",
        description: isAds
          ? "'Acil çekici yakınımda' anahtar kelimesi ile sponsorlu reklama tıklandı."
          : isOrganic
          ? "'Kadıköy oto kurtarıcı yol yardım' aramasından tıklandı."
          : "Instagram profil linki ve sponsorlu hikayeden gelindi.",
        isKeyMoment: true
      },
      {
        stage: "landing" as JourneyStageKey,
        title: lead.sourcePage || (isAds ? "Acil Çekici Hizmet Sayfası" : "Ana Sayfa Hero"),
        timestamp: "00:22",
        description: `Ziyaretçi ilk olarak ${lead.sourcePage || "karşılama"} sayfasını görüntüledi. Sayfa süresi 1 dk 15 sn.`,
        isKeyMoment: false
      },
      {
        stage: "engagement" as JourneyStageKey,
        title: isAds
          ? "Fiyat Tarifesi & Canlı Mesafe Hesaplayıcı İncelendi"
          : "Müşteri Yorumları & Sigorta Poliçesi İncelendi",
        timestamp: "01:45",
        description: isAds
          ? "Araç tipi binek seçildi ve yaklaşık km mesafesi hesaplandı."
          : "Gerçek Google müşteri yorumları ve 5 yıldızlı referanslar okundu.",
        isKeyMoment: true
      },
      {
        stage: "intent" as JourneyStageKey,
        title: "Teklif Formu Açıldı ve Alanlar Dolduruldu",
        timestamp: "03:10",
        description: `Ad: ${lead.name}, Telefon: ${lead.phone}, Hizmet: ${lead.serviceOrProduct} girildi.`,
        isKeyMoment: true
      },
      {
        stage: "conversion" as JourneyStageKey,
        title: "Form Gönderimi Başarıyla Tamamlandı",
        timestamp: "03:48",
        description: `Sisteme FormLead olarak işlendi. Durum: ${lead.status.toUpperCase()}. Değer: ${dealVal.toLocaleString("tr-TR")} ₺.`,
        isKeyMoment: true
      }
    ];

    return {
      id: `journey-${lead.id}`,
      leadId: lead.id,
      leadName: lead.name,
      serviceOrProduct: lead.serviceOrProduct,
      channel: channel as any,
      dealValue: dealVal,
      status: lead.status,
      date: lead.date,
      score: lead.leadScore || (channel === "ads" ? 88 : 72),
      totalDuration: isAds ? "3 dk 48 sn" : isOrganic ? "5 dk 12 sn" : "2 dk 40 sn",
      steps,
      outcome: `Tamamlanan Form (${lead.status === "closed" ? "Satış Yapıldı" : "Teklif İletildi"})`,
      isHighValue: dealVal >= 3000
    };
  });
}

/**
 * Common drop-off points along the customer journey with severity, friction root causes,
 * lost revenue estimates and 1-click remediation actions.
 */
export function getJourneyDropOffPoints(): JourneyDropOffPoint[] {
  return [
    {
      id: "dropoff-price-uncertainty",
      stage: "landing",
      stepName: "Karşılama Sayfası → Fiyat Tarifesi Belirsizliği",
      location: "Ana Sayfa Hero & Hizmetler Bölümü",
      channel: "ads",
      dropOffRate: 38.5,
      droppedVisitors: 327,
      totalVisitors: 850,
      retainedVisitors: 523,
      severity: "critical",
      frictionReason: "Kullanıcılar sayfaya girdiğinde net bir başlangıç fiyatı veya tahmini tarife göremediği için diğer sekmelere geçiyor.",
      detailedAnalysis: "Google Ads üzerinden 'acil çekici' veya 'oto kurtarma' aramasıyla gelen kullanıcıların %38.5'i sayfada 15 saniyeden az kalıp çıkmaktadır. Fiyat şeffaflığı olmayan sayfalarda ziyaretçi güveni hızla düşmektedir.",
      lostRevenueEstimate: 145000,
      recommendedFix: "Hero alanına '₺750'den Başlayan Fiyatlarla' ibaresi ve '30 Saniyede Canlı Fiyat Hesapla' butonu ekleyin.",
      quickActionTab: "ab-testing",
      quickActionLabel: "Hero Fiyat A/B Testi Başlat"
    },
    {
      id: "dropoff-form-fields",
      stage: "intent",
      stepName: "Teklif Formu → Çok Fazla Zorunlu Alan Sürtünmesi",
      location: "Detaylı Teklif Formu Modal / Bölümü",
      channel: "all",
      dropOffRate: 46.2,
      droppedVisitors: 212,
      totalVisitors: 460,
      retainedVisitors: 248,
      severity: "critical",
      frictionReason: "Formda ad, soyad, telefon, e-posta, araç plakası ve açık adres gibi 6 farklı alanın zorunlu tutulması mobil kullanıcıları bezdiriyor.",
      detailedAnalysis: "Formu başlatan 460 ziyaretçiden 212'si (%46.2) 3. alandan sonra formu kapatmaktadır. Özellikle araç plakası ve e-posta sorulduğunda terk oranı %58'e fırlamaktadır.",
      lostRevenueEstimate: 182000,
      recommendedFix: "Zorunlu alanları sadece 'Ad' ve 'Telefon Numarası' olarak 2'ye indirin; adresi arama sırasında öğrenin veya tek tıkla WhatsApp butonunu öne çıkarın.",
      quickActionTab: "custom-forms",
      quickActionLabel: "Form Alanlarını Sadeleştir"
    },
    {
      id: "dropoff-social-proof",
      stage: "engagement",
      stepName: "Etkileşim Aşaması → Sosyal Kanıt & Yorum Eksikliği",
      location: "Hizmet Sayfaları & İnceleme Bölümü",
      channel: "organic",
      dropOffRate: 31.0,
      droppedVisitors: 192,
      totalVisitors: 620,
      retainedVisitors: 428,
      severity: "high",
      frictionReason: "Organik SEO ile gelen kullanıcılar işletmenin güvenilirliğini teyit edemediğinde (Google Maps puanı, onaylı yorum rozetleri) ayrılıyor.",
      detailedAnalysis: "Organik arama ile blog veya hizmet sayfalarına giren kullanıcılar firma referansı veya sigortalı taşıma poliçesi belgesi görmeyince teklif aşamasına geçmeden çıkmaktadır.",
      lostRevenueEstimate: 98000,
      recommendedFix: "Karşılama ve form bölümlerinin hemen altına '4.9 ★★★★★ 340+ Onaylı Müşteri Yorumu' ve 'Yetkili Kasko Güvencesi' rozeti ekleyin.",
      quickActionTab: "testimonials",
      quickActionLabel: "Müşteri Yorumlarını Öne Çıkar"
    },
    {
      id: "dropoff-mobile-speed",
      stage: "touchpoint",
      stepName: "İlk Temas → Mobil Ağda Açılış Gecikmesi (LCP)",
      location: "Mobil Web Sitesi Girişi",
      channel: "social",
      dropOffRate: 24.2,
      droppedVisitors: 172,
      totalVisitors: 710,
      retainedVisitors: 538,
      severity: "high",
      frictionReason: "Instagram veya TikTok'tan gelen mobilde 4G/3G bağlantıda 3 saniyeden uzun süren ilk içerik boyaması (LCP) nedeniyle beklemeden ayrılma.",
      detailedAnalysis: "Sosyal medya kullanıcılarının sabır süresi ortalama 1.8 saniyedir. Sıkıştırılmamış banner görselleri nedeniyle mobil ziyaretçilerin %24.2'si sayfa yüklenmeden geri basmaktadır.",
      lostRevenueEstimate: 76000,
      recommendedFix: "Global Edge önbelleklemeyi ve WebP görsel sıkıştırmayı etkinleştirerek mobil açılış süresini 0.02s - 0.4s seviyesine indirin.",
      quickActionTab: "performance-monitor",
      quickActionLabel: "Performans & Hız Testi Yap"
    },
    {
      id: "dropoff-offhours-hesitation",
      stage: "intent",
      stepName: "Mesai Dışı & Gece Ziyaretleri → Cevapsız Kalma Korkusu",
      location: "20:00 - 08:00 Arası Teklif & İletişim Butonları",
      channel: "ads",
      dropOffRate: 22.1,
      droppedVisitors: 75,
      totalVisitors: 340,
      retainedVisitors: 265,
      severity: "medium",
      frictionReason: "Gece veya hafta sonu gelen acil kullanıcılar şirketin açık olup olmadığından emin olamayıp telefonla aramak yerine WhatsApp'a tık çekiniyor.",
      detailedAnalysis: "Gece gelen 340 aramadan 75'i 'Şu an açık mısınız?' şüphesiyle form göndermeden ayrılmaktadır. Gece acil leadlerin birim değeri gündüze göre %40 daha yüksektir.",
      lostRevenueEstimate: 42000,
      recommendedFix: "Sitenin en üstüne '7/24 Kesintisiz Nöbetçi Ekip Sahada' rozeti ve gece saatlerinde anında tetiklenen 'WhatsApp Canlı Yanıt' botunu aktif edin.",
      quickActionTab: "automated-responses",
      quickActionLabel: "7/24 Otomatik Yanıt Kuralları"
    }
  ];
}

/**
 * 5-Stage Funnel Retention & Drop-off waterfall data for D3 chart
 */
export function getFunnelStagesWithDropOffs(): FunnelStageWithDropOff[] {
  return [
    {
      stageKey: "touchpoint",
      stageName: "1. Reklam & Siteye Giriş",
      stageOrder: 1,
      color: "#3b82f6",
      visitors: 2480,
      retentionRate: 100,
      dropOffCount: 580,
      dropOffRate: 23.4,
      lostRevenueEstimate: 85000,
      primaryDropOffReason: "Alakasız arama niyeti veya ilk boyama gecikmesi (Hemen Çıkma - Bounce)",
      topDropOffAction: "Negatif anahtar kelimeleri filtreleyin ve mobil açılış hızını 0.4s altına çekin."
    },
    {
      stageKey: "landing",
      stageName: "2. Karşılama Sayfası İnceleme",
      stageOrder: 2,
      color: "#06b6d4",
      visitors: 1900,
      retentionRate: 76.6,
      dropOffCount: 590,
      dropOffRate: 31.1,
      lostRevenueEstimate: 145000,
      primaryDropOffReason: "Hero alanında başlangıç fiyatı bulunmaması ve net olmayan hizmet bölgesi",
      topDropOffAction: "Hero alanına '₺750'den Başlayan' tarifesi ve '30 Saniyede Canlı Hesapla' ekleyin."
    },
    {
      stageKey: "engagement",
      stageName: "3. Etkileşim & Fiyat Hesaplama",
      stageOrder: 3,
      color: "#8b5cf6",
      visitors: 1310,
      retentionRate: 52.8,
      dropOffCount: 540,
      dropOffRate: 41.2,
      lostRevenueEstimate: 128000,
      primaryDropOffReason: "Hesaplanan fiyat sonrası güven kanıtı (Google yorumları / sigorta rozeti) eksikliği",
      topDropOffAction: "Hesaplayıcının altına '4.9 ★★★★★ 340+ Onaylı Müşteri' ve Yetkili Taşıma rozeti koyun."
    },
    {
      stageKey: "intent",
      stageName: "4. Teklif Formu Başlatma",
      stageOrder: 4,
      color: "#f59e0b",
      visitors: 770,
      retentionRate: 31.0,
      dropOffCount: 212,
      dropOffRate: 27.5,
      lostRevenueEstimate: 182000,
      primaryDropOffReason: "Formda çok fazla alan istenmesi ve tek tık WhatsApp alternatifinin arka planda kalması",
      topDropOffAction: "Zorunlu alanları sadece Ad ve Telefona indirin; 'Tek Tıkla WhatsApp Teklifi Al'ı öne çıkarın."
    },
    {
      stageKey: "conversion",
      stageName: "5. Nihai Lead Dönüşümü & Satış",
      stageOrder: 5,
      color: "#10b981",
      visitors: 558,
      retentionRate: 22.5,
      dropOffCount: 0,
      dropOffRate: 0,
      lostRevenueEstimate: 0,
      primaryDropOffReason: "Hedef dönüşüm başarıyla tamamlandı (Onaylı Form / Anlaşma Sağlandı)",
      topDropOffAction: "Müşteriye anında otomatik SMS & WhatsApp 'Talebiniz Alındı' bildirimi gönderin."
    }
  ];
}
