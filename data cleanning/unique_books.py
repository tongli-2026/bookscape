import pandas as pd
import sqlite3

# Load the CSV file
file_path = 'Book_Authors.csv'
df = pd.read_csv(file_path)

# Count the distinct book_id values
distinct_book_count = df['book_id'].nunique()

print(f"Total distinct book_id values: {distinct_book_count}")

# Get the number of rows
num_rows = df.shape[0]

print(f"Total number of rows in Book_Authors.csv: {num_rows}")

# Count the number of authors per book_id
author_counts = df.groupby('book_id').size().reset_index(name='author_count')

# Sort by book_id
author_counts = author_counts.sort_values(by='book_id')

# Display the results
print(author_counts)

# Display the top 100 rows
top_100_rows = df.head(100)

print(top_100_rows)