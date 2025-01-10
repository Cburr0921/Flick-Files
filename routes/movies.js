const express = require('express');
const router = express.Router();
const moviesRouter = require('../controllers/movies');
const Review = require('../models/review');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Use the movies controller router for movie-specific routes
router.use('/', moviesRouter);

// Review routes - RESTful (nested under movies)
router.post('/:movieId/reviews', ensureSignedIn, async (req, res) => {
    try {
        const review = await Review.create({
            ...req.body,
            user: req.user._id,
            movieId: req.params.movieId
        });
        res.redirect(`/movies/${req.params.movieId}?message=Review posted successfully`);
    } catch (error) {
        res.redirect(`/movies/${req.params.movieId}?error=Failed to create review`);
    }
});

router.put('/:movieId/reviews/:id', ensureSignedIn, async (req, res) => {
    try {
        const review = await Review.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            req.body,
            { new: true }
        );
        res.redirect(`/movies/${req.params.movieId}?message=Review updated successfully`);
    } catch (error) {
        res.redirect(`/movies/${req.params.movieId}?error=Failed to update review`);
    }
});

router.delete('/:movieId/reviews/:id', ensureSignedIn, async (req, res) => {
    try {
        await Review.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        res.redirect(`/movies/${req.params.movieId}?message=Review deleted successfully`);
    } catch (error) {
        res.redirect(`/movies/${req.params.movieId}?error=Failed to delete review`);
    }
});

module.exports = router;
