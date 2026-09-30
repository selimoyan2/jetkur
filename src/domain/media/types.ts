/**
 * JetKur Canonical Media Domain Types (Sprint 14)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * Provides a provider-independent media asset model, image intent definitions,
 * and responsive image contracts.
 */

export type MediaSourceType =
  | "CUSTOMER_UPLOAD"
  | "STOCK"
  | "GENERATED"
  | "LEGACY_EXTERNAL";

export type MediaSourceProvider =
  | "pexels"
  | "unsplash"
  | "pixabay"
  | "internal"
  | "customer";

export interface MediaLicenseMetadata {
  license: string; // e.g. "Pexels License", "Unsplash License", "Customer Owned"
  attributionRequired: boolean;
  photographerName?: string;
  photographerUrl?: string;
  sourcePageUrl?: string;
}

export interface MediaVariant {
  width: number;
  height: number;
  url: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface MediaSlotBinding {
  sectionType: "hero" | "about" | "services" | "gallery" | "testimonials" | "contact" | "general";
  slotKey: string; // e.g. "hero-bg", "service-1", "about-main", "gallery-3"
  label: string; // Turkish display label e.g. "Ana Sayfa Başlık Görseli", "Kameralı Su Kaçağı Görseli"
}

export interface MediaAsset {
  id: string;
  workspaceId: string;
  siteId: string;
  sourceType: MediaSourceType;
  originalUrl: string;
  localAssetPath?: string;
  mimeType: string; // "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml"
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g. "16:9", "4:3", "1:1"
  fileSize?: number; // in bytes
  altText: string;
  title?: string;
  sourceProvider?: MediaSourceProvider;
  sourceId?: string; // unique ID from provider for duplicate avoidance
  photographerName?: string;
  sourcePageUrl?: string;
  licenseMetadata?: MediaLicenseMetadata;
  variants?: MediaVariant[];
  assignedSlots?: MediaSlotBinding[];
  createdAt: string;
  updatedAt: string;
}

export type ImageIntentCategory =
  | "HERO"
  | "SERVICE"
  | "ABOUT"
  | "GALLERY"
  | "TESTIMONIAL"
  | "BACKGROUND"
  | "TEAM"
  | "LOCATION";

export type ImageOrientation = "landscape" | "portrait" | "square";

export interface ImageIntent {
  category: ImageIntentCategory;
  industrySlug: string;
  industryName: string;
  serviceTitle?: string;
  subject: string;
  orientation: ImageOrientation;
  preferredAspectRatio: "16:9" | "4:3" | "1:1" | "3:2";
  keywords: string[];
  negativeKeywords: string[];
  fallbackUrl: string;
  suggestedAlt: string;
  slotKey: string;
}

export interface ProviderSearchResult {
  success: boolean;
  provider: MediaSourceProvider;
  assets: MediaAsset[];
  totalResults: number;
  page: number;
  perPage: number;
  fallbackUsed: boolean;
  errorMessage?: string;
}
