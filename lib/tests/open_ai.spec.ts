import { db } from "../db/client.server";
import { descriptionModel } from "../db/descriptions";

describe("System Checks", () => {
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
});
