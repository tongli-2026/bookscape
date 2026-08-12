import React from "react";
import Rating from "@mui/material/Rating";
import styles from "./BookMain.module.css";
import AddToGalleryButton from "../AddToGalleryButton";

const BookMain = ({
  title,
  imageSrc,
  description,
  reviewCount,
  averageRating,
  bookId,
  user
}) => {
  // Ensure safe description fallback
  const safeDescription =
    description && description.trim().toLowerCase() !== "nan"
      ? description
      : "This book does not have a description.";

  return (
    <div className={styles.bookMain}>
      <div className={styles.contentWrapper}>
        {/* Book Image */}
        <div className={styles.imageColumn}>
          <div className={styles.bookImageContainer}>
            <img
              loading="lazy"
              src={
                imageSrc ||
                "https://via.placeholder.com/398x560?text=No+Image+Available"
              }
              alt={`${title} cover`}
              className={styles.bookImage}
            />
          </div>
        </div>

        {/* Book Info */}
        <div className={styles.infoColumn}>
          <div className={styles.infoWrapper}>
            {/* Book Title */}
            <h1 className={styles.bookTitle}>{title}</h1>

            {/* Rating and Review Count */}
            <div className={styles.statsWrapper}>
              <div className={styles.ratingContainer}>
                <div className={styles.ratingWrapper}>
                  {/* Use Material-UI Rating Component */}
                  <Rating
                    name="book-rating"
                    value={averageRating}
                    precision={0.1}
                    readOnly
                    size="medium"
                    sx={{ color: "#FF754C" }}
                  />
                  <div className={styles.averageRating}>{averageRating}</div>
                  <div className={styles.reviewCount}>
                    ({reviewCount.toLocaleString()} Reviews)
                  </div>
                </div>
                <div  style={{ margin: "8px" }}>
                  <AddToGalleryButton
                    bookId={bookId}
                    userId={user?.id || null}
                  />
                </div>
              </div>
            </div>

            {/* Book Description */}
            <div
              className={styles.bookDescription}
              dangerouslySetInnerHTML={{ __html: safeDescription }}
            />

            <div className={styles.divider} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookMain;
