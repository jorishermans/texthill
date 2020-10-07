import { IStore } from "../";

type IDict<T> = { [id: string] : T; }

export class MemoryStore extends IStore {
    
    private _values: IDict<any> = {};

    getItemSync(key: string, defaultValue?: any) {
        return this._values[key] ? this._values[key] : defaultValue;
    }
    getItem(key: string, defaultValue?: any): Promise<any> {
         return Promise.resolve(this.getItemSync(key, defaultValue));
    }
    async setItem(key: string, data: any): Promise<void> {
        this._values[key] = data;
    }
    async removeItem(key: string): Promise<void> {
        delete this._values[key];
    }

}