import { 
  SiteConfig, 
  ThemeTemplate, 
  FormLead, 
  ProductItem, 
  BlogPostItem, 
  BlogCategory,
  ColorPalette, 
  PricingPlan,
  HeaderNavItem,
  HomepageSectionConfig,
  HeroSlide,
  NewsletterSubscriber,
  GalleryItem,
  CustomFormConfig,
  FormFieldConfig,
  LeadThankYouEmailConfig,
  ScheduledSocialPost,
  SocialSchedulerConfig,
  SocialFeedPost,
  SocialMediaFeedConfig,
  PortalClient,
  ClientAccessPortalConfig,
  ClientOrder,
  ClientDocument
} from "../types";
import { COLOR_PALETTES, TEMPLATES } from "./templates";
import { DEFAULT_LEAD_NOTIFICATIONS_CONFIG } from "../utils/leadScoring";
import { DEFAULT_LEAD_AUTOMATION_CONFIG } from "../utils/leadAutomationEngine";
import { DEFAULT_MARKETING_AUTOMATION_CONFIG } from "../utils/marketingAutomationData";

export const INITIAL_PORTAL_CLIENTS: PortalClient[] = [
  {
    id: "cl-1",
    name: "Murat Demirtaş",
    company: "Demirtaş Lojistik & Filo A.Ş.",
    email: "murat@demirtasfilo.com",
    password: "Demir2026!#",
    phone: "+90 532 444 88 12",
    status: "active",
    createdDate: "2026-08-15",
    lastLogin: "2026-09-04 15:30",
    notes: "Yıllık kurumsal filo yol yardım ve çoklu araç transfer sözleşmesi.",
    orders: [
      {
        id: "ord-101",
        orderNumber: "ORD-2026-8812",
        title: "Şehirlerarası 5 Adet Filo Araç Transferi (Ankara - İstanbul)",
        serviceOrProduct: "Şehirlerarası Çoklu Araç Transferi",
        amount: "18.500 ₺",
        status: "in_transit",
        startDate: "2026-09-03",
        estimatedCompletionDate: "2026-09-06",
        notes: "Kayar kasa tırlarımızla Ankara lojistik merkezinden yükleme tamamlandı. Yol durumu anlık takipte.",
        timeline: [
          { id: "t1", date: "03.09.2026 09:30", title: "Transfer Emri Onaylandı", description: "Sözleşme ve kasko poliçesi hazırlandı.", status: "completed" },
          { id: "t2", date: "04.09.2026 11:00", title: "Araçlar Teslim Alındı & Yüklendi", description: "Ekspertiz fotoğrafları çekildi, sevkiyat başladı.", status: "completed" },
          { id: "t3", date: "05.09.2026 14:00", title: "Sevkiyat Yol Durumu (Bolu Dağı Geçişi)", description: "Transfer planlandığı şekilde sorunsuz devam ediyor.", status: "current" },
          { id: "t4", date: "06.09.2026 16:00", title: "İstanbul Teslimat & Tutanak", description: "Yetkili filo sorumlusuna imza karşılığı teslim edilecek.", status: "upcoming" }
        ]
      },
      {
        id: "ord-102",
        orderNumber: "ORD-2026-8740",
        title: "Acil Ağır Vasıta Kurtarma & Servis Çekimi",
        serviceOrProduct: "Ağır Ticari Kurtarma",
        amount: "4.800 ₺",
        status: "completed",
        startDate: "2026-08-20",
        estimatedCompletionDate: "2026-08-20",
        completedDate: "2026-08-20 17:45",
        notes: "Otobanda arızalanan çekici tır başarıyla anlaşmalı yetkili servise çekildi."
      }
    ],
    documents: [
      {
        id: "doc-1",
        title: "Kurumsal Filo Hizmet Sözleşmesi 2026-2027",
        category: "contract",
        fileType: "pdf",
        fileSize: "2.4 MB",
        uploadDate: "2026-08-15",
        fileUrl: "https://example.com/docs/sozlesme-2026.pdf",
        downloadCount: 3,
        isPublicToClient: true,
        description: "Islak imzalı ve kaşeli kurumsal yıllık yol yardım anlaşması."
      },
      {
        id: "doc-2",
        title: "Kasko & Taşıma Sigortası Poliçesi (Anadolu Sigorta)",
        category: "spec",
        fileType: "pdf",
        fileSize: "1.1 MB",
        uploadDate: "2026-09-03",
        fileUrl: "https://example.com/docs/sigorta-policesi.pdf",
        downloadCount: 1,
        isPublicToClient: true,
        description: "Tüm taşıma sürecini kapsayan 5.000.000 ₺ teminatlı poliçe."
      },
      {
        id: "doc-3",
        title: "Ağustos 2026 E-Arşiv Hizmet Faturası",
        category: "invoice",
        fileType: "pdf",
        fileSize: "380 KB",
        uploadDate: "2026-08-31",
        fileUrl: "https://example.com/docs/fatura-agustos-2026.pdf",
        downloadCount: 5,
        isPublicToClient: true,
        description: "GİB onaylı resmi e-arşiv fatura."
      }
    ]
  },
  {
    id: "cl-2",
    name: "Selin Aksoy",
    company: "Aksoy Mimarlık & Tasarım Ofisi",
    email: "selin@aksoymimarlik.com",
    password: "Aksoy#Portal26",
    phone: "+90 544 321 90 00",
    status: "active",
    createdDate: "2026-08-28",
    lastLogin: "2026-09-05 08:15",
    notes: "Şantiye ekipmanları ve VIP özel araç transfer müşterisi.",
    orders: [
      {
        id: "ord-201",
        orderNumber: "ORD-2026-9044",
        title: "Özel Kapalı Kasa Klasik Araç Transferi",
        serviceOrProduct: "Kapalı Kasa VIP Taşıma",
        amount: "6.500 ₺",
        status: "in_progress",
        startDate: "2026-09-04",
        estimatedCompletionDate: "2026-09-07",
        notes: "Özel örtülü ve sarsıntısız havalı süspansiyonlu kapalı araç hazırlandı.",
        timeline: [
          { id: "t1", date: "04.09.2026 14:00", title: "Rezervasyon Alındı & Rota Belirlendi", description: "Müşteri özel talepleri sisteme işlendi.", status: "completed" },
          { id: "t2", date: "05.09.2026 10:00", title: "Özel Taşıyıcı Tahsisi & Yükleme", description: "Havalı süspansiyonlu kapalı araç atandı.", status: "current" },
          { id: "t3", date: "07.09.2026 11:30", title: "Varış ve Güvenli Teslimat", description: "Ofis yer altı garajına hasarsız teslimat.", status: "upcoming" }
        ]
      }
    ],
    documents: [
      {
        id: "doc-4",
        title: "Özel Taşıma Teslim Tutanağı & Ön Ekspertiz Raporu",
        category: "report",
        fileType: "pdf",
        fileSize: "840 KB",
        uploadDate: "2026-09-04",
        fileUrl: "https://example.com/docs/ekspertiz-raporu.pdf",
        downloadCount: 2,
        isPublicToClient: true,
        description: "Araç kabul tutanağı ve detaylı kondisyon fotoğrafları."
      },
      {
        id: "doc-5",
        title: "Teknik Taşıma Şartnamesi & Güvenlik Protokolü",
        category: "spec",
        fileType: "pdf",
        fileSize: "1.4 MB",
        uploadDate: "2026-08-28",
        fileUrl: "https://example.com/docs/guvenlik-protokolu.pdf",
        downloadCount: 1,
        isPublicToClient: true,
        description: "VIP araçlar için uygulanan sabitleme ve koruma protokolleri."
      }
    ]
  },
  {
    id: "cl-3",
    name: "Emre Koç",
    company: "Bireysel Müşteri",
    email: "emrekoc88@gmail.com",
    password: "MusteriPass99!",
    phone: "+90 555 678 12 34",
    status: "pending",
    createdDate: "2026-09-05",
    notes: "Yeni yol yardım talebi açtı, portal girişi için şifre oluşturuldu.",
    orders: [
      {
        id: "ord-301",
        orderNumber: "ORD-2026-9210",
        title: "Yerinde Akü Takviye & Mobil Ölçüm",
        serviceOrProduct: "Yerinde Akü Takviye",
        amount: "750 ₺",
        status: "pending",
        startDate: "2026-09-05",
        estimatedCompletionDate: "2026-09-05",
        notes: "Müşteri adresinde randevu saati bekleniyor."
      }
    ],
    documents: [
      {
        id: "doc-6",
        title: "Garanti Belgesi & Servis Fişi",
        category: "report",
        fileType: "pdf",
        fileSize: "450 KB",
        uploadDate: "2026-09-05",
        fileUrl: "https://example.com/docs/garanti-servis-fisi.pdf",
        downloadCount: 0,
        isPublicToClient: true,
        description: "2 yıl yerinde garantili akü değişim belgesi."
      }
    ]
  }
];

export const DEFAULT_CLIENT_ACCESS_PORTAL_CONFIG: ClientAccessPortalConfig = {
  enabled: true,
  portalTitle: "Müşteri Erişim Portalı (Client Access Portal)",
  portalWelcomeMessage: "Değerli Müşterimiz, sipariş ve operasyon durumlarınızı canlı takip edebilir, projelerinize ait sözleşme, şartname ve faturaları güvenle görüntüleyebilirsiniz.",
  supportEmail: "destek@yildizotokurtarma.com.tr",
  supportPhone: "+90 850 300 00 00",
  allowClientDownloads: true,
  requirePasswordChangeOnFirstLogin: false,
  clients: INITIAL_PORTAL_CLIENTS
};

export const INITIAL_SCHEDULED_SOCIAL_POSTS: ScheduledSocialPost[] = [
  {
    id: "sp-1",
    title: "Şehir İçi Acil Çekici Kampanyası & Hızlı Müdahale",
    content: "Yolda kalmak artık dert değil! 🚨 Yıldız Oto Kurtarma olarak 15-20 dakikada yanınızdayız. %100 kaskolu Şehir İçi Acil Çekici Paketimizde bu haftaya özel indirimli fiyat avantajı devam ediyor. Hemen inceleyin veya 7/24 çağrı merkezimizi arayın! 🚗💨",
    platforms: ["instagram", "facebook", "twitter"],
    scheduledDate: "2026-09-06",
    scheduledTime: "18:00",
    scheduledTimestamp: 1788706800000,
    status: "queued",
    productId: "p1",
    productTitle: "Şehir İçi Acil Çekici Paketi",
    productSlug: "sehir-ici-acil-cekici-paketi",
    productUrl: "https://yildiz-otokurtarma.hizliweb.me/urun/sehir-ici-acil-cekici-paketi",
    productPrice: "1.250 ₺",
    productImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    callToAction: "Ürünü İncele & Sipariş Ver",
    includeUtmTags: true,
    hashtags: ["#otokurtarma", "#yolyardım", "#çekici", "#araçtaşıma", "#kampanya"],
    createdAt: "2026-09-04T10:30:00Z"
  },
  {
    id: "sp-2",
    title: "Yerinde Akü Takviye & Voltaj Ölçümü Hizmetimiz",
    content: "Aracınız sabah marş basmıyor mu? 🔋 Servise gitmenize gerek yok, uzman ekibimiz son teknoloji akü takviye cihazları ve dijital voltaj ölçerlerle kapınıza kadar geliyor. Hızlı, güvenilir ve uygun fiyatlı çözüm için tıklayın.",
    platforms: ["linkedin", "twitter"],
    scheduledDate: "2026-09-08",
    scheduledTime: "10:30",
    scheduledTimestamp: 1788852600000,
    status: "queued",
    productId: "p2",
    productTitle: "Yerinde Akü Takviye & Voltaj Ölçümü",
    productSlug: "yerinde-aku-takviye-voltaj-olcumu",
    productUrl: "https://yildiz-otokurtarma.hizliweb.me/urun/yerinde-aku-takviye-voltaj-olcumu",
    productPrice: "600 ₺",
    productImage: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    callToAction: "Hemen Çağır & Bilgi Al",
    includeUtmTags: true,
    hashtags: ["#akütakviye", "#yolyardım", "#otobakım", "#hızlıservis"],
    createdAt: "2026-09-04T14:15:00Z"
  },
  {
    id: "sp-3",
    title: "Hafta Sonu Yol Yardım & Kaskolu Taşıma Rehberi",
    content: "Hafta sonu seyahat planı yapan sürücülerimiz için 7/24 teyakkuzdayız. Aracınızın kaskolu transfer güvencesi hakkında detaylı bilgi ve online randevu için web sitemizi ziyaret edin. 🛠️",
    platforms: ["instagram", "facebook", "linkedin"],
    scheduledDate: "2026-09-02",
    scheduledTime: "14:00",
    scheduledTimestamp: 1788349200000,
    status: "published",
    productId: "p1",
    productTitle: "Şehir İçi Acil Çekici Paketi",
    productSlug: "sehir-ici-acil-cekici-paketi",
    productUrl: "https://yildiz-otokurtarma.hizliweb.me/urun/sehir-ici-acil-cekici-paketi",
    productPrice: "1.250 ₺",
    productImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    callToAction: "Hizmeti İncele",
    includeUtmTags: true,
    publishedAt: "2026-09-02 14:00",
    publishedPostUrl: "https://instagram.com",
    hashtags: ["#yolyardim", "#güvenliyolculuk", "#otokurtarma"],
    createdAt: "2026-09-01T09:00:00Z"
  }
];

export const DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG: LeadThankYouEmailConfig = {
  enabled: true,
  requireEmail: true,
  subject: "Talebiniz Alındı! Teşekkür Ederiz - {firma}",
  body: "Sayın {isim},\n\n{firma} olarak web sitemiz üzerinden ilettiğiniz talebinizi ve mesajınızı memnuniyetle aldık.\n\nİlgilendiğiniz '{hizmet}' konusu ile ilgili müşteri temsilcimiz bilgilerinizi incelemekte olup, en kısa süre içerisinde verdiğiniz iletişim bilgilerinden sizinle irtibata geçecektir.\n\nAcil konularda {telefon} numaralı hattımızdan veya web sitemizdeki WhatsApp butonundan bize dilediğiniz zaman ulaşabilirsiniz.\n\nSaygılarımızla,\n{firma} Müşteri Destek Ekibi",
  senderName: "{firma} Müşteri Destek",
  replyToEmail: "destek@yildizotokurtarma.com.tr",
  sendCopyNotification: true,
  includeDetailsSummary: true,
  smtpStatus: "active",
  delayMinutes: 5,
  delayMode: "preset",
  delayRandomWindow: true,
  businessHoursOnly: false,
  businessHoursStart: "09:00",
  businessHoursEnd: "19:00"
};

export const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: "sub-100",
    email: "emre.kocak@gmail.com",
    name: "Emre Koçak",
    subscribedAt: "3 Eylül 2026 11:20",
    status: "active",
    source: "Web İletişim Formu",
    tags: ["Müşteri", "Sıcak Takip", "VIP"],
    lastInteractionAt: "Bugün 15:10",
    lastInteractionType: "Web İletişim Formu (Ahtapot Vinçli Kurtarıcı)",
    interactionCount: 2
  },
  {
    id: "sub-101",
    email: "murat@ornek.com",
    name: "Murat Demir",
    subscribedAt: "2 Eylül 2026 09:15",
    status: "active",
    source: "Ana Sayfa Teklif Formu",
    tags: ["Acil / Yolda", "Teklif İstedi"],
    lastInteractionAt: "Bugün 14:25",
    lastInteractionType: "Ana Sayfa Teklif Formu (Oto Çekici & Kurtarıcı)",
    interactionCount: 1,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "2 Eylül 2026 09:16",
    welcomeEmailStatus: "clicked",
    conversionStatus: "customer",
    totalValue: 2400
  },
  {
    id: "sub-102",
    email: "selin@gmail.com",
    name: "Selin Yılmaz",
    subscribedAt: "1 Eylül 2026 14:30",
    status: "active",
    source: "Hızlı Teklif Modülü",
    tags: ["Müşteri", "Akü Servisi"],
    lastInteractionAt: "Bugün 11:10",
    lastInteractionType: "Hızlı Teklif Formu (Akü Takviye & Değişim)",
    interactionCount: 1,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "1 Eylül 2026 14:31",
    welcomeEmailStatus: "opened",
    conversionStatus: "customer",
    totalValue: 1200
  },
  {
    id: "sub-103",
    email: "burak@yucelinsaat.com",
    name: "Burak Yücel",
    subscribedAt: "25 Ağustos 2026 10:00",
    status: "active",
    source: "Kurumsal Teklif Formu",
    tags: ["Kurumsal", "VIP Müşteri", "Kazanıldı"],
    lastInteractionAt: "Dün 15:20",
    lastInteractionType: "Kurumsal Form (Şehirlerarası Özel Araç Transferi)",
    interactionCount: 3,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "25 Ağustos 2026 10:01",
    welcomeEmailStatus: "clicked",
    conversionStatus: "customer",
    totalValue: 18500
  },
  {
    id: "sub-104",
    email: "ahmet.yildiz@gmail.com",
    name: "Ahmet Yıldız",
    subscribedAt: "1 Eylül 2026 10:45",
    status: "active",
    source: "Footer Formu",
    tags: ["Müşteri", "Web Sitesi"],
    lastInteractionAt: "2 gün önce",
    lastInteractionType: "Footer E-Bülten Formu",
    interactionCount: 1,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "1 Eylül 2026 10:46",
    welcomeEmailStatus: "delivered",
    conversionStatus: "lead",
    totalValue: 1800
  },
  {
    id: "sub-105",
    email: "elif.karaca@hotmail.com",
    name: "Elif Karaca",
    subscribedAt: "28 Ağustos 2026 16:20",
    status: "active",
    source: "Ana Sayfa Bölümü",
    tags: ["Kampanya", "Bireysel"],
    lastInteractionAt: "28 Ağustos 2026",
    lastInteractionType: "Kampanya Kaydı",
    interactionCount: 1,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "28 Ağustos 2026 16:21",
    welcomeEmailStatus: "opened",
    conversionStatus: "prospect",
    totalValue: 0
  },
  {
    id: "sub-106",
    email: "info@ozgurinsaat.com.tr",
    name: "Özgür İnşaat A.Ş.",
    subscribedAt: "24 Ağustos 2026 09:15",
    status: "active",
    source: "Kurumsal Teklif Formu",
    tags: ["Kurumsal", "VIP"],
    lastInteractionAt: "24 Ağustos 2026",
    lastInteractionType: "Kurumsal Bülten",
    interactionCount: 1,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "24 Ağustos 2026 09:16",
    welcomeEmailStatus: "clicked",
    conversionStatus: "customer",
    totalValue: 6500
  },
  {
    id: "sub-107",
    email: "murat.celik@outlook.com",
    name: "Murat Çelik",
    subscribedAt: "19 Ağustos 2026 14:02",
    status: "active",
    source: "Ana Sayfa Bölümü",
    tags: ["Web Sitesi"],
    lastInteractionAt: "19 Ağustos 2026",
    lastInteractionType: "Bülten Aboneliği",
    interactionCount: 1,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "19 Ağustos 2026 14:03",
    welcomeEmailStatus: "opened",
    conversionStatus: "prospect",
    totalValue: 0
  },
  {
    id: "sub-108",
    email: "zeynep.avci@yahoo.com",
    name: "Zeynep Avcı",
    subscribedAt: "12 Ağustos 2026 11:30",
    status: "unsubscribed",
    source: "Footer Formu",
    tags: ["Ayrıldı"],
    lastInteractionAt: "12 Ağustos 2026",
    lastInteractionType: "Abonelik Ayrılma",
    interactionCount: 0,
    welcomeEmailSent: false,
    welcomeEmailStatus: "pending",
    conversionStatus: "prospect",
    totalValue: 0
  },
  {
    id: "sub-109",
    email: "kemal.turan@turanlojistik.com",
    name: "Kemal Turan",
    subscribedAt: "5 Eylül 2026 15:40",
    status: "active",
    source: "Hızlı Teklif Modülü",
    tags: ["Müşteri", "Ağır Vasıta"],
    lastInteractionAt: "Dün 16:00",
    lastInteractionType: "Hızlı Teklif Formu (Ağır Ticari Çekici)",
    interactionCount: 2,
    welcomeEmailSent: true,
    welcomeEmailSentAt: "5 Eylül 2026 15:41",
    welcomeEmailStatus: "clicked",
    conversionStatus: "customer",
    totalValue: 4800
  }
];

export const DEFAULT_CUSTOM_FORM_CONFIG: CustomFormConfig = {
  enabled: true,
  title: "Hızlı Fiyat Teklifi İsteyin",
  subtitle: "Formu doldurun, talebiniz ve varsa ekli belgeleriniz anında ekibimize ulaşsın.",
  submitButtonText: "Ücretsiz Fiyat Teklifi Gönder",
  successMessage: "✅ Talebiniz ve belgeleriniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.",
  redirectWhatsAppAfterSubmit: false,
  notifyEmail: "info@yildizotokurtarma.com.tr",
  thankYouEmail: DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG,
  fields: [
    {
      id: "lead_name",
      type: "text",
      label: "Adınız Soyadınız",
      placeholder: "Örn: Ahmet Yılmaz",
      required: true,
      width: "full",
      isSystem: true
    },
    {
      id: "lead_phone",
      type: "tel",
      label: "Telefon Numaranız",
      placeholder: "05XX XXX XX XX",
      required: true,
      width: "half",
      isSystem: true
    },
    {
      id: "lead_email",
      type: "email",
      label: "E-Posta Adresiniz (Onay & Teşekkür Bildirimi İçin)",
      placeholder: "ornek@sirket.com",
      required: true,
      width: "half",
      helpText: "Talep onayınız ve detaylı bilgilendirme bu adrese iletilecektir."
    },
    {
      id: "lead_service_category",
      type: "select",
      label: "İlgilendiğiniz Hizmet / Konu",
      placeholder: "Hizmet kategorisi seçiniz...",
      required: true,
      options: [
        "7/24 Şehir İçi Oto Çekici",
        "Ağır Vasıta & Ticari Kurtarma",
        "Yerinde Akü Takviye & Değişim",
        "Şehirlerarası Özel Araç Nakli",
        "Genel Danışmanlık & Kurumsal Filo"
      ],
      width: "half"
    },
    {
      id: "lead_urgency",
      type: "select",
      label: "Aciliyet Durumu / Zamanlama",
      placeholder: "Aciliyet seçiniz...",
      required: false,
      options: [
        "🚨 Acil / Hemen Yoldayım",
        "Bugün İçinde",
        "Bu Hafta Sonu",
        "Fiyat & Bilgi Araştırması"
      ],
      width: "half"
    },
    {
      id: "lead_attachment",
      type: "file",
      label: "Ruhsat, Hasar Fotoğrafı veya Dosya Eki",
      placeholder: "Dosya seçin veya sürükleyin (PDF, PNG, JPG)...",
      required: false,
      allowedFileTypes: ".pdf,.png,.jpg,.jpeg,.doc,.docx",
      maxFileSizeMb: 10,
      helpText: "Fotoğraf, kaza krokisi veya PDF formatında belge yükleyebilirsiniz (Maks 10 MB).",
      width: "full"
    },
    {
      id: "lead_message",
      type: "textarea",
      label: "Talep Detayları / Notunuz",
      placeholder: "Konum, araç modeli veya sormak istediklerinizi kısaca yazın...",
      required: false,
      width: "full",
      isSystem: true
    },
    {
      id: "lead_terms_kvkk",
      type: "checkbox",
      label: "KVKK Aydınlatma Metni'ni okudum ve iletişim bilgilerimin işlenmesini onaylıyorum.",
      required: true,
      defaultValue: true,
      width: "full"
    },
    {
      id: "lead_whatsapp_notify",
      type: "checkbox",
      label: "Teklif ve operasyon durumu WhatsApp üzerinden de mesajla iletilsin.",
      required: false,
      defaultValue: true,
      width: "full"
    }
  ]
};

export const DEFAULT_CATALOG_CONTACT_FORM_CONFIG: CustomFormConfig = {
  enabled: true,
  title: "Katalog Teklif & Özel İhtiyaç Formu",
  subtitle: "Katalogdaki ürünlerimiz veya projelerinize özel üretim/hizmet talepleriniz için formu doldurun, anında detaylı teklif alın.",
  submitButtonText: "Özel Fiyat Teklifi & Katalog Bilgisi İste",
  successMessage: "✅ Katalog talebiniz ve özel gereksinimleriniz başarıyla alındı! İlgili birimimiz en kısa sürede dönüş yapacaktır.",
  redirectWhatsAppAfterSubmit: true,
  notifyEmail: "info@yildizotokurtarma.com.tr",
  thankYouEmail: DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG,
  fields: [
    {
      id: "client_name",
      type: "text",
      label: "Adınız Soyadınız / Firma Ünvanı",
      placeholder: "Örn: Mehmet Özkan / Özkan Ticaret A.Ş.",
      required: true,
      width: "full",
      isSystem: true
    },
    {
      id: "client_phone",
      type: "tel",
      label: "Telefon Numaranız",
      placeholder: "05XX XXX XX XX",
      required: true,
      width: "half",
      isSystem: true
    },
    {
      id: "client_email",
      type: "email",
      label: "E-Posta Adresiniz",
      placeholder: "ornek@sirket.com",
      required: true,
      width: "half",
      helpText: "Teklif dokümanı ve detaylı katalog bu adrese iletilecektir."
    },
    {
      id: "selected_product",
      type: "select",
      label: "İlgilendiğiniz Ürün / Hizmet",
      placeholder: "Katalogdan ürün veya kategori seçiniz...",
      required: true,
      width: "half",
      options: [
        "Ahtapot Vinçli Kurtarıcı",
        "Ağır Ticari Çekici Kamyon",
        "Kayar Kasa Şehir İçi Çekici",
        "Yerinde Akü Takviye & Mobil Servis",
        "Özel Proje / Butik Sipariş / Toptan Alım"
      ]
    },
    {
      id: "order_quantity",
      type: "number",
      label: "Talep Edilen Miktar / Adet",
      placeholder: "Örn: 10",
      required: false,
      width: "half",
      helpText: "Adet veya hacim belirtmeniz özel iskonto oranı hesaplanmasını sağlar."
    },
    {
      id: "target_deadline",
      type: "date",
      label: "İhtiyaç / Hedef Teslim Tarihi",
      required: false,
      width: "half"
    },
    {
      id: "budget_range",
      type: "select",
      label: "Tahmini Proje Bütçesi",
      required: false,
      width: "half",
      options: [
        "10.000 TL Altı",
        "10.000 TL - 50.000 TL",
        "50.000 TL - 150.000 TL",
        "150.000 TL - 500.000 TL",
        "500.000 TL ve Üzeri",
        "Bütçe Henüz Belirlenmedi"
      ]
    },
    {
      id: "custom_requirements",
      type: "textarea",
      label: "Özel İstekler, Ölçüler & Teknik Şartlar",
      placeholder: "Özel ölçüler, renk kodları, hammadde veya projeye özgü tüm teknik beklentilerinizi belirtiniz...",
      required: true,
      width: "full",
      helpText: "Ne kadar detay verirseniz, teklifimiz o kadar net ve hızlı hazırlanır."
    },
    {
      id: "specification_file",
      type: "file",
      label: "Teknik Çizim / Numune Fotoğrafı / PDF (İsteğe Bağlı)",
      placeholder: "Dosya seçin veya sürükleyin (PDF, PNG, JPG, ZIP)...",
      required: false,
      width: "full",
      allowedFileTypes: ".pdf,.png,.jpg,.jpeg,.zip,.dwg,.doc,.docx",
      maxFileSizeMb: 25,
      helpText: "Maksimum 25 MB boyutunda teknik çizim, şartname veya fotoğraf yükleyebilirsiniz."
    },
    {
      id: "contact_preference",
      type: "radio",
      label: "Tercih Ettiğiniz İletişim Kanalı",
      required: false,
      width: "full",
      options: [
        "WhatsApp Üzerinden Hızlı Mesaj & PDF",
        "Telefon İle Arama",
        "Resmi E-Posta Teklifi"
      ],
      defaultValue: "WhatsApp Üzerinden Hızlı Mesaj & PDF"
    },
    {
      id: "kvkk_consent",
      type: "checkbox",
      label: "KVKK Aydınlatma Metni'ni okudum ve iletişim bilgilerimin teklif sürecinde işlenmesini onaylıyorum.",
      required: true,
      defaultValue: true,
      width: "full"
    }
  ]
};

export const INITIAL_LEADS: FormLead[] = [
  {
    id: "lead-100",
    date: "Bugün 15:10",
    name: "Emre Koçak",
    phone: "0533 412 88 90",
    email: "emre.kocak@gmail.com",
    serviceOrProduct: "Ahtapot Vinçli Kurtarıcı",
    message: "Şişli kapalı otoparkta aracımın tekeri kilitlendi, alçak tavan kurtarıcı vinç gerekiyor.",
    sourcePage: "Web İletişim Formu",
    status: "new",
    isRead: false,
    heroVariant: "B",
    acquisitionChannel: "organic",
    dealValue: 1850,
    privateNotes: "Müşteri ile ilk temas sağlandı. Otopark -2. katta ve tavan yüksekliği 2.10 metre. Özel kayar platformlu küçük vinç aracı görevlendirildi.",
    dealNotes: "Müşteri ile ilk temas sağlandı. Otopark -2. katta ve tavan yüksekliği 2.10 metre. Özel kayar platformlu küçük vinç aracı görevlendirildi.",
    tags: ["Yeni Form", "Alçak Tavan"],
    customTags: [
      { id: "tag-yeni-form", name: "Yeni Form", color: "blue" },
      { id: "tag-alcak-tavan", name: "Alçak Tavan", color: "indigo" }
    ],
    thankYouEmailSent: true,
    thankYouEmailSentAt: "Bugün 15:10",
    thankYouEmailStatus: "delivered",
    thankYouEmailDelayMinutes: 0,
    thankYouEmailScheduledFor: "Anında İletildi (0 dk gecikme)",
    thankYouEmailSubject: "Talebiniz Alındı! - Yıldız Oto Kurtarma",
    customFields: {
      lead_service_category: "Özel Kapalı Otopark Kurtarma",
      lead_urgency: "🚨 Acil / Hemen",
      lead_terms_kvkk: true,
      lead_whatsapp_notify: true
    }
  },
  {
    id: "lead-101",
    date: "Bugün 14:25",
    name: "Murat Demir",
    phone: "0532 890 12 34",
    email: "murat@ornek.com",
    serviceOrProduct: "Oto Çekici & Kurtarıcı",
    message: "Kadıköy E-5 üzerinde aracım hararet yaptı, en yakın servise çekilmesini istiyorum.",
    sourcePage: "Ana Sayfa Teklif Formu",
    status: "new",
    isRead: false,
    heroVariant: "A",
    acquisitionChannel: "ads",
    dealValue: 1250,
    privateNotes: "Kadıköy E-5 bağlantısında bekliyor. Trafik yoğun, alternatif sahil yolundan ekip yönlendirildi. Tahmini varış 20 dakika.",
    dealNotes: "Kadıköy E-5 bağlantısında bekliyor. Trafik yoğun, alternatif sahil yolundan ekip yönlendirildi. Tahmini varış 20 dakika.",
    tags: ["Acil / Yolda", "VIP Müşteri"],
    customTags: [
      { id: "tag-acil", name: "Acil / Yolda", color: "rose" },
      { id: "tag-vip", name: "VIP Müşteri", color: "amber" }
    ],
    thankYouEmailSent: true,
    thankYouEmailSentAt: "Bugün 14:30",
    thankYouEmailStatus: "delivered",
    thankYouEmailDelayMinutes: 5,
    thankYouEmailScheduledFor: "Bugün 14:30 (5 dk doğal bekleme sonrası iletildi)",
    thankYouEmailSubject: "Talebiniz Alındı! Teşekkür Ederiz - Yıldız Oto Kurtarma",
    customFields: {
      lead_service_category: "7/24 Şehir İçi Oto Çekici",
      lead_urgency: "🚨 Acil / Hemen Yoldayım",
      lead_terms_kvkk: true,
      lead_whatsapp_notify: true
    },
    attachments: [
      { name: "arac_konum_foto.jpg", size: 1420000, type: "image/jpeg" }
    ]
  },
  {
    id: "lead-102",
    date: "Bugün 11:10",
    name: "Selin Yılmaz",
    phone: "0544 555 77 88",
    email: "selin@gmail.com",
    serviceOrProduct: "Akü Takviye & Değişim",
    message: "Sabah otoparkta akü bitti, acil takviye ekibi yönlendirebilir misiniz?",
    sourcePage: "Ana Sayfa Teklif Formu",
    status: "contacted",
    heroVariant: "B",
    acquisitionChannel: "social",
    dealValue: 600,
    tags: ["Sıcak Takip", "Randevu Alındı"],
    customTags: [
      { id: "tag-sicak", name: "Sıcak Takip", color: "orange" },
      { id: "tag-randevu", name: "Randevu Alındı", color: "purple" }
    ],
    thankYouEmailSent: true,
    thankYouEmailSentAt: "Bugün 11:11",
    thankYouEmailStatus: "delivered",
    thankYouEmailDelayMinutes: 0,
    thankYouEmailScheduledFor: "Anında İletildi (0 dk gecikme)",
    thankYouEmailSubject: "🚨 Talebiniz Nöbetçi Ekibimize Ulaştı! - Yıldız Oto Kurtarma",
    customFields: {
      lead_service_category: "Yerinde Akü Takviye & Değişim",
      lead_urgency: "Bugün İçinde",
      lead_terms_kvkk: true,
      lead_whatsapp_notify: true
    }
  },
  {
    id: "lead-103",
    date: "Bugün 18:40",
    name: "Kaan Arslan",
    phone: "0505 123 45 67",
    email: "kaan@sirket.com.tr",
    serviceOrProduct: "Şehirlerarası Araç Taşıma",
    message: "İstanbul - İzmir arası 2 adet binek araç taşıma fiyat teklifi rica ediyorum.",
    sourcePage: "Ana Sayfa Teklif Formu",
    status: "offered",
    heroVariant: "A",
    acquisitionChannel: "ads",
    dealValue: 4500,
    tags: ["Kurumsal", "Fiyat Bekliyor"],
    customTags: [
      { id: "tag-kurumsal", name: "Kurumsal", color: "indigo" },
      { id: "tag-fiyat", name: "Fiyat Bekliyor", color: "sky" }
    ],
    thankYouEmailSent: false,
    thankYouEmailStatus: "pending",
    thankYouEmailScheduledFor: "Bugün 18:50 (10 dk doğal gecikme)",
    thankYouEmailDelayMinutes: 10,
    thankYouEmailSubject: "Talebiniz Alındı! Teşekkür Ederiz - Yıldız Oto Kurtarma",
    customFields: {
      lead_service_category: "Şehirlerarası Özel Araç Nakli",
      lead_urgency: "Bu Hafta Sonu",
      lead_terms_kvkk: true,
      lead_whatsapp_notify: false
    },
    attachments: [
      { name: "arac_ruhsat_listesi.pdf", size: 540000, type: "application/pdf" }
    ]
  },
  {
    id: "lead-104",
    date: "Dün 15:20",
    name: "Burak Yücel",
    phone: "0533 444 11 22",
    email: "burak@yucelinsaat.com",
    serviceOrProduct: "Şehirlerarası Özel Araç Transferi",
    message: "Ankara'dan İstanbul'a SUV araç nakliyesi tamamlandı ve teslim edildi.",
    sourcePage: "Ana Sayfa Teklif Formu",
    status: "closed",
    heroVariant: "B",
    acquisitionChannel: "organic",
    dealValue: 3800,
    completedAt: "Dün 16:30",
    tags: ["Kurumsal", "VIP Müşteri"],
    customTags: [
      { id: "tag-kurumsal", name: "Kurumsal", color: "indigo" },
      { id: "tag-vip", name: "VIP Müşteri", color: "amber" }
    ],
    thankYouEmailSent: true,
    thankYouEmailSentAt: "Dün 15:35",
    thankYouEmailStatus: "delivered",
    thankYouEmailDelayMinutes: 15,
    thankYouEmailScheduledFor: "Dün 15:35 (15 dk kurumsal inceleme sonrası)",
    thankYouEmailSubject: "Talebiniz Alındı! Teşekkür Ederiz - Yıldız Oto Kurtarma",
    customFields: {
      lead_service_category: "Şehirlerarası Özel Araç Nakli",
      lead_urgency: "Bugün İçinde",
      lead_terms_kvkk: true
    }
  },
  {
    id: "lead-105",
    date: "2 gün önce",
    name: "Ayşe Tekin",
    phone: "0542 333 99 88",
    email: "ayse.tekin@gecersizposta.xyz",
    serviceOrProduct: "Oto Çekici & Kurtarıcı",
    message: "Bebek sahilinde lastik yarılması, en yakın yetkili servise güvenle çekildi.",
    sourcePage: "Ana Sayfa Teklif Formu",
    status: "closed",
    heroVariant: "A",
    acquisitionChannel: "referral",
    dealValue: 1250,
    completedAt: "2 gün önce",
    tags: ["Referans Müşteri"],
    customTags: [
      { id: "tag-referans", name: "Referans Müşteri", color: "pink" }
    ],
    thankYouEmailSent: false,
    thankYouEmailStatus: "failed",
    thankYouEmailScheduledFor: "2 gün önce 10:15 (5 dk gecikme)",
    thankYouEmailDelayMinutes: 5,
    thankYouEmailFailureReason: "550 5.1.1 Alıcı e-posta kutusu bulunamadı veya geçersiz alan adı (Mailbox unavailable)",
    thankYouEmailSubject: "Talebiniz Alındı! Teşekkür Ederiz - Yıldız Oto Kurtarma"
  },
  {
    id: "lead-106",
    date: "3 gün önce",
    name: "Emre Can",
    phone: "0530 777 22 11",
    email: "emre@cantekstil.com",
    serviceOrProduct: "Yerinde Akü Takviye & Voltaj Ölçümü",
    message: "Kapalı otoparkta takviye yapıldı, yerinde yeni akü montajı sağlandı.",
    sourcePage: "Ana Sayfa Teklif Formu",
    status: "closed",
    heroVariant: "B",
    acquisitionChannel: "social",
    dealValue: 750,
    completedAt: "3 gün önce",
    tags: ["Filo / Çoklu Araç"],
    thankYouEmailSent: false,
    thankYouEmailStatus: "pending",
    thankYouEmailScheduledFor: "Bugün 19:15 (30 dk kapsamlı inceleme)",
    thankYouEmailDelayMinutes: 30,
    thankYouEmailSubject: "Talebiniz Alındı! Teşekkür Ederiz - Yıldız Oto Kurtarma"
  },
  {
    id: "lead-107",
    date: "4 gün önce",
    name: "Deniz Yıldız",
    phone: "0535 999 44 33",
    email: "deniz@lojistik.com",
    serviceOrProduct: "Ağır Vasıta & Özel Kurtarma",
    message: "Hafif ticari araç kurtarma ve çekici hizmeti başarıyla tamamlandı.",
    sourcePage: "Hizmetler Detay",
    status: "closed",
    acquisitionChannel: "organic",
    dealValue: 2450,
    completedAt: "4 gün önce",
    tags: ["Kurumsal"],
    thankYouEmailSent: true,
    thankYouEmailSentAt: "4 gün önce 16:05",
    thankYouEmailStatus: "delivered",
    thankYouEmailDelayMinutes: 5,
    thankYouEmailScheduledFor: "4 gün önce 16:05 (5 dk doğal bekleme)",
    thankYouEmailSubject: "Talebiniz Alındı! Teşekkür Ederiz - Yıldız Oto Kurtarma"
  }
];

export const INITIAL_BLOG_CATEGORIES: BlogCategory[] = [
  { id: "cat-rehber", name: "Sektörel Rehber & İpuçları", slug: "rehber", description: "Müşterilerimiz için pratik ve faydalı tavsiyeler." },
  { id: "cat-haberler", name: "Duyuru & Haberler", slug: "haberler", description: "Firmamızdan en son yenilikler ve duyurular." },
  { id: "cat-bakim", name: "Bakım & Güvenlik", slug: "bakim-guvenlik", description: "Güvenli ve sorunsuz kullanım için püf noktalar." }
];

export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: "p1",
    title: "Şehir İçi Acil Çekici Paketi",
    category: "Oto Kurtarma",
    price: "1.250 ₺",
    oldPrice: "1.500 ₺",
    description: "<p>Binek, SUV ve hafif ticari araçlar için <strong>20 km'ye kadar</strong> tam sigortalı ve kaskolu transfer hizmeti.</p><ul><li>15-20 dakikada adrese varış garantisi</li><li>Sıfır çizik ve hasarsız yükleme platformu</li><li>Kredi kartı veya nakit yerinde ödeme kolaylığı</li></ul>",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
    ],
    badge: "En Çok Satan",
    inStock: true,
    specs: [
      { label: "Varış Süresi", value: "15-20 Dakika" },
      { label: "Kasko Güvencesi", value: "%100 Tam Kasko" },
      { label: "Araç Kapasitesi", value: "3.5 Tona Kadar" }
    ]
  },
  {
    id: "p2",
    title: "Yerinde Akü Takviye & Voltaj Ölçümü",
    category: "Yol Yardım",
    price: "600 ₺",
    oldPrice: "750 ₺",
    description: "<p>Profesyonel takviye cihazı ve dijital ölçüm aparatları ile <strong>yerinde akü şarjı ve alternatör voltaj testi</strong>.</p><p>Gerektiğinde aracınıza uygun sıfır garantili akü temini ve anında montajı yapılmaktadır.</p>",
    images: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
    ],
    badge: "Hızlı Servis",
    inStock: true,
    specs: [
      { label: "İşlem Süresi", value: "10 Dakika" },
      { label: "Cihaz Tipi", value: "Dijital Akıllı Takviye" }
    ]
  },
  {
    id: "p3",
    title: "Şehirlerarası Özel Araç Transferi",
    category: "Lojistik",
    price: "Özel Fiyat",
    description: "<p>Türkiye geneli 81 ile tekli özel çekici veya çoklu taşıyıcı ile <em>adresten adrese sigortalı araç transferi</em>.</p><p>Sıfır km araçlar, klasik otomobiller ve arızalı araçlar için GPS takipli güvenli lojistik.</p>",
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ],
    badge: "Özel Sevk",
    inStock: true,
    specs: [
      { label: "Kapsam", value: "81 İl Geneli" },
      { label: "Takip", value: "Canlı GPS Takibi" }
    ]
  }
];

export const SAMPLE_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Otoyol Acil Müdahale & Transfer",
    category: "Operasyonlar",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    caption: "Kuzey Marmara Otoyolu üzerinde 18 dakikada gerçekleşen güvenli platform yüklemesi.",
    aspectRatio: "landscape"
  },
  {
    id: "g2",
    title: "Tam Donanımlı Hidrolik Çekici",
    category: "Filo & Araçlar",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80",
    caption: "Son teknoloji hidrolik kayar kasa sistemlerimiz ile sıfır hasar güvencesi.",
    aspectRatio: "portrait"
  },
  {
    id: "g3",
    title: "Lüks & Spor Araç Taşımacılığı",
    category: "Özel Taşıma",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    caption: "Hassas süspansiyonlu araçlar için yumuşak bağlama kayışları ve tam kasko.",
    aspectRatio: "square"
  },
  {
    id: "g4",
    title: "Gece Nöbetçi Kurtarma Ekibi",
    category: "Operasyonlar",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    caption: "7 gün 24 saat hazır bekleyen nöbetçi ekiplerimiz ile kesintisiz destek.",
    aspectRatio: "portrait"
  },
  {
    id: "g5",
    title: "Yerinde Akü & Elektrik Teşhisi",
    category: "Yol Yardım",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
    caption: "Mobil yol yardım araçlarımız ile yerinde akü değişimi ve alternatör testi.",
    aspectRatio: "landscape"
  },
  {
    id: "g6",
    title: "Şehirlerarası Özel Nakil Sevk",
    category: "Özel Taşıma",
    imageUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1000&q=80",
    caption: "Türkiye genelinde 81 ile sigortalı adrese teslimat çözümleri.",
    aspectRatio: "square"
  }
];

export const SAMPLE_BLOG_POSTS: BlogPostItem[] = [
  {
    id: "b1",
    title: "Yolda Kaldığınızda İlk Yapmanız Gereken 5 Güvenlik Adımı",
    slug: "yolda-kaldiginizda-yapilmasi-gerekenler",
    category: "Sektörel Rehber & İpuçları",
    categories: ["Sektörel Rehber & İpuçları", "Bakım & Güvenlik"],
    categoryIds: ["cat-rehber", "cat-bakim"],
    excerpt: "Otobanda veya şehir içinde araç arızası anında reflektör yerleşimi ve güvenli çekici çağırma rehberi.",
    content: "<h3>1. Güvenli Bir Alana Geçin ve Dörtlüleri Yakın</h3><p>Aracınız arıza yaptığında veya lastik patladığında ilk yapılması gereken şey paniğe kapılmadan aracınızı sağ emniyet şeridine çekmek ve dörtlü ikaz lambalarını derhal yakmaktır.</p><h3>2. İkaz Reflektörünü Doğru Mesafeye Yerleştirin</h3><p>Şehir içinde <strong>30 metre</strong>, otoban veya şehirlerarası yollarda en az <strong>100-150 metre</strong> mesafeye ikaz reflektörünüzü yerleştirin.</p><h3>3. Güvenilir ve Kurumsal Çekici Çağırın</h3><p>Ruhsatlı ve kaskolu çekici hizmeti veren kurumsal firmalardan destek alın.</p>",
    readTime: "3 dk okuma",
    date: "14 Ağustos 2026",
    author: "HızlıWeb Teknik Ekip",
    coverImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    tags: ["Oto Güvenlik", "Yol Yardım", "Tavsiyeler"],
    seoTitle: "Yolda Kaldığınızda Yapılması Gereken 5 Adım | Rehber",
    seoDescription: "Araç arızası durumunda emniyet şeridi güvenliği, reflektör mesafesi ve güvenilir çekici çağırma adımları.",
    seoKeywords: "yol yardım rehberi, çekici güvenliği, araç arızası"
  },
  {
    id: "b2",
    title: "Akü Neden Aniden Biter ve Nasıl Korunur?",
    slug: "aku-neden-biter",
    category: "Bakım & Güvenlik",
    categories: ["Bakım & Güvenlik"],
    categoryIds: ["cat-bakim"],
    excerpt: "Kış ve yaz aylarında akü ömrünü uzatmanın en pratik yolları ve voltaj kontrolü.",
    content: "<h3>Akü Ömrünü Kısaltan Faktörler</h3><p>Aküler aşırı sıcak ve aşırı soğuk hava koşullarından, açık bırakılan iç aydınlatmalardan veya alternatörün yeterli şarj üretmemesinden dolayı aniden tükenebilir.</p><p>Periyodik olarak 6 ayda bir voltaj kontrolü yaptırmak yolda kalma riskini %90 oranında engeller.</p>",
    readTime: "4 dk okuma",
    date: "10 Ağustos 2026",
    author: "Mühendislik Servisi",
    coverImage: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    tags: ["Akü Bakımı", "Oto Elektrik"],
    seoTitle: "Akü Neden Biter ve Nasıl Korunur? | Uzman Tavsiyeleri",
    seoDescription: "Akünüzün ömrünü 2 katına çıkaracak pratik bakım yöntemleri ve voltaj kontrol rehberi.",
    seoKeywords: "akü bakımı, akü takviye, oto elektrik ipuçları"
  }
];

export const THREE_TIER_PACKAGES: PricingPlan[] = [
  {
    id: "pkg-single",
    name: "1 Web Sitesi (Tekil Paket)",
    price: "₺1.490",
    period: "/ Yıllık",
    siteLimit: 1,
    description: "Tek bir işletme veya şahıs firması için bağımsız, ultra hızlı ve tam SEO uyumlu statik site.",
    features: [
      "1 Adet Tam Bağımsız Web Sitesi",
      "0.02 sn Global Anycast Edge Dağıtım",
      "Header, Hero Slider & Footer Tasarımcısı",
      "Ürün & Fiyat Kataloğu + WhatsApp Sipariş",
      "Blog & Kategori Yönetimi",
      "Müşteri Teklif Formu & Gelen Kutusu",
      "Ücretsiz SSL & Özel Domain Bağlama",
      "Google PageSpeed 100/100 Puanı"
    ],
    cta: "Tekil Paketi Başlat",
    badge: "Bireysel / Tek Şirket"
  },
  {
    id: "pkg-triple",
    name: "3 Web Sitesi (Çoklu Paket)",
    price: "₺2.990",
    period: "/ Yıllık",
    siteLimit: 3,
    highlighted: true,
    description: "Farklı sektörlerde birden fazla işletmesi, şubesi veya projesi olan girişimciler için en ideal paket.",
    features: [
      "3 Adet Farklı Web Sitesi Yönetimi",
      "Her Site İçin Ayrı Yönetim Paneli & Alan Adı",
      "0.02 sn Global Anycast Edge Dağıtım",
      "Yapay Zeka İçerik & SEO Fabrikası",
      "Ürün Kataloğu + Çoklu Fotoğraf Galerisi",
      "Kategorili Blog & Zengin Makale Motoru",
      "Ortak veya Ayrı Gelen Kutusu (Leads)",
      "Öncelikli 7/24 WhatsApp & Teknik Destek"
    ],
    cta: "3'lü Paketi Başlat",
    badge: "En Popüler Paket"
  },
  {
    id: "pkg-agency",
    name: "Ajans Paketi (10 Web Sitesi)",
    price: "₺5.990",
    period: "/ Yıllık",
    siteLimit: 10,
    description: "Web ajansları, freelancer tasarımcılar ve müşterilerine ultra hızlı hazır site sunmak isteyenler için.",
    features: [
      "10 Adede Kadar Web Sitesi Ekleme & Yönetme",
      "Müşterilerinize Özel Ayrı Yönetim Panelleri",
      "Ajans Markasız / White-Label Kullanım",
      "0.02 sn Sınırsız Global Edge Dağıtımı",
      "Tüm Şablon ve Sektör Çözümlerine Erişim",
      "Tek Tıkla Yeni Müşteri Sitesi Klonlama",
      "Gelişmiş Süper Admin Kontrol Merkezi",
      "Özel VIP Ajans Danışmanı & API Erişimi"
    ],
    cta: "Ajans Paketini Seç",
    badge: "Ajanslar & Tasarımcılar"
  }
];

export const DEFAULT_SOCIAL_FEED_POSTS: SocialFeedPost[] = [
  {
    id: "post-ig-1",
    platform: "instagram",
    authorName: "Yıldız Oto Kurtarma & Yol Yardım",
    authorHandle: "@yildizotokurtarma",
    authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
    isVerified: true,
    content: "TEM Otoyolu Çamlıca mevkiinde gece 03:40'ta arıza yapan aracı, özel hidrolik kayar platformumuzla 14 dakikada güvenle tahliye ettik. Gece gündüz fark etmeksizin 7/24 yanınızdayız! 🚨🛠️",
    mediaUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    timestamp: "2 saat önce",
    likesCount: 342,
    commentsCount: 28,
    postUrl: "https://instagram.com",
    pinned: true,
    hashtags: ["#yolyardım", "#çekici", "#otoçekici", "#7x24hizmet", "#istanbul"]
  },
  {
    id: "post-tw-1",
    platform: "twitter",
    authorName: "Yıldız Oto Kurtarma",
    authorHandle: "@yildizkurtarma",
    authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
    isVerified: true,
    content: "⚠️ AKOM ve Meteoroloji uyarısı: Bu gece beklenen yoğun sağanak yağış sebebiyle köprü bağlantıları ve viyadüklerde hızınızı düşürün, takip mesafesini iki katına çıkarın. Olası arıza ve kazalarda nöbetçi acil filomuz hazır: 0532 000 00 00 📞",
    mediaUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    timestamp: "4 saat önce",
    likesCount: 189,
    retweetsCount: 46,
    commentsCount: 15,
    postUrl: "https://x.com",
    pinned: false,
    hashtags: ["#TrafikGüvenliği", "#HavaDurumu", "#YolYardım"]
  },
  {
    id: "post-ig-2",
    platform: "instagram",
    authorName: "Yıldız Oto Kurtarma & Yol Yardım",
    authorHandle: "@yildizotokurtarma",
    authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
    isVerified: true,
    content: "Filomuza yeni katılan euro-6 motorlu, sıfır sarsıntı amortisörlü kayar kasa çekicimiz hizmete hazır! Spor araçlar ve alçak şaseli otomobiller için özel tampon koruma aparatlı transfer sistemi. 🏎️✨",
    mediaUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    timestamp: "Dün",
    likesCount: 524,
    commentsCount: 42,
    postUrl: "https://instagram.com",
    pinned: false,
    hashtags: ["#yeninesil", "#filo", "#kaskoluçekici", "#güvenliulaşım"]
  },
  {
    id: "post-tw-2",
    platform: "twitter",
    authorName: "Yıldız Oto Kurtarma",
    authorHandle: "@yildizkurtarma",
    authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
    isVerified: true,
    content: "Ağustos ayı müşteri memnuniyeti anket sonuçlarımız açıklandı: %99.4 memnuniyet oranı ve ortalama 14.8 dakika varış süresiyle İstanbul'un en güvenilir kurtarma ekibi olmaktan gurur duyuyoruz. Bizi tercih eden 8.500+ sürücümüze teşekkürler! 🌟🏆",
    timestamp: "2 gün önce",
    likesCount: 276,
    retweetsCount: 38,
    commentsCount: 19,
    postUrl: "https://x.com",
    pinned: false,
    hashtags: ["#MüşteriMemnuniyeti", "#KaliteGarantisi"]
  },
  {
    id: "post-ig-3",
    platform: "instagram",
    authorName: "Yıldız Oto Kurtarma & Yol Yardım",
    authorHandle: "@yildizotokurtarma",
    authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
    isVerified: true,
    content: "Yolda akü bitmesi kabusuna son! Mobil akü takviye ve yerinde teşhis servisimiz İstanbul Anadolu ve Avrupa yakasında hizmetinizde. Akünüzü yerinde test edip gerekiyorsa garantili sıfır akü montajı yapıyoruz. 🔋⚡",
    mediaUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    timestamp: "3 gün önce",
    likesCount: 412,
    commentsCount: 31,
    postUrl: "https://instagram.com",
    pinned: false,
    hashtags: ["#akütakviye", "#aküdeğişimi", "#mobildestek", "#yolyardım"]
  },
  {
    id: "post-ig-4",
    platform: "instagram",
    authorName: "Yıldız Oto Kurtarma & Yol Yardım",
    authorHandle: "@yildizotokurtarma",
    authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
    isVerified: true,
    content: "Şehirler arası kaskolu ve garantili araç transferi. İstanbul - Ankara - İzmir - Antalya ve tüm Türkiye geneline çoklu veya tekli özel taşıma çözümleri sunuyoruz. Sigortalı ve faturalı transfer güvencesi. 🛣️🇹🇷",
    mediaUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    timestamp: "5 gün önce",
    likesCount: 388,
    commentsCount: 22,
    postUrl: "https://instagram.com",
    pinned: false,
    hashtags: ["#şehirlerarasıçekici", "#araçtransferi", "#kaskolu"]
  }
];

export const DEFAULT_SOCIAL_FEED_CONFIG: SocialMediaFeedConfig = {
  enabled: true,
  badge: "Canlı Sosyal Akış & Medya Vitrini",
  title: "Instagram & X (Twitter)'da Bizi Takip Edin",
  subtitle: "En güncel saha operasyonlarımız, müşteri referanslarımız ve önemli yol duyurularımız anlık olarak sosyal medya hesaplarımızda.",
  activePlatforms: ["instagram", "twitter"],
  layout: "grid",
  postsLimit: 6,
  showEngagement: true,
  showCaptions: true,
  showPlatformBadges: true,
  instagramHandle: "yildizotokurtarma",
  twitterHandle: "yildizkurtarma",
  instagramProfileUrl: "https://instagram.com/yildizotokurtarma",
  twitterProfileUrl: "https://x.com/yildizkurtarma",
  instagramFollowers: "14.8K",
  twitterFollowers: "9.2K",
  posts: DEFAULT_SOCIAL_FEED_POSTS,
  autoSyncInterval: "hourly",
  lastSyncedAt: "Az önce güncellendi"
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: "hero", name: "Karşılama & Hero Slider", enabled: true, order: 1 },
  { id: "services", name: "Hizmetlerimiz", enabled: true, order: 2 },
  { id: "catalog", name: "Ürün & Fiyat Kataloğu", enabled: true, order: 3 },
  { id: "about", name: "Kurumsal & Hakkımızda", enabled: true, order: 4 },
  { id: "whyUs", name: "Neden Biz? (Avantajlar)", enabled: true, order: 5 },
  { id: "gallery", name: "Fotoğraf & Proje Vitrini", enabled: true, order: 6 },
  { id: "testimonials", name: "Müşteri Yorumları & Puanlar", enabled: true, order: 7 },
  { id: "socialFeed", name: "Sosyal Medya Akışı (Instagram & X)", enabled: true, order: 8 },
  { id: "blog", name: "Blog & Rehber Makaleler", enabled: true, order: 9 },
  { id: "newsletter", name: "E-Bülten Aboneliği", enabled: true, order: 10 },
  { id: "faqs", name: "Sıkça Sorulan Sorular", enabled: true, order: 11 },
  { id: "contact", name: "İletişim & Teklif Formu", enabled: true, order: 12 }
];

export const DEFAULT_HEADER_NAV: HeaderNavItem[] = [
  { id: "nav-home", label: "Ana Sayfa", target: "home", visible: true, order: 1 },
  { id: "nav-about", label: "Kurumsal", target: "about", visible: true, order: 2 },
  { id: "nav-services", label: "Hizmetlerimiz", target: "services", visible: true, order: 3 },
  { id: "nav-catalog", label: "Ürün & Fiyat", target: "catalog", visible: true, order: 4 },
  { id: "nav-gallery", label: "Galeri", target: "gallery", visible: true, order: 5 },
  { id: "nav-blog", label: "Blog", target: "blog", visible: true, order: 6 },
  { id: "nav-contact", label: "İletişim", target: "contact", visible: true, order: 7 }
];

export function createDefaultSiteConfig(template?: ThemeTemplate, palette?: ColorPalette): SiteConfig {
  const t = template || TEMPLATES[0];
  const d = t.defaultData;
  const p = palette || t.defaultColors || COLOR_PALETTES[0];

  const defaultHeroBg = d.hero?.bgImage || t.coverImage;

  const defaultSlides: HeroSlide[] = [
    {
      id: "slide-1",
      badge: d.hero?.badge || "🚨 7/24 Acil Yol Yardım & Çekici",
      title: d.hero?.title || "Yolda Kaldığınızda Panik Yapmayın!",
      subtitle: d.hero?.subtitle || "Şehrin her noktasına 15-20 dakikada ulaşıyor, aracınızı güvenle istediğiniz servise taşıyoruz.",
      ctaPrimaryText: d.hero?.ctaPrimaryText || "Hemen Ara (0532 000 00 00)",
      ctaPrimaryLink: d.hero?.ctaPrimaryLink || "tel:05320000000",
      ctaSecondaryText: d.hero?.ctaSecondaryText || "WhatsApp Destek",
      ctaSecondaryLink: d.hero?.ctaSecondaryLink || "https://wa.me/905320000000",
      bgImage: defaultHeroBg
    },
    {
      id: "slide-2",
      badge: "⭐ %100 Kasko Güvencesi",
      title: "Şehirlerarası ve Şehir İçi Güvenli Transfer",
      subtitle: "Geniş kaskolu çekici filomuz ve deneyimli kadromuzla aracınız baştan sona sigortamız altındadır.",
      ctaPrimaryText: "Fiyat Teklifi Al",
      ctaPrimaryLink: "#contact",
      ctaSecondaryText: "Kataloğu İncele",
      ctaSecondaryLink: "#catalog",
      bgImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  return {
    id: `site-${Date.now()}`,
    templateId: t.id,
    solutionType: (t.solutionType || "corporate"),
    siteType: "multi-page",
    companyName: d.companyName || "Yıldız 7/24 Oto Kurtarma",
    sector: d.sector || "Otomotiv & Çekici",
    slogan: d.slogan || "En Yakın Çekici 15 Dakikada Yanınızda",
    city: d.city || "İstanbul & Çevre İller",
    phone: d.phone || "0532 000 00 00",
    whatsapp: d.whatsapp || "905320000000",
    email: d.email || "info@sirket.com",
    address: d.address || "Merkez Mah. No:12 Kadıköy / İstanbul",
    workingHours: d.workingHours || "7/24 Kesintisiz",
    palette: p,
    fontFamily: "Plus Jakarta Sans",
    borderRadius: "16px",

    // Header Navigation & Actions Customizer
    header: {
      logoType: "icon",
      logoImage: "",
      showPhoneButton: true,
      phoneButtonText: "Hemen Ara",
      showWhatsappButton: true,
      whatsappButtonText: "WhatsApp",
      showQuoteButton: true,
      quoteButtonText: "Teklif Al",
      navItems: DEFAULT_HEADER_NAV,
      showSocials: true
    },

    // Social Media Links (Instagram, LinkedIn, Twitter/X)
    socialMedia: {
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
      twitter: "https://x.com",
      facebook: "https://facebook.com",
      youtube: "",
      showInHeader: true,
      showInFooter: true
    },

    // Social Media Live Feed Integration (Instagram & X Posts directly on landing page)
    socialFeed: DEFAULT_SOCIAL_FEED_CONFIG,

    // Social Media Post Scheduler (Queue up automated posts with direct product links)
    socialScheduler: {
      enabled: true,
      autoPublishSimulation: true,
      posts: INITIAL_SCHEDULED_SOCIAL_POSTS
    },

    // Müşteri Erişim Portalı (Client Access Portal - Sipariş Durumu & Proje Dokümanları)
    clientPortal: DEFAULT_CLIENT_ACCESS_PORTAL_CONFIG,

    // Footer Customizer
    footer: {
      aboutText: "Gelişmiş altyapımız, deneyimli kadromuz ve müşteri odaklı hizmet anlayışımız ile 7/24 yanınızdayız.",
      showSocials: true,
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      twitter: "https://x.com",
      copyrightText: `© ${new Date().getFullYear()} Tüm Hakları Saklıdır.`,
      column1Title: "Hızlı Menü",
      column2Title: "Popüler Hizmetler"
    },

    // Homepage Section Modular Layout & Ordering
    homepageSections: DEFAULT_HOMEPAGE_SECTIONS,

    // Hero with Slider support
    hero: {
      badge: d.hero?.badge || "🚨 7/24 Acil Yol Yardım & Çekici",
      title: d.hero?.title || "Yolda Kaldığınızda Panik Yapmayın!",
      subtitle: d.hero?.subtitle || "Şehrin her noktasına 15-20 dakikada ulaşıyor, aracınızı güvenle istediğiniz servise taşıyoruz.",
      ctaPrimaryText: d.hero?.ctaPrimaryText || "Hemen Ara (0532 000 00 00)",
      ctaPrimaryLink: d.hero?.ctaPrimaryLink || "tel:05320000000",
      ctaSecondaryText: d.hero?.ctaSecondaryText || "WhatsApp Destek",
      ctaSecondaryLink: d.hero?.ctaSecondaryLink || "https://wa.me/905320000000",
      bgImage: defaultHeroBg,
      slides: defaultSlides,
      stats: d.hero?.stats || [
        { label: "Ortalama Varış", value: "15 Dk" },
        { label: "Mutlu Müşteri", value: "8.500+" },
        { label: "PageSpeed Hızı", value: "100/100" }
      ]
    },

    // Multi-page custom pages
    pages: [
      {
        id: "p-about",
        title: "Kurumsal",
        slug: "kurumsal",
        content: "<p>2012 yılından bu yana sektörde kesintisiz, dürüst ve kurumsal hizmet sunmaktayız.</p><p>Misyonumuz müşteri memnuniyetini en üst düzeyde tutarak en zor anlarınızda güvenilir yol arkadaşınız olmaktır.</p>",
        isNavVisible: true,
        metaDescription: "Kurumsal firma tanıtımımız, vizyon ve misyonumuz."
      },
      {
        id: "p-services",
        title: "Hizmetlerimiz",
        slug: "hizmetler",
        content: "<p>Geniş kaskolu araç filomuz ve deneyimli kadromuz ile 7/24 her noktada kesintisiz hizmetinizdeyiz.</p>",
        isNavVisible: true,
        metaDescription: "Tüm hizmetlerimiz ve çözümlerimiz."
      },
      {
        id: "p-contact",
        title: "İletişim",
        slug: "iletisim",
        content: "<p>Telefon, WhatsApp veya merkez ofisimiz üzerinden bize dilediğiniz an ulaşabilirsiniz. 7/24 nöbetçi ekiplerimiz hizmetinizdedir.</p>",
        isNavVisible: true,
        metaDescription: "İletişim bilgileri, telefon ve adres krokisi."
      }
    ],

    // Product catalog module with rich text and multiple images
    products: {
      enabled: true,
      badge: "Ürün & Hizmet Kataloğu",
      title: "Hizmet ve Fiyat Kataloğumuz",
      subtitle: "Fotoğraflı katalog üzerinden doğrudan WhatsApp ile tek tıkla sipariş veya teklif alabilirsiniz.",
      ctaButtonText: "WhatsApp Sipariş & Teklif Al",
      items: SAMPLE_PRODUCTS
    },

    // Blog categories & blog posts
    blogCategories: INITIAL_BLOG_CATEGORIES,
    blog: {
      enabled: true,
      badge: "Rehber & Blog",
      title: "Faydalı Bilgiler ve Sektörel İpuçları",
      subtitle: "Uzmanlarımızdan güncel makaleler, rehberler ve tavsiyeler.",
      items: SAMPLE_BLOG_POSTS
    },

    // Leads inbox
    leads: INITIAL_LEADS,
    leadTagDefinitions: [
      { id: "tag-def-vip", name: "VIP Müşteri", color: "amber" },
      { id: "tag-def-acil", name: "Acil / Yolda", color: "rose" },
      { id: "tag-def-kurumsal", name: "Kurumsal", color: "indigo" },
      { id: "tag-def-sicak", name: "Sıcak Takip", color: "orange" },
      { id: "tag-def-fiyat", name: "Fiyat Bekliyor", color: "sky" },
      { id: "tag-def-randevu", name: "Randevu Alındı", color: "purple" },
      { id: "tag-def-yeni", name: "Yeni Form", color: "blue" },
      { id: "tag-def-referans", name: "Referans Müşteri", color: "pink" },
      { id: "tag-def-servis", name: "Alçak Tavan", color: "teal" }
    ],

    // Cloudflare Edge deployment settings
    cloudflare: {
      subdomain: "yildiz-otokurtarma",
      customDomain: "yildizotokurtarma.com.tr",
      status: "deployed",
      deployedUrl: "https://yildiz-otokurtarma.hizliweb.me",
      lastDeployedAt: "16 Ağustos 2026 14:30",
      sslActive: true,
      edgeRegionsCount: 310,
      pageSpeedScore: 100,
      dnsRecords: [
        {
          type: "CNAME",
          name: "@",
          content: "yildiz-otokurtarma.hizliweb.me",
          proxyStatus: true,
          status: "verified"
        },
        {
          type: "CNAME",
          name: "www",
          content: "yildiz-otokurtarma.hizliweb.me",
          proxyStatus: true,
          status: "verified"
        }
      ]
    },

    about: {
      enabled: d.about?.enabled ?? true,
      badge: d.about?.badge || "Hakkımızda",
      title: d.about?.title || "12 Yıldır Güvenle Yoldayız",
      content: d.about?.content || "<p>Uzmanlaşmış kadromuz ve kaskolu çekici filomuzla binek, SUV ve ticari araç taşıma işlemlerinde lideriz.</p><p>Müşterilerimize şeffaf fiyatlandırma ve en yüksek güvenlik standartlarını sunuyoruz.</p>",
      yearsExperience: d.about?.yearsExperience || "12+",
      completedProjects: d.about?.completedProjects || "14.000+",
      bullets: d.about?.bullets || [
        "Tam Kasko Güvenceli Taşıma",
        "Sabit ve Şeffaf Fiyat Politikası",
        "Akü Takviye & Lastik Değişimi",
        "Şehirlerarası Araç Transferi"
      ],
      image: d.about?.image || t.coverImage
    },

    services: {
      enabled: d.services?.enabled ?? true,
      badge: d.services?.badge || "Hizmetlerimiz",
      title: d.services?.title || "Profesyonel Yol Yardım Çözümleri",
      subtitle: d.services?.subtitle || "Her model araç için uygun ekipman ve deneyimli şoför kadrosu.",
      items: (d.services?.items && d.services.items.length > 0) ? d.services.items : [
        { 
          id: "s1", 
          title: "Oto Çekici & Kurtarıcı", 
          slug: "oto-cekici-kurtarici",
          desc: "Kaza ve arıza anında hızlı, kaskolu ve hasarsız araç çekici hizmeti.", 
          price: "Uygun Fiyat",
          seoTitle: "7/24 Acil Oto Çekici & Kurtarıcı Hizmeti | Hızlı Varış",
          seoDescription: "Şehir içi ve şehirlerarası kaskolu araç çekici. En yakın oto kurtarıcı 15 dakikada yanınızda.",
          bannerImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
          longContent: "<h3>Profesyonel ve Hasarsız Araç Taşıma</h3><p>Aracınız yolda kaldığında veya kaza anında, deneyimli operatörlerimiz ve modern kayar kasa çekicilerimiz ile en kısa sürede adresinize ulaşıyoruz.</p><h4>Hizmet Kapsamımız:</h4><ul><li>Binek otomobil, SUV, hafif ticari ve motosiklet taşıma</li><li>Yeraltı otoparkından özel ahtapot aparatlı kurtarma</li><li>%100 tam kasko ve yol güvencesi ile sıfır hasar garantisi</li><li>Anlaşmalı yetkili veya özel servise güvenli teslimat</li></ul><p>Sabit fiyat garantisi ve kredi kartı ile ödeme kolaylığı sunmaktayız.</p>",
          features: ["15-20 Dakikada Varış", "%100 Kaskolu Taşıma", "Kayar Kasa Donanım", "Sabit Fiyat Garantisi"]
        },
        { 
          id: "s2", 
          title: "Akü Takviye & Değişim", 
          slug: "aku-takviye-degisim",
          desc: "Yerinde akü ölçümü, hızlı takviye ve sıfır garantili akü temini.", 
          price: "Ekonomik",
          seoTitle: "Yerinde Akü Takviye & Acil Akü Değişimi | 7/24 Mobil Servis",
          seoDescription: "Mobil akü servis ekibimiz akıllı cihazlarla yerinde ölçüm yapar ve aracınıza uygun aküyü monte eder.",
          bannerImage: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
          longContent: "<h3>Yerinde Mobil Akü Çözümleri</h3><p>Akü bitmesi sebebiyle çalışmayan aracınız için mobil ekibimiz dakikalar içinde konumunuza ulaşarak profesyonel takviye cihazlarıyla aracınızı çalıştırır.</p><h4>Neler Yapıyoruz?</h4><ul><li>Dijital voltaj ve marş motoru testleri</li><li>2 yıl garantili yerli ve ithal akü seçenekleri</li><li>Eski akünün geri dönüşüme kazandırılması indirimi</li><li>Garantili yerinde anında montaj</li></ul>",
          features: ["Dijital Voltaj Testi", "2 Yıl Garantili Aküler", "Hızlı Mobil Ekip", "Yerinde Montaj"]
        },
        { 
          id: "s3", 
          title: "Lastik Yol Yardımı", 
          slug: "lastik-yol-yardimi",
          desc: "Patlak lastik tamiri ve stepne değişimi ile yola kaldığınız yerden devam edin.", 
          price: "Hızlı Servis",
          seoTitle: "Yerinde Lastik Tamiri & Stepne Değişimi | Yol Yardım",
          seoDescription: "Patlayan veya inen lastiğiniz için yerinde tamir ve stepne montajı hizmeti.",
          bannerImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
          longContent: "<h3>Acil Mobil Lastik Servisi</h3><p>Lastiğiniz patladığında veya yaralandığında tehlikeli yol kenarında beklemenize gerek yok. Mobil ekipmanlı aracımızla yanınıza gelerek güvenli bir şekilde lastiğinizi tamir ediyor veya stepnenizi takıyoruz.</p><ul><li>Yerinde fitil ve yama uygulaması</li><li>Bijon ve jant korumalı sökme-takma</li><li>Hava basıncı ve balans kontrolü</li></ul>",
          features: ["Yerinde Tamir", "Stepne Değişimi", "Basınç Kontrolü", "7/24 Destek"]
        }
      ]
    },

    whyUs: {
      enabled: true,
      badge: "Neden Biz?",
      title: "Bizi Tercih Etmeniz İçin 4 Neden",
      subtitle: "Müşterilerimizin güvenini kazanan standartlarımız.",
      items: [
        { id: "w1", title: "15 Dakikada Varış", desc: "Geniş araç filomuz ile şehrin her noktasına en hızlı şekilde ulaşıyoruz.", icon: "Clock" },
        { id: "w2", title: "%100 Kasko Güvencesi", desc: "Aracınız taşınırken baştan sona sigorta teminatı altındadır.", icon: "ShieldCheck" }
      ]
    },

    gallery: {
      enabled: true,
      badge: "📸 Fotoğraf & Proje Vitrini",
      title: "Saha Operasyonlarımız & Çalışmalarımız",
      subtitle: "Geniş araç filomuz, profesyonel ekipmanlarımız ve başarıyla tamamlanan referanslarımızdan kareler.",
      items: SAMPLE_GALLERY_ITEMS,
      layout: "masonry",
      columns: 3,
      enableLightbox: true,
      categories: ["Tümü", "Operasyonlar", "Filo & Araçlar", "Özel Taşıma", "Yol Yardım"]
    },

    pricing: {
      enabled: true,
      badge: "Paketlerimiz",
      title: "Hizmet ve Web Sitesi Paketlerimiz",
      subtitle: "İhtiyacınıza en uygun şeffaf paket seçeneği.",
      items: THREE_TIER_PACKAGES
    },

    testimonials: {
      enabled: d.testimonials?.enabled ?? true,
      badge: d.testimonials?.badge || "Müşteri Deneyimleri",
      title: d.testimonials?.title || "Müşterilerimiz Ne Diyor?",
      subtitle: d.testimonials?.subtitle || "Hizmetlerimizden yararlanan müşterilerimizin gerçek deneyimleri ve puanlamaları.",
      showRatingStats: true,
      googleRatingBadge: true,
      items: d.testimonials?.items && d.testimonials.items.length > 0 ? d.testimonials.items : [
        {
          id: "t1",
          name: "Murat Kaya",
          role: "Şirket Yöneticisi, İstanbul",
          comment: "Gece yarısı otobanda kaldığımızda sadece 15 dakikada ulaştılar. Profesyonel ve güler yüzlü ekip, aracımı sıfır hasarla servise ulaştırdı. Kesinlikle tavsiye ederim.",
          rating: 5,
          date: "3 gün önce",
          verified: true,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        },
        {
          id: "t2",
          name: "Selin Demir",
          role: "Bireysel Müşteri, Kadıköy",
          comment: "Hem telefon desteği hem sahadaki ustaların yaklaşımı çok güven vericiydi. Fiyat konusunda baştan ne konuşulduysa o alındı, sürpriz masraf çıkmadı.",
          rating: 5,
          date: "1 hafta önce",
          verified: true,
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
        },
        {
          id: "t3",
          name: "Burak Özkan",
          role: "Filo Müdürü, Kocaeli",
          comment: "Şirket araçlarımızın transferlerinde sürekli çalışıyoruz. Faturalı, sigortalı ve dakik hizmet sunuyorlar. Hızlı Web altyapısıyla siteleri de çok şık ve pratik.",
          rating: 5,
          date: "2 hafta önce",
          verified: true,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
        }
      ]
    },

    faqs: {
      enabled: d.faqs?.enabled ?? true,
      badge: d.faqs?.badge || "Sıkça Sorulanlar",
      title: d.faqs?.title || "Merak Edilen Konular & SSS",
      subtitle: d.faqs?.subtitle || "Hizmetlerimiz, süreçlerimiz ve güvencelerimiz hakkında en çok sorulan sorular.",
      layout: "single-column",
      accordionStyle: "modern",
      allowMultipleOpen: false,
      items: (d.faqs?.items && d.faqs.items.length > 0) ? d.faqs.items.map((it: any) => ({
        id: it.id,
        q: it.q || it.question || "",
        a: it.a || it.answer || "",
        question: it.question || it.q || "",
        answer: it.answer || it.a || "",
        category: it.category || "Genel"
      })) : [
        {
          id: "f1",
          q: "Hizmet talebinde bulunduğumda ne kadar sürede ulaşırsınız?",
          a: "Operasyon ekiplerimiz lokasyonunuza bağlı olarak ortalama 15-30 dakika içerisinde adresinize yönlendirilir.",
          question: "Hizmet talebinde bulunduğumda ne kadar sürede ulaşırsınız?",
          answer: "Operasyon ekiplerimiz lokasyonunuza bağlı olarak ortalama 15-30 dakika içerisinde adresinize yönlendirilir.",
          category: "Hizmet Süreci"
        },
        {
          id: "f2",
          q: "Fiyatlandırma nasıl hesaplanır, ek veya gizli masraf çıkar mı?",
          a: "Fiyatlarımız hizmet kapsamına ve mesafeye göre şeffafça önceden belirlenir ve onayınıza sunulur. Sürpriz ek maliyet çıkarılmaz.",
          question: "Fiyatlandırma nasıl hesaplanır, ek veya gizli masraf çıkar mı?",
          answer: "Fiyatlarımız hizmet kapsamına ve mesafeye göre şeffafça önceden belirlenir ve onayınıza sunulur. Sürpriz ek maliyet çıkarılmaz.",
          category: "Fiyat & Ödeme"
        },
        {
          id: "f3",
          q: "Ödeme seçenekleri ve faturalandırma nasıl yapılıyor?",
          a: "Nakit, tüm banka/kredi kartları ve kurumsal havale/EFT ile ödeme kabul etmekteyiz. İşlem sonrası e-faturanız tarafınıza iletilir.",
          question: "Ödeme seçenekleri ve faturalandırma nasıl yapılıyor?",
          answer: "Nakit, tüm banka/kredi kartları ve kurumsal havale/EFT ile ödeme kabul etmekteyiz. İşlem sonrası e-faturanız tarafınıza iletilir.",
          category: "Fiyat & Ödeme"
        },
        {
          id: "f4",
          q: "İşlemleriniz ve araçlarınız sigortalı ve garantili mi?",
          a: "Evet, tüm operasyonlarımız kurumsal sorumluluk ve taşıma kasko sigortamız kapsamında %100 güvence altındadır.",
          question: "İşlemleriniz ve araçlarınız sigortalı ve garantili mi?",
          answer: "Evet, tüm operasyonlarımız kurumsal sorumluluk ve taşıma kasko sigortamız kapsamında %100 güvence altındadır.",
          category: "Güvence & Garanti"
        }
      ]
    },

    contact: {
      enabled: true,
      badge: "İletişim",
      title: "Bize Ulaşın",
      subtitle: "7/24 yanınızdayız.",
      showMap: true,
      showForm: true
    },

    // Dinamik Form Yönetimi (Açılır menüler, onay kutuları, dosya yükleme)
    customForm: DEFAULT_CUSTOM_FORM_CONFIG,

    // Site Kataloğu İletişim & Özel Teklif Formu ("Contact Us" with Custom Fields)
    catalogContactForm: DEFAULT_CATALOG_CONTACT_FORM_CONFIG,

    // Otomatik Teşekkürler E-Postası Yanıtı & E-Posta Yakalama
    leadThankYouEmail: DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG,

    // Yüksek Öncelikli Talep Bildirimleri (Slack & E-posta) ve Lead Puanlama
    leadNotifications: DEFAULT_LEAD_NOTIFICATIONS_CONFIG,

    // Lead Otomasyon Kuralları (Skora, Kaynağa ve İletişim Kanalına Göre Otomatik Aksiyonlar)
    leadAutomations: DEFAULT_LEAD_AUTOMATION_CONFIG,

    newsletter: {
      enabled: true,
      badge: "E-Bülten Aboneliği",
      title: "Kampanyalar ve İndirimlerden İlk Siz Haberdar Olun",
      subtitle: `${d.companyName || "Firmamız"} tarafından sunulan özel avantajlar, kampanyalar ve sektörel duyurular doğrudan e-postanıza gelsin.`,
      buttonText: "Abone Ol",
      placeholder: "E-posta adresinizi giriniz...",
      successMessage: "Harika! E-bülten listemize başarıyla kaydoldunuz.",
      privacyNote: "Spam göndermiyoruz. İstediğiniz zaman tek tıkla abonelikten ayrılabilirsiniz.",
      displayLocation: "both"
    },
    subscribers: INITIAL_SUBSCRIBERS,

    // WhatsApp Floating Chat Widget
    whatsappWidget: {
      enabled: true,
      phoneNumber: d.whatsapp || "905320000000",
      position: "bottom-right",
      buttonStyle: "floating-pill",
      buttonText: "WhatsApp İle Yazın",
      defaultMessage: `Merhaba ${d.companyName || "yetkili"}, web sitenizden ulaşıyorum. Fiyat ve detaylı bilgi almak istiyorum.`,
      agentName: `${d.companyName || "Müşteri"} Temsilcisi`,
      agentSubtitle: "Genellikle birkaç dakika içinde yanıt verir",
      popupEnabled: true,
      callToAction: "Merhaba 👋 Size nasıl yardımcı olabiliriz?",
      showBadgeDot: true
    },

    // Vergi & KDV Fiyatlandırma Yönetimi
    taxPricing: {
      enabled: true,
      defaultVatRate: 20,
      priceIncludesVat: true,
      displayVatBadge: true,
      displayTaxBreakdown: true,
      roundingMethod: "standard",
      vatExemptNotice: "Fiyatlarımıza yasal KDV dahildir. Kurumsal ve bireysel fatura düzenlenmektedir.",
      currencySymbol: "₺",
      currencyPosition: "suffix",
      customRates: [20, 10, 1, 0]
    },

    // Dil Ayarları & Çoklu Dil (i18n)
    languages: {
      enabled: true,
      defaultLanguage: "tr",
      switcherPosition: "header-right",
      switcherStyle: "dropdown",
      autoDetectBrowserLanguage: true,
      enableRtlForArabic: true,
      activeLanguages: [
        { code: "tr", name: "Türkçe", nativeName: "Türkçe", flag: "🇹🇷", direction: "ltr", enabled: true, isDefault: true },
        { code: "en", name: "İngilizce", nativeName: "English", flag: "🇬🇧", direction: "ltr", enabled: true, isDefault: false },
        { code: "de", name: "Almanca", nativeName: "Deutsch", flag: "🇩🇪", direction: "ltr", enabled: true, isDefault: false },
        { code: "ar", name: "Arapça", nativeName: "العربية", flag: "🇸🇦", direction: "rtl", enabled: true, isDefault: false }
      ],
      translations: {}
    },

    // A/B Testi: Hero Varyasyonları & Form Dönüşüm Takibi
    abTesting: {
      enabled: true,
      testName: "Ana Sayfa Karşılama Başlığı & Aciliyet Testi",
      status: "active",
      trafficSplit: 50,
      startedAt: "28 Ağustos 2026",
      winnerVariant: null,
      variationA: {
        id: "A",
        label: "Varyasyon A (Kontrol - Güven & Deneyim)",
        badge: d.hero?.badge || "🚨 7/24 Acil Yol Yardım & Çekici",
        title: d.hero?.title || "Yolda Kaldığınızda Panik Yapmayın!",
        subtitle: d.hero?.subtitle || "Şehrin her noktasına 15-20 dakikada ulaşıyor, aracınızı güvenle istediğiniz servise taşıyoruz.",
        ctaPrimaryText: d.hero?.ctaPrimaryText || "Hemen Ara (0532 000 00 00)",
        ctaPrimaryLink: d.hero?.ctaPrimaryLink || "tel:05320000000",
        ctaSecondaryText: d.hero?.ctaSecondaryText || "WhatsApp Destek",
        ctaSecondaryLink: d.hero?.ctaSecondaryLink || "https://wa.me/905320000000",
        bgImage: defaultHeroBg
      },
      variationB: {
        id: "B",
        label: "Varyasyon B (Challenger - Hızlı Fiyat & İndirim Odaklı)",
        badge: "⚡ 15 Dakika Garantisi & %20 İndirim",
        title: "En Hızlı Yol Yardım: Sabit Fiyat, Anında Çözüm!",
        subtitle: "Sürpriz ek maliyet olmadan şeffaf fiyat garantisi. Canlı konum paylaşımı ile çekiciniz 15 dakikada yanınızda.",
        ctaPrimaryText: "Anında Fiyat Al & Çağır",
        ctaPrimaryLink: "tel:05320000000",
        ctaSecondaryText: "WhatsApp Canlı Konum",
        ctaSecondaryLink: "https://wa.me/905320000000",
        bgImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80"
      },
      stats: {
        variantA: {
          views: 480,
          leads: 28
        },
        variantB: {
          views: 495,
          leads: 46
        },
        history: [
          { date: "28 Ağu", viewsA: 65, leadsA: 4, viewsB: 70, leadsB: 6 },
          { date: "29 Ağu", viewsA: 72, leadsA: 3, viewsB: 68, leadsB: 7 },
          { date: "30 Ağu", viewsA: 80, leadsA: 5, viewsB: 84, leadsB: 8 },
          { date: "31 Ağu", viewsA: 88, leadsA: 6, viewsB: 92, leadsB: 9 },
          { date: "1 Eyl",  viewsA: 85, leadsA: 4, viewsB: 89, leadsB: 8 },
          { date: "2 Eyl",  viewsA: 90, leadsA: 6, viewsB: 92, leadsB: 8 }
        ]
      }
    },

    // Pazarlama Otomasyonu: E-Bülten Kaynak Analizi & Otomatik Hoş Geldin E-Postası Kurgusu
    marketingAutomation: DEFAULT_MARKETING_AUTOMATION_CONFIG,

    seo: {
      metaTitle: `${d.companyName || "Firma"} | ${d.slogan || "Hazır Web Sitesi"}`,
      metaDescription: d.slogan || "En kaliteli hizmetler en uygun fiyatlarla.",
      keywords: `${d.companyName || "Firma"}, ${d.sector || "Oto Kurtarma"}, ${d.city || "İstanbul"}`,
      author: "HızlıWeb Engine",
      schemaType: "LocalBusiness"
    }
  };
}
