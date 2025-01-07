const express = require('express');
const router = express.Router();
const moviesCtrl = require('../controllers/movies');
const usersCtrl = require('../controllers/users');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Movies - RESTful routes
router.get('/', moviesCtrl.index);         
router.get('/:id', moviesCtrl.show);       

// Review routes - RESTful (nested under movies)
router.post('/:movieId/reviews', ensureSignedIn, usersCtrl.createReview);       
router.put('/:movieId/reviews/:id', ensureSignedIn, usersCtrl.updateReview);    
router.delete('/:movieId/reviews/:id', ensureSignedIn, usersCtrl.deleteReview); 

module.exports = router;
