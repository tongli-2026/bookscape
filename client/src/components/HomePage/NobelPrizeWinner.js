import React, { useState } from "react"; 
import Rating from "@mui/material/Rating";
import styles from "./NobelPrizeWinner.module.css";

const NobelPrizeWinner = ({ authorId, author, year, citation, rating, image }) => {
  const [isHovered, setIsHovered] = useState(false); // Handling hover state

  // Ensure the rating value is valid
  const safeRating = rating >= 0 ? rating : 0;

  return (
    <a
      href={`/authors/${authorId}`} // Link to the author's individual page
      target="_blank" // Open link in a new tab or window
      rel="noopener noreferrer" // Security for external links
      className={`${styles.nobelCard} ${isHovered ? styles.hovered : ""}`} // Apply hovered class when hovered
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
    >
      <img
        loading="lazy"
        src={image || "https://via.placeholder.com/150?text=No+Image"}
        className={styles.authorImage}
        alt={`Portrait of ${author}`}
      />
      <div className={styles.info}>
        <h3 className={styles.authorName}>{author}</h3>
        <p className={styles.year}>{year}</p>
        <p
          className={styles.citation}
          dangerouslySetInnerHTML={{ __html: `Prize motivation: "${citation}".` }}
        ></p>
        <div className={styles.rating}>
          {/* Integrated Rating Stars */}
          <div className={styles.ratingWrapper}>
            <Rating
              name={`rating-${authorId}`}
              value={parseFloat(safeRating)}
              precision={0.1}
              readOnly
              size="medium"
              sx={{ color: "#FF754C" }}
            />
            <span className={styles.averageRating}>{safeRating}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default NobelPrizeWinner;
