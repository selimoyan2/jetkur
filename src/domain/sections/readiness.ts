/**
 * JetKur Canonical Section Registry - Content Readiness Engine
 *
 * ARCHITECTURAL PRINCIPLE:
 * Declaratively determines if a section has enough content to render.
 * Avoids broken UI, empty blocks, or placeholder crashes on the live site.
 *
 * Status levels:
 * - READY: Complete data available
 * - DEGRADED: Minimal required data available, recommended elements missing
 * - EMPTY: Crucial data missing (e.g. 0 services, 0 gallery images) -> Not renderable
 * - NOT_CONFIGURED: Section disabled in config
 */

import { SiteSectionItem } from "../site/sectionConfiguration";
import {
  CanonicalSectionId,
  ReadinessContext,
  SectionReadinessResult,
} from "./types";
import { getSectionDefinition, normalizeSectionId } from "./normalizer";

/**
 * Evaluates the readiness of a single canonical section against provided business and content domain models.
 */
export function evaluateSectionReadiness(
  sectionIdOrAlias: string,
  context: ReadinessContext
): SectionReadinessResult {
  const canonicalId = normalizeSectionId(sectionIdOrAlias);

  if (!canonicalId) {
    return {
      sectionId: sectionIdOrAlias as CanonicalSectionId,
      status: "NOT_CONFIGURED",
      canRender: false,
      missingRequired: [`Unknown section identifier '${sectionIdOrAlias}'`],
      missingRecommended: [],
      warnings: ["Section definition not found in canonical registry"],
    };
  }

  const def = getSectionDefinition(canonicalId);
  const { businessProfile, siteContent, sectionConfig } = context;

  // Check if explicitly disabled in sectionConfig
  if (sectionConfig) {
    const configuredItem = sectionConfig.sections.find(
      (s) => normalizeSectionId(s.type || s.id) === canonicalId
    );
    if (configuredItem && configuredItem.enabled === false) {
      return {
        sectionId: canonicalId,
        status: "NOT_CONFIGURED",
        canRender: false,
        missingRequired: [],
        missingRecommended: [],
        warnings: ["Section is explicitly disabled in section configuration"],
      };
    }
  }

  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];
  const warnings: string[] = [];
  let itemCount: number | undefined = undefined;

  switch (canonicalId) {
    case "header": {
      if (!businessProfile?.identity?.companyName) {
        missingRequired.push("businessProfile.identity.companyName");
      }
      if (!businessProfile?.contact?.phone) {
        missingRecommended.push("businessProfile.contact.phone");
      }
      break;
    }

    case "hero": {
      const title = siteContent?.hero?.title || businessProfile?.identity?.companyName;
      if (!title || title.trim().length === 0) {
        missingRequired.push("siteContent.hero.title");
      }
      if (!siteContent?.hero?.ctaPrimaryText) {
        missingRequired.push("siteContent.hero.ctaPrimaryText");
      }
      if (!siteContent?.hero?.bgImageUrl) {
        missingRecommended.push("siteContent.hero.bgImageUrl");
      }
      break;
    }

    case "services": {
      // Services can come from BusinessProfile.services or SiteContent.services
      const services = businessProfile?.services || [];
      itemCount = services.length;
      if (itemCount === 0) {
        missingRequired.push("businessProfile.services (at least 1 service required)");
      } else if (itemCount < 2) {
        missingRecommended.push("Minimum 2 services recommended for balanced display");
      }
      break;
    }

    case "about": {
      const content =
        siteContent?.about?.contentHtml ||
        businessProfile?.identity?.story ||
        businessProfile?.identity?.shortDescription;
      if (!content || content.trim().length === 0) {
        missingRequired.push("siteContent.about.contentHtml or businessProfile.identity.story");
      }
      if (!siteContent?.about?.imageUrl) {
        missingRecommended.push("siteContent.about.imageUrl");
      }
      break;
    }

    case "whyUs": {
      const items = siteContent?.whyUs?.items || [];
      itemCount = items.length;
      if (itemCount === 0) {
        missingRequired.push("siteContent.whyUs.items (at least 1 reason card required)");
      } else if (itemCount < 3) {
        missingRecommended.push("Minimum 3 advantage items recommended");
      }
      break;
    }

    case "gallery": {
      const items = siteContent?.gallery || [];
      itemCount = items.length;
      if (itemCount === 0) {
        missingRequired.push("siteContent.gallery (at least 1 image required)");
      } else if (itemCount < 4) {
        missingRecommended.push("Minimum 4 gallery photos recommended for visual appeal");
      }
      break;
    }

    case "testimonials": {
      const items = siteContent?.testimonials || [];
      itemCount = items.length;
      if (itemCount === 0) {
        missingRequired.push("siteContent.testimonials (at least 1 review required)");
      } else if (itemCount < 2) {
        missingRecommended.push("Minimum 2 customer reviews recommended for social proof");
      }
      break;
    }

    case "faqs": {
      const items = siteContent?.faqs || [];
      itemCount = items.length;
      if (itemCount === 0) {
        missingRequired.push("siteContent.faqs (at least 1 FAQ required)");
      } else if (itemCount < 3) {
        missingRecommended.push("Minimum 3 FAQs recommended for SEO schema");
      }
      break;
    }

    case "contact": {
      const hasPhone = Boolean(businessProfile?.contact?.phone);
      const hasEmail = Boolean(businessProfile?.contact?.email);
      const hasAddress = Boolean(businessProfile?.location?.address);

      if (!hasPhone && !hasEmail) {
        missingRequired.push("businessProfile.contact.phone or email is required");
      }
      if (!hasAddress) {
        missingRecommended.push("businessProfile.location.address");
      }
      break;
    }

    case "products": {
      const items = siteContent?.catalogProducts || [];
      itemCount = items.length;
      if (itemCount === 0) {
        missingRequired.push("siteContent.catalogProducts (at least 1 product required)");
      }
      break;
    }

    case "pricing": {
      const items = siteContent?.pricingPlans || [];
      itemCount = items.length;
      if (itemCount === 0) {
        missingRequired.push("siteContent.pricingPlans (at least 1 pricing tier required)");
      }
      break;
    }

    case "blog": {
      const items = siteContent?.blogPosts || [];
      itemCount = items.length;
      if (itemCount === 0) {
        missingRequired.push("siteContent.blogPosts (at least 1 post required)");
      }
      break;
    }

    case "newsletter": {
      if (!businessProfile?.identity?.companyName) {
        missingRecommended.push("businessProfile.identity.companyName");
      }
      break;
    }

    case "socialFeed": {
      const social = businessProfile?.social;
      const activePlatforms = social
        ? Object.entries(social).filter(([_, url]) => Boolean(url && typeof url === "string" && url.trim().length > 0))
        : [];
      itemCount = activePlatforms.length;
      if (itemCount === 0) {
        missingRequired.push("businessProfile.social (at least 1 active social profile required)");
      }
      break;
    }

    case "footer": {
      if (!businessProfile?.identity?.companyName) {
        missingRequired.push("businessProfile.identity.companyName");
      }
      break;
    }

    case "customHtml": {
      const pages = siteContent?.customPages || [];
      if (pages.length === 0) {
        missingRequired.push("siteContent.customPages (at least 1 custom HTML block required)");
      }
      break;
    }
  }

  // Determine readiness status
  if (missingRequired.length > 0) {
    return {
      sectionId: canonicalId,
      status: "EMPTY",
      canRender: false,
      itemCount,
      missingRequired,
      missingRecommended,
      warnings: [`Section '${def?.label || canonicalId}' cannot render because required content is missing`],
    };
  }

  if (missingRecommended.length > 0) {
    return {
      sectionId: canonicalId,
      status: "DEGRADED",
      canRender: true,
      itemCount,
      missingRequired: [],
      missingRecommended,
      warnings: [`Section '${def?.label || canonicalId}' is renderable in degraded mode`],
    };
  }

  return {
    sectionId: canonicalId,
    status: "READY",
    canRender: true,
    itemCount,
    missingRequired: [],
    missingRecommended: [],
    warnings: [],
  };
}

/**
 * Evaluates readiness across an array of configured sections
 */
export function evaluateAllSectionsReadiness(
  sections: readonly SiteSectionItem[],
  context: ReadinessContext
): Record<string, SectionReadinessResult> {
  const results: Record<string, SectionReadinessResult> = {};

  for (const sec of sections) {
    const canonicalId = normalizeSectionId(sec.type || sec.id);
    if (canonicalId) {
      results[sec.id] = evaluateSectionReadiness(canonicalId, context);
    }
  }

  return results;
}

/**
 * Filters a list of sections to only those that can actually render on the live site
 */
export function getRenderableSections(
  sections: readonly SiteSectionItem[],
  context: ReadinessContext
): SiteSectionItem[] {
  return sections.filter((sec) => {
    if (!sec.enabled) return false;
    const readiness = evaluateSectionReadiness(sec.type || sec.id, context);
    return readiness.canRender;
  });
}
