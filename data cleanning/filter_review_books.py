import pandas as pd

# Load the valid book IDs
books_df = pd.read_csv('books.csv')
valid_book_ids = set(books_df['book_id'])

# Prepare the output CSV file
output_file = 'filtered_goodreads_reviews.csv'

# List to hold filtered chunks
filtered_chunks = []

count = 0
# Process the large JSON file in chunks
chunk_size = 10000  # Adjust based on memory capacity
for chunk in pd.read_json('goodreads_reviews_dedup.json', lines=True, chunksize=chunk_size):
    # Filter the chunk to keep only rows with valid book_id
    filtered_chunk = chunk[chunk['book_id'].isin(valid_book_ids)]

    # Append the filtered chunk to the list
    filtered_chunks.append(filtered_chunk)

    count += 10000
    print("finished: ")
    print(count)

# Concatenate all filtered chunks into a single DataFrame
result_df = pd.concat(filtered_chunks, ignore_index=True)

# Save the result to CSV
result_df.to_csv(output_file, index=False)
print("Finished filtering all reviews.")
