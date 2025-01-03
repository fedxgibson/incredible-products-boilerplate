const UserController = require('../../../src/interfaces/controllers/user-controller');

describe('UserController', () => {
  let createUserUseCase;
  let userController;
  let req;
  let res;

  beforeEach(() => {
    createUserUseCase = {
      execute: jest.fn(),
    };
    userController = new UserController(createUserUseCase);

    req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createdUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      createUserUseCase.execute.mockResolvedValue(createdUser);

      await userController.createUser(req, res);

      expect(createUserUseCase.execute).toHaveBeenCalledWith({
        name: req.body.name,
        email: req.body.email,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it('should handle errors appropriately', async () => {
      const error = new Error('Something went wrong');
      createUserUseCase.execute.mockRejectedValue(error);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
