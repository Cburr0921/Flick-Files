const Review = require('../models/review');
const User = require('../models/user');

module.exports = {
    // Index - List all users
    async index(req, res) {
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
    },

    // Show - Display a specific user
    async show(req, res) {
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
    },

    // Index - List a user's reviews
    async reviews(req, res) {
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
    },

    // Create - Create a review
    async createReview(req, res) {
        try {
            const review = await Review.create({
                ...req.body,
                user: req.user._id
            });
            res.redirect(`/movies/${req.params.movieId}?message=Review posted successfully`);
        } catch (error) {
            res.redirect(`/movies/${req.params.movieId}?error=Failed to create review`);
        }
    },

    // Update - Update a review
    async updateReview(req, res) {
        try {
            const review = await Review.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                req.body,
                { new: true }
            );
            res.redirect(`/movies/${req.params.movieId}?message=Review updated successfully`);
        } catch (error) {
            res.redirect(`/movies/${req.params.movieId}?error=Failed to update review`);
        }
    },

    // Delete - Delete a review
    async deleteReview(req, res) {
        try {
            await Review.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });
            res.redirect(`/movies/${req.params.movieId}?message=Review deleted successfully`);
        } catch (error) {
            res.redirect(`/movies/${req.params.movieId}?error=Failed to delete review`);
        }
    }
};
