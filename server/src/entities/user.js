module.exports = class User {
  constructor({ id, name, email, password, confirmPassword, hashedPassword }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.hashedPassword = hashedPassword
  }
}
