import Stripe from "stripe";
import { CreditsModel } from "../db/credits";
import { UserModel } from "../db/user";
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
    console.log(user, "user in createPaymentIntent");
    if (!user.length) {
      return res.send(404, {
        error: "User not found",
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
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
