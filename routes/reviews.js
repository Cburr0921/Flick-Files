const express = require('express');
const router = express.Router();
const reviewsCtrl = require('../controllers/reviews');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Reviews - RESTful routes
router.get('/', ensureSignedIn, reviewsCtrl.index);         
router.get('/all', reviewsCtrl.getAllReviews);              
router.post('/', ensureSignedIn, reviewsCtrl.create);        
router.get('/:id', reviewsCtrl.show);                       
router.get('/:id/edit', ensureSignedIn, reviewsCtrl.edit); 
router.put('/:id', ensureSignedIn, reviewsCtrl.update);     
router.delete('/:id', ensureSignedIn, reviewsCtrl.delete);  

// Review interactions
router.post('/:id/like', ensureSignedIn, reviewsCtrl.toggleLike);      
router.post('/:id/comments', ensureSignedIn, reviewsCtrl.addComment);  
router.delete('/:id/comments/:commentId', ensureSignedIn, reviewsCtrl.deleteComment); 

module.exports = router;
