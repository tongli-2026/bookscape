import pandas as pd

# Load the Book_Authors.csv file
book_authors_df = pd.read_csv('Book_Authors.csv')

# Filter to keep only unique (book_id, author_id) pairs
unique_book_authors_df = book_authors_df.drop_duplicates(subset=['book_id', 'author_id'])

# Save the unique pairs to a new file
unique_book_authors_df.to_csv('unique_book_authors.csv', index=False)

print("Unique (book_id, author_id) pairs saved to 'unique_book_authors.csv'.")
