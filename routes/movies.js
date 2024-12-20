const express = require('express');
const router = express.Router();
const tmdb = require('../config/tmdb');

// Get popular movies
router.get('/', async (req, res) => {
    try {
        const movies = await tmdb.moviePopular();
        res.render('movies/index', { 
            movies,
            title: 'Popular Movies'
        });
    } catch (error) {
        res.status(500).render('error', { 
            error: error.message,
            title: 'Error'
        });
    }
});

// Search movies
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.redirect('/movies');
        }
        const movies = await tmdb.searchMovie({ query });
        res.render('movies/index', { 
            movies,
            title: `Search Results for "${query}"`
        });
    } catch (error) {
        res.status(500).render('error', { 
            error: error.message,
            title: 'Error'
        });
    }
});

// Get movie details
router.get('/:id', async (req, res) => {
    try {
        const movie = await tmdb.movieInfo({ id: req.params.id });
        res.render('movies/show', { 
            movie,
            title: movie.title
        });
    } catch (error) {
        res.status(500).render('error', { 
            error: error.message,
            title: 'Error'
        });
    }
});

module.exports = router;
