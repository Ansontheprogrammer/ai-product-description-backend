/**
 * Shopify GDPR Compliance Routes
 *
 * These are mandatory webhooks that Shopify requires for GDPR compliance.
 * They handle customer data requests, data redaction, and shop deletion.
 */
import { Router } from "restify-router";
import {
  handleCustomerDataRequest,
  handleShopRedact,
  handleShopDelete,
} from "../controllers/shopify_gdpr_controller";
import { verifyUser } from "../middleware";

export const shopifyRouter = new Router();

/**
 * @api POST /api/v1/shopify/customers/data_request
 *
 * Handle customer data request (GDPR compliance)
 * Called when a customer requests their data from a Shopify store.
 *
 * Body (from Shopify):
 * - shop_id: number
 * - shop_domain: string
 * - customer: object (customer details)
 * - orders: array (customer orders)
 */
shopifyRouter.post(
  "/api/v1/shopify/customers/data_request",
  handleCustomerDataRequest
);

/**
 * @api POST /api/v1/shopify/shop/redact
 *
 * Handle shop redact request (GDPR compliance)
 * Called when a shop owner requests to redact customer data.
 *
 * Body (from Shopify):
 * - shop_id: number
 * - shop_domain: string
 * - customer: object (customer to redact)
 */
shopifyRouter.post("/api/v1/shopify/shop/redact", verifyUser, handleShopRedact);

/**
 * @api DELETE /api/v1/shopify/data/shop/delete
 *
 * Handle shop delete request (GDPR compliance)
 * Called when a shop is deleted/uninstalled.
 *
 * Body (from Shopify):
 * - shop_id: number
 * - shop_domain: string
 */
shopifyRouter.del(
  "/api/v1/shopify/data/shop/delete",
  verifyUser,
  handleShopDelete
);
