-- Quick checks after importing cleaned CSV files.

SELECT 'Books' AS table_name, COUNT(*) AS rows FROM Books
UNION ALL SELECT 'Authors', COUNT(*) FROM Authors
UNION ALL SELECT 'Book_Authors', COUNT(*) FROM Book_Authors
UNION ALL SELECT 'Online_Reading_Books', COUNT(*) FROM Online_Reading_Books
UNION ALL SELECT 'Genres', COUNT(*) FROM Genres
UNION ALL SELECT 'Similar_To', COUNT(*) FROM Similar_To
UNION ALL SELECT 'Reviews', COUNT(*) FROM Reviews
UNION ALL SELECT 'Nobel_Literature_Winners', COUNT(*) FROM Nobel_Literature_Winners
ORDER BY table_name;

SELECT 'Book_Authors missing Books' AS check_name, COUNT(*) AS bad_rows
FROM Book_Authors ba LEFT JOIN Books b ON b.book_id = ba.book_id
WHERE b.book_id IS NULL
UNION ALL
SELECT 'Book_Authors missing Authors', COUNT(*)
FROM Book_Authors ba LEFT JOIN Authors a ON a.author_id = ba.author_id
WHERE a.author_id IS NULL
UNION ALL
SELECT 'Online_Reading_Books missing Books', COUNT(*)
FROM Online_Reading_Books e LEFT JOIN Books b ON b.book_id = e.book_id
WHERE b.book_id IS NULL
UNION ALL
SELECT 'Genres missing Books', COUNT(*)
FROM Genres g LEFT JOIN Books b ON b.book_id = g.book_id
WHERE b.book_id IS NULL
UNION ALL
SELECT 'Similar_To missing source Books', COUNT(*)
FROM Similar_To s LEFT JOIN Books b ON b.book_id = s.source_book_id
WHERE b.book_id IS NULL
UNION ALL
SELECT 'Similar_To missing similar Books', COUNT(*)
FROM Similar_To s LEFT JOIN Books b ON b.book_id = s.similar_book_id
WHERE b.book_id IS NULL
UNION ALL
SELECT 'Reviews missing Books', COUNT(*)
FROM Reviews r LEFT JOIN Books b ON b.book_id = r.book_id
WHERE b.book_id IS NULL
UNION ALL
SELECT 'Nobel missing Authors', COUNT(*)
FROM Nobel_Literature_Winners n LEFT JOIN Authors a ON a.author_id = n.author_id
WHERE a.author_id IS NULL;
