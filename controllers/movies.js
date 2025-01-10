const tmdb = require('../config/tmdb');
const Review = require('../models/review');
const express = require('express');
const router = express.Router();

// Get popular movies or search results
router.get('/', async function(req, res) {
    try {
        const searchQuery = req.query.q || '';
        const movies = searchQuery 
            ? await tmdb.searchMovie({ query: searchQuery })
            : await tmdb.moviePopular();
        
        res.render('movies/index', { 
            movies,
            title: searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Movies',
            q: searchQuery
        });
    } catch (error) {
        res.render('error', { 
            error: 'Unable to fetch movies at this time.',
            title: 'Error'
        });
    }
});

// Get movie details
router.get('/:id', async function(req, res) {
    try {
        const movie = await tmdb.movieInfo({ id: req.params.id });
        const reviews = await Review.find({ movieId: req.params.id })
            .populate('user', 'username') 
            .sort({ createdAt: -1 });

        res.render('movies/show', { 
            movie,
            reviews: reviews || [],
            title: movie.title,
            q: req.query.q || '' 
        });
    } catch (error) {
        res.render('error', { 
            error: 'Unable to fetch movie details at this time.',
            title: 'Error'
        });
    }
});

module.exports = router;
