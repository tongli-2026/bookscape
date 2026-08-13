import React from 'react';
import PropTypes from 'prop-types';
import styles from './InfoCard.module.css';
import AddToGalleryButton from "../AddToGalleryButton";

const InfoCard = ({ type, data }) => {
  if (!data || data.length === 0) return null; // Avoid rendering if no data is available

  const { id, image, title, rating, description } = data[0];

  // Determine URL based on type and id
  const getDetailsUrl = () => {
    switch (type) {
      case 'ebook':
        return `/ebook/${id}`;  // Navigate to the ebook detail page
      case 'book':
        return `/book/${id}`;    // Navigate to the book detail page
      case 'author':
        return `/author/${id}`;  // Navigate to the author detail page
      default:
        return '/';
    }
  };

  const handleSeeDetailsClick = () => {
    const url = getDetailsUrl();
    window.open(url, '_blank', 'noopener,noreferrer'); // Open the details page in a new window
  };

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoContent}>
        <div className={styles.coverImageWrapper}>
          <img loading="lazy" src={image} className={styles.coverImage} alt={title} />
        </div>
        <div className={styles.details}>
          <div className={styles.info}>
            <div className={styles.titleRatingContainer}>
              <h3 className={styles.title}>{title}</h3>
              {rating && (
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
                </div>
              )}
            </div>
            {description && <p className={styles.bookDescription} dangerouslySetInnerHTML={{ __html: description }} />}

            <div className={styles.actionContainer}>
              <button onClick={handleSeeDetailsClick} className={styles.readButton}>See Details</button>
              {["book", "ebook"].includes(type) && (
                <AddToGalleryButton bookId={id} userId={user?.id || null} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

InfoCard.propTypes = {
  type: PropTypes.string.isRequired, // Can be 'book', 'ebook', or 'author'
  data: PropTypes.array.isRequired, // The data for the type (book, ebook, or author)
};

export default InfoCard;
