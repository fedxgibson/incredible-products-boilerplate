const express = require('express');

const router = express.Router();
module.exports = (controller) => {
  router.post('/users', (req, res) => controller.createUser(req, res));
  return router;
};
