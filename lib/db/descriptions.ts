import { IPromptSettings } from "ai-product-description";
import { db } from "./client.server";
import productPredictionModel from "ai-product-description";
import { Timestamp } from "firebase-admin/firestore";
import { BaseModel } from ".";
import { CreditsModel } from "./credits";
import { UserModel } from "./user";
import { verifyUserAccessToken } from "../middleware";

interface IDescription {
  shopifyStoreID: string;
  text: string;
  productID: string;
}

export class DescriptionModel extends BaseModel {
  protected collection = db.collection("descriptions");

  public async create(data: IDescription) {
    return await super.create(data);
  }

  // Utility function to extract numeric ID from Shopify GID
  public getNumericIdFromGid(productID: string): string {
    // If product has shopify gid, remove it from the product name.
    const gidRegex = /^gid:\/\/shopify\/Product\/\d+$/;
    if (gidRegex.test(productID)) {
      // Split GID by '/' and return the last segment (numeric ID)
      const parts = productID.split("/");
      return parts[parts.length - 1];
    } else {
      return productID;
    }
  }

  public async getAndStoreProductDescription(
    settings: IPromptSettings,
    storeID: string
  ) {
    try {
      // Check if user account exists.
      // if not create a new user account with free membership.
      const userModel = new UserModel();
      const user = await userModel.findOneByField("storeID", storeID);
      if (!user) {
        await userModel.create({
          email: "unknown",
          membership: "free",
          storeID: storeID,
        });
      } else {
        /// If user has already been created, verify before generating description
        /// If token is invalid, this function will throw an error.
        /// Add condition to check if user has signed in using google oauth
        const token = user.access_token;
        if (token) {
          await verifyUserAccessToken(token);
        }
      }

      const creditModel = new CreditsModel();
      await creditModel.checkUserCreditsBeforeUsing(storeID);
      // get description from model.
      const description =
        await productPredictionModel.generateProductDescription(settings);
      const truncatedID = this.getNumericIdFromGid(settings.product.id);

      await creditModel.create({
        userID: storeID,
        credits: -1,
        transactionType: "used",
      });

      // save description for user.
      await this.create({
        shopifyStoreID: storeID,
        text: description,
        productID: truncatedID,
      });

      return description;
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw error;
    }
  }
}

export const descriptionModel = new DescriptionModel();
