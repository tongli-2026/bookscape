import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Pagination, Typography, Tabs, Tab } from "@mui/material";
import GalleryBook from "../components/UserGalleryPage/GalleryBook";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { apiUrl } from "../api";

ChartJS.register(
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const styles = {
  container: {
    padding: "28px 0 40px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    width: "87.5%",
    maxWidth: "1500px",
    minHeight: "calc(100vh - 170px)",
    margin: "0 auto",
    overflow: "hidden",
  },
  sidebar: {
    flex: "0 0 180px",
    borderRight: "1px solid #ddd",
    textAlign: "left",
    padding: "10px 12px 10px 0",
  },
  content: {
    flex: 1,
    minWidth: 0,
    padding: "20px 0 20px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "22px",
    textAlign: "center",
  },
  chartContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    height: "60%",
    gap: "20px",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },
  selectedGenre: {
    color: "#6c5dd3",
    fontWeight: 700,
    textTransform: "capitalize",
  },
  section: {
    marginBottom: "34px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "14px",
    textAlign: "left",
  },
  sectionTitle: {
    fontSize: "1.35rem",
    fontWeight: 700,
    color: "#11142d",
    textTransform: "capitalize",
  },
  sectionCount: {
    color: "#6e7191",
    fontSize: "0.95rem",
  },
  booksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "18px",
    padding: "8px 0",
    width: "100%",
    boxSizing: "border-box",
  },
};

const genreLabel = (genre) => genre || "unknown";
const ALL_BOOKS_PAGE_SIZE = 10;
const GENRE_PAGE_SIZE = 5;

const groupBooksByGenre = (books) =>
  books.reduce((groups, book) => {
    const genre = genreLabel(book.genre);
    if (!groups[genre]) {
      groups[genre] = [];
    }
    groups[genre].push(book);
    return groups;
  }, {});

const UserGalleryPage = () => {
  const { user_id } = useParams();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [addedPerDay, setAddedPerDay] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationPage, setRecommendationPage] = useState(1);
  const [recommendationTotalPages, setRecommendationTotalPages] = useState(0);
  const [allBooksPage, setAllBooksPage] = useState(1);
  const [genrePages, setGenrePages] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(apiUrl(`/gallery/${user_id}`));
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        } else {
          console.error("Failed to fetch gallery.");
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      }
    };

    fetchGallery();
  }, [user_id]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(apiUrl(`/gallery/genres/${user_id}`));
        if (response.ok) {
          const data = await response.json();
          setGenres(data);
        } else {
          console.error("Failed to fetch genres.");
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, [user_id]);

  useEffect(() => {
    const fetchAddedPerDay = async () => {
      try {
        const response = await fetch(apiUrl(`/gallery/added_per_day/${user_id}`));
        if (response.ok) {
          const data = await response.json();
          setAddedPerDay(data);
        } else {
          console.error("Failed to fetch books added per day.");
        }
      } catch (error) {
        console.error("Error fetching books added per day:", error);
      }
    };

    fetchAddedPerDay();
  }, [user_id]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          apiUrl(`/gallery/recommendations/${user_id}?page=${recommendationPage}&page_size=10`)
        );
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.books || []);
          setRecommendationTotalPages(data.totalPages || 0);
        } else {
          console.error("Failed to fetch gallery recommendations.");
        }
      } catch (error) {
        console.error("Error fetching gallery recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [user_id, recommendationPage]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBookRemoved = (removedBookId) => {
    setBooks((prevBooks) =>
      prevBooks.filter((book) => book.book_id !== removedBookId)
    );
  };

  const paginateBooks = (items, page, pageSize) => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  const getTotalPages = (items, pageSize) => Math.max(Math.ceil(items.length / pageSize), 1);

  const filteredBooks = useMemo(() => {
    if (!selectedGenre) {
      return books;
    }
    return books.filter((book) => genreLabel(book.genre) === selectedGenre);
  }, [books, selectedGenre]);

  const groupedBooks = useMemo(() => groupBooksByGenre(filteredBooks), [filteredBooks]);

  const sortedGenreNames = useMemo(() => {
    const genreOrder = genres.map((genre) => genre.genre);
    return Object.keys(groupedBooks).sort((a, b) => {
      const orderA = genreOrder.indexOf(a);
      const orderB = genreOrder.indexOf(b);
      if (orderA !== -1 || orderB !== -1) {
        return (orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA) -
          (orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB);
      }
      return a.localeCompare(b);
    });
  }, [genres, groupedBooks]);

  const allBooksTotalPages = getTotalPages(filteredBooks, ALL_BOOKS_PAGE_SIZE);
  const displayedAllBooks = paginateBooks(filteredBooks, allBooksPage, ALL_BOOKS_PAGE_SIZE);

  const handleGenrePageChange = (genre, page) => {
    setGenrePages((prevPages) => ({
      ...prevPages,
      [genre]: page,
    }));
  };

  useEffect(() => {
    setAllBooksPage(1);
    setGenrePages({});
  }, [selectedGenre]);

  const pieData = {
    labels: genres?.map((genre) => genre.genre) || [],
    datasets: [
      {
        data: genres?.map((genre) => genre.count) || [],
        backgroundColor: [
          "rgba(182, 166, 233, 0.8)",
          "rgba(135, 111, 212, 0.8)",
          "rgba(94, 64, 190, 0.8)",
          "rgba(61, 39, 133, 0.8)",
          "rgba(33, 19, 77, 0.8)",
          "rgba(255, 117, 76, 0.8)",
          "rgba(46, 196, 182, 0.8)",
          "rgba(255, 202, 58, 0.8)",
          "rgba(25, 130, 196, 0.8)",
          "rgba(138, 201, 38, 0.8)",
        ],
        borderColor: "white",
        borderWidth: 3,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      title: {
        display: true,
        text: "Genre Distribution",
        align: "center",
        font: { size: 18 },
      },
    },
    onClick: (event, elements) => {
      if (!elements.length) {
        return;
      }
      const genre = pieData.labels[elements[0].index];
      setSelectedGenre(genre);
      setSelectedTab(1);
    },
    maintainAspectRatio: false,
  };

  const lineData = {
    labels: addedPerDay?.map((entry) => entry.added_date) || [],
    datasets: [
      {
        label: "Books Added Per Day",
        data: addedPerDay?.map((entry) => entry.books_added) || [],
        fill: true,
        backgroundColor: "rgba(108, 93, 211, 0.2)",
        borderColor: "#6C5DD3",
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Books Added Over Time",
        align: "center",
        font: { size: 18 },
      },
    },
    scales: {
      y: { grid: { color: "rgba(200, 200, 200, 0.2)" } },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box style={styles.container}>
      <Box style={styles.sidebar}>
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="User gallery tabs"
        >
          <Tab label="Dashboard" />
          <Tab label="My Books" />
        </Tabs>
      </Box>
      <Box style={styles.content}>
        {selectedTab === 0 && (
          <>
            <Typography variant="h4" style={styles.header}>
              Dashboard
            </Typography>
            <Box style={styles.chartContainer}>
              <Box style={{ width: "45%", height: "450px" }}>
                <Pie data={pieData} options={pieOptions} />
              </Box>
              <Box style={{ width: "45%", height: "450px" }}>
                <Line data={lineData} options={lineOptions} />
              </Box>
            </Box>
          </>
        )}
        {selectedTab === 1 && (
          <>
            <Typography variant="h2" style={styles.header}>
              My Books
            </Typography>
            <Box style={styles.controls}>
              <Typography>
                Showing <span style={styles.selectedGenre}>{selectedGenre || "all genres"}</span>
              </Typography>
              {selectedGenre && (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedGenre(null)}
                  sx={{ borderColor: "#6c5dd3", color: "#6c5dd3" }}
                >
                  All Genres
                </Button>
              )}
            </Box>
            {books.length === 0 ? (
              <Typography>No books in your gallery yet!</Typography>
            ) : sortedGenreNames.length === 0 ? (
              <Typography>No books found for this genre.</Typography>
            ) : (
              <>
                <Box style={styles.section}>
                  <Box style={styles.sectionHeader}>
                    <Typography style={styles.sectionTitle}>All Books</Typography>
                    <Typography style={styles.sectionCount}>{filteredBooks.length} books</Typography>
                  </Box>
                  <Box style={styles.booksGrid}>
                    {displayedAllBooks.map((book) => (
                      <GalleryBook
                        key={`all-${book.book_id}`}
                        book={book}
                        onBookRemoved={handleBookRemoved}
                      />
                    ))}
                  </Box>
                  {allBooksTotalPages > 1 && (
                    <Pagination
                      count={allBooksTotalPages}
                      page={allBooksPage}
                      onChange={(event, value) => setAllBooksPage(value)}
                      sx={{
                        marginTop: "20px",
                        display: "flex",
                        justifyContent: "center",
                        "& .MuiPaginationItem-root.Mui-selected": {
                          backgroundColor: "#6c5dd3",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#6c5dd3",
                          },
                        },
                      }}
                      color="primary"
                      size="large"
                    />
                  )}
                </Box>

                {sortedGenreNames.map((genre) => {
                  const genreBooks = groupedBooks[genre];
                  const genrePage = genrePages[genre] || 1;
                  const genreTotalPages = getTotalPages(genreBooks, GENRE_PAGE_SIZE);
                  const displayedGenreBooks = paginateBooks(genreBooks, genrePage, GENRE_PAGE_SIZE);

                  return (
                    <Box key={genre} style={styles.section}>
                      <Box style={styles.sectionHeader}>
                        <Typography style={styles.sectionTitle}>{genre}</Typography>
                        <Typography style={styles.sectionCount}>
                          {genreBooks.length} books
                        </Typography>
                      </Box>
                      <Box style={styles.booksGrid}>
                        {displayedGenreBooks.map((book) => (
                          <GalleryBook
                            key={`${genre}-${book.book_id}`}
                            book={book}
                            onBookRemoved={handleBookRemoved}
                          />
                        ))}
                      </Box>
                      {genreTotalPages > 1 && (
                        <Pagination
                          count={genreTotalPages}
                          page={genrePage}
                          onChange={(event, value) => handleGenrePageChange(genre, value)}
                          sx={{
                            marginTop: "20px",
                            display: "flex",
                            justifyContent: "center",
                            "& .MuiPaginationItem-root.Mui-selected": {
                              backgroundColor: "#6c5dd3",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "#6c5dd3",
                              },
                            },
                          }}
                          color="primary"
                          size="large"
                        />
                      )}
                    </Box>
                  );
                })}
              </>
            )}

            {recommendations.length > 0 && !selectedGenre && (
              <Box style={styles.section}>
                <Box style={styles.sectionHeader}>
                  <Typography style={styles.sectionTitle}>Recommended For You</Typography>
                  <Typography style={styles.sectionCount}>{recommendations.length} picks</Typography>
                </Box>
                <Box style={styles.booksGrid}>
                  {recommendations.map((book) => (
                    <GalleryBook
                      key={`recommended-${book.book_id}`}
                      book={book}
                      showRemoveButton={false}
                    />
                  ))}
                </Box>
                {recommendationTotalPages > 1 && (
                  <Pagination
                    count={recommendationTotalPages}
                    page={recommendationPage}
                    onChange={(event, value) => setRecommendationPage(value)}
                    sx={{
                      marginTop: "20px",
                      display: "flex",
                      justifyContent: "center",
                      "& .MuiPaginationItem-root.Mui-selected": {
                        backgroundColor: "#6c5dd3",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#6c5dd3",
                        },
                      },
                    }}
                    color="primary"
                    size="large"
                  />
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default UserGalleryPage;
