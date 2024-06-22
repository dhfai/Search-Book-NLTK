from flask import Flask, request, jsonify
import nltk
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

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

@app.route('/list', methods=['GET'])
def list_books():
    data_buku = loadBuku('buku.json')
    return jsonify(data_buku if data_buku else {"error": "Data not found"})


@app.route('/search', methods=['GET'])
def search_books():

    keyword = request.args.get('keyword')

    if not keyword:
        return jsonify({"error": "Missing 'keyword' parameter"}), 400


    tokenized_keyword = tokenize(keyword)


    data_buku = loadBuku('buku.json')


    tokenized_judul_buku = [tokenize(buku["judul"]) for buku in data_buku]
    tokenized_abstrak_buku = [tokenize(buku["abstrak"]) for buku in data_buku]

    skor_kesamaan_judul = [jaccard_similarity(judul, tokenized_keyword) for judul in tokenized_judul_buku]
    skor_kesamaan_abstrak = [jaccard_similarity(abstrak, tokenized_keyword) for abstrak in tokenized_abstrak_buku]

    skor_kesamaan_gabungan = [skor_judul + skor_abstrak for skor_judul, skor_abstrak in zip(skor_kesamaan_judul, skor_kesamaan_abstrak)]

    sinonim_kata_kunci = get_synonyms(keyword)

    tokenized_sinonim_kata_kunci = [tokenize(sinonim) for sinonim in sinonim_kata_kunci]

    if tokenized_sinonim_kata_kunci:
        print("Sinonim kata kunci dari " + keyword + " adalah: " + ", ".join(sinonim_kata_kunci) + ".")
        skor_kesamaan_sinonim = [max(jaccard_similarity(sinonim, judul) for sinonim in tokenized_sinonim_kata_kunci) for judul in tokenized_judul_buku]
    else:
        skor_kesamaan_sinonim = [0] * len(data_buku)
        print("Sinonim kata kunci dari " + keyword + " tidak ditemukan di database")

    skor_kesamaan_gabungan = [skor + sinonim_score for skor, sinonim_score in zip(skor_kesamaan_gabungan, skor_kesamaan_sinonim)]


    relevant_books = [{"judul": buku["judul"],"img": buku["img"], "abstrak": buku["abstrak"], "skor_kesamaan": skor} for buku, skor in zip(data_buku, skor_kesamaan_gabungan) if skor > 0]


    sorted_books = sorted(relevant_books, key=lambda x: x["skor_kesamaan"], reverse=True)
    

    return jsonify(sorted_books)

if __name__ == '__main__':
    app.run(debug=True)
