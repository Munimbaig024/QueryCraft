const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');

// Mock the Mongoose User model so we don't need a real DB connection for these unit tests
jest.mock('../src/models/User');

describe('Authentication Endpoints', () => {
  // Disconnect from database after tests if it connected via index.js
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should block registration if fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'incomplete@test.com'
        // Missing name and password
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/Please add all fields/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid login credentials', async () => {
      // Mock the database to simulate that the user does not exist
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'fake@test.com',
        password: 'password123'
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toMatch(/Invalid credentials/i);
    });
    
    it('should block login if fields are missing', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'fake@test.com'
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/Please add all fields/i);
    });
  });
});
