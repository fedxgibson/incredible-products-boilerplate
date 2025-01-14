const bcrypt = require('bcrypt');
const User = require('../entities/user');
const { ValidationError, ConflictError } = require('../errors/domain-errors');
const { DuplicateEntryError } = require('../errors/repository-errors');

module.exports = class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  validateName(name) {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Name is required');
    }
    
    if (name.length < 3 || name.length > 50) {
      throw new ValidationError('Name must be between 3 and 50 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      throw new ValidationError('Name can only contain letters, numbers, and underscores');
    }
  }

  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  validatePassword(password, confirmPassword) {
    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      throw new ValidationError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }

    if (!confirmPassword || confirmPassword !== password) {
      throw new ValidationError('Passwords do not match');
    }
  }

  async validateUniqueEmail(email) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }
  }

  async execute(userData) {
    // Validate required fields
    if (!userData || typeof userData !== 'object') {
      throw new ValidationError('Invalid user data provided');
    }

    // Validate individual fields
    this.validateName(userData.name);
    this.validateEmail(userData.email);
    this.validatePassword(userData.password, userData.confirmPassword);

    // Check for unique email
    await this.validateUniqueEmail(userData.email);

    const hashedPasswordResult = await this.hashPassword(userData.password);

    // Create user instance
    const user = new User({
      name: userData.name,
      email: userData.email,
      hashedPassword: hashedPasswordResult
    });

    // Save user to repository
    let createdUser;
    try {
      createdUser = await this.userRepository.create(user);
    } catch (error) {
      if (error instanceof DuplicateEntryError) {
        throw new ConflictError('User already exists');
      }
    }

    // Return created user without sensitive information
    const { hashedPassword, ...safeUserData } = createdUser;
    return safeUserData;
  }
}