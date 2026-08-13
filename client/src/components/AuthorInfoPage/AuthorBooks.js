import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import SimpleBook from "./SimpleBook";
import styles from "./AuthorBooks.module.css";

const AuthorBooks = ({ books }) => {
  if (!books || books.length === 0) {
    return <p className={styles.noBooks}>No books available.</p>;
  }

  // Duplicate books if there are only two for Swiper loop
  const booksForSwiper = books.length === 2 ? [...books, ...books] : books;

  // Navigate to BookInfo Page
  const handleBookClick = (bookId) => {
    window.open(`/book/${bookId}`, "_blank"); 
  };

  return (
    <div className={styles.bookSliderContainer}>
      {books.length === 1 ? (
        // Render a single book without Swiper
        <div
          onClick={() => handleBookClick(books[0].book_id)}
          style={{
            display: "flex",
            justifyContent: "center",
            maxWidth: "300px",
            margin: "0 auto",
            cursor: "pointer",
          }}
        >
          <SimpleBook book={books[0]} />
        </div>
      ) : (
        // Render multiple books with Swiper
        <Swiper
          modules={[Navigation, EffectCoverflow]}
          navigation
          effect="coverflow"
          loop={true} 
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          centeredSlides={true}
          initialSlide={Math.floor(booksForSwiper.length / 2)}
          spaceBetween={-100}
          slidesPerView="auto"
          style={{ padding: "0 20px", "--swiper-navigation-color": "#6C5DD3" }}
        >
          {booksForSwiper.map((book, index) => (
            <SwiperSlide
              key={`${book.book_id}-${index}`} // Add index to avoid duplicate keys
              onClick={() => handleBookClick(book.book_id)}
              style={{
                display: "flex",
                justifyContent: "center",
                maxWidth: "300px",
                width: "100%",
                cursor: "pointer",
              }}
            >
              <SimpleBook book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default AuthorBooks;
