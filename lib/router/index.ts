import { aiRouter } from "./ai_router";
import { descriptionRouter } from "./descriptions_router";
import { shopifyRouter } from "./shopify_router";

export default {
  ai: aiRouter,
  description: descriptionRouter,
  shopify: shopifyRouter,
};
