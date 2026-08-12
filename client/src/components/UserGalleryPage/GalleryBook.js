import React, { useState } from "react";
import { Rating } from "@mui/material";
import RemoveFromGalleryButton from "../RemoveFromGalleryButton";

const styles = {
  bookCard: {
    position: "relative",
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
    height: "500px",
  },
  bookCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  bookCoverContainer: {
    position: "relative",
    borderRadius: "14px",
    width: "250px",
    height: "375px",
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
    margin: "18px 0 8px",
    lineHeight: "1.2",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    width: "100%",
  },
  bookGenre: {
    color: "#6c5dd3",
    fontFamily: "Open Sans, sans-serif",
    marginBottom: "5px",
    fontSize: "14px",
  },
  authorName: {
    textAlign: "center",
    fontWeight: "300",
    margin: "12px 0 0",
    fontSize: "14px",
    color: "#4e4b66",
  },
  ratingWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  ratingContainer: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
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
  removeButtonContainer: {
    position: "absolute",
    top: "0px",
    right: "0px",
  },
};

export default function GalleryBook({ book, onBookRemoved }) {
  const [isHovered, setIsHovered] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // Navigate to BookInfo Page
  const handleBookClick = (bookId, media) => {
    if (media === "Ebook") {
      window.open(`/ebook/${bookId}`, "_blank");
    } else {
      window.open(`/books/${bookId}`, "_blank");
    }
  };

  return (
    <article
      style={{
        ...styles.bookCard,
        ...(isHovered ? styles.bookCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleBookClick(book.book_id, book.book_type)}
    >
      {/*added remove from gallery button*/}
      <div
        style={styles.removeButtonContainer}
        onClick={(event) => event.stopPropagation()}
      >
        <RemoveFromGalleryButton
          bookId={book.book_id}
          userId={user?.id || null}
          onBookRemoved={onBookRemoved}
        />
      </div>

      {/*bookcard container for gallery books*/}
      <div style={styles.bookCoverContainer}>
        <img
          src={book.image_url}
          alt={`Book cover for ${book.title}`}
          style={{
            ...styles.bookCover,
            ...(isHovered ? styles.bookCoverHover : {}),
          }}
        />
        {book.has_nobel_prize && (
          <div style={styles.nobelBadge} aria-label="Nobel Prize Winner">
            Nobel
          </div>
        )}
      </div>
      <h2 style={styles.bookTitle}>{book.title}</h2>
      <p style={styles.bookGenre}>{book.genre}</p>
      <div style={styles.ratingWrapper}>
        <Rating
          value={book.average_rating}
          precision={0.1}
          readOnly
          sx={{ color: "#FF754C" }}
        />
        <span style={styles.averageRating}>{book.average_rating}</span>
      </div>
      <p style={styles.authorName}>{book.author_name}</p>
    </article>
  );
}
