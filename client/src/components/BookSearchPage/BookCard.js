import React, { useState } from "react";
import Rating from "@mui/material/Rating";

const styles = {
  bookCard: {
    borderRadius: "14px",
    border: "1px solid #f0f0f0",
    background: "#fff",
    display: "flex",
    width: "100%",
    maxWidth: "300px",
    flexDirection: "column",
    alignItems: "center",
    color: "#11142d",
    margin: "0 auto",
    padding: "20px 23px",
    fontFamily: "Cairo, sans-serif",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    cursor: "pointer",
    justifyContent: "space-between",
    height: "450px",
  },
  bookCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  bookCoverContainer: {
    position: "relative",
    borderRadius: "14px",
    width: "100%",
    aspectRatio: "0.67",
    overflow: "hidden",
  },
  bookCover: {
    position: "absolute",
    inset: "0",
    height: "100%",
    width: "100%",
    objectFit: "cover",
    borderRadius: "14px",
    transition: "transform 0.3s ease",
  },
  bookCoverHover: {
    transform: "scale(1.05)",
  },
  nobelBadge: {
    position: "absolute",
    top: "10px",
    left: "0",
    borderRadius: "0 20px 20px 0",
    background: "#ff754c",
    padding: "8px 16px",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    zIndex: "1",
  },
  bookTitle: {
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "700",
    margin: "5px",
    lineHeight: "2",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    width: "100%",
  },
  bookGenre: {
    color: "#6c5dd3",
    fontFamily: "Open Sans, sans-serif",
    margin: "5px",
    fontSize: "14px",
  },
  authorName: {
    textAlign: "center",
    fontWeight: "300",
    margin: "5px",
    fontSize: "14px",
    color: "#4e4b66",
  },
  ratingWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
  },
  ratingCount: {
    color: "#6e7191",
    fontSize: "14px",
  },
  averageRating: {
    color: "#ff754c",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default function BookCard({ book }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      style={{
        ...styles.bookCard,
        ...(isHovered ? styles.bookCardHover : {}),
      }}
      // update hover state on mouse
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container for the book cover image */}
      <div style={styles.bookCoverContainer}>
        <img
          src={book.image_url}
          alt={`Book cover for ${book.title}`}
          style={{
            ...styles.bookCover,
            ...(isHovered ? styles.bookCoverHover : {}),
          }}
        />
        {/* Display Nobel badge if the book is a Nobel Prize winner */}
        {book.has_nobel_prize && (
          <div style={styles.nobelBadge} aria-label="Nobel Prize Winner">
            Nobel
          </div>
        )}
      </div>
      {/* Display book title, genre, rating, average rating, rating count and author name */}
      <h2 style={styles.bookTitle}>{book.title}</h2>
      <p style={styles.bookGenre}>{book.genre}</p>
      <div style={styles.ratingWrapper}>
        <Rating
          name="book-rating"
          value={parseFloat(book.average_rating)}
          precision={0.1}
          readOnly
          size="medium"
          sx={{ color: "#FF754C" }}
        />
        <span style={styles.averageRating}>{book.average_rating}</span>
      </div>

      <div style={styles.ratingCount}>  ({book.rating_count.toLocaleString()}) </div>
      
      <p style={styles.authorName}>{book.author_name}</p>
    </article>
  );
}
