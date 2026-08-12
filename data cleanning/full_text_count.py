import pandas as pd

# Load the CSV file
ebooks_df = pd.read_csv('ebooks.csv')

# Filter for non-empty 'full_text' and count distinct 'book_id's
non_empty_full_text_books = ebooks_df[ebooks_df['full_text'].notna() & (ebooks_df['full_text'] != '')]
distinct_book_count = non_empty_full_text_books['book_id'].nunique()

# Display the count
print("Number of distinct book_id with non-empty full_text:", distinct_book_count)
