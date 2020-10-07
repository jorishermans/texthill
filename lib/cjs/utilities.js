"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersect = void 0;
function intersect(s1, s2) {
    return new Set([...s1].filter(x => s2.has(x)));
}
exports.intersect = intersect;
