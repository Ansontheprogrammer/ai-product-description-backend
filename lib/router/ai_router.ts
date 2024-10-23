import { Router } from "restify-router";
import {
  createAndDownloadAIVideo,
  deleteAccount,
  getAIApps,
  getAIChatResponse,
  getAIImages,
  getAIPromptResponse,
} from "../controllers/ai_controller";

export const aiRouter = new Router();

/**
 * @api GET /api/v1/ai/images
 *
 * Create ai images
 *
 * body: {
 *   prompt: string
 * }
 */
aiRouter.post("/api/v1/ai/images", getAIImages);

/**
 * @api GET /api/v1/ai/prompt
 *
 * Use the AI to generate ideas
 */
aiRouter.post("/api/v1/ai/prompt", getAIPromptResponse);

/**
 * @api GET /api/v1/ai/chat
 *
 * Chat with the AI
 *
 */
aiRouter.post("/api/v1/ai/chat", getAIChatResponse);

/**
 * @api POST /api/v1/ai/video
 *
 * Generate AI video with the Synthesia
 *
 */
aiRouter.post("/api/v1/ai/video", createAndDownloadAIVideo);

/**
 * @api GET /api/v1/ai/apps
 *
 * Get AI apps we currently provide as services
 *
 */
aiRouter.get("/api/v1/ai/apps", getAIApps);

/**
 * @api DELETE /api/v1/ai/user/:userId
 *
 * Delete Account
 *
 */
aiRouter.del("/api/v1/ai/user/:userId", deleteAccount);
