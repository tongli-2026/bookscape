import React from 'react';
import SearchBar from './SearchBar';
import LogIn from './Login';
import BookscapeLogo from '../helpers/BookscapeLogo.png'

export default function Header({ onSearch, searchType }) {
  const styles = {
    header: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 20px',
      width: '87.5%', 
      maxWidth: '1920px', 
      boxSizing: 'border-box', 
      margin: '0 auto', 
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexShrink: 0, 
      minWidth: '50px', 
    },
    logoImage: {
      height: '40px', 
    },
    logoText: {
      fontSize: '32px',
      fontFamily: 'Cairo, sans-serif', 
      margin: '0',
      whiteSpace: 'nowrap', 
    },
    searchBar: {
      flexGrow: 1, 
      flexShrink: 1, 
      margin: '0 10px',
      minWidth: '200px', 
    },
    LogIn: {
      flexShrink: 0, 
      minWidth: '100px', 
      display: 'flex',
      justifyContent: 'flex-end',
    },
  };

  // display search bar and login button
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <a href="/">
        <img style={styles.logoImage} src={BookscapeLogo} alt="bookscape"/>
        </a>
        <h1 style={styles.logoText}>Bookscape</h1>
      </div>
      <div style={styles.searchBar}>
        <SearchBar onSearch={onSearch} selectedType={searchType} />
      </div>
      <div style={styles.LogIn}>
        <LogIn />
      </div>
    </header>
  );
}
