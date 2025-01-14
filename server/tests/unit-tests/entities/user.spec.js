const User = require('../../../src/entities/user');

describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User({
      id: 1, 
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password',
      confirmPassword: 'confirmPassword',
      hashedPassword: 'oij32noaf'
    });

    expect(user.id).toBe(1);
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.password).toBe('password');
    expect(user.confirmPassword).toBe('confirmPassword');
    expect(user.hashedPassword).toBe('oij32noaf');
  });
});
