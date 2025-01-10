const Review = require('../models/review');
const User = require('../models/user');
const express = require('express');
const router = express.Router();

// Index - List all users
router.get('/', async function(req, res) {
    try {
        const users = await User.find()
            .sort({ username: 1 }); // Sort by username alphabetically
        
        res.render('users/index', {
            title: 'All Users',
            users
        });
    } catch (error) {
        res.render('error', {
            error: 'Unable to fetch users at this time.',
            title: 'Error'
        });
    }
});

// Show - Display a specific user
router.get('/:id', async function(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.render('error', {
                title: 'Error',
                error: 'User not found'
            });
        }

        const reviews = await Review.find({ user: user._id })
            .sort('-createdAt')
            .limit(5);

        res.render('users/show', {
            title: `${user.username}'s Profile`,
            profileUser: user,
            reviews
        });
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to load user profile'
        });
    }
});

// List a user's reviews
router.get('/:id/reviews', async function(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.render('error', {
                title: 'Error',
                error: 'User not found'
            });
        }

        const reviews = await Review.find({ user: user._id })
            .sort('-createdAt');

        res.render('users/reviews', {
            title: `${user.username}'s Reviews`,
            profileUser: user,
            reviews
        });
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to load user reviews'
        });
    }
});

// Create a review
router.post('/:id/movies/:movieId/reviews', async function(req, res) {
    try {
        const review = await Review.create({
            ...req.body,
            user: req.user._id
        });
        res.redirect(`/movies/${req.params.movieId}?message=Review posted successfully`);
    } catch (error) {
        res.redirect(`/movies/${req.params.movieId}?error=Failed to create review`);
    }
});

// Update a review
router.put('/:id/reviews/:reviewId', async function(req, res) {
    try {
        const review = await Review.findOneAndUpdate(
            { _id: req.params.reviewId, user: req.user._id },
            req.body,
            { new: true }
        );
        res.redirect(`/movies/${req.params.movieId}?message=Review updated successfully`);
    } catch (error) {
        res.redirect(`/movies/${req.params.movieId}?error=Failed to update review`);
    }
});

// Delete a review
router.delete('/:id/reviews/:reviewId', async function(req, res) {
    try {
        await Review.findOneAndDelete({
            _id: req.params.reviewId,
            user: req.user._id
        });
        res.redirect(`/movies/${req.params.movieId}?message=Review deleted successfully`);
    } catch (error) {
        res.redirect(`/movies/${req.params.movieId}?error=Failed to delete review`);
    }
});

module.exports = router;
