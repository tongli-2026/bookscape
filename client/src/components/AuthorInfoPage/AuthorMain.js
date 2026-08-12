import React from "react";
import Rating from "@mui/material/Rating"; 
import styles from "./AuthorMain.module.css";

const AuthorMain = ({
  name = "Unknown Author",
  imageSrc,
  about = "No biography available.",
  averageRating = 0,
  ratingCount = 0,
  website,
  hasNobelPrize = false,
  awardYear,
}) => {
  return (
    <div className={styles.authorMain}>
      <div className={styles.contentWrapper}>
        {/* Author Image */}
        <div className={styles.imageColumn}>
          <div className={styles.authorImageContainer}>
            <img
              loading="lazy"
              src={
                imageSrc ||
                "https://via.placeholder.com/398x560?text=No+Image+Available"
              }
              alt={`${name} author portrait`}
              className={styles.authorImage}
            />
            {hasNobelPrize && (
              <div className={styles.nobelBadge} aria-label="Nobel Prize Winner">
                {awardYear ? `Nobel ${awardYear}` : "Nobel"}
              </div>
            )}
          </div>
        </div>

        {/* Author Info */}
        <div className={styles.infoColumn}>
          <div className={styles.infoWrapper}>
            {/* Author Name */}
            <h1 className={styles.authorName}>{name}</h1>

            {/* Rating and Website */}
            <div className={styles.statsWrapper}>
              <div className={styles.ratingContainer}>
                <div className={styles.ratingWrapper}>
                  {/* Use Material-UI Rating Component */}
                  <Rating
                    name="author-rating"
                    value={averageRating}
                    precision={0.1}
                    readOnly
                    size="medium"
                    sx={{ color: "#FF754C" }}
                  />
                  <div className={styles.averageRating}>{averageRating}</div>
                  <div className={styles.reviewCount}>
                    ({ratingCount.toLocaleString()} Ratings)
                  </div>
                </div>
              </div>
              <div
                className={
                  website
                    ? styles.websiteButton
                    : styles.disabledWebsiteButton
                }
                role={website ? "link" : "presentation"}
              >
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/d545c0a7d0ea4e97ac84884ab03ca107/c791b5db32fee1106821ddf0c95be2a93a403da9ad64d3b862a6d7730a43b55a?apiKey=d545c0a7d0ea4e97ac84884ab03ca107&"
                  className={styles.websiteIcon}
                  alt="Website Icon"
                />
                <div>
                  {website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </a>
                  ) : (
                    "Website"
                  )}
                </div>
              </div>
            </div>

            {/* Author About Text */}
            <div
              className={styles.biography}
              dangerouslySetInnerHTML={{ __html: about }}
            />

            <div className={styles.divider} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorMain;
