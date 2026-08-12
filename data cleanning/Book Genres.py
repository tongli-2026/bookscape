import pandas as pd
import ast

# Load the CSV into a DataFrame (ensure file paths are correctly formatted)
df = pd.read_csv(r"D:\books.csv")

# Function to process the genre string and return the top 3 genres
def get_top_3_genres(genre_string):
    try:
        # Convert the genre string to a dictionary
        genres = ast.literal_eval(genre_string)

        # Sort genres by their counts in descending order and select the top 3
        sorted_genres = sorted(genres.items(), key=lambda x: x[1], reverse=True)[:3]

        # Extract the genre names from the sorted list
        top_genres = [genre for genre, _ in sorted_genres]

        # Join the top genres with commas
        return ', '.join(top_genres)
    except (ValueError, SyntaxError):
        # Handle any parsing issues
        return ""

# Apply the function to each row in the DataFrame
df['genres'] = df['genres'].apply(get_top_3_genres)

# Save the result to a new CSV file
df.to_csv(r"D:\books_top_genres.csv", index=False)

# Print the DataFrame to verify output
print(df)


import pandas as pd

# Load the CSV with consolidated genres into a DataFrame
df = pd.read_csv(r"D:\books_top_genres.csv")

# Create a new DataFrame by splitting genres into individual rows
df_expanded = df.assign(genres=df['genres'].str.split(', ')).explode('genres')

# Save the expanded DataFrame to a new CSV file
df_expanded.to_csv(r"D:\books_genres_expanded.csv", index=False)

# Print the expanded DataFrame to verify the result
print(df_expanded)