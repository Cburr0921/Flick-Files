require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require('express-session');
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
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Add the user (if logged in) to req.user & res.locals
app.use(require('./middleware/add-user-to-locals-and-req'));

// Mount Routes
app.use('/', require('./routes/index'));
app.use('/movies', require('./routes/movies'));
app.use('/reviews', require('./routes/reviews'));
app.use('/users', require('./routes/users'));
app.use('/likes', require('./routes/likes'));
app.use('/auth', require('./controllers/auth'));

app.listen(port, () => {
  console.log(`Express is listening on port:${port}`);
});
