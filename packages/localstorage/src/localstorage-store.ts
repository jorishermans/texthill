declare var localStorage: any;
import { Store } from '@texthill/core';

export class LocalStorageStore implements Store {
    
    constructor() { }

    private get browserStorage() {
        return localStorage;
    }

    async getItem(key: string, defaultValue?: any) {
        const data = this.browserStorage.get(key);
        return data ? data : defaultValue;
    }
    async setItem(key: string, data: any) {
        this.browserStorage.set(key, data);
    }
    async removeItem(key: string) {
        this.browserStorage.removeItem(key);
    }

}