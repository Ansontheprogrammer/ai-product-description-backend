import { Router } from "restify-router";
import { getProductDescription } from "../controllers/ai_controller";

export const aiRouter = new Router();

/**
 * @api GET /api/v1/ai/prompt
 *
 * Use the AI to generate ideas
 */
aiRouter.post("/api/v1/ai/prompt", getProductDescription);
