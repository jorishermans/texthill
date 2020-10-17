export abstract class Store {

    abstract getItem(key: string, defaultValue?: any): Promise<any>;

    abstract setItem(key: string, data: any): Promise<void>;

    abstract removeItem(key: string): Promise<void>;

}