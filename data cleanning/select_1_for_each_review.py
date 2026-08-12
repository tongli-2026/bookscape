# import pandas as pd
#
# # Load the CSV file
# reviews_df = pd.read_csv('filtered_reviews_with_valid_book_ids.csv')
#
# # Step 1: Filter reviews with rating 5 and exclude spoilers
# rating_5_df = reviews_df[(reviews_df['rating'] == 5) & (~reviews_df['review_text'].str.contains("\*\* spoiler alert \*\*", na=False))]
#
# # Step 2: Select one review per book_id for reviews with rating 5
# unique_reviews_df = rating_5_df.drop_duplicates(subset='book_id', keep='first')
#
# # Step 3: Identify books without a rating-5 review
# books_with_rating_5 = unique_reviews_df['book_id']
# remaining_books_df = reviews_df[~reviews_df['book_id'].isin(books_with_rating_5)]
#
# # Step 4: For each remaining book, select the review with the highest rating (excluding spoilers)
# remaining_books_df = remaining_books_df[~remaining_books_df['review_text'].str.contains("\*\* spoiler alert \*\*", na=False)]
# remaining_books_df = remaining_books_df.sort_values(['book_id', 'rating'], ascending=[True, False]).drop_duplicates(subset='book_id', keep='first')
#
# # Step 5: Combine the rating-5 reviews and highest-rated reviews for books without rating 5
# final_reviews_df = pd.concat([unique_reviews_df, remaining_books_df])
#
# # Save the result to a new CSV file
# final_reviews_df.to_csv('one_review_per_book_highest_rating_no_spoilers.csv', index=False)
#
# # Optional: Display the result
# print(final_reviews_df.head())

#
# import pandas as pd
#
# # Load the file
# file_path = 'one_review_per_book_highest_rating_no_spoilers.csv'
# try:
#     reviews_df = pd.read_csv(file_path)
#
#     # Count the number of distinct book_id values
#     distinct_book_ids_count = reviews_df['book_id'].nunique()
#     print(f"The file '{file_path}' contains {distinct_book_ids_count} distinct book_id values.")
#
# except FileNotFoundError:
#     print(f"The file '{file_path}' was not found. Please check the file path.")

# import pandas as pd
#
# # Load the filtered reviews file
# file_path = 'filtered_reviews_with_valid_book_ids.csv'
# try:
#     reviews_df = pd.read_csv(file_path)
#
#     # Filter out reviews with spoilers
#     reviews_df = reviews_df[~reviews_df['review_text'].str.contains("\*\* spoiler alert \*\*", case=False, na=False)]
#
#     # Get the highest and lowest rating reviews for each book_id
#     highest_reviews = reviews_df.loc[reviews_df.groupby('book_id')['rating'].idxmax()]
#     lowest_reviews = reviews_df.loc[reviews_df.groupby('book_id')['rating'].idxmin()]
#
#     # Add a column to indicate if the review is highest or lowest
#     highest_reviews['review_type'] = 'highest'
#     lowest_reviews['review_type'] = 'lowest'
#
#     # Keep only the relevant columns
#     highest_reviews = highest_reviews[['review_id', 'book_id', 'rating', 'review_text', 'timestamp']]
#     lowest_reviews = lowest_reviews[['review_id', 'book_id', 'rating', 'review_text', 'timestamp']]
#
#     # Combine the highest and lowest reviews into a single DataFrame
#     combined_reviews = pd.concat([highest_reviews, lowest_reviews], ignore_index=True)
#
#     # Reset index for better readability
#     combined_reviews.reset_index(drop=True, inplace=True)
#
#     # Show the combined reviews DataFrame
#     print(combined_reviews)
#
#     # Optionally, save the result to a new CSV file
#     combined_reviews.to_csv('highest_lowest_reviews_separate_rows_no_spoilers.csv', index=False)
#
# except FileNotFoundError:
#     print(f"The file '{file_path}' was not found. Please check the file path.")

import pandas as pd

# Load the CSV file
df = pd.read_csv('highest_lowest_reviews_separate_rows_no_spoilers.csv')

# Assign a new integer ID starting from 1 for each review
df['review_id'] = range(1, len(df) + 1)

# Save the modified DataFrame back to a CSV file
df.to_csv('highest_lowest_reviews_separate_rows_no_spoilers_reindexed.csv', index=False)



