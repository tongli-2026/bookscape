import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Pagination, Tabs, Tab } from "@mui/material";
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
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    height: "100vh",
    width: "87.5%",
    maxWidth: "1920px",
    margin: "0 auto",
  },
  sidebar: {
    width: "200px",
    borderRight: "1px solid #ddd",
    textAlign: "left",
    padding: "10px",
  },
  content: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "20px",
    textAlign: "center",
  },
  horizontalBooks: {
    display: "flex",
    overflowX: "auto",
    gap: "20px",
    padding: "10px",
  },
  pagination: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
  },
  chartContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    height: "60%",
    gap: "20px",
  },
};

const UserGalleryPage = () => {
  const { user_id } = useParams();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [addedPerDay, setAddedPerDay] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(
          apiUrl(`/gallery/${user_id}`)
        );
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
        const response = await fetch(
          apiUrl(`/gallery/genres/${user_id}`)
        );
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
        const response = await fetch(
          apiUrl(`/gallery/added_per_day/${user_id}`)
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data.added_date);
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

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBookRemoved = (removedBookId) => {
    setBooks((prevBooks) =>
      prevBooks.filter((book) => book.book_id !== removedBookId)
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedBooks = books.slice(startIndex, startIndex + itemsPerPage);

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
      {/* Sidebar with vertical tabs for navigation */}
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
            {/* Dashboard tab displaying pie and line charts */}
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
            {/* My Books tab */}
            <Typography variant="h2" style={styles.header}>
              My Books
            </Typography>
            {books.length === 0 ? (
              <Typography>No books in your gallery yet!</Typography>
            ) : (
              <>
                <Box style={styles.horizontalBooks}>
                  {selectedBooks.map((book) => (
                    <GalleryBook
                      key={book.book_id}
                      book={book}
                      onBookRemoved={handleBookRemoved} // Remove book callback
                    />
                  ))}
                </Box>
                {/* Pagination for the book list */}
                <Pagination
                  count={Math.ceil(books.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
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
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};


export default UserGalleryPage;
