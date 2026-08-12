import pandas as pd

# Load the dataset
similar_books_df = pd.read_csv('similar_books.csv')

# Assume 'similar_books' column contains lists as strings, convert to list
similar_books_df['similar_books'] = similar_books_df['similar_books'].apply(eval)

# Expand each book_id with its similar_books into 1-to-1 pairs
exploded_df = similar_books_df.explode('similar_books').dropna()

# Rename columns for clarity if needed (optional)
exploded_df.columns = ['source_book_id', 'similar_book_id']

# # Save the resulting DataFrame to a new CSV file
# exploded_df.to_csv('similar_books_expanded.csv', index=False)

# Get the number of unique SourceBook IDs
distinct_source_books = exploded_df['source_book_id'].nunique()

print("Number of distinct SourceBook IDs:", distinct_source_books)
