import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./OnlineReadingPage.module.css";
import { apiUrl } from "../api";


const OnlineReadingPage = () => {
  const { book_id: bookId } = useParams();
  const [fullText, setFullText] = useState("");
  const [bookTitle, setBookTitle] = useState(""); // State for the book title
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Set default font size 18px
  const [inputPage, setInputPage] = useState(""); // State for specific page input

  const itemsPerPage = 10; // Number of paragraphs per page

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        // Fetch the full text of the book
        const response = await fetch(apiUrl(`/ebooks/${bookId}/full_text`));
        const data = await response.json();

        if (data.full_text) {
          setFullText(data.full_text);
        } else {
          setError(data.message || "Full text not available for this book.");
        }

        // Fetch the book's title
        const bookResponse = await fetch(apiUrl(`/ebooks/${bookId}`));
        const bookData = await bookResponse.json();

        if (bookData.title) {
          setBookTitle(bookData.title); // Set the title of the book
        } else {
          setError("Book title not available.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while loading the content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (loading) {
    return <p>Loading full text...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  const paragraphs = fullText.split("\n").filter((p) => p.trim() !== ""); // Split text into paragraphs
  const totalPages = Math.ceil(paragraphs.length / itemsPerPage);
  const paginatedText = paragraphs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFontSizeChange = (change) => {
    setFontSize((prevSize) => Math.min(Math.max(prevSize + change, 14), 24)); // Limit font size between 14px and 24px
  };

  // Navigate to a specific page
  const handlePageInputChange = (e) => {
    const value = e.target.value;
    setInputPage(value);
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
    setInputPage(""); // Clear the input after navigation
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
      <header className={styles.header}>
        <h1>Book Title: {bookTitle || "Loading..."}</h1>
        <div className={styles.controls}>
          {/* Dark Mode Toggle */}
          <button
            className={styles.toggleButton}
            onClick={() => setIsDarkMode((prevMode) => !prevMode)}
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {/* Font Size Controls */}
          <button
            className={styles.fontButton}
            onClick={() => handleFontSizeChange(-2)}
          >
            A-
          </button>
          <button
            className={styles.fontButton}
            onClick={() => handleFontSizeChange(2)}
          >
            A+
          </button>
        </div>
      </header>

      <article
        className={styles.textContent}
        style={{ fontSize: `${fontSize}px` }}
      >
        {paginatedText.map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </article>

      <footer className={styles.footer}>
        {/* First Page Button */}
        <button
          className={styles.paginationButton}
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          First Page
        </button>

        {/* Previous Page Button */}
        <button
          className={styles.paginationButton2}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Page Button */}
        <button
          className={styles.paginationButton2}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>

        {/* Last Page Button */}
        <button
          className={styles.paginationButton}
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last Page
        </button>

        {/* Go to Specific Page */}
        <div>
          <input
            type="number"
            value={inputPage}
            min="1"
            max={totalPages}
            onChange={handlePageInputChange}
            placeholder="Go to page"
            className={styles.pageInput}
          />
          <button
            onClick={handleGoToPage}
            className={styles.paginationButton}
            disabled={!inputPage || inputPage < 1 || inputPage > totalPages}
          >
            Go
          </button>
        </div>
      </footer>
    </div>
  );
};

export default OnlineReadingPage;
