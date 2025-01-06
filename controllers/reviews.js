const Review = require('../models/review');

module.exports = {
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
    }
};
