import { Router } from "restify-router";
import {
  authorizationCallback,
  authorize,
} from "../controllers/auth_controller";

export const authRouter = new Router();
// Step 1 — Redirect user to OAuth provider
authRouter.get("/auth/:storeID", authorize);

// Step 2 — Handle callback & exchange code for token
authRouter.get("/api/auth/callback", authorizationCallback);
