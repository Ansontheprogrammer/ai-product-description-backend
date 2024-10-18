import { User } from '../models/user-model';

export const findOrCreateUser = async (userId, storeId) => {
  try {
    // Check if the user already exists
    let user = await User.findOne({ id: userId });

    if (!user) {
      // User doesn't exist, create a new user
      user = await User.create({
        id: userId,
        storeId: storeId,
        createdAt: new Date().toISOString()
      });
    }

    return user;
  } catch (error) {
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
}

