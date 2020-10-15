import { inspectText } from "../src/inspect-text";

test('should be possible to handle a string', () => {
      let word = "Cool!";
      word = inspectText(word);
      
      expect(word).toBe("Cool!");
});

test('should be possible to handle a simple object', () => {
    let word = {some: "Cool!"};
    const nword = inspectText(word);
    
    expect(nword).toBe("Cool!");
});

test('should be possible to handle a more extended object', () => {
    let word = {some: "Cool!", date: new Date(), count: 5, text: 'Help me out.'};
    const nword = inspectText(word);
    
    expect(nword).toBe("Cool! Help me out.");
});

test('should be possible to handle a more extended object', () => {
    let anotherObj = { cool: 'drive!', fix: 'any', some: 1 };
    let word = {some: "Cool!", date: new Date(), count: 5, text: 'Help me out.', a: anotherObj };
    const nword = inspectText(word);
    
    expect(nword).toBe("Cool! Help me out. drive! any");
});

test('should be possible to handle a more extended object with array', () => {
    let word = {some: "Cool!", date: new Date(), tags: ["search", "engine"], count: 5, text: 'Help me out.' };
    const nword = inspectText(word);
    
    expect(nword).toBe("Cool! search engine Help me out.");
});