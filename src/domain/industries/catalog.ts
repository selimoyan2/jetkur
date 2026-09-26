/**
 * JetKur Canonical Industry Pack Catalog (Sprint 05)
 *
 * Central registry of all platform-owned sector intelligence packs.
 */

import { IndustryPack } from "./types";
import { otoKurtarmaIndustryPack } from "./packs/otoKurtarma";
import { disHekimligiIndustryPack } from "./packs/disHekimligi";
import { hukukAvukatIndustryPack } from "./packs/hukukAvukat";
import { haliYikamaIndustryPack } from "./packs/haliYikama";
import { evdenEveNakliyatIndustryPack } from "./packs/evdenEveNakliyat";
import { kombiKlimaServisiIndustryPack } from "./packs/kombiKlimaServisi";
import { sihhiTesisatIndustryPack } from "./packs/sihhiTesisat";

export const CANONICAL_INDUSTRY_PACKS: Record<string, IndustryPack> = {
  [otoKurtarmaIndustryPack.slug]: otoKurtarmaIndustryPack,
  [disHekimligiIndustryPack.slug]: disHekimligiIndustryPack,
  [hukukAvukatIndustryPack.slug]: hukukAvukatIndustryPack,
  [haliYikamaIndustryPack.slug]: haliYikamaIndustryPack,
  [evdenEveNakliyatIndustryPack.slug]: evdenEveNakliyatIndustryPack,
  [kombiKlimaServisiIndustryPack.slug]: kombiKlimaServisiIndustryPack,
  [sihhiTesisatIndustryPack.slug]: sihhiTesisatIndustryPack,
};

export const ALL_INDUSTRY_PACKS: IndustryPack[] = Object.values(CANONICAL_INDUSTRY_PACKS);

/**
 * Returns a lightweight summary of an IndustryPack suitable for catalog listings
 */
export function toIndustryPackSummary(pack: IndustryPack) {
  return {
    id: pack.id,
    slug: pack.slug,
    name: pack.name,
    category: pack.category,
    version: pack.version || "1.0.0",
    status: pack.status || "ACTIVE",
    description: pack.description,
    serviceCount: pack.defaultServices.length,
    faqCount: pack.defaultFaqs.length,
    aliases: pack.aliases,
  };
}
