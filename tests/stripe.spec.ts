import { db } from "../lib/db/client.server";
import { PaymentsModel } from "../lib/db/payments";

const testStoreID = "test-store-id";
const testStripeCustomerID = "cus_TC0dMpWtIDwK79";
describe("Stripe", () => {
  beforeAll(async () => {});
  it("should make sure customer exists", async () => {
    try {
      const paymentsCollection = new PaymentsModel();
      const customerID = await paymentsCollection.ensureCustomer(testStoreID);
      expect(customerID).toBeTruthy();
    } catch (error) {
      throw error;
    }
  });

  it("should get user payments successfully", async () => {
    try {
      const paymentsCollection = new PaymentsModel();
      await paymentsCollection.getUserPayments(testStripeCustomerID);
    } catch (error) {
      throw error;
    }
  });
});
