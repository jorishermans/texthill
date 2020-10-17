## TextHill

A search engine written in typescript, can be used in the browser, with node.js and deno.

Look at this example below to get you started.
```typescript
const th = new TextHill(new MemoryStore());
const feed = async () => {
    await th.feedDoc("hello world", "some hello world for feeding");

    const results = await th.search("feeding"); 
}
```

Or remove the document from the index. 
```typescript
const th = new TextHill(new MemoryStore());
th.removeDoc("hello world").then(_ => console.log('succesfully removed'))
```

Write your own store to store your indexes where you prefer, extend from this abstract class.
```typescript
export abstract class Store {

    abstract getItem(key: string, defaultValue?: any): Promise<any>;

    abstract setItem(key: string, data: any): Promise<void>;

    abstract removeItem(key: string): Promise<void>;

}

/// implement your own store
export class MyStore extends Store {
    ...
}
const th = new TextHill(new MyStore());
```

You can also write your own stemmer or use snowball (look at node-snowball)
```typescript
export abstract class Stemmer {
  
    abstract stem(ch: string): string;

}

const th = new TextHill(new MyStore(), new Normalizer(new MyStemmer()));
```