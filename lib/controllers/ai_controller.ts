import descriptionModel from "ai-product-description";
import * as dotenv from "dotenv";

/// Load enviroment variables.
dotenv.config();
/**
 * Get an AI response to a given prompt or question.
 *
 * Method: POST
 * Endpoint: /getAIPromptResponse
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export async function getAIPromptResponse(req, res, next) {
  const { shopifyStoreID, promptSettings } = req.body;
  try {
    /// Shopify app sends form data that needs parsing
    if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }
    let aiResponse = "";

    aiResponse = await descriptionModel.getProductDescription(
      promptSettings,
      shopifyStoreID
    );

    return res.json(aiResponse);
  } catch (err) {
    const error = err as Error;
    if (error.message === "USAGE_LIMIT_REACHED") {
      return res.send(429, {
        code: "USAGE_LIMIT_REACHED",
        message: "Daily limit reached.",
      });
    }

    return next();
  }
}
