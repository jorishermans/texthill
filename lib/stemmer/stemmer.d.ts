export declare abstract class Stemmer {
    abstract stem(): void;
    abstract add(ch: string): void;
    abstract addWord(w: string): void;
    abstract reset(): void;
}
