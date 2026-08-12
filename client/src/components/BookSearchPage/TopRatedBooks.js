import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import SimpleBook from "./SimpleBook";
import { apiUrl } from "../../api";


const styles = {
  container: {
    padding: "20px 0",
  },
  swiper: {
    padding: "0 20px",
    "--swiper-navigation-color": "#6C5DD3",
  },
  swiperSlide: {
    display: "flex",
    justifyContent: "center",
    maxWidth: "300px",
    width: "100%",
    cursor: "pointer",
  },
};

export const TopRatedBooks = ({ search_string }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch top-rated books whenever search string changes
  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        const queryString = new URLSearchParams({ search_string }).toString();
        const response = await fetch(
          apiUrl(`/display_top_rated_books?${queryString}`)
        );
        const data = await response.json();
        setBooks(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top-rated books:", error);
        setLoading(false);
      }
    };

    fetchTopBooks();
  }, [search_string]);

  if (loading) {
    return <div>Loading top-rated books...</div>;
  }

  // Check if any book is available
  if (!books || books.length === 0) {
    return <div>No top-rated books available based on your search.</div>;
  }

  const handleBookClick = (bookId, media) => {
    if (media === "Ebook") {
      window.open(`/ebook/${bookId}`, "_blank");
    } else {
      window.open(`/books/${bookId}`, "_blank");
    }
  };

  // Use swiper to display top 10 books
  return (
    <div style={styles.container}>
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
        initialSlide={Math.floor(books.length / 2)}
        spaceBetween={-100}
        slidesPerView="auto"
        style={styles.swiper}
      >
        {books.map((book,index) => (
          <SwiperSlide
            key={`${book.book_id}-${index}`}
            onClick={() => handleBookClick(book.book_id, book.book_type)}
            style={styles.swiperSlide}
          >
            <SimpleBook book={book} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
