import App from './src/app';

const app = new App({
  port: process.env.PORT,
  host: process.env.HOST,
  mongoUri: process.env.MONGO_URI,
  mongoDb: process.env.MONGO_DB,
});

app.initialize();
