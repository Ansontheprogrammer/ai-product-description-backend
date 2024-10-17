import { aiRouter } from "./ai_router";
import { shopifyRouter } from "./shopify_router";

/// CREATING PROTECTED ROUTES THAT WILL ATTEMPT TO FIND A USER WITHIN THE DB
const protectedRoutes = {
  ai: aiRouter,
};

export default {
  ...protectedRoutes,
  shopify: shopifyRouter,
};
