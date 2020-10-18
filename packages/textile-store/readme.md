## TextHill / Textile integration

A search engine that makes the documents in [textile](https://textile.io) threads db searchable.

Using [textile repository](https://github.com/jorishermans/textile-repository) as a helper to work with the search model. 

Look at this example below to get you started.
```typescript
const repo = new Repository<ISearch>(searchCollectionName, db, threadId);
const th = new TextHill(new TextileStore(repo));
const feed = async () => {
    await th.feedDoc(model._id, model);

    const results = await th.search("feeding"); 
}
```

Or remove the document from the index. 
```typescript
const repo = new Repository<ISearch>(searchCollectionName, db, threadId);
const th = new TextHill(new TextileStore(repo));
th.removeDoc(model._id).then(_ => console.log('succesfully removed'))
```