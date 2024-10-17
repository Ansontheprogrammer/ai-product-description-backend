import { aiApps } from "../ai_model/ai_apps";
import OpenAI from "../ai_model/open_ai";
import synthesia from "../ai_model/synthesia";
import path from "path";

/**
 * Get AI-generated images based on a prompt.
 *
 * Method: POST
 * Endpoint: /getAIImages
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export async function getAIImages(req, res, next) {
  try {
    return res.json(await OpenAI.generateAIImages(req.body.prompt));
  } catch (err) {
    console.error(err, "ERROR WITH GENERATING IMAGES");
    return next(err);
  }
}

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
  try {
    /// Shopify app sends form data that needs parsing
    if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }
    let type = req.body.type ? req.body.type : "standard";
    let aiResponse = "";
    if (type === "product_description") {
      aiResponse = await OpenAI.generateProductDescription(
        req.body.promptSettings
      );
    } else {
      aiResponse = await OpenAI.generateAIResponse(req.body.prompt);
    }

    return res.json(aiResponse);
  } catch (err) {
    console.error(err, "ERROR WITH GENERATING PROMPT");
    return next(err);
  }
}

/**
 * Get an AI chat response based on a user message.
 *
 * Method: POST
 * Endpoint: /getAIChatResponse
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export async function getAIChatResponse(req, res, next) {
  try {
    return res.json(await OpenAI.generateAIChatResponse(req.body.message));
  } catch (err) {
    console.error(err, "ERROR WITH GENERATING CHAT RESPONSE");
    return next(err);
  }
}

/**
 * Get a list of available AI apps.
 *
 * Method: GET
 * Endpoint: /getAIApps
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export async function getAIApps(req, res, next) {
  try {
    return res.json(aiApps);
  } catch (err) {
    console.error(err, "ERROR WITH GETTING AI APPS");
    return next(err);
  }
}

/**
 * Create and download an AI-generated video.
 *
 * Method: POST
 * Endpoint: /createAndDownloadAIVideo
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export async function createAndDownloadAIVideo(req, res, next) {
  try {
    const outputFilename = await synthesia.createAndDownloadVideo(
      req.body.script,
      req.body.avatar,
      req.body.background
    );
    // Send the video file
    return res.sendFile(path.resolve(outputFilename));
  } catch (error) {
    return next(error);
  }
}
