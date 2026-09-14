import { QuickStartDesignSet } from "../types";
import { COLOR_PALETTES } from "./templates";

export const QUICK_START_DESIGN_SETS: QuickStartDesignSet[] = [
  {
    id: "emergency-speed-orange",
    name: "Acil Çağrı & Hızlı Müdahale (Oto / Çilingir / Tesisat)",
    sector: "Acil Hizmet & Yol Yardım",
    tagline: "Ultra Hızlı Arama & Konum Gönderme Odaklı",
    badge: "⚡ En Çok Satan",
    description: "Saniyelerin önemli olduğu acil sektörler için optimize edilmiş, dikkat çekici turuncu aksanlar, tek tıkla arama ve acil WhatsApp konum butonu.",
    icon: "Truck",
    previewGradient: "from-amber-600 via-orange-600 to-amber-700",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans (Dinamik & Yüksek Kontrast)",
    borderRadius: "rounded-xl",
    spacingDensity: "compact",
    siteType: "single-page",
    palette: COLOR_PALETTES[2], // Canlı Turuncu & Oto (Orange/Amber)
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "7/24 Hemen Ara",
      showWhatsappButton: true,
      whatsappButtonText: "Konum Gönder",
      showQuoteButton: false,
      quoteButtonText: "Teklif Al"
    },
    heroPreset: {
      badge: "🚨 7/24 En Yakın Ekip 15 Dakikada Yanınızda",
      ctaPrimaryText: "Hemen Ara & Çekici Çağır",
      ctaSecondaryText: "WhatsApp Konum Gönder"
    },
    recommendedSections: [
      { id: "services", name: "Hizmetlerimiz", enabled: true, order: 1 },
      { id: "about", name: "Hakkımızda", enabled: true, order: 2 },
      { id: "pricing", name: "Fiyat & Tarifeler", enabled: true, order: 3 },
      { id: "faqs", name: "Sıkça Sorulan Sorular", enabled: true, order: 4 },
      { id: "testimonials", name: "Müşteri Yorumları", enabled: true, order: 5 },
      { id: "contact", name: "İletişim & Konum", enabled: true, order: 6 }
    ]
  },
  {
    id: "corporate-prestige-navy",
    name: "Kurumsal Güven & B2B Danışmanlık",
    sector: "Kurumsal & Danışmanlık",
    tagline: "Otoriter, Ağırbaşlı & Güven Veren Lacivert Mimari",
    badge: "🏛️ Kurumsal Lider",
    description: "Mali müşavirler, hukuk büroları, lojistik ve B2B şirketler için tasarlanmış; çok sayfalı kurumsal sayfa hiyerarşisi ve teklif alma formu.",
    icon: "Briefcase",
    previewGradient: "from-blue-900 via-indigo-950 to-slate-900",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans & Inter (Kurumsal Prestij)",
    borderRadius: "rounded-lg",
    spacingDensity: "balanced",
    siteType: "multi-page",
    palette: COLOR_PALETTES[0], // Kurumsal Lacivert
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "Danışmanlık Hattı",
      showWhatsappButton: true,
      whatsappButtonText: "WhatsApp",
      showQuoteButton: true,
      quoteButtonText: "Ücretsiz Teklif Al"
    },
    heroPreset: {
      badge: "✨ 20+ Yıllık Sektörel Deneyim ve Uzman Kadro",
      ctaPrimaryText: "Kurumsal Teklif Alın",
      ctaSecondaryText: "Hizmetlerimizi İnceleyin"
    },
    recommendedSections: [
      { id: "about", name: "Kurumsal & Tarihçe", enabled: true, order: 1 },
      { id: "services", name: "Faaliyet Alanları", enabled: true, order: 2 },
      { id: "catalog", name: "Çözümlerimiz", enabled: true, order: 3 },
      { id: "testimonials", name: "Referans & Görüşler", enabled: true, order: 4 },
      { id: "pricing", name: "Hizmet Paketleri", enabled: true, order: 5 },
      { id: "blog", name: "Sektörel Makaleler", enabled: true, order: 6 },
      { id: "contact", name: "İletişim Formu", enabled: true, order: 7 }
    ]
  },
  {
    id: "medical-pure-emerald",
    name: "Özel Sağlık, Klinik & Diş Hekimi",
    sector: "Sağlık & Medikal",
    tagline: "Ferah Zümrüt Yeşili & Online Randevu Odaklı",
    badge: "🌿 Sağlık & Klinik",
    description: "Diş poliklinikleri, estetik merkezleri ve uzman hekimler için hasta güvenini ön plana çıkaran hijyenik zümrüt tonları ve randevu yönlendirmesi.",
    icon: "HeartPulse",
    previewGradient: "from-emerald-700 via-teal-800 to-slate-900",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans (Temiz & Güvenilir)",
    borderRadius: "rounded-2xl",
    spacingDensity: "spacious",
    siteType: "multi-page",
    palette: COLOR_PALETTES[1], // Zümrüt Yeşil & Sağlık
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "Randevu Hattı",
      showWhatsappButton: true,
      whatsappButtonText: "WhatsApp Randevu",
      showQuoteButton: false,
      quoteButtonText: "Ön Muayene"
    },
    heroPreset: {
      badge: "🩺 Modern Teknoloji & Alanında Uzman Hekimler",
      ctaPrimaryText: "Hemen Randevu Alın",
      ctaSecondaryText: "Tedavi ve Hizmetlerimiz"
    },
    recommendedSections: [
      { id: "services", name: "Tedaviler & Hizmetler", enabled: true, order: 1 },
      { id: "about", name: "Hekimlerimiz & Klinik", enabled: true, order: 2 },
      { id: "gallery", name: "Klinik & Vaka Galerisi", enabled: true, order: 3 },
      { id: "testimonials", name: "Hasta Deneyimleri", enabled: true, order: 4 },
      { id: "faqs", name: "Sıkça Sorulan Sorular", enabled: true, order: 5 },
      { id: "contact", name: "Konum & Ulaşım", enabled: true, order: 6 }
    ]
  },
  {
    id: "gourmet-warm-crimson",
    name: "Gurme Lezzet, Restoran & Kafe Menüsü",
    sector: "Yeme-İçme & Restoran",
    tagline: "İştah Açıcı Sıcak Tonlar & QR Dijital Menü",
    badge: "🍕 Restoran & Kafe",
    description: "Restoranlar, kafeler ve fırınlar için fotoğraf galerisi, ürün/yemek menüsü fiyatları ve WhatsApp masa rezervasyonu içeren sıcak tasarım.",
    icon: "Utensils",
    previewGradient: "from-red-600 via-rose-700 to-amber-900",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans (Sıcak & Samimi)",
    borderRadius: "rounded-2xl",
    spacingDensity: "balanced",
    siteType: "single-page",
    palette: COLOR_PALETTES[5], // Ateş Kırmızısı
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "Masa Rezervasyonu",
      showWhatsappButton: true,
      whatsappButtonText: "Paket Sipariş",
      showQuoteButton: false,
      quoteButtonText: "Menüyü İncele"
    },
    heroPreset: {
      badge: "🔥 Odun Ateşinde Eşsiz Gurme Lezzetler",
      ctaPrimaryText: "Menüyü & Fiyatları İncele",
      ctaSecondaryText: "WhatsApp Masa Ayırt"
    },
    recommendedSections: [
      { id: "catalog", name: "Menü & Fiyatlarımız", enabled: true, order: 1 },
      { id: "about", name: "Hikayemiz & Mutfağımız", enabled: true, order: 2 },
      { id: "gallery", name: "Lezzet Fotoğrafları", enabled: true, order: 3 },
      { id: "testimonials", name: "Misafir Yorumları", enabled: true, order: 4 },
      { id: "contact", name: "Adres & Çalışma Saatleri", enabled: true, order: 5 }
    ]
  },
  {
    id: "architecture-dark-minimal",
    name: "Modern Mimarlık, İnşaat & Gayrimenkul",
    sector: "Mimarlık & Gayrimenkul",
    tagline: "Minimalist Antrasit, Bento Grid & Proje Portfolyosu",
    badge: "📐 Mimari & Proje",
    description: "Mimarlık ofisleri, inşaat şirketleri ve emlak danışmanları için keskin tipografi, geniş görseller ve tamamlanan projeler vitrini.",
    icon: "Building",
    previewGradient: "from-slate-800 via-slate-900 to-slate-950",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans (Minimalist & Çağdaş)",
    borderRadius: "rounded-md",
    spacingDensity: "spacious",
    siteType: "multi-page",
    palette: COLOR_PALETTES[7], // Koyu Antrasit & Mimari
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "Proje Ofisi",
      showWhatsappButton: true,
      whatsappButtonText: "WhatsApp Bilgi",
      showQuoteButton: true,
      quoteButtonText: "Keşif & Teklif"
    },
    heroPreset: {
      badge: "🏗️ Yaşam Alanlarına Değer Katan Çağdaş Tasarımlar",
      ctaPrimaryText: "Projelerimizi Keşfedin",
      ctaSecondaryText: "Mimari Danışmanlık Alın"
    },
    recommendedSections: [
      { id: "services", name: "Mimari Hizmetler", enabled: true, order: 1 },
      { id: "catalog", name: "Tamamlanan Projeler", enabled: true, order: 2 },
      { id: "about", name: "Hakkımızda & Ekibimiz", enabled: true, order: 3 },
      { id: "gallery", name: "Proje Görselleri", enabled: true, order: 4 },
      { id: "testimonials", name: "Müşteri Deneyimleri", enabled: true, order: 5 },
      { id: "contact", name: "İletişim & Ofis Lokasyonu", enabled: true, order: 6 }
    ]
  },
  {
    id: "luxury-gold-vip",
    name: "VIP Lüks Hizmet, Butik & Güzellik",
    sector: "Lüks Hizmet & VIP",
    tagline: "Zarif Altın Vurgular, Yumuşak Hatlar & Estetik",
    badge: "👑 Lüks & VIP",
    description: "Güzellik salonları, kuaförler, VIP transfer ve lüks butik markalar için altın sarısı ve lacivertin asil uyumuyla yüksek segment algı.",
    icon: "Crown",
    previewGradient: "from-amber-700 via-amber-800 to-indigo-950",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans (Zarif & Premium)",
    borderRadius: "rounded-2xl",
    spacingDensity: "spacious",
    siteType: "single-page",
    palette: COLOR_PALETTES[6], // Lüks Altın & VIP
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "VIP Rezervasyon",
      showWhatsappButton: true,
      whatsappButtonText: "WhatsApp İletişim",
      showQuoteButton: false,
      quoteButtonText: "Randevu Al"
    },
    heroPreset: {
      badge: "⭐ Size Özel Ayrıcalıklı ve Kusursuz Deneyim",
      ctaPrimaryText: "Hizmetleri ve Fiyatları Gör",
      ctaSecondaryText: "VIP Randevu Oluştur"
    },
    recommendedSections: [
      { id: "services", name: "VIP Hizmetler & Bakım", enabled: true, order: 1 },
      { id: "pricing", name: "Fiyat Tarifesi", enabled: true, order: 2 },
      { id: "gallery", name: "Öncesi & Sonrası Galerisi", enabled: true, order: 3 },
      { id: "about", name: "Uzmanlarımız Hakkında", enabled: true, order: 4 },
      { id: "testimonials", name: "Değerli Yorumlar", enabled: true, order: 5 },
      { id: "contact", name: "VIP Salon İletişim", enabled: true, order: 6 }
    ]
  },
  {
    id: "tech-cyan-modern",
    name: "Yazılım, Bilişim & Modern Teknoloji",
    sector: "Teknoloji & SaaS",
    tagline: "Okyanus Turkuazı, Canlı İstatistikler & Modern UI",
    badge: "💻 Teknoloji & Bilişim",
    description: "Yazılım ajansları, bilişim firmaları ve SaaS ürünleri için yüksek teknoloji hissi veren turkuaz tonlar ve özellik tabloları.",
    icon: "Cpu",
    previewGradient: "from-cyan-700 via-teal-900 to-slate-900",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans (Modern & Siber)",
    borderRadius: "rounded-xl",
    spacingDensity: "compact",
    siteType: "single-page",
    palette: COLOR_PALETTES[4], // Okyanus Turkuaz
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "Bize Ulaşın",
      showWhatsappButton: true,
      whatsappButtonText: "Canlı Destek",
      showQuoteButton: true,
      quoteButtonText: "Demo Talebi"
    },
    heroPreset: {
      badge: "🚀 İşinizi Dijital Dünyada Geleceğe Taşıyın",
      ctaPrimaryText: "Ücretsiz Demo İsteyin",
      ctaSecondaryText: "Çözümlerimizi İnceleyin"
    },
    recommendedSections: [
      { id: "services", name: "Yazılım & Çözümler", enabled: true, order: 1 },
      { id: "catalog", name: "Ürünler & Modüller", enabled: true, order: 2 },
      { id: "about", name: "Teknoloji Vizyonumuz", enabled: true, order: 3 },
      { id: "pricing", name: "Lisans & Fiyatlandırma", enabled: true, order: 4 },
      { id: "faqs", name: "Teknik Sorular", enabled: true, order: 5 },
      { id: "contact", name: "Projenizi Başlatın", enabled: true, order: 6 }
    ]
  },
  {
    id: "legal-prestige-purple",
    name: "Hukuk Bürosu & Arabuluculuk",
    sector: "Hukuk & Avukatlık",
    tagline: "Ağırbaşlı Mor & Keskin Hukuki Otorite",
    badge: "⚖️ Hukuk & Avukat",
    description: "Avukatlar ve hukuk ortaklıkları için güvenilirlik, gizlilik ilkeleri ve uzmanlık alanlarını öne çıkaran asil mor ve antrasit kombinasyonu.",
    icon: "Scale",
    previewGradient: "from-purple-900 via-indigo-950 to-slate-950",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontName: "Plus Jakarta Sans (Ciddi & Prestijli)",
    borderRadius: "rounded-lg",
    spacingDensity: "balanced",
    siteType: "multi-page",
    palette: COLOR_PALETTES[3], // Prestij Mor & Hukuk
    headerStyle: {
      showPhoneButton: true,
      phoneButtonText: "Danışma Hattı",
      showWhatsappButton: true,
      whatsappButtonText: "Hukuki Destek",
      showQuoteButton: true,
      quoteButtonText: "Görüşme Talep Et"
    },
    heroPreset: {
      badge: "⚖️ Haklarınızı Güvence Altına Alan Hukuki Çözümler",
      ctaPrimaryText: "Hukuki Danışmanlık Alın",
      ctaSecondaryText: "Çalışma Alanlarımız"
    },
    recommendedSections: [
      { id: "services", name: "Uzmanlık Alanları", enabled: true, order: 1 },
      { id: "about", name: "Avukatlarımız & Büro", enabled: true, order: 2 },
      { id: "faqs", name: "Hukuki Süreçler & SSS", enabled: true, order: 3 },
      { id: "blog", name: "Hukuki Makaleler & Emsal Kararlar", enabled: true, order: 4 },
      { id: "testimonials", name: "Müvekkil Görüşleri", enabled: true, order: 5 },
      { id: "contact", name: "Randevu & İletişim", enabled: true, order: 6 }
    ]
  }
];
