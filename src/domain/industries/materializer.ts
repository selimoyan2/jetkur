/**
 * JetKur Industry Starter Content Materialization Engine (Sprint 05)
 *
 * Invariant:
 * Materializes starter SiteContent from a platform-owned IndustryPack
 * and an SME BusinessProfile.
 *
 * This is a PURE function. It does NOT mutate the IndustryPack,
 * nor does it overwrite existing customer content on subsequent runs.
 */

import { IndustryPack } from "./types";
import { BusinessProfile } from "../site/businessProfile";
import { SiteContent } from "../site/siteContent";

export interface MaterializationContext {
  companyName?: string;
  city?: string;
  district?: string;
  primaryService?: string;
  phone?: string;
  email?: string;
}

/**
 * Deterministic, safe placeholder replacement without eval() or new Function()
 */
export function interpolatePlaceholders(template: string, ctx: MaterializationContext): string {
  if (!template || typeof template !== "string") return "";

  const replacements: Record<string, string> = {
    "{{businessName}}": ctx.companyName || "İşletmemiz",
    "{{companyName}}": ctx.companyName || "İşletmemiz",
    "{{city}}": ctx.city || "İstanbul",
    "{{district}}": ctx.district || "Merkez",
    "{{primaryService}}": ctx.primaryService || "Hizmetlerimiz",
    "{{phone}}": ctx.phone || "",
    "{{email}}": ctx.email || "",
  };

  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }

  return result;
}

/**
 * Materializes initial starter SiteContent from IndustryPack and optional BusinessProfile
 */
export function materializeIndustryStarterContent(
  pack: IndustryPack,
  profile?: Partial<BusinessProfile>
): SiteContent {
  const companyName = profile?.identity?.companyName || pack.name;
  const city = profile?.location?.city || "İstanbul";
  const district = profile?.location?.district || "Merkez";
  const primaryService =
    profile?.services?.[0]?.title || pack.defaultServices[0]?.title || "Hizmet";
  const phone = profile?.contact?.phone || "";
  const email = profile?.contact?.email || "";

  const ctx: MaterializationContext = {
    companyName,
    city,
    district,
    primaryService,
    phone,
    email,
  };

  const heroBadge = pack.contentDefaults.heroBadges[0]
    ? interpolatePlaceholders(pack.contentDefaults.heroBadges[0], ctx)
    : "Profesyonel Hizmet";

  const heroTitle = pack.contentDefaults.heroHeadlines[0]
    ? interpolatePlaceholders(pack.contentDefaults.heroHeadlines[0], ctx)
    : `${companyName} - Güvenilir Çözümler`;

  const heroSubtitle = pack.contentDefaults.heroSubtitles[0]
    ? interpolatePlaceholders(pack.contentDefaults.heroSubtitles[0], ctx)
    : "Sektöründe öncü, kaliteli ve garantili hizmet.";

  const aboutStory = interpolatePlaceholders(pack.contentDefaults.aboutStoryTemplate, ctx);

  const fallbackHeroImage =
    pack.imageIntents.find((i) => i.key === "hero-bg")?.fallbackUrl ||
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80";

  // Build FAQs as independent deep copy
  const faqs = pack.defaultFaqs.map((faq, idx) => ({
    id: `faq-${idx + 1}`,
    question: interpolatePlaceholders(faq.question, ctx),
    answer: interpolatePlaceholders(faq.answer, ctx),
    category: faq.category || "Genel",
    isOpenDefault: idx === 0,
  }));

  // Build WhyUs items as independent deep copy
  const whyUsItems = pack.contentDefaults.whyUsItems.map((item, idx) => ({
    id: `why-${idx + 1}`,
    title: interpolatePlaceholders(item.title, ctx),
    description: interpolatePlaceholders(item.description, ctx),
    icon: item.icon,
  }));

  // Build default stats
  const stats = (pack.contentDefaults.defaultStats || []).map((s) => ({
    label: s.label,
    value: s.value,
  }));

  return {
    hero: {
      badge: heroBadge,
      title: heroTitle,
      subtitle: heroSubtitle,
      ctaPrimaryText: pack.contentDefaults.primaryCta.text,
      ctaPrimaryLink: phone ? `tel:${phone.replace(/\s+/g, "")}` : "#contact",
      ctaSecondaryText: pack.contentDefaults.secondaryCta.text,
      ctaSecondaryLink: "#services",
      bgImageUrl: fallbackHeroImage,
      bgImageAlt: `${companyName} Ana Görsel`,
      stats,
    },
    about: {
      badge: "Hakkımızda",
      title: `${companyName} Hakkında`,
      contentHtml: `<p>${aboutStory}</p>`,
      yearsExperience: stats.find((s) => s.label.includes("Tecrübe"))?.value || "10+",
      completedProjects: stats.find((s) => s.label.includes("Müşteri") || s.label.includes("Tamir"))?.value || "5.000+",
      bulletPoints: whyUsItems.map((w) => w.title),
      imageUrl: fallbackHeroImage,
      imageAlt: `${companyName} Firma Görseli`,
    },
    whyUs: {
      badge: "Neden Biz?",
      title: "Bizi Tercih Etmeniz İçin 3 Önemli Neden",
      subtitle: "Yılların deneyimi ve müşteri memnuniyeti garantisiyle yanınızdayız.",
      items: whyUsItems,
    },
    contact: {
      badge: "İletişim",
      title: "Hemen İletişime Geçin",
      subtitle: `${companyName} olarak sorularınızı yanıtlamaktan memnuniyet duyarız.`,
      formTitle: "Teklif & Bilgi Formu",
      formSubmitButtonText: "Gönder",
      formSuccessMessage: "Talebiniz başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.",
    },
    gallery: pack.imageIntents.map((img, idx) => ({
      id: `img-${idx + 1}`,
      title: img.suggestedAlt,
      imageUrl: img.fallbackUrl,
      altText: img.suggestedAlt,
    })),
    testimonials: [
      {
        id: "t-1",
        name: "Ahmet Yılmaz",
        role: "Bireysel Müşteri",
        comment: "Zamanında geldiler, çok temiz çalıştılar. Kesinlikle tavsiye ederim.",
        rating: 5,
        verified: true,
        date: "1 hafta önce",
      },
      {
        id: "t-2",
        name: "Selin Demir",
        role: "İşletme Sahibi",
        comment: "Hızlı servis ve profesyonel yaklaşım. Fiyat ve kalite dengesi çok iyi.",
        rating: 5,
        verified: true,
        date: "2 hafta önce",
      },
    ],
    faqs,
    pricingPlans: [],
    customPages: [],
    blogPosts: [],
    catalogProducts: [],
  };
}
