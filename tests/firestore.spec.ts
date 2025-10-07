import { db } from "../lib/db/client.server";
import { CreditsModel, ICredits } from "../lib/db/credits";
import { DescriptionModel, IDescription } from "../lib/db/descriptions";
import { IUser, UserModel } from "../lib/db/user";

const testStoreID = "test-store-id";
describe("Firestore", () => {
  beforeAll(async () => {
    try {
      const testDescription: IDescription = {
        shopifyStoreID: testStoreID,
        text: "test-description",
        productID: "test-product-id",
      };
      const descriptionModel = new DescriptionModel();
      await descriptionModel.create(testDescription);

      const testUser: IUser = {
        membership: "free",
        email: "test-email",
        storeID: testStoreID,
      };
      const userModel = new UserModel();
      await userModel.create(testUser);

      const testCredit: ICredits = {
        userID: testStoreID,
        credits: 10,
        transactionType: "free",
      };
      const creditsModel = new CreditsModel();
      await creditsModel.create(testCredit);
    } catch (error) {
      throw error;
    }
  });
  it("should make sure Firestore is online", async () => {
    try {
      const systemCollection = db.collection("system-test");
      await systemCollection.add({
        online: "ping",
        datetime: new Date(),
      });
    } catch (error) {
      throw error;
    }
  });

  it("should make sure 'descriptions' collections exist", async () => {
    const descriptionCollection = db.collection("descriptions");
    const querySnapshot = await descriptionCollection.get();
    expect(querySnapshot.docs.length > 1);
  });

  it("should make sure 'users' collections exist", async () => {
    const userCollection = db.collection("users");
    const querySnapshot = await userCollection.get();
    expect(querySnapshot.docs.length > 1);
  });
  it("should make sure 'credits' collections exist", async () => {
    const creditsCollection = db.collection("credits");
    const querySnapshot = await creditsCollection.get();
    expect(querySnapshot.docs.length > 1);
  });

  it("should find one document by field", async () => {
    const descriptionModel = new DescriptionModel();
    const description = await descriptionModel.findOneByField(
      "shopifyStoreID",
      testStoreID
    );
    expect(description.shopifyStoreID).toBe(testStoreID);
  });
  it("should find all documents by field", async () => {
    const descriptionModel = new DescriptionModel();
    /// add one more document to the collection.
    await descriptionModel.create({
      shopifyStoreID: testStoreID,
      text: "test-description",
      productID: "test-product-id",
    });
    const descriptions = await descriptionModel.findAllByField(
      "shopifyStoreID",
      testStoreID
    );
    expect(descriptions.length).toBeGreaterThan(1);
  });
});
