/**
 * JetKur Server Industry Pack Service (Sprint 05)
 *
 * Provides server-side catalog listing, resolution, and database synchronization.
 */

import { prisma } from "../db/client";
import {
  ALL_INDUSTRY_PACKS,
  CANONICAL_INDUSTRY_PACKS,
  toIndustryPackSummary,
} from "../../domain/industries/catalog";
import {
  getIndustryPackBySlug,
  listActiveIndustryPacks,
  resolveIndustryPack,
} from "../../domain/industries/resolver";
import { materializeIndustryStarterContent } from "../../domain/industries/materializer";
import { IndustryPack, ResolveIndustryPackResult } from "../../domain/industries/types";
import { BusinessProfile } from "../../domain/site/businessProfile";
import { SiteContent } from "../../domain/site/siteContent";

export class IndustryPackService {
  /**
   * Lists lightweight summaries of available industry packs
   */
  list(filterActive = true) {
    const packs = filterActive ? listActiveIndustryPacks() : ALL_INDUSTRY_PACKS;
    return packs.map(toIndustryPackSummary);
  }

  /**
   * Retrieves full IndustryPack by slug
   */
  getBySlug(slug: string): IndustryPack | undefined {
    return getIndustryPackBySlug(slug);
  }

  /**
   * Resolves arbitrary user/wizard query to canonical IndustryPack
   */
  resolve(query: string): ResolveIndustryPackResult {
    return resolveIndustryPack(query);
  }

  /**
   * Materializes starter SiteContent for a specific industry and business profile
   */
  materializeStarterContent(slug: string, profile?: Partial<BusinessProfile>): SiteContent | undefined {
    const pack = this.getBySlug(slug);
    if (!pack) return undefined;
    return materializeIndustryStarterContent(pack, profile);
  }

  /**
   * Idempotent database seeder / synchronizer:
   * Upserts canonical industry packs into PostgreSQL industry_packs table.
   */
  async seedDatabaseIndustryPacks(txClient?: any): Promise<{ seeded: number; total: number }> {
    const client = txClient || prisma;
    let seeded = 0;

    for (const pack of ALL_INDUSTRY_PACKS) {
      try {
        await client.industryPack.upsert({
          where: { slug: pack.slug },
          update: {
            name: pack.name,
            sector: pack.category,
            version: pack.version || "1.0.0",
            description: pack.description || null,
            starterData: pack as any,
          },
          create: {
            id: pack.id,
            slug: pack.slug,
            name: pack.name,
            sector: pack.category,
            version: pack.version || "1.0.0",
            description: pack.description || null,
            starterData: pack as any,
          },
        });
        seeded++;
      } catch {
        // If database is offline, skip individual write
      }
    }

    return { seeded, total: ALL_INDUSTRY_PACKS.length };
  }
}

export const industryPackService = new IndustryPackService();
