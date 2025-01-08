const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const MongoDBConnection = require('./mongodb/connection');
const UserRepository = require('./repositories/user-repository');
const CreateUserUseCase = require('./use-cases/create-user');
const LoginUserUseCase = require('./use-cases/login-user');
const setupRoutes = require('./http/routes');

module.exports = class App {
  constructor(opts) {
    this.express = express();
    this.port = opts.port;
    this.host = opts.host;
    this.mongoUri = opts.mongoUri;
    this.mongoDb = opts.mongoDb;
    this.origin = opts.origin;
    this.jwtSecret = opts.jwtSecret;
    this.jwtExpiresIn = opts.jwtExpiresIn;
    this.database = new MongoDBConnection(opts.mongoUri, opts.mongoDb);
  }

  async initialize() {
    const isSetupSuccessful = await this.setup();
    if (!isSetupSuccessful) {
      process.exit(1);
    }
    await this.start();
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

  setupMiddleware() {
    this.express.use(bodyParser.json());
    this.express.use(cors({ origin: this.origin }));
    this.express.use(morgan('combined'));
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
    this.express.use('/api', setupRoutes({
      db: this.db,
      useCases: this.useCases
    }));
  }

  start() {
    const PORT = this.port || 3001;
    const HOST = this.host || '0.0.0.0';
    this.express.listen(PORT, HOST, () => {
      console.log(`Server is running on ${HOST}:${PORT}`);
    });
  }
}
