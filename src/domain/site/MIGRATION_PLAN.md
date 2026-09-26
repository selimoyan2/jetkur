# JETKUR CANONICAL DATA ARCHITECTURE & MIGRATION PLAN (SPRINT 01)

## 1. Domain Boundary Architecture

JetKur's canonical site formula:

$$\text{SITE} = \text{BUSINESS PROFILE} + \text{INDUSTRY PACK} + \text{DESIGN TEMPLATE} + \text{SECTION CONFIGURATION} + \text{SITE CONTENT} + \text{SITE SETTINGS}$$

### Domain Responsibilities

| Domain Model | File | Primary Responsibility | Portability & Lifecycle |
|---|---|---|---|
| **BusinessProfile** | `businessProfile.ts` | Authentic SME identity, legal name, phone, WhatsApp, address, service areas, working hours, core services | **100% Portable.** Never destroyed or mutated on template changes. |
| **IndustryPack** | `industryPack.ts` | JetKur's sectoral intelligence (plumber, dentist, tow truck): starter services, FAQs, default copy, image intents, SEO templates | **System Catalog.** Not customer-owned. Used during onboarding & content generation. |
| **DesignTemplate** | `designTemplate.ts` | Presentation layer: color tokens, typography scales, border radiuses, container widths, supported section variants | **Swappable.** User can switch templates without affecting business identity or content. |
| **SectionConfiguration** | `sectionConfiguration.ts` | Page structure: section ordering, visibility toggles, active variants, header navigation, footer configuration | **Structural.** Controls what blocks render and in which order. |
| **SiteContent** | `siteContent.ts` | Copywriting & media: headlines, badges, about story, testimonials, FAQs, pricing cards, blog posts, gallery | **Editable Copy.** Independent domain enabling multi-language translation and AI rewrites. |
| **SiteSettings** | `siteSettings.ts` | Infrastructure: custom domain, Cloudflare edge, technical SEO, JSON-LD schema, analytics, WhatsApp floating widget | **Technical & Operations.** Hosting, edge caching, integrations, and leads handling. |
| **CanonicalSite** | `site.ts` | Root Aggregate combining the 6 domains with schema versioning (`1.0.0`) | **System Root Aggregate.** |

---

## 2. Legacy `SiteConfig` Field Classification & Mapping

Every field from the legacy monolithic `SiteConfig` in `src/types.ts` has been classified and mapped to its canonical domain:

| Legacy `SiteConfig` Field | Legacy Type | Target Canonical Domain | Target Canonical Path |
|---|---|---|---|
| `companyName` | `string` | **BusinessProfile** | `businessProfile.identity.companyName` |
| `sector` | `string` | **BusinessProfile** | `businessProfile.identity.sector` |
| `slogan` | `string` | **BusinessProfile** | `businessProfile.identity.slogan` |
| `phone` | `string` | **BusinessProfile** | `businessProfile.contact.phone` |
| `whatsapp` | `string` | **BusinessProfile** | `businessProfile.contact.whatsapp` |
| `email` | `string` | **BusinessProfile** | `businessProfile.contact.email` |
| `address` | `string` | **BusinessProfile** | `businessProfile.location.address` |
| `city` | `string` | **BusinessProfile** | `businessProfile.location.city` |
| `workingHours` | `string` | **BusinessProfile** | `businessProfile.workingHours.raw` |
| `logo` | `string` | **BusinessProfile** | `businessProfile.branding.logoUrl` |
| `services.items` | `ServiceItem[]` | **BusinessProfile** | `businessProfile.services[]` |
| `socialMedia` | `SocialMediaLinks` | **BusinessProfile** | `businessProfile.social` |
| `templateId` | `string` | **DesignTemplate** | `designTemplate.templateId` |
| `palette` | `ColorPalette` | **DesignTemplate** | `designTemplate.customTokens.palette` |
| `fontFamily` | `string` | **DesignTemplate** | `designTemplate.customTokens.typography` |
| `borderRadius` | `string` | **DesignTemplate** | `designTemplate.customTokens.geometry.borderRadius` |
| `homepageSections` | `HomepageSectionConfig[]` | **SectionConfiguration** | `sectionConfiguration.sections[]` |
| `header` | `HeaderConfig` | **SectionConfiguration** | `sectionConfiguration.header` |
| `footer` | `FooterConfig` | **SectionConfiguration** | `sectionConfiguration.footer` |
| `hero` | `{ title, subtitle, bgImage, ... }` | **SiteContent** | `content.hero` |
| `about` | `{ title, content, image, ... }` | **SiteContent** | `content.about` |
| `whyUs` | `{ title, subtitle, items, ... }` | **SiteContent** | `content.whyUs` |
| `gallery.items` | `GalleryItem[]` | **SiteContent** | `content.gallery[]` |
| `testimonials.items` | `TestimonialItem[]` | **SiteContent** | `content.testimonials[]` |
| `faqs.items` / `faq.items` | `FaqItem[]` | **SiteContent** | `content.faqs[]` |
| `pricing.items` | `PricingPlan[]` | **SiteContent** | `content.pricingPlans[]` |
| `pages` | `CustomPageItem[]` | **SiteContent** | `content.customPages[]` |
| `blog.items` | `BlogPostItem[]` | **SiteContent** | `content.blogPosts[]` |
| `products.items` | `ProductItem[]` | **SiteContent** | `content.catalogProducts[]` |
| `siteType` | `SiteStructureType` | **SiteSettings** | `settings.structureMode` |
| `customDomain` | `string` | **SiteSettings** | `settings.domain.hostname` |
| `cloudflare` | `CloudflareDeployment` | **SiteSettings** | `settings.deployment` |
| `seo` | `SiteConfig['seo']` | **SiteSettings** | `settings.seo` |
| `schemaConfig` | `JsonLdSchemaConfig` | **SiteSettings** | `settings.seo.schemaConfig` |
| `whatsappWidget` | `WhatsAppWidgetConfig` | **SiteSettings** | `settings.whatsappWidget` |
| `leadNotifications` | `LeadNotificationsConfig` | **SiteSettings** | `settings.leads` |
| `leadThankYouEmail` | `LeadThankYouEmailConfig` | **SiteSettings** | `settings.leads.thankYouEmailAutoresponder` |
| `performanceOptimizations` | `PerformanceOptimizationSettings` | **SiteSettings** | `settings.performance` |

---

## 3. Phased Migration Strategy (Zero Risk & Zero Downtime)

### Phase 1: Canonical Foundation (Sprint 01 — Completed)
- Canonical interfaces created in `src/domain/site/`.
- Bidirectional non-destructive adapter created in `src/domain/site/legacyAdapter.ts`.
- Real Turkish SME fixture implemented in `src/domain/site/fixtures.ts`.
- Zero changes to existing components or UI callers, guaranteeing zero regression.

### Phase 2: Static Generator Migration (Future Sprint)
- Update `staticHtmlGenerator.ts` to accept `CanonicalSite` as input.
- Replace monolithic template strings with discrete domain consumers:
  - `renderHeader(sectionConfig, businessProfile)`
  - `renderHero(content.hero, designTemplate)`
  - `renderServices(businessProfile.services, sectionConfig.sections)`
  - `renderContact(businessProfile.contact, businessProfile.location)`

### Phase 3: Dashboard & Context Migration (Future Sprint)
- Introduce `useCanonicalSite()` hook alongside legacy `useSite()`.
- Bridge state updates through `fromLegacySiteConfig` and `toLegacySiteConfig`.
- Incrementally update dashboard sub-panels to consume specific domain sub-states (e.g. BusinessProfile panel edits only `businessProfile`).

### Phase 4: Full Cutover & Deprecation (Future Sprint)
- Remove `legacyAdapter.ts`.
- Deprecate old monolithic `SiteConfig` fields in `src/types.ts`.
- Store `CanonicalSite` in persistence layer.
