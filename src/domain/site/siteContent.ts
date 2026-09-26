/**
 * JetKur Canonical Data Architecture - Site Content Domain
 *
 * ARCHITECTURAL ANALYSIS & PRINCIPLE:
 * Content MUST be an independent domain separate from BusinessProfile and DesignTemplate.
 *
 * Reasons:
 * 1. Portability: BusinessProfile contains factual identity (Phone, Tax ID, Address).
 *    SiteContent contains marketing copy (Headlines, About stories, FAQs, Blog posts).
 * 2. Multi-language (i18n): Translating a site requires translating SiteContent,
 *    not duplicating business operational records or technical settings.
 * 3. AI Copilot / Revisions: Content generation and SEO rewrites operate strictly
 *    on SiteContent without mutating template tokens or business credentials.
 * 4. Revision History: Content can be drafted, rolled back, or scheduled
 *    independently of design switches.
 */

export interface HeroSlideItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  bgImageUrl: string;
  bgImageAlt?: string;
  slides?: HeroSlideItem[];
  stats?: Array<{ label: string; value: string }>;
}

export interface AboutContent {
  badge: string;
  title: string;
  contentHtml: string;
  yearsExperience?: string;
  completedProjects?: string;
  bulletPoints: string[];
  imageUrl: string;
  imageAlt?: string;
}

export interface WhyUsCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface WhyUsContent {
  badge: string;
  title: string;
  subtitle: string;
  items: WhyUsCardItem[];
}

export interface GalleryMediaItem {
  id: string;
  title: string;
  category?: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
}

export interface TestimonialReviewItem {
  id: string;
  name: string;
  role?: string;
  company?: string;
  comment: string;
  rating: number; // 1 to 5
  avatarUrl?: string;
  altText?: string;
  date?: string;
  verified?: boolean;
}

export interface FaqEntryItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isOpenDefault?: boolean;
}

export interface PricingPlanItem {
  id: string;
  name: string;
  price: string;
  period?: string; // e.g. "aylık", "tek seferlik"
  description?: string;
  badge?: string;
  features: string[];
  ctaButtonText?: string;
  ctaButtonLink?: string;
  isPopular?: boolean;
}

export interface CustomPageContentItem {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  bannerImageUrl?: string;
  isNavVisible: boolean;
  seoTitle?: string;
  metaDescription?: string;
}

export interface BlogPostContentItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt: string;
  contentHtml: string;
  readTime: string;
  date: string;
  author: string;
  coverImageUrl?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface CatalogProductItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: string;
  oldPrice?: string;
  shortDescription?: string;
  descriptionHtml: string;
  images: string[];
  inStock: boolean;
  badge?: string;
  features?: string[];
  specs?: Array<{ label: string; value: string }>;
}

export interface ContactSectionContent {
  badge: string;
  title: string;
  subtitle: string;
  formTitle?: string;
  formSubmitButtonText?: string;
  formSuccessMessage?: string;
}

/**
 * The Canonical SiteContent Aggregate
 */
export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  whyUs: WhyUsContent;
  contact: ContactSectionContent;
  gallery: GalleryMediaItem[];
  testimonials: TestimonialReviewItem[];
  faqs: FaqEntryItem[];
  pricingPlans: PricingPlanItem[];
  customPages: CustomPageContentItem[];
  blogPosts: BlogPostContentItem[];
  catalogProducts: CatalogProductItem[];
}
