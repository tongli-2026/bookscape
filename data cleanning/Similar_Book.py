import pandas as pd
import os

# Load the CSV files
goodreads_file_path = 'goodreads_book_reviews.csv'
book = 'books.csv'

book_df = pd.read_csv(book)
goodreads_book_df = pd.read_csv(goodreads_file_path, low_memory=False)

# Ensure 'book_id' is an int for both DataFrames
book_df['book_id'] = book_df['book_id'].astype(int)
goodreads_book_df['book_id'] = goodreads_book_df['book_id'].astype(int)

def parse_similar_books(value):
    # empty list string '[]'
    if value == '[]' or pd.isna(value):
        return []

    # non-empty list strings
    if isinstance(value, str):
        value = value.strip("[]").replace("'", "")
        if value:
            return list(map(int, value.split(',')))
        else:
            return []
    return []


# apply parsing function to the similar_books column
goodreads_book_df['similar_books'] = goodreads_book_df['similar_books'].apply(parse_similar_books)

# left join to ensure all book_id values from book.csv are retained
merged_df = pd.merge(book_df[['book_id']], goodreads_book_df, on='book_id', how='left')

# fill missing similar_books with an empty list
merged_df['similar_books'] = merged_df['similar_books'].apply(lambda x: x if isinstance(x, list) else [])

# data before filter
total_rows_before = merged_df.shape[0]
empty_list_rows_before = merged_df[merged_df['similar_books'].apply(len) == 0].shape[0]
non_empty_list_rows_before = merged_df[merged_df['similar_books'].apply(len) > 0].shape[0]
max_list_length_before = merged_df['similar_books'].apply(len).max()
print(f"Before filtering:")
print(f"Total rows: {total_rows_before}")
print(f"Rows with an empty list in similar_books: {empty_list_rows_before}")
print(f"Rows with a non-empty list in similar_books: {non_empty_list_rows_before}")
print(f"Max length of non-empty lists in similar_books: {max_list_length_before}")

# Create a set of valid book_ids from books.csv
valid_book_ids = set(book_df['book_id'])

# filter similar_books + remove duplicates + exclude the row's book_id + limit to 5
def filter_and_limit_similar_books(row):
    current_book_id = row['book_id']

    filtered_books = list(
        set([book_id for book_id in row['similar_books'] if book_id in valid_book_ids and book_id != current_book_id]))

    return filtered_books[:5]


# Apply the filtering and limiting function to the similar_books column
merged_df['similar_books'] = merged_df.apply(filter_and_limit_similar_books, axis=1)

# Data after filtering
total_rows_after = merged_df.shape[0]
empty_list_rows_after = merged_df[merged_df['similar_books'].apply(len) == 0].shape[0]
non_empty_list_rows_after = merged_df[merged_df['similar_books'].apply(len) > 0].shape[0]
max_list_length_after = merged_df['similar_books'].apply(len).max()
print(f"After filtering:")
print(f"Total rows: {total_rows_after}")
print(f"Rows with an empty list in similar_books: {empty_list_rows_after}")
print(f"Rows with a non-empty list in similar_books: {non_empty_list_rows_after}")
print(f"Max length of non-empty lists in similar_books: {max_list_length_after}")

# Output
output_file = 'similar_books.csv'
merged_df.to_csv(output_file, index=False, columns=['book_id', 'similar_books'])

# Get the file size
file_size = os.path.getsize(output_file) / (1024 * 1024)
print(f"File size of {output_file}: {file_size:.2f} MB")