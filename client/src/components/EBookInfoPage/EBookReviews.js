import React from "react";
import styles from "./EBookReviews.module.css";

// Function to get emoji based on the rating
const getEmoji = (rating) => {
  return rating > 3 ? "😊" : "😢"; // smiley for positive, sad for negative
};

// Function to render stars based on rating
const renderStars = (rating) => {
  return (
    <div className={styles.ratingContainer}>
      <div className={styles.ratingWrapper}>
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={index < Math.floor(rating) ? "#FF754C" : "#F0F0F0"}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <div className={styles.averageRating}>{rating || "0"}</div>
    </div>
  );
};

const EBookReviews = ({ reviews }) => {
  // Filter positive and negative reviews
  const positiveReview = reviews.find((review) => review.rating > 3);
  const negativeReview = reviews.find((review) => review.rating <= 3);

  return (
    <div className={styles.selectedReviewsContainer}>
      {positiveReview && (
        <div className={styles.reviewContainer}>
          <div className={styles.reviewHeader}>
            {renderStars(positiveReview.rating)} {/* Render stars for positive review */}
            <span className={styles.reviewEmoji}>{getEmoji(positiveReview.rating)}</span>
          </div>
          {/* Positive Review Text */}
          <div
            className={styles.reviewText}
            dangerouslySetInnerHTML={{ __html: positiveReview.review_text }}
          />
        </div>
      )}

      {negativeReview && (
        <div className={styles.reviewContainer}>
          <div className={styles.reviewHeader}>
            {renderStars(negativeReview.rating)} {/* Render stars for negative review */}
            <span className={styles.reviewEmoji}>{getEmoji(negativeReview.rating)}</span>
          </div>
          {/* Negative Review Text */}
          <div
            className={styles.reviewText}
            dangerouslySetInnerHTML={{ __html: negativeReview.review_text }}
          />
        </div>
      )}
    </div>
  );
};

export default EBookReviews;
