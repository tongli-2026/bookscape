import pandas as pd
# Load the dataset
books_genres_df = pd.read_csv('books_genres_expanded.csv')

# Rename 'books_id' column to 'book_id'
books_genres_df.rename(columns={'books_id': 'book_id'}, inplace=True)

books_df = pd.read_csv('books.csv')

# Filter out rows with empty genres
filtered_genres_df = books_genres_df[books_genres_df['genres'].notna() & (books_genres_df['genres'] != '')]

# Keep only rows with book_id in books.csv
filtered_genres_df = filtered_genres_df[filtered_genres_df['book_id'].isin(books_df['book_id'])]

# Optionally, save the result to a new CSV file
filtered_genres_df.to_csv('filtered_books_genres.csv', index=False)
