-- Bookscape materialized views for route-level query acceleration.
-- Run this after importing the core CSV-backed tables, including Book_Review.

BEGIN;

DROP MATERIALIZED VIEW IF EXISTS Top_Books_Reviews CASCADE;
DROP MATERIALIZED VIEW IF EXISTS All_Books_Views_Top_Genre CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Author_Search_View CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Book_Review_Genre CASCADE;

-- routes.js uses Book_Review as a precomputed table loaded from book_review.csv.
-- This view joins that aggregate with Genres for the recommendation endpoints.
CREATE MATERIALIZED VIEW Book_Review_Genre AS
SELECT
  g.book_id,
  g.genres,
  br.review_num,
  br.avg_rating
FROM Genres g
JOIN Book_Review br ON br.book_id = g.book_id;

-- Adds has_nobel_prize, zodiac_sign, and most_popular_genre.
CREATE MATERIALIZED VIEW Author_Search_View AS
WITH GenreCounts AS (
  SELECT
    a.author_id,
    g.genres,
    COUNT(*) AS genre_count
  FROM Authors a
  LEFT JOIN Book_Authors ba ON a.author_id = ba.author_id
  LEFT JOIN Books b ON ba.book_id = b.book_id
  LEFT JOIN Genres g ON b.book_id = g.book_id
  GROUP BY a.author_id, g.genres
),
MaxGenreCounts AS (
  SELECT
    author_id,
    genres,
    genre_count,
    ROW_NUMBER() OVER (
      PARTITION BY author_id
      ORDER BY genre_count DESC, genres
    ) AS rn
  FROM GenreCounts
  WHERE genres IS NOT NULL
)
SELECT
  a.author_id,
  a.name,
  a.gender,
  a.born_date,
  a.died_date,
  a.average_rating,
  a.rating_count,
  a.about,
  a.country,
  a.latitude,
  a.longitude,
  a.website,
  a.image_url,
  (n.author_id IS NOT NULL) AS has_nobel_prize,
  CASE
    WHEN a.born_date IS NULL THEN NULL
    WHEN (EXTRACT(MONTH FROM a.born_date) = 1 AND EXTRACT(DAY FROM a.born_date) >= 20)
      OR (EXTRACT(MONTH FROM a.born_date) = 2 AND EXTRACT(DAY FROM a.born_date) <= 18) THEN 'Aquarius'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 2 AND EXTRACT(DAY FROM a.born_date) >= 19)
      OR (EXTRACT(MONTH FROM a.born_date) = 3 AND EXTRACT(DAY FROM a.born_date) <= 20) THEN 'Pisces'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 3 AND EXTRACT(DAY FROM a.born_date) >= 21)
      OR (EXTRACT(MONTH FROM a.born_date) = 4 AND EXTRACT(DAY FROM a.born_date) <= 19) THEN 'Aries'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 4 AND EXTRACT(DAY FROM a.born_date) >= 20)
      OR (EXTRACT(MONTH FROM a.born_date) = 5 AND EXTRACT(DAY FROM a.born_date) <= 20) THEN 'Taurus'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 5 AND EXTRACT(DAY FROM a.born_date) >= 21)
      OR (EXTRACT(MONTH FROM a.born_date) = 6 AND EXTRACT(DAY FROM a.born_date) <= 20) THEN 'Gemini'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 6 AND EXTRACT(DAY FROM a.born_date) >= 21)
      OR (EXTRACT(MONTH FROM a.born_date) = 7 AND EXTRACT(DAY FROM a.born_date) <= 22) THEN 'Cancer'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 7 AND EXTRACT(DAY FROM a.born_date) >= 23)
      OR (EXTRACT(MONTH FROM a.born_date) = 8 AND EXTRACT(DAY FROM a.born_date) <= 22) THEN 'Leo'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 8 AND EXTRACT(DAY FROM a.born_date) >= 23)
      OR (EXTRACT(MONTH FROM a.born_date) = 9 AND EXTRACT(DAY FROM a.born_date) <= 22) THEN 'Virgo'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 9 AND EXTRACT(DAY FROM a.born_date) >= 23)
      OR (EXTRACT(MONTH FROM a.born_date) = 10 AND EXTRACT(DAY FROM a.born_date) <= 22) THEN 'Libra'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 10 AND EXTRACT(DAY FROM a.born_date) >= 23)
      OR (EXTRACT(MONTH FROM a.born_date) = 11 AND EXTRACT(DAY FROM a.born_date) <= 21) THEN 'Scorpio'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 11 AND EXTRACT(DAY FROM a.born_date) >= 22)
      OR (EXTRACT(MONTH FROM a.born_date) = 12 AND EXTRACT(DAY FROM a.born_date) <= 21) THEN 'Sagittarius'
    WHEN (EXTRACT(MONTH FROM a.born_date) = 12 AND EXTRACT(DAY FROM a.born_date) >= 22)
      OR (EXTRACT(MONTH FROM a.born_date) = 1 AND EXTRACT(DAY FROM a.born_date) <= 19) THEN 'Capricorn'
    ELSE NULL
  END AS zodiac_sign,
  mgc.genres AS most_popular_genre
FROM Authors a
LEFT JOIN Nobel_Literature_Winners n ON a.author_id = n.author_id
LEFT JOIN MaxGenreCounts mgc ON a.author_id = mgc.author_id AND mgc.rn = 1;

-- Keeps genres lowercase to match cleaned CSV values and route query parameters.
CREATE MATERIALIZED VIEW All_Books_Views_Top_Genre AS
WITH genre_popularity AS (
  SELECT g.genres AS genre, COUNT(DISTINCT b.book_id) AS genre_count
  FROM Genres g
  JOIN Books b ON g.book_id = b.book_id
  GROUP BY g.genres
),
ranked_genres AS (
  SELECT
    b.book_id,
    b.title,
    b.average_rating,
    b.rating_count,
    b.image_url,
    b.publication_year,
    b.num_pages,
    ba.author_id,
    g.genres AS genre,
    a.name AS author_name,
    a.has_nobel_prize,
    a.average_rating AS author_rating,
    e.asin,
    b.isbn,
    CASE WHEN e.book_id IS NOT NULL THEN 'Ebook' ELSE 'Book' END AS book_type,
    gp.genre_count,
    ROW_NUMBER() OVER (PARTITION BY b.book_id ORDER BY gp.genre_count DESC, g.genres) AS genre_rank
  FROM Books b
  LEFT JOIN Online_Reading_Books e ON b.book_id = e.book_id
  JOIN Book_Authors ba ON b.book_id = ba.book_id
  JOIN Genres g ON b.book_id = g.book_id
  JOIN genre_popularity gp ON g.genres = gp.genre
  JOIN Author_Search_View a ON ba.author_id = a.author_id
)
SELECT DISTINCT
  book_id,
  title,
  average_rating,
  rating_count,
  image_url,
  publication_year,
  num_pages,
  author_id,
  genre,
  author_name,
  has_nobel_prize,
  author_rating,
  asin,
  isbn,
  book_type
FROM ranked_genres
WHERE genre_rank = 1;

CREATE MATERIALIZED VIEW Top_Books_Reviews AS
SELECT
  rb.book_id,
  rb.title,
  rb.image_url,
  rb.genre,
  rb.isbn,
  rb.asin,
  rb.average_rating,
  r.rating AS review_rating,
  r.review_text,
  rb.book_type,
  ROW_NUMBER() OVER (
    PARTITION BY r.book_id
    ORDER BY r.rating DESC, r."timestamp" DESC
  ) AS rn
FROM All_Books_Views_Top_Genre rb
JOIN Reviews r ON rb.book_id = r.book_id
ORDER BY rb.average_rating DESC;

COMMIT;

-- Indexes on materialized views. Run after the materialized views are populated.
CREATE INDEX idx_book_review_genre_genres ON Book_Review_Genre (genres);
CREATE INDEX idx_book_review_genre_book_id ON Book_Review_Genre (book_id);
CREATE INDEX idx_book_review_genre_factor ON Book_Review_Genre (genres, review_num DESC, avg_rating DESC);

CREATE INDEX idx_author_search_author_id ON Author_Search_View (author_id);
CREATE INDEX idx_author_search_name ON Author_Search_View (name);
CREATE INDEX idx_author_search_country ON Author_Search_View (country);
CREATE INDEX idx_author_search_gender ON Author_Search_View (gender);
CREATE INDEX idx_author_search_zodiac ON Author_Search_View (zodiac_sign);
CREATE INDEX idx_author_search_genre ON Author_Search_View (most_popular_genre);
CREATE INDEX idx_author_search_nobel ON Author_Search_View (has_nobel_prize);
CREATE INDEX idx_author_search_rating_count ON Author_Search_View (rating_count DESC);
CREATE INDEX idx_author_search_average_rating ON Author_Search_View (average_rating DESC);
CREATE INDEX idx_author_search_born_date ON Author_Search_View (born_date);

CREATE INDEX idx_all_books_book_id ON All_Books_Views_Top_Genre (book_id);
CREATE INDEX idx_all_books_search ON All_Books_Views_Top_Genre (title, asin, isbn);
CREATE INDEX idx_all_books_avg_rating ON All_Books_Views_Top_Genre (average_rating DESC);
CREATE INDEX idx_all_books_order_by ON All_Books_Views_Top_Genre (average_rating DESC, book_id);
CREATE INDEX idx_all_books_filters ON All_Books_Views_Top_Genre (
  publication_year,
  num_pages,
  rating_count,
  author_rating,
  genre,
  book_type
);

CREATE INDEX idx_top_books_reviews_book_id ON Top_Books_Reviews (book_id);
CREATE INDEX idx_top_books_reviews_rn ON Top_Books_Reviews (rn);
CREATE INDEX idx_top_books_reviews_title ON Top_Books_Reviews (title);
CREATE INDEX idx_top_books_reviews_avg_review_rating ON Top_Books_Reviews (average_rating DESC, review_rating DESC);

ANALYZE Book_Review_Genre;
ANALYZE Author_Search_View;
ANALYZE All_Books_Views_Top_Genre;
ANALYZE Top_Books_Reviews;
