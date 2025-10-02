import { addDoc, collection } from "@firebase/firestore";
import { getDocs, Timestamp } from "firebase/firestore";
import { db } from "../db/client.server";
import descriptionModel from "openai-product-description";

describe("System Checks", () => {
  it("should make sure Firestore is online", async () => {
    try {
      const systemCollection = collection(db, "system-test");
      await addDoc(systemCollection, {
        online: "ping",
        datetime: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      throw error;
    }
  });

  it("should make sure 'descriptions' collections exist", async () => {
    const descriptionCollection = collection(db, "descriptions");
    const querySnapshot = await getDocs(descriptionCollection);
    expect(querySnapshot.docs.length > 1);
  });

  it("should build the prompt with title only", async () => {
    const promptSettings = { title: "Snowboard" };

    const result = await descriptionModel.getProductDescription(
      promptSettings,
      "3209"
    );

    expect(result).toContain("<BlockStack>");
    expect(result).toContain("<h3>Snowboard</h3>");
  });
});
