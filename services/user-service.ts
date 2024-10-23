import { Description } from "../models/description-model";
import { User } from "../models/user-model";

export const findOrCreateUser = async (userId, storeId) => {
  try {
    // Check if the user already exists
    let user = await User.findOne({ id: userId });

    if (!user) {
      // User doesn't exist, create a new user
      user = await User.create({
        id: userId,
        storeId: storeId,
        createdAt: new Date().toISOString(),
      });
    }

    return user;
  } catch (error) {
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
};

export const deleteUserAndDescriptions = async (userId) => {
  try {
    // Check if the user exists and delete them
    const user = await User.findOneAndDelete({ id: userId });

    if (!user) {
      return false;
    }

    // Delete all descriptions associated with the user
    await Description.deleteMany({ userId });

    return true;
  } catch (error) {
    console.error("Error deleting user and descriptions:", error);
    throw error;
  }
};
