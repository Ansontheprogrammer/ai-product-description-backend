import { IPromptSettings } from "ai-product-description";
import { db } from "./client.server";
import productPredictionModel from "ai-product-description";
import { Timestamp } from "firebase-admin/firestore";
import { BaseModel } from ".";
import { CreditsModel } from "./credits";
import { UserModel } from "./user";

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
  public async verifyUserUsage(storeID: string) {
    try {
      const descriptions = await this.getAllByStoreID(storeID);

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
        const created = desc.datetime;

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
      console.log(user, "user");

      // verify usage limits
      await this.verifyUserUsage(storeID);

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
