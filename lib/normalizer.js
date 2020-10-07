import { PorterStemmer } from "./stemmer/porter_stemmer";
export class Normalizer {
    constructor(stemmer = Normalizer.defaultStemmer) {
        this.stemmer = stemmer;
    }
    normalize(word) {
        // first make it a lowercase word
        word = word.toLowerCase();
        // filter out punctuations & special chars
        word = word.replace(new RegExp('[^\w\s]'), "");
        // stem this word
        this.stemmer.addWord(word);
        this.stemmer.stem();
        word = this.stemmer.toString();
        this.stemmer.reset();
        return word;
    }
}
Normalizer.defaultStemmer = new PorterStemmer();
