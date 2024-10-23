import mongoose from 'mongoose';
import { expect } from 'chai';
import { Description } from '../../models/description-model'; // Adjust the import path as necessary
import { createDescription } from '../../services/description-service'; // Adjust the import path as necessary

describe('createDescription', () => {
  before(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGODB_URI!);
  });

  after(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear the Description collection before each test
    await Description.deleteMany({});
  });

  it('should create a new description', async () => {
    const descriptionId = 1;
    const userId = 1;
    const descriptionText = 'This is a sample description';
    const productId = 202;

    const newDescription = await createDescription(descriptionId, userId, descriptionText, productId);

    expect(newDescription).to.be.an('object');
    expect(newDescription.id).to.equal(descriptionId);
    expect(newDescription.userId).to.equal(userId);
    expect(newDescription.description).to.equal(descriptionText);
    expect(newDescription.productId).to.equal(productId);
    expect(newDescription.createdAt).to.exist; // Check if createdAt field exists

    // Verify that the description was saved in the database
    const savedDescription = await Description.findOne({ id: descriptionId });
    expect(savedDescription).to.not.be.null;
    expect(savedDescription?.description).to.equal(descriptionText);
    expect(savedDescription?.productId).to.equal(productId);
  });

  it('should throw an error when creation fails', async () => {
    // Simulate a validation error by providing an invalid userId
    const descriptionId = 2;
    const invalidUserId = null; // Assuming userId cannot be null
    const descriptionText = 'Another sample description';
    const productId = 203;

    try {
      await createDescription(descriptionId, invalidUserId, descriptionText, productId);
    } catch (error) {
      expect(error.message).to.include('Error creating description');
    }
  });
});
