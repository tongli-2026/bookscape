import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";
import EBookMain from "../components/EBookInfoPage/EBookMain";
import EBookTable from "../components/EBookInfoPage/EBookTable";
import SimilarEBooks from "../components/EBookInfoPage/SimilarEBooks";
import EBookReviews from "../components/EBookInfoPage/EBookReviews";
import styles from "./EBookInfoPage.module.css";
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

export default function EBookInfoPage() {
  const { book_id: bookId } = useParams();
  const [ebookInfo, setEBookInfo] = useState(null);
  const [similarEBooks, setSimilarEBooks] = useState([]);
  const [ebookReviews, setEBookReviews] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));


  // get ebook information and set ebookInfo
  useEffect(() => {
    fetchData(apiUrl(`/ebooks/${bookId}`), setEBookInfo);
    fetchData(apiUrl(`/get_similar_ebooks/${bookId}`), setSimilarEBooks);
    fetchData(apiUrl(`/get_ebook_reviews/${bookId}`), setEBookReviews);
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
          {/* EBookMain */}
          {ebookInfo ? (
            <EBookMain
              bookId={bookId}
              title={ebookInfo.title}
              imageSrc={ebookInfo.image_url}
              description={ebookInfo.description}
              reviewCount={ebookInfo.review_num}
              averageRating={ebookInfo.avg_rating}
              user={user}
            />
          ) : (
            <p>Loading ebook details...</p>
          )}

          <div className={styles.contentRow}>
            {/* EBookTable */}
            <div className={styles.bookTableContainer}>
              {ebookInfo && <EBookTable book={ebookInfo} />}
            </div>

            {/* SimilarEBooks */}
            {similarEBooks && similarEBooks.length > 0 && (
              <div className={styles.similarBooksContainer}>
                <SimilarEBooks books={similarEBooks} />
              </div>
            )}
          </div>

        {/* EBookReviews */}
        {ebookReviews && ebookReviews.length > 0 && (
          <div className={styles.bookReviews}>
            <h2 className={styles.sectionTitle}>Selected EBook Reviews</h2>
            <EBookReviews reviews={ebookReviews} />
          </div>
        )}

          
        </main>
      </div>
    </Container>
  );
}
