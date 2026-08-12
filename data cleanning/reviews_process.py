import pandas as pd

# Load the filtered reviews file
filtered_reviews_df = pd.read_csv('filtered_goodreads_reviews.csv')

# # Total number of rows
# total_rows = filtered_reviews_df.shape[0]
# print("Total number of rows:", total_rows)
#
# # Count of distinct review_id
# distinct_review_id_count = filtered_reviews_df['review_id'].nunique()
# print("Number of distinct review_id:", distinct_review_id_count)

# # Count of distinct book_id
# distinct_book_id_count = filtered_reviews_df['book_id'].nunique()
# print("Number of distinct book_id:", distinct_book_id_count)

# # Display all columns for the first 10 rows
# pd.set_option('display.max_columns', None)  # Show all columns
# print(filtered_reviews_df.head(10))

# # Display data types for each column
# print(filtered_reviews_df.dtypes)
#
# # Alternatively, use .info() for a summary that includes data types
# filtered_reviews_df.info()

