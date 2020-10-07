export class Score {
  
    constructor(public score: number, public docId: string, public name: string) {}
    
    compareTo(other: Score) {
      if (other.score < this.score) {
        return -1;
      }
      return 1;
    }
    
  }