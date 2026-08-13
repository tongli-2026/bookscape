import React from "react";
import Rating from "@mui/material/Rating";
import { Button } from "@mui/material";
import styles from "./EBookMain.module.css";
import AddToGalleryButton from "../AddToGalleryButton";

const EBookMain = ({
  bookId,
  title,
  imageSrc,
  description,
  reviewCount,
  averageRating,
  user
}) => {
  return (
    <div className={styles.bookMain}>
      <div className={styles.contentWrapper}>
        {/* EBook Image */}
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

        {/* EBook Info */}
        <div className={styles.infoColumn}>
          <div className={styles.infoWrapper}>
            {/* EBook Title */}
            <h1 className={styles.bookTitle}>{title}</h1>

            {/* Rating and Review Count and Read Online Button */}
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
                  <div  style={{ margin: "8px" }}>
                  <AddToGalleryButton
                    bookId={bookId}
                    userId={user?.id || null}
                  />
                </div>
                </div>
              </div>

              {/* Online Reading Button */}
              <Button
                variant="contained"
                href={`/read/${bookId}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: "14px",
                  background: "#6c5dd3",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#fff",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  padding: "10px 16px",
                  fontWeight: 600,
                  fontSize: "14px",
                  fontFamily: "'Open Sans', sans-serif",
                  transition: "background-color 0.3s ease, transform 0.2s ease",
                  cursor: "pointer",
                  marginLeft: "auto",
                  marginRight: "16px",
                  "&:hover": {
                    background: "#584bc2",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Read Online
              </Button>

            </div>

            {/* EBook Description */}
            <div
              className={styles.bookDescription}
              dangerouslySetInnerHTML={{ __html: description }}
            />

            <div className={styles.divider} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookMain;
