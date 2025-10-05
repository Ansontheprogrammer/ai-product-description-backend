import { IPromptSettings } from "ai-product-description";
import { db } from "./client.server";
import productPredictionModel from "ai-product-description";
import { Timestamp } from "firebase-admin/firestore";

export class DescriptionModel {
  private descriptionCollection = db.collection("descriptions");

  public async create(shopifyStoreID: string, text: string, productID: string) {
    return await this.descriptionCollection.add({
      shopifyStoreID: shopifyStoreID,
      text: text,
      productID: productID,
      datetime: Timestamp.fromDate(new Date()),
    });
  }

  public async verifyUserUsage(storeID: string) {
    try {
      const descriptions = await this.getByStoreID(storeID);

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

  public async getAllDescriptionsForProduct(productID: string) {
    const query = await this.descriptionCollection
      .where("productID", "==", productID)
      .get();

    return query.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
  }
  public async getByStoreID(shopifyStoreID: string) {
    const query = await this.descriptionCollection
      .where("shopifyStoreID", "==", shopifyStoreID)
      .get();
    return query.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
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
      // verify usage limits
      await this.verifyUserUsage(storeID);

      // get description from model.
      const description =
        await productPredictionModel.generateProductDescription(settings);
      const truncatedID = this.getNumericIdFromGid(settings.product.id);
      // save description for user.
      await this.create(storeID, description, truncatedID);

      return description;
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw error;
    }
  }
}

export const descriptionModel = new DescriptionModel();
