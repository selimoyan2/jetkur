import { Router, Response } from "express";
import {
  requireAuth,
  requireSuperAdmin,
  AuthenticatedRequest,
} from "./middleware";
import { adminCustomerService } from "./adminCustomerService";

export const adminCustomerRouter = Router();

// All Super Admin customer account endpoints require authenticated SUPER_ADMIN role
adminCustomerRouter.use(requireAuth);
adminCustomerRouter.use(requireSuperAdmin);

/**
 * GET /api/admin/customers
 * Returns canonical customer accounts with workspaces, subscriptions, trial expiry, and owned sites.
 */
adminCustomerRouter.get(
  "/",
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const customers = await adminCustomerService.listCustomerAccounts();
      res.status(200).json({
        success: true,
        customers,
      });
    } catch (error) {
      console.error("[AdminCustomer] Error listing customer accounts:", error);
      res.status(500).json({
        error: "Müşteri hesap bilgileri alınamadı.",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/admin/customers/:identifier
 * Resolves a single customer account by userId, email, workspaceId, or siteId.
 */
adminCustomerRouter.get(
  "/:identifier",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const identifier = req.params.identifier;
      const customer = await adminCustomerService.getCustomerAccountByIdentifier(identifier);

      if (!customer) {
        res.status(404).json({
          error: "Müşteri hesabı bulunamadı.",
          code: "CUSTOMER_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        customer,
      });
    } catch (error) {
      console.error("[AdminCustomer] Error fetching customer account:", error);
      res.status(500).json({
        error: "Müşteri hesap detayı alınamadı.",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default adminCustomerRouter;
