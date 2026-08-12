import pandas as pd

# Load the data
books_df = pd.read_csv('books.csv')
books_and_genres_df = pd.read_csv('books_and_genres.csv')

# Count distinct books in books.csv (assuming 'book_id' is the identifier for books)
distinct_books = books_df['book_id'].nunique()

# Count distinct book titles in books.csv
distinct_book_titles = books_df['title'].nunique()

# Count distinct titles in books_and_genres.csv
distinct_titles = books_and_genres_df['title'].nunique()

print(f'Distinct books in books.csv: {distinct_books}')
print(f'Distinct book titles in books.csv: {distinct_book_titles}')
print(f'Distinct titles in books_and_genres.csv: {distinct_titles}')

# Perform an inner join on 'title'
merged_df = pd.merge(books_df, books_and_genres_df, on='title', how='inner')

# Drop duplicates to get distinct rows based on the 'title' column
distinct_merged_titles = merged_df['title'].nunique()

# Count the number of distinct titles after the join
print(f'Distinct titles after join: {distinct_merged_titles}')
