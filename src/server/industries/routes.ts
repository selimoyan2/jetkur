/**
 * JetKur Industry Pack Catalog API Routes (Sprint 05)
 *
 * Public read-only endpoints providing sector intelligence:
 * GET /api/industries
 * GET /api/industries/:slug
 * POST /api/industries/resolve
 */

import { Router } from "express";
import { industryPackService } from "./industryPackService";

export const industryRouter = Router();

/**
 * GET /api/industries
 * Lightweight catalog listing of active industry packs
 */
industryRouter.get("/", (_req, res) => {
  try {
    const list = industryPackService.list(true);
    res.json({
      industries: list,
      count: list.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Sektör listesi alınırken hata oluştu.", details: err.message });
  }
});

/**
 * POST /api/industries/resolve
 * Resolves user search input / sector string to canonical IndustryPack
 */
industryRouter.post("/resolve", (req, res) => {
  try {
    const query = req.body?.query || req.body?.text || "";
    const result = industryPackService.resolve(query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Sektör çözümleme hatası.", details: err.message });
  }
});

/**
 * GET /api/industries/:slug
 * Full canonical industry pack detail
 */
industryRouter.get("/:slug", (req, res) => {
  try {
    const slug = req.params.slug;
    const pack = industryPackService.getBySlug(slug);

    if (!pack) {
      res.status(404).json({
        error: `Belirtilen sektör ('${slug}') katalogda bulunamadı.`,
        code: "INDUSTRY_NOT_FOUND",
      });
      return;
    }

    res.json(pack);
  } catch (err: any) {
    res.status(500).json({ error: "Sektör detayı alınırken hata oluştu.", details: err.message });
  }
});
