export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  text: string;
  bg: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug?: string;
  desc: string;
  longContent?: string; // Rich Text HTML for dedicated service page
  icon?: string;
  price?: string;
  longDesc?: string;
  features?: string[];
  image?: string;
  bannerImage?: string;
  ogImage?: string; // Custom OpenGraph social share image
  imageAlt?: string;
  altText?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  schemaType?: string;
  specs?: { label: string; value: string }[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  slug?: string;
  category: string;
  price: string;
  oldPrice?: string;
  description: string; // rich text HTML
  shortDescription?: string;
  featuredImage?: string; // Main primary featured image
  image?: string;
  images: string[];
  imageAlt?: string;
  altText?: string;
  ogImage?: string; // Custom OpenGraph social share image
  badge?: string;
  inStock: boolean;
  specs?: { label: string; value: string }[];
  whatsappMessage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  schemaType?: string;
  vatRate?: number; // Ürüne özel KDV oranı (boş ise mağaza varsayılanı)
  priceIncludesVat?: boolean; // Ürüne özel KDV dahil/hariç durumu (boş ise mağaza varsayılanı)
  taxExempt?: boolean; // KDV'den muaf mı?
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  categoryIds?: string[]; // multi-category support
  category?: string;
  categories?: string[];
  excerpt: string;
  content: string; // rich text HTML
  readTime: string;
  date: string;
  author: string;
  coverImage?: string;
  image?: string;
  imageAlt?: string;
  altText?: string;
  ogImage?: string; // Custom OpenGraph social share image
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  schemaType?: string;
}

// ==========================================
// AI-DRIVEN CONTENT CALENDAR TYPES
// ==========================================
export type ContentCalendarStatus = "suggested" | "scheduled" | "draft" | "published";
export type ContentCalendarFormat = "guide" | "comparison" | "pricing" | "tips" | "case_study" | "local_seo";
export type ContentCalendarIntent = "commercial" | "informational" | "transactional" | "navigational";

export interface ContentCalendarItem {
  id: string;
  title: string;
  suggestedSlug?: string;
  focusKeyword: string;
  secondaryKeywords?: string[];
  scheduledDate: string; // YYYY-MM-DD
  optimalHour: string; // e.g. "10:30"
  timeSlotLabel: string; // e.g. "Sabah Masaüstü Zirvesi (10:00 - 12:00)"
  trafficReasoning: string; // Direct correlation to Real-time Traffic engine peak hours & low bounce rates
  peakMetrics: {
    hourlyVisitors: number;
    bounceRate: number; // percentage (e.g. 17.8)
    deviceFocus: "desktop" | "mobile" | "balanced";
    peakHour: string; // e.g. "10:00"
  };
  contentType: ContentCalendarFormat;
  searchIntent: ContentCalendarIntent;
  targetAudience: string;
  expectedTrafficGain: string; // e.g. "+380 Ziyaretçi / Ay"
  estimatedReadTime: string; // e.g. "5 dk okuma"
  status: ContentCalendarStatus;
  priority: "high" | "medium" | "standard";
  blogPostId?: string; // ID of linked blog post in config.blog.items if published/drafted
  outlinePoints?: string[];
  notes?: string;
  createdAt?: string;
}

export interface CustomPageItem {
  id: string;
  title: string;
  slug: string;
  content: string; // rich text HTML
  bannerImage?: string;
  ogImage?: string; // Custom OpenGraph social share image
  isNavVisible: boolean;
  seoTitle?: string;
  metaDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  schemaType?: string;
}

export type FormFieldType =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "file"
  | "radio"
  | "email"
  | "tel"
  | "number"
  | "date";

export interface FormFieldConfig {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Dropdown veya Radio için seçenek listesi
  allowedFileTypes?: string; // Dosya yükleme için izin verilen uzantılar (örn: .pdf, .jpg, .png)
  maxFileSizeMb?: number; // Maksimum dosya boyutu (MB)
  helpText?: string;
  defaultValue?: string | boolean;
  width?: "full" | "half";
  isSystem?: boolean; // Çekirdek alan işareti (ad soyad, telefon vb.)
}

export interface LeadThankYouEmailConfig {
  enabled: boolean; // Yeni gelen form taleplerine otomatik teşekkür e-postası gönder
  requireEmail: boolean; // Kullanıcının e-posta adresini formda zorunlu tutarak yakala
  subject: string; // E-posta konu başlığı ({firma}, {isim}, {hizmet}, {tarih})
  body: string; // E-posta gövde metni (Zengin HTML veya biçimlendirilmiş metin)
  senderName?: string; // Gönderen Adı (Örn: "Yıldız Oto Kurtarma Müşteri Destek")
  replyToEmail?: string; // Yanıtlanacak e-posta adresi
  sendCopyNotification?: boolean; // Şirket yetkilisine de bir kopya bildirimi gönder
  includeDetailsSummary?: boolean; // E-postanın altına doldurulan form verilerinin özetini ekle
  smtpStatus?: "active" | "simulated";
  theme?: "clean" | "navy" | "emerald" | "amber" | "indigo";
  customFooterNote?: string;
  ctaButtonText?: string;
  ctaButtonType?: "phone" | "whatsapp" | "website";
  // Gecikme & Doğal Takip Zamanlayıcısı (Natural Follow-Up Delay Timer)
  delayMinutes?: number; // 0 = Anında / Gecikmesiz, 5 = 5 dk, 15 = 15 dk, 30 = 30 dk, vb.
  delayMode?: "instant" | "preset" | "custom"; // Zamanlama tercihi
  delayRandomWindow?: boolean; // Doğal insan varyasyonu (±1-3 dk rastgele sapma ile robotik görünümü engeller)
  businessHoursOnly?: boolean; // Yalnızca mesai saatleri içinde gönder (mesai dışı gelenler ertesi sabah iletilir)
  businessHoursStart?: string; // Örn: "09:00"
  businessHoursEnd?: string; // Örn: "19:00"
}

export interface EmailAuditLogEntry {
  id: string; // msg_... or audit_...
  leadId: string;
  leadName: string;
  recipientEmail: string;
  recipientPhone?: string;
  serviceOrProduct?: string;
  subject: string;
  triggerType: "autoresponder" | "followup" | "notification" | "manual_resend" | "test";
  status: "delivered" | "pending" | "failed";
  timestamp: string;
  scheduledFor?: string;
  sentAt?: string;
  delayMinutes?: number;
  failureReason?: string;
  messageId: string;
  smtpResponse?: string;
  latencyMs?: number;
  ipAddress?: string;
  tlsVersion?: string;
}

export interface CustomFormConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  submitButtonText: string;
  successMessage: string;
  redirectWhatsAppAfterSubmit?: boolean;
  notifyEmail?: string;
  fields: FormFieldConfig[];
  thankYouEmail?: LeadThankYouEmailConfig;
}

export type LeadTagColor =
  | "rose"
  | "amber"
  | "emerald"
  | "sky"
  | "indigo"
  | "purple"
  | "teal"
  | "orange"
  | "pink"
  | "blue"
  | "violet"
  | "slate";

export interface LeadCustomTag {
  id: string;
  name: string;
  color: LeadTagColor | string;
  description?: string;
  createdAt?: string;
}

export type LeadTimelineEventType =
  | "form_submission" // İlk web formu başvurusu
  | "call"            // Telefon görüşmesi
  | "whatsapp"        // WhatsApp iletişimi
  | "email"           // E-posta gönderimi / yanıtı
  | "meeting"         // Yüz yüze görüşme veya saha keşfi
  | "note"            // Dahili özel not
  | "status_change"   // Pipeline aşama değişikliği
  | "quote"           // Fiyat teklifi sunumu / revizyonu
  | "deal_closed"     // Satış / anlaşma tamamlandı
  | "score"           // Lead scoring / öncelik puanı
  | "archive"         // Arşivleme işlemi
  | "system";         // Sistem / bildirim olayı

export interface LeadTimelineEntry {
  id: string;
  type: LeadTimelineEventType;
  date: string; // "DD.MM.YYYY HH:mm" veya "Bugün 14:30" veya ISO string
  title: string;
  description: string;
  author?: string; // "Müşteri", "Sistem", "Operatör", "Satış Danışmanı", "Yönetici"
  duration?: string; // Görüşme süresi (örn: "4 dk", "12 dk")
  outcome?: string; // Sonuç durumu (örn: "Ulaşıldı", "Meşgul", "Teklif Gönderildi", "Randevu Alındı")
  dealValue?: number;
  statusFrom?: FormLead["status"];
  statusTo?: FormLead["status"];
  pinned?: boolean;
  attachmentName?: string;
}

export interface FormLead {
  id: string;
  date: string;
  name: string;
  phone: string;
  email?: string;
  serviceOrProduct: string;
  message: string;
  sourcePage: string;
  status: "new" | "contacted" | "offered" | "closed" | "archived";
  isRead?: boolean; // Okundu / İncelendi durumu (false ise okunmamış/yeni işlem bekleyen bildirim)
  heroVariant?: "A" | "B";
  acquisitionChannel?: "organic" | "ads" | "social" | "direct" | "referral"; // Edinme kanalı (Organik SEO, Google Reklamları, Sosyal Medya vb.)
  dealValue?: number; // Revenue/Value in TRY (₺) for completed or offered deals
  dealNotes?: string;
  privateNotes?: string; // Private / internal observations about this lead (Dahili özel notlar)
  completedAt?: string;
  archivedAt?: string; // ISO date string when lead was moved to archive
  archivedReason?: string; // Reason why lead was archived (e.g. 30+ gün işlem yapılmadığı için otomatik arşivlendi)
  createdAt?: string; // ISO timestamp of creation
  lastActivityAt?: string; // ISO timestamp of last interaction/status update
  customFields?: Record<string, any>;
  attachments?: {
    name: string;
    size?: number;
    type?: string;
    dataUrl?: string;
  }[];
  thankYouEmailSent?: boolean;
  thankYouEmailSentAt?: string;
  thankYouEmailStatus?: "delivered" | "queued" | "pending" | "failed" | "skipped";
  thankYouEmailScheduledFor?: string; // Planlanan gönderim zamanı (örn: "14:45 (Bugün)")
  thankYouEmailDelayMinutes?: number; // Zamanlayıcı gecikme dakikası
  thankYouEmailFailureReason?: string; // Hata nedeni (SMTP hatası, geçersiz adres vb.)
  thankYouEmailSubject?: string;
  thankYouEmailRenderedBody?: string;
  tags?: string[]; // Custom CRM organization tags (e.g. VIP, Acil, Kurumsal, Sıcak Takip)
  customTags?: LeadCustomTag[]; // Custom color-coded labels/tags saved directly within this lead object
  leadScore?: number; // Lead scoring puanı (0-100)
  leadScorePriority?: "high" | "medium" | "low"; // Öncelik düzeyi
  leadScoreReasons?: string[]; // Puanlama faktörleri ve açıklamaları
  timeline?: LeadTimelineEntry[]; // Kronolojik iletişim ve özel notlar zaman çizelgesi
}

export interface FaqItem {
  id: string;
  q: string; // Question
  a: string; // Answer
  question?: string; // Friendly alias
  answer?: string; // Friendly alias
  category?: string; // Category or topic
  isOpenDefault?: boolean;
}

export interface FaqSectionConfig {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
  layout?: "single-column" | "two-columns";
  accordionStyle?: "modern" | "bordered" | "separated" | "minimal";
  allowMultipleOpen?: boolean;
  categories?: string[];
  showSearch?: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar?: string;
  avatarAlt?: string;
  altText?: string;
  date?: string;
  verified?: boolean;
  company?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
  source?: string;
  tags?: string[];
  lastInteractionAt?: string;
  lastInteractionType?: string;
  interactionCount?: number;
  welcomeEmailSent?: boolean;
  welcomeEmailSentAt?: string;
  welcomeEmailStatus?: "delivered" | "opened" | "clicked" | "pending";
  conversionStatus?: "lead" | "customer" | "prospect";
  totalValue?: number;
}

export interface NewsletterConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  badge?: string;
  buttonText?: string;
  placeholder?: string;
  successMessage?: string;
  privacyNote?: string;
  displayLocation?: "footer" | "section" | "both";
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  altText?: string;
  imageAlt?: string;
  caption?: string;
  aspectRatio?: "auto" | "square" | "portrait" | "landscape";
}

export type AssetCategory =
  | "logo"
  | "favicon"
  | "icon"
  | "banner"
  | "product_service"
  | "social_og"
  | "gallery"
  | "general";

export interface SiteAsset {
  id: string;
  name: string;
  category: AssetCategory;
  url: string;
  usedIn: string[];
  dimensions?: string;
  fileType?: string;
  createdWith?: "ai-imagen" | "upload" | "preset" | "system";
  prompt?: string;
  createdAt?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  desc?: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
  cta: string;
  siteLimit: number; // 1, 3, or 10
  badge?: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  bgImage: string;
}

export interface HeroVariantConfig {
  id: "A" | "B" | string;
  label: string; // e.g. "Varyasyon A (Kontrol)" or "Varyasyon B (Aciliyet & İndirim)"
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  bgImage: string;
  stats?: { label: string; value: string }[];
  views?: number;
  clicks?: number;
  leads?: number;
}

export interface AbTestExperiment {
  id?: string;
  name?: string;
  testName?: string;
  enabled: boolean;
  status: "active" | "paused" | "completed";
  trafficSplit: number; // e.g. 50 (% assigned to Variant A, 100 - trafficSplit to Variant B)
  startDate?: string;
  startedAt?: string;
  endDate?: string;
  endedAt?: string;
  winnerVariant?: "A" | "B" | null;
  winningVariant?: "A" | "B" | null;
  variationA: HeroVariantConfig;
  variationB: HeroVariantConfig;
  stats?: {
    variantA: {
      views: number;
      clicks?: number;
      leads: number;
    };
    variantB: {
      views: number;
      clicks?: number;
      leads: number;
    };
    history?: {
      date: string;
      viewsA: number;
      clicksA?: number;
      leadsA: number;
      viewsB: number;
      clicksB?: number;
      leadsB: number;
    }[];
  };
}

export interface HeaderNavItem {
  id: string;
  label: string;
  target: string; // 'home', 'about', 'services', 'catalog', 'blog', 'contact', or custom slug
  visible: boolean;
  order: number;
}

export interface SocialMediaLinks {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  showInHeader?: boolean;
  showInFooter?: boolean;
}

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "twitter" | "whatsapp";

export type SocialPostStatus = "queued" | "published" | "draft" | "cancelled";

export interface ScheduledSocialPost {
  id: string;
  title: string; // Business update headline or topic
  content: string; // The social post caption / body copy
  platforms: SocialPlatform[]; // Platforms targeted
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  scheduledTimestamp?: number; // Epoch timestamp for sorting & automated publishing
  status: SocialPostStatus;
  
  // Direct Product Link Integration
  productId?: string;
  productTitle?: string;
  productSlug?: string;
  productUrl?: string; // Direct link to product
  productPrice?: string;
  productImage?: string;
  callToAction?: string; // e.g. "Ürünü İncele & Sipariş Ver"
  includeUtmTags?: boolean;
  
  // Additional details
  hashtags?: string[];
  imageAttachment?: string;
  publishedAt?: string;
  publishedPostUrl?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface SocialSchedulerConfig {
  enabled: boolean;
  autoPublishSimulation: boolean;
  posts: ScheduledSocialPost[];
}

// Social Media Live Feed Integration (Instagram & X/Twitter)
export type SocialFeedPlatform = "instagram" | "twitter";
export type SocialFeedLayout = "grid" | "carousel" | "masonry";

export interface SocialFeedPost {
  id: string;
  platform: SocialFeedPlatform;
  authorName: string;
  authorHandle: string; // e.g. "@acme_official" or "@hizliweb"
  authorAvatar?: string;
  isVerified?: boolean;
  content: string; // Caption or tweet text
  mediaUrl?: string; // Photo / video thumbnail image
  mediaType?: "image" | "video" | "carousel";
  timestamp: string; // e.g. "2 saat önce", "Dün", "18 Mayıs"
  likesCount?: number;
  commentsCount?: number;
  retweetsCount?: number;
  postUrl: string; // Direct link to original post on instagram.com or x.com
  pinned?: boolean;
  hashtags?: string[];
}

export interface SocialMediaFeedConfig {
  enabled: boolean;
  badge: string; // e.g. "Canlı Sosyal Akış"
  title: string; // e.g. "Instagram & X'te Bizi Takip Edin"
  subtitle: string; // e.g. "En güncel çalışmalarımız, teslimatlarımız ve sektör yenilikleri sosyal medya hesaplarımızda."
  activePlatforms: SocialFeedPlatform[];
  layout: SocialFeedLayout; // "grid" | "carousel" | "masonry"
  postsLimit: number; // e.g. 6, 8, 12
  showEngagement: boolean; // Show likes, comments, retweets
  showCaptions: boolean; // Show text captions under media
  showPlatformBadges: boolean; // Show Instagram gradient / X black badge
  instagramHandle?: string; // e.g. "yildizotokurtarma"
  twitterHandle?: string; // e.g. "yildizkurtarma"
  instagramProfileUrl?: string;
  twitterProfileUrl?: string;
  instagramFollowers?: string; // e.g. "14.2K"
  twitterFollowers?: string; // e.g. "8.5K"
  posts: SocialFeedPost[];
  autoSyncInterval?: "hourly" | "daily" | "manual";
  lastSyncedAt?: string;
}

// Client Access Portal Types
export type ClientOrderStatus = "pending" | "in_progress" | "in_transit" | "completed" | "cancelled";

export interface ClientOrderTimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

export interface ClientOrder {
  id: string;
  orderNumber: string;
  title: string;
  serviceOrProduct: string;
  amount: string;
  status: ClientOrderStatus;
  startDate: string;
  estimatedCompletionDate: string;
  completedDate?: string;
  notes?: string;
  timeline?: ClientOrderTimelineItem[];
}

export type ClientDocumentCategory = "contract" | "invoice" | "spec" | "report" | "other";

export interface ClientDocument {
  id: string;
  title: string;
  category: ClientDocumentCategory;
  fileType: "pdf" | "docx" | "xlsx" | "image";
  fileSize: string;
  uploadDate: string;
  fileUrl?: string;
  downloadCount?: number;
  isPublicToClient: boolean;
  description?: string;
}

export interface PortalClient {
  id: string;
  name: string;
  company: string;
  email: string;
  password: string; // Secure client login credential
  phone: string;
  status: "active" | "suspended" | "pending";
  createdDate: string;
  lastLogin?: string;
  orders: ClientOrder[];
  documents: ClientDocument[];
  notes?: string;
}

export interface ClientAccessPortalConfig {
  enabled: boolean;
  portalTitle: string;
  portalWelcomeMessage: string;
  supportEmail?: string;
  supportPhone?: string;
  allowClientDownloads: boolean;
  requirePasswordChangeOnFirstLogin: boolean;
  clients: PortalClient[];
}

export interface HeaderConfig {
  logoType: "icon" | "image";
  logoImage?: string;
  logoHeight?: number; // e.g. 48px
  logoWidth?: number; // e.g. 180px or 0 for auto
  logoAspectRatio?: "auto" | "1/1" | "16/9" | "3/1" | "4/1";
  logoObjectFit?: "contain" | "cover" | "scale-down";
  showTextAlongsideLogo?: boolean; // If false when logoType is image, only image logo is shown without duplicate text
  showPhoneButton: boolean;
  phoneButtonText: string;
  showWhatsappButton: boolean;
  whatsappButtonText: string;
  showQuoteButton: boolean;
  quoteButtonText: string;
  navItems: HeaderNavItem[];
  showSocials?: boolean;
}

export interface GeneratedPageFile {
  filename: string; // e.g. "index.html", "kurumsal.html", "hizmetler.html", "hizmet-oto-kurtarma.html", "_headers"
  fileName?: string;
  title: string;
  type: "home" | "page" | "service-list" | "service-detail" | "catalog" | "product-detail" | "blog-list" | "blog-detail" | "contact" | "other";
  html: string;
  content?: string;
  slug: string;
  description: string;
}

export interface FooterConfig {
  aboutText: string;
  showSocials: boolean;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  copyrightText: string;
  column1Title: string;
  column2Title: string;
}

export type SolutionType = "corporate" | "association" | "candidate" | "ecommerce" | "portfolio";

export interface ThemeTemplate {
  id: string;
  name: string;
  sector: string;
  category: string;
  solutionType?: SolutionType;
  description: string;
  badge?: string;
  icon: string;
  coverImage: string;
  demoUrl?: string;
  siteTypePreference?: "single-page" | "multi-page" | "both";
  defaultColors: ColorPalette;
  defaultData: Partial<SiteConfig>;
}

export type SiteStructureType = "single-page" | "multi-page";

export interface CloudflareDeployment {
  subdomain: string;
  customDomain?: string;
  status: "idle" | "building" | "deployed" | "error";
  deployedUrl: string;
  lastDeployedAt?: string;
  sslActive: boolean;
  edgeRegionsCount: number;
  pageSpeedScore: number;
  dnsRecords: {
    type: "A" | "CNAME" | "TXT";
    name: string;
    content: string;
    proxyStatus: boolean;
    status: "verified" | "pending";
  }[];
  nameservers?: string[];
  sslMode?: "flexible" | "full" | "strict";
  alwaysUseHttps?: boolean;
  minTlsVersion?: "1.2" | "1.3";
  automaticHttpsRewrites?: boolean;
  dnsPropagationStatus?: "verified" | "propagating" | "unconfigured";
  apiConfig?: {
    accountId?: string;
    apiToken?: string;
    globalApiKey?: string;
    accountEmail?: string;
    zoneId?: string;
    projectName?: string;
    targetType?: "pages" | "workers-sites";
    autoPushEnabled?: boolean;
    lastApiCheckAt?: string;
  };
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface JsonLdSchemaConfig {
  enabled: boolean; // Global master toggle for schema injection
  autoInjectLocalBusiness: boolean; // Inject LocalBusiness/Organization schema
  autoInjectProducts: boolean; // Inject Product / ItemList schema
  autoInjectFaq: boolean; // Inject FAQPage schema from website faqs
  autoInjectBreadcrumbs: boolean; // Inject BreadcrumbList schema
  autoInjectWebSite: boolean; // Inject WebSite with SearchAction schema
  businessType?: string; // Schema.org specific type (LocalBusiness, AutoRepair, Dentist, etc.)
  priceRange?: string; // e.g. "₺₺", "₺₺₺"
  currency?: string; // e.g. "TRY"
  taxId?: string; // Vergi / Mersis Numarası
  foundingDate?: string; // Kuruluş Yılı
  founder?: string; // Kurucu
  areaServed?: string; // Hizmet Verilen Bölge (örn: İstanbul veya Tüm Türkiye)
  latitude?: string; // Geo Latitude (Enlem)
  longitude?: string; // Geo Longitude (Boylam)
  paymentAccepted?: string[]; // Nakit, Kredi Kartı, Banka Havalesi / EFT vb.
  aggregateRatingValue?: number; // e.g. 4.9
  aggregateReviewCount?: number; // e.g. 128
  customJsonLd?: string; // Optional custom user-defined JSON-LD snippet

  // Local SEO specific fields
  postalCode?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
  telephone?: string;
  departmentPhone?: string;
  openingHoursRaw?: string;
  openingHoursSchedule?: Array<{
    dayOfWeek: string[];
    opens: string;
    closes: string;
    closed?: boolean;
  }>;
  syncWithSiteConfig?: boolean;
}

export interface SiteConfig {
  id: string;
  templateId: string;
  solutionType: SolutionType;
  siteType: SiteStructureType; // Single page vs Multi page
  companyName: string;
  sector: string;
  slogan: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo?: string;
  googleMapsEmbed?: string;
  workingHours: string;
  customDomain?: string;
  
  // Theme styling
  palette: ColorPalette;
  fontFamily: string;
  borderRadius: string;

  // Header & Navigation Builder
  header: HeaderConfig;

  // Footer Builder
  footer: FooterConfig;

  // Social Media Links (Instagram, LinkedIn, Twitter/X in Header & Footer)
  socialMedia?: SocialMediaLinks;

  // Social Media Live Feed Integration (Instagram & X/Twitter Posts directly on landing page)
  socialFeed?: SocialMediaFeedConfig;

  // Social Media Post Scheduler (Automated queued posts with direct product links)
  socialScheduler?: SocialSchedulerConfig;

  // Client Access Portal (Client secure login credentials, order status & project documents)
  clientPortal?: ClientAccessPortalConfig;

  // Homepage Section Builder & Ordering
  homepageSections: HomepageSectionConfig[];

  // Hero & Slider Section
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    bgImage: string;
    bgImageAlt?: string;
    logoAlt?: string;
    slides?: HeroSlide[];
    stats: { label: string; value: string }[];
  };

  // Multi-Page & Content Modules
  pages: CustomPageItem[];
  
  products: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    ctaButtonText: string;
    categories?: ProductCategory[];
    items: ProductItem[];
    contactForm?: CustomFormConfig;
  };

  blogCategories?: BlogCategory[];
  blog: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    categories?: BlogCategory[];
    items: BlogPostItem[];
  };

  // Leads & Forms from website
  leads: FormLead[];
  leadTagDefinitions?: LeadCustomTag[]; // Custom color-coded labels/tags registered across site

  // Cloudflare & Domain
  cloudflare: CloudflareDeployment;

  about: {
    enabled: boolean;
    badge: string;
    title: string;
    content: string; // rich text HTML
    yearsExperience: string;
    completedProjects: string;
    bullets: string[];
    image: string;
    imageAlt?: string;
    altText?: string;
  };

  services: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    items: ServiceItem[];
  };

  whyUs: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    items: { id: string; title: string; desc: string; icon: string }[];
  };

  gallery: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    items: GalleryItem[];
    layout?: "masonry" | "grid";
    columns?: 2 | 3 | 4;
    enableLightbox?: boolean;
    categories?: string[];
  };

  pricing: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    items: PricingPlan[];
  };

  testimonials: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    items: TestimonialItem[];
    showRatingStats?: boolean;
    googleRatingBadge?: boolean;
  };

  faqs: FaqSectionConfig;
  faq?: FaqSectionConfig;

  contact: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    showMap: boolean;
    showForm: boolean;
  };

  // Newsletter & Email Marketing
  newsletter?: NewsletterConfig;
  subscribers?: NewsletterSubscriber[];

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    author: string;
    schemaType: string;
    ogImage?: string;
    canonicalUrl?: string;
    googleSearchConsoleTag?: string;
    twitterHandle?: string;
    robots?: string;
    imageAltMap?: Record<string, string>;
    schemaConfig?: JsonLdSchemaConfig;
  };

  // Central Visual Asset & Logo/Favicon Management
  favicon?: string;
  customAssets?: SiteAsset[];

  // Individual Page SEO Overrides & Canonical URL Registry
  pageSeoOverrides?: Record<string, PageSeoOverrideItem>;

  // WhatsApp Floating Chat Widget Configuration
  whatsappWidget?: WhatsAppWidgetConfig;

  // Vergi & KDV Fiyatlandırma Yönetimi
  taxPricing?: TaxPricingConfig;

  // Dinamik Form Yönetimi (Açılır menüler, Onay kutuları, Dosya yükleme)
  customForm?: CustomFormConfig;

  // Site Kataloğu İletişim & Özel Teklif Formu ("Contact Us" with Custom Fields)
  catalogContactForm?: CustomFormConfig;

  // Otomatik 'Teşekkürler' E-Postası (Autoresponder) & E-Posta Yakalama
  leadThankYouEmail?: LeadThankYouEmailConfig;
  emailAuditLogs?: EmailAuditLogEntry[];

  // Dil Ayarları & Çoklu Dil Yönetimi (i18n)
  languages?: MultiLanguageConfig;

  // A/B Testi: Hero Varyasyonları & Form Dönüşüm Takibi
  abTesting?: AbTestExperiment;

  // Medya Kütüphanesi & Cloudflare Edge Görsel Optimizasyonu
  mediaLibrary?: MediaLibraryItem[];

  // Web Güvenlik Denetimi, AI Açık Taraması & Güvenlik Başlıkları
  securityConfig?: SecurityConfig;

  // Yüksek Öncelikli Talep Bildirimleri (Slack & E-posta) ve Lead Puanlama
  leadNotifications?: LeadNotificationsConfig;

  // İnaktif Müşteri Taleplerini Otomatik Arşivleme Ayarı (30+ gün kuralı)
  leadAutoArchive?: LeadAutoArchiveConfig;

  // 0.02s Hedefi Performans Optimizasyon Ayarları
  performanceOptimizations?: PerformanceOptimizationSettings;

  // Lead Otomasyon Kuralları (Skora, Kaynağa ve İletişim Kanalına Göre Otomatik Aksiyonlar)
  leadAutomations?: LeadAutomationConfig;

  // Pazarlama Otomasyonu: E-Bülten Kaynak Analizi & Otomatik Hoş Geldin E-Postası
  marketingAutomation?: MarketingAutomationConfig;

  // Pazarlama Kaynak Dağılımı (Marketing Source Attribution) & ROI Optimizasyonu (D3.js)
  marketingAttribution?: MarketingAttributionConfig;

  // Popüler CRM Servisleri (HubSpot, Salesforce, Zoho, Pipedrive, Webhook) Entegrasyon Ayarları
  crmIntegrations?: CrmIntegrationConfig;

  // SEO Düzeltme Paneli Sonuçları & İlerleme Bildirim Sistemi (Rank Tracker & Notification Feed)
  seoProgressNotifications?: SeoProgressNotificationConfig;

  // Otomatik JSON-LD Schema.org Yapılandırılmış Veri Motoru (LocalBusiness, Product, FAQ)
  schemaConfig?: JsonLdSchemaConfig;

  // Performans Kritik Uyarı Sistemi (Dönüşüm Düşüşü & Trafik Anomali Dedektörü)
  performanceAlerts?: PerformanceAlertSettings;

  // SEO Health Score Otomatik Günlük Denetim Aracı & Tek Tıkla Onarım Kuyruğu
  seoAuditConfig?: SeoAutomatedAuditConfig;

  // AI Pricing Intelligence (Historical Conversion Data & Competitive Tier Optimization)
  pricingIntelligence?: PricingIntelligenceData;

  // Manuel Eklenen & Canlı İzlenen Rakip URL Listesi
  monitoredCompetitors?: MonitoredCompetitorUrlItem[];
}

// ==========================================
// PAZARLAMA OTOMASYONU & E-BÜLTEN HOŞ GELDİN TİPLERİ
// ==========================================
export interface NewsletterWelcomeEmailConfig {
  enabled: boolean;
  senderName: string; // e.g. "Yıldız Oto Kurtarma Ekibi"
  senderEmail: string; // e.g. "bulten@yildizotokurtarma.com.tr"
  replyToEmail?: string;
  triggerEvent: "on_subscribe";
  sourceFilter: string[]; // ["all"] or specific sources like ["Footer Formu", "Ana Sayfa Teklif Formu", "Hızlı Teklif Modülü"]
  sendDelayMinutes: number; // 0 for instant, 5, 15, 60
  subject: string;
  preheader?: string;
  heading: string;
  bodyText: string;
  offerDiscountCode?: string; // e.g. "HOSGELDIN10"
  offerDiscountPercent?: number; // e.g. 10
  discountExpiryDays?: number; // e.g. 14
  ctaButtonText: string;
  ctaButtonUrl: string;
  includeSocialLinks?: boolean;
  includeUnsubscribeLink?: boolean;
  accentColor?: string; // e.g. "#4f46e5"
}

export interface MarketingAutomationExecutionLog {
  id: string;
  subscriberId: string;
  subscriberEmail: string;
  subscriberName?: string;
  source: string;
  sentAt: string;
  status: "delivered" | "opened" | "clicked" | "failed";
  subject: string;
  openRateTracked?: boolean;
  clickUrl?: string;
  discountCodeUsed?: boolean;
}

export interface MarketingAutomationConfig {
  enabled: boolean;
  welcomeEmail: NewsletterWelcomeEmailConfig;
  executionLogs: MarketingAutomationExecutionLog[];
  autoTagSubscribers?: boolean;
  defaultTags?: string[];
}

export interface NewsletterSourceAttribution {
  sourceName: string;
  totalSubscribers: number;
  activeSubscribers: number;
  conversionRate: number; // % converted to customer or qualified lead
  convertedLeadsCount: number;
  totalRevenueGenerated: number;
  avgOrderValue: number;
  isTopPerformer?: boolean;
  badge?: string;
  growthRate?: string;
  welcomeEmailDeliveryRate: number;
  avgDecisionMinutes: number;
}

export type LeadAcquisitionSource = "organic" | "ads" | "social" | "direct" | "referral" | "all";
export type LeadCommunicationChannel = "form" | "whatsapp" | "phone" | "email" | "all";

export interface LeadAutomationCondition {
  // Skor Kriteri
  scoreFilterType: "any" | "gte" | "lte" | "tier"; // gte: >= minScore, lte: <= maxScore, tier: high/medium/low
  minScore?: number; // Varsayılan eşik örn. 70
  maxScore?: number; // Varsayılan eşik örn. 40
  scoreTier?: "high" | "medium" | "low"; // high (70-100), medium (40-69), low (0-39)

  // Edinme Kaynağı (Organik SEO, Google Reklamları, Sosyal Medya vb.)
  sources: LeadAcquisitionSource[];

  // İletişim Kanalı (Form, WhatsApp, Telefon Araması vb.)
  channels: LeadCommunicationChannel[];

  // İlave Filtreler (Opsiyonel)
  minDealValue?: number; // Minimum bütçe / ciro eşiği
  keywords?: string[]; // Mesaj veya hizmette aranan anahtar kelimeler
}

export interface LeadAutomationActionConfig {
  // 1. CRM'e Aktar / Etiketle / Temsilciye Ata
  crm: {
    enabled: boolean;
    tagsToAdd: string[]; // e.g. ["🔥 VIP Sıcak Lead", "Google Ads Dönüşümü"]
    updateStatus?: "new" | "contacted" | "offered" | "closed" | "none";
    assignedAgent?: string; // e.g. "Kıdemli Satış Uzmanı", "7/24 Nöbetçi Ekip"
    internalNote?: string; // Otomatik eklenen dahili not
    markUrgent?: boolean;
  };

  // 2. Özel E-posta Tetikle (Müşteriye Karşılama veya Ekibe Bilgilendirme)
  email: {
    enabled: boolean;
    recipientType: "lead" | "staff" | "both";
    staffEmails?: string; // e.g. "satis@hizliweb.com"
    subjectTemplate: string; // e.g. "Talebiniz Alındı: {service}"
    bodyTemplate: string; // E-posta şablon metni ({customer_name}, {service}, {score} vb.)
    sendBrochureAttachment?: boolean;
  };

  // 3. Yöneticiye Bildirim Gönder (Slack, E-posta, Anlık Panel Uyarısı)
  notification: {
    enabled: boolean;
    channels: ("email" | "slack" | "in_app")[];
    managerEmails: string; // e.g. "yonetici@sirket.com"
    slackChannel?: string; // e.g. "#leads-urgent"
    alertTitle: string; // e.g. "🚨 Yeni Yüksek Öncelikli Lead Uyarısı"
    includeFullDetails: boolean;
  };

  // 4. Harici Webhook / Entegrasyon (Zapier, Make, Harici CRM)
  webhook?: {
    enabled: boolean;
    url: string;
    secretToken?: string;
  };
}

export interface LeadAutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  conditions: LeadAutomationCondition;
  actions: LeadAutomationActionConfig;
}

export interface LeadAutomationExecutionLog {
  id: string;
  timestamp: string;
  ruleId: string;
  ruleName: string;
  leadId: string;
  leadName: string;
  leadScore: number;
  leadSource: string;
  leadChannel: string;
  actionsExecuted: string[];
  status: "success" | "warning" | "failed";
  details?: string;
}

export interface LeadAutomationConfig {
  enabled: boolean;
  autoTriggerOnNewLead: boolean;
  rules: LeadAutomationRule[];
  executionLogs: LeadAutomationExecutionLog[];
}

export interface LeadAutoArchiveConfig {
  enabled: boolean; // default: true
  daysInactive: number; // default: 30 days
  targetStatuses: ("new" | "contacted")[]; // default: ["new", "contacted"]
  autoTag?: string; // e.g. "30+ Gün İnaktif"
  notifyOnArchive?: boolean; // default: true
  lastRunAt?: string; // ISO date string when auto-archive last executed
  totalArchivedCount?: number; // cumulative count of auto-archived leads
}

export interface SlackNotificationConfig {
  enabled: boolean;
  webhookUrl: string; // e.g. "https://hooks.slack.com/services/..."
  channelName?: string; // e.g. "#leads-alerts"
  botName?: string; // e.g. "JetKur CRM Bot"
  customMessageTemplate?: string; // Markdown template with placeholders
}

export interface EmailLeadNotificationConfig {
  enabled: boolean;
  recipientEmails: string; // Comma-separated emails: "sales@firm.com, manager@firm.com"
  subjectTemplate?: string; // Subject with {customer_name}, {score}, {service}
  senderName?: string; // e.g. "JetKur Lead Alert"
}

export interface LeadScoringConfig {
  minScoreForHighPriority: number; // default 70 (0-100)
  highDealValueThreshold: number; // default 2500 TL
  urgentKeywords: string[]; // default ["acil", "hemen", "bugün", "fiyat", "teklif", "bütçe", "kurumsal", "filo", "randevu"]
  highPriorityTags: string[]; // default ["VIP", "Acil", "Kurumsal", "Yüksek Bütçe", "Sıcak Takip"]
  requirePhoneForHighPriority?: boolean; // default true
}

export interface LeadNotificationLog {
  id: string;
  timestamp: string; // ISO or formatted date
  leadId: string;
  customerName: string;
  phone?: string;
  service: string;
  score: number;
  priority: "high" | "medium" | "low";
  channel: "slack" | "email" | "both";
  status: "sent" | "simulated" | "failed";
  details: string;
  reasons: string[];
}

export interface LeadNotificationsConfig {
  enabled: boolean;
  notifyOnlyHighPriority: boolean; // true: only score >= threshold triggers alerts; false: all leads
  slack: SlackNotificationConfig;
  email: EmailLeadNotificationConfig;
  scoring: LeadScoringConfig;
  history?: LeadNotificationLog[];
}

export interface PerformanceOptimizationSettings {
  webpAutoConversion: boolean; // Cloudflare Polish WebP / AVIF
  avifAutoConversion?: boolean; // Modern next-gen AVIF compression
  generateOptimizedThumbnails?: boolean; // Multi-size responsive thumbnails (120w, 320w, 640w, 1080w)
  enforceExplicitImageDimensions?: boolean; // Prevent CLS by reserving width/height & aspect-ratio
  lazyLoadImages: boolean; // native loading="lazy" on all below-fold assets
  fontDisplaySwap: boolean; // font-display: swap + preconnect to Google/Bunny Fonts
  criticalCssInlining: boolean; // Inline critical above-fold CSS
  htmlMinification: boolean; // Whitespace & comment stripping
  brotliCompression: boolean; // Brotli level 11 + Zstandard compression
  http3Quic: boolean; // HTTP/3 QUIC 0-RTT handshakes
  earlyHints103: boolean; // 103 Early Hints preloading critical assets
  zeroRenderBlocking: boolean; // Defer non-critical JS/CSS
  edgeCacheTtlDays: number; // Cloudflare Edge Browser Cache TTL (e.g. 365 days)
}

export interface SecurityHeaderItem {
  name: string;
  recommendedValue: string;
  currentValue?: string;
  status: "pass" | "warning" | "fail";
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  fixAction?: string;
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  category: "headers" | "ssl" | "form_protection" | "xss_injection" | "information_disclosure" | "ddos_edge";
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  impact: string;
  recommendation: string;
  status: "open" | "resolved" | "mitigated";
  autoFixAvailable: boolean;
}

export interface SecurityAuditResult {
  scanDate: string;
  targetDomain: string;
  overallScore: number; // 0-100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  categoryScores: {
    headers: number;
    ssl: number;
    forms: number;
    disclosure: number;
    edge: number;
  };
  headersAudit: SecurityHeaderItem[];
  vulnerabilities: SecurityVulnerability[];
  autoHardened: boolean;
  recommendations: string[];
}

export interface SecurityConfig {
  enabled: boolean;
  lastAudit?: SecurityAuditResult;
  enforceHsts?: boolean;
  enableCsp?: boolean;
  enableXFrameOptions?: boolean;
  enableContentTypeNosniff?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
  formHoneypotProtection?: boolean;
  formRateLimiting?: boolean;
  blockBadBots?: boolean;
  hideServerSignature?: boolean;
}

// ==========================================
// PERFORMANS KRİTİK UYARI SİSTEMİ (ANOMALİ DEDEKTÖRÜ)
// ==========================================
export type PerformanceAnomalySeverity = "critical" | "warning" | "info";

export type PerformanceAnomalyType = 
  | "conversion_rate_drop" 
  | "traffic_source_drop" 
  | "bot_spam_surge" 
  | "mobile_conversion_disparity" 
  | "ttfb_edge_spike";

export interface PerformanceCriticalAlert {
  id: string;
  type: PerformanceAnomalyType;
  severity: PerformanceAnomalySeverity;
  title: string;
  description: string;
  metricName: string;
  baselineValue: string; // e.g. "%14.6" or "1,450 / gün"
  currentValue: string;  // e.g. "%2.1" or "620 / gün"
  percentageChange: number; // e.g. -85.6 or -57.2
  detectedAt: string;
  affectedPageOrSource: string; // e.g. "İletişim Formu (/iletisim)" or "Google Organik Arama"
  rootCauses: string[];
  recommendedFixAction: string;
  actionButtonText: string;
  actionTab?: CustomerPanelTab;
  isResolved?: boolean;
  isDismissed?: boolean;
  estimatedLostLeadsOrRevenue?: string;
  autoFixAvailable?: boolean;
}

export interface PerformanceAlertSettings {
  isEnabled: boolean;
  conversionDropThresholdPercent: number; // default: 30 (%)
  trafficDropThresholdPercent: number; // default: 25 (%)
  notifyEmail: boolean;
  notifySmsOrWhatsApp: boolean;
  notifyInAppToast: boolean;
  emailRecipient?: string;
  phoneRecipient?: string;
  lastAnomalyCheckTimestamp?: string;
}

// ==========================================
// CORE WEB VITALS REAL-TIME PERFORMANCE ALERT SYSTEM
// ==========================================
export type CoreVitalMetric = "LCP" | "CLS" | "FID";

export interface CoreWebVitalsThresholds {
  lcpPoor: number; // default: 4.0s (Google Poor: > 4.0s)
  clsPoor: number; // default: 0.25 (Google Poor: > 0.25)
  fidPoor: number; // default: 300ms (Google Poor: > 300ms)
  lcpWarning?: number; // 2.5s (Google Needs Improvement: 2.5 - 4.0s)
  clsWarning?: number; // 0.10 (Google Needs Improvement: 0.10 - 0.25)
  fidWarning?: number; // 100ms (Google Needs Improvement: 100 - 300ms)
}

export interface CoreWebVitalsAlertItem {
  id: string;
  metric: CoreVitalMetric;
  metricLabel: string;
  currentValue: number;
  threshold: number;
  unit: string;
  status: "poor" | "critical" | "warning";
  timestamp: string; // ISO string
  formattedTime: string;
  affectedUrl: string;
  device: "mobile" | "desktop";
  message: string;
  recommendation: string;
  isRead: boolean;
  isDismissed: boolean;
}

export interface CoreWebVitalsAlertConfig {
  isRealtimeMonitoringEnabled: boolean;
  browserNotificationsEnabled: boolean;
  soundEnabled: boolean;
  inAppToastEnabled: boolean;
  pollIntervalSeconds: number; // e.g. 8s
  thresholds: CoreWebVitalsThresholds;
  cooldownSeconds: number; // default 60s per metric
}

// ==========================================
// SEO HEALTH SCORE OTOMATİK DENETİM AYARLARI
// ==========================================
export interface SeoAutomatedAuditConfig {
  isDailyScanEnabled: boolean;
  lastDailyScanDate?: string;
  lastCalculatedScore?: number;
  autoFixQueueMode?: "manual" | "auto_apply";
  ignoredRuleIds?: string[];
  scanScope?: {
    checkBrokenLinks: boolean;
    checkMissingMetaDescriptions: boolean;
    checkImageAltText: boolean;
  };
}

export interface MediaVariant {
  label: string; // e.g. "Thumb (300w)", "Mobile (640w)", "Tablet (1080w)", "Desktop (1920w)"
  width: number;
  height: number;
  sizeBytes: number;
  url: string;
}

export interface MediaLibraryItem {
  id: string;
  name: string;
  originalName: string;
  url: string; // primary optimized WebP/JPEG data URL or CDN URL
  thumbnailUrl?: string;
  avifUrl?: string; // High-compression AVIF format data URL or CDN URL
  webpUrl?: string; // Universally compatible WebP format data URL or CDN URL
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  savedBytes: number;
  savingsPercentage: number;
  width: number;
  height: number;
  aspectRatio?: string; // e.g. "16 / 9" for CLS layout stability
  format: "webp" | "jpeg" | "png" | "avif" | "svg";
  category: "hero" | "product" | "gallery" | "service" | "blog" | "logo" | "general";
  uploadedAt: string;
  cloudflareEdgeUrl?: string;
  edgePolishStatus?: "applied" | "lossy" | "lossless" | "webp_auto";
  variants?: MediaVariant[];
  altText?: string;
  tags?: string[];
  usedIn?: string[];
  coreWebVitals?: {
    lcpPotential: boolean;
    lcpMsSaved: number;
    clsSafe: boolean;
    recommendedLoading: "lazy" | "eager";
    recommendedFetchPriority: "high" | "auto" | "low";
  };
  aiOptimization?: {
    suggestedAlt: string;
    recommendedFormat: "avif" | "webp" | "svg";
    qualityAssessment: string;
    potentialSavingsPercent: number;
  };
}

export interface LanguageDefinition {
  code: string; // "tr", "en", "de", "ar", "fr", "ru"
  name: string; // "Türkçe", "İngilizce", "Almanca", "Arapça"
  nativeName: string; // "Türkçe", "English", "Deutsch", "العربية"
  flag: string; // "🇹🇷", "🇬🇧", "🇩🇪", "🇸🇦"
  direction: "ltr" | "rtl"; // RTL for Arabic
  enabled: boolean;
  isDefault?: boolean;
}

export interface SiteTranslations {
  companyName?: string;
  slogan?: string;
  city?: string;
  workingHours?: string;
  aboutTitle?: string;
  aboutContent?: string;
  aboutBadge?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaPrimary?: string;
  heroCtaSecondary?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  servicesBadge?: string;
  productsTitle?: string;
  productsSubtitle?: string;
  productsBadge?: string;
  galleryTitle?: string;
  gallerySubtitle?: string;
  galleryBadge?: string;
  testimonialsTitle?: string;
  testimonialsSubtitle?: string;
  testimonialsBadge?: string;
  faqsTitle?: string;
  faqsSubtitle?: string;
  faqsBadge?: string;
  contactTitle?: string;
  contactSubtitle?: string;
  contactBadge?: string;
  footerRights?: string;

  // Navigation Items
  navHome?: string;
  navAbout?: string;
  navServices?: string;
  navCatalog?: string;
  navGallery?: string;
  navBlog?: string;
  navContact?: string;
  phoneBtn?: string;
  whatsappBtn?: string;
  quoteBtn?: string;

  // Dynamic Item-level maps
  services?: Record<string, { title: string; desc: string; longContent?: string }>;
  products?: Record<string, { title: string; description: string; shortDescription?: string; badge?: string }>;
  faqs?: Record<string, { q: string; a: string }>;
  pages?: Record<string, { title: string; content: string }>;

  // General UI labels
  ui?: Record<string, string>;
}

export interface MultiLanguageConfig {
  enabled: boolean;
  defaultLanguage: string; // e.g. "tr"
  activeLanguages: LanguageDefinition[];
  translations: Record<string, SiteTranslations>;
  switcherPosition: "header-right" | "header-nav" | "floating-bottom" | "both";
  switcherStyle: "dropdown" | "pills" | "flags-only" | "compact-select";
  autoDetectBrowserLanguage: boolean;
  enableRtlForArabic: boolean;
}

export interface TaxPricingConfig {
  enabled: boolean;
  defaultVatRate: number; // e.g. 20 (%20), 10 (%10), 1 (%1), 0 (%0)
  priceIncludesVat: boolean; // true = Fiyatlar KDV Dahildir, false = Fiyatlar KDV Hariçtir (+KDV eklenir)
  displayVatBadge: boolean; // Sitede "(KDV Dahil)" veya "(+KDV)" rozeti gösterilsin mi?
  displayTaxBreakdown: boolean; // Ürün detay sayfasında matrah ve KDV tutarı dökümü tablosu gösterilsin mi?
  roundingMethod?: "standard" | "ceil" | "exact"; // Yuvarlama biçimi
  vatExemptNotice?: string; // Muafiyet veya genel fatura bilgilendirme notu
  currencySymbol?: string; // "₺", "$", "€" vb.
  currencyPosition?: "suffix" | "prefix"; // "1.250 ₺" vs "₺1.250"
  customRates?: number[]; // [20, 10, 1, 0]
}

export interface WhatsAppWidgetConfig {
  enabled: boolean;
  phoneNumber: string; // Business WhatsApp phone number, e.g. "905320000000" or "+90 532 000 00 00"
  position?: "bottom-right" | "bottom-left";
  buttonStyle?: "floating-pill" | "floating-circle";
  buttonText?: string; // e.g. "WhatsApp İle Yazın"
  defaultMessage?: string; // Pre-filled initial greeting message
  agentName?: string; // e.g. "Müşteri Temsilcisi"
  agentSubtitle?: string; // e.g. "Genellikle anında yanıt verir"
  popupEnabled?: boolean; // Interactive chat bubble popup card
  callToAction?: string; // e.g. "Merhaba 👋 Size nasıl yardımcı olabiliriz?"
  showBadgeDot?: boolean; // Green pulsing online dot
}

export interface QuickStartDesignSet {
  id: string;
  name: string;
  sector: string;
  tagline: string;
  badge: string;
  description: string;
  icon: string;
  previewGradient: string;
  fontFamily: string;
  fontName: string;
  borderRadius: string;
  spacingDensity: "compact" | "balanced" | "spacious";
  siteType: SiteStructureType;
  palette: ColorPalette;
  headerStyle: {
    showPhoneButton: boolean;
    phoneButtonText: string;
    showWhatsappButton: boolean;
    whatsappButtonText: string;
    showQuoteButton: boolean;
    quoteButtonText: string;
  };
  heroPreset: {
    badge: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  recommendedSections: {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
  }[];
}

export type PlatformView =
  | "marketing"
  | "wizard"
  | "customer-panel"
  | "admin-panel"
  | "preview"
  | "deploy"
  | "strategy"
  | "ai-factory"
  | "catalog";

// ==========================================
// INDIVIDUAL PAGE SEO & CANONICAL REGISTRY TYPES
// ==========================================
export interface PageSeoOverrideItem {
  canonicalUrl?: string;
  isCustomCanonical?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  schemaType?: string;
  twitterCard?: "summary_large_image" | "summary";
  lastModified?: string;
}

export interface IndividualPageSeoMeta {
  pageId: string; // e.g. "page-home", "page-about", "page-contact", "service-123", "product-123", "blog-123", "page-123"
  pageTitle: string;
  pageType: "home" | "about" | "contact" | "services-index" | "service" | "catalog-index" | "product" | "blog-index" | "blog-post" | "custom-page";
  slug: string;
  fullUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  isCustomCanonical: boolean;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  robots: string;
  schemaType: string;
  twitterCard: "summary_large_image" | "summary";
  lastModified?: string;
}

export type CustomerPanelTab =
  | "general"
  | "asset-manager"
  | "media-library"
  | "ai-image-optimizer"
  | "social-media"
  | "social-feed"
  | "social-scheduler"
  | "social-post-scheduler"
  | "seo"
  | "seo-report"
  | "seo-heatmap"
  | "seo-opportunities"
  | "seo-opportunity-alerts"
  | "page-seo"
  | "seo-health"
  | "seo-auditor"
  | "meta-auditor"
  | "seo-content-optimizer"
  | "ai-content-meta-optimizer"
  | "ai-meta-optimizer"
  | "schema-generator"
  | "local-seo-schema"
  | "seo-progress"
  | "seo-notifications"
  | "services"
  | "testimonials"
  | "catalog"
  | "gallery"
  | "faqs"
  | "blog"
  | "ai-blog-engine"
  | "pages"
  | "design-structure"
  | "design-presets"
  | "leads"
  | "client-portal"
  | "client-access-portal"
  | "form-management"
  | "email-automation"
  | "email-automation-settings"
  | "email-automations"
  | "automated-responses"
  | "automated-response-history"
  | "newsletter"
  | "notifications"
  | "performance"
  | "site-health"
  | "site-health-performance"
  | "hosting-package"
  | "ai-writer"
  | "header-nav"
  | "homepage-builder"
  | "footer"
  | "site-type"
  | "connect-custom-domain"
  | "cloudflare-domain"
  | "custom-domain"
  | "domain-management"
  | "design"
  | "backups"
  | "qr-code"
  | "whatsapp-chat"
  | "performance-analytics"
  | "tax-pricing"
  | "ab-testing"
  | "languages"
  | "media-library"
  | "security-audit"
  | "automated-dns"
  | "cloudflare-edge-guide"
  | "performance-monitor"
  | "lead-insights"
  | "lead-automations"
  | "lead-mapping"
  | "customer-journey"
  | "journey-mapping"
  | "marketing-automation"
  | "marketing-attribution"
  | "attribution"
  | "lead-forecasting"
  | "system-logs"
  | "system-log"
  | "competitive-seo"
  | "competitive-alerts"
  | "realtime-traffic"
  | "performance-forecaster"
  | "pricing-intelligence"
  | "ai-pricing"
  | "global-seo"
  | "ai-global-seo"
  | "catalog-contact"
  | "crm-integration"
  | "bulk-seo-export"
  | "seo-bulk-export"
  | "performance-trends"
  | "advanced-performance-trends"
  | "performance-insights"
  | "user-auth"
  | "user-management"
  | "coolify-deployment"
  | "vps-deployment"
  | "ai-content-planner"
  | "seo-content-planner"
  | "seo-trend-forecast"
  | "trend-forecast"
  | "ai-seo-content-assistant"
  | "seo-content-assistant"
  | "competitive-strategy"
  | "seo-competitive-strategy"
  | "competitor-analysis"
  | "competitor-url-analysis"
  | "competitor-comparison"
  | "competitor-comparison-dashboard"
  | "content-gap-map"
  | "content-gap"
  | "market-share-panel"
  | "market-share-benchmark"
  | "market-share"
  | "local-seo-map"
  | "local-pack"
  | "seo-executive-summary"
  | "executive-summary";

// ==========================================
// PAZAR PAYI KIYASLAMA TABLOSU (MARKET SHARE BENCHMARK & DIRECT COMPETITOR COMPARISON)
// ==========================================

export interface MarketShareCompetitorData {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  rank: number;
  marketSharePercent: number; // e.g. 24.5
  marketShareLabel: string;   // e.g. "%24.5"
  estimatedMonthlyVisits: number; // e.g. 6800
  estimatedMonthlyVisitsLabel: string; // e.g. "6.8K"
  
  // 1. Domain Otoritesi Metrikleri
  domainAuthority: number; // 0-100 (DA)
  pageAuthority: number;   // 0-100 (PA)
  backlinksCount: number;  // e.g. 1420
  referringDomains: number; // e.g. 185
  spamScore: number;       // e.g. 1 (%)
  daDeltaVsUser: number;   // positive if competitor is higher
  
  // 2. Anahtar Kelime Yoğunluğu Metrikleri
  keywordDensityScore: number; // 0-100 overall score
  avgKeywordDensityPercent: number; // e.g. 2.1% (ideal) vs 3.8% (stuffed) vs 1.1% (sparse)
  densityStatus: "İdeal (%1.8 - %2.5)" | "Aşırı Yoğun (Spam Riski)" | "Yetersiz Yoğunluk";
  top3KeywordsCount: number;   // e.g. 84
  top10KeywordsCount: number;  // e.g. 312
  semanticCoveragePercent: number; // e.g. 78%
  h1H3HierarchyScore: number; // 0-100
  
  // 3. Site Hızı & Core Web Vitals Metrikleri
  siteSpeedScore: number; // 0-100 Google PageSpeed
  mobileSpeedScore: number; // 0-100 Mobile
  desktopSpeedScore: number; // 0-100 Desktop
  lcpSeconds: number; // Largest Contentful Paint (e.g. 1.2s vs 3.4s)
  ttfbMs: number;     // Time to First Byte (e.g. 68ms vs 480ms)
  clsScore: number;   // Cumulative Layout Shift (e.g. 0.02 vs 0.18)
  speedGrade: "Mükemmel (A+)" | "İyi (B)" | "Yavaş (C)" | "Kritik Yavaş (D)";
  techStack: string;  // e.g. "Vite + Cloudflare Edge CDN" vs "Ağır WordPress / Apache"
  
  // Niteliksel Analiz & Taktikler
  keyAdvantage: string;
  mainVulnerability: string;
  tacticalCounterMove: string;
  isCustom?: boolean;
}

export interface MarketShareBenchmarkSummary {
  analyzedAt: string;
  sector: string;
  city: string;
  totalMarketVolume: string;
  userRank: number;
  userMarketShare: number;
  leaderMarketShare: number;
  daGapVsLeader: number;
  speedAdvantageVsLeader: number; // positive = user is faster
  keywordCoverageGapVsLeader: number;
  topTakeaway: string;
}

// ==========================================
// CANLI RAKİP LİSTESİ VE ANLIK VERİ FETCH YÖNETİMİ
// ==========================================

export interface MonitoredCompetitorUrlItem {
  id: string;
  name: string;
  url: string;
  domain: string;
  sector?: string;
  category?: "Doğrudan Rakip" | "Bölgesel Rakip" | "Ulusal Lider" | "Fiyat Kırıcı" | "Niş Rakip";
  addedAt: string;
  lastFetchedAt: string | null;
  fetchStatus: "idle" | "fetching" | "success" | "error";
  httpStatusCode?: number; // 200, 301, etc.
  serverType?: string; // e.g. "Cloudflare / Edge", "Nginx / Ubuntu", "LiteSpeed"
  sslValid?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
  wordCount?: number;
  domainAuthority?: number; // 0-100
  pageAuthority?: number;   // 0-100
  siteSpeedScore?: number;  // 0-100
  mobileSpeedScore?: number;
  desktopSpeedScore?: number;
  lcpSeconds?: number;
  ttfbMs?: number;
  estimatedMonthlyVisits?: number;
  marketSharePercent?: number;
  backlinksCount?: number;
  referringDomains?: number;
  spamScore?: number;
  topKeywords?: string[];
  schemaTypes?: string[];
  notes?: string;
  isActive: boolean;
  color?: string;
}

// ==========================================
// YEREL SEO KONUM HARİTASI (LOCAL PACK & GEO VISIBILITY)
// ==========================================

export interface LocalCompetitorPin {
  id: string;
  name: string;
  isUser: boolean;
  latitude: number;
  longitude: number;
  district: string;
  city: string;
  address: string;
  phone: string;
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 142
  localPackRank: number; // 1, 2, 3 in Google 3-Pack, or >3
  inTop3LocalPack: boolean;
  localSearchVolume: number; // estimated monthly local queries in this radius
  primaryLocalKeyword: string; // e.g. "Kadıköy oto çekici"
  gmbVerified: boolean;
  hasCitations: boolean;
  citationScore: number; // 0-100
  geoRadiusKm: number; // estimated effective service radius
  topLocalAdvantage: string;
  gmbGaps: string[]; // e.g. ["Eksik çalışma saatleri", "Fotoğraf güncelliği az"]
}

export interface LocalDistrictSearchVolume {
  districtName: string;
  monthlySearchVolume: number;
  competitorDensity: "Yüksek" | "Orta" | "Düşük";
  userLocalPackRank: number; // 1, 2, 3 or 4+
  opportunityScore: number; // 0-100
  primaryKeyword: string;
  topCompetitorName: string;
}

export interface LocalSeoMapSummary {
  city: string;
  sector: string;
  userRank: number;
  totalLocalMonthlyVolume: number;
  top3PackCoveragePercent: number; // % of target districts where user is in top 3
  bestPerformingDistrict: string;
  highestOpportunityDistrict: string;
  gmbAuditScore: number; // 0-100
  reviewGapVsLeader: number;
  tacticalAction: string;
}

// ==========================================
// SEO COMPETITIVE STRATEGY VISUALIZER (D3.js RADAR CHART)
// ==========================================

export interface CompetitiveRadarAxisDef {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  unit: string;
  idealRange: string;
  fullMark: number;
}

export interface CompetitiveStrategyEntity {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  color: string;
  fillColor: string;
  strokeDash?: string;
  rank: number;
  marketShare: string;
  metrics: {
    domainAuthority: number; // 0-100 (Alan Adı Otoritesi)
    keywordDensity: number;  // 0-100 (Anahtar Kelime Yoğunluğu & Semantik Optimizasyon)
    siteSpeed: number;       // 0-100 (Site Hızı & Core Web Vitals)
    // Complementary secondary dimensions for comprehensive 6-axis mode:
    backlinkProfile?: number; // 0-100
    contentDepth?: number;    // 0-100
    technicalSeo?: number;    // 0-100
    [key: string]: number | undefined;
  };
  keyStrengths: string[];
  vulnerabilities: string[];
  estimatedMonthlyTraffic: string;
}

export interface CompetitiveStrategicAction {
  id: string;
  metricKey: "domainAuthority" | "keywordDensity" | "siteSpeed" | "backlinkProfile" | "contentDepth" | "technicalSeo";
  metricLabel: string;
  title: string;
  priority: "Kritik" | "Yüksek" | "Orta";
  impactScore: string; // e.g. "+35% Görünürlük", "+450 Ziyaretçi"
  currentGap: number;  // negative if user is trailing
  strategySummary: string;
  actionSteps: string[];
  targetCompetitorName: string;
  targetTab?: CustomerPanelTab;
  quickActionLabel?: string;
}

// ==========================================
// MARKETING SOURCE ATTRIBUTION & ROI TYPES (D3.js)
// ==========================================
export type MarketingSourceKey = "ads" | "organic" | "social" | "direct" | "referral";

export interface ChannelAttributionRecommendation {
  action: "increase_budget" | "maintain" | "optimize_bids" | "reallocate";
  title: string;
  summary: string;
  budgetShiftSuggestion: number; // Suggested delta in budget (₺)
}

export interface ChannelAttributionData {
  id: MarketingSourceKey;
  name: string;
  shortName: string;
  description: string;
  category: "paid" | "earned" | "owned";
  spend: number; // in TRY (₺)
  budgetAllocationPercent: number; // % of total marketing spend
  visitors: number;
  leads: number;
  closedDeals: number;
  revenue: number; // in TRY (₺)
  conversionRate: number; // (leads / visitors) * 100
  salesConversionRate: number; // (closedDeals / leads) * 100
  roi: number; // ((revenue - spend) / spend) * 100
  cpl: number; // spend / leads (Cost per Lead ₺)
  cpc: number; // spend / visitors (Cost per Click ₺)
  roas: number; // revenue / spend (e.g. 4.2x)
  averageDealValue: number; // revenue / closedDeals ₺
  efficiencyTier: "scale" | "leader" | "optimize" | "review";
  recommendation: ChannelAttributionRecommendation;
  color: string;
  gradientColors: [string, string];
  bgLight: string;
  borderLight: string;
  textColor: string;
}

export interface MarketingAttributionConfig {
  enabled: boolean;
  attributionModel: "last_touch" | "first_touch" | "linear" | "time_decay";
  timeRange: "7d" | "30d" | "90d" | "all";
  customSpend: Record<MarketingSourceKey, number>;
  targetCplThreshold?: number;
  targetMinRoi?: number;
}

// ==========================================
// LEAD MAPPING & CUSTOMER JOURNEY TYPES (D3.js)
// ==========================================
export type JourneyStageKey =
  | "touchpoint"
  | "landing"
  | "engagement"
  | "intent"
  | "conversion";

export interface JourneyStageMeta {
  key: JourneyStageKey;
  title: string;
  subtitle: string;
  order: number;
  color: string;
}

export interface JourneyNode {
  id: string;
  stage: JourneyStageKey;
  name: string;
  shortName: string;
  channel?: "organic" | "ads" | "social" | "direct" | "referral";
  visitors: number;
  conversions: number;
  conversionRate: number; // e.g. 28.4%
  dropOffRate: number;
  avgDealValue?: number;
  iconName?: string;
  color: string;
  badge?: string;
  isTopChannel?: boolean;
}

export interface JourneyLink {
  id: string;
  source: string;
  target: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  value: number; // Flow thickness representation
  channel: "organic" | "ads" | "social" | "direct" | "referral";
  isHighConverting?: boolean;
}

export interface TopJourneyPath {
  id: string;
  name: string;
  channel: "organic" | "ads" | "social" | "direct" | "referral";
  channelLabel: string;
  steps: {
    stage: JourneyStageKey;
    name: string;
  }[];
  visitors: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  avgDuration: string;
  efficiencyScore: number;
  isWinner?: boolean;
  highlightColor?: string;
}

export interface ChannelEffectiveness {
  channel: "organic" | "ads" | "social" | "direct" | "referral";
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
  avgDealValue: number;
  totalRevenue: number;
  avgDuration: string;
  roiEstimate: number; // e.g. 480%
  topLandingPage: string;
  badge: string;
  badgeType: "gold" | "silver" | "bronze" | "standard";
  isWinner: boolean;
}

export interface IndividualLeadJourney {
  id: string;
  leadId: string;
  leadName: string;
  serviceOrProduct: string;
  channel: "organic" | "ads" | "social" | "direct" | "referral";
  dealValue: number;
  status: "new" | "contacted" | "offered" | "closed" | "archived";
  date: string;
  score?: number;
  totalDuration: string;
  steps: {
    stage: JourneyStageKey;
    title: string;
    timestamp: string;
    description: string;
    isKeyMoment?: boolean;
  }[];
  outcome: string;
  isHighValue?: boolean;
}

export interface JourneyDropOffPoint {
  id: string;
  stage: JourneyStageKey;
  stepName: string;
  location: string;
  channel?: "organic" | "ads" | "social" | "direct" | "referral" | "all";
  dropOffRate: number; // e.g. 38.5 (%)
  droppedVisitors: number;
  totalVisitors: number;
  retainedVisitors: number;
  severity: "critical" | "high" | "medium";
  frictionReason: string;
  detailedAnalysis: string;
  lostRevenueEstimate: number; // e.g. 145000 (₺)
  recommendedFix: string;
  quickActionTab?: string;
  quickActionLabel?: string;
}

export interface FunnelStageWithDropOff {
  stageKey: JourneyStageKey;
  stageName: string;
  stageOrder: number;
  color: string;
  visitors: number;
  retentionRate: number; // % of total initial visitors
  dropOffCount: number;
  dropOffRate: number; // % of visitors who reached this stage and left
  lostRevenueEstimate: number;
  primaryDropOffReason: string;
  topDropOffAction: string;
}

export type AdminPanelTab =
  | "overview"
  | "template-factory"
  | "sectors"
  | "client-sites"
  | "renewals"
  | "pricing-plans"
  | "homepage-manager"
  | "edge-settings";

// ==========================================
// LEAD FORECASTING & SALES PROJECTION TYPES (D3.js)
// ==========================================
export interface DailyForecastPoint {
  dayIndex: number; // 1 to 30
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  displayDate: string; // "8 Eyl", "9 Eyl"
  fullDisplayDate: string; // "8 Eylül 2026, Salı"
  dayOfWeek: string; // "Pzt", "Sal", "Çar", ...
  isWeekend: boolean;
  expectedDailyLeads: number;
  expectedDailyWonDeals: number;
  expectedDailyRevenue: number;
  cumulativeLeads: number;
  cumulativeWonDeals: number;
  cumulativeRevenue: number;
  // Confidence interval bounds (Optimistic vs Conservative)
  minRevenue: number;
  maxRevenue: number;
  minCumulativeRevenue: number;
  maxCumulativeRevenue: number;
  minLeads: number;
  maxLeads: number;
  minCumulativeLeads: number;
  maxCumulativeLeads: number;
}

export interface WeeklyForecastMilestone {
  weekNumber: number; // 1, 2, 3, 4
  weekLabel: string; // "1. Hafta (1-7 Gün)"
  dateRangeLabel: string; // "8 Eyl - 14 Eyl"
  expectedLeads: number;
  expectedWonDeals: number;
  expectedRevenue: number;
  cumulativeRevenueAtEnd: number;
  shareOfTotalRevenue: number; // e.g. 24.5%
}

export interface ChannelForecastContribution {
  channel: "organic" | "ads" | "social" | "direct" | "referral";
  channelLabel: string;
  expectedLeads: number;
  expectedWonDeals: number;
  expectedRevenue: number;
  sharePercentage: number;
  conversionRate: number;
  color: string;
}

export interface ForecastSimulationConfig {
  conversionRateModifier: number; // e.g. -10 to +25 (percentage points)
  trafficMultiplier: number; // e.g. 0.5 to 2.0 (1.0 = normal baseline)
  dealValueMultiplier: number; // e.g. 0.5 to 2.0 (1.0 = normal baseline)
  scenario: "realistic" | "optimistic" | "conservative" | "custom";
}

export interface ForecastSummary {
  totalExpectedLeads: number;
  totalExpectedWonDeals: number;
  totalExpectedRevenue: number;
  effectiveConversionRate: number;
  effectiveAvgDealValue: number;
  confidenceRange: {
    minRevenue: number;
    maxRevenue: number;
    minLeads: number;
    maxLeads: number;
    minWonDeals: number;
    maxWonDeals: number;
  };
  historicalMetrics: {
    totalLeads: number;
    closedLeads: number;
    offeredLeads: number;
    contactedLeads: number;
    newLeads: number;
    actualConversionRate: number;
    avgDealValue: number;
    totalHistoricalRevenue: number;
    dailyVelocity: number;
  };
  dailyPoints: DailyForecastPoint[];
  weeklyMilestones: WeeklyForecastMilestone[];
  channelContributions: ChannelForecastContribution[];
  growthRecommendations: string[];
}

export type SystemLogStatus = "success" | "warning" | "error";
export type SystemLogBackupType = "daily_auto" | "manual" | "pre_restore" | "health_check";

export interface SystemBackupLog {
  id: string;
  timestamp: number;
  dateFormatted: string; // e.g. "7 Eylül 2026, 03:00"
  dateString: string; // "YYYY-MM-DD"
  timeString: string; // "03:00:15"
  relativeTime: string; // e.g. "Bugün 03:00", "Dün 03:00"
  backupType: SystemLogBackupType;
  status: SystemLogStatus;
  statusText: string; // e.g. "Başarılı (Doğrulandı)"
  statusMessage: string;
  fileSizeBytes: number;
  fileSizeKb: number;
  fileSizeFormatted: string; // e.g. "84.6 KB"
  backupId?: string;
  durationMs: number;
  checksum: string; // e.g. "sha256:7f9a12c4..."
  verified: boolean;
  trigger: string; // e.g. "Zamanlanmış Günlük Görev (03:00)", "Günlük İlk Oturum Tetikleyicisi"
  metadata: {
    pageCount: number;
    servicesCount: number;
    productsCount: number;
    leadsCount: number;
    companyName: string;
    siteId?: string;
  };
  retentionPolicy?: string; // e.g. "30 Günlük Otomatik Saklama"
}

export interface SystemLogStats {
  totalLogs: number;
  totalDailyAuto: number;
  successCount: number;
  warningCount: number;
  errorCount: number;
  successRate: number; // e.g. 100
  totalStorageBytes: number;
  totalStorageKb: number;
  avgFileSizeKb: number;
  lastBackupDate?: string;
  lastBackupStatus?: SystemLogStatus;
  nextScheduledBackup: string;
}

// ==========================================
// POPÜLER CRM ENTEGRASYON TİPLERİ (HubSpot, Salesforce, Zoho, Pipedrive, Webhook)
// ==========================================
export type CrmProviderType = "hubspot" | "salesforce" | "zoho" | "pipedrive" | "webhook";

export interface CrmServiceSetting {
  enabled: boolean;
  apiKey?: string; // Private App Token, Access Token or API Key
  portalId?: string; // e.g. HubSpot Portal ID or Salesforce Org ID
  instanceUrl?: string; // e.g. https://api.hubapi.com or https://company.my.salesforce.com
  pipelineId?: string; // Target pipeline / stage
  dealStage?: string; // Default stage
  autoSyncNewLeads?: boolean; // Automatically push new incoming leads on arrival
  environment?: "production" | "sandbox"; // Live vs Sandbox mode
  lastSyncAt?: string;
  status: "connected" | "disconnected" | "error" | "testing";
  statusMessage?: string;
  webhookUrl?: string;
  customHeaders?: string;
  fieldMappings?: {
    nameField?: string;
    emailField?: string;
    phoneField?: string;
    messageField?: string;
    dealValueField?: string;
    serviceField?: string;
  };
}

export interface CrmSyncLog {
  id: string;
  timestamp: string;
  provider: CrmProviderType;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  status: "success" | "error" | "pending";
  httpStatusCode?: number;
  responseMessage: string;
  externalRecordId?: string; // e.g. "hs-contact-941829" or "sf-lead-00Q5g0001"
  payloadSnippet?: string;
}

export interface CrmIntegrationConfig {
  activeProvider: CrmProviderType;
  globalAutoSync: boolean;
  services: {
    hubspot: CrmServiceSetting;
    salesforce: CrmServiceSetting;
    zoho: CrmServiceSetting;
    pipedrive: CrmServiceSetting;
    webhook: CrmServiceSetting;
  };
  syncLogs: CrmSyncLog[];
}

// ==========================================
// SEO İLERLEME BİLDİRİM SİSTEMİ TİPLERİ (RANK TRACKER & PROGRESS NOTIFICATIONS)
// ==========================================

export interface SeoKeywordRankShift {
  keyword: string;
  previousRank: number;
  currentRank: number;
  rankChange: number; // pozitif değer yükselişi temsil eder (+8 sıra vb.)
  monthlySearchVolume: number;
  difficulty: "Düşük" | "Orta" | "Yüksek";
  serpFeatures?: string[]; // e.g. ["Öne Çıkan Snippet", "Yerel Harita Paketi", "Site Bağlantıları"]
}

export interface SeoProgressNotificationLog {
  id: string;
  timestamp: string; // ISO string
  pageId: string;
  pageTitle: string;
  pageUrl: string;
  clusterId: string;
  clusterTitle: string;
  actionType: "h1_optimization" | "meta_optimization" | "batch_remediation" | "regional_page_created" | "manual_edit";
  actionDescription: string;
  keywords: SeoKeywordRankShift[];
  previousAverageRank: number;
  currentAverageRank: number;
  rankImprovement: number; // e.g. +8.5
  estimatedTrafficGrowth: number; // e.g. +380 ziyaret/ay
  estimatedMonthlyRevenueGain: number; // e.g. +₺4.250/ay
  status: "pending_crawl" | "crawled" | "indexed" | "ranking_boosted" | "top_3";
  isRead: boolean;
  alertLevel: "milestone" | "top_3" | "first_page" | "standard";
  googleBotCrawlTime?: string;
  simulatedDaysAfterFix: number; // 2. gün, 5. gün, 10. gün vb.
  serpPreviewSnippet?: {
    title: string;
    url: string;
    description: string;
  };
}

export interface SeoProgressNotificationConfig {
  enabled: boolean;
  soundEnabled: boolean;
  notifyOnFirstPage: boolean; // 1. sayfaya çıkınca bildirim
  notifyOnTop3: boolean; // İlk 3'e girince acil bildirim
  notifyOnTrafficMilestone: boolean; // +250/500 ziyaret artışında bildirim
  minRankJumpThreshold: number; // Min kaç sıra yükselince bildirim tetiklensin (varsayılan: 2)
  emailAlerts: {
    enabled: boolean;
    recipientEmail: string;
  };
  webhookAlerts: {
    enabled: boolean;
    webhookUrl: string;
    slackFormat: boolean;
  };
  logs: SeoProgressNotificationLog[];
}

// ==========================================
// AI-POWERED SEO CONTENT OPTIMIZER TYPES
// ==========================================
export interface SeoTitleVariation {
  id: string;
  variationType: "local_dominance" | "high_conversion" | "urgent_action" | "authority_trust" | "offer_benefit";
  label: string;
  title: string;
  charCount: number;
  pixelWidth: number;
  ctrScore: number;
  intent: string;
  embeddedKeywords: string[];
  reason: string;
}

export interface SeoDescriptionVariation {
  id: string;
  variationType: "local_dominance" | "high_conversion" | "urgent_action" | "authority_trust" | "offer_benefit";
  label: string;
  description: string;
  charCount: number;
  pixelWidth: number;
  ctrScore: number;
  intent: string;
  callToAction: string;
  embeddedKeywords: string[];
  reason: string;
}

export interface SeoKeywordItem {
  keyword: string;
  monthlySearchVolume: string;
  difficulty: "Kolay" | "Orta" | "Rekabetçi";
  intent: string;
  relevance: number;
}

export interface SeoContentOptimizerData {
  industry: string;
  industryInsights: {
    searchBehavior: string;
    highValueKeywords: string[];
    recommendedFocus: string;
  };
  titleVariations: SeoTitleVariation[];
  descriptionVariations: SeoDescriptionVariation[];
  keywordSuggestions: SeoKeywordItem[];
  contentTips: string[];
}

// ==========================================
// COMPETITIVE SEO INSIGHT & SEARCH GROUNDING TYPES
// ==========================================

export interface CompetitorContentMetric {
  id: string;
  name: string;
  domain: string;
  rank: number;
  visibilityScore: number; // 0-100
  avgWordCount: number;
  indexedPages: number;
  topKeywordReach: number;
  speedScore: number;
  schemaScore: number;
  backlinkSignals: "Güçlü" | "Orta" | "Zayıf";
  contentVelocity: "Haftalık 3+" | "Haftalık 1-2" | "Aylık" | "Düşük";
  keyStrengths: string[];
  weaknesses: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface CompetitiveMetaSuggestion {
  id: string;
  pageType: "homepage" | "service" | "blog";
  pageName: string;
  currentUserTitle: string;
  currentUserDescription: string;
  topCompetitorTitle: string;
  topCompetitorDescription: string;
  recommendedTitle: string;
  recommendedDescription: string;
  expectedCtrBoost: string;
  reasoning: string;
  targetKeywords: string[];
}

export interface MissingHighImpactKeyword {
  id: string;
  keyword: string;
  searchIntent: "Ticari" | "Bilgilendirici" | "Acil / Yerel" | "İşlemsel";
  searchVolume: string;
  difficulty: number; // 0-100
  competitorsTargeting: string[];
  estimatedTrafficGain: string;
  suggestedAction: string;
  recommendedContentType: "blog" | "service" | "faq" | "homepage";
  actionableDraftTitle: string;
}

export interface CompetitiveRadarMetric {
  metric: string;
  userScore: number;
  comp1Score: number;
  comp2Score: number;
  comp3Score: number;
  fullMark: number;
}

export interface GroundingSourceItem {
  title: string;
  uri: string;
}

export interface SearchGroundingMeta {
  query: string;
  sources: GroundingSourceItem[];
}

export interface TacticalQuickWin {
  id: string;
  title: string;
  impact: "Yüksek" | "Kritik" | "Orta";
  effort: "Kolay" | "Orta" | "Planlı";
  description: string;
  actionType: "blog" | "keywords" | "schema" | "speed";
  targetCompetitor?: string;
}

export interface CompetitorDomainAuthority {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  rank?: number;
  domainAuthority: number; // 0-100 DA
  pageAuthority: number;   // 0-100 PA
  backlinksCount: number;
  referringDomains: number;
  spamScore: number;       // Percentage e.g. 1%
  organicVisibility: number; // 0-100
  indexedPages: number;
  speedScore: number;
  schemaScore: number;
  authorityStatus: "superior" | "competitive" | "trailing";
  keyAuthoritySignal: string;
  topDifferentiator: string;
}

export interface CompetitiveBenchmarkingData {
  analyzedAt: string;
  userDomain: string;
  userName: string;
  sector: string;
  city: string;
  domainAuthorities: CompetitorDomainAuthority[];
  keywordRankings: CompetitorKeywordRanking[];
  summary: {
    avgCompetitorDa: number;
    userDa: number;
    daGap: number;
    leadingKeywordsCount: number;
    trailingKeywordsCount: number;
    competingKeywordsCount: number;
    totalTrafficOpportunity: string;
    keyCompetitiveAdvantage: string;
  };
  source: "gemini_grounding" | "live_search" | "algorithmic_model";
  groundingSources?: GroundingSourceItem[];
}

export interface CompetitorKeywordRanking {
  id: string;
  keyword: string;
  searchIntent: "Ticari" | "Bilgilendirici" | "Acil / Yerel" | "İşlemsel";
  monthlyVolume: string;
  difficulty: number; // 0-100
  userRank: number | null; // e.g. 2, or null if >20/unranked
  comp1Rank: number | null; // Rank of competitor 1
  comp2Rank: number | null; // Rank of competitor 2
  comp3Rank: number | null; // Rank of competitor 3
  serpFeatures: string[]; // e.g. ["Local 3-Pack", "Featured Snippet", "Yıldızlı Yorumlar"]
  status: "leading" | "competing" | "trailing" | "missing";
  gap: number; // difference compared to best competitor; negative = leading, positive = trailing
  trafficOpportunity: string;
  aiRecommendation: string;
}

export type SwotType = "strength" | "weakness" | "opportunity" | "threat";

export interface SwotItem {
  id: string;
  type: SwotType;
  title: string;
  description: string;
  impact: "Kritik" | "Yüksek" | "Orta";
  targetCompetitor?: string;
  relatedKeyword?: string;
  actionableTip: string;
  actionType?: "blog" | "schema" | "speed" | "keywords" | "local";
}

export interface SwotComparisonFactor {
  id: string;
  factor: string;
  category: "teknik" | "icerik" | "yerel" | "otorite";
  userSiteValue: string;
  comp1Value: string;
  comp2Value: string;
  comp3Value: string;
  swotType: SwotType;
  competitiveStatus: "superior" | "competitive" | "trailing";
  aiTacticalAction: string;
}

export interface CompetitorSwotProfile {
  id: string;
  name: string;
  domain: string;
  rank: number;
  marketShare: string;
  headToHeadSummary: string;
  strengthsVsUser: string[];
  vulnerabilitiesVsUser: string[];
  counterStrategy: string;
}

export interface CompetitiveSwotAnalysis {
  analyzedAt: string;
  sector: string;
  city: string;
  domain: string;
  primaryKeywords: string[];
  activeKeyword: string;
  summary: string;
  competitors: CompetitorContentMetric[];
  comparisonFactors: SwotComparisonFactor[];
  swot: {
    strengths: SwotItem[];
    weaknesses: SwotItem[];
    opportunities: SwotItem[];
    threats: SwotItem[];
  };
  competitorProfiles: CompetitorSwotProfile[];
  searchGroundingSources?: GroundingSourceItem[];
}

export type ActionTaskPriority = "Kritik" | "Yüksek" | "Orta";
export type ActionTaskCategory = "Teknik SEO" | "İçerik Stratejisi" | "Yerel SEO & Harita" | "Otorite & Backlink" | "Dönüşüm (CRO)";
export type ActionTaskImpact = "Çok Yüksek" | "Yüksek" | "Orta";
export type ActionTaskEffort = "Düşük" | "Orta" | "Yüksek";

export interface ActionPlanTask {
  id: string;
  month: 1 | 2 | 3;
  monthLabel: "1. Ay (Gün 1-30)" | "2. Ay (Gün 31-60)" | "3. Ay (Gün 61-90)";
  title: string;
  description: string;
  category: ActionTaskCategory;
  priority: ActionTaskPriority;
  impact: ActionTaskImpact;
  effort: ActionTaskEffort;
  targetKpi: string;
  radarAxisAffected: "Hız & CWV" | "Domain Otoritesi" | "İçerik Derinliği" | "Mobil UX" | "Yerel Varlık" | "Dönüşüm Oranı";
  competitorGapAddressed: string;
  suggestedSteps: string[];
  estimatedDaysToComplete: number;
  completed?: boolean;
}

export interface ContentOptimizationDirective {
  id: string;
  pageTarget: string;
  currentStatus: string;
  targetKeywords: string[];
  recommendedWordCount: number;
  hierarchyAction: string;
  lsiAdditions: string[];
  paaQuestionsToAdd: string[];
  expectedImpact: string;
}

export interface StrategicActionPlan {
  analyzedAt: string;
  companyName: string;
  sector: string;
  city: string;
  domain: string;
  radarScoresSnapshot: {
    siteOverall: number;
    competitorAvgOverall: number;
    gapSummary: string;
    axes: { name: string; userScore: number; competitorAvg: number; status: "superior" | "competitive" | "lagging" }[];
  };
  executiveSummary: string;
  monthlyFocus: {
    month1Focus: string;
    month2Focus: string;
    month3Focus: string;
  };
  tasks: ActionPlanTask[];
  contentDirectives: ContentOptimizationDirective[];
  quickWins: string[];
  searchGroundingSources?: { title: string; url: string }[];
}

export type SearchIntentType = "Bilgilendirici" | "Ticari / Karar" | "Acil / İşlemsel" | "Yerel Keşif";
export type ContentFormatType = "Kapsamlı Rehber" | "Soru & Cevap (PAA)" | "Fiyat & Karşılaştırma" | "Nasıl Yapılır (How-To)" | "Yerel Semt Listesi";

export interface CompetitorContentExpansionIdea {
  id: string;
  blogTitle: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntentType;
  estimatedMonthlySearchVolume: string;
  competitorBenchmarkSource: string;
  competitorGapToExploit: string;
  suggestedHeadings: string[];
  targetAudience: string;
  contentFormat: ContentFormatType;
  difficulty: "Kolay" | "Orta" | "Zor";
  expectedTrafficShare: string;
  priorityScore: number;
}

export interface CompetitorContentExpansionReport {
  analyzedAt: string;
  companyName: string;
  sector: string;
  city: string;
  domain: string;
  executiveSummary: string;
  topCompetitorInsights: {
    name: string;
    topArticleTitle: string;
    estimatedTraffic: string;
    weaknessesToBeat: string;
  }[];
  contentIdeas: CompetitorContentExpansionIdea[];
  searchGroundingSources?: { title: string; url: string }[];
}

export type AdEfficiencyRating = "Çok Yüksek" | "Yüksek" | "Orta" | "Düşük / İsraf";

export interface CompetitorAdBenchmark {
  id: string;
  competitorName: string;
  domain: string;
  isUser: boolean;
  estimatedMonthlyAdSpend: number; // in TRY
  estimatedCpc: number; // in TRY
  estimatedPaidClicks: number;
  paidSearchShare: number; // percentage (e.g. 34%)
  primaryAdKeywords: string[];
  roasScore: number; // e.g. 3.6x
  efficiencyRating: AdEfficiencyRating;
  wastedSpendEstimate: number; // in TRY
  strategyObservation: string;
  topAdCopies: {
    headline: string;
    description: string;
    displayUrl: string;
    adExtensions: string[];
  }[];
}

export interface AdEfficiencyChannelBreakdown {
  channel: "Google Search (Arama Ağı)" | "Google Haritalar (Yerel Pin Reklamları)" | "Meta (Instagram / Facebook)" | "TikTok & YouTube Video";
  competitorSpendShare: number; // percentage
  userRecommendedSpendShare: number; // percentage
  cpcAverage: number;
  recommendation: string;
}

export interface CpcArbitrageKeyword {
  keyword: string;
  avgCpc: number; // in TRY
  monthlySearchVolume: string;
  competitorTotalSpendEstimate: string;
  organicOpportunity: string;
  recommendationType: "SEO ile Tasarruf Et" | "Düşük Teklifle Yakala" | "Negatife Al";
}

export interface AdWastePreventionTactic {
  title: string;
  estimatedSaving: string;
  riskDescription: string;
  actionProtocol: string;
  negativeKeywordsToExclude?: string[];
}

export interface CompetitorAdSpendEfficiencyReport {
  analyzedAt: string;
  companyName: string;
  sector: string;
  city: string;
  domain: string;
  marketSummary: {
    totalEstimatedMonthlyAdSpend: number; // in TRY
    avgIndustryCpc: number; // in TRY
    totalCompetitorWastedSpend: number; // in TRY
    potentialMonthlySavingsForUser: number; // in TRY
    avgRoasAcrossCompetitors: number;
  };
  competitors: CompetitorAdBenchmark[];
  channelDistribution: AdEfficiencyChannelBreakdown[];
  cpcArbitrageOpportunities: CpcArbitrageKeyword[];
  wastePreventionTactics: AdWastePreventionTactic[];
  searchGroundingSources?: { title: string; url: string }[];
}

export interface CompetitiveSeoInsightData {
  analyzedAt: string;
  sector: string;
  city: string;
  domain: string;
  summary: string;
  userMetrics: {
    visibilityScore: number;
    avgWordCount: number;
    indexedPages: number;
    topKeywordReach: number;
    speedScore: number;
    schemaScore: number;
  };
  competitors: CompetitorContentMetric[];
  keywordRankings?: CompetitorKeywordRanking[];
  missingKeywords: MissingHighImpactKeyword[];
  radarComparison: CompetitiveRadarMetric[];
  searchGroundingSources: SearchGroundingMeta[];
  tacticalQuickWins: TacticalQuickWin[];
  metaSuggestions?: CompetitiveMetaSuggestion[];
}

// ==========================================
// SEO COMPETITIVE ALERT SYSTEM TYPES
// ==========================================

export type CompetitiveAlertSeverity = "critical" | "warning" | "opportunity" | "info";
export type CompetitiveAlertStatus = "active" | "resolved" | "dismissed";
export type CompetitiveAlertCategory = 
  | "overtaken"              // Competitor was behind or equal, now ahead
  | "rank_drop"              // User dropped in rank while competitor climbed/maintained
  | "lost_top3"              // User fell out of Google Top 3 / Local 3-Pack
  | "lost_number_one"        // User was #1, now competitor took #1
  | "competitor_surge"       // Competitor climbed +3 or more spots rapidly
  | "high_volume_threat"     // High search volume keyword where competitor ranks top 3 and user is trailing
  | "volume_spike"           // Sudden surge/spike in competitor keyword search volume (+50% or higher)
  | "volume_drop"            // Sudden collapse in search volume or demand shift
  | "competitor_volume_hijack" // Competitor captured rank #1 during a high-volume surge
  | "seasonal_surge";        // Seasonal / viral search volume explosion

export interface SeoCompetitiveAlertAction {
  type: "blog" | "meta" | "schema" | "speed" | "backlink" | "reviews";
  label: string;
  description: string;
  targetTab?: CustomerPanelTab;
  prefillKeyword?: string;
  prefillDraftTitle?: string;
}

export interface SeoCompetitiveAlert {
  id: string;
  keyword: string;
  monthlyVolume: string;
  searchIntent: "Ticari" | "Bilgilendirici" | "Acil / Yerel" | "İşlemsel";
  competitorName: string;
  competitorDomain?: string;
  userRank: number | null;          // Current user rank (e.g. 3, or null if >20)
  competitorRank: number;           // Current competitor rank (e.g. 1)
  previousUserRank?: number | null; // Previous rank before change
  previousCompetitorRank?: number;  // Previous competitor rank
  rankDelta: number;                // Difference (positive = competitor is ahead)
  userRankChange?: number;          // e.g. -2 (dropped 2 spots)
  competitorRankChange?: number;    // e.g. +3 (gained 3 spots)
  // Sudden search volume volatility fields
  volumeChangePercentage?: number;  // e.g. +145% or -40%
  previousMonthlyVolume?: string;   // e.g. "3.2K / ay"
  currentMonthlyVolume?: string;    // e.g. "7.8K / ay"
  volumeTrendSparkline?: number[];  // e.g. [3200, 3500, 4200, 5900, 7800]
  volatilityLevel?: "extreme" | "high" | "moderate";
  competitorTrafficShare?: string;  // e.g. "%58 SERP Trafik Payı"
  notificationSent?: boolean;
  notificationType?: "browser_push" | "in_app" | "sound" | "all";
  severity: CompetitiveAlertSeverity;
  category: CompetitiveAlertCategory;
  title: string;                    // e.g. "Rakip 'İstanbul Tesisat' aramasında #1'e yükseldi ve sitenizi geçti"
  description: string;
  trafficLossEstimate: string;      // e.g. "Tahmini -450 Aylık Ziyaretçi Kayıp Riski"
  detectedAt: string;               // ISO date or relative time
  isRead: boolean;
  status: CompetitiveAlertStatus;
  rootCause: string;                // e.g. "Rakip zengin FAQ şeması ve semt bazlı H2 içerikleri ekledi."
  recommendedAction: SeoCompetitiveAlertAction;
  serpFeatures?: string[];
}

export interface SeoCompetitiveAlertSettings {
  browserPushEnabled: boolean;
  inAppToastEnabled: boolean;
  audioCueEnabled: boolean;
  alertOnAnyOvertake: boolean;        // Trigger alert whenever a competitor is higher
  alertOnTop3Loss: boolean;           // Trigger critical alert if lost Top 3
  alertOnHighVolumeOnly: boolean;     // Only alert if search volume > 2000
  minimumRankGap: number;             // Only alert if competitor is ahead by at least X spots (default 1)
  // Search Volume Volatility Settings
  alertOnVolumeSpike?: boolean;       // Alert when search volume suddenly spikes
  volumeSpikeThresholdPercent?: number; // e.g. 30, 50, 100 (% increase threshold)
  lastCheckedAt?: string;
  autoCheckIntervalHours: number;     // e.g. 6 or 24
}

export interface CompetitiveAlertSummary {
  totalAlerts: number;
  activeCount: number;
  unreadCount: number;
  criticalCount: number;
  outrankedCount: number;
  outrankedKeywordsCount: number;
  topThreatCompetitor: string;
  potentialTrafficAtRisk: string;
  protectedRankingsCount: number;
}

// ==========================================
// AI CONTENT META-OPTIMIZER TYPES
// ==========================================

export interface ReadabilityMetrics {
  score: number; // 0-100 (Ateşman Türkçe Okunabilirlik İndeksi)
  level: "Çok Kolay" | "Kolay / Akıcı" | "Orta Anlaşılır" | "Ağır / Akademik" | "Çok Zor";
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  gradeLevel: string;
}

export interface KeywordDensityItem {
  keyword: string;
  count: number;
  density: number; // 0-100 percentage
  status: "ideal" | "low" | "high" | "missing";
  type: "primary" | "secondary" | "local" | "lsi";
  searchIntent?: string;
  recommendedCount: number;
}

export interface ContentSectionOptimization {
  id: string;
  sectionKey: "hero" | "about" | "service" | "blog" | "meta" | "features";
  sectionName: string;
  targetField: string; // path in siteConfig, e.g. "hero.subtitle"
  originalText: string;
  optimizedText: string;
  beforeReadability: ReadabilityMetrics;
  afterReadability: ReadabilityMetrics;
  beforeDensity: {
    overallDensity: number;
    keywords: KeywordDensityItem[];
  };
  afterDensity: {
    overallDensity: number;
    keywords: KeywordDensityItem[];
  };
  injectedKeywords: string[];
  readabilityImprovements: string[];
  status: "pending" | "applied" | "rejected";
}

export interface AiContentMetaOptimizerReport {
  scannedAt: string;
  companyName: string;
  sector: string;
  city: string;
  overallScoreBefore: number; // 0-100
  overallScoreAfter: number; // 0-100
  overallReadabilityBefore: ReadabilityMetrics;
  overallReadabilityAfter: ReadabilityMetrics;
  overallKeywordDensityBefore: number;
  overallKeywordDensityAfter: number;
  sections: ContentSectionOptimization[];
  sitewideKeywordStrategy: {
    primaryTargetKeywords: string[];
    localKeywords: string[];
    lsiKeywords: string[];
    topRecommendations: string[];
  };
  isLiveGemini?: boolean;
}

// ==========================================
// FUTURE PERFORMANCE FORECASTER & 30-DAY PREDICTOR (D3.js)
// ==========================================

export type ForecastingScenario = "realistic" | "optimistic" | "pessimistic";

export interface DailyForecastDataPoint {
  date: string; // "YYYY-MM-DD"
  formattedDate: string; // "12 Eyl", "13 Eyl"
  dayIndex: number; // -29 to 0 for historical, 1 to 30 for forecast
  isForecast: boolean;
  dayOfWeek: string; // "Pzt", "Sal", "Çar", etc.
  visitors: number;
  visitorsLowerBound: number; // 80% CI
  visitorsUpperBound: number; // 80% CI
  conversions: number; // inquiries, calls, WhatsApp, lead forms
  conversionsLowerBound: number;
  conversionsUpperBound: number;
  conversionRate: number; // e.g. 4.2 (%)
  estimatedRevenue: number; // In TL (based on average deal value)
  notes?: string;
}

export interface ForecastingSimulationParams {
  trafficGrowthRate: number; // percentage (-20 to +80)
  conversionMultiplier: number; // multiplier (0.8x to 2.5x)
  averageDealValue: number; // in TL (e.g. 1500)
  confidenceLevel: number; // percentage (e.g. 80, 90)
  scenario: ForecastingScenario;
}

export interface ForecastingInsight {
  id: string;
  type: "opportunity" | "warning" | "milestone";
  title: string;
  description: string;
  potentialImpact: string;
  actionRecommendation: string;
}

export interface ChannelGrowthProjection {
  channel: string;
  channelKey: "organic" | "direct" | "social" | "whatsapp" | "ads";
  currentMonthlyVisitors: number;
  projectedMonthlyVisitors: number;
  growthPercent: number;
  color: string;
}

export interface FuturePerformanceForecasterReport {
  generatedAt: string;
  scenario: ForecastingScenario;
  params: ForecastingSimulationParams;
  historicalTotalVisitors30d: number;
  historicalTotalConversions30d: number;
  historicalAvgConversionRate: number;
  historicalTotalRevenue30d: number;
  projectedTotalVisitors30d: number;
  projectedTotalConversions30d: number;
  projectedAvgConversionRate: number;
  projectedTotalRevenue30d: number;
  netVisitorGrowthPercent: number;
  netConversionGrowthPercent: number;
  netRevenueGrowthPercent: number;
  forecastConfidenceScore: number; // 0-100 (e.g. 92)
  timeSeriesData: DailyForecastDataPoint[];
  insights: ForecastingInsight[];
  channelBreakdown: ChannelGrowthProjection[];
}

// ==========================================
// AI PRICING INTELLIGENCE & TIER OPTIMIZATION TYPES
// ==========================================
export type PricingTierLevel = "starter" | "pro" | "enterprise";
export type PriceModelType = "fixed" | "starting_at" | "hourly" | "custom_quote" | "monthly_retainer";

export interface PricingTierRecommendation {
  id: string; // e.g. "tier-starter", "tier-pro", "tier-enterprise"
  name: string; // e.g. "Temel Paket", "Standart / En Çok Tercih Edilen", "Premium / Kurumsal"
  level: PricingTierLevel;
  badge?: string; // e.g. "En Popüler", "En Çok Tercih Edilen", "Bütçe Dostu", "Yüksek Dönüşüm"
  price: number; // in TRY (₺)
  priceFormatted: string; // e.g. "₺1.850"
  originalPriceNumeric?: number;
  originalPriceFormatted?: string;
  periodLabel: string; // e.g. "başlayan fiyatla", "iş başı", "aylık", "seferlik"
  targetAudience: string; // e.g. "Bireysel ve Acil Çözüm Arayanlar"
  description: string;
  features: string[]; // List of bundled features/guarantees
  excludedFeatures?: string[];
  
  // Analytics & Conversion Projection
  currentConversionRate?: number; // e.g. 4.2 (%)
  projectedConversionRate: number; // e.g. 7.6 (%)
  conversionUpliftPercent: number; // e.g. +42 (%)
  estimatedMonthlyLeads: number; // e.g. 24 talep
  estimatedMonthlyRevenue: number; // in TRY, e.g. 44.400
  
  // Competitor & Elasticity Benchmark
  marketBenchmark: {
    minPrice: number;
    medianPrice: number;
    maxPrice: number;
    positioningVsMarket: "budget" | "competitive" | "premium"; // e.g. -15% vs market, median, +20%
    differenceFromMarketMedianPercent: number; // e.g. -8%
  };
  
  // Behavioral Psychological Strategy
  psychologyTactic: {
    title: string; // e.g. "Decoy Effect (Tuzak Seçenek) & Çıpalama"
    rationale: string;
    trigger: "anchoring" | "charm_pricing" | "loss_aversion" | "risk_reversal" | "scarcity";
  };
  
  popular?: boolean;
  highlighted?: boolean;
  ctaText?: string;
}

export interface ServiceSpecificPricingSuggestion {
  serviceId: string;
  serviceTitle: string;
  currentPrice: string; // e.g. "₺1.200" or "Fiyat Sorunuz"
  currentPriceNumeric?: number;
  suggestedOptimalPrice: number;
  suggestedPriceFormatted: string;
  priceModel: PriceModelType;
  competitorMedianPrice: number;
  priceElasticity: "low" | "medium" | "high"; // low: price increases don't hurt conversion; high: sensitive
  elasticityScore: number; // 0.1 to 1.0
  recommendedAction: "increase" | "decrease" | "introduce_transparency" | "bundle";
  reasoning: string;
  conversionImpact: string; // e.g. "+%32 Daha Fazla Form Talebi"
  suggestedFeatures?: string[];
}

export interface CompetitorPriceBenchmarkItem {
  id: string;
  competitorName: string;
  tierName: string;
  priceFormatted: string;
  priceNumeric: number;
  source: string; // e.g. "Google SERP / Yerel Piyasa Analizi"
  positioning: "budget" | "standard" | "premium";
  includedHighlights: string[];
}

export interface PricingElasticityPoint {
  priceMultiplier: number; // 0.6, 0.8, 1.0, 1.2, 1.4, 1.6
  priceTRY: number;
  projectedConversionRate: number; // %
  projectedMonthlyLeads: number;
  projectedMonthlyRevenue: number; // TRY
  isSweetSpot?: boolean;
}

export interface PricingIntelligenceData {
  analyzedAt: string;
  sector: string;
  city: string;
  historicalLeadsAnalyzed: number;
  historicalWinRatePercent: number;
  historicalAvgDealValue: number;
  overallPriceSensitivity: "low" | "moderate" | "high";
  sweetSpotPriceIndex: number;
  
  // Executive Summary & AI Insight
  executiveSummary: string;
  primaryConversionBottleneck: string;
  expectedOverallUpliftPercent: number; // e.g. +36%
  projectedMonthlyRevenueIncreaseTRY: number; // e.g. +28.500 ₺
  
  // Suggested 3-Tier Catalog Package
  recommendedTiers: PricingTierRecommendation[];
  
  // Service-by-service specific optimal pricing
  servicePricingSuggestions: ServiceSpecificPricingSuggestion[];
  
  // Competitor Pricing Landscape
  competitorBenchmarks: CompetitorPriceBenchmarkItem[];
  
  // Elasticity Simulation Curve (D3.js / SVG)
  elasticityCurve: PricingElasticityPoint[];
  
  // Actionable Rollout Plan
  implementationSteps: {
    stepNumber: number;
    title: string;
    description: string;
    estimatedImpact: string;
    urgency: "high" | "medium" | "low";
  }[];
  
  isAiGenerated?: boolean;
}

// ==========================================
// AI GLOBAL SEO AGENT TYPES (GEO-LOCATION & SEARCH GROUNDING)
// ==========================================

export type MarketTier = "domestic" | "international";
export type RegionalSearchIntent = "commercial" | "transactional" | "informational" | "local_navigational";
export type RegionalTrendStatus = "rising" | "breakthrough" | "stable" | "seasonal";

export interface TargetMarketRegion {
  id: string;
  name: string;
  countryCode: string; // e.g. "TR", "DE", "GB", "US", "AE"
  flag: string; // Emoji flag e.g. "🇹🇷", "🇩🇪"
  language: string; // e.g. "tr", "de", "en", "ar"
  languageLabel: string;
  searchEngine: string; // e.g. "Google.com.tr", "Google.de", "Google.co.uk"
  tier: MarketTier;
  selected: boolean;
  cityOrArea?: string;
  monthlyMarketVolumeEstimate?: string;
}

export interface RegionalKeywordVariation {
  id: string;
  keyword: string; // Localized search query in local vernacular
  originalBaseKeyword: string;
  targetMarketId: string;
  targetMarketName: string;
  countryCode: string;
  language: string;
  searchIntent: RegionalSearchIntent;
  searchVolumeIndex: number; // 0-100 score
  searchVolumeDisplay: string; // e.g. "4.8K / ay"
  trendStatus: RegionalTrendStatus;
  trendGrowthPercent: number; // e.g. +68
  competitionDifficulty: number; // 0-100 (e.g. 32)
  difficultyLabel: "Düşük" | "Orta" | "Yüksek" | "Kritik";
  serpFeatures: string[]; // e.g. ["Local Pack", "People Also Ask", "Featured Snippet"]
  vernacularNote: string; // Local dialect / colloquial search habit nuance
  recommendedMetaTitle: string;
  recommendedMetaDescription: string;
  suggestedPageSlug: string;
  localizedH1: string;
  appliedToSiteConfig?: boolean;
}

export interface GeoMarketAnalysis {
  marketId: string;
  marketName: string;
  countryCode: string;
  flag: string;
  language: string;
  languageLabel: string;
  searchEngine: string;
  currentVisibilityScore: number; // 0-100
  potentialVisibilityScore: number; // 0-100
  marketOpportunityScore: number; // 0-100
  topTrends: {
    query: string;
    volumeEstimate: string;
    spikeReason: string;
    relevanceScore: number;
    trendType: "breakthrough" | "steady_growth" | "seasonal_peak";
  }[];
  culturalSearchHabits: string[]; // Nuances like trust seals, formal vs informal language, local directory habits
  localizedCompetitorSignals: {
    competitorDomain: string;
    estimatedMarketShare: number; // percentage
    dominantKeywords: string[];
    vulnerability: string;
  }[];
  hreflangCode: string; // e.g. "tr-TR", "de-DE", "en-GB", "en-US"
  recommendedAction: string;
  regionalLandingPageSuggestion: {
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    introParagraph: string;
    keySellingPoints: string[];
  };
}

export interface RegionalContentTranslationStrategy {
  regionId: string;
  regionName: string;
  countryCode: string;
  flag: string;
  targetLanguage: string;
  languageLabel: string;
  transcreationScore: number; // 0-100 (high = needs heavy cultural transcreation rather than direct translation)
  transcreationGuidance: string;
  toneAndFormality: string;
  culturalTrustAnchors: string[];
  buyerPsychologyNotes: string;
  localizedCtas: {
    turkishOriginal: string;
    localizedVersion: string;
    context: string;
  }[];
  contentDosAndDonts: {
    dos: string[];
    donts: string[];
  };
  recommendedHreflangTag: string;
  localizedUrlPattern: string;
}

export interface GlobalSeoGroundingSource {
  query: string;
  sources: {
    title: string;
    uri: string;
  }[];
}

export interface GlobalSeoAgentReport {
  id: string;
  analyzedAt: string;
  industry: string;
  companyName: string;
  baseCity: string;
  totalMarketsAnalyzed: number;
  overallGlobalReachScore: number; // 0-100
  executiveStrategicSummary: string;
  targetMarkets: GeoMarketAnalysis[];
  regionalKeywords: RegionalKeywordVariation[];
  translationStrategies?: RegionalContentTranslationStrategy[];
  searchGroundingSources: GlobalSeoGroundingSource[];
  macroGeoTrends: {
    title: string;
    region: string;
    growth: string;
    impact: "high" | "medium" | "neutral";
    description: string;
  }[];
  multilingualSeoChecklist: {
    item: string;
    status: "ready" | "needs_action" | "optimized";
    detail: string;
  }[];
  isGroundingLive?: boolean;
}

// ==========================================
// ADVANCED SITE PERFORMANCE TRENDS (90-DAY ROLLING WINDOW & D3.js)
// ==========================================

export type CoreWebVitalMetricKey = "lcp" | "inp" | "cls" | "fid" | "ttfb" | "fcp" | "healthScore";

export type PerformanceTrendGranularity = "daily" | "7d_ma" | "14d_ma";

export type RollingWindowDays = 30 | 60 | 90;

export interface PerformanceMilestoneEvent {
  id: string;
  dayOffset: number; // e.g. -74 (days ago)
  date: string; // YYYY-MM-DD
  title: string;
  category: "infrastructure" | "optimization" | "network" | "deployment";
  description: string;
  impactMetric: string;
  impactDelta: string;
}

export interface DailyPerformanceTrendDataPoint {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "12 Haz"
  dayIndex: number; // -89 to 0 (0 is today)
  
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint (seconds, e.g., 1.15)
  inp: number; // Interaction to Next Paint (ms, e.g., 72)
  cls: number; // Cumulative Layout Shift (unitless, e.g., 0.02)
  fid: number; // First Input Delay (ms, e.g., 18)
  ttfb: number; // Time to First Byte (ms, e.g., 28)
  fcp: number; // First Contentful Paint (seconds, e.g., 0.65)
  
  // Rolling Moving Averages (calculated)
  lcp_ma?: number;
  inp_ma?: number;
  cls_ma?: number;
  fid_ma?: number;
  ttfb_ma?: number;
  fcp_ma?: number;
  
  // Visitor Metrics
  bounceRate: number; // Percentage (e.g., 23.8)
  bounceRate_ma?: number;
  dailyVisitors: number;
  avgSessionDurationSec: number;
  pagesPerSession: number;
  
  // Infrastructure Health
  healthScore: number; // 0 - 100
  healthScore_ma?: number;
  cwvPassStatus: "pass" | "needs-improvement" | "fail";
  
  // Milestone if any occurred on this day
  milestone?: PerformanceMilestoneEvent;
}

export interface CoreVitalCorrelationInsight {
  metricKey: CoreWebVitalMetricKey;
  metricLabel: string;
  unit: string;
  pearsonR: number; // Correlation with bounce rate (-1 to 1)
  direction: "positive" | "negative";
  elasticityStatement: string; // e.g., "Every 0.5s drop in LCP reduced bounce rate by 5.2%"
  googleTargetThreshold: number;
  isMeetingGoogleTarget: boolean;
  currentValue: number;
  initialValue: number;
  totalChangePercent: number;
  verdict: "critical_driver" | "moderate_driver" | "stable";
}

export interface PerformanceTrendsSummary {
  periodDays: number;
  startDate: string;
  endDate: string;
  overallHealthScoreCurrent: number;
  overallHealthScoreInitial: number;
  healthDeltaPercent: number;
  
  lcpCurrent: number;
  lcpInitial: number;
  lcpDeltaPercent: number;
  
  bounceRateCurrent: number;
  bounceRateInitial: number;
  bounceRateDeltaPercent: number;
  
  inpCurrent: number;
  inpInitial: number;
  inpDeltaPercent: number;
  
  clsCurrent: number;
  clsInitial: number;
  clsDeltaPercent: number;
  
  ttfbCurrent: number;
  ttfbInitial: number;
  ttfbDeltaPercent: number;
  
  totalMilestones: number;
  googleCwvPassRate: number; // e.g. 100%
  primaryCorrelationDriver: string;
}

// ==========================================
// AUTHENTICATION & MULTI-PORTAL USER TYPES
// ==========================================
export type UserRole = "admin" | "team_member" | "client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  status: "active" | "suspended" | "pending";
  assignedOrdersCount?: number;
  trialEndsAt?: string;
  isTrial?: boolean;
  trialExpired?: boolean;
  planName?: string;
  createdSitesCount?: number;
  maxAllowedSites?: number;
}

export interface AuthCredentials {
  email: string;
  password?: string;
}

export interface AuthRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

// ==========================================
// AI META-OPTIMIZER TYPES (GEMINI 3.8 FLASH)
// ==========================================
export type MetaProposalStyle = "high_ctr" | "trust" | "benefit" | "minimal";

export interface MetaOptimizationProposal {
  id: string;
  style: MetaProposalStyle;
  label: string;
  styleBadge: string;
  title: string;
  description: string;
  titleLength: number;
  descriptionLength: number;
  titleStatus: "optimal" | "warning" | "error";
  descriptionStatus: "optimal" | "warning" | "error";
  matchedKeywords: string[];
  ctrPotential: string; // e.g. "Çok Yüksek (%92+)"
  whyItWorks: string;
  recommendedCta: string;
}

export interface PageMetaOptimization {
  pageId: string;
  pageName: string;
  path: string;
  suggestedTitle: string;
  suggestedDescription: string;
  targetedKeywords: string[];
}

export interface AiMetaOptimizerResult {
  score: number; // 0 - 100
  evaluatedAt: string;
  industry: string;
  primaryKeywords: string[];
  currentTitleAnalysis: {
    title: string;
    charCount: number;
    status: "optimal" | "warning" | "error";
    feedback: string;
    keywordMatches: string[];
  };
  currentDescriptionAnalysis: {
    description: string;
    charCount: number;
    status: "optimal" | "warning" | "error";
    feedback: string;
    keywordMatches: string[];
  };
  proposals: MetaOptimizationProposal[];
  pageMetas?: PageMetaOptimization[];
  geminiInsights: string[];
}

// ==========================================
// AI SEO CONTENT PLANNER TYPES (30-Day Gemini Calendar)
// ==========================================
export type ContentPlanSearchIntent = "Bilgilendirici" | "Ticari" | "İşlemsel" | "Acil / Yerel";

export type ContentPlanContentType = 
  | "Nasıl Yapılır Rehberi" 
  | "Karşılaştırma & Analiz" 
  | "Maliyet & Fiyat Rehberi" 
  | "Vaka Analizi & Başarı Hikayesi" 
  | "Kontrol Listesi (Checklist)" 
  | "Sık Sorulan Sorular (FAQ)" 
  | "Piyasa Trendleri & İpuçları";

export type ContentPlanDayStatus = "planned" | "in-progress" | "published";

export interface ContentPlannerAudienceSegment {
  id: string;
  name: string;
  badge: string;
  description: string;
  searchIntent: ContentPlanSearchIntent;
  painPoints: string[];
  hookAngle: string;
  decisionFactors: string[];
}

export interface ContentPlannerPillar {
  id: string;
  name: string;
  description: string;
  targetKeywords: string[];
  colorTheme: string;
}

export interface ContentCalendarDay {
  day: number; // 1 to 30
  week: number; // 1 to 5
  headline: string; // Catchy primary headline (CTR optimized)
  alternativeHeadlines: string[]; // 2 catchy alternatives (question/number/curiosity)
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetAudienceId: string;
  targetAudienceName: string;
  audiencePainPoint: string;
  searchIntent: ContentPlanSearchIntent;
  contentType: ContentPlanContentType;
  estimatedMonthlySearchVolume: string; // e.g. "3,200 / ay"
  rankingPotential: "Hızlı Kazanım (Quick Win)" | "Otorite İnşası" | "Yüksek Dönüşüm" | "Viral / Sosyal Etki";
  keyTakeaways: string[]; // 3-4 bullet outline points
  callToAction: string;
  status: ContentPlanDayStatus;
  scheduledDate?: string; // YYYY-MM-DD
  notes?: string;
}

export interface AiContentPlanResponse {
  siteTitle: string;
  companyName: string;
  sector: string;
  city: string;
  strategyOverview: string;
  primaryAudienceSegments: ContentPlannerAudienceSegment[];
  contentPillars: ContentPlannerPillar[];
  days: ContentCalendarDay[];
  generatedAt: string;
  source: "gemini" | "algorithmic_fallback";
  totalExpectedMonthlyImpressions: string;
  keywordCoverageCount: number;
  strategicRecommendations: string[];
}

// ==========================================
// SEO TREND FORECAST (GEMINI & SEARCH GROUNDING) TYPES
// ==========================================
export type TrendCategory = "breakout" | "seasonal_surge" | "ai_overview" | "commercial_intent" | "long_tail";

export interface TrendTimelinePoint {
  month: string; // e.g. "Kas 25", "Ara 25", "Oca 26", "Şub 26", "Mar 26", "Nis 26"
  volumeIndex: number; // 0-100 normalized search momentum
  rawSearchVolume?: number; // approximate monthly search queries
  isForecast: boolean; // false for historic/current, true for projection
  confidenceLower?: number; // lower confidence bound
  confidenceUpper?: number; // upper confidence bound
  eventMarker?: string; // e.g. "Google AI Overview Değişimi", "Sezon Zirvesi"
}

export interface GroundingCitation {
  title: string;
  url: string;
  snippet?: string;
  sourceDomain?: string;
}

export interface EmergingSeoTrend {
  id: string;
  rank: number; // 1 to 5
  trendTitle: string; // e.g. "Yapay Zeka Destekli Akıllı Evden Eve Nakliyat Fiyatlandırması"
  primaryKeyword: string; // e.g. "yapay zeka nakliyat fiyat hesaplama"
  category: TrendCategory;
  categoryLabel: string; // e.g. "Kırılma Yaşayan Arama (Breakout)"
  growthPercentage: number; // e.g. 185 (+185% YoY)
  growthLabel: string; // e.g. "+185% Yıllık Artış"
  velocityStatus: "Patlama Yaşıyor" | "İstikrarlı Yükselişte" | "Erken Evre Keşif" | "Sezonsal Zirve";
  currentMonthlyVolume: string; // e.g. "4,200 / ay"
  projectedMonthlyVolume: string; // e.g. "12,600 / ay"
  opportunityScore: number; // 0-100 (higher = better ROI)
  competitionLevel: "Düşük" | "Orta" | "Yüksek";
  competitionScore: number; // 0-100 (lower = easier to rank)
  searchIntent: "Ticari (Commercial)" | "İşlemsel (Transactional)" | "Bilgilendirici (Informational)" | "Gezinme (Navigational)";
  whyItMatters: string; // Narrative grounded in real search patterns
  actionPlan: {
    recommendedHeadline: string;
    recommendedMetaDescription: string;
    suggestedPageSlug: string;
    targetAudience: string;
    estimatedTimeToRank: string; // e.g. "2-3 Hafta"
    strategicNextSteps: string[];
  };
  relatedQueries: string[];
  serpFeatures: string[]; // e.g. ["AI Overview", "People Also Ask", "Local 3-Pack"]
  timeline: TrendTimelinePoint[];
  color: string; // hex code for visual distinction
}

export interface SeoTrendForecastResponse {
  sector: string;
  industry: string;
  region: string;
  analyzedAt: string;
  macroSummary: string; // Strategic overview of consumer & B2B search behavior
  marketShiftHighlights: string[]; // 3-4 key industry shifts observed
  trends: EmergingSeoTrend[]; // Top 5 emerging trends
  searchGroundingQueries: string[];
  groundingCitations: GroundingCitation[];
  source: "gemini_grounding" | "algorithmic_fallback";
}

// ==========================================
// AI SEO CONTENT ASSISTANT (GEMINI BLOG OUTLINES & META-CONTENT)
// ==========================================

export type ContentSearchIntent = "Bilgilendirici" | "Ticari" | "Satın Alma / Yerel" | "Karşılaştırma";

export type ContentTone = "Uzman & Otoriter" | "Samimi & Rehber" | "Kurumsal & Güven Verici" | "Pratik & Adım Adım";

export type ContentAngle = 
  | "Kapsamlı Rehber (Ultimate Guide)"
  | "Fiyat & Maliyet Analizi"
  | "Adım Adım Nasıl Yapılır?"
  | "Sık Yapılan Hatalar & İpuçları"
  | "Karşılaştırma & Seçim Kriterleri";

export interface BlogOutlineSubheading {
  title: string; // H3
  bulletPoints: string[]; // Key talking points to cover
}

export interface BlogOutlineSection {
  id: string;
  heading: string; // H2
  purpose: string; // Why this section exists for SEO & reader
  targetKeywords: string[]; // Keywords to naturally weave
  subheadings: BlogOutlineSubheading[]; // H3s
  suggestedVisualOrBlock: string; // e.g. "Fiyat Karşılaştırma Tablosu", "Uyarı / Pro İpucu Kutusu", "Kontrol Listesi (Checklist)"
  estimatedWords: number;
}

export interface TitleOption {
  title: string;
  charCount: number;
  pixelWidth: number;
  ctrRating: "Çok Yüksek" | "Yüksek" | "Optimal";
  angleDescription: string;
}

export interface PeopleAlsoAskItem {
  question: string;
  conciseAnswer: string;
}

export interface InternalLinkingOpportunity {
  anchorText: string;
  targetPage: string;
  context: string;
}

export interface MetaContentOptimization {
  metaTitle: string;
  metaTitleLength: number;
  metaTitlePixelWidth: number;
  isMetaTitleOptimal: boolean;
  metaDescription: string;
  metaDescriptionLength: number;
  isMetaDescriptionOptimal: boolean;
  cleanSlug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  featuredImageAltText: string;
  schemaJsonLd: string; // Ready-to-copy BlogPosting/Article JSON-LD
}

export interface AiSeoContentAssistantResult {
  id: string;
  createdAt: string;
  source: "gemini_api" | "algorithmic_fallback";
  modelUsed: string;
  
  // SEO Core Parameters
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: ContentSearchIntent;
  targetAudience: string;
  contentAngle: ContentAngle;
  tone: ContentTone;
  estimatedReadingTime: string;
  targetWordCount: number;
  competitionDifficulty: "Düşük" | "Orta" | "Yüksek";

  // Blog Post Outline
  titleOptions: TitleOption[];
  selectedTitle: string;
  hookIntro: {
    hookLine: string;
    problemAgitation: string;
    valuePromise: string;
  };
  sections: BlogOutlineSection[];
  featuredSnippetSummary: string; // 40-55 word direct answer for Google Answer Box / AI Overviews
  peopleAlsoAsk: PeopleAlsoAskItem[];
  internalLinks: InternalLinkingOpportunity[];
  callToActionPlan: {
    placement: string;
    ctaHeadline: string;
    ctaButtonText: string;
    ctaDescription: string;
  };
  eeatChecklist: {
    experience: string;
    expertise: string;
    authoritativeness: string;
    trustworthiness: string;
  };

  // Meta-Content
  metaContent: MetaContentOptimization;
}

export interface AiSeoContentAssistantRequest {
  primaryKeyword: string;
  secondaryKeywords?: string[];
  topicHint?: string;
  searchIntent?: ContentSearchIntent;
  contentAngle?: ContentAngle;
  tone?: ContentTone;
  targetAudience?: string;
  targetWordCount?: number;
  companyName?: string;
  sector?: string;
  city?: string;
  siteServices?: string[];
}



