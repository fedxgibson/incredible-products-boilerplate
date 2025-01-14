const { MongoClient } = require('mongodb');

module.exports = class MongoDBConnection {
  constructor(url, dbName, logger) {
    this.url = url;
    this.client = null;
    this.dbName = dbName;
    this.logger = logger;
  }

  async connect() {
    this.client = await MongoClient.connect(this.url);
    this.db = this.client.db(this.dbName);
    if (this.logger) {
      this.logger.info('Connected to MongoDB');
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      if (this.logger) {
        this.logger.info('Disconnected to MongoDB');
      }
    }
  }
}
