/**
 * JetKur Canonical Data Architecture - Business Profile Domain
 *
 * PRODUCT INVARIANT:
 * BusinessProfile is the customer's authentic business identity.
 * It is completely PORTABLE and DECOUPLED from presentation, layout, and visual templates.
 * When a user switches templates (e.g. Template A -> Template B -> Template C),
 * all BusinessProfile attributes (companyName, phone, services, address, logo, story)
 * remain 100% intact without any data loss.
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface StructuredWorkingDaySchedule {
  days: string[]; // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  open: string;   // "08:30"
  close: string;  // "19:00"
  closed?: boolean;
}

export interface BusinessWorkingHours {
  /** Human-readable string representation (e.g. "Pzt - Cmt: 08:30 - 19:30") */
  raw: string;
  /** Optional structured daily/weekly schedule for Schema.org and opening hours widgets */
  schedule?: StructuredWorkingDaySchedule[];
  /** Flag for 24/7 emergency services (crucial for locksmiths, plumbers, tow trucks) */
  is24x7Emergency?: boolean;
}

export interface BusinessServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  priceHint?: string; // e.g. "₺750'den başlayan fiyatlar" or "Ücretsiz Keşif"
  features?: string[];
  icon?: string;
  imageUrl?: string;
  featured?: boolean;
  specs?: Array<{ label: string; value: string }>;
}

export interface BusinessIdentity {
  /** Official company or trade title */
  companyName: string;
  /** Customer-facing brand name (defaults to companyName if same) */
  brandName?: string;
  /** Sector slug or name (e.g. "plumbing", "dentist", "electrical") */
  sector: string;
  /** Optional reference to the JetKur Industry Pack used as starter baseline */
  industryPackId?: string;
  /** Short punchy business slogan / value proposition */
  slogan: string;
  /** Brief elevator pitch (1-2 sentences) */
  shortDescription: string;
  /** Full background story, company history or founder statement */
  story?: string;
  /** Founding year (e.g. 2012) */
  foundingYear?: number | string;
  /** Tax ID / Mersis number for legal transparency & structured data */
  taxId?: string;
}

export interface BusinessContact {
  /** Primary contact phone number (formatted) */
  phone: string;
  /** Secondary or emergency phone number */
  phoneSecondary?: string;
  /** Primary WhatsApp contact number (with international prefix) */
  whatsapp: string;
  /** Primary operational/inquiry email address */
  email: string;
  /** Secondary support email if separate */
  supportEmail?: string;
}

export interface BusinessLocation {
  /** Physical street address or workshop location */
  address: string;
  /** Primary city (e.g. "İstanbul", "Ankara", "İzmir") */
  city: string;
  /** District / neighborhood (e.g. "Kadıköy", "Çankaya") */
  district: string;
  /** Postal / Zip code */
  postalCode?: string;
  /** Country name (defaults to "Türkiye") */
  country?: string;
  /** List of neighborhoods or surrounding districts actively serviced */
  serviceAreas: string[];
  /** Geographic coordinates for maps and LocalBusiness schema */
  geoCoordinates?: GeoCoordinates;
  /** Google Maps embed iframe or URL */
  googleMapsEmbedUrl?: string;
  /** Google Places ID if available */
  googleMapsPlaceId?: string;
}

export interface BusinessBranding {
  /** Company logo image URL */
  logoUrl?: string;
  /** Logo accessibility alt text */
  logoAlt?: string;
  /** Browser favicon URL */
  faviconUrl?: string;
  /** Brand identity color hints (business preference, independent of template layout) */
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export interface BusinessMetrics {
  yearsOfExperience?: number;
  completedJobsCount?: number;
  satisfiedClientsCount?: number;
  teamSize?: number;
  certifications?: string[];
}

export interface BusinessSocialProfiles {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  googleBusinessUrl?: string;
}

/**
 * The Canonical BusinessProfile Aggregate
 */
export interface BusinessProfile {
  identity: BusinessIdentity;
  contact: BusinessContact;
  location: BusinessLocation;
  branding: BusinessBranding;
  workingHours: BusinessWorkingHours;
  services: BusinessServiceItem[];
  metrics?: BusinessMetrics;
  social: BusinessSocialProfiles;
}
