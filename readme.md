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

### Packages

Texthill exists out of different packages that will help you to build and work with text search engines in the browser, dweb, server, ...

* @texthill/core is the core of texthill, this is all the basic classes that you need to get yourself started with texthill.
* @texthill/localstorage is the implementation of the store so that the indexes are been saved in the localstorage of the browser.
* @texthill/textile is the implementation of the store on top of textile ThreadsDB, getting an index of your collections (IPFS)