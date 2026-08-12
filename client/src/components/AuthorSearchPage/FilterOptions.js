import React, { useState } from "react";
import {
  Button,
  Slider,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";

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
  const [filters, setFilters] = useState({
    country: [],
    gender: [],
    zodiacSign: [],
    genres: [],
    hasNobelPrize: [],
    bornYear: [1900, 2023],
    averageRating: [2, 5],
    ratingCount: [5000, 25000000],
  });

  const countries = [
    "United States", "United Kingdom", "Canada", "France", "Germany", "Australia",
    "Italy", "Spain", "India", "Japan", "Egypt", "Netherlands", "Turkey", "Poland",
    "Indonesia", "Russia", "Brazil", "Ireland", "Sweden", "Argentina", "Iran",
    "Mexico", "Belgium", "New Zealand", "Portugal", "South Africa", "Greece",
    "Romania", "Austria", "Czechia", "Jamaica", "Finland", "Norway", "China",
    "Denmark", "Switzerland", "Malaysia", "Ukraine", "Israel", "Saudi Arabia",
  ];

  const genders = ["male", "female", "unknown"];
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  const genres = [
    "biography", "comics", "fantasy", "children",
    "crime", "fiction", "non-fiction", "poetry",
    "romance", "young-adult",
  ];

  const nobelPrizeOptions = [
    { label: "Nobel Winner", value: true },
    { label: "Non-Winner", value: false },
  ];

  const handleMultiSelectChange = (field, options) => (event) => {
    const value = event.target.value;

    if (value.includes("Select All")) {
      setFilters({
        ...filters,
        [field]: filters[field].length === options.length ? [] : options,
      });
    } else {
      setFilters({ ...filters, [field]: value });
    }
  };

  const handleSliderChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleRefineSearch = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      country: [],
      gender: [],
      zodiacSign: [],
      genres: [],
      hasNobelPrize: [],
      bornYear: [1900, 2023],
      averageRating: [2, 5],
      ratingCount: [5000, 25000000],
    };
    setFilters(defaultFilters);
    onReset(defaultFilters);
  };

  const capitalizeOption = (option) =>
    option.charAt(0).toUpperCase() + option.slice(1);

  const renderDropdown = (label, field, options) => (
    <div style={styles.section}>
      <h3>Search by {label}</h3>
      <FormControl fullWidth>
        <InputLabel id={`${field}-select-label`}>{label}</InputLabel>
        <Select
          labelId={`${field}-select-label`}
          multiple
          value={filters[field]}
          onChange={handleMultiSelectChange(field, options)}
          renderValue={(selected) =>
            selected.map(capitalizeOption).join(", ")
          }
        >
          <MenuItem value="Select All">
            <Checkbox
              checked={filters[field].length === options.length}
              indeterminate={
                filters[field].length > 0 && filters[field].length < options.length
              }
            />
            <ListItemText primary="Select All" />
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={filters[field].includes(option)} />
              <ListItemText primary={capitalizeOption(option)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );

  return (
    <div style={styles.container}>
      {renderDropdown("Country", "country", countries)}
      {renderDropdown("Gender", "gender", genders)}
      {renderDropdown("Zodiac Sign", "zodiacSign", zodiacSigns)}
      {renderDropdown("Genres", "genres", genres)}

      <div style={styles.section}>
        <h3>Search by Nobel Prize</h3>
        {nobelPrizeOptions.map((option) => (
          <FormControlLabel
            key={option.label}
            control={
              <Checkbox
                checked={filters.hasNobelPrize.includes(option.value)}
                onChange={() =>
                  setFilters({
                    ...filters,
                    hasNobelPrize: filters.hasNobelPrize.includes(option.value)
                      ? filters.hasNobelPrize.filter((v) => v !== option.value)
                      : [...filters.hasNobelPrize, option.value],
                  })
                }
              />
            }
            label={option.label}
          />
        ))}
      </div>

      <div style={styles.section}>
        <h3>Born Year</h3>
        <Slider
          value={filters.bornYear}
          onChange={(_, value) => handleSliderChange("bornYear", value)}
          min={1700}
          max={2023}
          valueLabelDisplay="auto"
          sx={styles.slider}
        />
      </div>

      <div style={styles.section}>
        <h3>Average Rating</h3>
        <Slider
          value={filters.averageRating}
          onChange={(_, value) => handleSliderChange("averageRating", value)}
          min={0}
          max={5}
          step={0.1}
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
          max={25000000}
          step={5000}
          valueLabelDisplay="auto"
          sx={styles.slider}
        />
      </div>

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
