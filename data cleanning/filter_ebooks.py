import pandas as pd

# Load the ebook_full file (assuming it's a CSV)
ebook_full_df = pd.read_csv('ebook_full.csv')  # Adjust the file extension if necessary

# Display the description of the DataFrame
print(ebook_full_df.describe())

# Review the last 10 rows of the DataFrame
print(ebook_full_df.tail(10))

# Total number of rows
total_rows = ebook_full_df.shape[0]
print("Total number of rows:", total_rows)

# Count of distinct book_id
distinct_book_id_count = ebook_full_df['book_id'].nunique()
print("Number of distinct book_id:", distinct_book_id_count)

# Count the number of full_text entries that are not NaN
non_nan_full_text_count = ebook_full_df['full_text'].notna().sum()
print("Number of full_text entries that are not NaN:", non_nan_full_text_count)