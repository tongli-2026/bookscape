import React, { useState } from "react";
import { Button, Checkbox, FormControlLabel, Slider, Box } from "@mui/material";

const styles = {
  container: {
    display: "grid",
    flexDirection: "column",
    flexWrap: "nowrap",
    gap: "20px",
    padding: "20px",
    boxSizing: "border-box",
    minWidth: "100%",
  },
  section: {
    marginBottom: "20px",
    minWidth: "100%",
  },
  categories: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  categoryLabel: {
    flex: "1 1 calc(50% - 10px)",
    margin: "0",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
    color: "#6C5DD3",
  },
  slider: {
    color: "#6C5DD3",
  },
  button: {
    width: "100%",
  },
};

export default function FilterOptions({ onFilter, onReset }) {
  // Initialize state for filters with default values.
  const [filters, setFilters] = useState({
    categories: ["Fiction"],
    mediaTypes: ["Book"],
    publicationYear: [1930, 2021],
    pageCount: [100, 14777],
    ratingCount: [500, 4899965],
    authorRating: [2, 5],
    hasNobelPrize: false,
  });

  const categories = [
    "Biography",
    "Comics",
    "Fantasy",
    "Children",
    "Crime",
    "Fiction",
    "Non-Fiction",
    "Poetry",
    "Romance",
    "Young-Adult",
  ];

  const handleCategoryChange = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilters({ ...filters, categories: newCategories });
  };

  const handleSelectAllCategories = () => {
    if (filters.categories.length === categories.length) {
      setFilters({ ...filters, categories: [] });
    } else {
      setFilters({ ...filters, categories: categories });
    }
  };

  const handleMediaChange = (type) => {
    const newTypes = filters.mediaTypes.includes(type)
      ? filters.mediaTypes.filter((t) => t !== type)
      : [...filters.mediaTypes, type];

    setFilters({ ...filters, mediaTypes: newTypes });
  };

  const handleNobelPrizeChange = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      hasNobelPrize: !prevFilters.hasNobelPrize,
    }));
  };

  const handleSliderChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleRefineSearch = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      categories: ["Fiction"],
      mediaTypes: ["Book"],
      publicationYear: [1930, 2021],
      pageCount: [100, 14777],
      ratingCount: [500, 4899965],
      authorRating: [2, 5],
      hasNobelPrize: false,
    };
    setFilters(defaultFilters);
    onReset(defaultFilters);
  };

  return (
    <div style={styles.container}>
      {/* section for filtering by genres */}
      <div style={styles.section}>
        <h3>Search by Genres</h3>
        <div style={styles.categories}>
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              style={styles.categoryLabel}
              control={
                <Checkbox
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
              }
              label={category}
            />
          ))}

          {/* add "Select All" checkbox at the end */}
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.categories.length === categories.length}
                indeterminate={
                  filters.categories.length > 0 &&
                  filters.categories.length < categories.length
                }
                onChange={handleSelectAllCategories}
              />
            }
            label="Select All"
            style={styles.categoryLabel}
          />
        </div>
      </div>
      {/* sections for media types*/}
      <div style={styles.section}>
        <h3>Search by Media</h3>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.mediaTypes.includes("Book")}
              onChange={() => handleMediaChange("Book")}
            />
          }
          label="Book"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.mediaTypes.includes("Ebook")}
              onChange={() => handleMediaChange("Ebook")}
            />
          }
          label="EBook"
        />
      </div>
      {/* sections for nobel prize*/}
      <div style={styles.section}>
        <h3>Search by Nobel Prize</h3>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.hasNobelPrize}
              onChange={handleNobelPrizeChange}
            />
          }
          label="Authors with Nobel Prize"
        />
      </div>
      {/* sections for multiple slider control publication year, number of pages, rating count, author rating*/}
      <div style={styles.section}>
        <h3>Publication Year</h3>
        <Slider
          value={filters.publicationYear}
          onChange={(_, value) => handleSliderChange("publicationYear", value)}
          min={1800}
          max={2023}
          valueLabelDisplay="auto"
          sx={styles.slider}
        />
      </div>

      <div style={styles.section}>
        <h3>Number of Pages</h3>
        <Slider
          value={filters.pageCount}
          onChange={(_, value) => handleSliderChange("pageCount", value)}
          min={0}
          max={14777}
          valueLabelDisplay="auto"
          sx={styles.slider}
        />
      </div>

      <div style={styles.section}>
        <h3>Rating Count</h3>
        <Slider
          value={filters.ratingCount}
          onChange={(_, value) => handleSliderChange("ratingCount", value)}
          min={0}
          max={4899965}
          valueLabelDisplay="auto"
          sx={styles.slider}
        />
      </div>

      <div style={styles.section}>
        <h3>Author Rating</h3>
        <Slider
          value={filters.authorRating}
          onChange={(_, value) => handleSliderChange("authorRating", value)}
          min={0}
          max={5}
          step={0.1}
          valueLabelDisplay="auto"
          sx={styles.slider}
        />
      </div>

      {/* added refined search button & reset button*/}
      <Box sx={styles.buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRefineSearch}
          sx={styles.button}
        >
          Refine Search
        </Button>
        <Button variant="outlined" onClick={handleReset} sx={styles.button}>
          Reset Filter
        </Button>
      </Box>
    </div>
  );
}
