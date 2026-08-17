import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./NavigationBar.module.css";
import Header from "./Header";
import { Tabs, Tab } from "@mui/material";

const defaultLinks = [
  { id: "home", text: "Home", width: "80px", to: "/" },
  { id: "find-books", text: "Find Books", width: "115px", to: "/find_books" },
  {
    id: "recommendations",
    text: "Book Recommendations",
    width: "254px",
    className: styles.recommendationsLink,
    to: "/book_recommendations",
  },
  {
    id: "find-authors",
    text: "Find Authors",
    width: "133px",
    to: "/find_authors",
  },
];

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  //added logic for user's own gallery after they login
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    console.log(savedUser);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  //dynamically add user gallery link if user logged in
  const links = [...defaultLinks];
  if (user) {
    links.push({
      id: "gallery",
      text: `${user.name}'s Gallery`,
      width: "150px",
      to: `/user_gallery/${user.id}`,
    });
  }

  // handle search bar logic and navigation
  const handleSearch = (query, type) => {
    const targetPage = type === "Authors" ? "/find_authors" : "/find_books";
    const queryString = `?search_string=${encodeURIComponent(query)}`;

    if (location.pathname === targetPage) {
      navigate(`${targetPage}${queryString}`, { replace: true });
    } else {
      navigate(`${targetPage}${queryString}`);
    }
  };

  // determine the current tab index based on the current URL
  const currentTab = links.findIndex((link) => link.to === location.pathname);

  const handleTabChange = (event, newValue) => {
    navigate(links[newValue].to);
  };

  return (
    <nav className={styles.navigationContainer}>
      <div className={styles.mainWrapper}>
        <header className={styles.headerBackground}>
          <Header onSearch={handleSearch} />
          <Tabs
            value={currentTab >= 0 ? currentTab : false}
            onChange={handleTabChange}
            variant="scrollable"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              width: "87.5%", 
              maxWidth: "1920px", 
              margin: "0 auto", 
            }}
          >
            {links.map((link) => (
              <Tab key={link.id} label={link.text} />
            ))}
          </Tabs>
        </header>
      </div>
    </nav>
  );
}
