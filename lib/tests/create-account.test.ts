import mongoose from 'mongoose';
import { expect } from 'chai';
import { User } from '../../models/user-model'; // Adjust the import path as necessary
import { findOrCreateUser } from '../../services/user-service'; // Adjust the import path as necessary

describe('findOrCreateUser', () => {
  before(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGODB_URI!);
  });

  after(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear the User collection before each test
    await User.deleteMany({});
  });

  it('should create a new user if it does not exist', async () => {
    const userId = 1;
    const storeId = 101;

    const user = await findOrCreateUser(userId, storeId);

    expect(user).to.be.an('object');
    expect(user.id).to.equal(userId);
    expect(user.storeId).to.equal(storeId);
    expect(user.createdAt).to.exist; // Check if createdAt field exists

    // Verify that the user was saved in the database
    const savedUser = await User.findOne({ id: userId });
    expect(savedUser).to.not.be.null;
    expect(savedUser?.storeId).to.equal(storeId);
  });

  it('should return the existing user if it already exists', async () => {
    const userId = 2;
    const storeId = 202;

    // First, create a user
    await User.create({
      id: userId,
      storeId: storeId,
      createdAt: new Date().toISOString(),
    });

    // Now call findOrCreateUser to find the existing user
    const user = await findOrCreateUser(userId, storeId);

    expect(user).to.be.an('object');
    expect(user.id).to.equal(userId);
    expect(user.storeId).to.equal(storeId);
  });

  it('should throw an error when user creation fails', async () => {
    const userId = null; // Assuming userId cannot be null
    const storeId = 303;

    try {
      await findOrCreateUser(userId, storeId);
    } catch (error) {
      expect(error.message).to.include('Error finding or creating user');
    }
  });
});
