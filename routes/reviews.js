const express = require('express');
const router = express.Router();
const reviewsRouter = require('../controllers/reviews');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Apply middleware to protected routes
router.use('/', ensureSignedIn, (req, res, next) => {
    // Skip auth check for public routes
    if (req.path === '/all' || (req.path.match(/^\/\w+$/) && req.method === 'GET')) {
        return next('route');
    }
    next();
});

// Use the reviews controller router
router.use('/', reviewsRouter);

module.exports = router;
