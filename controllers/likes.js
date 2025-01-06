const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const User = require('../models/user');

// Middleware to protect all routes
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Protect all routes in this controller
router.use(ensureSignedIn);

const likesController = require('./likes');

// GET /likes - Show user's liked content
router.get('/', likesController.index);

// POST /likes/reviews/:id - Like/unlike a review
router.post('/reviews/:id', likesController.toggleLike);

module.exports = router;