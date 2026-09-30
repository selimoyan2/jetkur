/**
 * JetKur Production Database Seed Script (Sprint 16.4)
 *
 * Core Principles:
 * 1. 100% IDEMPOTENT: Safe to run repeatedly, uses upsert by unique identifiers.
 * 2. NO MOCK CUSTOMER DATA: Only seeds system-level catalogs (Plans, Entitlements, Templates).
 * 3. Never overwrites existing active customer data.
 */

import { PrismaClient } from "@prisma/client";
import { CANONICAL_PLANS } from "../src/server/entitlements/planDefinitions";
import { CANONICAL_TEMPLATE_MANIFESTS } from "../src/domain/templates/catalog";

const prisma = new PrismaClient();

export async function seedProductionDatabase() {
  console.log("=== SEEDING JETKUR PRODUCTION DATABASE BASELINE ===");

  // 1. Seed Canonical Plans & Entitlements
  console.log("Seeding canonical plans and entitlements...");
  for (const planDef of Object.values(CANONICAL_PLANS)) {
    const plan = await prisma.plan.upsert({
      where: { code: planDef.code },
      update: {
        name: planDef.name,
        description: planDef.description,
        siteLimit: planDef.siteLimit,
        trialDays: planDef.trialDays,
        monthlyPrice: planDef.monthlyPrice,
        currency: planDef.currency,
        status: "ACTIVE",
      },
      create: {
        code: planDef.code,
        name: planDef.name,
        description: planDef.description,
        siteLimit: planDef.siteLimit,
        trialDays: planDef.trialDays,
        monthlyPrice: planDef.monthlyPrice,
        currency: planDef.currency,
        status: "ACTIVE",
      },
    });

    // Seed feature entitlements for this plan
    for (const [featureKey, enabled] of Object.entries(planDef.features)) {
      await prisma.planEntitlement.upsert({
        where: {
          planId_featureKey: {
            planId: plan.id,
            featureKey,
          },
        },
        update: {
          enabled,
        },
        create: {
          planId: plan.id,
          featureKey,
          enabled,
        },
      });
    }

    // Seed numeric limit entitlements for this plan
    for (const [limitKey, limitValue] of Object.entries(planDef.limits)) {
      await prisma.planEntitlement.upsert({
        where: {
          planId_featureKey: {
            planId: plan.id,
            featureKey: limitKey,
          },
        },
        update: {
          limitValue,
          enabled: true,
        },
        create: {
          planId: plan.id,
          featureKey: limitKey,
          limitValue,
          enabled: true,
        },
      });
    }

    console.log(`  ✓ Plan seeded: ${plan.code} (${plan.name})`);
  }

  // 2. Seed Canonical Design Templates Catalog
  console.log("Seeding canonical design templates catalog...");
  for (const tmpl of CANONICAL_TEMPLATE_MANIFESTS) {
    await prisma.designTemplate.upsert({
      where: { slug: tmpl.slug },
      update: {
        name: tmpl.name,
        category: tmpl.category,
        previewImage: tmpl.previewImageUrl || null,
        defaultTokens: tmpl.designTokens as any,
        supportedVariants: tmpl.sectionRecipe as any,
      },
      create: {
        slug: tmpl.slug,
        name: tmpl.name,
        category: tmpl.category,
        previewImage: tmpl.previewImageUrl || null,
        defaultTokens: tmpl.designTokens as any,
        supportedVariants: tmpl.sectionRecipe as any,
      },
    });
    console.log(`  ✓ Template seeded: ${tmpl.slug} (${tmpl.name})`);
  }

  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedProductionDatabase()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error("Seed error:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
