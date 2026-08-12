import React, { useEffect, useState } from 'react';
import { Pagination } from '@mui/material';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { apiUrl } from "../api";

import BookCard from '../components/HomePage/BookCard';
import InfoCard from '../components/HomePage/InfoCard';
import NobelPrizeWinner from '../components/HomePage/NobelPrizeWinner';
import Stats from '../components/HomePage/Stats';
import Footer from '../components/HomePage/Footer';
import styles from './HomePage.module.css';


// Utility function for fetching data
const fetchData = async (url, setState) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    setState(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Custom hook for pagination
const usePagination = (data, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return {
    currentPage,
    currentItems,
    totalPages: Math.ceil(data.length / itemsPerPage),
    handlePageChange
  };
};

// Year range mapping for Nobel Authors Section
const yearRanges = [
  { label: "2024 - 2020", range: [2020, 2024], value: "2020-2024" },
  { label: "2019 - 2010", range: [2010, 2019], value: "2010-2019" },
  { label: "2009 - 2000", range: [2000, 2009], value: "2000-2009" },
  { label: "1999 - 1990", range: [1990, 1999], value: "1990-1999" },
  { label: "1989 - 1980", range: [1980, 1989], value: "1980-1989" },
  { label: "1979 - 1970", range: [1970, 1979], value: "1970-1979" },
  { label: "1969 - 1960", range: [1960, 1969], value: "1960-1969" },
  { label: "1959 - 1950", range: [1950, 1959], value: "1950-1959" },
  { label: "1949 - 1940", range: [1940, 1949], value: "1940-1949" },
  { label: "1939 - 1930", range: [1930, 1939], value: "1930-1939" },
  { label: "1929 - 1920", range: [1920, 1929], value: "1920-1929" },
  { label: "1919 - 1910", range: [1910, 1919], value: "1910-1919" },
  { label: "1909 - 1901", range: [1901, 1909], value: "1901-1909" },
  { label: "All Years", range: [1901, 2024], value: "1901-2024" },
];


export default function HomePage() {
  // Manage active tab
  const [activeTab, setActiveTab] = useState("book");
  // State for Daily Recommended Book
  const [dailyBook, setDailyBook] = useState([]);
  // State for Daily Recommended eBook
  const [dailyEBook, setDailyEBook] = useState([]);
  // State for Daily Recommended Author
  const [dailyAuthor, setDailyAuthor] = useState([]);

  // Render active tab for different daily recommended elements
  const renderTabContent = () => {
    switch (activeTab) {
      case "book":
        return (
          dailyBook.length > 0 && (<InfoCard type="book" data={dailyBook} />)
        );
      case "ebook":
        return (
          dailyEBook.length > 0 && (<InfoCard type="ebook" data={dailyEBook} />)
        );
      case "author":
        return (
          dailyAuthor.length > 0 && (<InfoCard type="author" data={dailyAuthor} />)
        );
      default:
        return null;
    }
  };

  // State for Top 10 Books
  const [topBooks, setTopBooks] = useState([]);

  // State for Popular Books
  const [popularBooks, setPopularBooks] = useState([]);
  const popularBooksPagination = usePagination(popularBooks, 6);

  // State for Nobel Winners
  const [nobelWinners, setNobelWinners] = useState([]);
  const [selectedYearRange, setSelectedYearRange] = useState("2020-2024");
  const [filteredNobelWinners, setFilteredNobelWinners] = useState([]);
  

  useEffect(() => {
    // Fetch Daily Recommended Book data
    fetchData(apiUrl("/books/recommend_daily"), (data) =>
      setDailyBook(data.map((book) => ({
        id: book.book_id,
        title: book.title,
        rating: book.average_rating,
        image: book.image_url,
        description: book.description,
      })))
    );
    
    // Fetch Daily Recommended eBook data
    fetchData(apiUrl("/ebooks/recommend_daily"), (data) =>
      setDailyEBook(data.map((ebook) => ({
        id: ebook.book_id,
        title: ebook.title,
        rating: ebook.average_rating,
        image: ebook.image_url,
        description: ebook.description,
      })))
    );

    // Fetch Daily Recommended Author data
    fetchData(apiUrl("/authors/recommend_daily"), (data) =>
      setDailyAuthor(data.map((author) => ({
        id: author.author_id,
        title: author.name,
        rating: author.average_rating,
        image: author.image_url,
        description: author.about,
      })))
    );

    // Fetch Top 10 Books data
    fetchData(apiUrl("/books/top_average_rating"), (data) =>
      setTopBooks(data.map((book) => ({
        bookId: book.book_id,
        title: book.title,
        rating: book.average_rating,
        image: book.image_url,
      })))
    );

    // Fetch Popular Books data
    fetchData(apiUrl("/books/top_rating_count"), (data) =>
      setPopularBooks(data.map((book) => ({
        bookId: book.book_id,
        title: book.title,
        rating: book.average_rating,
        image: book.image_url
      })))
    );

    // Fetch Nobel Winners data
    fetchData(apiUrl("/nobel_authors"), (data) =>
      setNobelWinners(data.map((author) => ({
        authorId: author.author_id,
        author: author.name,
        year: author.award_year,
        citation: author.motivation,
        rating: author.average_rating,
        image: author.image_url
      })))
    );
  }, []);

  useEffect(() => {
    const filtered = nobelWinners.filter((winner) => {
      if (!selectedYearRange || selectedYearRange === "1901-2024") return true;
      const [start, end] = selectedYearRange.split("-").map(Number);
      return winner.year >= start && winner.year <= end;
    });
    setFilteredNobelWinners(filtered);
  }, [selectedYearRange, nobelWinners]);

  const nobelWinnersPagination = usePagination(filteredNobelWinners, 5);

  return (
    <div className={styles.page}>
      <main className={styles.mainContent}>
        {/* Daily Recommendations Section */}
        <section className={styles.featuredSection}>
          <h2 className={styles.sectionTitle}>Today's Special Recommendations For You</h2>
          <div className={styles.categoryTabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "book" ? styles.active : ""}`}
              onClick={() => setActiveTab("book")}
            >
              Book
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "ebook" ? styles.active : ""}`}
              onClick={() => setActiveTab("ebook")}
            >
              eBook
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "author" ? styles.active : ""}`}
              onClick={() => setActiveTab("author")}
            >
              Author
            </button>
          </div>
          <div className={styles.tabContent}>{renderTabContent()}</div>
        </section>

        {/* Top 10 Books Section */}
        <section className={styles.popularBooks}>
          <h2 className={styles.sectionTitle2}>Top 10 Books For You</h2>
          <p className={styles.sectionDescription}>
            Explore our handpicked top 10 books, featuring highly-rated titles.
            These books are curated to bring the best of our collection to your fingertips.
          </p>

          {topBooks.length === 0 ? (
            <div className={styles.noBooks}>
              <p>Loading top books...</p>
            </div>
          ) : (
            <div className={styles.booksGrid}>
              <Swiper
                modules={[Navigation, EffectCoverflow]}
                navigation
                loop={true}
                effect="coverflow"
                coverflowEffect={{
                  rotate: 25,
                  stretch: 10,
                  depth: 100,
                  modifier: 1,
                  slideShadows: true,
                }}
                centeredSlides={true}
                initialSlide={Math.floor(topBooks.length / 2)}
                spaceBetween={-100}
                slidesPerView="auto"
                style={{
                  padding: "0 40px",
                  "--swiper-navigation-color": "#6C5DD3",
                }}
              >
                {topBooks.map((book) => (
                  <SwiperSlide
                    key={book.bookId}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "250px",
                    }}
                  >
                    <BookCard
                      bookId={book.bookId}
                      title={book.title}
                      rating={book.rating}
                      imageUrl={book.image}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </section>


        {/* Popular Books Section */}
        <section className={styles.popularBooks}>
          <h2 className={styles.sectionTitle}>Popular Books For You</h2>
          <div className={styles.booksGrid}>
            {popularBooksPagination.currentItems.length > 0 ? (
              popularBooksPagination.currentItems.map(({ bookId, title, rating, image }) => (
                <div key={bookId} className={styles.bookCardWrapper}>
                  <BookCard bookId={bookId} title={title} rating={rating} imageUrl={image} />
                </div>
              ))
            ) : (
              <p className={styles.noBooks}>Loading popular books...</p>
            )}
          </div>
          {/* Pagination */}
          <Pagination
            count={popularBooksPagination.totalPages}
            page={popularBooksPagination.currentPage}
            onChange={popularBooksPagination.handlePageChange}
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "right",
              marginBottom: "16px",
            }}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#6c5dd3",
              },
            }}
          />
        </section>

        {/* Nobel Winners Section */}
        <section className={styles.nobelSection}>
          <h2 className={styles.sectionTitle2}>Nobel Prize Winners Across the Years</h2>
          <p className={styles.sectionDescription}>
            Explore Nobel Laureates in Literature and celebrate their lasting impact on readers worldwide. Use the filter to view authors from specific decades.
          </p>
          {/* Year Range Filter */}
          <div className={styles.rightAlignedContainer}>
            <div className={styles.yearLabel}>Award Year:</div>
            <select 
              value={selectedYearRange} 
              onChange={(e) => setSelectedYearRange(e.target.value)}
              className={styles.filterDropdown}
            >
              {yearRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          {/* Nobel Winners List */}
          <div className={styles.nobelGrid}>
            {filteredNobelWinners.length > 0 ? (
              nobelWinnersPagination.currentItems.map((winner) => (
                <NobelPrizeWinner
                  key={winner.authorId}
                  authorId={winner.authorId}
                  author={winner.author}
                  year={winner.year}
                  citation={winner.citation}
                  rating={winner.rating}
                  image={winner.image}
                />
              ))
            ) : (
              <p>No Nobel Prize winners found for the selected range.</p>
            )}
          </div>
          {/* Pagination */}
          <Pagination
            count={nobelWinnersPagination.totalPages}
            page={nobelWinnersPagination.currentPage}
            onChange={nobelWinnersPagination.handlePageChange}
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "right",
              marginBottom: "16px",
            }}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#6c5dd3",
              },
            }}
          />
        </section>

        {/* Statistics Section */}
        <Stats />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}
