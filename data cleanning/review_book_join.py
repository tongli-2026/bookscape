import pandas as pd
import json

# Load the reviews data
with open('goodreads_reviews_dedup.json', 'r') as file:
    reviews_data = [json.loads(line) for line in file.readlines()]

reviews_df = pd.DataFrame(reviews_data)

# Convert book_id to int
reviews_df['book_id'] = reviews_df['book_id'].astype(int)

# Get the total number of rows
total_rows = len(reviews_df)

# Get the number of distinct book_id in reviews
distinct_book_ids = reviews_df['book_id'].nunique()

# Load the books data
books_df = pd.read_csv('books.csv')

# Convert book_id to int
books_df['book_id'] = books_df['book_id'].astype(int)

# Perform inner join to find common book_ids
merged_df = pd.merge(reviews_df, books_df, on='book_id', how='inner')

# Get the number of distinct book_id after the inner join
distinct_book_ids_joined = merged_df['book_id'].nunique()

# Output the results
print(f'Total rows: {total_rows}')
print(f'Distinct book_id in reviews: {distinct_book_ids}')
print(f'Distinct book_id after inner join: {distinct_book_ids_joined}')
