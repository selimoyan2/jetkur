/**
 * Canonical Product Content Model
 * JetKur Platform - Foundation 03
 *
 * Defines the canonical representation of an individual business product/catalog item.
 * Supports both LANDING and MULTI_PAGE site presentation modes without content duplication.
 *
 * NOTE:
 * - "PRODUCTS" PageContent represents the overall Products page shell/banner.
 * - ProductContent represents individual product records.
 */

import type { CatalogProductItem } from "./siteContent";

export interface ProductContent {
  /** Unique Product identifier (e.g. "prod-water-filter", "prod-valve-xl") */
  id: string;

  /** Display title of the product */
  title: string;

  /** URL-friendly slug (e.g. "su-aritma-filtresi", "kombi-vanasi") */
  slug: string;

  /**
   * Compact summary for previews, cards, and homepage sections.
   * Shared between LANDING and MULTI_PAGE modes.
   */
  shortDescription: string;

  /**
   * Detailed product body/description for dedicated product detail views.
   */
  longContent?: string;

  /**
   * Whether the product is actively displayed.
   * Renderer/navigation logic can exclude inactive products.
   */
  active: boolean;

  /**
   * Primary media reference ID (e.g. main product photo MediaAsset ID).
   */
  primaryMediaId?: string;

  /**
   * Additional gallery media reference IDs.
   */
  galleryMediaIds?: string[];

  /**
   * Optional commercial price label (e.g. "₺1.250", "Fiyat Sorunuz", "İndirimli ₺890").
   */
  priceLabel?: string;

  /**
   * Optional Call to Action label (e.g. "Sipariş Ver", "Teklif Al", "Detayları İncele").
   */
  ctaLabel?: string;

  /**
   * Optional Call to Action URL / anchor (e.g. "tel:+905551234567", "#contact", "/urunler").
   */
  ctaUrl?: string;

  /** Optional SEO meta title */
  seoTitle?: string;

  /** Optional SEO meta description */
  seoDescription?: string;
}

/**
 * Type guard to check if an object is a valid ProductContent.
 */
export function isProductContent(value: unknown): value is ProductContent {
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
 * Creates a default ProductContent instance from minimal input.
 */
export function createDefaultProductContent(
  id: string,
  title: string,
  slug: string,
  shortDescription: string,
  options?: Partial<Omit<ProductContent, "id" | "title" | "slug" | "shortDescription">>
): ProductContent {
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
 * Converts an existing CatalogProductItem into canonical ProductContent,
 * preserving backward compatibility with legacy catalog data.
 */
export function fromCatalogProductItem(
  item: CatalogProductItem,
  overrides?: Partial<ProductContent>
): ProductContent {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription || item.title,
    longContent: item.descriptionHtml,
    active: overrides?.active ?? (item.inStock ?? true),
    primaryMediaId: item.images?.[0] || overrides?.primaryMediaId,
    galleryMediaIds: item.images?.slice(1) || overrides?.galleryMediaIds || [],
    priceLabel: item.price || overrides?.priceLabel,
    ctaLabel: overrides?.ctaLabel,
    ctaUrl: overrides?.ctaUrl,
    seoTitle: overrides?.seoTitle,
    seoDescription: overrides?.seoDescription,
    ...overrides,
  };
}

/**
 * Converts a canonical ProductContent into a CatalogProductItem
 * for backward compatibility with legacy product list renderers.
 */
export function toCatalogProductItem(
  product: ProductContent,
  category = "Genel"
): CatalogProductItem {
  const images: string[] = [];
  if (product.primaryMediaId) images.push(product.primaryMediaId);
  if (product.galleryMediaIds) images.push(...product.galleryMediaIds);

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category,
    price: product.priceLabel || "",
    shortDescription: product.shortDescription,
    descriptionHtml: product.longContent || product.shortDescription,
    images,
    inStock: product.active,
  };
}
