import { Router } from "restify-router";
import { getAllDescriptionsForProduct } from "../controllers/descriptions_controller";
import { verifyUser } from "../middleware";

export const descriptionRouter = new Router();

/**
 * @api GET /api/v1/ai/descriptions/{productID}/
 *
 * Used to get all descriptions for a specific product
 */
descriptionRouter.get(
  "/api/v1/descriptions/:productID",
  getAllDescriptionsForProduct
);
