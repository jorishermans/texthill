import { Normalizer, Score, WaveryConfiguration, IStore } from ".";
export declare type IDict<T> = {
    [id: string]: T;
};
export declare class Wavery {
    private s;
    static LATEST_DOCID: string;
    configuration: WaveryConfiguration;
    normalizer: Normalizer;
    _N: number;
    constructor(s: IStore);
    feedDoc(key: string, unstructuredDoc: string): Promise<number>;
    _feedDocBy(key: string, unstructuredDoc: string, docs_map: IDict<number>, docIds_map: IDict<string>, index: IDict<Array<any>>, tf: IDict<Array<any> | string>, latestDocId: number): Promise<number>;
    search(sentence: string): Promise<Score[]>;
    _setTfInStore(tf: any, docId: any, word: any): any;
    _latestDocId(latestDocId: number): number;
}
