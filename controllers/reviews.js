const Review = require('../models/review');
const express = require('express');
const router = express.Router();

// Get all reviews for the current user
router.get('/', async function(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
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

        // Get total count for pagination
        const totalReviews = await Review.countDocuments(query);
        const totalPages = Math.ceil(totalReviews / limit);

        const reviews = await Review.find(query)
            .populate('user')  
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('reviews/index', {
            reviews,
            title: 'Review History',
            page,
            totalPages,
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
            title: 'Error',
            error: 'Unable to fetch reviews'
        });
    }
});

// Get all public reviews
router.get('/all', async function(req, res) {
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

        // User filter
        if (req.query.user) {
            query.user = req.query.user;
        }

        // Movie filter
        if (req.query.movie) {
            query.movieId = req.query.movie;
        }

        // Sorting
        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            'highest-rated': { rating: -1 },
            'lowest-rated': { rating: 1 },
            'most-liked': { likesCount: -1 }
        };
        
        const sortBy = sortOptions[req.query.sort] || sortOptions.newest;

        // Get total count for pagination
        const totalReviews = await Review.countDocuments(query);
        const totalPages = Math.ceil(totalReviews / limit);

        const reviews = await Review.find(query)
            .populate('user')
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('reviews/all', {
            reviews,
            title: 'All Reviews',
            page,
            totalPages,
            filters: {
                rating: req.query.rating,
                recommend: req.query.recommend,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                user: req.query.user,
                movie: req.query.movie,
                sort: req.query.sort || 'newest'
            }
        });
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to fetch reviews'
        });
    }
});

// Show a specific review
router.get('/:id', async function(req, res) {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user')
            .populate('comments.user');
        
        if (!review) {
            return res.redirect('/reviews');
        }
        
        res.render('reviews/show', {
            review,
            title: `Review for ${review.movieTitle}`
        });
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to load review'
        });
    }
});

// Create a new review
router.post('/', async function(req, res) {
    try {
        req.body.user = req.user._id;
        const review = await Review.create(req.body);
        res.redirect(`/movies/${review.movieId}`);
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to create review'
        });
    }
});

// Delete a review
router.delete('/:id', async function(req, res) {
    try {
        await Review.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        res.redirect('/reviews');
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to delete review'
        });
    }
});

// Edit a review (show edit form)
router.get('/:id/edit', async function(req, res) {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (!review) {
            return res.redirect('/reviews');
        }
        res.render('reviews/edit', {
            review,
            title: 'Edit Review'
        });
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to load review'
        });
    }
});

// Update a review
router.put('/:id', async function(req, res) {
    try {
        const review = await Review.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            req.body,
            { new: true }
        );
        res.redirect(`/movies/${review.movieId}`);
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to update review'
        });
    }
});

// Add a comment to a review
router.post('/:id/comments', async function(req, res) {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        review.comments.push({
            content: req.body.content,
            user: req.user._id
        });

        await review.save();
        res.redirect(`/reviews/${review._id}`);
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to add comment'
        });
    }
});

// Delete a comment from a review
router.delete('/:reviewId/comments/:commentId', async function(req, res) {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const comment = review.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        comment.remove();
        await review.save();
        res.redirect(`/reviews/${review._id}`);
    } catch (error) {
        res.render('error', {
            title: 'Error',
            error: 'Unable to delete comment'
        });
    }
});

// Toggle like on a review
router.post('/:id/like', async function(req, res) {
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
});

module.exports = router;
