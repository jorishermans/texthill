## TextHill localstorage

A search engine written in typescript, can be used in the browser, with node.js and deno.

Look at this example below to get you started.
```typescript
const bh = new BountyHunter(new LocalStorageStore());
const feed = async () => {
    await bh.feedDoc("hello world", "some hello world for feeding");

    const results = await bh.search("feeding"); 
}
```

Or remove the document from the index. 
```typescript
const bh = new BountyHunter(new LocalStorageStore());
bh.removeDoc("hello world").then(_ => console.log('succesfully removed'))
```