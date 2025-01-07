const Review = require('../models/review');

module.exports = {
    // Get all reviews for the current user
    async index(req, res) {
        try {
            const query = { user: req.user._id };
            
            // Apply filters
            if (req.query.rating) {
                query.rating = parseInt(req.query.rating);
            }
            
            if (req.query.recommend === 'true' || req.query.recommend === 'false') {
                query.recommend = req.query.recommend === 'true';
            }

            // Date filter
            if (req.query.dateFrom || req.query.dateTo) {
                query.watchedAt = {};
                if (req.query.dateFrom) {
                    query.watchedAt.$gte = new Date(req.query.dateFrom);
                }
                if (req.query.dateTo) {
                    query.watchedAt.$lte = new Date(req.query.dateTo);
                }
            }

            // Sorting
            const sortOptions = {
                newest: { createdAt: -1 },
                oldest: { createdAt: 1 },
                'highest-rated': { rating: -1 },
                'lowest-rated': { rating: 1 },
                'movie-title': { movieTitle: 1 }
            };
            
            const sortBy = sortOptions[req.query.sort] || sortOptions.newest;

            const reviews = await Review.find(query)
                .populate('user')  
                .sort(sortBy);

            res.render('reviews/index', {
                reviews,
                title: 'Review History',
                filters: {
                    rating: req.query.rating,
                    recommend: req.query.recommend,
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    sort: req.query.sort || 'newest'
                }
            });
        } catch (error) {
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
            res.redirect(`back?error=Failed to update review`);
        }
    },

    // Get all public reviews
    async getAllReviews(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 12;
            const query = {};
            
            // Apply filters
            if (req.query.rating) {
                query.rating = parseInt(req.query.rating);
            }
            
            if (req.query.recommend === 'true' || req.query.recommend === 'false') {
                query.recommend = req.query.recommend === 'true';
            }

            // Date filter
            if (req.query.dateFrom || req.query.dateTo) {
                query.watchedAt = {};
                if (req.query.dateFrom) {
                    query.watchedAt.$gte = new Date(req.query.dateFrom);
                }
                if (req.query.dateTo) {
                    query.watchedAt.$lte = new Date(req.query.dateTo);
                }
            }

            // Sorting
            const sortOptions = {
                newest: { createdAt: -1 },
                oldest: { createdAt: 1 },
                'highest-rated': { rating: -1 },
                'lowest-rated': { rating: 1 },
                'movie-title': { movieTitle: 1 }
            };
            
            const sortBy = sortOptions[req.query.sort] || sortOptions.newest;

            const reviews = await Review.find(query)
                .sort(sortBy)
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user', 'username');

            const totalReviews = await Review.countDocuments(query);

            res.render('reviews/all', { 
                reviews,
                page,
                totalPages: Math.ceil(totalReviews / limit),
                title: 'Community Reviews',
                filters: {
                    rating: req.query.rating,
                    recommend: req.query.recommend,
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    sort: req.query.sort || 'newest'
                }
            });
        } catch (error) {
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
                review,
                title: `Review for ${review.movieTitle}`,
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
                return res.redirect('back?error=Review not found');
            }

            review.comments.push({
                content: req.body.content,
                user: req.user._id
            });

            await review.save();
            res.redirect('back?message=Comment added successfully');
        } catch (error) {
            res.redirect('back?error=Failed to add comment');
        }
    },

    // Delete a comment from a review
    async deleteComment(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) {
                return res.redirect('back?error=Review not found');
            }

            const comment = review.comments.id(req.params.commentId);
            if (!comment) {
                return res.redirect('back?error=Comment not found');
            }

            if (comment.user.toString() !== req.user._id.toString()) {
                return res.redirect('back?error=Unauthorized');
            }

            comment.remove();
            await review.save();
            res.redirect('back?message=Comment deleted successfully');
        } catch (error) {
            res.redirect('back?error=Failed to delete comment');
        }
    }
};
