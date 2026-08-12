-- Bookscape indexes for the core tables.
-- Run after importing the cleaned CSV files.

CREATE INDEX IF NOT EXISTS idx_books_title_trgm_like ON Books (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_books_isbn ON Books (isbn);
CREATE INDEX IF NOT EXISTS idx_books_rating_count ON Books (rating_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_average_rating ON Books (average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_publication_year ON Books (publication_year);

CREATE INDEX IF NOT EXISTS idx_authors_name_lower ON Authors (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_authors_country ON Authors (country);
CREATE INDEX IF NOT EXISTS idx_authors_gender ON Authors (gender);
CREATE INDEX IF NOT EXISTS idx_authors_rating_count ON Authors (rating_count DESC);
CREATE INDEX IF NOT EXISTS idx_authors_average_rating ON Authors (average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_authors_born_date ON Authors (born_date);

CREATE INDEX IF NOT EXISTS idx_book_authors_author_id ON Book_Authors (author_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_book_id ON Book_Authors (book_id);

CREATE INDEX IF NOT EXISTS idx_online_reading_books_isbn ON Online_Reading_Books (isbn);
CREATE INDEX IF NOT EXISTS idx_online_reading_books_asin ON Online_Reading_Books (asin);
CREATE INDEX IF NOT EXISTS idx_online_reading_books_rating_count ON Online_Reading_Books (rating_count DESC);

CREATE INDEX IF NOT EXISTS idx_genres_genre_book ON Genres (genres, book_id);
CREATE INDEX IF NOT EXISTS idx_similar_to_source ON Similar_To (source_book_id);
CREATE INDEX IF NOT EXISTS idx_similar_to_similar ON Similar_To (similar_book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book_rating ON Reviews (book_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_timestamp ON Reviews ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_nobel_award_year ON Nobel_Literature_Winners (award_year DESC);

CREATE INDEX IF NOT EXISTS idx_book_review_review_num ON Book_Review (review_num DESC);
CREATE INDEX IF NOT EXISTS idx_book_review_avg_rating ON Book_Review (avg_rating DESC);

ANALYZE;
