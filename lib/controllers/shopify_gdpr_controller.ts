/**
 * Shopify GDPR Compliance Controller
 *
 * These endpoints are mandatory for Shopify apps to handle GDPR compliance.
 * Shopify will call these webhooks when merchants or customers request data operations.
 */

import { UserModel } from "../db/user";
import { CreditsModel } from "../db/credits";
import { PaymentsModel } from "../db/payments";
import { DescriptionModel } from "../db/descriptions";

/**
 * Handle customer data request
 *
 * Called when a customer requests their data from a Shopify store.
 * You must return all data you have stored about this customer.
 *
 * Method: POST
 * Endpoint: /api/v1/shopify/customers/data_request
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function handleCustomerDataRequest(req, res, next) {
  try {
    const { storeID } = req.body;

    // Find user data by shop domain
    const userModel = new UserModel();
    const users = await userModel.getByField("storeID", storeID);

    if (!users.length) {
      // No data found for this shop
      return res.json({
        message: "No customer data found for this shop",

        data: null,
      });
    }

    const user = users[0];

    // Collect all customer data we have stored
    const customerData = {
      shop_info: {
        store_id: user.storeID,
      },
      user_data: {
        email: user.email,
        access_token_created: user.createdAt,
        stripe_customer_id: user.stripeCustomerID || null,
        membership: user.membership || null,
      },
      credits_data: null,
      payment_data: null,
    };

    // Get credits data if available
    try {
      const creditsModel = new CreditsModel();
      const credits = await creditsModel.getCurrentCredits(user.storeID);
      const creditHistory = await creditsModel.getByField(
        "userID",
        user.storeID
      );

      customerData.credits_data = {
        current_balance: credits,
        transaction_history: creditHistory.map((transaction) => ({
          credits: transaction.data.credits,
          transaction_type: transaction.data.transactionType,
          stripe_payment_id: transaction.data.stripePaymentID,
          created_at: transaction.data.createdAt,
        })),
      };
    } catch (error) {
      console.warn("Could not retrieve credits data:", error);
    }

    // Get payment data if available
    try {
      if (user.stripeCustomerID) {
        const paymentsModel = new PaymentsModel();
        const payments = await paymentsModel.getUserPayments(
          user.stripeCustomerID
        );

        customerData.payment_data = {
          stripe_customer_id: user.stripeCustomerID,
          payment_history: payments.map((payment) => ({
            payment_id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            created: payment.created,
            metadata: payment.metadata,
          })),
        };
      }
    } catch (error) {
      console.warn("Could not retrieve payment data:", error);
    }

    return res.json({
      message: "Customer data retrieved successfully",
      store_id: user.storeID,
      data: customerData,
    });
  } catch (error) {
    console.error("Error handling customer data request:", error);
    return res.send(500, {
      error: "Failed to process customer data request",
    });
  }
}

/**
 * Handle shop redact request
 *
 * Called when a shop owner requests to redact customer data.
 * You should remove or anonymize any customer data you have stored.
 *
 * Method: POST
 * Endpoint: /api/v1/shopify/shop/redact
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function handleShopRedact(req, res, next) {
  try {
    console.log("Handle shop redact request", req.user);
    const storeID = req.user.storeID;
    // Find user data by shop domain
    const userModel = new UserModel();
    const users = await userModel.getByField("storeID", storeID);
    console.log("users", users, storeID);

    if (!users.length) {
      // No data found for this shop
      return res.json({
        message: "No customer data found to redact",
        store_id: storeID,
        redacted: false,
      });
    }

    const user = users[0];

    // Redact/anonymize customer data
    const redactedData = {
      email: "[REDACTED]",
      access_token: null,
      stripeCustomerID: null,
      membership: null,
      redacted_at: new Date().toISOString(),
      original_store_id: user.storeID,
    };

    // Update user record with redacted data
    await userModel.update(user.storeID, redactedData);

    // Note: You might also want to redact credits and payment data
    // depending on your data retention policies

    return res.json({
      message: "Customer data redacted successfully",
      store_id: user.storeID,
      redacted: true,
      redacted_at: redactedData.redacted_at,
    });
  } catch (error) {
    console.error("Error handling shop redact request:", error);
    return res.send(500, {
      error: "Failed to process shop redact request",
    });
  }
}

/**
 * Handle shop delete request
 *
 * Called when a shop is deleted/uninstalled.
 * You should delete all data associated with this shop.
 *
 * Method: DELETE
 * Endpoint: /api/v1/shopify/data/shop/delete
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export async function handleShopDelete(req, res, next) {
  try {
    const shop_domain = req.user.storeID;

    // Find user data by shop domain
    const userModel = new UserModel();
    const users = await userModel.getByField("storeID", shop_domain);

    if (!users.length) {
      // No data found for this shop
      return res.json({
        message: "No shop data found to delete",
        shop_domain,
        deleted: false,
      });
    }

    const user = users[0];
    const deletionResults = {
      user_deleted: false,
      credits_deleted: false,
      descriptons_deleted: false,
      payment_data_note: "Stripe data retained for compliance",
    };

    // Delete user data
    try {
      await userModel.delete(user.storeID);
      deletionResults.user_deleted = true;
    } catch (error) {
      console.error("Error deleting user data:", error);
    }

    // Delete credits data
    try {
      const creditsModel = new CreditsModel();
      const creditTransactions = await creditsModel.getByField(
        "userID",
        user.storeID
      );

      for (const transaction of creditTransactions) {
        await creditsModel.delete(transaction.id);
      }
      deletionResults.credits_deleted = true;
    } catch (error) {
      console.error("Error deleting credits data:", error);
    }

    // Delete description data
    try {
      const descriptionModel = new DescriptionModel();
      const descriptions = await descriptionModel.getByField(
        "shopifyStoreID",
        user.storeID
      );

      for (const transaction of descriptions) {
        await descriptionModel.delete(transaction.id);
      }
      deletionResults.descriptons_deleted = true;
    } catch (error) {
      console.error("Error deleting credits data:", error);
    }

    // Note: We typically don't delete payment data from Stripe for compliance reasons
    // Stripe handles their own data retention policies

    return res.json({
      message: "Shop data deleted successfully",
      shop_domain,
      storeID: req.user.storeID,
      deleted: true,
      deletion_results: deletionResults,
      deleted_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error handling shop delete request:", error);
    return res.send(500, {
      error: "Failed to process shop delete request",
    });
  }
}
