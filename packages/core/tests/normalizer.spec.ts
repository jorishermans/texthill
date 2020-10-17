import { Normalizer } from '../src';

test('test normalizer', () => {
      let word = "Cool!";
      const normalizer = new Normalizer();
      
      word = normalizer.normalize(word);
      
      expect(word).toBe("cool");
});
test('test special chars', () => {
    let word = "Cool#";
    const normalizer = new Normalizer();
    
    word = normalizer.normalize(word);
    
    expect(word).toBe("cool");
});
test('test stemmer', () => {
    let word = "traditional";
    const normalizer = new Normalizer();
    
    word = normalizer.normalize(word);
    
    expect(word).toBe("tradit");
});