import React, { useState, useEffect } from "react";
import { Container, MenuItem, Select, Pagination } from "@mui/material";
import FilterOptions from "../components/AuthorSearchPage/FilterOptions";
import AuthorCard from "../components/AuthorSearchPage/AuthorCard";
import { useSearchParams } from "react-router-dom";
import { apiUrl } from "../api";

export default function AuthorSearchPage() {
  const [searchParamsURL] = useSearchParams();
  const searchQuery = searchParamsURL.get("search_string") || "";

  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("rating_count_desc");
  const [searchParams, setSearchParams] = useState({
    search_string: "",
    country: [],
    gender: [],
    zodiac_sign: [],
    genres: [],
    has_nobel_prize: [],
    born_year_start: 1900,
    born_year_end: 2023,
    average_rating_low: 2,
    average_rating_high: 5,
    rating_count_min: 5000,
    rating_count_max: 25000000,
    sort_order: "rating_count_desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const authorsPerPage = 15;

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(
        apiUrl(`/search_authors?${queryString}`)
      );
      const data = await response.json();
      setAuthors(data);
      setLoading(false);
    };

    fetchAuthors();
  }, [searchParams]);

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      search_string: searchQuery,
    }));
  }, [searchQuery]);

  const handleFilter = (filters) => {
    setCurrentPage(1); // Reset to page 1
    setSearchParams({
      ...searchParams,
      country: filters.country,
      gender: filters.gender,
      zodiac_sign: filters.zodiacSign,
      most_popular_genre: filters.genres,
      has_nobel_prize: filters.hasNobelPrize,
      born_year_start: filters.bornYear[0],
      born_year_end: filters.bornYear[1],
      average_rating_low: filters.averageRating[0],
      average_rating_high: filters.averageRating[1],
      rating_count_min: filters.ratingCount[0],
      rating_count_max: filters.ratingCount[1],
    });
  };

  const handleReset = () => {
    setCurrentPage(1); // Reset to page 1
    setSearchParams({
      search_string: "",
      country: [],
      gender: [],
      zodiac_sign: [],
      genres: [],
      has_nobel_prize: [],
      born_year_start: 1900,
      born_year_end: 2023,
      average_rating_low: 2,
      average_rating_high: 5,
      rating_count_min: 5000,
      rating_count_max: 25000000,
      sort_order: "rating_count_desc",
    });
  };

  const handleSort = (event) => {
    setSortOrder(event.target.value);
    setSearchParams({ ...searchParams, sort_order: event.target.value });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastAuthor = currentPage * authorsPerPage;
  const indexOfFirstAuthor = indexOfLastAuthor - authorsPerPage;
  const currentAuthors = authors.slice(indexOfFirstAuthor, indexOfLastAuthor);

  const handleAuthorClick = (authorId) => {
    window.open(`/authors/${authorId}`, "_blank");
  };

  return (
    <div className="author-search-page">
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

        <div
          style={{
            flex: "3",
            maxWidth: "75%",
            minWidth: "0",
          }}
        >
          {/* Authors Section */}
          <div className="authors-section">
            {loading ? (
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
                Loading authors...
              </div>
            ) : authors.length === 0 ? (
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
                🤯 No authors found! Adjust the filters to discover great authors.
              </div>
            ) : (
              <>
                <div
                  className="authors-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2>Authors</h2>
                  <Select
                    value={sortOrder}
                    onChange={handleSort}
                    className="sort-select"
                  >
                    <MenuItem value="rating_count_desc">Popularity</MenuItem>
                    <MenuItem value="average_rating_desc">Highest Rated</MenuItem>
                    <MenuItem value="name_asc">Name A-Z</MenuItem>
                    <MenuItem value="name_desc">Name Z-A</MenuItem>
                  </Select>
                </div>
                {/* Author Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {currentAuthors.map((author) => (
                    <div
                      key={author.author_id}
                      onClick={() => handleAuthorClick(author.author_id)}
                      style={{ cursor: "pointer" }}
                    >
                      <AuthorCard author={author} />
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                <Pagination
                  count={Math.ceil(authors.length / authorsPerPage)}
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
    </div>
  );
}
