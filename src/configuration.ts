export class WaveryConfiguration {
  
    constructor(public stopWords: string[] = []) {
    }
    
    skipWord(word: string) {
      return this.stopWords.indexOf(word) !== -1;
    }
  }