/**
 * JetKur Canonical Site Content Fingerprint Generator (Sprint 13)
 *
 * Computes deterministic SHA-256 fingerprint over:
 * - BusinessProfile
 * - SiteContent
 * - BrandKit
 * - SectionConfiguration
 * - SiteSettings
 * - TemplateId & TemplateSlug
 */

import crypto from "crypto";
import { CanonicalSite } from "../site/site";

/**
 * Deterministically stringifies an object by recursively sorting its keys.
 */
function deterministicStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return "null";
  }
  if (typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => deterministicStringify(item)).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj).sort();
  const entries: string[] = [];
  for (const key of sortedKeys) {
    // Exclude transient/meta fields that don't affect rendered output
    if (key === "updatedAt" || key === "createdAt" || key === "lastLoginAt") {
      continue;
    }
    entries.push(JSON.stringify(key) + ":" + deterministicStringify(obj[key]));
  }
  return "{" + entries.join(",") + "}";
}

/**
 * Computes a deterministic SHA-256 hash string for a CanonicalSite's draft state.
 */
export function computeSiteFingerprint(site: CanonicalSite): string {
  const payload = {
    businessProfile: {
      identity: site.businessProfile.identity,
      contact: site.businessProfile.contact,
      location: site.businessProfile.location,
      workingHours: site.businessProfile.workingHours,
      services: site.businessProfile.services,
      social: site.businessProfile.social,
    },
    content: {
      hero: site.content.hero,
      about: site.content.about,
      whyUs: site.content.whyUs,
      gallery: site.content.gallery,
      testimonials: site.content.testimonials,
      faqs: site.content.faqs,
      pricingPlans: site.content.pricingPlans,
      blogPosts: site.content.blogPosts,
      catalogProducts: site.content.catalogProducts,
      customPages: site.content.customPages,
    },
    brandKit: site.brandKit
      ? {
          primaryHex: site.brandKit.palette?.primary,
          secondaryHex: site.brandKit.palette?.secondary,
          dominantHex: site.brandKit.sourceColors?.dominant,
          typography: site.brandKit.typography,
          geometry: site.brandKit.geometry,
          logoUrl: site.brandKit.logo?.url,
        }
      : null,
    sectionConfiguration: {
      sections: site.sectionConfiguration.sections,
      header: site.sectionConfiguration.header,
      footer: site.sectionConfiguration.footer,
    },
    settings: {
      structureMode: site.settings.structureMode,
      seo: site.settings.seo,
      whatsappWidget: site.settings.whatsappWidget,
      locale: site.settings.locale,
    },
    template: {
      templateId: site.designTemplate.templateId,
      templateSlug: site.designTemplate.templateSlug,
    },
    industryPackId: site.industryPackId || "default",
  };

  const normalizedJson = deterministicStringify(payload);
  return crypto.createHash("sha256").update(normalizedJson, "utf8").digest("hex");
}
