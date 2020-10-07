export class WaveryConfiguration {
    constructor(stopWords = []) {
        this.stopWords = stopWords;
    }
    skipWord(word) {
        return this.stopWords.indexOf(word) !== -1;
    }
}
