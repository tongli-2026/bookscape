import pandas as pd
import os
import random
import ast
import json

# Load the CSV files
goodreads_file_path = 'goodreads_book_reviews.csv'
book = 'books.csv'
reviews_df = pd.read_csv(goodreads_file_path, low_memory=False)
books_df = pd.read_csv(book, low_memory=False)

# Get the initial number of rows and file size
initial_rows = reviews_df.shape[0]
initial_file_size = os.path.getsize(goodreads_file_path) / (1024 * 1024)  # File size in MB

# Keep only the required columns
reviews_df = reviews_df[['book_id', 'rating', 'review_id', 'review_sentences', 'timestamp']]

# 1: Data Cleaning
# Remove duplicate rows
reviews_df = reviews_df.drop_duplicates()

# Remove completely empty rows
reviews_df = reviews_df.dropna(how='all')

# Remove rows where 'review_id' is null or empty
reviews_df = reviews_df[reviews_df['review_id'].notnull()]
reviews_df = reviews_df[reviews_df['review_id'] != '']

# Remove rows where 'review_id' is duplicated
reviews_df = reviews_df.drop_duplicates(subset=['review_id'])

# Ensure the data type of 'book_id' in both DataFrames is the same for comparison
books_df['book_id'] = books_df['book_id'].astype(int)
reviews_df['book_id'] = reviews_df['book_id'].astype(int)

# Find the common book_id values
common_book_ids = reviews_df[reviews_df['book_id'].isin(books_df['book_id'])]['book_id'].unique()
# Count of shared book_ids
shared_count = len(common_book_ids)
# Keep rows where 'book_id' is equal to 'book_id' value from 'books.csv'
reviews_df = reviews_df[reviews_df['book_id'].isin(books_df['book_id'])]

# Remove rows where 'rating' is empty or null
reviews_df = reviews_df[reviews_df['rating'].notnull()]

# Replace null 'review_sentences' with an empty string
reviews_df['review_sentences'] = reviews_df['review_sentences'].fillna('')


# Convert review_sentences from string to list
def convert_to_list(value):
    try:
        return ast.literal_eval(value)
    except (ValueError, SyntaxError):
        return []


reviews_df['review_sentences'] = reviews_df['review_sentences'].apply(convert_to_list)


# Function to extract up to 5 elements randomly, include min & max rating
def extract_min_max_random(sentences):
    num_total = 5
    num_random = num_total - 2

    if not sentences or not isinstance(sentences, list):
        return []

    # Sort by rating
    min_rating_sentence = min(sentences, key=lambda x: x[0])
    max_rating_sentence = max(sentences, key=lambda x: x[0])

    # Exclude the min and max rating sentences from the pool
    remaining_sentences = [sentence for sentence in sentences if
                           sentence != min_rating_sentence and sentence != max_rating_sentence]

    # Randomly select
    random_sentences = random.sample(remaining_sentences,
                                     min(num_random, len(remaining_sentences))) if remaining_sentences else []

    # Combine all
    result = [min_rating_sentence, max_rating_sentence] + random_sentences

    return result[:num_total]


# Apply the extraction function to review_sentences
reviews_df['review_sentences'] = reviews_df['review_sentences'].apply(extract_min_max_random)

# Replace missing timestamps with a default date (e.g., '2000-01-01')
default_date = pd.to_datetime('2022-01-01')
reviews_df['timestamp'] = reviews_df['timestamp'].fillna(default_date)

# 3: Data Type Conversions
reviews_df['book_id'] = reviews_df['book_id'].astype(int)
reviews_df['rating'] = reviews_df['rating'].astype(int)
reviews_df['review_id'] = reviews_df['review_id'].astype(str)

# reviews_df['review_sentences'] = reviews_df['review_sentences'].astype(str)
def list_to_json_string(sentences):
    return json.dumps(sentences)

reviews_df['review_sentences'] = reviews_df['review_sentences'].apply(list_to_json_string)
reviews_df['timestamp'] = pd.to_datetime(reviews_df['timestamp'], errors='coerce')

# 4: Save the cleaned data to a new CSV file
output_file_path = 'reviews.csv'
reviews_df.to_csv(output_file_path, index=False)
# Get the final number of rows and file size
final_rows = reviews_df.shape[0]
final_file_size = os.path.getsize(output_file_path) / (1024 * 1024)  # Convert bytes to MB

# Print out the results
print(f"Initial number of rows: {initial_rows}")
print(f"Initial file size: {initial_file_size:.2f} MB")
print(f"Final number of rows: {final_rows}")
print(f"Final file size: {final_file_size:.2f} MB")

# Print out the shared book_id results
print(f"Number of unique book_id in Review table: {shared_count}")
