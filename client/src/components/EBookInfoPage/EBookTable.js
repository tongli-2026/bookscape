import React, { useState } from "react";
import styles from "./EBookTable.module.css";

const capitalize = (value) =>
  value && typeof value === "string"
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;

const EBookTable = ({ book }) => {
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  const toggleViewMoreAuthors = () => {
    setShowAllAuthors(!showAllAuthors);
  };

  if (!book) {
    return <p>Loading ebook details...</p>;
  }

  const authorsToDisplay = Array.isArray(book.author_list)
    ? showAllAuthors
      ? book.author_list
      : book.author_list.slice(0, 2)
    : [];

  const bookData = [
    { label: "EBook Title", value: book.title || "N/A" },
    {
      label: "Authors",
      value: (
        <div className={styles.authorsWrapper}>
          {authorsToDisplay.length ? (
            <>
              {authorsToDisplay.map(([authorId, authorName, authorRole]) => (
                <div key={authorId} className={styles.authorItem}>
                  <a
                    href={`/authors/${authorId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit" }}
                  >
                    {authorName} ({capitalize(authorRole || "Major Author")})
                  </a>
                </div>
              ))}
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
    { label: "ISBN", value: book.isbn || "N/A" },
    { label: "ASIN", value: book.asin || "N/A" },
    {
      label: "Kindle Link",
      value: book.amazon_url ? (
        <a
          href={book.amazon_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit" }}
        >
          View on Amazon
        </a>
      ) : (
        "N/A"
      ),
    },
    { label: "Pages", value: book.num_pages || "N/A" },
    { label: "Published Year", value: book.publication_year || "N/A" },
    { label: "Publisher", value: book.publisher || "N/A" },
    { label: "Genres", value: book.genre_list?.join(", ") || "N/A" },
  ].filter((item) => item.value);

  return (
    <div className={styles.container}>
      <h1 className={styles.sectionTitle}>EBook Details</h1>
      {bookData.map((item, index) => (
        <div key={index} className={styles.row}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>
            {typeof item.value === "string" ? capitalize(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default EBookTable;
