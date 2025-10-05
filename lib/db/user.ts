import { IPromptSettings } from "ai-product-description";
import { db } from "./client.server";
import productPredictionModel from "ai-product-description";
import { Timestamp } from "firebase-admin/firestore";
import { BaseModel } from ".";
import { CreditsModel } from "./credits";

interface IUser {
  membership: "free" | "premium";
  email: string;
  storeID: string;
  createdAt?: FirebaseFirestore.Timestamp;
}

export class UserModel extends BaseModel {
  protected collection = db.collection("user");

  public async create(data: IUser) {
    /// give user 10 free credits
    const creditsModel = new CreditsModel();
    await creditsModel.create({
      userID: data.storeID,
      credits: 10,
      transactionType: "free",
      createdAt: Timestamp.fromDate(new Date()),
    });
    console.log(data, "data");

    return await super.create(data);
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

export const descriptionModel = new UserModel();
