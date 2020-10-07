import { PorterStemmer } from "./stemmer/porter_stemmer";
export class Normalizer {
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
Normalizer.defaultStemmer = new PorterStemmer();
