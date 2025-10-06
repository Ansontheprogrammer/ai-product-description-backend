import { db } from "./client.server";
import { BaseModel } from ".";

interface ICredits {
  userID: string;
  credits: number;
  createdAt?: FirebaseFirestore.Timestamp;
  transactionType: "free" | "paid" | "used";
  stripePaymentID?: string;
}

/*
  This model will handle user credits.
  Every time a user generates a description, we will deduct credits.
  Every time a user purchases credits, we will add credits.
  Free users will get a one-time credit of 10 descriptions.
  Premium users will get 100 credits per month.
  Each description costs 1 credit.  
*/
export class CreditsModel extends BaseModel {
  protected collection = db.collection("credits");

  public async create(data: ICredits) {
    return await super.create(data);
  }

  public async checkUserCreditsBeforeUsing(userID: string) {
    try {
      const currentCredits = await this.getCurrentCredits(userID);
      /// If current credits is less than 1, throw error.
      if (currentCredits < 1) {
        throw new Error("INSUFFICIENT_CREDITS");
      }
    } catch (error) {
      throw error;
    }
  }

  public async getCurrentCredits(userID: string) {
    try {
      const credits = await this.getByField("userID", userID);
      let totalCredits = 0;
      credits.forEach((credit: any) => {
        totalCredits += credit.credits;
      });
      return totalCredits;
    } catch (error) {
      throw error;
    }
  }
}

export const descriptionModel = new CreditsModel();
