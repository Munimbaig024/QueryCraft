const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

describe('API Health Check', () => {
  // Disconnect from database after tests if it connected
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message', 'QueryCraft API is running');
  });
});
