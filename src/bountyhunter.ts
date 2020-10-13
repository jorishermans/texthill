import { Normalizer, Score, Vector, Configuration, Store } from ".";
import { intersect } from "./utilities";

export type IDict<T> = { [id: string] : T; }

export class BountyHunter {
  
    static LATEST_DOCID = "latest_docId";
    
    _N = 0; 
    
    constructor(private s: Store, public normalizer = new Normalizer(), public configuration = new Configuration()) { }
    
    async feedDoc(key: string, unstructuredDoc: string) {
      // lookup if doc already exist
      const [docs_map, docIds_map, index, tf, latestDocId] = await Promise.all([this.s.getItem("docs", {}), 
                this.s.getItem("docIds", {}),
                this.s.getItem("index", {}),
                this.s.getItem("tf", {}),
                this.s.getItem(BountyHunter.LATEST_DOCID)])
  
      return await this._feedDocBy(key, unstructuredDoc, docs_map, docIds_map, index, tf, latestDocId);
    }

    async _feedDocBy(key: string, unstructuredDoc: string, docs_map: IDict<number>, 
        docIds_map: IDict<string>, index: IDict<Array<any>>, tf: IDict<Array<any> | string>, latestDocId: number) {
      var docInfo = docs_map[key];
                
      let docId: number;
      if (docInfo==null) {
         // put docId info into persistence
         docId = this._latestDocId(latestDocId);
  
         docs_map[key] = docId;
         await this.s.setItem("docs", docs_map);
                  
         docIds_map[`${docId}`] = key;
         await this.s.setItem("docIds", docIds_map);
      } else {
        docId = docInfo;
        this.removeDocIdFromIndex(index, tf, docId);
      }
                
      const words = unstructuredDoc.split(" ");
      for (let word of words) {
           word = this.normalizer.normalize(word);
           if (!this.configuration.skipWord(word)) {
               let wordSet = index[word];
                if (wordSet==null) {
                    wordSet = [];
                }
                if (wordSet.indexOf(docId) === -1) {
                    wordSet.push(docId);
                    index[word] = wordSet;
                }

               tf = this._setTfInStore(tf, `${docId}`, word);
           }
      }
      
      await this.s.setItem("tf", tf);
      await this.s.setItem("index", index);
                
      return docId;
    }

    private removeDocIdFromIndex(index: IDict<Array<any>>, tf: IDict<Array<any> | string>, docId: number) {
         // docId already exist so clear the document in the index before re-indexing the new document
         let removals: string[] = [];
         Object.keys(index).forEach((key) => {
            const value = index[key];
            if (Array.isArray(value)) {
                const postings = value;
                postings.splice(postings.indexOf(docId), 1);
                if (postings.length === 0) { removals.push(key); }
            }
         });
         removals.forEach((o) => delete index[o]);
         removals = [];
         Object.keys(tf).forEach((key) => {
            const value = tf[key];
           if (Array.isArray(value)) {
               const mapWithDocId = value;
                      
               mapWithDocId.slice(mapWithDocId.indexOf(`${docId}`), 1);
                      
               if (mapWithDocId.length==0) {
                   removals.push(key);
               }
           }
         });
         removals.forEach((o) => delete tf[o]);
         return {index, tf};
    }

    async removeDoc(key: string) {
      // lookup if doc already exist
      const [docs_map, docIds_map, index, tf, latestDocId] = await Promise.all([this.s.getItem("docs", {}), 
                this.s.getItem("docIds", {}),
                this.s.getItem("index", {}),
                this.s.getItem("tf", {}),
                this.s.getItem(BountyHunter.LATEST_DOCID)])
  
      return await this._removeDocBy(key, docs_map, docIds_map, index, tf, latestDocId);
    }

    async _removeDocBy(key: string, docs_map: IDict<number>, 
      docIds_map: IDict<string>, index: IDict<Array<any>>, tf: IDict<Array<any> | string>, latestDocId: number) { 
        var docId = docs_map[key];

        if (docId!=null) {
          delete docs_map[key];
          await this.s.setItem("docs", docs_map);
                   
          delete docIds_map[`${key}`];
          
          await this.s.setItem("docIds", docIds_map);
          this.removeDocIdFromIndex(index, tf, docId);

          await this.s.setItem("tf", tf);
          await this.s.setItem("index", index);
       }
    }
    
    async search(sentence: string) {
      let findDocs = [];
      const index = await this.s.getItem('index');

      if (index!=null) {
        let docIdsRetrieval;
        for (let term of sentence.split(" ")) {
          term = this.normalizer.normalize(term);
          if (index[term]!=null && !this.configuration.skipWord(term)) {
            if (docIdsRetrieval==null) {
              docIdsRetrieval = new Set<string>(index[term]);
            } else {
              docIdsRetrieval = intersect(docIdsRetrieval, new Set<string>(index[term]));
            }
          }
        }
        
        // calculate scores for every document
        const docIds = await this.s.getItem('docIds');
        const tf = await this.s.getItem('tf');

        const N = Object.keys(docIds).length;
        if (docIdsRetrieval!=null) {
          for (const docId of docIdsRetrieval) {
            let scorings = new Vector();
            let terms = sentence.split(" ");
            for (let term of sentence.split(" ")) {
              term = this.normalizer.normalize(term);
              let tf_value = tf[term]!=null ? tf[term][`${docId}`] : 0;
              const postings = new Set(index[term]);
              let df = postings!=null ? postings.size : 0;
              
              const score = (1 + Math.log(tf_value)) * Math.log(N/df);
              scorings.add(score);
            }
            // only normalize it when you have more then one terms
            if (terms.length>1) {
              scorings = scorings.normalize();
            }
            const totalScore = scorings.avg();
            
            findDocs.push(new Score(totalScore, docId, docIds[`${docId}`]));
          }
        }
      }
      // sort the bounties on score
      findDocs.sort((a, b) => a.compareTo(b));
      return findDocs;
    }
    
    // set a term frequency in a certain document
    _setTfInStore(tf: any, docId: any, word: any) {
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
    
    _latestDocId(latestDocId: number) {
      if (latestDocId==null) {
        this.s.setItem(BountyHunter.LATEST_DOCID, 1);
        latestDocId = 0;
      } else {
        this.s.setItem(BountyHunter.LATEST_DOCID, latestDocId + 1);
      }
      return latestDocId;
    }
    
  }