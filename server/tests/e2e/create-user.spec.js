const request = require('supertest');
const jwt = require('jsonwebtoken');
const App = require('../../src/app');

describe('User API Integration Tests', () => {
  let app;
  let server;
  const JWT_SECRET = 'test-secret';
  const TEST_DB_NAME = 'test-db-' + Date.now();

  beforeAll(async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    app = new App({
      port: Math.floor((Math.random()*10000)),
      mongoUri: process.env.MONGO_URI,
      mongoDb: TEST_DB_NAME,
      jwtSecret: JWT_SECRET,
      logLevel: 'alert',
      environment: 'test'
    });

    await app.initialize();
    server = app.express;
  });

  afterAll(async () => {
    await app.shutdown();
  });

  beforeEach(async () => {
    const collections = await app.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  describe('POST /api/v1/register', () => {
    const validUser = {
      name: 'John_Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };

    it('should successfully create a new user with valid data', async () => {
      const response = await request(server)
        .post('/api/v1/register')
        .send(validUser)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(validUser.name);
      expect(response.body.email).toBe(validUser.email);
      expect(response.body).not.toHaveProperty('hashedPassword');
    });

    it('should return ValidationError when name is invalid', async () => {
      const invalidUser = {
        ...validUser,
        name: 'J@hn'
      };

      const response = await request(server)
        .post('/api/v1/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/name can only contain/i)
      });
    });

    it('should return ValidationError when email format is invalid', async () => {
      const invalidUser = {
        ...validUser,
        email: 'invalid-email'
      };

      const response = await request(server)
        .post('/api/v1/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/invalid email format/i)
      });
    });

    it('should return ValidationError when password requirements are not met', async () => {
      const invalidUser = {
        ...validUser,
        password: 'weak',
        confirmPassword: 'weak'
      };

      const response = await request(server)
        .post('/api/v1/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/password must/i)
      });
    });

    it('should return ValidationError when passwords do not match', async () => {
      const invalidUser = {
        ...validUser,
        confirmPassword: 'DifferentPassword123!'
      };

      const response = await request(server)
        .post('/api/v1/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/passwords do not match/i)
      });
    });

    it('should return ConflictError when email already exists', async () => {
      // First create a user
      await request(server)
        .post('/api/v1/register')
        .send(validUser)
        .expect(200);

      // Try to create another user with the same email
      const response = await request(server)
        .post('/api/v1/register')
        .send(validUser)
        .expect(409);

      expect(response.body).toMatchObject({
        error: 'ConflictError',
        message: expect.stringMatching(/email already exists/i)
      });
    });
  });
});
