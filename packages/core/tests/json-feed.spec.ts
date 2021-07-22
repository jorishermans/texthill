import { MemoryStore, TextHill } from '../src';

// here the whole foo var is mocked deeply

test('perform a search and get a result back', async () => {
    const th = new TextHill(new MemoryStore());
    await th.feedDoc("hello world",  {title: "Walking with Lois", description: "Today I went for a walk together with my aunt and uncle for an evening walk with the dog Lois", date: new Date(1, 2, 3)});
    await th.feedDoc("feed me",  {title: "Feed me texthill", description: "Give me some luck.", date: new Date(1, 2, 3)});
   
    const results = await th.search("Lois");     
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("hello world");
});

// ""{\"title\":\"Walking with Lois\",\"description\":\"Today I went for a walk together with my aunt and uncle for an evening walk with the dog Lois.\",\"date\":\"2021-07-21T19:02:54.428Z\"}""
