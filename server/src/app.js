const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
const MongoDBConnection = require('../src/mongodb/connection');
const UserRepository = require('../src/repositories/user-repository');
const CreateUserUseCase = require('../src/use-cases/create-user');
const LoginUserUseCase = require('../src/use-cases/login-user');
const setupRoutes = require('../src/http/router');

class Logger {
  constructor(logLevel) {
    this.logger = winston.createLogger({
      level: logLevel || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, error = null, meta = {}) {
    this.logger.error(message, { error, ...meta });
  }
}

class App {
  constructor(opts = {}) {
    this.port = opts.port || 3001;
    this.host = opts.host || '0.0.0.0';
    this.environment = opts.environment || 'production';
    this.mongoUri = opts.mongoUri;
    this.mongoDb = opts.mongoDb || 'app';
    this.origin = opts.origin || '*';
    this.jwtSecret = opts.jwtSecret;
    this.jwtExpiresIn = opts.jwtExpiresIn || '24h';
    this.logger = new Logger(opts.logLevel || 'info');
    this.express = express();
    this.database = new MongoDBConnection(this.mongoUri, this.mongoDb, this.logger);
  }

  async initialize() {
    try {      
      await this.setup();
      await this.start();
    } catch (error) {            
      this.logger.error('Failed to initialize application', error);
      process.exit(1);
    }
  }

  async setup() {
    await this.setupDatabase();
    this.setupMiddleware();
    this.setupUseCases();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.express.use(helmet());
    this.express.use(bodyParser.json());
    this.express.use(morgan('combined', { 
      stream: { 
        write: message => this.logger.info(message.trim()) 
      }
    }));

    this.setupHealthCheck();
  }

  setupHealthCheck() {
    this.express.get('/health', async (req, res) => {
      try {
        await this.database.ping();
        res.status(200).json({ 
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: {
            database: 'up'
          }
        });
      } catch (error) {
        this.logger.error('Server is unhealthy');
        this.logger.error(error.stack)

        res.status(503).json({ 
          status: 'error',
          timestamp: new Date().toISOString(),
          services: {
            database: 'down'
          }
        });
      }
    });
  }

  async setupDatabase() {
    try {
      this.db = await this.database.connect();
      this.logger.info('Database connection established');
    } catch (error) {
      this.logger.error('Database connection failed', error);
      throw error;
    }
  }

  setupUseCases() {
    const userRepository = new UserRepository(this.db);

    this.useCases = {
      createUserUseCase: new CreateUserUseCase(userRepository, this.logger),
      loginUserUseCase: new LoginUserUseCase(
        userRepository,
        {
          jwtSecret: this.jwtSecret,
          jwtExpiresIn: this.jwtExpiresIn
        },
        this.logger
      )
    };
  }

  setupRoutes() {
    const apiRouter = setupRoutes({
      routes: [
        {
          path: '/register',
          handler: this.useCases.createUserUseCase
        },
        {
          path: '/login',
          handler: this.useCases.loginUserUseCase
        }
      ]
    }, this.logger);

    this.express.use('/api/v1', apiRouter);
  }

  async start() {
    const { port, host } = this;
    
    this.server = this.express.listen(port, host, () => {
      this.logger.info(`Server is running`, {
        host,
        port,
        environment: this.environment
      });
    });

    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      this.logger.info(`Received ${signal}, starting graceful shutdown`);
      await this.shutdown();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  async shutdown() {
    try {      
      await this.database.disconnect();
      this.logger.info('Database connection closed');
      
      // Close the HTTP server if it exists
      if (this.server) {
        await new Promise((resolve, reject) => {
          this.server.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        this.logger.info('HTTP server closed');
      }

      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown', error);
      process.exit(1);
    }
  }
}

module.exports = App;