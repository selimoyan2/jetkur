/**
 * JetKur Multi-Tenant Persistence Fixtures (Sprint 02)
 *
 * Demonstrates:
 * 1. User -> WorkspaceMember -> Workspace -> Sites hierarchy
 * 2. Multi-tenant Agency managing multiple client sites
 * 3. SME Business managing a single authentic local business site
 * 4. Invariant: SITE != DEPLOYMENT with decoupled Domains and Deployments
 */

import { sampleCanonicalSite } from "../../domain/site/fixtures";
import { CanonicalSite } from "../../domain/site";

export interface MultiTenantSeedData {
  users: Array<{
    id: string;
    email: string;
    name: string;
    status: "ACTIVE" | "INVITED" | "SUSPENDED";
  }>;
  workspaces: Array<{
    id: string;
    name: string;
    type: "BUSINESS" | "AGENCY" | "PLATFORM";
    members: Array<{
      userId: string;
      role: "OWNER" | "ADMIN" | "MEMBER";
    }>;
  }>;
  sites: Array<{
    workspaceId: string;
    slug: string;
    canonicalSite: CanonicalSite;
    domains: Array<{
      hostname: string;
      isCustom: boolean;
      isPrimary: boolean;
      status: "PENDING_DNS" | "VERIFYING" | "ACTIVE" | "ERROR";
      sslActive: boolean;
    }>;
    deployments: Array<{
      provider: "CLOUDFLARE_PAGES" | "EDGE_CDN" | "SELF_HOSTED";
      status: "IDLE" | "BUILDING" | "DEPLOYED" | "ERROR";
      productionUrl?: string;
      previewUrl?: string;
      deploymentId?: string;
      buildTimeMs?: number;
    }>;
  }>;
}

export const sampleMultiTenantData: MultiTenantSeedData = {
  users: [
    {
      id: "usr_agency_lead",
      email: "selim@jetkur.com",
      name: "Selim Oyan (Ajans Direktörü)",
      status: "ACTIVE",
    },
    {
      id: "usr_sme_owner",
      email: "mehmet@usta-tesisat.com",
      name: "Mehmet Usta (Tesisatçı)",
      status: "ACTIVE",
    },
    {
      id: "usr_dentist_client",
      email: "dr.ayse@marmaradis.com",
      name: "Dr. Ayşe Yılmaz",
      status: "ACTIVE",
    },
  ],

  workspaces: [
    {
      id: "ws_agency_alpha",
      name: "JetKur Dijital Çözüm Ajansı",
      type: "AGENCY",
      members: [
        {
          userId: "usr_agency_lead",
          role: "OWNER",
        },
      ],
    },
    {
      id: "ws_sme_plumber",
      name: "Usta Tesisat Kadıköy İşletmesi",
      type: "BUSINESS",
      members: [
        {
          userId: "usr_sme_owner",
          role: "OWNER",
        },
        {
          // Agency lead invited as ADMIN consultant to manage the SME site
          userId: "usr_agency_lead",
          role: "ADMIN",
        },
      ],
    },
  ],

  sites: [
    // Site 1: Dedicated SME Site under ws_sme_plumber
    {
      workspaceId: "ws_sme_plumber",
      slug: "usta-tesisat-kadikoy",
      canonicalSite: sampleCanonicalSite,
      domains: [
        {
          hostname: "ustatesisat.com.tr",
          isCustom: true,
          isPrimary: true,
          status: "ACTIVE",
          sslActive: true,
        },
        {
          hostname: "usta-tesisat.jetkur.app",
          isCustom: false,
          isPrimary: false,
          status: "ACTIVE",
          sslActive: true,
        },
      ],
      deployments: [
        {
          provider: "CLOUDFLARE_PAGES",
          status: "DEPLOYED",
          productionUrl: "https://ustatesisat.com.tr",
          previewUrl: "https://d12345.jetkur-edge.workers.dev",
          deploymentId: "cf-dep-98231",
          buildTimeMs: 420,
        },
      ],
    },

    // Site 2: Client Site 1 under Agency Workspace
    {
      workspaceId: "ws_agency_alpha",
      slug: "marmara-dis-poliklinigi",
      canonicalSite: {
        id: "site_client_dentist",
        schemaVersion: "1.0.0",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        industryPackId: "pack-dentist-tr",
        businessProfile: {
          identity: {
            companyName: "Marmara Diş Polikliniği",
            sector: "Diş Hekimliği & İmplantoloji",
            slogan: "Gülüşünüz Sağlığınızdır",
            shortDescription: "Kadıköy Bağdat Caddesi'nde uzman hekimler eşliğinde ağrısız implant ve estetik gülüş tasarımı.",
          },
          contact: {
            phone: "0216 333 44 55",
            email: "randevu@marmaradis.com",
            whatsapp: "0533 111 22 33",
          },
          location: {
            address: "Bağdat Caddesi No: 142/3",
            city: "İstanbul",
            district: "Kadıköy",
            serviceAreas: ["Kadıköy", "Suadiye", "Caddebostan", "Maltepe"],
          },
          workingHours: {
            raw: "Hafta İçi: 09:00 - 20:00, Cumartesi: 10:00 - 18:00",
          },
          branding: {
            logoUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300",
          },
          services: [
            {
              id: "srv_implant",
              title: "Zirkonyum & Titanyum İmplant",
              slug: "zirkonyum-implant",
              shortDescription: "Ağrısız, tek seansta dijital kılavuzlu cerrahi implant tedavisi.",
              icon: "Sparkles",
            },
            {
              id: "srv_whitening",
              title: "Lazerle Diş Beyazlatma",
              slug: "dis-beyazlatma",
              shortDescription: "30 dakikada 4-6 tona kadar doğal ve kalıcı beyazlık.",
              icon: "Smile",
            },
          ],
          social: {
            instagram: "https://instagram.com/marmaradis",
          },
        },
        designTemplate: {
          templateId: "template-medical-clean-v1",
          templateSlug: "medical-clean",
          customTokens: {
            palette: {
              primary: "#0284C7",
              primaryDark: "#0369A1",
              secondary: "#0F172A",
              accent: "#06B6D4",
              background: "#FFFFFF",
              surface: "#F0F9FF",
              text: "#0F172A",
              textMuted: "#64748B",
              border: "#E2E8F0",
            },
            typography: {
              fontHeading: "Plus Jakarta Sans, sans-serif",
              fontBody: "Inter, sans-serif",
              headingWeight: "700",
              baseFontSize: "16px",
            },
            geometry: {
              borderRadius: "lg",
              containerMaxWidth: "wide",
              sectionSpacing: "normal",
              cardStyle: "elevated",
            },
          },
        },
        sectionConfiguration: {
          sections: [
            { id: "sec_hero", type: "hero", enabled: true, order: 1, variant: "split" },
            { id: "sec_services", type: "services", enabled: true, order: 2, variant: "grid" },
            { id: "sec_about", type: "about", enabled: true, order: 3, variant: "image-left" },
            { id: "sec_contact", type: "contact", enabled: true, order: 4, variant: "map-beside" },
          ],
          header: {
            sticky: true,
            showPhoneButton: true,
            showWhatsAppButton: true,
            showCtaButton: true,
            ctaText: "Randevu Al",
            ctaTarget: "tel:02163334455",
            navLinks: [
              { id: "lnk-1", label: "Tedaviler", target: "#services", visible: true, order: 0 },
              { id: "lnk-2", label: "Hekimlerimiz", target: "#about", visible: true, order: 1 },
              { id: "lnk-3", label: "Randevu & İletişim", target: "#contact", visible: true, order: 2 },
            ],
          },
          footer: {
            showWorkingHours: true,
            showSocialIcons: true,
            showQuickLinks: true,
            showCopyright: true,
          },
        },
        content: {
          hero: {
            badge: "SGK & Özel Sigorta Anlaşmalı",
            title: "Marmara Diş Polikliniği - Dijital Diş Hekimliği",
            subtitle: "Uzman kadro ve ağrısız ileri teknoloji ile sağlıklı gülüşler.",
            ctaPrimaryText: "Randevu Al",
            ctaPrimaryLink: "tel:02163334455",
            ctaSecondaryText: "WhatsApp",
            ctaSecondaryLink: "https://wa.me/05331112233",
            bgImageUrl: "",
          },
          about: {
            badge: "Hakkımızda",
            title: "Hakkımızda & Hekim Kadromuz",
            contentHtml: "20 yılı aşkın klinik tecrübemiz ile hastalarımıza güven ve konfor sunuyoruz.",
            bulletPoints: ["Modern Teknoloji", "Uzman Hekim Kadrosu"],
            imageUrl: "",
          },
          whyUs: {
            badge: "Neden Biz?",
            title: "Sağlıklı ve Estetik Gülüşler",
            subtitle: "En güncel teknolojilerle yanınızdayız.",
            items: [],
          },
          contact: {
            badge: "İletişim",
            title: "Klinik Randevu",
            subtitle: "Hemen randevu oluşturun.",
          },
          gallery: [],
          testimonials: [],
          faqs: [],
          pricingPlans: [],
          blogPosts: [],
          catalogProducts: [],
          customPages: [],
        },
        settings: {
          structureMode: "single-page",
          domain: {
            hostname: "marmaradis.com",
            isCustom: true,
            status: "active",
            sslActive: true,
          },
          deployment: {
            provider: "cloudflare_pages",
            status: "deployed",
            productionUrl: "https://marmaradis.com",
          },
          seo: {
            metaTitle: "Marmara Diş Polikliniği | Kadıköy İmplant & Estetik Diş",
            metaDescription: "Bağdat Caddesi'nde uzman hekimler eşliğinde ağrısız implant ve estetik gülüş tasarımı.",
            keywords: "kadıköy diş kliniği, implant, diş beyazlatma",
            author: "Marmara Diş Polikliniği",
            robots: "index, follow",
            schemaConfig: {
              enabled: true,
              autoInjectLocalBusiness: true,
              autoInjectProducts: false,
              autoInjectFaq: true,
              autoInjectBreadcrumbs: true,
              businessType: "Dentist",
            },
          },
          analytics: {},
          whatsappWidget: {
            enabled: true,
            phoneNumber: "0533 111 22 33",
            defaultMessage: "Merhaba, muayene ve randevu hakkında bilgi almak istiyorum.",
            position: "bottom-right",
            showOnlineBadge: true,
          },
          leads: {
            notificationEmail: "randevu@marmaradis.com",
            enableInstantEmailNotification: true,
          },
          performance: {
            enableEdgeCache: true,
            lazyLoadImages: true,
            minifyStaticHtml: true,
            criticalCssInline: true,
          },
          locale: {
            defaultLocale: "tr",
            supportedLocales: ["tr", "en"],
          },
        },
      },
      domains: [
        {
          hostname: "marmaradis.com",
          isCustom: true,
          isPrimary: true,
          status: "ACTIVE",
          sslActive: true,
        },
      ],
      deployments: [
        {
          provider: "CLOUDFLARE_PAGES",
          status: "DEPLOYED",
          productionUrl: "https://marmaradis.com",
          deploymentId: "cf-dep-44910",
          buildTimeMs: 380,
        },
      ],
    },
  ],
};
