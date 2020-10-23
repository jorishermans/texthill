import { Normalizer, Score, Vector, Configuration, Store } from ".";
import { inspectText } from "./inspect-text";
import { intersect } from "./utilities";

export type IDict<T> = { [id: string] : T; }
export type TextHillIndex = {
  docIds: IDict<string>;
  docs: IDict<number>;
  index: IDict<Array<any>>, 
  tf: IDict<{}>, 
  latestDocId: number
}

export interface FeedOptions {
  ignoreProps?: string[];
  indexName?: string;
}

export class TextHill {
  
    _N = 0; 

    private _defaultIndex = {docIds: {}, docs: {}, index: {}, tf: {}, latestDocId: 0};
    
    constructor(private s: Store, public normalizer = new Normalizer(), public configuration = new Configuration()) { }
    
    private saveKey(options?: Readonly<FeedOptions>) {
      return `index${options?.indexName ?? ''}`;
    }

    async searchModel(options?: Readonly<FeedOptions>) {
      return await this.s.getItem<TextHillIndex>(this.saveKey(options), this._defaultIndex);
    }

    async feedDoc(key: string, unstructuredDoc: any, options?: Readonly<FeedOptions>) {
      var ignoreProps = options?.ignoreProps ?? [];
      let text = inspectText(unstructuredDoc, ignoreProps);
      // lookup if doc already exist
      const searchModel: TextHillIndex = await this.searchModel(options);
  
      return await this._feedDocBy(key, text, searchModel, options);
    }

    private async _feedDocBy(key: string, unstructuredDoc: string, saveable: TextHillIndex, options?: Readonly<FeedOptions>) {
      var docInfo = saveable.docs[key];
                
      let docId: number;
      if (docInfo==null) {
         // put docId info into persistence
         saveable.latestDocId += 1;
         docId = saveable.latestDocId;

         saveable.docs[key] = docId;                  
         saveable.docIds[`${docId}`] = key;
      } else {
        docId = docInfo;
        saveable = this.removeDocIdFromIndex(saveable, docId);
      }
                
      const words = unstructuredDoc.split(" ");
      for (let word of words) {
           word = this.normalizer.normalize(word);
           if (!this.configuration.skipWord(word)) {
               let wordSet = saveable.index[word];
                if (wordSet==null) {
                    wordSet = [];
                }
                if (wordSet.indexOf(docId) === -1) {
                    wordSet.push(docId);
                    saveable.index[word] = wordSet;
                }

                saveable.tf = this._setTfInStore(saveable.tf, `${docId}`, word);
           }
      }
      
      await this.s.setItem(this.saveKey(options), saveable);         
      return docId;
    }

    private removeDocIdFromIndex(saveable: TextHillIndex , docId: number) {
         // docId already exist so clear the document in the index before re-indexing the new document
         let removals: string[] = [];
         Object.keys(saveable.index).forEach((key) => {
            const value = saveable.index[key];
            if (Array.isArray(value)) {
                const postings = value;
                postings.splice(postings.indexOf(docId), 1);
                if (postings.length === 0) { removals.push(key); }
            }
         });
         removals.forEach((o) => delete saveable.index[o]);
         removals = [];
         Object.keys(saveable.tf).forEach((key) => {
            const value = saveable.tf[key];
           if (Array.isArray(value)) {
               const mapWithDocId = value;
                      
               mapWithDocId.slice(mapWithDocId.indexOf(`${docId}`), 1);
                      
               if (mapWithDocId.length==0) {
                   removals.push(key);
               }
           }
         });
         removals.forEach((o) => delete saveable.tf[o]);
         return saveable;
    }

    async removeDoc(key: string, options?: Readonly<FeedOptions>) {
      // lookup if doc already exist
      const indexObj: TextHillIndex = await this.searchModel(options);
  
      return await this._removeDocBy(key, indexObj);
    }

    private async _removeDocBy(key: string, saveable: TextHillIndex, options?: Readonly<FeedOptions>) { 
        var docId = saveable.docs[key];

        if (docId!=null) {
          delete saveable.docs[key];    
          delete saveable.docIds[`${key}`];
          
          saveable = this.removeDocIdFromIndex(saveable, docId);

          await this.s.setItem(this.saveKey(options), saveable);
       }
    }
    
    async search(sentence: string, options?: Readonly<FeedOptions>) {
      let findDocs = [];
      const searchModel: TextHillIndex = await this.searchModel(options);

      if (searchModel.index!=null) {
        let docIdsRetrieval;
        for (let term of sentence.split(" ")) {
          term = this.normalizer.normalize(term);
          if (searchModel.index[term]!=null && !this.configuration.skipWord(term)) {
            if (docIdsRetrieval==null) {
              docIdsRetrieval = new Set<string>(searchModel.index[term]);
            } else {
              docIdsRetrieval = intersect(docIdsRetrieval, new Set<string>(searchModel.index[term]));
            }
          }
        }

        const N = Object.keys(searchModel.docIds).length;
        if (docIdsRetrieval!=null) {
          for (const docId of docIdsRetrieval) {
            let scorings = new Vector();
            let terms = sentence.split(" ");
            for (let term of sentence.split(" ")) {
              term = this.normalizer.normalize(term);
              const tf_term: any = searchModel.tf[term];
              let tf_value = tf_term!=null ? tf_term[`${docId}`] : 0;
              const postings = new Set(searchModel.index[term]);
              let df = postings!=null ? postings.size : 0;
              
              const score = (1 + Math.log(tf_value)) * Math.log(N/df);
              scorings.add(score);
            }
            // only normalize it when you have more then one terms
            if (terms.length>1) {
              scorings = scorings.normalize();
            }
            const totalScore = scorings.avg();
            
            findDocs.push(new Score(totalScore, docId, searchModel.docIds[`${docId}`]));
          }
        }
      }
      // sort the bounties on score
      findDocs.sort((a, b) => a.compareTo(b));
      return findDocs;
    }
    
    // set a term frequency in a certain document
    private _setTfInStore(tf: any, docId: any, word: any) {
      let tf_map = tf[word];
      if (tf_map==null) {
         tf_map = new Map();
      }
      if (tf_map[docId]==null) {
         tf_map[docId] = 0;
      } 
      tf_map[docId]++;
      tf[word] = tf_map;
      
      return tf;
    }
    
  }