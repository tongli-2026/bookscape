import pandas as pd
import os

# Load the CSV files
goodreads_file_path = 'goodreads_book.csv'
kindle_file_path = 'kindle_data.csv'
book_texts_file_path = 'books_texts.csv'
reviews_file_path = 'goodreads_book_reviews.csv'
book_authors_file_path = 'Book_Authors.csv'

df = pd.read_csv(goodreads_file_path, low_memory=False)
kindle_df = pd.read_csv(kindle_file_path, low_memory=False)
book_texts_df = pd.read_csv(book_texts_file_path, low_memory=False)
reviews_df = pd.read_csv(reviews_file_path, low_memory=False)
book_authors_df = pd.read_csv(book_authors_file_path, low_memory=False)

# Display initial number of rows and file size before cleaning
initial_rows = df.shape[0]
initial_file_size = os.path.getsize(goodreads_file_path) / (1024*1024) # File size in MB

# Select only the columns needed, including 'kindle_asin'
df = df[['book_id', 'isbn', 'title', 'average_rating', 'rating_count', 'image_url',
         'publication_year', 'num_pages', 'publisher', 'description', 'kindle_asin']]

# Ensure 'book_id' and 'kindle_asin' are strings to avoid hidden duplicates and standardize
df['book_id'] = df['book_id'].astype(str).str.strip()
df['kindle_asin'] = df['kindle_asin'].astype(str).str.strip()

kindle_df['kindle_asin'] = kindle_df['kindle_asin'].astype(str).str.strip()
reviews_df['book_id'] = reviews_df['book_id'].astype(str).str.strip()
book_texts_df['title'] = book_texts_df['title'].str.lower().str.strip()
book_authors_df['book_id'] = book_authors_df['book_id'].astype(str).str.strip()

# Show the number of rows in kindle_data, book_texts, and goodreads_reviews
print(f"Rows in kindle_data.csv: {kindle_df.shape[0]}")
print(f"Rows in book_texts.csv: {book_texts_df.shape[0]}")
print(f"Rows in goodreads_book_reviews.csv: {reviews_df.shape[0]}")
print(f"Rows in Book_Authors.csv: {book_authors_df.shape[0]}")

# 1: Apply initial data cleaning for goodreads dataset
# Remove completely empty rows
df = df.dropna(how='all')
print(f"After removing completely empty rows: {df.shape[0]} rows")

# Remove duplicate rows
df = df.drop_duplicates()
print(f"After removing duplicate rows: {df.shape[0]} rows")

# Remove rows where 'book_id' is null or empty
df = df.dropna(subset=['book_id'])
df = df[df['book_id'] != '']
print(f"After removing null/empty book_id: {df.shape[0]} rows")

# Remove rows with duplicate 'book_id'
df = df.drop_duplicates(subset=['book_id'])
print(f"After removing duplicate book_id rows: {df.shape[0]} rows")

# Handle 'isbn' duplicates: Remove duplicates only for non-empty 'isbn'
df['isbn'] = df['isbn'].fillna('').str.strip()
df = df[df.duplicated(subset=['isbn'], keep=False) == False | (df['isbn'] == '')]
print(f"After handling ISBN duplicates: {df.shape[0]} rows")

# Clean 'title' column: Remove leading/trailing spaces, drop if null or empty
df['title'] = df['title'].str.strip()
df = df.dropna(subset=['title'])
df = df[df['title'] != '']
print(f"After cleaning and removing null/empty title: {df.shape[0]} rows")

# Remove non-English titles (those containing non-ASCII characters)
df = df[df['title'].apply(lambda x: x.isascii())]
print(f"After removing non-ASCII titles: {df.shape[0]} rows")

# Clean 'rating_count': Replace null/empty with 0, and values less than 0 with 0
df['rating_count'] = pd.to_numeric(df['rating_count'], errors='coerce').fillna(0).astype(int)
df.loc[df['rating_count'] < 0, 'rating_count'] = 0
print(f"After cleaning rating_count: {df.shape[0]} rows")

# Clean 'average_rating': If 'rating_count' is 0, set 'average_rating' to 0
df.loc[df['rating_count'] == 0, 'average_rating'] = 0
df.loc[df['average_rating'] < 0, 'average_rating'] = 0
print(f"After adjusting average_rating: {df.shape[0]} rows")

# Remove rows where 'image_url' is null/empty or doesn't start with 'https://images'
df = df.dropna(subset=['image_url'])
df = df[df['image_url'].str.startswith('https://images')]
print(f"After cleaning image_url: {df.shape[0]} rows")

# Remove rows where 'publication_year' > 2024
# Ensure 'publication_year' is numeric, replace NaN or invalid with 0, and limit to 2024
df['publication_year'] = pd.to_numeric(df['publication_year'], errors='coerce').fillna(0).astype(int)
# Ensure no year is greater than 2024
df = df[df['publication_year'] <= 2024]
print(f"After removing rows with publication_year > 2024: {df.shape[0]} rows")

# Convert num_pages to numeric and coerce errors to NaN
df['num_pages'] = pd.to_numeric(df['num_pages'], errors='coerce')
df['num_pages'] = df.apply(lambda row: 0 if (pd.isnull(row['num_pages']) or row['num_pages'] <= 0) and row['title'] != '' else row['num_pages'], axis=1)
df = df.dropna(subset=['num_pages'])  # Remove rows where 'num_pages' is NaN after processing
print(f"After cleaning num_pages: {df.shape[0]} rows")

# Replace NaN or null values in the 'publisher' column with an empty string
df['publisher'] = df['publisher'].fillna('')

# Show how many unique 'book_id's exist in Book_Authors.csv
unique_book_ids_in_authors = book_authors_df['book_id'].nunique()
print(f"Number of unique 'book_id' in Book_Authors.csv: {unique_book_ids_in_authors}")

# Ensure 'book_id' exists in Book_Authors.csv
df['book_id_in_authors'] = df['book_id'].isin(book_authors_df['book_id'])
unique_book_id_in_authors_count = df[df['book_id_in_authors'] == True]['book_id'].nunique()
print(f"Number of unique 'book_id' in where 'book_id' exists both goodreads_book.csv and Book_Authors.csv : {unique_book_id_in_authors_count} rows")

# Select only rows where 'book_id' exists in Book_Authors.csv
df = df[df['book_id_in_authors'] == True]

# Drop 'book_id_in_authors' column after filtering
df = df.drop(columns=['book_id_in_authors'])

# 2: Mark rows that are in kindle_data, book_texts, or goodreads_reviews as protected row
# Filter rows where 'kindle_asin' is in both datasets
df['kindle_asin_protected'] = df['kindle_asin'].isin(kindle_df['kindle_asin'])
kindle_protected_rows = df['kindle_asin_protected'].sum()
print(f"Rows protected by matching 'kindle_asin' with kindle_data.csv: {kindle_protected_rows} rows")

# Filter rows where 'title' is in both datasets (case-insensitive, trimmed comparison)
df['title'] = df['title'].str.lower().str.strip()
df['title_protected'] = df['title'].isin(book_texts_df['title'])
title_protected_rows = df['title_protected'].sum()
print(f"Rows protected by matching 'title' with book_texts.csv: {title_protected_rows} rows")

# Filter rows where 'book_id' is in both datasets
df['book_id_protected'] = df['book_id'].isin(reviews_df['book_id'])
book_id_protected_rows = df['book_id_protected'].sum()
print(f"Rows protected by matching 'book_id' with goodreads_book_reviews.csv: {book_id_protected_rows} rows")


# 3: Mark rows that are protected (belong to any of the 3 datasets, if overlap, only count once)
df['in_protected_group'] = df['kindle_asin_protected'] | df['title_protected'] | df['book_id_protected']
print(f"Total protected rows (kindle_data or book_texts or goodreads_reviews): {df['in_protected_group'].sum()} rows")

# Ensure protected rows are unique
protected_rows = df[df['in_protected_group'] == True].drop_duplicates()
print(f"Unique protected rows after removing duplicates: {protected_rows.shape[0]} rows")

# Check how many of the unique protected rows are in kindle_data
unique_kindle_protected_count = protected_rows[protected_rows['kindle_asin_protected'] == True].shape[0]
print(f"Number of unique protected rows in kindle_data.csv: {unique_kindle_protected_count} rows")
# Check how many of the unique protected rows are in book_texts
unique_title_protected_count = protected_rows[protected_rows['title_protected'] == True].shape[0]
print(f"Number of unique protected rows in book_texts.csv: {unique_title_protected_count} rows")
# Check how many of the unique protected rows are in goodreads_book_reviews
unique_book_id_protected_count = protected_rows[protected_rows['book_id_protected'] == True].shape[0]
print(f"Number of unique protected rows in goodreads_book_reviews.csv: {unique_book_id_protected_count} rows")

# 4: Calculate the number of rows to randomly sample from non-protected rows
total_rows = {df.shape[0]}  # original number of row in step 1 data cleaning
protected_count = protected_rows.shape[0]  # number of row that marked as protected
target_count = 300000
rows_needed = target_count - protected_count  # number of rows that we can random select

# Sample non-protected rows if more than needed
non_protected_rows = df[df['in_protected_group'] == False]
print(f"Total non-protected rows: {non_protected_rows.shape[0]}")

# Step 5: Randomly sample non-protected rows to fill the gap to 150,000 rows
if rows_needed > 0:
    sampled_non_protected_rows = non_protected_rows.sample(n=rows_needed, random_state=1)
    df = pd.concat([protected_rows, sampled_non_protected_rows], ignore_index=True)
    print(f"Randomly sampled non-protected rows: {sampled_non_protected_rows.shape[0]} rows")
else:
    df = protected_rows

# Drop the 'in_protected_group' column before saving
df = df.drop(columns=['in_protected_group'])
print(f"Final row count before saving:{df.shape[0]} rows")

# check correct data types before saving
df['book_id'] = df['book_id'].astype(int)
df['num_pages'] = df['num_pages'].astype(int)
df['publication_year'] = df['publication_year'].astype(int)
df['rating_count'] = df['rating_count'].astype(int)
df['isbn'] = df['isbn'].astype(str)
df['title'] = df['title'].astype(str)
df['description'] = df['description'].astype(str)
df['publisher'] = df['publisher'].astype(str)
df['image_url'] = df['image_url'].astype(str)
df['average_rating'] = pd.to_numeric(df['average_rating'], errors='coerce')

# Select only the necessary columns to save
df = df[['book_id', 'isbn', 'title', 'average_rating', 'rating_count', 'image_url',
         'publication_year', 'num_pages', 'publisher', 'description']]

# Save the final dataframe to CSV
output_file_path = 'books.csv'
df.to_csv(output_file_path, index=False)

# Display final number of rows and file size after saving
final_file_size = os.path.getsize(output_file_path) / (1024*1024)
print(f"Final file size: {final_file_size:.2f} MB")
