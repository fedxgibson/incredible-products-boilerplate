const express = require('express');
const bodyParser = require('body-parser');
const MongoDBConnection = require('./mongodb/connection');
const UserRepository = require('./repositories/user-repository');
const CreateUserUseCase = require('./use-cases/user/create-user');
const LoginUserUseCase = require('./use-cases/auth/login-user');
const setupRoutes = require('./http/routes');

module.exports = class App {
  constructor(opts) {
    this.express = express();
    this.port = opts.port;
    this.host = opts.host;
    this.mongoUri = opts.mongoUri;
    this.mongoDb = opts.mongoDb;
    this.jwtSecret = opts.jwtSecret;
    this.jwtExpiresIn = opts.jwtExpiresIn;
    this.database = new MongoDBConnection(opts.mongoUri, opts.mongoDb);
  }

  async setup() {
    try {
      this.setupMiddleware();
      await this.setupDatabase();
      this.setupUseCases();
      this.setupRoutes();
      return true;
    } catch (error) {
      console.error('Failed to setup application:', error);
      return false;
    }
  }

  async initialize() {
    const isSetupSuccessful = await this.setup();
    if (!isSetupSuccessful) {
      process.exit(1);
    }
    await this.start();
  }

  setupMiddleware() {
    this.express.use(bodyParser.json());

    this.express.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    })
  }

  async setupDatabase() {
    try {
      this.db = await this.database.connect();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  setupUseCases() {
    const userRepository = new UserRepository(this.db);

    this.useCases = {
      createUserUseCase: new CreateUserUseCase(userRepository),
      loginUserUseCase: new LoginUserUseCase(userRepository,
         {
          jwtSecret: this.jwtSecret,
          jwtExpiresIn: this.jwtExpiresIn
         }
        )
    }
  }

  setupRoutes () {
    setupRoutes({
      express: this.express,
      db: this.db,
      useCases: this.useCases
    });
  }

  start() {
    const PORT = this.port || 3001;
    const HOST = this.host || '0.0.0.0';
    this.express.listen(PORT, HOST, () => {
      console.log(`Server is running on ${HOST}:${PORT}`);
    });
  }
}
