export class Vector {
    constructor() {
        this.values = [];
    }
    add(value) {
        this.values.push(value);
    }
    length() {
        let returnLen = 0.0;
        for (const value of this.values) {
            returnLen += (value * value);
        }
        return Math.sqrt(returnLen);
    }
    normalize() {
        const norm = new Vector();
        let length = this.length();
        for (const value of this.values) {
            norm.add((value != 0.0) ? value / length : value);
        }
        return norm;
    }
    sum() {
        let returnSum = 0.0;
        for (const value of this.values) {
            returnSum += value;
        }
        return returnSum;
    }
    avg() {
        const sumValue = this.sum();
        return sumValue == 0.0 ? sumValue / this.values.length : sumValue;
    }
}
