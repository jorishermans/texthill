export declare class Score {
    score: number;
    docId: string;
    name: string;
    constructor(score: number, docId: string, name: string);
    compareTo(other: Score): 1 | -1;
}
