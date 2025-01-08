const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = class LoginUserUseCase {
  constructor(userRepository, config) {
    this.userRepository = userRepository;
    this.jwtSecret = config.jwtSecret;
    this.jwtExpiresIn = config.jwtExpiresIn || '1h';
  }

  async execute(loginData) {
    try {
      const { email, password } = this.validateInput(loginData);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        token,
        user: this.sanitizeUser(user)
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  validateInput(data) {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    if (typeof data.email !== 'string' || typeof data.password !== 'string') {
      throw new Error('Invalid input types');
    }

    const email = data.email.toLowerCase().trim();
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
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
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}