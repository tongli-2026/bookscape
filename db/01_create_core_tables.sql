-- Bookscape core table schema for PostgreSQL / RDS.
-- Use this in DataGrip to create the main tables before importing cleaned CSV files.
-- Important: table names are intentionally unquoted. PostgreSQL stores them as lowercase,
-- and the existing Express routes use unquoted names such as Books, Book_Authors, and Online_Reading_Books.

BEGIN;

DROP TABLE IF EXISTS Book_Review CASCADE;
DROP TABLE IF EXISTS Nobel_Literature_Winners CASCADE;
DROP TABLE IF EXISTS Similar_To CASCADE;
DROP TABLE IF EXISTS Genres CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Online_Reading_Books CASCADE;
DROP TABLE IF EXISTS Book_Authors CASCADE;
DROP TABLE IF EXISTS Authors CASCADE;
DROP TABLE IF EXISTS Books CASCADE;

CREATE TABLE Books (
  book_id BIGINT PRIMARY KEY,
  isbn TEXT,
  title VARCHAR(500) NOT NULL,
  average_rating DECIMAL(3,2),
  rating_count BIGINT,
  image_url TEXT,
  publication_year INTEGER,
  num_pages INTEGER,
  publisher VARCHAR(500),
  description TEXT,
  CONSTRAINT books_average_rating_range CHECK (average_rating IS NULL OR average_rating BETWEEN 0.00 AND 5.00),
  CONSTRAINT books_rating_count_nonnegative CHECK (rating_count IS NULL OR rating_count >= 0),
  CONSTRAINT books_publication_year_reasonable CHECK (publication_year IS NULL OR publication_year BETWEEN 0 AND EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  CONSTRAINT books_num_pages_nonnegative CHECK (num_pages IS NULL OR num_pages >= 0)
);

CREATE TABLE Authors (
  author_id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  born_date DATE,
  died_date DATE,
  average_rating DECIMAL(3,2),
  rating_count BIGINT,
  about TEXT,
  country VARCHAR(100),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  website TEXT,
  image_url TEXT,
  CONSTRAINT authors_gender_values CHECK (gender IS NULL OR gender = '' OR gender IN ('male', 'female', 'unknown')),
  CONSTRAINT authors_life_dates_order CHECK (died_date IS NULL OR born_date IS NULL OR died_date >= born_date),
  CONSTRAINT authors_average_rating_range CHECK (average_rating IS NULL OR average_rating BETWEEN 0.00 AND 5.00),
  CONSTRAINT authors_rating_count_nonnegative CHECK (rating_count IS NULL OR rating_count >= 0),
  CONSTRAINT authors_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT authors_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  CONSTRAINT authors_website_url CHECK (website IS NULL OR website = '' OR website ILIKE 'http%'),
  CONSTRAINT authors_image_url CHECK (image_url IS NULL OR image_url = '' OR image_url ILIKE 'http%')
);

CREATE TABLE Book_Authors (
  book_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  role VARCHAR(255),
  PRIMARY KEY (book_id, author_id),
  CONSTRAINT book_authors_book_fk FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
  CONSTRAINT book_authors_author_fk FOREIGN KEY (author_id) REFERENCES Authors(author_id) ON DELETE CASCADE
);

CREATE TABLE Online_Reading_Books (
  book_id BIGINT PRIMARY KEY,
  isbn TEXT,
  title VARCHAR(500) NOT NULL,
  average_rating DECIMAL(3,2),
  rating_count BIGINT,
  image_url TEXT,
  publication_year INTEGER,
  num_pages INTEGER,
  publisher VARCHAR(500),
  description TEXT,
  asin VARCHAR(20),
  amazon_url TEXT,
  full_text TEXT,
  CONSTRAINT online_reading_books_book_fk FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
  CONSTRAINT online_reading_books_average_rating_range CHECK (average_rating IS NULL OR average_rating BETWEEN 0.00 AND 5.00),
  CONSTRAINT online_reading_books_rating_count_nonnegative CHECK (rating_count IS NULL OR rating_count >= 0),
  CONSTRAINT online_reading_books_publication_year_reasonable CHECK (publication_year IS NULL OR publication_year BETWEEN 0 AND EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  CONSTRAINT online_reading_books_num_pages_nonnegative CHECK (num_pages IS NULL OR num_pages >= 0),
  CONSTRAINT online_reading_books_amazon_url CHECK (amazon_url IS NULL OR amazon_url = '' OR amazon_url ILIKE 'http%')
);

CREATE TABLE Genres (
  book_id BIGINT NOT NULL,
  genres VARCHAR(100) NOT NULL,
  PRIMARY KEY (book_id, genres),
  CONSTRAINT genres_book_fk FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
  CONSTRAINT genres_allowed_values CHECK (genres IN (
    'fiction', 'romance', 'biography', 'fantasy', 'crime',
    'non-fiction', 'young-adult', 'children', 'comics', 'poetry'
  ))
);

CREATE TABLE Similar_To (
  source_book_id BIGINT NOT NULL,
  similar_book_id BIGINT NOT NULL,
  PRIMARY KEY (source_book_id, similar_book_id),
  CONSTRAINT similar_to_source_book_fk FOREIGN KEY (source_book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
  CONSTRAINT similar_to_similar_book_fk FOREIGN KEY (similar_book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
  CONSTRAINT similar_to_no_self_loop CHECK (source_book_id <> similar_book_id)
);

CREATE TABLE Reviews (
  review_id TEXT PRIMARY KEY,
  book_id BIGINT NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  "timestamp" DATE,
  CONSTRAINT reviews_book_fk FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
  CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 0 AND 5)
);

CREATE TABLE Nobel_Literature_Winners (
  author_id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  born_date DATE,
  died_date DATE,
  average_rating DECIMAL(3,2),
  rating_count BIGINT,
  about TEXT,
  country VARCHAR(100),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  website TEXT,
  image_url TEXT,
  award_year INTEGER NOT NULL,
  motivation TEXT,
  video_url TEXT,
  work_text TEXT,
  CONSTRAINT nobel_author_fk FOREIGN KEY (author_id) REFERENCES Authors(author_id) ON DELETE CASCADE,
  CONSTRAINT nobel_gender_values CHECK (gender IS NULL OR gender = '' OR gender IN ('male', 'female', 'unknown')),
  CONSTRAINT nobel_life_dates_order CHECK (died_date IS NULL OR born_date IS NULL OR died_date >= born_date),
  CONSTRAINT nobel_average_rating_range CHECK (average_rating IS NULL OR average_rating BETWEEN 0.00 AND 5.00),
  CONSTRAINT nobel_rating_count_nonnegative CHECK (rating_count IS NULL OR rating_count >= 0),
  CONSTRAINT nobel_award_year_range CHECK (award_year BETWEEN 1901 AND EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  CONSTRAINT nobel_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT nobel_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  CONSTRAINT nobel_website_url CHECK (website IS NULL OR website = '' OR website ILIKE 'http%'),
  CONSTRAINT nobel_image_url CHECK (image_url IS NULL OR image_url = '' OR image_url ILIKE 'http%'),
  CONSTRAINT nobel_video_url CHECK (video_url IS NULL OR video_url = '' OR video_url ILIKE 'http%')
);

CREATE TABLE Book_Review (
  book_id BIGINT PRIMARY KEY,
  review_num BIGINT NOT NULL,
  avg_rating NUMERIC(3,2) NOT NULL,
  FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

COMMIT;
