declare var localStorage: any;
import { Store } from '@texthill/core';

export class LocalStorageStore implements Store {
    
    constructor() { }

    private get browserStorage() {
        return localStorage;
    }

    async getItem(key: string, defaultValue?: any) {
        const data = this.browserStorage.getItem(key);
        return data && typeof data === "string" ? JSON.parse(data) : defaultValue;
    }
    async setItem(key: string, data: any) {
        this.browserStorage.setItem(key, JSON.stringify(data));
    }
    async removeItem(key: string) {
        this.browserStorage.removeItem(key);
    }

}