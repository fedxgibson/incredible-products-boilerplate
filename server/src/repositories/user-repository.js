const { ObjectId } = require('mongodb');

module.exports = class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async create(user) {
    const result = await this.database.collection('users').insertOne({
      name: user.name,
      email: user.email,
    });

    return { ...user, _id: result.insertedId };
  }

  async findById(id) {
    const objectId = id instanceof ObjectId ? id : new ObjectId(id);
    return this.database.collection('users').findOne({ _id: objectId });
  }

  async findByEmail(email) {
    return this.database.collection('users').findOne({ email });
  }
}