import chai from 'chai';
import supertest from 'supertest';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { server } from '../../index';
import {Description} from '../../models/description-model';

const { expect } = chai;
const request = supertest(server);

describe('GET /descriptions/:productId/recent', () => {
  let descriptionStub: sinon.SinonStub;

  before(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGODB_URI!);
  });

  beforeEach(() => {
    // Stub the Description model
    descriptionStub = sinon.stub(Description, 'find');
  });

  afterEach(() => {
    // Restore the stubbed methods
    descriptionStub.restore();
  });

  after(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  it('should return the 3 most recent product descriptions', async () => {
    const mockDescriptions = [
      { id: 1, userId: 1, description: 'Desc 1', productId: 123, createdAt: new Date().toISOString() },
      { id: 2, userId: 2, description: 'Desc 2', productId: 123, createdAt: new Date().toISOString() },
      { id: 3, userId: 3, description: 'Desc 3', productId: 123, createdAt: new Date().toISOString() },
    ];

    descriptionStub.returns({
      sort: sinon.stub().returns({
        limit: sinon.stub().resolves(mockDescriptions),
      }),
    });

    const res = await request.get('/descriptions/123/recent');

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(3);
    expect(res.body).to.deep.equal(mockDescriptions);
  });
});
