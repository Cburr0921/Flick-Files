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
            const reviews = await Review.find({ user: req.params.id })
                .sort({ createdAt: -1 });
            
            res.render('users/show', {
                title: user.username + "'s Profile",
                reviews,
                profileUser: user
            });
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.render('error', {
                error: 'Unable to fetch user profile.',
                title: 'Error'
            });
        }
    },

    // Index - List a user's reviews
    async reviews(req, res) {
        try {
            const user = await User.findById(req.params.id);
            const reviews = await Review.find({ user: req.params.id })
                .sort({ createdAt: -1 });
            
            res.render('users/reviews', {
                title: user.username + "'s Reviews",
                reviews,
                profileUser: user
            });
        } catch (error) {
            console.error('Reviews fetch error:', error);
            res.render('error', {
                error: 'Unable to fetch user reviews.',
                title: 'Error'
            });
        }
    },

    // Create - Create a review
    async createReview(req, res) {
        try {
            req.body.user = req.user._id;
            req.body.movieId = req.params.movieId;
            await Review.create(req.body);
            res.redirect(`/movies/${req.params.movieId}`);
        } catch (error) {
            console.error('Review creation error:', error);
            res.redirect(`/movies/${req.params.movieId}`);
        }
    },

    // Update - Update a review
    async updateReview(req, res) {
        try {
            await Review.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                req.body,
                { new: true }
            );
            res.redirect(`/movies/${req.params.movieId}`);
        } catch (error) {
            console.error('Review update error:', error);
            res.redirect(`/movies/${req.params.movieId}`);
        }
    },

    // Delete - Delete a review
    async deleteReview(req, res) {
        try {
            await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
            res.redirect(`/movies/${req.params.movieId}`);
        } catch (error) {
            console.error('Review deletion error:', error);
            res.redirect(`/movies/${req.params.movieId}`);
        }
    }
};
