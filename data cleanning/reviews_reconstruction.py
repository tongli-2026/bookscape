import pandas as pd
from datetime import datetime

# Output file path
output_file = 'filtered_reviews_all_111.csv'


# Function to convert review_id to integer
def convert_review_id(review_id):
    try:
        # Check if the review_id contains any hexadecimal characters
        if isinstance(review_id, str) and any(c in review_id for c in 'abcdef'):
            return int(review_id, 16)  # Convert hex to int
        else:
            return int(review_id)  # Convert decimal string to int
    except (ValueError, TypeError):
        return None  # Handle invalid formats


# Function to parse the timestamp manually
def parse_timestamp(ts):
    try:
        # Parse the timestamp string
        return datetime.strptime(ts, '%a %b %d %H:%M:%S %z %Y').date()
    except ValueError:
        return None  # Handle invalid formats

count = 0
# Process the large file in chunks
chunk_size = 10000  # Adjust based on memory capacity
with pd.read_csv('filtered_goodreads_reviews.csv', chunksize=chunk_size) as reader:
    # Initialize the output file with header in the first write
    for i, chunk in enumerate(reader):
        # Filter required columns
        chunk = chunk[['review_id', 'book_id', 'rating', 'review_text', 'date_updated']]

        # Convert review_id column with .loc to avoid SettingWithCopyWarning
        chunk.loc[:, 'review_id'] = chunk['review_id'].apply(convert_review_id)

        # Rename date_updated to timestamp and parse it, using .loc as well
        chunk.rename(columns={'date_updated': 'timestamp'}, inplace=True)
        chunk.loc[:, 'timestamp'] = chunk['timestamp'].apply(parse_timestamp)

        # Append chunk to CSV
        chunk.to_csv(output_file, mode='a', header=(i == 0), index=False)

    count += 10000
    print('finished:')
    print(count)

print("Filtered reviews saved to 'filtered_reviews_all_111.csv'.")
