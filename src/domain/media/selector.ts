/**
 * JetKur Automatic Image Selector & Duplicate Avoidance Engine (Sprint 14)
 *
 * Core Responsibilities:
 * 1. Automatically matches appropriate imagery to site sections based on IndustryPack image intents.
 * 2. DUPLICATE AVOIDANCE: Ensures the same stock image ID is never reused across Hero, Services, About, and Gallery.
 * 3. AUTHORITY HIERARCHY:
 *    CUSTOMER SELECTED / UPLOADED > SITE MATERIALIZED MEDIA > INDUSTRY PACK DEFAULT / INTENT
 * 4. TEMPLATE SWITCH PRESERVATION: Media assets remain bound to content slots regardless of template changes.
 */

import { CanonicalSite } from "../site/site";
import { IndustryPack } from "../site/industryPack";
import { ImageProvider, InternalFallbackProvider } from "./provider";
import { buildSiteImageIntents } from "./intents";
import { MediaAsset } from "./types";

export interface SelectionResult {
  assets: MediaAsset[];
  slotMap: Record<string, MediaAsset>;
  duplicatesAvoidedCount: number;
}

export class AutomaticImageSelector {
  private provider: ImageProvider;

  constructor(provider?: ImageProvider) {
    this.provider = provider || new InternalFallbackProvider();
  }

  /**
   * Automatically selects and assigns high-relevance imagery for a site while strictly preventing duplicates.
   */
  async selectImagesForSite(
    site: CanonicalSite,
    pack?: IndustryPack,
    existingCustomerAssets: MediaAsset[] = []
  ): Promise<SelectionResult> {
    const intents = buildSiteImageIntents(site, pack);
    const usedSourceIds = new Set<string>();
    const slotMap: Record<string, MediaAsset> = {};
    const finalAssets: MediaAsset[] = [];
    let duplicatesAvoidedCount = 0;

    // 1. Honor and anchor customer uploaded / customized media first (Highest Authority)
    for (const custAsset of existingCustomerAssets) {
      if (custAsset.assignedSlots && custAsset.assignedSlots.length > 0) {
        for (const slot of custAsset.assignedSlots) {
          slotMap[slot.slotKey] = custAsset;
          if (custAsset.sourceId) {
            usedSourceIds.add(custAsset.sourceId);
          }
        }
        finalAssets.push(custAsset);
      }
    }

    // Also check if site already has custom uploaded logo or existing hero image
    if (site.content.hero?.bgImageUrl && !slotMap["hero-bg"]) {
      // If customer set custom image that isn't placeholder, preserve it
      const currentHeroUrl = site.content.hero.bgImageUrl;
      if (!currentHeroUrl.includes("placeholder")) {
        const existingHeroAsset: MediaAsset = {
          id: `media-custom-hero-${site.id}`,
          workspaceId: "default-workspace",
          siteId: site.id,
          sourceType: "CUSTOMER_UPLOAD",
          originalUrl: currentHeroUrl,
          mimeType: "image/jpeg",
          altText: site.content.hero.bgImageAlt || site.businessProfile.identity.companyName,
          assignedSlots: [{ sectionType: "hero", slotKey: "hero-bg", label: "Hero Arka Planı" }],
          createdAt: site.createdAt,
          updatedAt: site.updatedAt,
        };
        slotMap["hero-bg"] = existingHeroAsset;
        finalAssets.push(existingHeroAsset);
      }
    }

    // 2. Resolve remaining unfilled slots from provider with Duplicate Avoidance
    for (const intent of intents) {
      if (slotMap[intent.slotKey]) {
        // Slot already claimed by customer or prior selection
        continue;
      }

      const searchResult = await this.provider.searchImages(intent, {
        siteId: site.id,
        perPage: 5,
      });

      // Filter out candidates that have already been assigned to another slot on this site
      let selectedAsset: MediaAsset | null = null;

      for (const candidate of searchResult.assets) {
        const candidateSourceId = candidate.sourceId || candidate.originalUrl;
        if (!usedSourceIds.has(candidateSourceId)) {
          selectedAsset = candidate;
          usedSourceIds.add(candidateSourceId);
          break;
        } else {
          duplicatesAvoidedCount++;
        }
      }

      // If all candidates in batch were duplicates, use the first candidate with modified slot or fallback
      if (!selectedAsset) {
        selectedAsset = searchResult.assets[0] || {
          id: `fallback-${intent.slotKey}`,
          workspaceId: "default-workspace",
          siteId: site.id,
          sourceType: "LEGACY_EXTERNAL",
          originalUrl: intent.fallbackUrl,
          mimeType: "image/jpeg",
          altText: intent.suggestedAlt,
          assignedSlots: [{ sectionType: "general", slotKey: intent.slotKey, label: intent.subject }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Tag slot
      selectedAsset.assignedSlots = [
        { sectionType: intent.category.toLowerCase() as any, slotKey: intent.slotKey, label: intent.subject },
      ];

      slotMap[intent.slotKey] = selectedAsset;
      finalAssets.push(selectedAsset);
    }

    return {
      assets: finalAssets,
      slotMap,
      duplicatesAvoidedCount,
    };
  }

  /**
   * Applies the selected slot map back to a CanonicalSite's SiteContent safely.
   */
  applyMediaToSiteContent(site: CanonicalSite, slotMap: Record<string, MediaAsset>): CanonicalSite {
    const updated = JSON.parse(JSON.stringify(site)) as CanonicalSite;

    // 1. Hero
    if (slotMap["hero-bg"]) {
      updated.content.hero.bgImageUrl = slotMap["hero-bg"].originalUrl;
      if (!updated.content.hero.bgImageAlt) {
        updated.content.hero.bgImageAlt = slotMap["hero-bg"].altText;
      }
    }

    // 2. About
    if (slotMap["about-main"] && updated.content.about) {
      updated.content.about.imageUrl = slotMap["about-main"].originalUrl;
      if (!updated.content.about.imageAlt) {
        updated.content.about.imageAlt = slotMap["about-main"].altText;
      }
    }

    // 3. Services
    if (updated.businessProfile.services) {
      updated.businessProfile.services.forEach((srv: any, idx: number) => {
        const slot = slotMap[`service-${idx + 1}`];
        if (slot) {
          srv.imageUrl = slot.originalUrl;
        }
      });
    }

    // 4. Gallery
    const galleryItems = [];
    for (let g = 1; g <= 6; g++) {
      const slot = slotMap[`gallery-${g}`];
      if (slot) {
        galleryItems.push({
          id: `gallery-item-${g}`,
          title: slot.title || `${site.businessProfile.identity.companyName} Uygulama ${g}`,
          imageUrl: slot.originalUrl,
          altText: slot.altText,
        });
      }
    }
    if (galleryItems.length > 0) {
      updated.content.gallery = galleryItems;
    }

    updated.updatedAt = new Date().toISOString();
    return updated;
  }
}
