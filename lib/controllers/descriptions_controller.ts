import { descriptionModel } from "../db/descriptions";

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
export async function getAllDescriptionsForProduct(req, res, next) {
  const { productID } = req.params;
  try {
    const allDescriptionsForProduct =
      await descriptionModel.getAllDescriptionsForProduct(productID);

    return res.json(allDescriptionsForProduct);
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
