const Review = require('../models/review');

module.exports = {
    // Get all reviews for the current user
    async index(req, res) {
        try {
            const reviews = await Review.find({ user: req.user._id })
                .sort({ createdAt: -1 });

            res.render('reviews/index', {
                reviews,
                title: 'Review History'
            });
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            res.render('error', {
                error: 'Unable to fetch your reviews at this time.',
                title: 'Error'
            });
        }
    },

    // Create a new review
    async create(req, res) {
        try {
            const review = new Review({
                user: req.user._id,
                movieId: req.body.movieId,
                movieTitle: req.body.movieTitle,
                rating: parseInt(req.body.rating),
                review: req.body.review,
                title: req.body.title,
                recommend: req.body.recommend === 'true',
                spoilerAlert: req.body.spoilerAlert === 'true',
                watchedAt: req.body.watchedAt || new Date()
            });

            await review.save();
            
            // Redirect back to the movie page
            res.redirect(`/movies/${req.body.movieId}?message=Review created successfully`);
        } catch (error) {
            console.error('Error creating review:', error);
            res.redirect(`/movies/${req.body.movieId}?error=Failed to create review`);
        }
    },

    // Delete a review
    async delete(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            
            // Check if review exists and user owns it
            if (!review || review.user.toString() !== req.user._id.toString()) {
                return res.redirect(`/movies/${review.movieId}?error=Unable to delete review`);
            }

            await review.deleteOne();
            res.redirect(`/movies/${review.movieId}?message=Review deleted successfully`);
        } catch (error) {
            console.error('Error deleting review:', error);
            res.redirect('back');
        }
    },

    // Edit a review (show edit form)
    async edit(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            
            // Check if review exists and user owns it
            if (!review || review.user.toString() !== req.user._id.toString()) {
                return res.redirect(`/movies/${review.movieId}?error=Unable to edit review`);
            }

            res.render('reviews/edit', { 
                review,
                title: 'Edit Review'
            });
        } catch (error) {
            console.error('Error showing edit form:', error);
            res.redirect('back');
        }
    },

    // Update a review
    async update(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            
            // Check if review exists and user owns it
            if (!review || review.user.toString() !== req.user._id.toString()) {
                return res.redirect(`/movies/${review.movieId}?error=Unable to update review`);
            }

            // Update the review fields
            review.rating = parseInt(req.body.rating);
            review.review = req.body.review;
            review.title = req.body.title;
            review.recommend = req.body.recommend === 'true';
            review.spoilerAlert = req.body.spoilerAlert === 'true';
            if (req.body.watchedAt) review.watchedAt = req.body.watchedAt;

            await review.save();
            res.redirect(`/movies/${review.movieId}?message=Review updated successfully`);
        } catch (error) {
            console.error('Error updating review:', error);
            res.redirect(`back?error=Failed to update review`);
        }
    },

    // Get all public reviews
    async getAllReviews(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 12; // reviews per page
            const sort = req.query.sort || 'date';
            
            let sortQuery = {};
            if (sort === 'rating') {
                sortQuery = { rating: -1, createdAt: -1 };
            } else {
                sortQuery = { createdAt: -1 };
            }

            const totalReviews = await Review.countDocuments();
            const totalPages = Math.ceil(totalReviews / limit);

            const reviews = await Review.find()
                .sort(sortQuery)
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user', 'username');

            res.render('reviews/all', {
                reviews,
                page,
                totalPages,
                sort,
                title: 'Community Reviews'
            });
        } catch (error) {
            console.error('Error fetching all reviews:', error);
            res.render('error', {
                error: 'Unable to fetch reviews at this time.',
                title: 'Error'
            });
        }
    },

    // Show a specific review
    async show(req, res) {
        try {
            const review = await Review.findById(req.params.id)
                .populate('user');
            
            if (!review) {
                return res.render('error', { 
                    title: 'Error',
                    error: 'Review not found'
                });
            }

            res.render('reviews/show', { 
                title: `Review for ${review.movieTitle}`,
                review,
                user: req.user
            });
        } catch (error) {
            res.render('error', {
                title: 'Error',
                error: 'Unable to load review'
            });
        }
    },

    // Toggle like on a review
    async toggleLike(req, res) {
        try {
            const review = await Review.findById(req.params.id)
                .populate('user');
            
            if (!review) {
                return res.redirect('back');
            }

            const userLikeIndex = review.likes.indexOf(req.user._id);
            if (userLikeIndex === -1) {
                review.likes.push(req.user._id);
            } else {
                review.likes.splice(userLikeIndex, 1);
            }
            await review.save();
            
            res.redirect('back');
        } catch (error) {
            res.redirect('back');
        }
    },

    // Add a comment to a review
    async addComment(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) {
                return res.redirect('back');
            }

            review.comments.push({
                content: req.body.content,
                user: req.user._id
            });
            await review.save();
            
            res.redirect('back');
        } catch (error) {
            console.error('Error adding comment:', error);
            res.redirect('back');
        }
    },

    // Delete a comment from a review
    async deleteComment(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) {
                return res.redirect('back');
            }

            const comment = review.comments.id(req.params.commentId);
            if (!comment) {
                return res.redirect('back');
            }

            // Only allow comment author or review author to delete
            if (!req.user._id.equals(comment.user) && !req.user._id.equals(review.user)) {
                return res.redirect('back');
            }

            comment.deleteOne();
            await review.save();
            
            res.redirect('back');
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.redirect('back');
        }
    }
};
