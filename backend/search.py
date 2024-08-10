from flask import Flask, request, jsonify
import nltk
import json
from flask_cors import CORS
from spellchecker import SpellChecker

app = Flask(__name__)
CORS(app)


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

def load(filename):
    with open(filename) as data_file:
        data = json.load(data_file)
    return data

def loadBuku(filename, encoding='utf-8'):
    with open(filename, encoding=encoding) as data_file:
        data = json.load(data_file)
    return data["buku"]

def tokenize(text):
    return nltk.word_tokenize(text.lower())

def jaccard_similarity(tokens1, tokens2):
    intersection = set(tokens1) & set(tokens2)
    union = set(tokens1) | set(tokens2)
    return len(intersection) / len(union)

synonyms_dict = load('dict.json')

def get_synonyms(word):
    if word in synonyms_dict:
        return synonyms_dict[word].get('sinonim', [])
    else:
        return []

def check_spelling(word):
    corrected_word = spell.correction(word)

    if corrected_word != word:
        print(f"Kata '{word}' salah eja. Diduga maksud Anda '{corrected_word}'")
    return corrected_word

@app.route('/list', methods=['GET'])
def list_books():
    data_buku = loadBuku('buku.json')
    return jsonify(data_buku if data_buku else {"error": "Data not found"})

@app.route('/search', methods=['GET'])
def search_books():
    keyword = request.args.get('keyword')

    if not keyword:
        return jsonify({"error": "Missing 'keyword' parameter"}), 400

    # Cek dan perbaiki typo pada keyword
    corrected_keyword = check_spelling(keyword)
    
    # Tokenisasi kata kunci
    tokenized_keyword = tokenize(corrected_keyword)
    
    # Load data buku
    data_buku = loadBuku('buku.json')
    
    # Tokenisasi judul dan abstrak buku
    tokenized_judul_buku = [tokenize(buku["judul"]) for buku in data_buku]
    tokenized_abstrak_buku = [tokenize(buku["abstrak"]) for buku in data_buku]
    
    # Hitung skor kesamaan menggunakan Jaccard Similarity
    skor_kesamaan_judul = [jaccard_similarity(judul, tokenized_keyword) for judul in tokenized_judul_buku]
    skor_kesamaan_abstrak = [jaccard_similarity(abstrak, tokenized_keyword) for abstrak in tokenized_abstrak_buku]
    
    # Gabungkan skor kesamaan judul dan abstrak
    skor_kesamaan_gabungan = [skor_judul + skor_abstrak for skor_judul, skor_abstrak in zip(skor_kesamaan_judul, skor_kesamaan_abstrak)]
    
    # Menyusun data buku berdasarkan skor kesamaan
    relevant_books = [
        {
            "judul": buku["judul"],
            "img": buku["img"],
            "abstrak": buku["abstrak"],
            "skor_kesamaan": skor
        } for buku, skor in zip(data_buku, skor_kesamaan_gabungan) if skor > 0
    ]
    
    # Log untuk debugging
    print("Mengirimkan data berikut ke frontend:")
    print(relevant_books)

    # Mengembalikan hasil dengan correctedKeyword jika ada koreksi
    return jsonify({
        "correctedKeyword": corrected_keyword if corrected_keyword != keyword else None,
        "data": sorted(relevant_books, key=lambda x: x["skor_kesamaan"], reverse=True)
    })

if __name__ == '__main__':
    app.run(debug=True)
