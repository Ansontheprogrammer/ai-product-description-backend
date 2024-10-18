import { Description } from '../models/description-model';

export const createDescription = async (descriptionId, userId, description, productId) => {
  try {
    // Create the description
    const newDescription = await Description.create({
      id: descriptionId,
      userId: userId,
      description: description,
      productId: productId,
      createdAt: new Date().toISOString()
    });

    return newDescription;
  } catch (error) {
    throw new Error(`Error creating description: ${error.message}`);
  }
}

