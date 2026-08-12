import React, { useEffect, useState } from 'react';
import { Pagination } from '@mui/material';
import { apiUrl } from "../api";

import BookCard from '../components/BookRecommendPage/BookCard';
import Stats from '../components/HomePage/Stats';
import Footer from '../components/HomePage/Footer';
import styles from './BookRecommendPage.module.css';


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
    handlePageChange,
  };
};

const genres = [
  { key: 'fiction', title: 'Top Fiction Books' },
  { key: 'romance', title: 'Top Romance Books' },
  { key: 'biography', title: 'Top Biography Books' },
  { key: 'non_fiction', title: 'Top Non-Fiction Books' },
  { key: 'crime', title: 'Top Crime Books' },
  { key: 'fantasy', title: 'Top Fantasy Books' },
  { key: 'young_adult', title: 'Top Young Adult Books' },
  { key: 'children', title: 'Top Children Books' },
  { key: 'comics', title: 'Top Comics Books' },
  { key: 'poetry', title: 'Top Poetry Books' },
];

const BookRecommendationPage = () => {
  const [genreBooks, setGenreBooks] = useState({});

  // Initialize a usePagination hook for each genre explicitly
  const fictionPagination = usePagination(genreBooks.fiction || [], 6);
  const romancePagination = usePagination(genreBooks.romance || [], 6);
  const biographyPagination = usePagination(genreBooks.biography || [], 6);
  const nonFictionPagination = usePagination(genreBooks.non_fiction || [], 6);
  const crimePagination = usePagination(genreBooks.crime || [], 6);
  const fantasyPagination = usePagination(genreBooks.fantasy || [], 6);
  const youngAdultPagination = usePagination(genreBooks.young_adult || [], 6);
  const childrenPagination = usePagination(genreBooks.children || [], 6);
  const comicsPagination = usePagination(genreBooks.comics || [], 6);
  const poetryPagination = usePagination(genreBooks.poetry || [], 6);

  // Map each genre to its corresponding pagination
  const paginations = {
    fiction: fictionPagination,
    romance: romancePagination,
    biography: biographyPagination,
    non_fiction: nonFictionPagination,
    crime: crimePagination,
    fantasy: fantasyPagination,
    young_adult: youngAdultPagination,
    children: childrenPagination,
    comics: comicsPagination,
    poetry: poetryPagination,
  };

  useEffect(() => {
    genres.forEach(({ key }) => {
      fetchData(
        apiUrl(`/recommend_books/top_${key}`),
        (data) => {
          setGenreBooks((prev) => ({
            ...prev,
            [key]: data.map((book) => ({
              bookId: book.book_id,
              title: book.title,
              rating: book.average_rating,
              image: book.image_url,
            })),
          }));
        }
      );
    });
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.mainContent}>
        {genres.map(({ key, title }) => {
          const { currentItems, totalPages, currentPage, handlePageChange } =
            paginations[key];
          return (
            <section key={key} className={styles.popularBooks}>
              <h2 className={styles.sectionTitle}>{title}</h2>
              <div className={styles.booksGrid}>
                {currentItems.length > 0 ? (
                  currentItems.map(({ bookId, title, rating, image }) => (
                    <div key={bookId} className={styles.bookCardWrapper}>
                      <BookCard bookId={bookId} title={title} rating={rating} imageUrl={image} />
                    </div>
                  ))
                ) : (
                  <p className={styles.noBooks}>Loading books...</p>
                )}
              </div>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'right',
                  marginBottom: '16px',
                }}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#6c5dd3',
                  },
                }}
              />
            </section>
          );
        })}
        <Stats />
      </main>
      <Footer />
    </div>
  );
};

export default BookRecommendationPage;

