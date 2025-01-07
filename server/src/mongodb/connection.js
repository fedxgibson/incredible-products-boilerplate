const { MongoClient } = require('mongodb');

module.exports = class MongoDBConnection {
  constructor(url, dbName) {
    this.url = url;
    this.client = null;
    this.dbName = dbName;
  }

  async connect() {
    this.client = await MongoClient.connect(this.url);
    this.db = this.client.db(this.dbName);
    console.log('Connected to MongoDB');
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}
