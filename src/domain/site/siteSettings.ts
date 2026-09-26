/**
 * JetKur Canonical Data Architecture - Site Settings Domain
 *
 * ARCHITECTURAL PRINCIPLE:
 * SiteSettings contains technical, infrastructure, deployment,
 * SEO engine, third-party integration, and operational runtime configurations.
 *
 * It is completely separated from business profile information and design tokens.
 */

export type SiteStructureMode = "single-page" | "multi-page";

export interface CustomDomainConfig {
  hostname: string;
  isCustom: boolean;
  status: "active" | "pending_dns" | "verifying" | "error";
  sslActive: boolean;
  verifiedAt?: string;
  dnsRecords?: Array<{
    type: "A" | "CNAME" | "TXT";
    name: string;
    value: string;
  }>;
}

export interface DeploymentConfig {
  provider: "cloudflare_pages" | "edge_cdn" | "self_hosted";
  status: "idle" | "building" | "deployed" | "error";
  productionUrl?: string;
  previewUrl?: string;
  lastDeployedAt?: string;
  buildTimeMs?: number;
  deploymentId?: string;
}

export interface JsonLdStructuredDataConfig {
  enabled: boolean;
  autoInjectLocalBusiness: boolean;
  autoInjectProducts: boolean;
  autoInjectFaq: boolean;
  autoInjectBreadcrumbs: boolean;
  businessType: string;
  priceRange?: string;
  currency?: string;
}

export interface TechnicalSeoConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  author: string;
  robots: string; // e.g. "index, follow"
  canonicalUrl?: string;
  ogImageUrl?: string;
  twitterHandle?: string;
  googleSearchConsoleTag?: string;
  schemaConfig: JsonLdStructuredDataConfig;
  pageOverrides?: Record<
    string,
    {
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      ogImage?: string;
    }
  >;
}

export interface AnalyticsIntegrations {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  yandexMetrikaId?: string;
}

export interface WhatsAppFloatingWidgetConfig {
  enabled: boolean;
  phoneNumber?: string; // If omitted, defaults to BusinessProfile.contact.whatsapp
  defaultMessage: string;
  position: "bottom-right" | "bottom-left";
  showOnlineBadge: boolean;
  agentName?: string;
  agentAvatarUrl?: string;
}

export interface LeadHandlingConfig {
  notificationEmail?: string;
  slackWebhookUrl?: string;
  enableInstantEmailNotification: boolean;
  autoArchiveDays?: number;
  thankYouEmailAutoresponder?: {
    enabled: boolean;
    subject: string;
    bodyHtml: string;
    senderName?: string;
  };
}

export interface PerformancePreferences {
  enableEdgeCache: boolean;
  lazyLoadImages: boolean;
  minifyStaticHtml: boolean;
  criticalCssInline: boolean;
}

export interface LocaleSettings {
  defaultLocale: string; // e.g. "tr"
  supportedLocales: string[];
}

/**
 * The Canonical SiteSettings Aggregate
 */
export interface SiteSettings {
  structureMode: SiteStructureMode;
  domain: CustomDomainConfig;
  deployment: DeploymentConfig;
  seo: TechnicalSeoConfig;
  analytics: AnalyticsIntegrations;
  whatsappWidget: WhatsAppFloatingWidgetConfig;
  leads: LeadHandlingConfig;
  performance: PerformancePreferences;
  locale: LocaleSettings;
}
