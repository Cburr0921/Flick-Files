const express = require('express');
const router = express.Router();
const Review = require('../models/review');

// Home page
router.get('/', async (req, res) => {
  try {
    const trendingReviews = await Review.getPopular(6);
    res.render('home', { 
      user: req.user,
      title: 'Home',
      trendingReviews
    });
  } catch (err) {
    res.render('home', { 
      user: req.user,
      title: 'Home',
      trendingReviews: []
    });
  }
});

module.exports = router;
