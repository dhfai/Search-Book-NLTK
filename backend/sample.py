from flask import Flask, request, jsonify
import nltk
import json
import mysql.connector
from flask_cors import CORS
from spellchecker import SpellChecker
from prettytable import PrettyTable

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

def check_spelling(word):
    # Correct the spelling
    corrected_word = spell.correction(word)

    # Check if the correction differs from the original word
    if corrected_word != word:
        print(f"Kata '{word}' salah eja. Diduga maksud Anda '{corrected_word}'")
    else:
        print(f"Tidak ada koreksi untuk kata '{word}'.")

    return corrected_word

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

# Search books by keyword
def search_books_by_keyword(keyword):
    data_buku = get_books_from_db()
    
    tokenized_keyword = tokenize(keyword)
    tokenized_judul_buku = [tokenize(buku["judul"]) for buku in data_buku]
    tokenized_abstrak_buku = [tokenize(buku["abstrak"]) for buku in data_buku]
    
    skor_kesamaan_judul = [jaccard_similarity(judul, tokenized_keyword) for judul in tokenized_judul_buku]
    skor_kesamaan_abstrak = [jaccard_similarity(abstrak, tokenized_keyword) for abstrak in tokenized_abstrak_buku]
    
    skor_kesamaan_gabungan = [skor_judul + skor_abstrak for skor_judul, skor_abstrak in zip(skor_kesamaan_judul, skor_kesamaan_abstrak)]
    
    relevant_books = [
        {
            "judul": buku["judul"],
            "img": buku["img"],
            "abstrak": buku["abstrak"],
            "skor_kesamaan": skor
        } for buku, skor in zip(data_buku, skor_kesamaan_gabungan) if skor > 0
    ]
    
    return relevant_books

@app.route('/search', methods=['GET'])
def search_books():
    keyword = request.args.get('keyword')

    if not keyword:
        return jsonify({"error": "Missing 'keyword' parameter"}), 400

    corrected_keyword = check_spelling(keyword)

    # Pencarian biasa
    results_biasa = search_books_by_keyword(corrected_keyword)

    # Pencarian dengan sinonim
    sinonim = get_synonyms(corrected_keyword)
    all_keywords = [corrected_keyword] + sinonim
    results_sinonim = []
    for k in all_keywords:
        results_sinonim.extend(search_books_by_keyword(k))

    # Hapus duplikat
    results_sinonim = {buku["judul"]: buku for buku in results_sinonim}.values()

    # Hitung jumlah hasil
    biasa_count = len(results_biasa)
    sinonim_count = len(results_sinonim)

    # Tampilkan hasil dalam bentuk tabel di terminal
    table = PrettyTable()
    table.field_names = ["Jenis Pencarian", "Jumlah Data Ditemukan"]
    table.add_row(["Pencarian Biasa", biasa_count])
    table.add_row(["Pencarian Sinonim Jaccard", sinonim_count])
    print(table)

    return jsonify({
        "correctedKeyword": corrected_keyword if corrected_keyword != keyword else None,
        "data_biasa": results_biasa,
        "data_sinonim": list(results_sinonim)
    })

if __name__ == '__main__':
    app.run(debug=True)
