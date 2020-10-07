export abstract class IStore {

    abstract getItemSync(key: string, defaultValue?: any): any;
    
    abstract getItem(key: string, defaultValue?: any): Promise<any>;

    abstract setItem(key: string, data: any): Promise<void>;

    abstract removeItem(key: string): Promise<void>;

}