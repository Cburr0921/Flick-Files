const express = require('express');
const router = express.Router();
const likesRouter = require('../controllers/likes');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Apply middleware to all routes
router.use(ensureSignedIn);

// Use the likes controller router
router.use('/', likesRouter);

module.exports = router;
