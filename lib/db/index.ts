import { Timestamp } from "firebase-admin/firestore";
import { db } from "./client.server";

export abstract class BaseModel {
  protected collection: FirebaseFirestore.CollectionReference;

  public async create(data) {
    return await this.collection.add({
      ...data,
      datetime: Timestamp.fromDate(new Date()),
    });
  }
  public async getByField(field: string, value: any) {
    const query = await this.collection.where(field, "==", value).get();
    return query.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
  }
}
