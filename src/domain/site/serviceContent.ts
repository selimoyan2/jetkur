/**
 * Canonical Service Content Model
 * JetKur Platform - Foundation 02
 *
 * Defines the canonical representation of a business service.
 * Supports both LANDING and MULTI_PAGE site presentation modes
 * without content duplication.
 */

import type { BusinessServiceItem } from "./businessProfile";

export interface ServiceContent {
  /** Unique Service identifier (e.g. "srv-clogged-drain", "srv-root-canal") */
  id: string;

  /** Display title of the service */
  title: string;

  /** URL-friendly slug (e.g. "tikaniklik-acma", "dis-beyazlatma") */
  slug: string;

  /**
   * Compact summary for previews, cards, and homepage sections.
   * Shared between LANDING and MULTI_PAGE modes.
   */
  shortDescription: string;

  /**
   * Detailed service body/description for dedicated service detail views.
   */
  longContent?: string;

  /**
   * Whether the service is actively displayed.
   * Renderer/navigation logic can exclude inactive services.
   */
  active: boolean;

  /**
   * Primary media reference ID (e.g. hero/thumbnail MediaAsset ID).
   */
  primaryMediaId?: string;

  /**
   * Additional gallery media reference IDs.
   */
  galleryMediaIds?: string[];

  /**
   * Optional commercial price label (e.g. "Başlayan Fiyatlarla 500 TL", "Ücretsiz Keşif").
   */
  priceLabel?: string;

  /**
   * Optional Call to Action label (e.g. "Hemen Ara", "Teklif Al", "Randevu Oluştur").
   */
  ctaLabel?: string;

  /**
   * Optional Call to Action URL / anchor (e.g. "tel:+905551234567", "#contact", "/randevu").
   */
  ctaUrl?: string;

  /** Optional SEO meta title */
  seoTitle?: string;

  /** Optional SEO meta description */
  seoDescription?: string;
}

/**
 * Type guard to check if an object is a valid ServiceContent.
 */
export function isServiceContent(value: unknown): value is ServiceContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.shortDescription === "string" &&
    typeof candidate.active === "boolean"
  );
}

/**
 * Creates a default ServiceContent instance from minimal input.
 */
export function createDefaultServiceContent(
  id: string,
  title: string,
  slug: string,
  shortDescription: string,
  options?: Partial<Omit<ServiceContent, "id" | "title" | "slug" | "shortDescription">>
): ServiceContent {
  return {
    id,
    title,
    slug,
    shortDescription,
    active: options?.active ?? true,
    longContent: options?.longContent,
    primaryMediaId: options?.primaryMediaId,
    galleryMediaIds: options?.galleryMediaIds ?? [],
    priceLabel: options?.priceLabel,
    ctaLabel: options?.ctaLabel,
    ctaUrl: options?.ctaUrl,
    seoTitle: options?.seoTitle,
    seoDescription: options?.seoDescription,
  };
}

/**
 * Converts an existing BusinessServiceItem into canonical ServiceContent,
 * preserving backward compatibility with legacy onboarding and business profile data.
 */
export function fromBusinessServiceItem(
  item: BusinessServiceItem,
  overrides?: Partial<ServiceContent>
): ServiceContent {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    longContent: item.fullDescription,
    active: overrides?.active ?? true,
    primaryMediaId: overrides?.primaryMediaId,
    galleryMediaIds: overrides?.galleryMediaIds ?? [],
    priceLabel: item.priceHint ?? overrides?.priceLabel,
    ctaLabel: overrides?.ctaLabel,
    ctaUrl: overrides?.ctaUrl,
    seoTitle: overrides?.seoTitle,
    seoDescription: overrides?.seoDescription,
    ...overrides,
  };
}

/**
 * Converts a canonical ServiceContent into a BusinessServiceItem
 * for backward compatibility with legacy previewers and exporters.
 */
export function toBusinessServiceItem(service: ServiceContent): BusinessServiceItem {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    fullDescription: service.longContent,
    priceHint: service.priceLabel,
  };
}
