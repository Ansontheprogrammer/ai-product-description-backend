import { db } from "./client.server";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

const descriptionsCollection = collection(db, "descriptions");

class DescriptionModel {
  public async create(shopifyStoreID: string, text: string) {
    return await addDoc(descriptionsCollection, {
      shopifyStoreID: shopifyStoreID,
      text: text,
      datetime: new Date(),
    });
  }

  public async verifyUserUsage(storeID: string) {
    try {
      const descriptions = await description_model.getByStoreID(storeID);

      // Start and end of today
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      // Filter only descriptions created today
      const todaysDescriptions = descriptions.filter((desc: any) => {
        const created =
          desc.datetime instanceof Timestamp
            ? desc.datetime.toDate()
            : new Date(desc.datetime);

        return created >= startOfDay && created < endOfDay;
      });

      /// Limit the user to only 10 descriptions currently.
      if (todaysDescriptions.length >= 10) {
        throw new Error("USAGE_LIMIT_REACHED");
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  public async get(shopifyStoreID: string) {
    const snapshot = await getDocs(descriptionsCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  public async getByStoreID(shopifyStoreID: string) {
    const q = query(
      descriptionsCollection,
      where("shopifyStoreID", "==", shopifyStoreID)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}

// Instantiatiate user object
export const description_model = new DescriptionModel();
