import os
import pandas as pd

# Path to the cleaned JSON file
json_file_path = 'goodreads_books_cleaned.json'

# Initialize a list to store filtered DataFrames
filtered_dfs = []

# Process the JSON file in chunks
chunk_size = 20000  # Number of rows per chunk
for chunk in pd.read_json(json_file_path, lines=True, chunksize=chunk_size):
    # Display the columns in the chunk DataFrame
    print("Columns in the current chunk DataFrame:", chunk.columns.tolist())

    # Check for NaN values in the relevant columns before filtering
    print("\nNaN counts before filtering:")
    print(chunk[['publication_year', 'num_pages', 'ratings_count', 'isbn', 'title']].isna().sum())

    # Define the columns to check for NaN values
    columns_to_check = ['isbn', 'publication_year', 'ratings_count', 'num_pages', 'title']

    # Filter out rows with NaN values in the specified columns
    chunk_filtered = chunk.dropna(subset=columns_to_check)

    # Drop the 'popular_shelves' column if it exists
    if 'popular_shelves' in chunk_filtered.columns:
        chunk_filtered = chunk_filtered.drop(columns=['popular_shelves'])

    # Print the number of rows after filtering
    print(f"Number of rows after filtering: {len(chunk_filtered)}")

    # Check for NaN values in the relevant columns after filtering
    print("\nNaN counts after filtering:")
    print(chunk_filtered[['publication_year', 'num_pages', 'ratings_count', 'isbn', 'title']].isna().sum())

    # Convert necessary columns to numeric types
    chunk_filtered['publication_year'] = pd.to_numeric(chunk_filtered['publication_year'], errors='coerce')
    chunk_filtered['num_pages'] = pd.to_numeric(chunk_filtered['num_pages'], errors='coerce')
    chunk_filtered['ratings_count'] = pd.to_numeric(chunk_filtered['ratings_count'], errors='coerce')
    chunk_filtered['average_rating'] = pd.to_numeric(chunk_filtered['average_rating'], errors='coerce')
    chunk_filtered['text_reviews_count'] = pd.to_numeric(chunk_filtered['text_reviews_count'], errors='coerce')

    # Append the filtered DataFrame to the list
    filtered_dfs.append(chunk_filtered)

# Concatenate all filtered DataFrames into one
df_filtered = pd.concat(filtered_dfs, ignore_index=True)

# Output the summary statistics for the filtered DataFrame
summary_stats = df_filtered.describe(include='all')

print("\nSummary Statistics:\n", summary_stats)

# Save the summary statistics to a CSV file
summary_stats.to_csv('summary_statistics_largefile.csv', index=True)

print("Summary statistics saved to 'summary_statistics.csv'")
