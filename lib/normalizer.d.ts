import { PorterStemmer } from "./stemmer/porter_stemmer";
export declare class Normalizer {
    private stemmer;
    static defaultStemmer: PorterStemmer;
    constructor(stemmer?: PorterStemmer);
    normalize(word: string): string;
}
