/**
 * JetKur Canonical Data Architecture - Legacy Adapter
 *
 * PURPOSE:
 * Provides a non-destructive bidirectional bridge between legacy `SiteConfig`
 * and the newly introduced `CanonicalSite` domain aggregate.
 *
 * In accordance with Sprint 01 principles:
 * - DATA COMPATIBILITY REQUIRED = NO (no real customer production data exists yet)
 * - TEMPORARY APPLICATION COMPATIBILITY = YES (ensure zero runtime breakages)
 */

import { SiteConfig } from "../../types";
import { CanonicalSite } from "./site";
import { BusinessProfile } from "./businessProfile";
import { ActiveDesignConfig } from "./designTemplate";
import { SectionConfiguration, SiteSectionItem, CanonicalSectionType } from "./sectionConfiguration";
import { SiteContent } from "./siteContent";
import { SiteSettings } from "./siteSettings";

/**
 * Transforms a legacy SiteConfig into the canonical Site aggregate model.
 */
export function fromLegacySiteConfig(legacy: SiteConfig): CanonicalSite {
  // 1. Business Profile
  const businessProfile: BusinessProfile = {
    identity: {
      companyName: legacy.companyName || "İşletme Adı",
      brandName: legacy.companyName,
      sector: legacy.sector || "general",
      industryPackId: undefined,
      slogan: legacy.slogan || "",
      shortDescription: legacy.slogan || "",
      story: legacy.about?.content || "",
      foundingYear: undefined,
      taxId: legacy.schemaConfig?.taxId,
    },
    contact: {
      phone: legacy.phone || "",
      whatsapp: legacy.whatsapp || "",
      email: legacy.email || "",
      supportEmail: undefined,
    },
    location: {
      address: legacy.address || "",
      city: legacy.city || "",
      district: "",
      postalCode: legacy.schemaConfig?.postalCode,
      country: "Türkiye",
      serviceAreas: legacy.schemaConfig?.areaServed ? [legacy.schemaConfig.areaServed] : [],
      geoCoordinates:
        legacy.schemaConfig?.latitude && legacy.schemaConfig?.longitude
          ? {
              latitude: parseFloat(legacy.schemaConfig.latitude) || 0,
              longitude: parseFloat(legacy.schemaConfig.longitude) || 0,
            }
          : undefined,
      googleMapsEmbedUrl: legacy.googleMapsEmbed,
    },
    branding: {
      logoUrl: legacy.logo,
      logoAlt: legacy.hero?.logoAlt,
      faviconUrl: legacy.favicon,
      brandColors: {
        primary: legacy.palette?.primary,
        secondary: legacy.palette?.secondary,
        accent: legacy.palette?.accent,
      },
    },
    workingHours: {
      raw: legacy.workingHours || "Hafta İçi: 09:00 - 18:00",
      is24x7Emergency: legacy.workingHours?.toLowerCase().includes("7/24"),
    },
    services: (legacy.services?.items || []).map((srv) => ({
      id: srv.id,
      title: srv.title,
      slug: srv.slug || srv.id,
      shortDescription: srv.desc || "",
      fullDescription: srv.longContent || srv.longDesc,
      priceHint: srv.price,
      features: srv.features || [],
      icon: srv.icon,
      imageUrl: srv.image,
      featured: true,
      specs: srv.specs,
    })),
    metrics: {
      yearsOfExperience: parseInt(legacy.about?.yearsExperience || "0", 10) || undefined,
      completedJobsCount: parseInt(legacy.about?.completedProjects || "0", 10) || undefined,
    },
    social: {
      instagram: legacy.socialMedia?.instagram,
      facebook: legacy.socialMedia?.facebook,
      twitter: legacy.socialMedia?.twitter,
      linkedin: legacy.socialMedia?.linkedin,
      youtube: legacy.socialMedia?.youtube,
    },
  };

  // 2. Active Design Config
  const designTemplate: ActiveDesignConfig = {
    templateId: legacy.templateId || "modern",
    templateSlug: legacy.templateId || "modern",
    customTokens: {
      palette: {
        primary: legacy.palette?.primary || "#1e40af",
        primaryDark: legacy.palette?.primaryDark || "#1e3a8a",
        secondary: legacy.palette?.secondary || "#0d9488",
        accent: legacy.palette?.accent || "#f59e0b",
        text: legacy.palette?.text || "#0f172a",
        textMuted: "#64748b",
        background: legacy.palette?.bg || "#ffffff",
        surface: "#f8fafc",
        border: "#e2e8f0",
      },
      typography: {
        fontHeading: legacy.fontFamily || "Inter, sans-serif",
        fontBody: legacy.fontFamily || "Inter, sans-serif",
        headingWeight: "700",
        baseFontSize: "16px",
      },
      geometry: {
        borderRadius: (legacy.borderRadius as any) || "md",
        containerMaxWidth: "wide",
        sectionSpacing: "normal",
        cardStyle: "subtle-shadow",
      },
    },
  };

  // 3. Section Configuration
  const validSectionTypes: Record<string, CanonicalSectionType> = {
    hero: "hero",
    services: "services",
    about: "about",
    whyUs: "whyUs",
    gallery: "gallery",
    pricing: "pricing",
    testimonials: "testimonials",
    faq: "faqs",
    faqs: "faqs",
    contact: "contact",
    products: "products",
    catalog: "products",
    blog: "blog",
    newsletter: "newsletter",
    socialFeed: "socialFeed",
  };

  const sections: SiteSectionItem[] = (legacy.homepageSections || []).map((sec, idx) => ({
    id: sec.id,
    type: validSectionTypes[sec.id] || "customHtml",
    label: sec.name || sec.id,
    enabled: sec.enabled ?? true,
    order: sec.order ?? idx,
    variant: "default",
    options: {},
  }));

  const sectionConfiguration: SectionConfiguration = {
    sections,
    header: {
      sticky: true,
      showPhoneButton: legacy.header?.showPhoneButton ?? true,
      showWhatsAppButton: legacy.header?.showWhatsappButton ?? true,
      showCtaButton: legacy.header?.showQuoteButton ?? true,
      ctaText: legacy.header?.quoteButtonText || "Teklif Al",
      ctaTarget: "#contact",
      navLinks: (legacy.header?.navItems || []).map((nav) => ({
        id: nav.id,
        label: nav.label,
        target: nav.target,
        visible: nav.visible,
        order: nav.order,
      })),
    },
    footer: {
      showWorkingHours: true,
      showSocialIcons: legacy.footer?.showSocials ?? true,
      showQuickLinks: true,
      showCopyright: Boolean(legacy.footer?.copyrightText),
      customDisclaimer: legacy.footer?.aboutText,
    },
  };

  // 4. Site Content
  const content: SiteContent = {
    hero: {
      badge: legacy.hero?.badge || "",
      title: legacy.hero?.title || "",
      subtitle: legacy.hero?.subtitle || "",
      ctaPrimaryText: legacy.hero?.ctaPrimaryText || "",
      ctaPrimaryLink: legacy.hero?.ctaPrimaryLink || "",
      ctaSecondaryText: legacy.hero?.ctaSecondaryText || "",
      ctaSecondaryLink: legacy.hero?.ctaSecondaryLink || "",
      bgImageUrl: legacy.hero?.bgImage || "",
      bgImageAlt: legacy.hero?.bgImageAlt,
      slides: legacy.hero?.slides?.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        badge: s.badge,
        imageUrl: s.bgImage,
        ctaText: s.ctaPrimaryText,
        ctaLink: s.ctaPrimaryLink,
      })),
      stats: legacy.hero?.stats || [],
    },
    about: {
      badge: legacy.about?.badge || "",
      title: legacy.about?.title || "",
      contentHtml: legacy.about?.content || "",
      yearsExperience: legacy.about?.yearsExperience,
      completedProjects: legacy.about?.completedProjects,
      bulletPoints: legacy.about?.bullets || [],
      imageUrl: legacy.about?.image || "",
      imageAlt: legacy.about?.imageAlt,
    },
    whyUs: {
      badge: legacy.whyUs?.badge || "",
      title: legacy.whyUs?.title || "",
      subtitle: legacy.whyUs?.subtitle || "",
      items: (legacy.whyUs?.items || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.desc,
        icon: item.icon,
      })),
    },
    contact: {
      badge: legacy.contact?.badge || "",
      title: legacy.contact?.title || "",
      subtitle: legacy.contact?.subtitle || "",
    },
    gallery: (legacy.gallery?.items || []).map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      imageUrl: g.imageUrl,
      altText: g.altText || g.imageAlt,
      caption: g.caption,
    })),
    testimonials: (legacy.testimonials?.items || []).map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      comment: t.comment,
      rating: t.rating,
      avatarUrl: t.avatar,
      altText: t.altText || t.avatarAlt,
      date: t.date,
      verified: t.verified,
    })),
    faqs: (legacy.faqs?.items || legacy.faq?.items || []).map((f) => ({
      id: f.id,
      question: f.question || f.q,
      answer: f.answer || f.a,
      category: f.category,
      isOpenDefault: f.isOpenDefault,
    })),
    pricingPlans: (legacy.pricing?.items || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      period: p.period,
      description: p.description || p.desc || "",
      badge: p.badge,
      features: p.features || [],
      ctaButtonText: p.cta,
      ctaButtonLink: "#contact",
      isPopular: p.popular || p.highlighted,
    })),
    customPages: (legacy.pages || []).map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      contentHtml: page.content,
      bannerImageUrl: page.bannerImage,
      isNavVisible: page.isNavVisible,
      seoTitle: page.seoTitle,
      metaDescription: page.metaDescription,
    })),
    blogPosts: (legacy.blog?.items || []).map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      category: b.category,
      excerpt: b.excerpt,
      contentHtml: b.content,
      readTime: b.readTime,
      date: b.date,
      author: b.author,
      coverImageUrl: b.coverImage || b.image,
      tags: b.tags || [],
      seoTitle: b.seoTitle,
      seoDescription: b.seoDescription,
    })),
    catalogProducts: (legacy.products?.items || []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug || p.id,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      shortDescription: p.shortDescription,
      descriptionHtml: p.description,
      images: p.images || (p.featuredImage ? [p.featuredImage] : []),
      inStock: p.inStock,
      badge: p.badge,
      specs: p.specs,
    })),
  };

  // 5. Site Settings
  const settings: SiteSettings = {
    structureMode: legacy.siteType === "multi-page" ? "multi-page" : "single-page",
    domain: {
      hostname: legacy.customDomain || `${legacy.id}.jetkur.site`,
      isCustom: Boolean(legacy.customDomain),
      status: legacy.cloudflare?.status === "deployed" ? "active" : "pending_dns",
      sslActive: Boolean(legacy.cloudflare?.sslActive),
    },
    deployment: {
      provider: "cloudflare_pages",
      status: legacy.cloudflare?.status || "idle",
      productionUrl: legacy.cloudflare?.deployedUrl,
      lastDeployedAt: legacy.cloudflare?.lastDeployedAt,
    },
    seo: {
      metaTitle: legacy.seo?.metaTitle || legacy.companyName || "",
      metaDescription: legacy.seo?.metaDescription || "",
      keywords: legacy.seo?.keywords || "",
      author: legacy.seo?.author || legacy.companyName || "",
      robots: legacy.seo?.robots || "index, follow",
      canonicalUrl: legacy.seo?.canonicalUrl,
      ogImageUrl: legacy.seo?.ogImage,
      twitterHandle: legacy.seo?.twitterHandle,
      googleSearchConsoleTag: legacy.seo?.googleSearchConsoleTag,
      schemaConfig: {
        enabled: legacy.schemaConfig?.enabled ?? true,
        businessType: legacy.schemaConfig?.businessType || "LocalBusiness",
        autoInjectLocalBusiness: legacy.schemaConfig?.autoInjectLocalBusiness ?? true,
        autoInjectProducts: legacy.schemaConfig?.autoInjectProducts ?? true,
        autoInjectFaq: legacy.schemaConfig?.autoInjectFaq ?? true,
        autoInjectBreadcrumbs: legacy.schemaConfig?.autoInjectBreadcrumbs ?? true,
        priceRange: legacy.schemaConfig?.priceRange,
        currency: legacy.schemaConfig?.currency || "TRY",
      },
    },
    analytics: {},
    whatsappWidget: {
      enabled: legacy.whatsappWidget?.enabled ?? true,
      phoneNumber: legacy.whatsappWidget?.phoneNumber || legacy.whatsapp,
      defaultMessage:
        legacy.whatsappWidget?.defaultMessage ||
        "Merhaba, web sitenizden ulaşıyorum. Hizmetleriniz hakkında bilgi alabilir miyim?",
      position: legacy.whatsappWidget?.position || "bottom-right",
      showOnlineBadge: legacy.whatsappWidget?.showBadgeDot ?? true,
      agentName: legacy.whatsappWidget?.agentName,
      agentAvatarUrl: undefined,
    },
    leads: {
      enableInstantEmailNotification: Boolean(legacy.leadNotifications?.enabled),
      notificationEmail: legacy.leadNotifications?.email?.recipientEmails,
      autoArchiveDays: legacy.leadAutoArchive?.enabled ? legacy.leadAutoArchive.daysInactive : undefined,
      thankYouEmailAutoresponder: legacy.leadThankYouEmail
        ? {
            enabled: legacy.leadThankYouEmail.enabled,
            subject: legacy.leadThankYouEmail.subject,
            bodyHtml: legacy.leadThankYouEmail.body,
            senderName: legacy.leadThankYouEmail.senderName,
          }
        : undefined,
    },
    performance: {
      enableEdgeCache: true,
      lazyLoadImages: true,
      minifyStaticHtml: true,
      criticalCssInline: true,
    },
    locale: {
      defaultLocale: "tr",
      supportedLocales: ["tr"],
    },
  };

  return {
    id: legacy.id,
    schemaVersion: "1.0.0",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    businessProfile,
    industryPackId: undefined,
    designTemplate,
    sectionConfiguration,
    content,
    settings,
  };
}
