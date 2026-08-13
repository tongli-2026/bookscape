import React, { useState } from "react";
import styles from "./BookTable.module.css";

// Helper function to capitalize the first letter of a string
const capitalize = (value) => {
  if (!value || typeof value !== "string") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// BookTable Component
const BookTable = ({ book }) => {
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  const toggleViewMoreAuthors = () => {
    setShowAllAuthors(!showAllAuthors);
  };

  if (!book) {
    return <p>Loading book details...</p>;
  }

  // Limit authors to the first 2, or show all based on the toggle state
  const authorsToDisplay = showAllAuthors ? book.author_list : book.author_list?.slice(0, 2);

  const bookData = [
    { label: "Book Title", value: book.title },
    {
      label: "Authors",
      value: (
        <div className={styles.authorsWrapper}>
          {book.author_list?.length ? (
            <>
              {authorsToDisplay.map(([authorId, authorName, authorRole], index) => (
                <div key={authorId} className={styles.authorItem}>
                  <a
                    href={`/author/${authorId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "inherit", 
                    }}
                  >
                    {authorName} ({capitalize(authorRole || "Major Author")})
                  </a>
                </div>
              ))}

              {/* View More Button */}
              {book.author_list.length > 2 && (
                <button
                  className={styles.viewMoreButton}
                  onClick={toggleViewMoreAuthors}
                >
                  {showAllAuthors ? "View Less" : "View More"}
                </button>
              )}
            </>
          ) : (
            "N/A"
          )}
        </div>
      ),
    },
    { label: "ISBN", value: book.isbn },
    { label: "Pages", value: book.num_pages },
    { label: "Published Year", value: book.publication_year },
    { label: "Publisher", value: book.publisher },
    { label: "Genres", value: book.genre_list?.join(", ") },
  ].filter((item) => item.value);

  return (
    <div className={styles.container}>
      <h1 className={styles.sectionTitle}>Book Details</h1>
      {bookData.map((item, index) => (
        <div key={index} className={styles.row}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{capitalize(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default BookTable;
