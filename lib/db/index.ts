import { Timestamp } from "firebase-admin/firestore";
import { db } from "./client.server";

export abstract class BaseModel {
  protected collection: FirebaseFirestore.CollectionReference;

  public async create(data) {
    const doc = await this.collection.add({
      ...data,
      datetime: Timestamp.fromDate(new Date()),
    });
    await doc.set(
      {
        id: doc.id,
      },
      { merge: true }
    );
  }

  public async delete(id: string) {
    await this.collection.doc(id).delete();
  }

  public async createWithID(data, id: string) {
    await this.collection.doc(id).set({
      ...data,
      datetime: Timestamp.fromDate(new Date()),
    });
  }

  public async getByField(
    field: string,
    value: any
  ): Promise<Record<string, any>[]> {
    const query = await this.collection.where(field, "==", value).get();
    return query.docs.map((doc) => doc.data());
  }
}
