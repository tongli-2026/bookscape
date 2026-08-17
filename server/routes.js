/**
 * Bookscape backend route definitions.
 *
 * This file contains the Express route handlers for the application, covering
 * homepage recommendations, book/ebook/author search and detail endpoints,
 * gallery operations, and login/signup flows.
 *
 * Response conventions are standardized across routes:
 * - Successful reads typically return JSON data with HTTP 200.
 * - Create/update operations use HTTP 201 when a new resource is created.
 * - Missing or invalid input returns HTTP 400.
 * - Authentication failures return HTTP 401.
 * - Not-found cases return HTTP 404 with a JSON message.
 * - Database or unexpected server errors are captured by the shared helpers
 *   and returned as HTTP 500 with a consistent error payload.
 */
const connection = require("./db/connection");

const parseCsvParam = (value) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const logRouteError = (context, error) => {
  console.error(`[${context}] Database error:`, error);
};

const handleQueryError = (res, context, error) => {
  logRouteError(context, error);
  return res.status(500).json({ error: "An unexpected error occurred" });
};

const executeQuery = async (res, context, query, params = []) => {
  try {
    return await new Promise((resolve, reject) => {
      const onQueryComplete = (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      };

      if (params && params.length > 0) {
        connection.query(query, params, onQueryComplete);
      } else {
        connection.query(query, onQueryComplete);
      }
    });
  } catch (error) {
    return handleQueryError(res, context, error);
  }
};

/******************************
 * HOME PAGE ROUTES *
 ******************************/

// Route 1-1: GET /books/recommend_daily
// implement a route to recommend a book daily
// TEST CASE
// http://localhost:8081/books/recommend_daily
const recommend_daily_book = async function (req, res) {
  const query = `
    SELECT book_id, initcap(title) as title, average_rating, image_url, description
    FROM Books
    WHERE average_rating >= 4.5
    AND rating_count > 1000
    AND description != 'nan'
    ORDER BY RANDOM()
    LIMIT 1;
  `;

  const result = await executeQuery(res, "recommend_daily_book", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-2: GET /ebooks/recommend_daily
// implement a route to recommend a online reading ebook daily
// TEST CASE
// http://localhost:8081/ebooks/recommend_daily
const recommend_daily_ebook = async function (req, res) {
  const query = `
    SELECT b.book_id, initcap(title) as title, average_rating, image_url, description 
    FROM Online_Reading_Books b
    JOIN Book_Authors ba ON b.book_id = ba.book_id
    WHERE average_rating >= 4
    AND description != 'nan'
    ORDER BY RANDOM()
    LIMIT 1;
  `;

  const result = await executeQuery(res, "recommend_daily_ebook", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-3: GET /authors/recommend_daily
// implement a route to recommend an author daily
// TEST CASE
// http://localhost:8081/authors/recommend_daily
const recommend_daily_author = async function (req, res) {
  const query = `
    SELECT a.author_id, name, average_rating, image_url, about
    FROM Authors a
    JOIN Book_Authors ba ON a.author_id = ba.author_id
    WHERE average_rating >= 4.6
    AND about IS NOT NULL
    AND about != 'nan'
    AND image_url LIKE 'https://images.%'
    AND rating_count > 1000
    ORDER BY RANDOM()
    LIMIT 1;
  `;

  const result = await executeQuery(res, "recommend_daily_author", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-4: GET /books/top_average_rating
// implement a route to get 10 top rating books
// TEST CASE
// http://localhost:8081/books/top_average_rating
const top_books_by_average_rating = async function (req, res) {
  const query = `
    SELECT DISTINCT book_id, initcap(title) as title, average_rating, image_url
    FROM Books
    WHERE rating_count > 20
    ORDER BY average_rating DESC
    LIMIT 10;
  `;

  const result = await executeQuery(res, "top_books_by_average_rating", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-5: GET /books/top_rating_count
// implement a route to get 60 most popular books
// TEST CASE
// http://localhost:8081/books/top_rating_count
const top_books_by_rating_count = async function (req, res) {
  const query = `
    SELECT DISTINCT book_id, initcap(title) AS title, average_rating, image_url, rating_count
    FROM Books
    ORDER BY rating_count DESC
    LIMIT 60;
  `;

  const result = await executeQuery(res, "top_books_by_rating_count", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-6: GET /nobel_authors
// implement a route to get all nobel prize authors
// TEST CASE
// http://localhost:8081/nobel_authors
const nobel_authors = async function (req, res) {
  const query = `
    SELECT author_id, name, award_year, motivation, average_rating, image_url
    FROM Nobel_Literature_Winners
    ORDER BY award_year DESC;
  `;

  const result = await executeQuery(res, "nobel_authors", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-7: GET /ebooks/:book_id/full_text
// implement a route to get the full text and title of an ebook by book_id
// TEST CASE
// http://localhost:8081/ebooks/11429013/full_text
const full_text = async function (req, res) {
  const bookId = req.params.book_id;
  const query = `
    SELECT full_text, title
    FROM Online_Reading_Books
    WHERE book_id = $1 AND full_text IS NOT NULL
  `;

  const result = await executeQuery(res, "full_text", query, [bookId]);
  if (!result) {
    return;
  }

  if (result.rows.length > 0) {
    return res.status(200).json({ full_text: result.rows[0].full_text });
  }

  return res.status(404).json({ message: "Full text not available for this book" });
};

// Route 1-8: GET /ebooks/:book_id
// Retrieves detailed information about the ebook with the specified book_id, including isbn, title, image, publication year, pages, publisher,
// ebook description, number of reviews, average rating, authors, genres, asin, amazon_url.
// http://localhost:8081/ebooks/28449265
const ebook_info = async function (req, res) {
  const bookId = req.params.book_id;

  const query = `
    WITH target_ebook AS (
      SELECT
        b.book_id,
        b.isbn,
        b.asin,
        b.amazon_url,
        INITCAP(b.title) AS title,
        b.image_url,
        b.publication_year,
        b.num_pages,
        b.publisher,
        description
      FROM Online_Reading_Books b
      WHERE b.book_id = $1
    )
    SELECT
      tb.isbn,
      tb.title,
      tb.asin,
      tb.amazon_url,
      tb.image_url,
      tb.publication_year,
      tb.num_pages,
      tb.publisher,
      tb.description,
      COALESCE(br.review_num, 0) AS review_num,
      COALESCE(ROUND(br.avg_rating, 2), 0.0) AS avg_rating,
      ARRAY_AGG(DISTINCT ARRAY[
        COALESCE(a.author_id::TEXT, 'N/A'),
        INITCAP(COALESCE(a.name, 'Unknown')),
        ba.role
      ]) AS author_list,
      ARRAY_AGG(DISTINCT INITCAP(COALESCE(g.genres, 'Unknown'))) AS genre_list
    FROM target_ebook tb
    JOIN book_review br ON tb.book_id = br.book_id
    JOIN book_authors ba ON tb.book_id = ba.book_id
    JOIN authors a ON ba.author_id = a.author_id
    JOIN genres g ON tb.book_id = g.book_id
    GROUP BY tb.book_id, tb.isbn, tb.title, tb.asin, tb.amazon_url, tb.image_url, tb.publication_year, tb.num_pages, tb.publisher, tb.description, br.review_num, br.avg_rating;
  `;

  const result = await executeQuery(res, "ebook_info", query, [bookId]);
  if (!result) {
    return;
  }

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(result.rows[0]);
};

// Route 1-9: GET /get_similar_ebooks/:book_id
// implement a route that get the similar ebooks of a target ebook from the Similar_To table
// and sorts them by their average rating
// TEST CASES:
// http://localhost:8081/get_similar_ebooks/28449265
const get_similar_ebooks = async function (req, res) {
  const bookId = req.params.book_id;

  const query = `
    WITH filtered_similar_ebooks AS (
      SELECT similar_book_id
      FROM similar_to
      WHERE source_book_id = $1
    )
    SELECT
      b.book_id,
      b.image_url,
      INITCAP(b.title) AS title,
      ARRAY_AGG(DISTINCT INITCAP(g.genres)) AS genre_list,
      ROUND(br.avg_rating, 2) AS avg_rating
    FROM filtered_similar_ebooks f
    JOIN Online_Reading_Books b ON f.similar_book_id = b.book_id
    JOIN genres g ON b.book_id = g.book_id
    JOIN book_review br ON b.book_id = br.book_id
    GROUP BY b.book_id, b.image_url, b.title, br.avg_rating
    ORDER BY avg_rating DESC;
  `;

  const result = await executeQuery(res, "get_similar_ebooks", query, [bookId]);
  if (!result) {
    return;
  }

  if (result.rows.length > 0) {
    return res.status(200).json(result.rows);
  }

  return res.status(404).json({ message: "No similar books found for this book." });
};

// Route 1-10: GET /get_ebook_reviews/:book_id
// implement a route that get the ebook reviews of a target ebook from the Reviews table
// and sorts them by the rating of the review
// TEST CASES:
// http://localhost:8081/get_ebook_reviews/28449265
const get_ebook_reviews = async function (req, res) {
  const bookId = req.params.book_id;

  const query = `
    SELECT DISTINCT review_text, rating
    FROM reviews
    WHERE book_id = $1
    ORDER BY rating DESC;
  `;

  const result = await executeQuery(res, "get_ebook_reviews", query, [bookId]);
  if (!result) {
    return;
  }

  if (result.rows.length > 0) {
    return res.status(200).json(result.rows);
  }

  return res.status(404).json({ message: "No reviews found for this book." });
};

// Route 1-11: GET /api/books/count
// implement a route that gets the real books numbers in the database
// TEST CASES:
// http://localhost:8081/api/books/count
const books_count = async function (req, res) {
  const query = `SELECT COUNT(DISTINCT book_id) AS count FROM Books;`;
  const result = await executeQuery(res, "books_count", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-12: GET /api/authors/count
// implement a route that gets the real authors numbers in the database
// TEST CASES:
// http://localhost:8081/api/authors/count
const authors_count = async function (req, res) {
  const query = `SELECT COUNT(DISTINCT author_id) AS count FROM Authors;`;
  const result = await executeQuery(res, "authors_count", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-13: GET /api/ebooks/count
// implement a route that gets the real ebooks numbers in the database
// TEST CASES:
// http://localhost:8081/api/ebooks/count
const ebooks_count = async function (req, res) {
  const query = `SELECT COUNT(DISTINCT book_id) AS count FROM Online_Reading_Books;`;
  const result = await executeQuery(res, "ebooks_count", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 1-14: GET /api/users/count
// implement a route that gets the real users numbers in the database
// TEST CASES:
// http://localhost:8081/api/users/count
const users_count = async function (req, res) {
  const query = `SELECT COUNT(DISTINCT id) AS count FROM Users;`;
  const result = await executeQuery(res, "users_count", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

/***************************************
 * BOOKFINDER PAGE ROUTES *
 ***************************************/

// Route 2-1: Get /search_books
// Returns all books that match the given search query(title, keywords, isbn, asin), filtered by specified parameters or defaults.
// Filters by `genres` if specified, defaulting to 'fiction' if no genre is provided.
// Filters by `media` type (e.g., Book, Ebook), defaulting to 'Book' if unspecified.
// Additional filters include publication year range, num of page, rating count, and author rating range, each has given a default value.
// Groups by book ID to ensure books with multiple genres/authors are displayed as a single entry with aggregated genres/authors.
// Provide some sorting order and defaulting to average rating in descending order.

// Test cases:
// test all filter applied: http://localhost:8081/search_books?search_string=Harry%20Potter&genres=children,%20fiction&media=Ebook&pub_year_min=2000&pub_year_max=2021&page_min=100&page_max=500&rating_count_min=1000&rating_count_max=50000&author_rating_min=3.0&author_rating_max=5.0&sort_order=publication_year_desc
// test default: http://localhost:8081/search_books
// test search by isbn: http://localhost:8081/search_books?search_string=0531025950

const search_books = async function (req, res) {
const searchString = req.query.search_string ?? "";
const genres = parseCsvParam(req.query.genres).map((genre) => genre.toLowerCase());
const media = parseCsvParam(req.query.media);
const pubYearMin = Number(req.query.pub_year_min ?? 0);
const pubYearMax = Number(req.query.pub_year_max ?? 2021);
const pageMin = Number(req.query.page_min ?? 0);
const pageMax = Number(req.query.page_max ?? 14777);
const ratingCountMin = Number(req.query.rating_count_min ?? 0);
const ratingCountMax = Number(req.query.rating_count_max ?? 4899965);
const authorRatingMin = Number(req.query.author_rating_min ?? 0);
const authorRatingMax = Number(req.query.author_rating_max ?? 5);
const sortOrder = req.query.sort_order ?? "rating_count_desc";

if (genres.length === 0 || media.length === 0) {
   console.log("[search_books] Empty genres or media. Returning empty result.");
   return res.status(200).json([]);
}

let baseQuery = `
SELECT b.book_id, b.average_rating, b.rating_count, b.genre,
        b.title, b.author_name, b.has_nobel_prize, b.book_type, b.image_url
FROM all_books_views_top_genre b 
`;
const params = [
   pubYearMin,
   pubYearMax,
   pageMin,
   pageMax,
   ratingCountMin,
   ratingCountMax,
   authorRatingMin,
   authorRatingMax,
];

const addParam = (value) => {
   params.push(value);
   return `$${params.length}`;
};

baseQuery += `
WHERE b.publication_year BETWEEN $1 AND $2
AND b.num_pages BETWEEN $3 AND $4
AND b.rating_count BETWEEN $5 AND $6
AND b.author_rating BETWEEN $7 AND $8
`;

if (searchString) {
   const isIsbnOrAsin =
     /^[0-9]{10,13}$/.test(searchString) ||
     /^[A-Z0-9]{10}$/.test(searchString);

   if (isIsbnOrAsin) {
     const searchParam = addParam(searchString);
     baseQuery += `
     AND (b.asin = ${searchParam} OR b.isbn = ${searchParam})
   `;
   } else {
     const titleParam = addParam(`%${searchString}%`);
     baseQuery += `
     AND b.title ILIKE ${titleParam}
   `;
   }
}

if (genres.length > 0) {
   baseQuery += ` AND b.genre = ANY(${addParam(genres)}::text[]) `;
}

if (media.length > 0) {
   baseQuery += ` AND b.book_type = ANY(${addParam(media)}::text[]) `;
}

if (req.query.hasNobelPrize === "true") {
   baseQuery += ` AND b.has_nobel_prize = TRUE `;
}

baseQuery += `
GROUP BY b.book_id, b.average_rating, b.rating_count, b.genre,
          b.title, b.author_name, b.has_nobel_prize, b.book_type, b.image_url, b.publication_year
`;

baseQuery += ` ORDER BY `;
switch (sortOrder) {
   case "title_asc":
     baseQuery += "b.title";
     break;
   case "title_desc":
     baseQuery += "b.title DESC";
     break;
   case "publication_year_asc":
     baseQuery += "b.publication_year";
     break;
   case "publication_year_desc":
     baseQuery += "b.publication_year DESC";
     break;
   default:
     baseQuery += "b.rating_count DESC";
}

const result = await executeQuery(res, "search_books", baseQuery, params);
if (!result) {
   return;
}

return res.status(200).json(result.rows);
};

//Route 2-2: Get /display_top_review
// Returns the highest-ranked review and its books based on the keyword or book title that user searched, limited to one result.
// For each book, ranks reviews by rating (descending) and timestamp (most recent first), ensuring that the top-rated, latest review is selected.
// If no `search_string` is given, it defaults to returning a single review from one of the top-rated books in the dataset.

//Test cases:
//test search by title: http://localhost:8081/display_top_review?search_string=Harry%20Potter
//test default: http://localhost:8081/display_top_review

const display_top_review = async function (req, res) {
const searchString = req.query.search_string ?? "";
const params = [`%${searchString}%`, searchString];

const baseQuery = `
 WITH review_data AS (
   SELECT
   r.review_rating,r.review_text, r.image_url, r.title, r.genre, r.average_rating, r.book_id, a.name, a.has_nobel_prize, r.isbn, r.asin,r.rn, r.book_type
   FROM top_books_reviews r
   JOIN Book_Authors ba ON r.book_id = ba.book_id
   JOIN author_search_view a ON ba.author_id = a.author_id
	   WHERE
	       r.title ILIKE $1 or r.isbn = $2 or r.asin = $2
	   ORDER BY r.average_rating DESC)
   SELECT
   r.review_rating,r.review_text, r.image_url, r.title, r.genre, r.average_rating, r.book_id, r.name AS author_name, r.has_nobel_prize, r.book_type
   FROM review_data r
   WHERE r.rn=1
   LIMIT 1;
     `;

const result = await executeQuery(res, "display_top_review", baseQuery, params);
if (!result) {
   return;
}

return res.status(200).json(result.rows);
};

//Route 2-3: Get / display_top_rated_books
//display top 10 highly rated books, with highly rated reviews, and highly rated author matching user search criteria.
//If no search critera is provided, it defaults to returning a top 10 highly rated book, with highly rated reviews, and highly rated authors.
//Test Cases:
//Test default:http://localhost:8081/display_top_rated_books
//Test search by title: http://localhost:8081/display_top_rated_books?search_string=Mystery
const display_top_rated_books = async function (req, res) {
const searchString = req.query.search_string ?? "";
const params = [];
const searchFilter = searchString
   ? `AND (tb.title ILIKE $1 OR tb.isbn ILIKE $1 OR tb.asin ILIKE $1)`
   : "";

if (searchString) {
   params.push(`%${searchString}%`);
}

const baseQuery = `WITH Top_Author AS (
SELECT DISTINCT ON (a.average_rating, tb.book_id, a.author_id) a.author_id, a.name AS author_name, tb.title,
tb.image_url, tb.genre, tb.average_rating, tb.book_id, a.has_nobel_prize
	  FROM (SELECT book_id, title, image_url, genre, average_rating, review_rating, tb.book_type
	  FROM Top_Books_Reviews tb
	  WHERE rn = 1 ${searchFilter}
	  ORDER BY average_rating DESC, review_rating DESC LIMIT 100) tb
JOIN Book_Authors ba ON tb.book_id = ba.book_id
JOIN Author_Search_View a ON ba.author_id = a.author_id
ORDER BY a.average_rating DESC, tb.book_id, a.author_id),
Backup_Rows AS (
SELECT DISTINCT ON (a.average_rating,tb.book_id, a.author_id) a.author_id, a.name AS author_name, tb.title,
tb.image_url, tb.genre, tb.average_rating, tb.book_id, a.has_nobel_prize
FROM (SELECT book_id, title, image_url, genre, average_rating, review_rating, tb.book_type
FROM Top_Books_Reviews tb
WHERE rn = 1
ORDER BY average_rating DESC, review_rating DESC LIMIT 10) tb
JOIN Book_Authors ba ON tb.book_id = ba.book_id
JOIN Author_Search_View a ON ba.author_id = a.author_id
ORDER BY a.average_rating DESC, tb.book_id, a.author_id)
SELECT book_id, title, genre, average_rating, author_name, image_url, has_nobel_prize
FROM (SELECT * FROM Top_Author
UNION
SELECT * FROM Backup_Rows br
WHERE NOT EXISTS (SELECT 1 FROM Top_Author ta WHERE br.book_id = ta.book_id)
LIMIT 10) final_result
ORDER BY average_rating DESC;
`;

const result = await executeQuery(res, "display_top_rated_books", baseQuery, params);
if (!result) {
   return;
}

return res.status(200).json(result.rows);
};
/**************************************************************
 * Book Recommend and info pages ROUTES *
 **************************************************************/

// Route 3-1: GET /books/:book_id
// Retrieves detailed information about the book with the specified book_id, including isbn, title, image, publication year, pages, publisher,
// book description, number of reviews, average rating, authors, genres.
// TEST CASES:
// http://localhost:8081/books/21853680
const book_info = async function (req, res) {
  const bookId = req.params.book_id;

  const query = `
    WITH target_book AS (
      SELECT
        b.book_id,
        b.isbn,
        INITCAP(b.title) AS title,
        b.image_url,
        b.publication_year,
        b.num_pages,
        COALESCE(b.publisher, 'Unknown') AS publisher,
        COALESCE(b.description, 'No description available') AS description
      FROM books b
      WHERE b.book_id = $1
    )
    SELECT
      tb.isbn,
      tb.title,
      tb.image_url,
      tb.publication_year,
      tb.num_pages,
      tb.publisher,
      tb.description,
      COALESCE(br.review_num, 0) AS review_num,
      COALESCE(ROUND(br.avg_rating, 2), 0.0) AS avg_rating,
      ARRAY_AGG(DISTINCT ARRAY[
        COALESCE(a.author_id::TEXT, 'N/A'),
        INITCAP(COALESCE(a.name, 'Unknown')),
        ba.role
      ]) AS author_list,
      ARRAY_AGG(DISTINCT INITCAP(COALESCE(g.genres, 'Unknown'))) AS genre_list
    FROM target_book tb
    LEFT JOIN book_review br ON tb.book_id = br.book_id
    LEFT JOIN book_authors ba ON tb.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    LEFT JOIN genres g ON tb.book_id = g.book_id
    GROUP BY tb.book_id, tb.isbn, tb.title, tb.image_url, tb.publication_year, tb.num_pages, tb.publisher, tb.description, br.review_num, br.avg_rating;

  `;

  const result = await executeQuery(res, "book_info", query, [bookId]);
  if (!result) {
    return;
  }

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(result.rows[0]);
};

// Route 3-2: GET /get_similar_books/:book_id
// implement a route that get the similar books of a target book from the Similar_To table
// and sorts them by their average rating
// TEST CASES:
// http://localhost:8081/get_similar_books/21853680
const get_similar_books = async function (req, res) {
  const bookId = req.params.book_id;

  const query = `
    WITH filtered_similar_books AS (
      SELECT similar_book_id
      FROM similar_to
      WHERE source_book_id = $1
    )
    SELECT
      b.book_id,
      b.image_url,
      INITCAP(b.title) AS title,
      ARRAY_AGG(DISTINCT INITCAP(COALESCE(g.genres, 'Unknown'))) AS genre_list,
      COALESCE(ROUND(br.avg_rating, 2), 0.0) AS avg_rating
    FROM filtered_similar_books f
    JOIN books b ON f.similar_book_id = b.book_id
    JOIN genres g ON b.book_id = g.book_id
    JOIN book_review br ON b.book_id = br.book_id
    GROUP BY b.book_id, b.image_url, b.title, br.avg_rating
    ORDER BY avg_rating DESC;
  `;

  const result = await executeQuery(res, "get_similar_books", query, [bookId]);
  if (!result) {
    return;
  }

  if (result.rows.length > 0) {
    return res.status(200).json(result.rows);
  }

  return res.status(404).json({ message: "No similar books found for this book." });
};

// Route 3-3: GET /get_book_reviews/:book_id
// implement a route that get the book reviews of a target book from the Reviews table
// and sorts them by the rating of the review
// TEST CASES:
// http://localhost:8081/get_book_reviews/19246471
const get_book_reviews = async function (req, res) {
  const bookId = req.params.book_id;

  const query = `
    SELECT DISTINCT review_text, rating
    FROM reviews
    WHERE book_id = $1
    ORDER BY rating DESC;
  `;

  const result = await executeQuery(res, "get_book_reviews", query, [bookId]);
  if (!result) {
    return;
  }

  if (result.rows.length > 0) {
    return res.status(200).json(result.rows);
  }

  return res.status(404).json({ message: "No reviews found for this book." });
};

// Route 3-4: GET /recommend_books/top_fiction books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_fiction
const top_books_fiction = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'fiction'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'fiction'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id
  `;

  const result = await executeQuery(res, "top_books_fiction", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-5: GET /recommend_books/top_romance books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_romance

const top_books_romance = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'romance'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'romance'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id
  `;

  const result = await executeQuery(res, "top_books_romance", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-6: GET /recommend_books/top_biography books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_biography
const top_books_biography = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'biography'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'biography'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id
  `;

  const result = await executeQuery(res, "top_books_biography", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-7: GET /recommend_books/top_non_fiction books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_non_fiction
const top_books_non_fiction = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'non-fiction'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'non-fiction'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id
  `;

  const result = await executeQuery(res, "top_books_non_fiction", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-8: GET /recommend_books/top_crime books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_crime
const top_books_crime = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'crime'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'crime'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id
  `;

  const result = await executeQuery(res, "top_books_crime", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-9: GET /recommend_books/top_fantasy books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_fantasy
const top_books_fantasy = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'fantasy'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'fantasy'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id
  `;

  const result = await executeQuery(res, "top_books_fantasy", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-10: GET /recommend_books/top_young adult books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_young_adult
const top_books_young_adult = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'young-adult'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'young-adult'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id;
  `;

  const result = await executeQuery(res, "top_books_young_adult", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-11: GET /recommend_books/top_children books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_children
const top_books_children = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'children'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'children'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id;
  `;

  const result = await executeQuery(res, "top_books_children", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-12: GET /recommend_books/top_comics books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_comics
const top_books_comics = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'comics'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'comics'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id;
  `;

  const result = await executeQuery(res, "top_books_comics", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

// Route 3-13: GET /recommend_books/top_poetry books based on 50% weight on the review number, and 50% weight on the average rating
// test http://localhost:8081/recommend_books/top_poetry
const top_books_poetry = async function (req, res) {
  const query = `
      With Top_book AS (SELECT book_id, (0.5*avg_rating/5+ 0.5*review_num/(SELECT Max(review_num) FROM book_review_genre WHERE genres = 'poetry'))AS Factor
                  FROM Book_Review_Genre
                  WHERE genres = 'poetry'
                  ORDER BY Factor DESC
                  LIMIT 24)
      SELECT b.book_id, INITCAP(b.title) AS title, average_rating, image_url
      FROM Top_book tb JOIN books b ON tb.book_id = b.book_id;
  `;

  const result = await executeQuery(res, "top_books_poetry", query);
  if (!result) {
    return;
  }

  return res.status(200).json(result.rows);
};

/****************************************************************
 * AUTHOR SEARCH AND INFO PAGES ROUTES *
 ***************************************************************/

// Route 4-1: GET /author/:author_id
// implement a route that given a author_id, returns all information about the author
// TEST CASE
// http://localhost:8081/authors/1077326
const author_info = async function (req, res) {
 const authorId = req.params.author_id;
 const query = `
 SELECT
   A.author_id,
   A.name,
   A.gender,
   A.born_date,
   A.died_date,
   A.average_rating,
   A.rating_count,
   A.about,
   A.country,
   A.latitude,
   A.longitude,
   A.website,
   A.image_url,
   A.zodiac_sign,
   A.most_popular_genre,
   A.has_nobel_prize,
   COALESCE(N.award_year, NULL) AS award_year,
   COALESCE(N.motivation, NULL) AS motivation,
   COALESCE(N.video_url, NULL) AS video_url,
   COALESCE(N.work_text, NULL) AS work_text
 FROM Author_Search_View A
 LEFT JOIN Nobel_Literature_Winners N ON A.author_id = N.author_id
 WHERE A.author_id = $1
 `;

 const result = await executeQuery(res, "author_info", query, [authorId]);
 if (!result) {
   return;
 }

 return res.status(200).json(result.rows[0] || {});
};

// Route 4-2: GET /author_books/:author_id
// implement a route that given an author_id, returns the top 10 books of that author ordered by books' rating count (descending)
// TEST CASE:
// http://localhost:8081/author_books/1077326
const author_books = async function (req, res) {
 const authorId = req.params.author_id;
 const query = `
 SELECT
   B.book_id,
   B.title,
   B.publication_year,
   B.average_rating,
   B.rating_count,
   B.image_url,
   STRING_AGG(DISTINCT G.genres, ', ') AS genres
 FROM Books B
 JOIN Book_Authors BA ON B.book_id = BA.book_id
 LEFT JOIN Genres G ON B.book_id = G.book_id
 WHERE BA.author_id = $1
 GROUP BY B.book_id
 ORDER BY B.rating_count DESC
 LIMIT 10
 `;

 const result = await executeQuery(res, "author_books", query, [authorId]);
 if (!result) {
   return;
 }

 return res.status(200).json(result.rows);
};

// Route 4-3: GET /get_similar_authors/:author_id
// implement a route that get the top 5 authors whose representative genre is the same as that of a target author
// and sorts them by the number of books they have in that genre
// TEST CASES:
// http://localhost:8081/get_similar_authors/1077326
const get_similar_authors = async function (req, res) {
 const authorId = req.params.author_id;
 const query = `
   WITH TargetAuthorGenre AS (
     SELECT genres, genre_count
     FROM (
       SELECT g.genres, COUNT(*) AS genre_count
       FROM (SELECT DISTINCT book_id FROM Book_Authors WHERE author_id = $1) ba
       JOIN Genres g ON ba.book_id = g.book_id
       GROUP BY genres
     ) AS genre_counts
     ORDER BY genre_count DESC, genres
     LIMIT 1
   ),
   AuthorsWithSameGenre AS (
     SELECT ba.author_id, g.genres, count(*) AS genre_count
     FROM TargetAuthorGenre tg
     JOIN Genres g ON tg.genres = g.genres
     JOIN Book_Authors ba ON ba.book_id = g.book_id
     WHERE ba.author_id != $1
     GROUP BY ba.author_id, g.genres
   )
   SELECT a.author_id, a.name, a.average_rating, a.image_url, top_5_authors.genres, top_5_authors.genre_count
   FROM (SELECT author_id, genres, genre_count FROM AuthorsWithSameGenre ORDER BY genre_count DESC LIMIT 5) top_5_authors
   JOIN authors a ON a.author_id = top_5_authors.author_id;
 `;

 const result = await executeQuery(res, "get_similar_authors", query, [authorId]);
 if (!result) {
   return;
 }

 return res.status(200).json(result.rows);
};

// Route 4-4: GET /search_authors
// return all authors that match the given search query with parameters defaulted to those specified in API spec ordered by authors rating count (descending)
// Some default parameters have been provided for you, but you will need to fill in the rest
// TEST CASES:
// http://localhost:8081/search_authors?has_nobel_prize=true
// http://localhost:8081/search_authors?search_string=R&country=United%20Kingdom&gender=female&zodiac_sign=Leo&has_nobel_prize=false&born_year_start=1950&born_year_end=1990&average_rating_low=4.0&average_rating_high=4.5&most_popular_genre=fantasy,history
const search_authors = async function (req, res) {
 const searchString = req.query.search_string ?? "";
 const averageRatingLow = Number(req.query.average_rating_low ?? 0.0);
 const averageRatingHigh = Number(req.query.average_rating_high ?? 5.0);
 const ratingCountMin = Number(
   req.query.rating_count_min ?? (searchString ? 0 : 5000)
 );
 const ratingCountMax = Number(req.query.rating_count_max ?? 25000000);
 const country = parseCsvParam(req.query.country);
 const gender = parseCsvParam(req.query.gender);
 const zodiacSign = parseCsvParam(req.query.zodiac_sign);
 const hasNobelPrize =
   req.query.has_nobel_prize === "true"
     ? true
     : req.query.has_nobel_prize === "false"
     ? false
     : null;
 const bornYearStart = req.query.born_year_start
   ? parseInt(req.query.born_year_start, 10)
   : 1680;
 const bornYearEnd = req.query.born_year_end
   ? parseInt(req.query.born_year_end, 10)
   : 2012;
 const genres = parseCsvParam(req.query.most_popular_genre);
 const sortOrder = req.query.sort_order ?? "rating_count_desc";
 const params = [
   averageRatingLow,
   averageRatingHigh,
   ratingCountMin,
   ratingCountMax,
   bornYearStart,
   bornYearEnd,
 ];

 const addParam = (value) => {
   params.push(value);
   return `$${params.length}`;
 };

 let baseQuery = `
   SELECT author_id, name, country, gender, zodiac_sign, most_popular_genre, average_rating, rating_count, has_nobel_prize, image_url
   FROM Author_Search_View
   WHERE average_rating >= $1
     AND average_rating <= $2
     AND rating_count >= $3
     AND rating_count <= $4
     AND EXTRACT(YEAR FROM born_date) BETWEEN $5 AND $6
 `;

 if (country.length > 0) {
   baseQuery += ` AND country = ANY(${addParam(country)}::text[]) `;
 }

 if (gender.length > 0) {
   baseQuery += ` AND gender = ANY(${addParam(gender)}::text[]) `;
 }

 if (zodiacSign.length > 0) {
   baseQuery += ` AND zodiac_sign = ANY(${addParam(zodiacSign)}::text[]) `;
 }

 if (hasNobelPrize !== null) {
   baseQuery += ` AND has_nobel_prize = ${addParam(hasNobelPrize)} `;
 }

 if (genres.length > 0) {
   baseQuery += ` AND most_popular_genre = ANY(${addParam(genres)}::text[]) `;
 }

 if (searchString) {
   const searchLikeParam = addParam(`%${searchString}%`);
   const searchExactParam = addParam(searchString);
   baseQuery += `
     AND (name ILIKE ${searchLikeParam} OR author_id::text = ${searchExactParam})
   `;
 }

 baseQuery += ` ORDER BY `;
 switch (sortOrder) {
   case "name_asc":
     baseQuery += "name";
     break;
   case "name_desc":
     baseQuery += "name DESC";
     break;
   case "average_rating_desc":
     baseQuery += "average_rating DESC";
     break;
   default:
     baseQuery += "rating_count DESC";
 }

 const result = await executeQuery(res, "search_authors", baseQuery, params);
 if (!result) {
   return;
 }

 return res.status(200).json(result.rows);
};

/*********************
 * LOGIN PAGE ROUTES *
 *********************/
const bcrypt = require("bcrypt");
const passportGoogle = require("./googleAuth");
const passportFacebook = require("./facebookAuth");

const getFrontendBaseUrl = (req) => {
  const host = req.get("host") || "";

  if (host.includes("localhost:8081") || host.includes("127.0.0.1:8081")) {
    return "http://localhost:3000";
  }

  return "";
};

const appendQueryParam = (url, key, value) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
};

// Route 5-1: POST /login
// send user login request by verifying user email and password regarding to the record in users table, if credentials are valid, then send success response with user details and a redirectURL
// else, send an erro message for the missing or invalid inputs or internal error message.
const login = async (req, res) => {
  const { email, password, redirectUrl } = req.body;
  try {
    // check if either email or password is missing
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await connection.query(query, [email]);

    // check if no user is found with the provided email
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    //compare the password with hased password and return error message if email or password is invalid
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    //return request status and a success message, user details, and redirect URL
    return res
      .status(200)
      .json({ message: "Login successful", user, redirectUrl });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred during login" });
  }
};

// Route 5-2: POST /signup
// send user registration request for the website, check if user already exist, hash password and insert user into the users table
const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    //check if email, password and name are provided from user
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const checkQuery = "SELECT * FROM users WHERE email = $1";
    const checkResult = await connection.query(checkQuery, [email]);
    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await connection.query(insertQuery, [
      name,
      email,
      hashedPassword,
    ]);
    /// If the insertion is successful, return a success response with the user details
    return res
      .status(201)
      .json({ message: "Signup successful", user: result.rows[0] });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "An error occurred during signup" });
  }
};

// Route 5-3: GET /api/google
// set up middleware function to start Google OAuth login process
const googleLogin = (req, res, next) => {
  passportGoogle.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

// Route 5-4: GET /api/google/callback
// checks if the user exists in the database, if so redirects them to front end with their user details
// if error happened, user redirected to the client with an error message.
const googleRoutes = (req, res) => {
  const redirectUrl = req.query.redirectUrl || "/";
  const frontendBaseUrl = getFrontendBaseUrl(req);

  passportGoogle.authenticate(
    "google",
    { session: false },
    async (err, user) => {
      if (err || !user) {
        console.error("Google authentication error:", err);
        return res.redirect(`${frontendBaseUrl}/?error=Google+login+failed`);
      }

      const { email, name } = user;

      try {
        // fetch userId from the database
        const query = "SELECT id FROM users WHERE email = $1";
        const result = await connection.query(query, [email]);

        if (result.rows.length === 0) {
          console.error("User not found in database.");
          return res.redirect(`${frontendBaseUrl}/?error=User+not+found`);
        }

        const id = result.rows[0].id;
        const targetUrl = `${frontendBaseUrl}${redirectUrl}`;

        // redirect with id, name, and email
        res.redirect(
          appendQueryParam(targetUrl, "user", JSON.stringify({ id, name, email }))
        );
      } catch (error) {
        console.error("Database error fetching user ID:", error);
        res.redirect(`${frontendBaseUrl}/?error=Server+error`);
      }
    }
  )(req, res);
};

// Route 5-5: GET /api/facebook
// set up middleware function to start Facebook OAuth login process
const facebookLogin = (req, res, next) => {
  passportFacebook.authenticate("facebook", { scope: ["email"] })(
    req,
    res,
    next
  );
};

// Route 5-6: GET /api/facebook/callback
// checks if the user exists in the database, if so redirects them to front end with their user details
// if error happened, user redirected to the client with an error message.
const facebookRoutes = (req, res) => {
  const redirectUrl = req.query.redirectUrl || "/";
  const frontendBaseUrl = getFrontendBaseUrl(req);

  passportFacebook.authenticate(
    "facebook",
    { session: false },
    async (err, user) => {
      if (err || !user) {
        console.error("Facebook authentication error:", err);
        return res.redirect(`${frontendBaseUrl}/?error=Facebook+login+failed`);
      }

      const { email, name } = user;

      try {
        // fetch id from the database
        const query = "SELECT id FROM users WHERE email = $1";
        const result = await connection.query(query, [email]);

        if (result.rows.length === 0) {
          console.error("User not found in database.");
          return res.redirect(`${frontendBaseUrl}/?error=User+not+found`);
        }

        const id = result.rows[0].id;
        const targetUrl = `${frontendBaseUrl}${redirectUrl}`;

        // Redirect with id, name, and email
        res.redirect(
          appendQueryParam(targetUrl, "user", JSON.stringify({ id, name, email }))
        );
      } catch (error) {
        console.error("Database error fetching user ID:", error);
        res.redirect(`${frontendBaseUrl}/?error=Server+error`);
      }
    }
  )(req, res);
};

//Route 5-7: POST /add_to_gallery/:user_id
//check if book already exists in the user gallery, if not, add book into user's book gallery
//Using postman to test api request
const addBookToGallery = async (req, res) => {
  const { user_id } = req.params;
  const { bookId } = req.body;

  if (!user_id || !bookId) {
    return res.status(400).json({ error: "Missing user ID or book ID" });
  }

  try {
    // check if the book already exists in the user's gallery
    const checkQuery = `
      SELECT 1 FROM galleries WHERE user_id = $1 AND book_id = $2;
    `;
    const checkResult = await connection.query(checkQuery, [user_id, bookId]);

    if (checkResult.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Book already exists in the gallery" });
    }

    // else, insert the book into the gallery
    const insertQuery = `
      INSERT INTO galleries (user_id, book_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await connection.query(insertQuery, [user_id, bookId]);
    res.status(201).json({ message: "Book added to gallery" });
  } catch (error) {
    console.error("Error adding book to gallery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Route 5-8: GET /gallery/:user_id
//Return the list of books that user collected
//Test case: http://localhost:8081/gallery/2
const getGallery = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  try {
    const query = `
      SELECT b.book_id, b.average_rating, b.rating_count, b.genre,
       b.title, b.author_name, b.has_nobel_prize, b.book_type, b.image_url
      FROM galleries g
      JOIN all_books_views_top_genre b ON g.book_id = b.book_id
      WHERE g.user_id = $1;
    `;
    const { rows } = await connection.query(query, [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Route 5-9: GET /gallery/genres/:user_id
//Return the count per genres for a specific user
//Test case: http://localhost:8081/gallery/genres/2
const getGalleryGenres = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user ID" });
  }
  try {
    const query = `
      SELECT b.genre, COUNT(b.genre)
      FROM galleries g JOIN all_books_views_top_genre b ON g.book_id =b.book_id
      WHERE g.user_id =$1 
      GROUP BY b.genre
    `;
    const { rows } = await connection.query(query, [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Route 5-10: GET /gallery/recommendations/:user_id
//Recommend unsaved books using the user's gallery genre mix and similar-book signals.
const getGalleryRecommendations = async (req, res) => {
  const { user_id } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(req.query.page_size, 10) || 10, 1),
    50
  );

  if (!user_id) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  try {
    const query = `
      WITH user_books AS (
        SELECT g.book_id
        FROM galleries g
        WHERE g.user_id = $1
      ), user_genres AS (
        SELECT b.genre, COUNT(*) AS genre_count
        FROM user_books ub
        JOIN all_books_views_top_genre b ON ub.book_id = b.book_id
        GROUP BY b.genre
      ), genre_quota_seed AS (
        SELECT
          genre,
          genre_count,
          genre_count::numeric / SUM(genre_count) OVER () AS genre_ratio,
          (genre_count::numeric / SUM(genre_count) OVER ()) * $3 AS exact_quota
        FROM user_genres
      ), genre_quota_base AS (
        SELECT
          genre,
          GREATEST(1, FLOOR(exact_quota)::int) AS base_quota,
          exact_quota - FLOOR(exact_quota) AS quota_remainder
        FROM genre_quota_seed
      ), genre_quotas AS (
        SELECT
          genre,
          base_quota + CASE
            WHEN ROW_NUMBER() OVER (ORDER BY quota_remainder DESC, genre) <=
              GREATEST($3 - SUM(base_quota) OVER (), 0)
            THEN 1
            ELSE 0
          END AS quota
        FROM genre_quota_base
      ), candidates AS (
        SELECT
          b.book_id,
          b.average_rating,
          b.rating_count,
          b.genre,
          b.title,
          b.author_name,
          b.has_nobel_prize,
          b.book_type,
          b.image_url,
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM similar_to s
              JOIN user_books ub ON s.source_book_id = ub.book_id
              WHERE s.similar_book_id = b.book_id
            ) THEN 3.0
            ELSE 2.0 * COALESCE(b.average_rating::numeric, 0) / 5.0
          END AS recommendation_score
        FROM all_books_views_top_genre b
        JOIN genre_quotas gq ON b.genre = gq.genre
        WHERE NOT EXISTS (
          SELECT 1
          FROM user_books ub
          WHERE ub.book_id = b.book_id
        )
      ), ranked_candidates AS (
        SELECT
          candidates.*,
          gq.quota,
          ROW_NUMBER() OVER (
            PARTITION BY candidates.genre
            ORDER BY recommendation_score DESC, average_rating DESC, rating_count DESC, book_id
          ) AS genre_rank
        FROM candidates
        JOIN genre_quotas gq ON candidates.genre = gq.genre
      ), candidate_counts AS (
        SELECT genre, COUNT(*) AS candidate_count
        FROM candidates
        GROUP BY genre
      ), recommendation_meta AS (
        SELECT
          COALESCE(SUM(candidate_count), 0)::int AS total_count,
          COALESCE(MAX(CEIL(candidate_count::numeric / NULLIF(gq.quota, 0))), 0)::int AS total_pages
        FROM candidate_counts cc
        JOIN genre_quotas gq ON cc.genre = gq.genre
      ), paged_recommendations AS (
        SELECT *
        FROM ranked_candidates
        WHERE genre_rank > (($2 - 1) * quota)
          AND genre_rank <= ($2 * quota)
      )
      SELECT
        book_id,
        average_rating,
        rating_count,
        genre,
        title,
        author_name,
        has_nobel_prize,
        book_type,
        image_url,
        recommendation_score,
        (SELECT total_count FROM recommendation_meta) AS total_count,
        (SELECT total_pages FROM recommendation_meta) AS total_pages
      FROM paged_recommendations
      ORDER BY recommendation_score DESC, average_rating DESC, rating_count DESC, book_id;
    `;
    const { rows } = await connection.query(query, [user_id, page, pageSize]);
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    const totalPages = rows.length > 0 ? Number(rows[0].total_pages) : 0;
    const books = rows.map(({ total_count, total_pages, ...book }) => book);

    res.status(200).json({
      books,
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching gallery recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Route 5-11: GET /gallery/added_per_day/:user_id
//Return the count of book that one specific user added per day
//Test case: http://localhost:8081/gallery/added_per_day/2
const getGalleryAddedPerDay = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user ID" });
  }
  try {
    const query = `
    SELECT TO_CHAR(DATE(added_at), 'YYYY-MM-DD') AS added_date, COUNT(*) AS books_added
    FROM galleries
    WHERE user_id = $1
    GROUP BY DATE(added_at)
    ORDER BY added_date;`;
    const { rows } = await connection.query(query, [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Route 5-11: DELETE /remove_from_gallery/:user_id
//Remove book from user gallery
//Using postman to test api request
const removeBookFromGallery = async (req, res) => {
  const { user_id } = req.params;
  const { bookId } = req.body;

  if (!user_id || !bookId) {
    return res.status(400).json({ error: "User ID and Book ID are required." });
  }

  try {
    const result = await connection.query(
      "DELETE FROM galleries WHERE user_id = $1 AND book_id = $2",
      [user_id, bookId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Book not found in gallery." });
    }

    res
      .status(200)
      .json({ message: "Book removed from gallery successfully." });
  } catch (error) {
    console.error("Error removing book from gallery:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Export routes
module.exports = {
  recommend_daily_book,
  recommend_daily_ebook,
  recommend_daily_author,
  top_books_by_average_rating,
  top_books_by_rating_count,
  nobel_authors,
  full_text,
  books_count,
  authors_count,
  ebooks_count,
  users_count,
  author_info,
  author_books,
  search_authors,
  search_books,
  get_similar_authors,
  display_top_review,
  display_top_rated_books,
  top_books_fiction,
  top_books_romance,
  top_books_biography,
  top_books_non_fiction,
  top_books_crime,
  top_books_fantasy,
  top_books_young_adult,
  top_books_children,
  top_books_comics,
  top_books_poetry,
  book_info,
  get_similar_books,
  get_book_reviews,
  ebook_info,
  get_similar_ebooks,
  get_ebook_reviews,
  login,
  signup,
  googleRoutes,
  googleLogin,
  facebookLogin,
  facebookRoutes,
  addBookToGallery,
  getGallery,
  getGalleryGenres,
  getGalleryRecommendations,
  getGalleryAddedPerDay,
  removeBookFromGallery,
};
