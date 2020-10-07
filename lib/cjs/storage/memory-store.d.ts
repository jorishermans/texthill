import { IStore } from "../";
export declare class MemoryStore extends IStore {
    private _values;
    getItemSync(key: string, defaultValue?: any): any;
    getItem(key: string, defaultValue?: any): Promise<any>;
    setItem(key: string, data: any): Promise<void>;
    removeItem(key: string): Promise<void>;
}
