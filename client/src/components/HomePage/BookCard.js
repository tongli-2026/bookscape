import React from "react";
import styles from "./BookCard.module.css";
import AddToGalleryButton from "../AddToGalleryButton";

// Get logged-in user
const user = JSON.parse(localStorage.getItem("user"));

export default function BookCard({ bookId, imageUrl, title, rating }) {
  return (
    <article className={styles.bookCard}>
      {/* open the book detail page in a new tab */}
      <a
        href={`/book/${bookId}`} // Link to the detailed book page
        target="_blank" // Open link in a new tab or window
        rel="noopener noreferrer"
        className={styles.bookLink}
      >
        <img
          loading="lazy"
          src={imageUrl}
          alt={`Cover of ${title}`}
          className={styles.bookCover}
        />
        <h3 className={styles.bookTitle}>{title}</h3>
      </a>
      <div className={styles.rating}>
        <div className={styles.ratingWrapper}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/9e120824c633d0c522dfa33568176c481a8a1b83169ca1f40fa7e2aaffd28389?placeholderIfAbsent=true&apiKey=df57f1d37f2b43ec892d3602b6cba143"
            alt="Rating icon"
            className={styles.ratingIcon}
          />
          <span className={styles.ratingValue}>{rating}</span>
        </div>
        <AddToGalleryButton bookId={bookId} userId={user?.id || null} />
      </div>
    </article>
  );
}
