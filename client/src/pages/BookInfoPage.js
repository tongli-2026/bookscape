import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";
import BookMain from "../components/BookInfoPage/BookMain";
import BookTable from "../components/BookInfoPage/BookTable";
import SimilarBooks from "../components/BookInfoPage/SimilarBooks";
import BookReviews from "../components/BookInfoPage/BookReviews";
import styles from "./BookInfoPage.module.css";
import { apiUrl } from "../api";


const fetchData = async (url, setState) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    setState(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default function BookInfoPage() {
  const { book_id: bookId } = useParams();
  const [bookInfo, setBookInfo] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [bookReviews, setBookReviews] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // get book information and set bookInfo
  useEffect(() => {
    fetchData(apiUrl(`/books/${bookId}`), setBookInfo);
    fetchData(apiUrl(`/get_similar_books/${bookId}`), setSimilarBooks);
    fetchData(apiUrl(`/get_book_reviews/${bookId}`), setBookReviews);
  }, [bookId]);

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "20px",
        margin: "0 auto",
        width: "87.5%",
        maxWidth: "1920px", 
      }}
    >
      <div className={styles.page}>
        <main className={styles.mainContent}>
          {/* BookMain */}
          {bookInfo ? (
            <BookMain
              title={bookInfo.title}
              imageSrc={bookInfo.image_url}
              description={bookInfo.description}
              reviewCount={bookInfo.review_num}
              averageRating={bookInfo.avg_rating}
              bookId={bookId}
              user={user}
            />
          ) : (
            <p>Loading book details...</p>
          )}

          <div className={styles.contentRow}>
            {/* BookTable */}
            <div className={styles.bookTableContainer}>
              {bookInfo && <BookTable book={bookInfo} />}
            </div>

            {/* SimilarBooks */}
            {similarBooks && similarBooks.length > 0 && (
              <div className={styles.similarBooksContainer}>
                <SimilarBooks books={similarBooks} />
              </div>
            )}
          </div>

        {/* BookReviews */}
        {bookReviews && bookReviews.length > 0 && (
          <div className={styles.bookReviews}>
            <h2 className={styles.sectionTitle}>Selected Book Reviews</h2>
            <BookReviews reviews={bookReviews} />
          </div>
        )} 
        </main>
      </div>
    </Container>
  );
}
