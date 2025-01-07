const express = require('express');
const router = express.Router();
const likesCtrl = require('../controllers/likes');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Likes routes
router.get('/', ensureSignedIn, likesCtrl.index);
router.post('/reviews/:id', ensureSignedIn, likesCtrl.toggleLike);

module.exports = router;
