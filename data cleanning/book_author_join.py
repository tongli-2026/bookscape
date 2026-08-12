import pandas as pd

# Load the CSV files
book_authors_df = pd.read_csv('Book_Authors.csv')
authors_df = pd.read_csv('Authors.csv')

# Merge the DataFrames using different column names
merged_df = pd.merge(book_authors_df, authors_df, left_on='author_id', right_on='authorid', how='inner')

# Count the number of distinct books
unique_books_count = merged_df['book_id'].nunique()

print("Number of books with authors in both files:", unique_books_count)
