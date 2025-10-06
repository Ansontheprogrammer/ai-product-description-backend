import { Router } from "restify-router";
import {
  createPaymentIntent,
  confirmPayment,
  getCreditBalance,
  getCreditHistory,
  processRefund,
  getRefundStatus,
  getPaymentHistory,
} from "../controllers/payments_controller";
import { verifyUser } from "../middleware";

export const paymentsRouter = new Router();

/**
 * @api POST /api/v1/payments/create-payment-intent
 *
 * Create a Stripe payment intent for purchasing credits
 *
 * Body:
 * - amount: number (dollar amount, e.g., 10.00)
 * - storeID: string (user's store ID)
 * - creditAmount: number (number of credits to purchase)
 * - currency?: string (default: "usd")
 */
paymentsRouter.post(
  "/api/v1/payments/create-payment-intent",
  verifyUser,
  createPaymentIntent
);

/**
 * @api POST /api/v1/payments/confirm-payment
 *
 * Confirm a successful payment and add credits to user account
 *
 * Body:
 * - paymentIntentId: string (Stripe payment intent ID)
 */
paymentsRouter.post(
  "/api/v1/payments/confirm-payment",
  verifyUser,
  confirmPayment
);

/**
 * @api GET /api/v1/payments/credits/:storeID
 *
 * Get current credit balance for a user
 *
 * Params:
 * - storeID: string (user's store ID)
 */
paymentsRouter.get(
  "/api/v1/payments/credits/:storeID",
  verifyUser,
  getCreditBalance
);

/**
 * @api GET /api/v1/payments/credits/:storeID/history
 *
 * Get credit transaction history for a user
 *
 * Params:
 * - storeID: string (user's store ID)
 */
paymentsRouter.get(
  "/api/v1/payments/credits/:storeID/history",
  verifyUser,
  getCreditHistory
);

/**
 * @api POST /api/v1/payments/refund
 *
 * Process a refund for a payment
 *
 * Body:
 * - paymentIntentId: string (Stripe payment intent ID to refund)
 * - reason?: string (optional reason for refund)
 */
paymentsRouter.post("/api/v1/payments/refund", verifyUser, processRefund);

/**
 * @api GET /api/v1/payments/refund/:paymentIntentId
 *
 * Get refund status for a specific payment
 *
 * Params:
 * - paymentIntentId: string (Stripe payment intent ID)
 */
paymentsRouter.get(
  "/api/v1/payments/refund/:paymentIntentId",
  verifyUser,
  getRefundStatus
);

/**
 * @api GET /api/v1/payments/history/:storeID
 *
 * Get complete payment history for a user (including refunds)
 *
 * Params:
 * - storeID: string (user's store ID)
 */
paymentsRouter.get(
  "/api/v1/payments/history/:storeID",
  verifyUser,
  getPaymentHistory
);
