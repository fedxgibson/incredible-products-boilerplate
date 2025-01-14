const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ValidationError, AuthenticationError } = require('../errors/domain-errors');

module.exports = class LoginUserUseCase {
  constructor(userRepository, config) {
    this.userRepository = userRepository;
    if (!config?.jwtSecret) {
      throw new Error('JWT secret is required');
    }
    this.jwtSecret = config.jwtSecret;
    this.jwtExpiresIn = config.jwtExpiresIn || '1h';
  }

  async execute(loginData) {
    const { email, password } = this.validateInput(loginData);

    // Find user by email
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  validateInput(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid login data provided');
    }

    if (!data.email || typeof data.email !== 'string') {
      throw new ValidationError('Email is required');
    }

    if (!data.password || typeof data.password !== 'string') {
      throw new ValidationError('Password is required');
    }

    const email = data.email.toLowerCase().trim();
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    return {
      email,
      password: data.password
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateToken(user) {
    try {
      const payload = {
        userId: user.id,
        email: user.email
      };
      
      return jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });
    } catch (error) {
      console.error('Token generation error:', error);
      throw new AuthenticationError('Failed to generate authentication token');
    }
  }

  sanitizeUser(user) {
    const { hashedPassword, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}