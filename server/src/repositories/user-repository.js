const { ObjectId } = require('mongodb');
const { 
  RepositoryError,
  ConnectionError,
  QueryError,
  DuplicateEntryError,
  EntityNotFoundError 
} = require('../errors/repository-errors');

module.exports = class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async create(user) {
    try {
      const result = await this.database.collection('users').insertOne({
        name: user.name,
        email: user.email,
        hashedPassword: user.hashedPassword
      });

      return { ...user, _id: result.insertedId };
    } catch (error) {
      // MongoDB duplicate key error (unique index violation)
      if (error.code === 11000) {
        throw new DuplicateEntryError('User with this email already exists');
      }

      // Other MongoDB errors
      throw new QueryError(`Failed to create user: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      let objectId;
      try {
        objectId = id instanceof ObjectId ? id : new ObjectId(id);
      } catch (error) {
        throw new QueryError('Invalid id format');
      }

      const user = await this.database.collection('users').findOne({ _id: objectId });

      if (!user) {
        throw new EntityNotFoundError('User', id);
      }

      return user;
    } catch (error) {
      if(error instanceof EntityNotFoundError) {
        throw error
      }
      throw new QueryError(`Failed to find user: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const user = await this.database.collection('users').findOne({ email });

      return user;
    } catch (error) {
      throw new QueryError(`Failed to find user by email: ${error.message}`);
    }
  }
}