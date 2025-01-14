// src/errors/repository-errors.js

class RepositoryError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ConnectionError extends RepositoryError {
  constructor(message = 'Database connection failed') {
    super(message);
  }
}

class QueryError extends RepositoryError {
  constructor(message = 'Query execution failed') {
    super(message);
  }
}

class DuplicateEntryError extends RepositoryError {
  constructor(message = 'Entry already exists') {
    super(message);
  }
}

class EntityNotFoundError extends RepositoryError {
  constructor(entity, id) {
    super(`${entity} with id ${id} not found`);
    this.entity = entity;
    this.entityId = id;
  }
}

module.exports = {
  RepositoryError,
  ConnectionError,
  QueryError,
  DuplicateEntryError,
  EntityNotFoundError
};

