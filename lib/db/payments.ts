/*
  This model will handle payments.
  We will use Stripe for payments.
  We will store the Stripe customer ID in the user document.
*/

import Stripe from "stripe";
import { BaseModel } from ".";
import { UserModel } from "../db/user";
import { CreditsModel } from "../db/credits";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "./client.server";

const env = process.env.NODE_ENV;
const stripeSecretKey =
  env === "production"
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_TEST_SECRET_KEY;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
});

export class PaymentsModel extends BaseModel {
  protected collection = db.collection("payments");

  /**
   * Ensures a Stripe customer exists for this storeID.
   * If not, creates one and stores the customer ID in the user's record.
   */
  public async ensureCustomer(storeID: string, email?: string) {
    try {
      const userModel = new UserModel();
      const user = await userModel.findOneByField("storeID", storeID);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.stripeCustomerID) {
        return user.stripeCustomerID;
      }

      /// Create user a temporary email variable if no email is provided
      if (!email) {
        email = storeID + "@unknown.com";
      }
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { storeID },
      });

      // Update user record
      await userModel.update(storeID, {
        stripeCustomerID: customer.id,
      });

      return customer.id;
    } catch (error) {
      console.error("Error ensuring customer:", error);
      throw error;
    }
  }

  /**
   * Refunds a payment and reverses any related credit addition
   */
  public async refundUser(paymentIntentId: string) {
    try {
      // Retrieve payment from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (!paymentIntent) {
        throw new Error("Payment intent not found");
      }

      // Issue refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      // Reverse credits if applicable
      const { storeID, creditAmount } = paymentIntent.metadata || {};
      if (storeID && creditAmount) {
        const creditsModel = new CreditsModel();
        await creditsModel.create({
          userID: storeID,
          credits: -parseInt(creditAmount),
          transactionType: "refund",
          stripePaymentID: paymentIntentId,
          createdAt: Timestamp.fromDate(new Date()),
        });
      }

      return {
        success: true,
        refundId: refund.id,
        amountRefunded: refund.amount / 100,
        currency: refund.currency,
      };
    } catch (error) {
      console.error("Error refunding user:", error);
      throw new Error("Failed to process refund");
    }
  }

  /**
   * Fetch a user’s Stripe payment history (directly from Stripe)
   */
  public async getUserPayments(stripeCustomerID: string) {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: stripeCustomerID,
      limit: 20,
    });

    return paymentIntents.data.map((intent) => ({
      id: intent.id,
      amount: intent.amount / 100,
      currency: intent.currency,
      status: intent.status,
      created: new Date(intent.created * 1000),
      metadata: intent.metadata,
    }));
  }
}

export const paymentsModel = new PaymentsModel();
