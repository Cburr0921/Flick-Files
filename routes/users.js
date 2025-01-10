const express = require('express');
const router = express.Router();
const usersRouter = require('../controllers/users');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Apply middleware to all routes
router.use(ensureSignedIn);

// Use the users controller router
router.use('/', usersRouter);

module.exports = router;
