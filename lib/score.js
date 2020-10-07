export class Score {
    constructor(score, docId, name) {
        this.score = score;
        this.docId = docId;
        this.name = name;
    }
    compareTo(other) {
        if (other.score < this.score) {
            return -1;
        }
        return 1;
    }
}
