import { Stemmer } from "./stemmer";
/**
  * Stemmer, implementing the Porter Stemming Algorithm
  *
  * The Stemmer class transforms a word into its root form.  The input
  * word can be provided a character at time (by calling add()), or at once
  * by calling one of the various stem(something) methods.
  */
export declare class PorterStemmer extends Stemmer {
    b: any[];
    i: any;
    i_end: any;
    j: any;
    k: any;
    constructor();
    /**
     * reset() resets the stemmer so it can stem another word.  If you invoke
     * the stemmer by calling add(char) and then stem(), you must call reset()
     * before starting another word.
     */
    reset(): void;
    /**
     * Add a character to the word being stemmed.  When you are finished
     * adding characters, you can call stem(void) to stem the word.
     */
    add(ch: string): void;
    /** Adds wLen characters to the word being stemmed contained in a portion
     * of a char[] array. This is like repeated calls of add(char ch), but
     * faster.
     */
    addWord(w: string): void;
    /**
     * After a word has been stemmed, it can be retrieved by toString(),
     * or a reference to the internal buffer can be retrieved by getResultBuffer
     * and getResultLength (which is generally more efficient.)
     */
    toString(): string;
    /**
     * Returns the length of the word resulting from the stemming process.
     */
    getResultLength(): any;
    /**
     * Returns a reference to a character buffer containing the results of
     * the stemming process.  You also need to consult getResultLength()
     * to determine the length of the result.
     */
    getResultBuffer(): any[];
    cons(i: number): boolean;
    m(): number;
    vowelinstem(): boolean;
    doublec(j: any): boolean;
    cvc(i: number): boolean;
    ends(s: string): boolean;
    setto(s: string): void;
    r(s: string): void;
    step1(): void;
    step2(): void;
    step3(): void;
    step4(): void;
    step5(): void;
    step6(): void;
    /** Stem the word placed into the Stemmer buffer through calls to add().
     * Returns true if the stemming process resulted in a word different
     * from the input.  You can retrieve the result with
     * getResultLength()/getResultBuffer() or toString().
     */
    stem(): void;
}
