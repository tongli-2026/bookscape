import React, { useState } from 'react';
import { TextField, MenuItem, Box } from '@mui/material';
import SearchIcon from '../helpers/SearchIcon.png';

export default function SearchBar({ onSearch }) {
  const [searchType, setSearchType] = useState('Books');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery, searchType);
  };

  const placeholderText =
    searchType === 'Books'
      ? 'Search by title/keywords/isbn/asin'
      : 'Search by author name/keywords';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
    
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center', 
          gap: '10px', 
          width: '100%',
          maxWidth: '800px', 
        }}
      >
        {/* Dropdown Menu */}
        <TextField
          select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          variant="outlined"
          sx={{
            width: '150px', 
            height: '56px', 
          }}
        >
          <MenuItem value="Books">Books</MenuItem>
          <MenuItem value="Authors">Authors</MenuItem>
        </TextField>

        {/* Search Input */}
        <TextField
          placeholder={placeholderText}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{
            flexGrow: 1, 
            height: '56px', 
          }}
        />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '56px', 
            width: '56px', 
            backgroundColor: '#6C5DD3',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <img
            src={SearchIcon}
            alt="Search"
            style={{ height: '24px', width: '24px' }}
          />
        </button>
      </Box>
    </Box>
  );
}
