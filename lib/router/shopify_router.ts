/**
 * Setting up mandatory routes for shopify.
 * We currently are not storing any data so we will return 200
 */
import { Router } from "restify-router";

export const shopifyRouter = new Router();

shopifyRouter.get("/api/v1/shopify/data/get", (req, res, next) => {
  return res.send(200);
});
shopifyRouter.get("/api/v1/shopify/data/delete", (req, res, next) => {
  return res.send(200);
});

shopifyRouter.del("/api/v1/shopify/data/shop/delete", (req, res, next) => {
  return res.send(401);
});
