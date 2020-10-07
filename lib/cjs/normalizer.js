"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Normalizer = void 0;
const porter_stemmer_1 = require("./stemmer/porter_stemmer");
class Normalizer {
    constructor(stemmer = Normalizer.defaultStemmer) {
        this.stemmer = stemmer;
    }
    normalize(word) {
        // first make it a lowercase word
        word = word.toLowerCase();
        // filter out punctuations & special chars
        word = word.replace(/[^\w\s]/gi, '');
        // stem this word
        word = this.stemmer.stem(word);
        return word;
    }
}
exports.Normalizer = Normalizer;
Normalizer.defaultStemmer = new porter_stemmer_1.PorterStemmer();
