const User = require('../../entities/user');

module.exports = class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    const user = new User(null, userData.name, userData.email);
    return this.userRepository.create(user);
  }
}
