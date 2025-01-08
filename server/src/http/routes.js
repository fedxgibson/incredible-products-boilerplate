const express = require('express');
const router = express.Router();

module.exports = (deps) => {
  if (!deps || !deps.useCases) {
    throw new Error('Missing required dependencies');
  }

  const { createUserUseCase, loginUserUseCase } = deps.useCases;
  
  if (!createUserUseCase || !loginUserUseCase) {
    throw new Error('Missing required use cases');
  }

  const ROUTES = [
    {
      path: '/create-user',
      handler: createUserUseCase
    },
    {
      path: '/login',
      handler: loginUserUseCase
    }
  ];

  // Middleware for this route group
  router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Route handlers
  ROUTES.forEach(({ path, handler }) => {
    router.post(path, async (req, res) => {  // Remove leading slash
      try {
        const result = await handler.execute(req.body);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });

  return router;
};