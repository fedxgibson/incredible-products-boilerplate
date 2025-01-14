const express = require('express');
const router = express.Router();
const { 
  ValidationError, 
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError 
} = require('../errors/domain-errors');

module.exports = (deps, logger) => {  
  if (!deps || !deps.routes) {
    throw new Error('Missing required dependencies');
  }

  const { routes } = deps;

  // Middleware for this route group
  router.use((_req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });
  
  // Route handlers
  routes.forEach(({ path, handler }) => {
    router.post(path, async (req, res) => {
      try {
        const result = await handler.execute(req.body);
        return res.status(200).json(result);
        
      } catch (error) {
        logger.error('Request error', error, {
          path: req.path,
          method: req.method,
          query: req.query,
          body: req.body,
          headers: req.headers
        });
        switch (error.constructor.name) {
          case 'ValidationError':
            return res.status(400).json({ 
              error: 'ValidationError',
              message: error.message 
            });
          case 'AuthenticationError':
            return res.status(401).json({ 
              error: 'AuthenticationError',
              message: error.message 
            });
          case 'AuthorizationError':
            return res.status(403).json({ 
              error: 'AuthorizationError',
              message: error.message 
            });
          case 'NotFoundError':
            return res.status(404).json({ 
              error: 'NotFoundError',
              message: error.message 
            });
          case 'ConflictError':
            return res.status(409).json({ 
              error: 'ConflictError',
              message: error.message 
            });
          default:
            return res.status(500).json({ 
              error: 'InternalServerError',
              message: 'Internal server error',
              ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        }
      }
    });
  });

  return router;
};