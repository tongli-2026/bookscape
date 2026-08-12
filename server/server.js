const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));
app.use(express.json()); // Parse incoming JSON request bodies

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js

// Home Page
// Recommend specially for you today: book, ebook, author (recommend one for each feature daily)
app.get('/books/recommend_daily', routes.recommend_daily_book);
app.get('/ebooks/recommend_daily', routes.recommend_daily_ebook);
app.get('/authors/recommend_daily', routes.recommend_daily_author);
// Top rating books for you
app.get('/books/top_average_rating', routes.top_books_by_average_rating);
// Popular books for you
app.get('/books/top_rating_count', routes.top_books_by_rating_count);
// Nobel Prize Winners in Literature
app.get('/nobel_authors', routes.nobel_authors);
// Real stats of books, authors, ebooks and users
app.get('/api/books/count', routes.books_count);
app.get('/api/authors/count', routes.authors_count);
app.get('/api/ebooks/count', routes.ebooks_count);
app.get('/api/users/count', routes.users_count);

// Book Search Page
// Search book by title/keywords/asin/isbn and apply appropriate filters
app.get('/search_books', routes.search_books);
// Display top review text for top rating book match user searching criteria
app.get('/display_top_review', routes.display_top_review);
// Display top 10 highly rated books, with highly rated reviews, and highly rated author match user searching criteria
app.get('/display_top_rated_books', routes.display_top_rated_books);

// Book Recommend Page
// Top 10 Popular books fiction
app.get('/recommend_books/top_fiction', routes.top_books_fiction);
// Top 10 Popular books romance
app.get('/recommend_books/top_romance', routes.top_books_romance);
// Top 10 Popular books biography
app.get('/recommend_books/top_biography', routes.top_books_biography);
// Top 10 Popular books non-fiction
app.get('/recommend_books/top_non_fiction', routes.top_books_non_fiction);
// Top 10 Popular books crime
app.get('/recommend_books/top_crime', routes.top_books_crime);
// Top 10 Popular books fantasy
app.get('/recommend_books/top_fantasy', routes.top_books_fantasy);
// Top 10 Popular books young-adult
app.get('/recommend_books/top_young_adult', routes.top_books_young_adult);
// Top 10 Popular books children
app.get('/recommend_books/top_children', routes.top_books_children);
// Top 10 Popular comics 
app.get('/recommend_books/top_comics', routes.top_books_comics);
// Top 10 Popular poetry 
app.get('/recommend_books/top_poetry', routes.top_books_poetry);

// Book Information Page
// get all book information by given book_id
app.get('/books/:book_id', routes.book_info);
// get all similar books by given book_id
app.get('/get_similar_books/:book_id', routes.get_similar_books);
// get all book reviews by given book_id
app.get('/get_book_reviews/:book_id', routes.get_book_reviews);

// eBook Information Page 
// get all ebook information by given book_id
app.get('/ebooks/:book_id', routes.ebook_info);
// get all similar ebooks by given book_id
app.get('/get_similar_ebooks/:book_id', routes.get_similar_ebooks);
// get all ebook reviews by given book_id
app.get('/get_ebook_reviews/:book_id', routes.get_ebook_reviews);
// click the button besides the ebook for online reading on the next page
app.get('/ebooks/:book_id/full_text', routes.full_text);

// Author Search Page
app.get('/search_authors', routes.search_authors);

// Author Information Page
app.get('/authors/:author_id', routes.author_info);
app.get('/author_books/:author_id', routes.author_books);

// Get similar authors of a given author - Tong Li
app.get('/get_similar_authors/:author_id', routes.get_similar_authors);

// User login
app.post('/login',routes.login);
// User Signup
app.post('/signup',routes.signup);
// Login from google
app.get('/api/google/callback',routes.googleRoutes);
app.get('/api/google', routes.googleLogin);
// Login from facebook
app.get('/api/facebook/callback',routes.facebookRoutes);
app.get('/api/facebook', routes.facebookLogin);

// User Gallery Page
app.post("/add_to_gallery/:user_id", routes.addBookToGallery); 
app.delete("/remove_from_gallery/:user_id",routes.removeBookFromGallery);
app.get("/gallery/:user_id", routes.getGallery);
app.get("/gallery/genres/:user_id", routes.getGalleryGenres);
app.get("/gallery/added_per_day/:user_id", routes.getGalleryAddedPerDay);

if (require.main === module) {
  app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
  });
}

module.exports = app;
