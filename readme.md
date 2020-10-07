## Bountyhunter

A search engine written in typescript, can be used in the browser, with node.js and deno.

Look at this example below to get you started.
```typescript
const bh = new BountyHunter(new MemoryStore());
const feed = async () => {
    await bh.feedDoc("hello world", "some hello world for feeding");

    const results = await bh.search("feeding"); 
}
```