const express = require('express');
const bodyParser = require('body-parser');
const MongoDBConnection = require('./frameworks/mongodb/connection');
const UserRepository = require('./interfaces/repositories/user-repository');
const CreateUserUseCase = require('./use-cases/user/create-user');
const UserController = require('./interfaces/controllers/user-controller');
const userRoutes = require('./frameworks/web/routes/user-routes');

module.exports = class App {
  constructor(opts) {
    this.express = express();
    this.port = opts.PORT;
    this.host = opts.HOST;
    this.mongoUri = opts.MONGO_URI;
    this.mongoDb = opts.MONGO_DB;
    this.database = new MongoDBConnection(opts.MONGO_URI, opts.MONGO_DB);
  }

  async setup() {
    try {
      this.setupMiddleware();
      await this.setupDatabase();
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

  setupRoutes() {
    if (!this.db) {
      throw new Error('Database connection not established');
    }

    const userRepository = new UserRepository(this.db);
    const createUserUseCase = new CreateUserUseCase(userRepository);
    const userController = new UserController(createUserUseCase);

    this.express.use('/api', userRoutes(userController));
  }

  start() {
    const PORT = this.port || 3001;
    const HOST = this.host || '0.0.0.0';
    this.express.listen(PORT, HOST, () => {
      console.log(`Server is running on ${HOST}:${PORT}`);
    });
  }
}
