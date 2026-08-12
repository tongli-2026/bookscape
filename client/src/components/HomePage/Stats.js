import React, { useEffect, useState } from 'react';
import styles from './Stats.module.css';
import { apiUrl } from "../../api";


const Stats = () => {
  const [statsData, setStatsData] = useState({
    books: 0,
    authors: 0,
    ebooks: 0,
    users: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const responseBooks = await fetch(apiUrl("/api/books/count"));
        const responseAuthors = await fetch(apiUrl("/api/authors/count"));
        const responseEbooks = await fetch(apiUrl("/api/ebooks/count"));
        const responseUsers = await fetch(apiUrl("/api/users/count"));
        
        // Wait for all requests to resolve
        const [books, authors, ebooks, users] = await Promise.all([
          responseBooks.json(),
          responseAuthors.json(),
          responseEbooks.json(),
          responseUsers.json()
        ]);

        setStatsData({
          books: books[0].count.toLocaleString(),
          authors: authors[0].count.toLocaleString(),
          ebooks: ebooks[0].count.toLocaleString(),
          users: users[0].count.toLocaleString()
        });
      } catch (error) {
        console.error("Error fetching stats data:", error);
      }
    };

    fetchStats();
  }, []);

  //display database statistics
  return (
    <section className={styles.statsSection}>
      {[{
        value: `${statsData.books}`,
        category: 'Book Collections',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/229223e2803e5f81d136360cc3f9f232116540300137e5ddf059ea2e8184865d?placeholderIfAbsent=true&apiKey=df57f1d37f2b43ec892d3602b6cba143'
      },
      {
        value: `${statsData.authors}`,
        category: 'Author Collections',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/8a638f39bb55397edfe5a01a91ede5c0640c3198a67b32f0b48c569bd285f5f0?placeholderIfAbsent=true&apiKey=df57f1d37f2b43ec892d3602b6cba143'
      },
      {
        value: `${statsData.ebooks}`,
        category: 'EBook Collections',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/f36d35c4549696ffb0ca486ebba1e474029b0f6c23a9a18befcada7195d9706a?placeholderIfAbsent=true&apiKey=df57f1d37f2b43ec892d3602b6cba143'
      },
      {
        value: `${statsData.users}`,
        category: 'Happy Users',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/39f87492d693fbcc81ab0895d05e56896ec19b9149b63b759bb435ce4a1815bc?placeholderIfAbsent=true&apiKey=df57f1d37f2b43ec892d3602b6cba143'
      }
      ].map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <img
            loading="lazy"
            src={stat.icon}
            className={styles.statIcon}
            alt={`Icon for ${stat.value}`}
          />
          <p className={styles.statValue}>{stat.value}</p>
          <p className={styles.statValue1}>{stat.category}</p>
        </div>
      ))}
    </section>
  );
};

export default Stats;
