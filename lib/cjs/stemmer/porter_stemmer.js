"use strict";
/*
   Porter stemmer in Dart, original in Java. The original paper is in
       Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
       no. 3, pp 130-137,
   See also http://www.tartarus.org/~martin/PorterStemmer
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.PorterStemmer = void 0;
const stemmer_1 = require("./stemmer");
/**
  * Stemmer, implementing the Porter Stemming Algorithm
  *
  * The Stemmer class transforms a word into its root form.  The input
  * word can be provided a character at time (by calling add()), or at once
  * by calling one of the various stem(something) methods.
  */
class PorterStemmer extends stemmer_1.Stemmer {
    // static final int INC = 50;
    /* unit of size whereby b is increased */
    constructor() {
        super();
        this.b = [];
        this.i = 0;
        this.i_end = 0;
    }
    /**
     * reset() resets the stemmer so it can stem another word.  If you invoke
     * the stemmer by calling add(char) and then stem(), you must call reset()
     * before starting another word.
     */
    reset() { this.b = []; this.i = 0; }
    /**
     * Add a character to the word being stemmed.  When you are finished
     * adding characters, you can call stem(void) to stem the word.
     */
    add(ch) {
        if (this.i == this.b.length) {
            let new_b = [];
            for (let c = 0; c < this.i; c++)
                new_b.push(this.b[c]);
            this.b = new_b;
        }
        this.b.push(ch);
        this.i++;
    }
    /** Adds wLen characters to the word being stemmed contained in a portion
     * of a char[] array. This is like repeated calls of add(char ch), but
     * faster.
     */
    addWord(w) {
        const wLen = w.length;
        if (this.i + wLen >= this.b.length) {
            let new_b = [];
            for (let c = 0; c < this.i; c++)
                new_b[c] = this.b[c];
            this.b = new_b;
        }
        for (let c = 0; c < wLen; c++) {
            this.b.push(w[c]);
            this.i++;
        }
    }
    /**
     * After a word has been stemmed, it can be retrieved by toString(),
     * or a reference to the internal buffer can be retrieved by getResultBuffer
     * and getResultLength (which is generally more efficient.)
     */
    toString() {
        let s = "";
        this.b.forEach((value) => {
            s += value;
        });
        return s.substring(this.i, this.i_end);
    }
    /**
     * Returns the length of the word resulting from the stemming process.
     */
    getResultLength() { return this.i_end; }
    /**
     * Returns a reference to a character buffer containing the results of
     * the stemming process.  You also need to consult getResultLength()
     * to determine the length of the result.
     */
    getResultBuffer() { return this.b; }
    /* cons(i) is true <=> b[i] is a consonant. */
    cons(i) {
        switch (this.b[i]) {
            case 'a':
            case 'e':
            case 'i':
            case 'o':
            case 'u': return false;
            case 'y': return (i == 0) ? true : !this.cons(i - 1);
            default: return true;
        }
    }
    /* m() measures the number of consonant sequences between 0 and j. if c is
       a consonant sequence and v a vowel sequence, and <..> indicates arbitrary
       presence,
          <c><v>       gives 0
          <c>vc<v>     gives 1
          <c>vcvc<v>   gives 2
          <c>vcvcvc<v> gives 3
          ....
    */
    m() {
        let n = 0;
        let i = 0;
        while (true) {
            if (i > this.j)
                return n;
            if (!this.cons(i))
                break;
            i++;
        }
        i++;
        while (true) {
            while (true) {
                if (i > this.j)
                    return n;
                if (this.cons(i))
                    break;
                i++;
            }
            i++;
            n++;
            while (true) {
                if (i > this.j)
                    return n;
                if (!this.cons(i))
                    break;
                i++;
            }
            i++;
        }
    }
    /* vowelinstem() is true <=> 0,...j contains a vowel */
    vowelinstem() {
        let i;
        for (i = 0; i <= this.j; i++)
            if (!this.cons(i))
                return true;
        return false;
    }
    /* doublec(j) is true <=> j,(j-1) contain a double consonant. */
    doublec(j) {
        if (j < 1)
            return false;
        if (this.b[j] != this.b[j - 1])
            return false;
        return this.cons(j);
    }
    /* cvc(i) is true <=> i-2,i-1,i has the form consonant - vowel - consonant
       and also if the second c is not w,x or y. this is used when trying to
       restore an e at the end of a short word. e.g.
          cav(e), lov(e), hop(e), crim(e), but
          snow, box, tray.
    */
    cvc(i) {
        if (i < 2 || !this.cons(i) || this.cons(i - 1) || !this.cons(i - 2))
            return false;
        {
            var ch = this.b[i];
            if (ch == 'w' || ch == 'x' || ch == 'y')
                return false;
        }
        return true;
    }
    ends(s) {
        let l = s.length;
        let o = this.k - l + 1;
        if (o < 0)
            return false;
        for (let i = 0; i < l; i++)
            if (this.b[o + i] != s[i])
                return false;
        this.j = this.k - l;
        return true;
    }
    /* setto(s) sets (j+1),...k to the characters in the string s, readjusting
       k. */
    setto(s) {
        let l = s.length;
        let o = this.j + 1;
        for (let i = 0; i < l; i++) {
            this.b[o + i] = s[i];
        }
        this.k = this.j + l;
    }
    /* r(s) is used further down. */
    r(s) { if (this.m() > 0)
        this.setto(s); }
    /* step1() gets rid of plurals and -ed or -ing. e.g.
           caresses  ->  caress
           ponies    ->  poni
           ties      ->  ti
           caress    ->  caress
           cats      ->  cat
           feed      ->  feed
           agreed    ->  agree
           disabled  ->  disable
           matting   ->  mat
           mating    ->  mate
           meeting   ->  meet
           milling   ->  mill
           messing   ->  mess
           meetings  ->  meet
    */
    step1() {
        if (this.b[this.k] == 's') {
            if (this.ends("sses"))
                this.k -= 2;
            else if (this.ends("ies"))
                this.setto("i");
            else if (this.b[this.k - 1] != 's')
                this.k--;
        }
        if (this.ends("eed")) {
            if (this.m() > 0)
                this.k--;
        }
        else if ((this.ends("ed") || this.ends("ing")) && this.vowelinstem()) {
            this.k = this.j;
            if (this.ends("at"))
                this.setto("ate");
            else if (this.ends("bl"))
                this.setto("ble");
            else if (this.ends("iz"))
                this.setto("ize");
            else if (this.doublec(this.k)) {
                this.k--;
                {
                    var ch = this.b[this.k];
                    if (ch == 'l' || ch == 's' || ch == 'z')
                        this.k++;
                }
            }
            else if (this.m() == 1 && this.cvc(this.k))
                this.setto("e");
        }
    }
    /* step2() turns terminal y to i when there is another vowel in the stem. */
    step2() { if (this.ends("y") && this.vowelinstem())
        this.b[this.k] = 'i'; }
    /* step3() maps double suffices to single ones. so -ization ( = -ize plus
       -ation) maps to -ize etc. note that the string before the suffix must give
       m() > 0. */
    step3() {
        if (this.k == 0)
            return; /* For Bug 1 */
        switch (this.b[this.k - 1]) {
            case 'a':
                if (this.ends("ational")) {
                    this.r("ate");
                    break;
                }
                if (this.ends("tional")) {
                    this.r("tion");
                    break;
                }
                break;
            case 'c':
                if (this.ends("enci")) {
                    this.r("ence");
                    break;
                }
                if (this.ends("anci")) {
                    this.r("ance");
                    break;
                }
                break;
            case 'e':
                if (this.ends("izer")) {
                    this.r("ize");
                    break;
                }
                break;
            case 'l':
                if (this.ends("bli")) {
                    this.r("ble");
                    break;
                }
                if (this.ends("alli")) {
                    this.r("al");
                    break;
                }
                if (this.ends("entli")) {
                    this.r("ent");
                    break;
                }
                if (this.ends("eli")) {
                    this.r("e");
                    break;
                }
                if (this.ends("ousli")) {
                    this.r("ous");
                    break;
                }
                break;
            case 'o':
                if (this.ends("ization")) {
                    this.r("ize");
                    break;
                }
                if (this.ends("ation")) {
                    this.r("ate");
                    break;
                }
                if (this.ends("ator")) {
                    this.r("ate");
                    break;
                }
                break;
            case 's':
                if (this.ends("alism")) {
                    this.r("al");
                    break;
                }
                if (this.ends("iveness")) {
                    this.r("ive");
                    break;
                }
                if (this.ends("fulness")) {
                    this.r("ful");
                    break;
                }
                if (this.ends("ousness")) {
                    this.r("ous");
                    break;
                }
                break;
            case 't':
                if (this.ends("aliti")) {
                    this.r("al");
                    break;
                }
                if (this.ends("iviti")) {
                    this.r("ive");
                    break;
                }
                if (this.ends("biliti")) {
                    this.r("ble");
                    break;
                }
                break;
            case 'g': if (this.ends("logi")) {
                this.r("log");
                break;
            }
        }
    }
    /* step4() deals with -ic-, -full, -ness etc. similar strategy to step3. */
    step4() {
        switch (this.b[this.k]) {
            case 'e':
                if (this.ends("icate")) {
                    this.r("ic");
                    break;
                }
                if (this.ends("ative")) {
                    this.r("");
                    break;
                }
                if (this.ends("alize")) {
                    this.r("al");
                    break;
                }
                break;
            case 'i':
                if (this.ends("iciti")) {
                    this.r("ic");
                    break;
                }
                break;
            case 'l':
                if (this.ends("ical")) {
                    this.r("ic");
                    break;
                }
                if (this.ends("ful")) {
                    this.r("");
                    break;
                }
                break;
            case 's':
                if (this.ends("ness")) {
                    this.r("");
                    break;
                }
                break;
        }
    }
    /* step5() takes off -ant, -ence etc., in context <c>vcvc<v>. */
    step5() {
        if (this.k == 0)
            return; /* for Bug 1 */
        switch (this.b[this.k - 1]) {
            case 'a':
                if (this.ends("al"))
                    break;
                return;
            case 'c':
                if (this.ends("ance"))
                    break;
                if (this.ends("ence"))
                    break;
                return;
            case 'e':
                if (this.ends("er"))
                    break;
                return;
            case 'i':
                if (this.ends("ic"))
                    break;
                return;
            case 'l':
                if (this.ends("able"))
                    break;
                if (this.ends("ible"))
                    break;
                return;
            case 'n':
                if (this.ends("ant"))
                    break;
                if (this.ends("ement"))
                    break;
                if (this.ends("ment"))
                    break;
                /* element etc. not stripped before the m */
                if (this.ends("ent"))
                    break;
                return;
            case 'o':
                if (this.ends("ion") && this.j >= 0 && (this.b[this.j] == 's' || this.b[this.j] == 't'))
                    break;
                /* j >= 0 fixes Bug 2 */
                if (this.ends("ou"))
                    break;
                return;
            /* takes care of -ous */
            case 's':
                if (this.ends("ism"))
                    break;
                return;
            case 't':
                if (this.ends("ate"))
                    break;
                if (this.ends("iti"))
                    break;
                return;
            case 'u':
                if (this.ends("ous"))
                    break;
                return;
            case 'v':
                if (this.ends("ive"))
                    break;
                return;
            case 'z':
                if (this.ends("ize"))
                    break;
                return;
            default: return;
        }
        if (this.m() > 1)
            this.k = this.j;
    }
    /* step6() removes a final -e if m() > 1. */
    step6() {
        this.j = this.k;
        if (this.b[this.k] == 'e') {
            const a = this.m();
            if (a > 1 || a == 1 && !this.cvc(this.k - 1))
                this.k--;
        }
        if (this.b[this.k] == 'l' && this.doublec(this.k) && this.m() > 1)
            this.k--;
    }
    /** Stem the word placed into the Stemmer buffer through calls to add().
     * Returns true if the stemming process resulted in a word different
     * from the input.  You can retrieve the result with
     * getResultLength()/getResultBuffer() or toString().
     */
    stem() {
        this.k = this.i - 1;
        if (this.k > 1) {
            this.step1();
            this.step2();
            this.step3();
            this.step4();
            this.step5();
            this.step6();
        }
        this.i_end = this.k + 1;
        this.i = 0;
    }
}
exports.PorterStemmer = PorterStemmer;
