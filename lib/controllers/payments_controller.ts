import Stripe from "stripe";
import { CreditsModel } from "../db/credits";
import { UserModel } from "../db/user";
import { PaymentsModel } from "../db/payments";
import { Timestamp } from "firebase-admin/firestore";

const env = process.env.NODE_ENV;
const stripeSecretKey =
  env === "production"
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_TEST_SECRET_KEY;
// Initialize Stripe with your secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
});

/**
 * Create a payment intent for adding credits
 *
 * Method: POST
 * Endpoint: /api/v1/payments/create-payment-intent
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function createPaymentIntent(req, res, next) {
  try {
    const { amount, currency = "usd", storeID, creditAmount } = req.body;

    // Validate required fields
    if (!amount || !storeID || !creditAmount) {
      next(
        "Missing required fields: amount, storeID, and creditAmount are required"
      );
    }

    // Verify user exists
    const userModel = new UserModel();
    const user = await userModel.getByField("storeID", storeID);
    if (!user.length) {
      return res.send(404, {
        error: "User not found",
      });
    }

    // Ensure Stripe customer exists for this user
    const paymentsModel = new PaymentsModel();
    const stripeCustomerID = await paymentsModel.ensureCustomer(storeID);

    // Create payment intent with customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerID, // Associate with Stripe customer
      metadata: {
        storeID,
        creditAmount: creditAmount.toString(),
        type: "credit_purchase",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      creditAmount,
      currency,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return next("Failed to create payment intent");
  }
}

/**
 * Handle successful payment and add credits to user account
 *
 * Method: POST
 * Endpoint: /api/v1/payments/confirm-payment
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function confirmPayment(req, res, next) {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.send(400, {
        error: "Payment intent ID is required",
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.send(400, {
        error: "Payment has not succeeded yet",
      });
    }

    const { storeID, creditAmount } = paymentIntent.metadata;

    if (!storeID || !creditAmount) {
      return res.send(400, {
        error: "Invalid payment metadata",
      });
    }

    // Add credits to user account
    const creditsModel = new CreditsModel();
    await creditsModel.create({
      userID: storeID,
      credits: parseInt(creditAmount),
      transactionType: "paid",
      stripePaymentID: paymentIntentId,
      createdAt: Timestamp.fromDate(new Date()),
    });

    // Get updated credit balance
    const totalCredits = await creditsModel.getCurrentCredits(storeID);

    return res.json({
      success: true,
      message: "Credits added successfully",
      creditsAdded: parseInt(creditAmount),
      totalCredits,
      paymentIntentId,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.send(500, {
      error: "Failed to confirm payment",
    });
  }
}

/**
 * Get current credit balance for a user
 *
 * Method: GET
 * Endpoint: /api/v1/payments/credits/:storeID
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function getCreditBalance(req, res, next) {
  try {
    const { storeID } = req.params;

    if (!storeID) {
      return res.send(400, {
        error: "Store ID is required",
      });
    }

    const creditsModel = new CreditsModel();
    const totalCredits = await creditsModel.getCurrentCredits(storeID);

    return res.json({
      storeID,
      totalCredits,
    });
  } catch (error) {
    console.error("Error getting credit balance:", error);
    return res.send(500, {
      error: "Failed to get credit balance",
    });
  }
}

/**
 * Get credit transaction history for a user
 *
 * Method: GET
 * Endpoint: /api/v1/payments/credits/:storeID/history
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function getCreditHistory(req, res, next) {
  try {
    const { storeID } = req.params;

    if (!storeID) {
      return res.send(400, {
        error: "Store ID is required",
      });
    }

    const creditsModel = new CreditsModel();
    const creditHistory = await creditsModel.getByField("userID", storeID);

    return res.json({
      storeID,
      transactions: creditHistory.map((transaction) => ({
        credits: transaction.data.credits,
        transactionType: transaction.data.transactionType,
        stripePaymentID: transaction.data.stripePaymentID,
        createdAt: transaction.data.createdAt || transaction.data.datetime,
      })),
    });
  } catch (error) {
    console.error("Error getting credit history:", error);
    return res.send(500, {
      error: "Failed to get credit history",
    });
  }
}

/**
 * Process a refund for a payment
 *
 * Method: POST
 * Endpoint: /api/v1/payments/refund
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function processRefund(req, res, next) {
  try {
    const { paymentIntentId, reason } = req.body;

    // Validate required fields
    if (!paymentIntentId) {
      return res.send(400, {
        error: "Payment intent ID is required",
      });
    }

    // Use the PaymentsModel to process the refund
    const paymentsModel = new PaymentsModel();
    const refundResult = await paymentsModel.refundUser(paymentIntentId);

    return res.json({
      success: true,
      message: "Refund processed successfully",
      refundId: refundResult.refundId,
      amountRefunded: refundResult.amountRefunded,
      currency: refundResult.currency,
      reason: reason || "requested_by_customer",
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return res.send(500, {
      error: "Failed to process refund",
    });
  }
}

/**
 * Get refund status for a payment
 *
 * Method: GET
 * Endpoint: /api/v1/payments/refund/:paymentIntentId
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function getRefundStatus(req, res, next) {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.send(400, {
        error: "Payment intent ID is required",
      });
    }

    // Retrieve payment intent and its refunds from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.send(404, {
        error: "Payment intent not found",
      });
    }

    // Get refunds for this payment intent
    const refunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
    });

    return res.json({
      paymentIntentId,
      paymentStatus: paymentIntent.status,
      totalAmount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      refunds: refunds.data.map((refund) => ({
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: new Date(refund.created * 1000),
      })),
      totalRefunded: refunds.data.reduce(
        (sum, refund) => sum + refund.amount / 100,
        0
      ),
      isFullyRefunded:
        refunds.data.reduce((sum, refund) => sum + refund.amount, 0) >=
        paymentIntent.amount,
    });
  } catch (error) {
    console.error("Error getting refund status:", error);
    return res.send(500, {
      error: "Failed to get refund status",
    });
  }
}

/**
 * Get payment history for a user (including refunds)
 *
 * Method: GET
 * Endpoint: /api/v1/payments/history/:storeID
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function getPaymentHistory(req, res, next) {
  try {
    const { storeID } = req.params;

    if (!storeID) {
      return res.send(400, {
        error: "Store ID is required",
      });
    }

    // Get user to find their Stripe customer ID
    const userModel = new UserModel();
    const users = await userModel.getByField("storeID", storeID);

    if (!users.length) {
      return res.send(404, {
        error: "User not found",
      });
    }

    const user = users[0];

    if (!user.stripeCustomerID) {
      return res.json({
        storeID,
        payments: [],
        message: "No payment history found",
      });
    }

    // Use PaymentsModel to get payment history
    const paymentsModel = new PaymentsModel();
    const payments = await paymentsModel.getUserPayments(user.stripeCustomerID);

    return res.json({
      storeID,
      stripeCustomerID: user.stripeCustomerID,
      payments,
    });
  } catch (error) {
    console.error("Error getting payment history:", error);
    return res.send(500, {
      error: "Failed to get payment history",
    });
  }
}
