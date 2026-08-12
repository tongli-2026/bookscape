import React, { useState, useEffect } from "react";
import SimpleBook from "./SimpleBook";
import { Rating } from "@mui/material";
import { apiUrl } from "../../api";


const styles = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  bookContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "100px",
    marginBottom: "20px",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  reviewContainer: {
    flex: "1",
    maxWidth: "50%",
  },
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    flexWrap: "nowrap",
    gap: "6px",
  },
  rating: {
    color: "#FF754C",
  },
  reviewRating: {
    fontWeight: "bold",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
  },
  reviewText: {
    fontWeight: "bold",
    fontSize: "18px",
    whiteSpace: "nowrap",
  },
  reviewBody: {
    fontSize: "16px",
    lineHeight: "1.5",
  },
  bookCard: {
    flex: "1",
    maxWidth: "50%",
    cursor: "pointer",
  },
};

export const TopReview = ({ search_string }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch top-rated review whenever search string changes
  useEffect(() => {
    const fetchTopReview = async () => {
      try {
        const queryString = new URLSearchParams({ search_string }).toString();
        const response = await fetch(
          apiUrl(`/display_top_review?${queryString}`)
        );
        const data = await response.json();
        setBooks(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top-rated books:", error);
        setLoading(false);
      }
    };

    fetchTopReview();
  }, [search_string]);

  if (loading) {
    return <div>Loading top-rated review...</div>;
  }

  // Check if any book is available
  if (!books || books.length === 0) {
    return <div>No top-rated review available based on your search.</div>;
  }

  const handleBookClick = (bookId, media) => {
    if (media === "Ebook") {
      window.open(`/ebook/${bookId}`, "_blank");
    } else {
      window.open(`/books/${bookId}`, "_blank");
    }
  };

  return (
    <div style={styles.container}>
      {books.map((book, index) => (
        <div key={book.book_id} style={styles.bookContainer}>
          {/* display review text */}
          <div style={styles.reviewContainer}>
            <div style={styles.reviewHeader}>
              <Rating
                value={parseFloat(book.average_rating)}
                precision={0.1}
                readOnly
                sx={styles.rating}
              />
              <span style={styles.reviewRating}>
                {parseFloat(book.review_rating).toFixed(1)}
              </span>
              <span style={styles.reviewText}>Top-Rated Review</span>
            </div>
            <div style={styles.reviewBody}>{book.review_text}</div>
          </div>

          {/* display bookcard use SimpleBook component */}
          <div
            onClick={() => handleBookClick(book.book_id, book.book_type)}
            style={styles.bookCard}
          >
            <SimpleBook book={book} />
          </div>
        </div>
      ))}
    </div>
  );
};
