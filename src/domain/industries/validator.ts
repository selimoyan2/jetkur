/**
 * JetKur Industry Pack Runtime Validator (Sprint 05)
 *
 * Verifies that canonical Industry Packs satisfy strict structural invariants:
 * - Unique slugs and IDs
 * - Zero presentation leakage (no CSS, no className, no tailwind, no colors)
 * - Zero provider leakage (no Pexels/Unsplash SDK IDs)
 * - Valid recommended section identifiers
 */

import { IndustryPack } from "./types";
import { CanonicalSectionType } from "../site/sectionConfiguration";

const VALID_SECTION_TYPES: Set<string> = new Set([
  "hero",
  "services",
  "about",
  "whyUs",
  "gallery",
  "pricing",
  "testimonials",
  "faqs",
  "contact",
  "products",
  "blog",
  "newsletter",
  "socialFeed",
  "customHtml",
]);

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface PackValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateIndustryPack(pack: IndustryPack): PackValidationResult {
  const issues: ValidationIssue[] = [];

  if (!pack.slug || typeof pack.slug !== "string" || pack.slug.trim() === "") {
    issues.push({ field: "slug", message: "Slug must be a non-empty string" });
  }

  if (!pack.name || typeof pack.name !== "string" || pack.name.trim() === "") {
    issues.push({ field: "name", message: "Name must be a non-empty string" });
  }

  if (!pack.category || typeof pack.category !== "string") {
    issues.push({ field: "category", message: "Category must be specified" });
  }

  // Check services
  if (!Array.isArray(pack.defaultServices) || pack.defaultServices.length === 0) {
    issues.push({ field: "defaultServices", message: "Pack must contain at least 1 default service" });
  } else {
    const serviceSlugs = new Set<string>();
    for (const s of pack.defaultServices) {
      if (!s.title || !s.slug) {
        issues.push({ field: "defaultServices", message: `Service must have title and slug` });
      }
      if (serviceSlugs.has(s.slug)) {
        issues.push({ field: "defaultServices", message: `Duplicate service slug: ${s.slug}` });
      }
      serviceSlugs.add(s.slug);
    }
  }

  // Check FAQs
  if (!Array.isArray(pack.defaultFaqs) || pack.defaultFaqs.length === 0) {
    issues.push({ field: "defaultFaqs", message: "Pack must contain at least 1 default FAQ" });
  } else {
    for (const f of pack.defaultFaqs) {
      if (!f.question || !f.answer) {
        issues.push({ field: "defaultFaqs", message: "FAQ entries must have non-empty question and answer" });
      }
    }
  }

  // Check Image Intents
  if (!Array.isArray(pack.imageIntents) || pack.imageIntents.length === 0) {
    issues.push({ field: "imageIntents", message: "Pack must contain at least 1 image intent" });
  } else {
    for (const img of pack.imageIntents) {
      if (!img.key || !img.searchPrompt) {
        issues.push({ field: "imageIntents", message: "Image intent must have key and searchPrompt" });
      }
      // Provider leak check: ensure no mandatory pexels/unsplash ID properties
      const raw = img as any;
      if (raw.pexelsId || raw.pexelsPhotoId || raw.unsplashId || raw.cloudinaryId) {
        issues.push({ field: "imageIntents", message: "Image intent contains provider-specific IDs" });
      }
    }
  }

  // Check Recommended Sections against supported section types
  if (!Array.isArray(pack.recommendedSections) || pack.recommendedSections.length === 0) {
    issues.push({ field: "recommendedSections", message: "Pack must contain recommended sections" });
  } else {
    for (const sec of pack.recommendedSections) {
      if (!VALID_SECTION_TYPES.has(sec.type)) {
        issues.push({
          field: "recommendedSections",
          message: `Unknown section type '${sec.type}' not in CanonicalSectionType registry`,
        });
      }
    }
  }

  // Presentation Leak Check: ensure pack has no CSS/Tailwind/UI properties
  const rawPack = pack as any;
  const presentationFields = [
    "className",
    "tailwindClasses",
    "fontSize",
    "borderRadius",
    "backgroundColor",
    "fontFamily",
    "themeColor",
  ];
  for (const field of presentationFields) {
    if (rawPack[field] !== undefined) {
      issues.push({ field, message: `Presentation property '${field}' found in IndustryPack domain` });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
