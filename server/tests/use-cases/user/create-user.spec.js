const CreateUserUseCase = require('../../../src/use-cases/user/create-user');
const User = require('../../../src/entities/user');

describe('CreateUserUseCase', () => {
  let userRepository;
  let createUserUseCase;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
    };
    createUserUseCase = new CreateUserUseCase(userRepository);
  });

  it('should create a user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const expectedUser = new User(1, userData.name, userData.email);
    userRepository.create.mockResolvedValue(expectedUser);

    const createdUser = await createUserUseCase.execute(userData);

    expect(userRepository.create).toHaveBeenCalled();
    expect(createdUser).toEqual(expectedUser);
  });
});
