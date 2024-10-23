import supertest from 'supertest';
import mongoose from 'mongoose';
import { server } from '../../index'; 
import { User } from '../../models/user-model'; 
import { Description } from '../../models/description-model'; 
import { expect } from 'chai';

describe('DELETE /api/v1/ai/user/:userId', () => {
  before(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGODB_URI!);
  });

  after(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Create a test user and description before each test
    const user = new User({ id: 1, storeId: 101, createdAt: new Date().toISOString() });
    await user.save();
    
    const description = new Description({ id: 1, userId: 1, description: 'Sample description', productId: 202, createdAt: new Date().toISOString() });
    await description.save();
  });

  afterEach(async () => {
    // Cleanup: remove all users and descriptions after each test
    await User.deleteMany({});
    await Description.deleteMany({});
  });

  it('should delete user and associated descriptions', async () => {
    const res = await supertest(server).delete('/api/v1/ai/user/1');

    // Check the response status and message
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('User and descriptions deleted successfully');

    // Check that the user no longer exists
    const user = await User.findOne({ id: 1 });
    expect(user).to.be.null;

    // Check that the associated descriptions are deleted
    const descriptions = await Description.find({ userId: 1 });
    expect(descriptions).to.be.an('array').that.is.empty;
  });

  it('should return 404 if user not found', async () => {
    const res = await supertest(server).delete('/api/v1/ai/user/99'); // A user ID that does not exist

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal('User not found against userId: 99!!');
  });
});
