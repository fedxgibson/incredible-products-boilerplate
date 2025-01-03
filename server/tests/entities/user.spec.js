const User = require('../../src/entities/user');

describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User(1, 'John Doe', 'john@example.com');

    expect(user.id).toBe(1);
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });
});
