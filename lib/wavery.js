var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Normalizer, Score, Vector, WaveryConfiguration } from "./index.js";
import { intersect } from "./utilities.js";
export class Wavery {
    constructor(s) {
        this.s = s;
        this.configuration = new WaveryConfiguration();
        this.normalizer = new Normalizer();
        this._N = 0;
    }
    feedDoc(key, unstructuredDoc) {
        return __awaiter(this, void 0, void 0, function* () {
            // lookup if doc already exist
            const values = yield Promise.all([this.s.getItem("docs", new Map()),
                this.s.getItem("docIds", new Map()),
                this.s.getItem("index", new Map()),
                this.s.getItem("tf", new Map()),
                this.s.getItem(Wavery.LATEST_DOCID)]);
            const docs_map = values[0];
            const docIds_map = values[1];
            // reverse index
            const index = values[2];
            // store tf
            const tf = values[3];
            const latestDocId = values[4];
            return yield this._feedDocBy(key, unstructuredDoc, docs_map, docIds_map, index, tf, latestDocId);
        });
    }
    _feedDocBy(key, unstructuredDoc, docs_map, docIds_map, index, tf, latestDocId) {
        return __awaiter(this, void 0, void 0, function* () {
            var docInfo = docs_map.get(key);
            let docId;
            if (docInfo == null) {
                // put docId info into persistence
                docId = this._latestDocId(latestDocId);
                docs_map.set(key, docId);
                yield this.s.setItem("docs", docs_map);
                docIds_map.set(`${docId}`, key);
                yield this.s.setItem("docIds", docIds_map);
            }
            else {
                docId = docInfo;
                // docId already exist so clear the document in the index before re-indexing the new document
                let removals = [];
                Object.keys(index).forEach((key) => {
                    const value = index[key];
                    if (Array.isArray(value)) {
                        const postings = value;
                        postings.splice(postings.indexOf(docId), 1);
                    }
                });
                removals.forEach((o) => delete index[o]);
                removals = [];
                Object.keys(tf).forEach((key) => {
                    const value = tf[key];
                    if (Array.isArray(value)) {
                        const mapWithDocId = value;
                        mapWithDocId.slice(mapWithDocId.indexOf(`${docId}`), 1);
                        if (mapWithDocId.length == 0) {
                            removals.push(key);
                        }
                    }
                });
                removals.forEach((o) => delete tf[o]);
            }
            const words = unstructuredDoc.split(" ");
            for (let word of words) {
                word = this.normalizer.normalize(word);
                if (!this.configuration.skipWord(word)) {
                    let wordSet = index[word];
                    if (Array.isArray(wordSet)) {
                        if (wordSet == null) {
                            wordSet = [];
                        }
                        if (wordSet.indexOf(docId) === -1) {
                            wordSet.push(docId);
                            index[word] = wordSet;
                        }
                    }
                    tf = this._setTfInStore(tf, `${docId}`, word);
                }
            }
            yield this.s.setItem("tf", tf);
            yield this.s.setItem("index", index);
            return docId;
        });
    }
    search(sentence) {
        return __awaiter(this, void 0, void 0, function* () {
            let findDocs = [];
            const index = yield this.s.getItem('index');
            if (index != null) {
                let docIdsRetrieval;
                for (let term of sentence.split(" ")) {
                    term = this.normalizer.normalize(term);
                    if (index[term] != null && !this.configuration.skipWord(term)) {
                        if (docIdsRetrieval == null) {
                            docIdsRetrieval = new Set(index[term]);
                        }
                        else {
                            docIdsRetrieval = intersect(docIdsRetrieval, new Set(index[term]));
                        }
                    }
                }
                // calculate scores for every document
                const docIds = yield this.s.getItem('docIds');
                const tf = yield this.s.getItem('tf');
                const N = docIds.length;
                if (docIdsRetrieval != null) {
                    for (var docId in docIdsRetrieval) {
                        let scorings = new Vector();
                        let terms = sentence.split(" ");
                        for (let term of sentence.split(" ")) {
                            term = this.normalizer.normalize(term);
                            let tf_value = tf[term] != null ? tf[term][`${docId}`] : 0;
                            const postings = new Set(index[term]);
                            let df = postings != null ? postings.size : 0;
                            const score = (1 + Math.log(tf_value)) * Math.log(N / df);
                            scorings.add(score);
                        }
                        // only normalize it when you have more then one terms
                        if (terms.length > 1) {
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
        });
    }
    // set a term frequency in a certain document
    _setTfInStore(tf, docId, word) {
        let tf_map = tf[word];
        if (tf_map == null) {
            tf_map = new Map();
        }
        if (tf_map[docId] == null) {
            tf_map[docId] = 0;
        }
        tf_map[docId]++;
        tf[word] = tf_map;
        return tf;
    }
    _latestDocId(latestDocId) {
        if (latestDocId == null) {
            this.s.setItem(Wavery.LATEST_DOCID, 1);
            latestDocId = 0;
        }
        else {
            this.s.setItem(Wavery.LATEST_DOCID, latestDocId + 1);
        }
        return latestDocId;
    }
}
Wavery.LATEST_DOCID = "latest_docId";
