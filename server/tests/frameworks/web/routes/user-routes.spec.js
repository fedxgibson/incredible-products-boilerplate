const express = require('express');
const configureUserRoutes = require('../../../../src/frameworks/web/routes/user-routes');

// Mock express.Router
jest.mock('express', () => {
  // Create mock functions inside the factory
  const postMock = jest.fn();
  
  return {
    Router: jest.fn(() => ({
      post: postMock,
      return: this
    }))
  };
});

describe('User Routes', () => {
  let mockController;
  let router;
  let routerPost;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get fresh reference to post mock
    routerPost = express.Router().post;

    // Create mock controller
    mockController = {
      createUser: jest.fn(),
    };

    // Configure routes
    router = configureUserRoutes(mockController);
  });

  describe('POST /users', () => {
    it('should configure POST /users route', () => {
      expect(routerPost).toHaveBeenCalledWith(
        '/users',
        expect.any(Function)
      );
    });

    it('should call controller.createUser when route handler is executed', () => {
      // Get the route handler from the first call to post
      const routeHandler = routerPost.mock.calls[0][1];

      // Create mock request and response
      const mockReq = { body: { name: 'John' } };
      const mockRes = { json: jest.fn() };

      // Execute route handler
      routeHandler(mockReq, mockRes);

      // Verify controller method was called with correct arguments
      expect(mockController.createUser).toHaveBeenCalledWith(mockReq, mockRes);
    });
  });
});