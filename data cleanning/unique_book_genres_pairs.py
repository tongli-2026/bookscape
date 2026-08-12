import pandas as pd

# Load the books_genres.csv file
books_genres_df = pd.read_csv('books_genres.csv')

# Count distinct (book_id, genres) pairs
distinct_count = books_genres_df.drop_duplicates(subset=['book_id', 'genres']).shape[0]
print("Number of distinct (book_id, genres) pairs:", distinct_count)

# Filter to keep only unique (book_id, genres) pairs
unique_books_genres_df = books_genres_df.drop_duplicates(subset=['book_id', 'genres'])

# Display the unique pairs
print(unique_books_genres_df)

# Count the number of distinct genres
distinct_genres_count = books_genres_df['genres'].nunique()
print("Number of distinct genres:", distinct_genres_count)

# # Save the unique pairs to a new file
# unique_books_genres_df.to_csv('unique_books_genres.csv', index=False)
