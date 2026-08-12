import json
import csv
import re

# Function to clean ISBN by stripping quotes and keeping only digits
def clean_isbn(isbn):
    isbn = isbn.strip("'\"")  # Strip any single or double quotes
    return ''.join(re.findall(r'\d+', isbn))  # Keep only digits

# Open the JSON file and process records
with open('goodreads_books.json', 'r') as file:
    sample_records = []
    for i, line in enumerate(file):
        record = json.loads(line.strip())

        # Clean the 'isbn' field if it exists
        if 'isbn' in record:
            cleaned_isbn = clean_isbn(record['isbn'])
            if cleaned_isbn:  # Only include records where 'isbn' is not empty after cleaning
                record['isbn'] = cleaned_isbn

                # Check if ratings_count is valid and greater than 100
                ratings_count = record.get('ratings_count', '')
                if ratings_count and int(ratings_count) > 100:
                    # Check for other conditions
                    authors = record.get('authors', '')
                    title = record.get('title', '')

                    # Filtering conditions
                    if authors and title:  # Ensure authors and title are not empty
                        # You can add more checks here, for example, checking publication year
                        publication_year = record.get('publication_year', None)
                        if publication_year and int(publication_year) > 1900:  # Example check
                            # Extract only the desired columns
                            filtered_record = {
                                'isbn': record.get('isbn'),
                                'text_review_count': record.get('text_reviews_count'),
                                'series': record.get('series'),
                                'country_code': record.get('country_code'),
                                'language_code': record.get('language_code'),
                                'asin': record.get('asin'),
                                'is_ebook': record.get('is_ebook'),
                                'average_rating': record.get('average_rating'),
                                'kindle_asin': record.get('kindle_asin'),
                                'similar_books': record.get('similar_books'),
                                'description': record.get('description'),
                                'format': record.get('format'),
                                'link': record.get('link'),
                                'author_id': [author['author_id'] for author in record.get('authors', [])],  # Collect author IDs
                                'publisher': record.get('publisher'),
                                'num_pages': record.get('num_pages'),
                                'isbn13': record.get('isbn13'),
                                'edition_information': record.get('edition_information'),
                                'publication_year': record.get('publication_year'),
                                'url': record.get('url'),
                                'book_id': record.get('book_id'),
                                'rating_count': record.get('ratings_count'),
                                'work_id': record.get('work_id'),
                                'title': record.get('title'),
                                'title_without_series': record.get('title_without_series')
                            }
                            sample_records.append(filtered_record)

        # if i >= 999:  # Process only the first 1000 records
        #     break

# Get the fieldnames for the CSV file based on filtered records
fieldnames = sample_records[0].keys() if sample_records else []

# Write the cleaned and filtered records to a new CSV file
with open('goodreads_books_filtered_v2.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    # Write the header (column names)
    writer.writeheader()

    # Write each cleaned record to the CSV file
    for record in sample_records:
        writer.writerow(record)

# Output the number of rows left
print(f"Number of rows left after filtering: {len(sample_records)}")
