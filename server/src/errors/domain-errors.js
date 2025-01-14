class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ValidationError extends DomainError {
  constructor(message = 'Validation failed') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class AuthenticationError extends DomainError {
  constructor(message = 'Authentication failed') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class AuthorizationError extends DomainError {
  constructor(message = 'Not authorized') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Resource not found') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ConflictError extends DomainError {
  constructor(message = 'Resource already exists') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

module.exports = {
  DomainError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};