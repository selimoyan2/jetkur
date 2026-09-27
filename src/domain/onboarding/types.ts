/**
 * JetKur Smart Onboarding Domain Types (Sprint 11)
 *
 * Enforces strict typing for the user-facing onboarding input contract,
 * server context, validation results, and created site output.
 */

import { CanonicalSite } from "../site/site";
import { IndustryPack } from "../industries/types";
import { TemplateManifest } from "../templates/types";
import { BrandKit } from "../brand/types";

export interface OnboardingServiceItem {
  id?: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  icon?: string;
  priceHint?: string;
}

export interface OnboardingLogoInput {
  url?: string;
  svgContent?: string;
  dataUrl?: string;
  mimeType?: string;
  fileName?: string;
  sizeBytes?: number;
}

/**
 * Clean, minimal customer onboarding input payload
 */
export interface OnboardingInput {
  // Step 1: Industry / Sector
  industry: string;

  // Step 2: Business Name & Tagline
  companyName: string;
  tagline?: string;

  // Step 3: Logo & Brand
  logo?: OnboardingLogoInput;
  brandColor?: string;

  // Step 4: Contact & Services
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  serviceAreas?: string[];
  workingHours?: string;
  services?: OnboardingServiceItem[];

  // Optional template preference (defaults to recommended)
  templateId?: string;
}

/**
 * Server execution context for the authenticated user and target workspace
 */
export interface OnboardingContext {
  workspaceId: string;
  userId: string;
  userRole?: string;
  idempotencyKey?: string;
}

export interface OnboardingValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface OnboardingResult {
  success: boolean;
  site: CanonicalSite;
  previewHtml: string;
  industryPack: IndustryPack;
  template: TemplateManifest;
  brandKit: BrandKit;
  isFallbackIndustry: boolean;
  idempotentReplay?: boolean;
  executionTimeMs: number;
}
