/**
 * JetKur Canonical Section Registry - Definitions Catalog
 *
 * ARCHITECTURAL PRINCIPLE:
 * This registry holds all platform-supported website section definitions.
 * It strictly excludes styling, CSS classes, HTML markup, and customer-owned data.
 */

import { SectionDefinition } from "./types";

export const CANONICAL_SECTION_DEFINITIONS: readonly SectionDefinition[] = [
  // 1. HEADER (Structural)
  {
    id: "header",
    label: "Üst Başlık & Navigasyon",
    description: "Marka kimliği, logo, sayfa menüsü, telefon ve WhatsApp eylem butonlarını barındıran sabit üst alan.",
    category: "STRUCTURAL",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "standard",
    allowedVariants: ["standard", "centered", "split-action", "minimal-sticky"],
    variants: [
      { id: "standard", label: "Standart Kurumsal", description: "Solda logo, sağda menü ve hızlı arama butonu", isDefault: true },
      { id: "centered", label: "Ortalı Logo", description: "Merkezde logo, iki tarafa dağıtılmış menü bağlantıları" },
      { id: "split-action", label: "Ayrık Eylem", description: "Geniş menü ve vurgulu teklif/acil çağrı butonu" },
      { id: "minimal-sticky", label: "Minimal Yapışkan", description: "Sayfa kaydırıldığında incelen zarif navigasyon çubuğu" },
    ],
    capabilities: {
      canDisable: false,
      canReorder: false,
      fixedPosition: 0,
      isStructural: true,
      maxInstances: 1,
      supportsCustomTitle: false,
    },
    contentRequirements: [
      {
        targetDomain: "BusinessProfile",
        path: "identity.companyName",
        label: "İşletme Adı",
        description: "Navigasyon çubuğunda logo yoksa metin olarak gösterilir",
        severity: "required",
      },
      {
        targetDomain: "BusinessProfile",
        path: "contact.phone",
        label: "İletişim Telefonu",
        description: "Hemen Ara butonu için hedef telefon numarası",
        severity: "recommended",
      },
    ],
    supportedSettings: [
      { key: "sticky", label: "Sabit Üst Menü", type: "boolean", defaultValue: true },
      { key: "showPhoneButton", label: "Telefon Butonunu Göster", type: "boolean", defaultValue: true },
      { key: "showWhatsAppButton", label: "WhatsApp Butonunu Göster", type: "boolean", defaultValue: true },
      { key: "showCtaButton", label: "Teklif/Eylem Butonunu Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["nav", "navigation", "topbar"],
  },

  // 2. HERO SLIDER / BANNER
  {
    id: "hero",
    label: "Karşılama & Hero Bölümü",
    description: "Ana sayfanın en üstünde ziyaretçiyi karşılayan, temel değer önerisini ve acil eylem çağrılarını ileten ana vitrin.",
    category: "HERO",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "urgent-callout",
    allowedVariants: ["urgent-callout", "split-content-image", "centered-prestige", "image-background", "minimal-lead"],
    variants: [
      { id: "urgent-callout", label: "Acil Çağrı & Hızlı Müdahale", description: "Büyük dikkat çekici başlık, hızlı arama ve WhatsApp acil konum butonları", isDefault: true },
      { id: "split-content-image", label: "Ayrık İçerik & Görsel", description: "Sol tarafta kurumsal metin ve CTA, sağda yüksek kaliteli vitrin görseli" },
      { id: "centered-prestige", label: "Ortalı Prestij", description: "Merkezi tipografi, ağırbaşlı kurumsal slogan ve şık danışmanlık butonu" },
      { id: "image-background", label: "Arka Plan Görselli", description: "Geniş arka plan görseli üzerinde kontrastlı metin ve şeffaf katman" },
      { id: "minimal-lead", label: "Minimal Lider", description: "Sade, temiz ve doğrudan sonuca odaklanan ferah karşılama" },
    ],
    capabilities: {
      canDisable: false,
      canReorder: false,
      fixedPosition: 1,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "hero.title",
        label: "Hero Başlığı",
        description: "Ziyaretçiyi karşılayan ana manşet metni",
        severity: "required",
      },
      {
        targetDomain: "SiteContent",
        path: "hero.ctaPrimaryText",
        label: "Birincil CTA Metni",
        description: "Ana eylem çağrısı düğmesinin metni",
        severity: "required",
      },
      {
        targetDomain: "SiteContent",
        path: "hero.subtitle",
        label: "Hero Alt Başlığı",
        description: "Manşeti destekleyen açıklama cümlesi",
        severity: "recommended",
      },
      {
        targetDomain: "SiteContent",
        path: "hero.bgImageUrl",
        label: "Arka Plan Görseli",
        description: "Karşılama alanında kullanılacak yüksek çözünürlüklü görsel",
        severity: "recommended",
      },
    ],
    supportedSettings: [
      { key: "layoutMode", label: "Yerleşim Modu", type: "select", defaultValue: "split", options: [{ value: "split", label: "Ayrık" }, { value: "stacked", label: "Üst Üste" }] },
      { key: "showSecondaryCta", label: "İkincil Buton", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["hero-slider", "banner", "intro", "karsilama"],
  },

  // 3. SERVICES
  {
    id: "services",
    label: "Hizmetlerimiz",
    description: "İşletmenin sunduğu profesyonel faaliyetlerin, uzmanlıkların ve servislerin kartlar veya liste halinde sunumu.",
    category: "CONTENT",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "grid-4",
    allowedVariants: ["grid-4", "cards-3", "cards", "list", "compact"],
    variants: [
      { id: "grid-4", label: "4 Kolonlu Izgara", description: "Hizmetleri 4 sütunlu modern kartlar halinde dizer", isDefault: true },
      { id: "cards-3", label: "3 Kolonlu Büyük Kartlar", description: "Daha detaylı açıklamalar ve ikonlar için 3 sütunlu yerleşim" },
      { id: "cards", label: "Dinamik Kartlar", description: "Hizmet sayısına göre otomatik dengelenen kart ızgarası" },
      { id: "list", label: "Ayrıntılı Liste", description: "Her hizmeti yatay satır ve detaylı madde imleriyle gösterir" },
      { id: "compact", label: "Kompakt Rozetler", description: "Geniş hizmet yelpazesini az yer kaplayan rozetlerle özetler" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "BusinessProfile",
        path: "services",
        label: "Hizmet Listesi",
        description: "En az bir aktif hizmet tanımlanmış olmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "columns", label: "Sütun Sayısı", type: "number", defaultValue: 3 },
      { key: "layoutMode", label: "Görünüm Modu", type: "select", defaultValue: "grid", options: [{ value: "grid", label: "Izgara" }, { value: "carousel", label: "Kaydırıcı" }] },
    ],
    legacyAliases: ["hizmetler", "hizmetlerimiz", "servisler"],
  },

  // 4. ABOUT
  {
    id: "about",
    label: "Kurumsal & Hakkımızda",
    description: "İşletmenin kuruluşu, deneyimi, vizyonu ve kurumsal güven unsurlarını anlatan tanıtım bölümü.",
    category: "CONTENT",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "side-by-side",
    allowedVariants: ["side-by-side", "story-timeline", "minimal-stats", "cards-narrative"],
    variants: [
      { id: "side-by-side", label: "Yan Yana Hikaye & Görsel", description: "Sol tarafta şirket hikayesi, sağda fotoğraf ve deneyim rozeti", isDefault: true },
      { id: "story-timeline", label: "Tarihsel Zaman Çizelgesi", description: "Kuruluştan bugüne kilometre taşlarını kronolojik sunar" },
      { id: "minimal-stats", label: "İstatistik Odaklı", description: "Büyük sayılar, deneyim yılı ve tamamlanan proje istatistikleri" },
      { id: "cards-narrative", label: "Kartlı Kurumsal Anlatım", description: "Vizyon, misyon ve değerleri ayrı kutularda gruplar" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "about.contentHtml",
        label: "Hakkımızda Metni",
        description: "İşletmeyi tanıtan kurumsal açıklama metni",
        severity: "required",
      },
      {
        targetDomain: "SiteContent",
        path: "about.title",
        label: "Hakkımızda Başlığı",
        description: "Kurumsal bölümün ana başlığı",
        severity: "recommended",
      },
    ],
    supportedSettings: [
      { key: "showStats", label: "Deneyim İstatistiklerini Göster", type: "boolean", defaultValue: true },
      { key: "showBadge", label: "Rozet Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["hakkimizda", "kurumsal", "biz-kimiz"],
  },

  // 5. WHY US
  {
    id: "whyUs",
    label: "Neden Biz? (Avantajlar)",
    description: "Müşterinin neden bu işletmeyi tercih etmesi gerektiğini vurgulayan temel avantajlar ve güven unsurları.",
    category: "TRUST",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "cards-3",
    allowedVariants: ["cards-3", "icon-grid", "checklist", "metrics-badges"],
    variants: [
      { id: "cards-3", label: "3 Kolonlu Avantaj Kartları", description: "İkonlu ve açıklamalı 3 sütunlu avantaj kutuları", isDefault: true },
      { id: "icon-grid", label: "İkon Izgarası", description: "Kompakt simgeler ve hızlı okunan güçlü yönler" },
      { id: "checklist", label: "Onay Listesi", description: "Güven damgaları ve maddeli kalite taahhütleri" },
      { id: "metrics-badges", label: "Ölçüm & Başarı Rozetleri", description: "Memnuniyet oranları ve sertifika vurguları" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "whyUs.items",
        label: "Avantaj Maddeleri",
        description: "En az 2 adet neden biz kartı bulunmalıdır",
        severity: "required",
        minCount: 2,
      },
    ],
    supportedSettings: [
      { key: "columns", label: "Sütun Sayısı", type: "number", defaultValue: 3 },
    ],
    legacyAliases: ["features", "neden-biz", "avantajlar", "nedenbiz"],
  },

  // 6. GALLERY
  {
    id: "gallery",
    label: "Fotoğraf & Proje Galerisi",
    description: "Tamamlanan işlerin, atölyenin, referans projelerin veya mağazanın fotoğraf vitrini.",
    category: "MEDIA",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "grid-lightbox",
    allowedVariants: ["grid-lightbox", "masonry", "carousel", "mosaic"],
    variants: [
      { id: "grid-lightbox", label: "Büyütülebilir Izgara", description: "Tıklandığında tam ekran açılan düzenli fotoğraf kareleri", isDefault: true },
      { id: "masonry", label: "Duvar Örgüsü (Masonry)", description: "Farklı boyuttaki görselleri estetik şekilde kenetleyen dinamik akış" },
      { id: "carousel", label: "Yatay Kaydırıcı", description: "Sağa sola kaydırılabilen yer tasarruflu fotoğraf şeridi" },
      { id: "mosaic", label: "Mozaik Kolaj", description: "Bir ana büyük görsel etrafında dizilen tamamlayıcı kareler" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "gallery",
        label: "Galeri Fotoğrafları",
        description: "En az 1 adet fotoğraf yüklenmiş olmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "enableLightbox", label: "Fotoğraf Büyütme (Lightbox)", type: "boolean", defaultValue: true },
      { key: "columns", label: "Sütun Sayısı", type: "number", defaultValue: 3 },
    ],
    legacyAliases: ["galeri", "photos", "vitrin", "projeler"],
  },

  // 7. TESTIMONIALS
  {
    id: "testimonials",
    label: "Müşteri Yorumları & Puanlar",
    description: "Gerçek müşteri değerlendirmeleri, Google inceleme alıntıları ve yıldız puanları.",
    category: "TRUST",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "cards-grid",
    allowedVariants: ["cards-grid", "quotes-minimal", "carousel", "badge-rating"],
    variants: [
      { id: "cards-grid", label: "Kart Izgarası", description: "Yıldız puanı, müşteri adı ve yorum metnini içeren kartlar", isDefault: true },
      { id: "quotes-minimal", label: "Minimal Alıntılar", description: "Ağırbaşlı tırnak işareti stili ve sade müşteri referansları" },
      { id: "carousel", label: "Yorum Kaydırıcı", description: "Tek tek veya ikişerli kayan dinamik referans akışı" },
      { id: "badge-rating", label: "Puan Rozetli Vitrin", description: "Üstte ortalama Google puanı, altta seçme yorumlar" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "testimonials",
        label: "Müşteri Yorumları",
        description: "En az 1 adet müşteri yorumu bulunmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "showRatingStats", label: "Ortalama Puan Rozetini Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["reviews", "yorumlar", "musteri-yorumlari", "referanslar"],
  },

  // 8. FAQS
  {
    id: "faqs",
    label: "Sıkça Sorulan Sorular (SSS)",
    description: "Müşterilerin aklına takılan soruları yanıtlayan, SEO ve arama motoru Schema'sını besleyen akordiyon bölümü.",
    category: "TRUST",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "accordion",
    allowedVariants: ["accordion", "two-column", "separated-cards", "minimal-clean"],
    variants: [
      { id: "accordion", label: "Açılır Kapanır Akordiyon", description: "Tıklandığında yumuşak geçişle açılan yer tasarruflu liste", isDefault: true },
      { id: "two-column", label: "İki Kolonlu Akordiyon", description: "Geniş ekranlarda iki sütuna ayrılan dengeli soru listesi" },
      { id: "separated-cards", label: "Ayrık Soru Kartları", description: "Her soruyu bağımsız çerçeveli kart olarak sunar" },
      { id: "minimal-clean", label: "Sade Çizgili", description: "Minimalist alt çizgili sorular ve net cevaplar" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "faqs",
        label: "Soru & Cevaplar",
        description: "En az 1 adet soru ve cevap tanımlanmış olmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "accordionStyle", label: "Akordiyon Stili", type: "select", defaultValue: "bordered", options: [{ value: "bordered", label: "Kenarlıklı" }, { value: "modern", label: "Modern" }, { value: "minimal", label: "Minimal" }] },
    ],
    legacyAliases: ["faq", "sss", "sikca-sorulan-sorular"],
  },

  // 9. CONTACT
  {
    id: "contact",
    label: "İletişim & Teklif Formu",
    description: "Müşterinin doğrudan işletmeye ulaşmasını sağlayan form, telefon, WhatsApp, adres ve harita bölümü.",
    category: "CONVERSION",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "split-map-form",
    allowedVariants: ["split-map-form", "emergency-contact-strip", "formal-consultation-form", "compact-direct"],
    variants: [
      { id: "split-map-form", label: "Ayrık Harita & Form", description: "Bir tarafta canlı harita ve adres, diğer tarafta mesaj/teklif formu", isDefault: true },
      { id: "emergency-contact-strip", label: "Acil Çağrı Şeridi", description: "Büyük tek tıkla arama butonları ve anlık WhatsApp konum bildirimi" },
      { id: "formal-consultation-form", label: "Resmi Danışmanlık Formu", description: "Detaylı konu ve ön bilgi alanları içeren profesyonel form" },
      { id: "compact-direct", label: "Kompakt Doğrudan İletişim", description: "Telefon, e-posta ve açık adres bilgilerini net kartlarla sunar" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "BusinessProfile",
        path: "contact.phone",
        label: "İletişim Telefonu",
        description: "Telefon veya e-posta zorunludur",
        severity: "required",
      },
      {
        targetDomain: "BusinessProfile",
        path: "location.address",
        label: "Açık Adres",
        description: "Fiziksel konum ve harita gösterimi için gereklidir",
        severity: "recommended",
      },
    ],
    supportedSettings: [
      { key: "showMap", label: "Google Haritayı Göster", type: "boolean", defaultValue: true },
      { key: "showForm", label: "İletişim Formunu Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["iletisim", "map", "contact-form", "harita"],
  },

  // 10. PRODUCTS / CATALOG
  {
    id: "products",
    label: "Ürün & Fiyat Kataloğu",
    description: "İşletmenin fiziksel ürünlerini veya paket servislerini fiyat ve görsellerle sergileyen katalog.",
    category: "COMMERCE",
    status: "ACTIVE",
    defaultEnabled: false,
    defaultVariant: "grid",
    allowedVariants: ["grid", "cards", "price-list", "compact-catalog"],
    variants: [
      { id: "grid", label: "Ürün Izgarası", description: "Fotoğraf, fiyat ve hızlı sipariş/bilgi butonu içeren 3-4 sütunlu ızgara", isDefault: true },
      { id: "cards", label: "Büyük Ürün Kartları", description: "Teknik özellikler ve detaylı açıklamalar içeren geniş kartlar" },
      { id: "price-list", label: "Fiyat Listesi", description: "Restoran menüsü veya parça listesi tarzında sade satırlar" },
      { id: "compact-catalog", label: "Kompakt Katalog", description: "Küçük resimli, hızlı taranabilir kompakt vitrin" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "catalogProducts",
        label: "Katalog Ürünleri",
        description: "En az 1 adet ürün eklenmiş olmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "columns", label: "Sütun Sayısı", type: "number", defaultValue: 3 },
      { key: "showPrices", label: "Fiyatları Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["catalog", "urunler", "katalog", "products-catalog"],
  },

  // 11. PRICING
  {
    id: "pricing",
    label: "Fiyat Paketleri & Tarifeler",
    description: "Şeffaf fiyatlandırma paketleri, hizmet kapsamları ve karşılaştırma tabloları.",
    category: "COMMERCE",
    status: "ACTIVE",
    defaultEnabled: false,
    defaultVariant: "cards-3",
    allowedVariants: ["cards-3", "comparison-table", "simple-list", "feature-matrix"],
    variants: [
      { id: "cards-3", label: "3'lü Paket Kartları", description: "Popüler paket vurgusu ve madde imli özellik listesi", isDefault: true },
      { id: "comparison-table", label: "Karşılaştırma Tablosu", description: "Paket özelliklerini yan yana tik işaretleriyle kıyaslar" },
      { id: "simple-list", label: "Sade Tarife Listesi", description: "Tek seferlik hizmet bedelleri için minimalist liste" },
      { id: "feature-matrix", label: "Geniş Özellik Matrisi", description: "Kurumsal B2B teklifleri için kapsamlı özellik matrisi" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "pricingPlans",
        label: "Fiyat Paketleri",
        description: "En az 1 adet fiyat paketi tanımlanmış olmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "columns", label: "Sütun Sayısı", type: "number", defaultValue: 3 },
      { key: "highlightPopular", label: "Popüler Paketi Vurgula", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["fiyatlar", "tarifeler", "plans", "paketler"],
  },

  // 12. BLOG
  {
    id: "blog",
    label: "Blog & Rehber Makaleler",
    description: "Sektörel bilgi paylaşımı, SEO organik trafik makaleleri ve işletme duyuruları.",
    category: "CONTENT",
    status: "ACTIVE",
    defaultEnabled: false,
    defaultVariant: "cards-grid",
    allowedVariants: ["cards-grid", "magazine-list", "featured-hero", "compact-feed"],
    variants: [
      { id: "cards-grid", label: "Makale Kartları Izgarası", description: "Kapak görseli, okuma süresi, özet ve yazar bilgisi", isDefault: true },
      { id: "magazine-list", label: "Dergi Stili Liste", description: "Yatay geniş satırlar ve zengin tipografi" },
      { id: "featured-hero", label: "Öne Çıkan Başyazı", description: "En son veya en önemli yazıyı büyük vitrinde sunar" },
      { id: "compact-feed", label: "Kompakt Akış", description: "Tarih ve başlıklardan oluşan az yer kaplayan akış" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "blogPosts",
        label: "Blog Yazıları",
        description: "En az 1 adet yayınlanmış makale bulunmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "columns", label: "Sütun Sayısı", type: "number", defaultValue: 3 },
      { key: "showDate", label: "Yayın Tarihini Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["makaleler", "haberler", "rehber", "news", "yazilar"],
  },

  // 13. NEWSLETTER
  {
    id: "newsletter",
    label: "E-Bülten Aboneliği",
    description: "Müşterilerden kampanya ve duyurular için e-posta toplayan bülten abonelik kutusu.",
    category: "CONVERSION",
    status: "ACTIVE",
    defaultEnabled: false,
    defaultVariant: "inline-banner",
    allowedVariants: ["inline-banner", "card-center", "minimal-bar", "split-action"],
    variants: [
      { id: "inline-banner", label: "Satır İçi Şerit", description: "Geniş koyu bant üzerinde başlık, açıklama ve e-posta formu", isDefault: true },
      { id: "card-center", label: "Ortalı Kart", description: "Sayfa ortasında bağımsız bir kampanya davet kartı" },
      { id: "minimal-bar", label: "Minimalist Çubuk", description: "Sadece tek satırlık e-posta girişi ve abone ol butonu" },
      { id: "split-action", label: "İki Bölmeli Aksiyon", description: "Sol tarafta indirim/kampanya vaadi, sağda giriş alanı" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "BusinessProfile",
        path: "identity.companyName",
        label: "İşletme Kimliği",
        description: "Bülten metninde işletme adı referansı için kullanılır",
        severity: "recommended",
      },
    ],
    supportedSettings: [
      { key: "showDisclaimer", label: "KVKK Onay Metnini Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["ebulten", "bulten", "subscribe"],
  },

  // 14. SOCIAL FEED
  {
    id: "socialFeed",
    label: "Sosyal Medya Akışı (Instagram & X)",
    description: "İşletmenin sosyal medya hesaplarındaki son gönderileri ve güncel paylaşımlarını canlı aktaran akış.",
    category: "MEDIA",
    status: "ACTIVE",
    defaultEnabled: false,
    defaultVariant: "instagram-grid",
    allowedVariants: ["instagram-grid", "cards-slider", "masonry-feed", "curated-tiles"],
    variants: [
      { id: "instagram-grid", label: "Instagram Izgarası", description: "Kare fotoğraflar, beğeni sayıları ve profil linki", isDefault: true },
      { id: "cards-slider", label: "Gönderi Kaydırıcı", description: "Sosyal medya gönderilerini yatay şeritte kaydırır" },
      { id: "masonry-feed", label: "Dinamik Akış Duvarı", description: "Instagram ve X paylaşımlarını birleştiren mozaik" },
      { id: "curated-tiles", label: "Seçme Gönderi Karoları", description: "Öne çıkarılmış müşteri etkileşimleri" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 1,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "BusinessProfile",
        path: "social",
        label: "Sosyal Medya Bağlantıları",
        description: "En az bir aktif sosyal medya hesabı tanımlanmalıdır",
        severity: "required",
        minCount: 1,
      },
    ],
    supportedSettings: [
      { key: "columns", label: "Sütun Sayısı", type: "number", defaultValue: 4 },
      { key: "showFollowButton", label: "Takip Et Butonunu Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["instagram", "social", "sosyal-medya", "sosyal-akis"],
  },

  // 15. FOOTER (Structural)
  {
    id: "footer",
    label: "Alt Bilgi & Yasal Alan (Footer)",
    description: "Sayfanın en altındaki çalışma saatleri, hızlı linkler, telif hakkı ve yasal uyarıları içeren alan.",
    category: "STRUCTURAL",
    status: "ACTIVE",
    defaultEnabled: true,
    defaultVariant: "multi-column",
    allowedVariants: ["multi-column", "simple-centered", "corporate-detailed", "minimal-legal"],
    variants: [
      { id: "multi-column", label: "Çok Kolonlu Kapsamlı", description: "Hakkımızda, hızlı menü, çalışma saatleri ve iletişim sütunları", isDefault: true },
      { id: "simple-centered", label: "Sade Ortalı", description: "Küçük siteler için ortalanmış logo, sosyal ikonlar ve telif hakkı" },
      { id: "corporate-detailed", label: "Kurumsal & Yasal Detaylı", description: "Mersis no, vergi dairesi ve yasal bildirimleri içeren geniş alt alan" },
      { id: "minimal-legal", label: "Minimalist Yasal Çizgi", description: "Yalnızca telif hakkı ve temel gizlilik bağlantıları" },
    ],
    capabilities: {
      canDisable: false,
      canReorder: false,
      fixedPosition: 999,
      isStructural: true,
      maxInstances: 1,
      supportsCustomTitle: false,
    },
    contentRequirements: [
      {
        targetDomain: "BusinessProfile",
        path: "identity.companyName",
        label: "Şirket Adı",
        description: "Telif hakkı satırında görüntülenir",
        severity: "required",
      },
      {
        targetDomain: "BusinessProfile",
        path: "contact.phone",
        label: "İletişim Telefonu",
        description: "Footer iletişim bloğunda görüntülenir",
        severity: "recommended",
      },
    ],
    supportedSettings: [
      { key: "showWorkingHours", label: "Çalışma Saatlerini Göster", type: "boolean", defaultValue: true },
      { key: "showSocialIcons", label: "Sosyal Medya İkonlarını Göster", type: "boolean", defaultValue: true },
      { key: "showQuickLinks", label: "Hızlı Linkleri Göster", type: "boolean", defaultValue: true },
      { key: "showCopyright", label: "Telif Hakkı Satırını Göster", type: "boolean", defaultValue: true },
    ],
    legacyAliases: ["alt-bilgi", "site-footer"],
  },

  // 16. CUSTOM HTML (Experimental)
  {
    id: "customHtml",
    label: "Özel HTML / Kod Alanı",
    description: "Harici widget'lar, e-ticaret düğmeleri veya özel tasarım blokları için güvenli iframe/HTML bloğu.",
    category: "CONTENT",
    status: "EXPERIMENTAL",
    defaultEnabled: false,
    defaultVariant: "raw-container",
    allowedVariants: ["raw-container", "isolated-card", "full-bleed"],
    variants: [
      { id: "raw-container", label: "Doğrudan Kapsayıcı", description: "Standart sayfa genişliğinde içeriği doğrudan render eder", isDefault: true },
      { id: "isolated-card", label: "Yalıtılmış Kart", description: "Özel kodu gölgeli ve yuvarlatılmış kart içinde izole eder" },
      { id: "full-bleed", label: "Tam Genişlik", description: "Sayfa kenarlarına kadar uzanan tam genişlikli blok" },
    ],
    capabilities: {
      canDisable: true,
      canReorder: true,
      isStructural: false,
      maxInstances: 3,
      supportsCustomTitle: true,
    },
    contentRequirements: [
      {
        targetDomain: "SiteContent",
        path: "customPages",
        label: "HTML İçeriği",
        description: "Gösterilecek HTML veya embed kodu",
        severity: "required",
      },
    ],
    supportedSettings: [
      { key: "fullWidth", label: "Tam Genişlikte Göster", type: "boolean", defaultValue: false },
    ],
    legacyAliases: ["html", "embed", "ozel-kod"],
  },
];

/**
 * Fast lookup map by canonical section ID
 */
export const SECTION_REGISTRY_MAP: ReadonlyMap<string, SectionDefinition> = new Map(
  CANONICAL_SECTION_DEFINITIONS.map((def) => [def.id, def])
);
