from flask import Flask, request, jsonify
import nltk
import json
import mysql.connector
from flask_cors import CORS
from spellchecker import SpellChecker

# Unduh resource "punkt" untuk tokenisasi
nltk.download('punkt')

app = Flask(__name__)
CORS(app)

# Load custom words for spell checker
def load_custom_words(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    custom_words = set()

    for word, details in data.items():
        custom_words.add(word)
        for synonym in details.get('sinonim', []):
            custom_words.add(synonym)
    
    return custom_words

custom_words = load_custom_words('dict.json')

spell = SpellChecker()
spell.word_frequency.load_words(custom_words)

# Load synonyms dictionary
def load(filename):
    with open(filename) as data_file:
        data = json.load(data_file)
    return data

synonyms_dict = load('dict.json')

def get_synonyms(word):
    if word in synonyms_dict:
        return synonyms_dict[word].get('sinonim', [])
    else:
        return []

def check_spelling(phrase):
    if not phrase:  # Handle empty input
        return phrase

    # Tokenize the phrase into individual words
    words = tokenize(phrase)

    corrected_words = []
    for word in words:
        # Correct the spelling of each word
        corrected_word = spell.correction(word)

        # If correction is None, use the original word
        if corrected_word is None:
            corrected_word = word
        
        corrected_words.append(corrected_word)

    # Join the corrected words back into a phrase
    corrected_phrase = ' '.join(corrected_words)

    # Log the correction for debugging
    if corrected_phrase != phrase:
        print(f"Kata '{phrase}' salah eja. Diduga maksud Anda '{corrected_phrase}'")
    else:
        print(f"Tidak ada koreksi untuk frasa '{phrase}'.")

    return corrected_phrase

# Tokenize text
def tokenize(text):
    return nltk.word_tokenize(text.lower())

# Calculate Jaccard similarity
def jaccard_similarity(tokens1, tokens2):
    intersection = set(tokens1) & set(tokens2)
    union = set(tokens1) | set(tokens2)
    return len(intersection) / len(union)

# Connect to MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host="if.unismuh.ac.id",
        user="root",
        port="3388",
        password="mariabelajar",
        database="perpus"
    )

# Retrieve book data from MySQL
def get_books_from_db():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("SELECT ID as id, Title AS judul, CoverURL AS img, Description AS abstrak FROM indonesian_books")
    books = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return books

@app.route('/list', methods=['GET'])
def list_books():
    data_buku = get_books_from_db()
    return jsonify(data_buku if data_buku else {"error": "Data not found"})

@app.route('/search', methods=['GET'])
def search_books():
    keyword = request.args.get('keyword')

    if not keyword:
        return jsonify({"error": "Missing 'keyword' parameter"}), 400

    # Check and correct spelling
    corrected_keyword = check_spelling(keyword)
    
    # Jika tidak ada koreksi atau pengoreksian gagal, lanjutkan dengan keyword asli
    if corrected_keyword is None:
        corrected_keyword = keyword

    # Tokenize the corrected keyword (for checking individual words)
    tokenized_keyword = tokenize(corrected_keyword)
    
    # Load book data from the database
    data_buku = get_books_from_db()
    
    # Tokenize book titles and abstracts
    tokenized_judul_buku = [tokenize(buku["judul"]) for buku in data_buku]
    tokenized_abstrak_buku = [tokenize(buku["abstrak"]) for buku in data_buku]
    
    # Calculate Jaccard similarity score for each token in keyword
    skor_kesamaan_gabungan = []

    for judul_tokens, abstrak_tokens in zip(tokenized_judul_buku, tokenized_abstrak_buku):
        # Calculate Jaccard similarity for each token in the keyword
        skor_kesamaan_judul = [jaccard_similarity(judul_tokens, [token]) for token in tokenized_keyword]
        skor_kesamaan_abstrak = [jaccard_similarity(abstrak_tokens, [token]) for token in tokenized_keyword]
        
        # Average the similarity scores for title and abstract
        skor_judul = sum(skor_kesamaan_judul) / len(tokenized_keyword)
        skor_abstrak = sum(skor_kesamaan_abstrak) / len(tokenized_keyword)
        
        # Combine title and abstract similarity scores
        skor_kesamaan_gabungan.append(skor_judul + skor_abstrak)

    # Sort and filter relevant books based on combined similarity score
    relevant_books = [
        {
            "judul": buku["judul"],
            "img": buku["img"],
            "abstrak": buku["abstrak"],
            "skor_kesamaan": skor
        } for buku, skor in zip(data_buku, skor_kesamaan_gabungan) if skor > 0
    ]
    
    # Log for debugging
    print("Mengirimkan data berikut ke frontend:")
    print(relevant_books)

    # Return results along with correctedKeyword if there was a correction
    return jsonify({
        "correctedKeyword": corrected_keyword if corrected_keyword != keyword else None,
        "data": sorted(relevant_books, key=lambda x: x["skor_kesamaan"], reverse=True)
    })


if __name__ == '__main__':
    app.run(debug=True)
