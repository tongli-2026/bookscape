import React, { useState } from "react";
import Rating from "@mui/material/Rating"; 
import styles from "./SimilarAuthors.module.css";

const SimilarAuthors = ({ authors }) => {
  const [showAll, setShowAll] = useState(false);

  const toggleViewMore = () => {
    setShowAll(!showAll);
  };

  const authorsToShow = showAll ? authors : authors.slice(0, 3);

  if (!authors || authors.length === 0) {
    return <p>Loading similar authors...</p>;
  }

  return (
    <div className={styles.similarAuthorsContainer}>
      <h2 className={styles.sectionTitle}>Similar Authors</h2>
      <div className={styles.authorsList}>
        {authorsToShow.map((author) => (
          <a
            href={`/authors/${author.author_id}`}
            target="_blank"
            rel="noopener noreferrer"
            key={author.author_id}
            className={styles.authorLink}
          >
            <div className={styles.authorCard}>
              <img
                src={author.image_url}
                alt={author.name}
                className={styles.authorImage}
              />
              <div className={styles.authorDetails}>
                <h3 className={styles.authorName}>{author.name}</h3>
                <p className={styles.authorGenres}>{author.genres}</p>

                {/* Star Rating */}
                <div className={styles.ratingWrapper}>
                  <Rating
                    name={`author-rating-${author.author_id}`}
                    value={author.average_rating}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{ color: "#FF754C" }}
                  />
                  <div className={styles.authorRating}>
                    {author.average_rating} 
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      {authors.length > 3 && (
        <button className={styles.viewMoreButton} onClick={toggleViewMore}>
          {showAll ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
};

export default SimilarAuthors;
