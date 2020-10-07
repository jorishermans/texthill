"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveryConfiguration = void 0;
class WaveryConfiguration {
    constructor(stopWords = []) {
        this.stopWords = stopWords;
    }
    skipWord(word) {
        return this.stopWords.indexOf(word) !== -1;
    }
}
exports.WaveryConfiguration = WaveryConfiguration;
