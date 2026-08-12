import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import BookSearchPage from './pages/BookSearchPage';
import BookRecommendPage from './pages/BookRecommendPage';
import AuthorSearchPage from './pages/AuthorSearchPage';
import BookInfoPage from './pages/BookInfoPage';
import EBookInfoPage from './pages/EBookInfoPage';
import OnlineReadingPage from './pages/OnlineReadingPage';
import AuthorInfoPage from './pages/AuthorInfoPage'
import UserGalleryPage from './pages/UserGalleryPage';


// createTheme to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search_books" element={<BookSearchPage />} />
          <Route path="/recommend_books" element={<BookRecommendPage />} />
          <Route path="/search_authors" element={<AuthorSearchPage />} />
          <Route path="/books/:book_id" element={<BookInfoPage />} />
          <Route path="/ebooks/:book_id" element={<EBookInfoPage />} />
          <Route path="/ebooks/:book_id/full_text" element={<OnlineReadingPage />} />
          <Route path="/authors/:author_id" element={<AuthorInfoPage />} />
          <Route path="/gallery/:user_id" element ={<UserGalleryPage/>}/>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}