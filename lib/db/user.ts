import { db } from "./client.server";
import { Timestamp } from "firebase-admin/firestore";
import { BaseModel } from ".";
import { CreditsModel } from "./credits";

export interface IUser {
  membership: "free" | "premium";
  email: string;
  storeID: string;
  createdAt?: FirebaseFirestore.Timestamp;
}

export class UserModel extends BaseModel {
  protected collection = db.collection("users");

  public async create(data: IUser) {
    /// give user 10 free credits
    const creditsModel = new CreditsModel();
    await creditsModel.create({
      userID: data.storeID,
      credits: 10,
      transactionType: "free",
      createdAt: Timestamp.fromDate(new Date()),
    });

    return await super.createWithID(
      {
        ...data,
      },
      data.storeID
    );
  }

  public async update(storeID: string, data: any) {
    try {
      const snapshot = await this.collection
        .where("storeID", "==", storeID)
        .get();

      if (snapshot.empty) {
        throw new Error(`No store found with storeID: ${storeID}`);
      }

      // Assuming storeID is unique, update the first match
      const docRef = snapshot.docs[0].ref;
      console.log(data, "data to update store");

      await docRef.update(data);
      console.log("Store updated successfully", data);

      return { id: docRef.id, ...data };
    } catch (error) {
      console.error("Error updating store:", error);
      throw error;
    }
  }

  public async storeToken(storeID: string, access_token: string) {
    try {
      await this.update(storeID, {
        access_token,
      });
    } catch (error) {
      throw error;
    }
  }

  public async changeMembership(
    userID: string,
    membership: "free" | "premium"
  ) {
    try {
      await this.collection.doc(userID).set(
        {
          membership,
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }
}
