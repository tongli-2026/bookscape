import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import styles from "./SimilarEBooks.module.css";

const SimilarEBooks = ({ books }) => {
  const [showAll, setShowAll] = useState(false);

  const toggleViewMore = () => {
    setShowAll(!showAll);
  };

  const booksToShow = showAll ? books : books.slice(0, 2);

  if (!books || books.length === 0) {
    return <p>Loading similar ebooks...</p>;
  }

  return (
    <div className={styles.similarBooksContainer}>
      <h2 className={styles.sectionTitle}>Similar Books</h2>
      <div className={styles.booksList}>
        {booksToShow.map((book) => (
          <a
            href={`/ebook/${book.book_id}`}
            target="_blank"
            rel="noopener noreferrer"
            key={book.book_id}
            className={styles.bookLink}
          >
            <div className={styles.bookCard}>
                <img
                    src={book.image_url}
                    alt={book.title}
                    className={styles.bookCover}
                />
                <div className={styles.bookDetails}>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookGenres}>
                  {book.genre_list?.length ? book.genre_list.join(", ") : "No genres available"}
                  </p>

                  {/* Star Rating */}
                  <div className={styles.ratingWrapper}>
                    <Rating
                      name={`book-rating-${book.book_id}`}
                      value={book.avg_rating}
                      precision={0.1}
                      readOnly
                      size="small"
                      sx={{ color: "#FF754C" }}
                    />
                    <div className={styles.bookRating}>
                      {book.avg_rating}
                    </div>
                  </div>
                </div>
            </div>
          </a>
        ))}
      </div>
      {books.length > 2 && (
        <button className={styles.viewMoreButton} onClick={toggleViewMore}>
          {showAll ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
};

export default SimilarEBooks;
