const tmdb = require('../config/tmdb');
const Review = require('../models/review');

module.exports = {
    // Get popular movies or search results
    async index(req, res) {
        try {
            let movies;
            let title = 'Popular Movies';
            const searchQuery = req.query.q;

            // If search query exists, perform search
            if (searchQuery) {
                movies = await tmdb.searchMovie({ query: searchQuery });
                title = `Search Results for "${searchQuery}"`;
            } else {
                movies = await tmdb.moviePopular();
            }

            res.render('movies/index', { 
                movies,
                title,
                q: searchQuery || ''
            });
        } catch (error) {
            console.error('Error in movies index:', error);
            res.render('error', { 
                error: 'Unable to fetch movies at this time.',
                title: 'Error'
            });
        }
    },

    // Get movie details
    async show(req, res) {
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
            console.error('Error in movie show:', error);
            res.render('error', { 
                error: 'Unable to fetch movie details at this time.',
                title: 'Error'
            });
        }
    }
};
