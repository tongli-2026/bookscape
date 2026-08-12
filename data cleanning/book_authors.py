import json
import pandas as pd

# Load the JSON file
file_path = 'goodreads_books.json'
data = []

with open(file_path, 'r', encoding='utf-8') as file:
    for line in file:
        try:
            data.append(json.loads(line))  # Assuming it's in JSON Lines format
        except json.JSONDecodeError:
            print(f"Error decoding JSON: {line.strip()}")

# Extract book_id, author_id, and role
book_authors = []

count = 0
for book in data:
    book_id = book.get('book_id')  # Adjust the key based on your JSON structure
    authors = book.get('authors', [])  # Assuming authors is a list of dictionaries
    for author in authors:
        author_id = author.get('author_id')  # Adjust key as needed
        role = author.get('role')  # Adjust key as needed
        book_authors.append({
            'book_id': book_id,
            'author_id': author_id,
            'role': role
        })
    count += 1
    print(count)

# Convert to DataFrame
df = pd.DataFrame(book_authors)

# Export to CSV
output_file_path = 'Book_Authors.csv'
df.to_csv(output_file_path, index=False)

print(f"Exported data to {output_file_path} with {len(df)} records.")
