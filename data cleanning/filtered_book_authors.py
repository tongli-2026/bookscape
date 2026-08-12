import pandas as pd

# Load the CSV files
book_authors_df = pd.read_csv('Book_Authors.csv')
books_df = pd.read_csv('books.csv')

# Filter Book_Authors to only keep rows with book_id in books.csv
filtered_book_authors = book_authors_df[book_authors_df['book_id'].isin(books_df['book_id'])]

# Display the filtered DataFrame
print(filtered_book_authors)

# Count distinct book_id in the filtered DataFrame
distinct_book_count = filtered_book_authors['book_id'].nunique()

# Display the count of distinct book_id
print("Number of distinct book_id in filtered DataFrame:", distinct_book_count)

# Export the filtered DataFrame to a new CSV file
filtered_book_authors.to_csv('Filtered_Book_Authors.csv', index=False)