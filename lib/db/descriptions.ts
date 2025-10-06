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

  public async getAllByProduct(productID: string) {
    try {
      return await this.getByField("productID", productID);
    } catch (error) {
      throw error;
    }
  }

  public async getAllByStoreID(shopifyStoreID: string) {
    try {
      return await this.getByField("shopifyStoreID", shopifyStoreID);
    } catch (error) {
      throw error;
    }
  }

  // Utility function to extract numeric ID from Shopify GID
  public getNumericIdFromGid(gid: string): string {
    // Validate GID format (e.g., gid://shopify/Product/123)
    const gidRegex = /^gid:\/\/shopify\/Product\/\d+$/;
    if (!gidRegex.test(gid)) {
      throw new Error(`Invalid Shopify GID: ${gid}`);
    }

    // Split GID by '/' and return the last segment (numeric ID)
    const parts = gid.split("/");
    return parts[parts.length - 1];
  }

  public async getAndStoreProductDescription(
    settings: IPromptSettings,
    storeID: string
  ) {
    try {
      // Check if user account exists.
      // if not create a new user account with free membership.
      const userModel = new UserModel();
      const user = await userModel.getByField("storeID", storeID);
      if (!user.length) {
        await userModel.create({
          email: "unknown",
          membership: "free",
          storeID: storeID,
        });
      }

      /// If user has already been created, verify before generating description
      /// If token is invalid, this function will throw an error.
      if (user.length > 0) {
        /// Add condition to check if user has signed in using google oauth
        const token = user[0].data.access_token;
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
