import React, { useState, useEffect, useMemo } from "react";
import { Container, MenuItem, Select, Pagination } from "@mui/material";
import FilterOptions from "../components/BookSearchPage/FilterOptions";
import BookCard from "../components/BookSearchPage/BookCard";
import { TopRatedBooks } from "../components/BookSearchPage/TopRatedBooks";
import { TopReview } from "../components/BookSearchPage/TopReview";
import { useSearchParams } from "react-router-dom";
import { apiUrl } from "../api";

const toGenreValue = (genre) => genre.toLowerCase();

export default function BookSearchPage() {
  //use useSearchParams to extract search_string from URL whenever it changed
  const [searchParamsURL] = useSearchParams();

  //read the search_string from URL, compute when necessary
  const searchQuery = useMemo(
    () => searchParamsURL.get("search_string") || "",
    [searchParamsURL]
  );

  // Default states
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("rating_count_desc");
  const [searchParams, setSearchParams] = useState({
    search_string: searchQuery,
    genres: ["fiction"],
    media: ["Book"],
    hasNobelPrize: false,
    pub_year_min: 1930,
    pub_year_max: 2021,
    page_min: 100,
    page_max: 14777,
    rating_count_min: 500,
    rating_count_max: 4899965,
    author_rating_min: 2,
    author_rating_max: 5,
    sort_order: "rating_count_desc",
  });
  // track the current page
  const [currentPage, setCurrentPage] = useState(1);
  // number of books to display per page
  const booksPerPage = 15;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(
        apiUrl(`/search_books?${queryString}`)
      );
      const data = await response.json();
      setBooks(data);
      setLoading(false);
    };

    const debounceFetch = setTimeout(fetchBooks, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchParams, currentPage]);

  // update searchParams when search_string changes so that we can keep existing filter conditions
  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      search_string: searchQuery,
    }));
  }, [searchQuery]);

  // handlers for filter conditions
  const handleFilter = (filters) => {
    setCurrentPage(1);
    setSearchParams({
      ...searchParams,
      genres: filters.categories.length > 0 ? filters.categories.map(toGenreValue) : null,
      media: filters.mediaTypes,
      pub_year_min: filters.publicationYear[0],
      pub_year_max: filters.publicationYear[1],
      page_min: filters.pageCount[0],
      page_max: filters.pageCount[1],
      rating_count_min: filters.ratingCount[0],
      rating_count_max: filters.ratingCount[1],
      author_rating_min: filters.authorRating[0],
      author_rating_max: filters.authorRating[1],
      hasNobelPrize: filters.hasNobelPrize,
    });
  };

  //handlers for reset to default filter condition
  const handleReset = () => {
    setCurrentPage(1);
    // Reset the application state
    setSearchParams({
      search_string: "",
      genres: ["fiction"],
      media: ["Book"],
      pub_year_min: 1930,
      pub_year_max: 2021,
      page_min: 100,
      page_max: 14777,
      rating_count_min: 500,
      rating_count_max: 4899965,
      author_rating_min: 2,
      author_rating_max: 5,
      sort_order: "rating_count_desc",
      hasNobelPrize: false,
    });
  
    // Clear the URL query string
    searchParamsURL.delete("search_string");
    window.history.replaceState({}, "", window.location.pathname);
    window.location.reload();
  };
  

  //handler for sort
  const handleSort = (event) => {
    setSortOrder(event.target.value);
    setSearchParams({ ...searchParams, sort_order: event.target.value });
  };

  //handle for page
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Navigate to BookInfo Page
  const handleBookClick = (bookId, media) => {
    if (media === "Ebook") {
      window.open(`/ebook/${bookId}`, "_blank");
    } else {
      window.open(`/book/${bookId}`, "_blank");
    }
  };

  // calculate num of books to display for the current page
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  return (
    <div className="book-finder-page">
      <Container
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          padding: "0 10px",
          margin: "0 auto",
          width: "87.5%",
          maxWidth: "1920px",
        }}
      >
        {/* Filter Options */}
        <div
          style={{
            flex: "1",
            maxWidth: "25%",
            display: "flex",
            flexDirection: "column",
            minWidth: "200px",
          }}
        >
          <h2>Filter Options</h2>
          <FilterOptions onFilter={handleFilter} onReset={handleReset} />
        </div>

        {/* Books Section */}
        <div
          style={{
            flex: "3",
            maxWidth: "75%",
            minWidth: "0",
          }}
        >
          <div className="books-section">
            {loading ? (
              // Show a loading message or spinner
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                  fontSize: "24px",
                  color: "#6C5DD3",
                }}
              >
                Loading books...
              </div>
            ) : books.length === 0 ? (
              // Show a message when no books are available
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "32px",
                  height: "200px",
                }}
              >
                🤯 Your bookshelf is empty! Adjust the filters to fill it with
                books.
              </div>
            ) : (
              <>
                <div
                  className="books-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2>Books</h2>
                  <Select
                    value={sortOrder}
                    onChange={handleSort}
                    className="sort-select"
                  >
                    <MenuItem value="rating_count_desc">Popular</MenuItem>
                    <MenuItem value="publication_year_desc">Latest</MenuItem>
                    <MenuItem value="title_asc">Title A-Z</MenuItem>
                    <MenuItem value="title_desc">Title Z-A</MenuItem>
                  </Select>
                </div>

                {/* Books Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {currentBooks.map((book) => (
                    <div
                      key={book.book_id}
                      onClick={() =>
                        handleBookClick(book.book_id, book.book_type)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <BookCard book={book} />
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                <Pagination
                  count={Math.ceil(books.length / booksPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
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
              </>
            )}
          </div>
        </div>
      </Container>
      {/* Top Rated Books Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            maxWidth: "87.5%",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              margin: "20px",
            }}
          >
            Top 10 Books with High Rated Reviews & Author
          </h2>
          <TopRatedBooks search_string={searchParams.search_string} />
        </div>
      </div>
      {/* Top Rated Review Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "87.5%",
            marginTop: "100px",
          }}
        >
          <TopReview search_string={searchParams.search_string} />
        </div>
      </div>
    </div>
  );
}
