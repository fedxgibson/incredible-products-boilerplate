const App = require('./src/app');

const app = new App({
  port: process.env.PORT,
  host: process.env.HOST,
  mongoUri: process.env.MONGO_URI,
  mongoDb: process.env.MONGO_DB,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  origin: process.env.ORIGIN,
  logLevel: process.env.LOG_LEVEL,
  environment: process.env.NODE_ENV
});

app.initialize();