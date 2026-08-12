import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";
import AuthorMain from "../components/AuthorInfoPage/AuthorMain";
import AuthorTable from "../components/AuthorInfoPage/AuthorTable";
import SimilarAuthors from "../components/AuthorInfoPage/SimilarAuthors";
import AuthorBooks from "../components/AuthorInfoPage/AuthorBooks";
import styles from "./AuthorInfoPage.module.css";
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

export default function AuthorInfoPage() {
  const { author_id: authorId } = useParams();
  const [authorInfo, setAuthorInfo] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [similarAuthors, setSimilarAuthors] = useState([]);

  useEffect(() => {
    fetchData(apiUrl(`/authors/${authorId}`), setAuthorInfo);
    fetchData(apiUrl(`/author_books/${authorId}`), setAuthorBooks);
    fetchData(apiUrl(`/get_similar_authors/${authorId}`), setSimilarAuthors);
  }, [authorId]);

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "20px",
        margin: "0 auto",
        width: "87.5%",
        maxWidth: "2000px", 
      }}
    >
      <div className={styles.page}>
        <main className={styles.mainContent}>
          {/* AuthorMain */}
          {authorInfo ? (
            <AuthorMain
              name={authorInfo.name}
              imageSrc={authorInfo.image_url}
              about={authorInfo.about}
              averageRating={authorInfo.average_rating}
              ratingCount={authorInfo.rating_count}
              website={authorInfo.website}
              hasNobelPrize={authorInfo.has_nobel_prize}
              awardYear={authorInfo.award_year}
            />
          ) : (
            <p>Loading author details...</p>
          )}

          <div className={styles.contentRow}>
            {/* AuthorTable */}
            <div className={styles.authorTableContainer}>
              {authorInfo && <AuthorTable author={authorInfo} />}
            </div>

            {/* SimilarAuthors */}
            {similarAuthors && similarAuthors.length > 0 && (
              <div className={styles.similarAuthorsContainer}>
                <SimilarAuthors authors={similarAuthors} />
              </div>
            )}
          </div>

          {/* AuthorBooks */}
          {authorBooks && authorBooks.length > 0 && (
            <div className={styles.authorBooks}>
              <h2 className={styles.sectionTitle}>
                Top Books by {authorInfo ? authorInfo.name : "this Author"}
              </h2>
              <AuthorBooks books={authorBooks} />
            </div>
          )}
        </main>
      </div>
    </Container>
  );
}
