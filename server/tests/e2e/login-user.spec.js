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

  describe('POST /api/v1/login', () => {
    const testUser = {
      name: 'John_Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };

    beforeEach(async () => {
      await request(server)
        .post('/api/v1/register')
        .send(testUser);
    });

    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await request(server)
        .post('/api/v1/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('hashedPassword');

      const decodedToken = jwt.verify(response.body.token, JWT_SECRET);
      expect(decodedToken).toHaveProperty('email', testUser.email);
    });

    it('should return ValidationError when email is missing', async () => {
      const loginData = {
        password: testUser.password
      };

      const response = await request(server)
        .post('/api/v1/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/email is required/i)
      });
    });

    it('should return ValidationError when password is missing', async () => {
      const loginData = {
        email: testUser.email
      };

      const response = await request(server)
        .post('/api/v1/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/password is required/i)
      });
    });

    it('should return AuthenticationError with invalid credentials', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: testUser.password
      };

      const response = await request(server)
        .post('/api/v1/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'AuthenticationError',
        message: expect.stringMatching(/invalid credentials/i)
      });
    });

    it('should return ValidationError for malformed email format', async () => {
      const loginData = {
        email: 'invalid-email-format',
        password: testUser.password
      };

      const response = await request(server)
        .post('/api/v1/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/invalid email format/i)
      });
    });

    it('should return ValidationError for invalid password length', async () => {
      const loginData = {
        email: testUser.email,
        password: 'short'
      };

      const response = await request(server)
        .post('/api/v1/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringMatching(/password must be at least/i)
      });
    });
  });
});