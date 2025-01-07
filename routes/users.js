const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/users');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Users - RESTful routes
router.get('/', ensureSignedIn, usersCtrl.index);             
router.get('/:id', ensureSignedIn, usersCtrl.show);          
router.get('/:id/reviews', ensureSignedIn, usersCtrl.reviews); 

module.exports = router;
