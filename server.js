require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require('express-session');
const moviesCtrl = require('./controllers/movies');
const usersCtrl = require('./controllers/users');
const likesCtrl = require('./controllers/likes-controller');
const ensureSignedIn = require('./middleware/ensure-signed-in');

const app = express();

// Set the port from environment variable or default to 3000
const port = process.env.PORT || "3000";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Configure Express app 
app.set('view engine', 'ejs');
app.set('views', './views');

// Mount Middleware
app.use(express.json());
// Morgan for logging HTTP requests
app.use(morgan('dev'));
// Static middleware for returning static assets to the browser
app.use(express.static('public'));
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Add the user (if logged in) to req.user & res.locals
app.use(require('./middleware/add-user-to-locals-and-req'));

// Routes

// Home page
app.get('/', async (req, res) => {
  try {
    const Review = require('./models/review');

    const trendingReviews = await Review.getPopular(6);
    res.render('home', { 
      user: req.user,
      title: 'Home',
      trendingReviews
    });
  } catch (err) {
    console.error('Error fetching trending reviews:', err);
    res.render('home', { 
      user: req.user,
      title: 'Home',
      trendingReviews: []
    });
  }
});

// Movie routes - RESTful
app.get('/movies', moviesCtrl.index);        
app.get('/movies/:id', moviesCtrl.show);      

// Review routes - RESTful (nested under movies)
app.post('/movies/:movieId/reviews', ensureSignedIn, usersCtrl.createReview);       
app.put('/movies/:movieId/reviews/:id', ensureSignedIn, usersCtrl.updateReview);    
app.delete('/movies/:movieId/reviews/:id', ensureSignedIn, usersCtrl.deleteReview); 

// User routes - RESTful
app.get('/users', ensureSignedIn, usersCtrl.index);          
app.get('/users/:id', ensureSignedIn, usersCtrl.show);       
app.get('/users/:id/reviews', ensureSignedIn, usersCtrl.reviews); 

// Likes routes
app.get('/likes', ensureSignedIn, likesCtrl.index);
app.post('/likes/reviews/:id', ensureSignedIn, likesCtrl.toggleLike);

// Auth routes
app.use('/auth', require('./controllers/auth'));

app.listen(port, () => {
  console.log(`Express is listening on port:${port}`);
});
