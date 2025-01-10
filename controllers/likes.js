const Review = require('../models/review');
const User = require('../models/user');
const express = require('express');
const router = express.Router();

// Get user's liked content
router.get('/', async function(req, res) {
  try {
    // Get the current user's liked reviews
    const likedReviews = await Review.find({
      'likes': req.user._id
    }).populate('user', 'username');

    res.render('likes/index', {
      title: 'My Liked Content',
      likedReviews
    });
  } catch (err) {
    res.render('error', {
      title: 'Error',
      error: 'Unable to fetch your liked content'
    });
  }
});

// Toggle like/unlike for a review
router.post('/:id/toggle', async function(req, res) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const hasLiked = review.likes.includes(req.user._id);
    if (hasLiked) {
      // Unlike: Remove user's ID from likes array
      review.likes.pull(req.user._id);
    } else {
      // Like: Add user's ID to likes array
      review.likes.push(req.user._id);
    }
    await review.save();

    // Return the new likes count and status
    res.json({
      likes: review.likes.length,
      hasLiked: !hasLiked
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to update like' });
  }
});

module.exports = router;
