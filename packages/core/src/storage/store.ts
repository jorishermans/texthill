export abstract class Store {

    abstract getItem<T>(key: string, defaultValue?: T): Promise<T>;

    abstract setItem<T>(key: string, data: T): Promise<void>;

    abstract removeItem(key: string): Promise<void>;

}