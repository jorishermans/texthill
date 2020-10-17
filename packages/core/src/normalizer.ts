import { PorterStemmer } from "./stemmer/porter_stemmer";

export class Normalizer {
  
    static defaultStemmer = new PorterStemmer();
    
    constructor(private stemmer = Normalizer.defaultStemmer) {}
    
    normalize(word: string) {
      // first make it a lowercase word
      word = word.toLowerCase();
      // filter out punctuations & special chars
      word = word.replace(/[^\w\s]/gi, '')
      
      // stem this word
      word = this.stemmer.stem(word);
      return word;
    }
    
  }